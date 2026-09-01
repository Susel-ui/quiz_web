from __future__ import annotations

"""Combine quiz evidence with role expectations into explainable gaps.

Short diagnostic quizzes are useful but statistically thin at the individual
competency level. This module therefore treats domain-level quiz scores as the
headline signal while still preserving competency drill-down rows for targeted
recommendations and admin trend analysis.
"""

from dataclasses import dataclass
import json
import os
from typing import Dict, List, Optional

from .profile_analyzer import ExpectedCompetency


CRITICAL_THRESHOLD = 70.0
DEVELOPING_THRESHOLD = 85.0
_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


@dataclass
class QuestionResult:
    question_id: int
    competency_domain: str
    competency_name: str
    is_correct: bool
    selected_index: Optional[int]
    correct_index: int
    question: str
    explanation: str


@dataclass
class CompetencyGap:
    competency_name: str
    domain: str
    source: str
    quiz_percentage: Optional[float] = None
    quiz_questions: int = 0
    expected_level: Optional[str] = None
    already_trained: bool = False
    status: str = "Not Yet Assessed"


@dataclass
class DomainScore:
    domain: str
    percentage: float
    total_questions: int
    correct_questions: int
    status: str


@dataclass
class CompositeGapResult:
    overall_percentage: float
    total_questions: int
    total_correct: int
    domain_scores: List[DomainScore]
    competency_gaps: List[CompetencyGap]
    critical_gaps: List[CompetencyGap]
    question_results: List[QuestionResult]


def load_taxonomy() -> dict:
    path = os.path.join(_DATA_DIR, "competency_taxonomy.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Competency taxonomy not found: {path}")
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def taxonomy_lookup() -> Dict[str, dict]:
    lookup: Dict[str, dict] = {}
    for domain in load_taxonomy().get("domains", []):
        for competency_name in domain.get("competencies", []):
            lookup[competency_name.lower()] = {
                "domain": domain.get("domain"),
                "frac_pillar": domain.get("frac_pillar"),
                "canonical_name": competency_name,
            }
    return lookup


def _get_field(item, field_name: str, default=None):
    if isinstance(item, dict):
        return item.get(field_name, default)
    return getattr(item, field_name, default)


def _status_from_percentage(percentage: float) -> str:
    if percentage < CRITICAL_THRESHOLD:
        return "Critical Gap"
    if percentage < DEVELOPING_THRESHOLD:
        return "Developing"
    return "Proficient"


def _normalised_answers(user_answers: Dict[int, int]) -> Dict[int, int]:
    normalised: Dict[int, int] = {}
    for key, value in user_answers.items():
        try:
            normalised[int(key)] = int(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"Invalid answer key/value pair: {key}={value}") from exc
    return normalised


def _canonical_competency(name: str, domain: Optional[str] = None) -> tuple[str, str]:
    lookup = taxonomy_lookup()
    candidate = lookup.get((name or "").lower())
    if candidate:
        return candidate["canonical_name"], candidate["domain"]
    return name, domain or "Unknown"


def score_assessment(mcqs: List[dict], user_answers: Dict[int, int]) -> List[QuestionResult]:
    answers = _normalised_answers(user_answers)
    results: List[QuestionResult] = []

    for mcq in mcqs:
        question_id = int(_get_field(mcq, "question_id"))
        selected_index = answers.get(question_id)
        correct_index = int(_get_field(mcq, "correct_option_index"))
        if selected_index is not None and (selected_index < 0 or selected_index > 3):
            raise ValueError(f"Answer for question_id {question_id} must be between 0 and 3")

        raw_domain = _get_field(mcq, "competency_domain", "Unknown")
        raw_competency = _get_field(mcq, "competency_name", "Unknown")
        competency_name, domain = _canonical_competency(raw_competency, raw_domain)

        results.append(
            QuestionResult(
                question_id=question_id,
                competency_domain=domain,
                competency_name=competency_name,
                is_correct=selected_index == correct_index,
                selected_index=selected_index,
                correct_index=correct_index,
                question=_get_field(mcq, "question", ""),
                explanation=_get_field(mcq, "explanation", ""),
            )
        )
    return results


def compute_domain_scores(results: List[QuestionResult]) -> List[DomainScore]:
    grouped: Dict[str, List[QuestionResult]] = {}
    for result in results:
        grouped.setdefault(result.competency_domain, []).append(result)

    domain_order = [
        domain.get("domain") for domain in load_taxonomy().get("domains", [])
    ]
    sorted_domains = sorted(
        grouped.keys(),
        key=lambda domain: domain_order.index(domain) if domain in domain_order else 999,
    )

    scores: List[DomainScore] = []
    for domain in sorted_domains:
        domain_results = grouped[domain]
        total = len(domain_results)
        correct = sum(1 for result in domain_results if result.is_correct)
        percentage = round((correct / total) * 100, 2) if total else 0.0
        scores.append(
            DomainScore(
                domain=domain,
                percentage=percentage,
                total_questions=total,
                correct_questions=correct,
                status=_status_from_percentage(percentage),
            )
        )
    return scores


def _expected_as_dict(expected: ExpectedCompetency) -> dict:
    if isinstance(expected, dict):
        return expected
    if hasattr(expected, "model_dump"):
        return expected.model_dump()
    if hasattr(expected, "dict"):
        return expected.dict()
    return {
        "competency_name": expected.competency_name,
        "expected_level": expected.expected_level,
        "already_trained": expected.already_trained,
    }


def compute_composite_gaps(
    quiz_results: List[QuestionResult],
    expected_competencies: Optional[List[ExpectedCompetency]] = None,
) -> List[CompetencyGap]:
    grouped: Dict[str, List[QuestionResult]] = {}
    for result in quiz_results:
        grouped.setdefault(result.competency_name.lower(), []).append(result)

    gaps_by_key: Dict[str, CompetencyGap] = {}
    for key, results in grouped.items():
        total = len(results)
        correct = sum(1 for result in results if result.is_correct)
        percentage = round((correct / total) * 100, 2) if total else 0.0
        competency_name = results[0].competency_name
        gaps_by_key[key] = CompetencyGap(
            competency_name=competency_name,
            domain=results[0].competency_domain,
            source="quiz",
            quiz_percentage=percentage,
            quiz_questions=total,
            status=_status_from_percentage(percentage),
        )

    if expected_competencies:
        for expected in expected_competencies:
            expected_data = _expected_as_dict(expected)
            name = expected_data.get("competency_name")
            if not name:
                continue
            canonical_name, domain = _canonical_competency(name)
            key = canonical_name.lower()
            if key in gaps_by_key:
                gaps_by_key[key].source = "both"
                gaps_by_key[key].expected_level = expected_data.get("expected_level")
                gaps_by_key[key].already_trained = bool(expected_data.get("already_trained", False))
            else:
                already_trained = bool(expected_data.get("already_trained", False))
                gaps_by_key[key] = CompetencyGap(
                    competency_name=canonical_name,
                    domain=domain,
                    source="role_expectation",
                    expected_level=expected_data.get("expected_level"),
                    already_trained=already_trained,
                    status=(
                        "Reported Trained (Unverified)"
                        if already_trained
                        else "Not Yet Assessed"
                    ),
                )

    return list(gaps_by_key.values())


def identify_gaps_for_recommendation(gaps: List[CompetencyGap]) -> List[CompetencyGap]:
    critical = [
        gap
        for gap in gaps
        if gap.status == "Critical Gap" and gap.source in {"quiz", "both"}
    ]
    critical.sort(key=lambda gap: (gap.quiz_percentage if gap.quiz_percentage is not None else 100.0))

    level_priority = {"Advanced": 0, "Intermediate": 1, "Beginner": 2}
    proactive = [
        gap
        for gap in gaps
        if gap.status == "Not Yet Assessed"
        and gap.expected_level in {"Intermediate", "Advanced"}
    ]
    proactive.sort(key=lambda gap: (level_priority.get(gap.expected_level or "", 99), gap.competency_name))

    seen = set()
    ordered: List[CompetencyGap] = []
    for gap in [*critical, *proactive]:
        key = gap.competency_name.lower()
        if key not in seen:
            ordered.append(gap)
            seen.add(key)
    return ordered


def run_full_analysis(
    mcqs: List[dict],
    user_answers: Dict[int, int],
    expected_competencies: Optional[List[ExpectedCompetency]] = None,
) -> CompositeGapResult:
    question_results = score_assessment(mcqs, user_answers)
    total_questions = len(question_results)
    total_correct = sum(1 for result in question_results if result.is_correct)
    overall_percentage = (
        round((total_correct / total_questions) * 100, 2) if total_questions else 0.0
    )
    domain_scores = compute_domain_scores(question_results)
    competency_gaps = compute_composite_gaps(question_results, expected_competencies)
    critical_gaps = [
        gap
        for gap in competency_gaps
        if gap.status == "Critical Gap" and gap.source in {"quiz", "both"}
    ]
    return CompositeGapResult(
        overall_percentage=overall_percentage,
        total_questions=total_questions,
        total_correct=total_correct,
        domain_scores=domain_scores,
        competency_gaps=competency_gaps,
        critical_gaps=critical_gaps,
        question_results=question_results,
    )
