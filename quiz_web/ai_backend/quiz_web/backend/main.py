from __future__ import annotations

"""FastAPI wiring for the competency diagnostic backend.

The endpoint layer stays intentionally thin: it accepts full request payloads,
delegates AI/scoring/recommendation work to focused modules, and persists only
the learner history needed for progress and admin dashboards.
"""

from collections import Counter, defaultdict
from dataclasses import asdict
from datetime import datetime
import json
from typing import Any, Dict, List, Literal, Optional

from fastapi import Body, Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from .db import create_db_and_tables, get_session
from .db_models import Assessment, Enrolment, GapSnapshot, Learner, QuizAttempt
from .gap_analyzer import CompetencyGap, load_taxonomy, run_full_analysis
from .mock_igot_api import get_mock_client
from .parser import extract_text, truncate_for_llm
from .profile_analyzer import (
    LearnerProfile,
    get_matched_role_label,
    infer_expected_competencies,
    load_role_matrix,
)
from .quiz_generator import AssessmentPayload, generate_mcqs
from .recommender import get_embedding_provider, match_semantic


app = FastAPI(title="AI Competency Diagnostic Backend", version="0.1.0")

# Dev/demo CORS setting; restrict origins before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateQuizRequest(BaseModel):
    document_title: str
    text: str
    num_questions: int = Field(default=10, ge=1)
    provider: str = "openai"
    model: Optional[str] = None


class GapAnalysisRequest(BaseModel):
    questions: List[dict]
    user_answers: Dict[int, int]
    learner_id: Optional[int] = None
    profile: Optional[LearnerProfile] = None
    document_title: str = "Diagnostic Assessment"
    summary: str = "Assessment submitted through /gap-analysis."
    is_fallback: bool = False


class RecommendationsRequest(BaseModel):
    gaps: List[dict]
    top_n_per_gap: int = Field(default=2, ge=1)
    embedding_provider: Optional[str] = None


class EnrollRequest(BaseModel):
    learner_id: int
    course_id: str
    catalog_source: Literal["igot", "nssta_tpac"]


def _model_to_dict(model: BaseModel) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


def _profile_from_payload(payload: dict) -> LearnerProfile:
    try:
        if hasattr(LearnerProfile, "model_validate"):
            return LearnerProfile.model_validate(payload)
        return LearnerProfile.parse_obj(payload)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Invalid learner profile: {exc}") from exc


def _safe_json_list(value: str) -> List[str]:
    try:
        parsed = json.loads(value or "[]")
    except json.JSONDecodeError:
        return []
    return parsed if isinstance(parsed, list) else []


def _learner_to_profile(learner: Learner) -> LearnerProfile:
    return LearnerProfile(
        name=learner.name,
        designation=learner.designation,
        cadre=learner.cadre,
        department=learner.department,
        years_of_experience=learner.years_of_experience,
        education=learner.education,
        previous_trainings=_safe_json_list(learner.previous_trainings_json),
    )


def _get_learner_or_404(learner_id: int, session: Session) -> Learner:
    learner = session.get(Learner, learner_id)
    if learner is None:
        raise HTTPException(status_code=404, detail=f"Learner {learner_id} not found")
    return learner


def _upsert_learner(profile: LearnerProfile, session: Session) -> Learner:
    # Upsert by exact name + designation to avoid duplicate rows during demos
    # when the same official repeats the diagnostic flow.
    statement = select(Learner).where(
        Learner.name == profile.name,
        Learner.designation == profile.designation,
    )
    learner = session.exec(statement).first()
    if learner is None:
        learner = Learner(
            name=profile.name,
            designation=profile.designation,
            created_at=datetime.utcnow(),
        )

    learner.cadre = profile.cadre
    learner.department = profile.department
    learner.years_of_experience = profile.years_of_experience
    learner.education = profile.education
    learner.previous_trainings_json = json.dumps(profile.previous_trainings)

    session.add(learner)
    session.commit()
    session.refresh(learner)
    return learner


def _resolve_profile_and_learner_id(
    learner_id: Optional[int],
    profile: Optional[LearnerProfile],
    session: Session,
) -> tuple[Optional[int], Optional[LearnerProfile]]:
    if learner_id is not None:
        learner = _get_learner_or_404(learner_id, session)
        return learner.id, profile or _learner_to_profile(learner)
    if profile is not None:
        learner = _upsert_learner(profile, session)
        return learner.id, profile
    return None, None


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/taxonomy")
def taxonomy() -> dict:
    return load_taxonomy()


@app.get("/roles")
def roles() -> dict:
    return load_role_matrix()


@app.get("/catalog/igot")
def catalog_igot() -> List[dict]:
    return get_mock_client().get_igot_courses()


@app.get("/catalog/nssta")
def catalog_nssta() -> List[dict]:
    return get_mock_client().get_nssta_programmes()


@app.post("/extract")
async def extract(file: UploadFile = File(...)) -> dict:
    extraction = extract_text(file.file, file.filename)
    if extraction.is_empty:
        raise HTTPException(status_code=422, detail="Uploaded file had no extractable text")
    return {
        "filename": extraction.filename,
        "file_type": extraction.file_type,
        "char_count": extraction.char_count,
        "unit_count": extraction.unit_count,
        "warnings": extraction.warnings,
        "text": truncate_for_llm(extraction.text),
    }


@app.post("/generate-quiz", response_model=AssessmentPayload)
def generate_quiz(request: GenerateQuizRequest) -> AssessmentPayload:
    return generate_mcqs(
        text=request.text,
        document_title=request.document_title,
        num_questions=request.num_questions,
        provider=request.provider,
        model=request.model,
    )


@app.post("/learners")
def create_or_update_learner(
    profile: LearnerProfile, session: Session = Depends(get_session)
) -> dict:
    learner = _upsert_learner(profile, session)
    return {"learner_id": learner.id}


@app.post("/profile/expected-competencies")
def expected_competencies(
    payload: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session),
) -> dict:
    if "learner_id" in payload:
        learner = _get_learner_or_404(int(payload["learner_id"]), session)
        profile = _learner_to_profile(learner)
    elif "profile" in payload:
        profile = _profile_from_payload(payload["profile"])
    else:
        profile = _profile_from_payload(payload)

    expected = infer_expected_competencies(profile)
    return {
        "matched_role": get_matched_role_label(profile),
        "expected_competencies": [_model_to_dict(item) for item in expected],
    }


@app.post("/gap-analysis")
def gap_analysis(
    request: GapAnalysisRequest,
    session: Session = Depends(get_session),
) -> dict:
    resolved_learner_id, profile = _resolve_profile_and_learner_id(
        request.learner_id,
        request.profile,
        session,
    )
    expected = infer_expected_competencies(profile) if profile is not None else None
    result = run_full_analysis(request.questions, request.user_answers, expected)

    if resolved_learner_id is not None:
        assessment = Assessment(
            learner_id=resolved_learner_id,
            document_title=request.document_title,
            summary=request.summary,
            questions_json=json.dumps(request.questions),
            is_fallback=request.is_fallback,
        )
        session.add(assessment)
        session.commit()
        session.refresh(assessment)

        attempt = QuizAttempt(
            assessment_id=assessment.id,
            learner_id=resolved_learner_id,
            user_answers_json=json.dumps(request.user_answers),
            overall_percentage=result.overall_percentage,
        )
        session.add(attempt)

        for gap in result.competency_gaps:
            session.add(
                GapSnapshot(
                    learner_id=resolved_learner_id,
                    competency_name=gap.competency_name,
                    domain=gap.domain,
                    source=gap.source,
                    quiz_percentage=gap.quiz_percentage,
                    expected_level=gap.expected_level,
                    status=gap.status,
                )
            )
        session.commit()

    return jsonable_encoder(asdict(result))


@app.get("/learners/{learner_id}/history")
def learner_history(learner_id: int, session: Session = Depends(get_session)) -> List[dict]:
    _get_learner_or_404(learner_id, session)
    statement = (
        select(GapSnapshot)
        .where(GapSnapshot.learner_id == learner_id)
        .order_by(GapSnapshot.computed_at)
    )
    rows = session.exec(statement).all()
    return jsonable_encoder(rows)


@app.post("/recommendations")
def recommendations(request: RecommendationsRequest) -> Dict[str, List[dict]]:
    gaps = [CompetencyGap(**gap) for gap in request.gaps]
    provider = (
        get_embedding_provider(request.embedding_provider)
        if request.embedding_provider
        else None
    )
    return match_semantic(
        gaps,
        provider=provider,
        top_n_per_gap=request.top_n_per_gap,
    )


@app.post("/mock/enroll")
def enroll(
    request: EnrollRequest,
    session: Session = Depends(get_session),
) -> dict:
    _get_learner_or_404(request.learner_id, session)
    # Catalog GETs still come from MockIgotClient, but enrolment state now lives
    # in the DB so learner progress survives across API requests and restarts.
    statement = select(Enrolment).where(
        Enrolment.learner_id == request.learner_id,
        Enrolment.course_id == request.course_id,
        Enrolment.catalog_source == request.catalog_source,
    )
    enrolment = session.exec(statement).first()
    if enrolment is None:
        enrolment = Enrolment(
            learner_id=request.learner_id,
            course_id=request.course_id,
            catalog_source=request.catalog_source,
            status="enrolled",
        )
    else:
        enrolment.status = "enrolled"
        enrolment.updated_at = datetime.utcnow()
    session.add(enrolment)
    session.commit()
    session.refresh(enrolment)
    return jsonable_encoder(enrolment)


@app.get("/admin/overview")
def admin_overview(session: Session = Depends(get_session)) -> dict:
    rows = session.exec(select(GapSnapshot).order_by(GapSnapshot.computed_at)).all()
    latest_by_learner_competency: Dict[tuple[int, str], GapSnapshot] = {}
    for row in rows:
        key = (row.learner_id, row.competency_name.lower())
        current = latest_by_learner_competency.get(key)
        if current is None or row.computed_at > current.computed_at:
            latest_by_learner_competency[key] = row

    latest_rows = list(latest_by_learner_competency.values())
    learner_ids = {row.learner_id for row in latest_rows}
    critical_rows = [row for row in latest_rows if row.status == "Critical Gap"]

    competency_counts = Counter(row.competency_name for row in critical_rows)
    domain_learners = defaultdict(set)
    for row in critical_rows:
        domain_learners[row.domain].add(row.learner_id)

    most_common = None
    if competency_counts:
        name, count = competency_counts.most_common(1)[0]
        most_common = {"competency_name": name, "learner_count": count}

    return {
        "total_learners_assessed": len(learner_ids),
        "critical_gap_by_competency": dict(competency_counts),
        "critical_gap_by_domain": {
            domain: len(ids) for domain, ids in domain_learners.items()
        },
        "most_common_critical_gap_competency": most_common,
    }
