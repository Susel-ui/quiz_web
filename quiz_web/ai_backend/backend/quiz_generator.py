from __future__ import annotations

"""Generate competency-tagged MCQs from learning material.

This module turns extracted learning content into a structured diagnostic
payload. It deliberately keeps taxonomy loading local so quiz generation can be
tested without importing the gap analyzer, and it includes an offline fallback
so hackathon demos do not fail when keys or network access are unavailable.
"""

import json
import os
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, validator

from .llm_client import get_llm_provider


_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class MCQ(BaseModel):
    question_id: int
    competency_type: Literal["Domain", "Functional", "Behavioral"]
    competency_domain: Literal[
        "Statistical", "Technical", "Digital Governance", "Behavioural & Managerial"
    ]
    competency_name: str
    bloom_level: Literal["Remember", "Understand", "Apply", "Analyze"]
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_option_index: int
    explanation: str

    @validator("options")
    def options_must_be_four_distinct(cls, value: List[str]) -> List[str]:
        if len(value) != 4:
            raise ValueError("options must contain exactly 4 entries")
        stripped = [option.strip() for option in value]
        if any(not option for option in stripped):
            raise ValueError("options must not contain empty strings")
        if len({option.casefold() for option in stripped}) != 4:
            raise ValueError("options must be distinct")
        return stripped

    @validator("correct_option_index")
    def correct_index_must_be_valid(cls, value: int) -> int:
        if value < 0 or value > 3:
            raise ValueError("correct_option_index must be between 0 and 3")
        return value


class AssessmentPayload(BaseModel):
    document_title: str
    summary: str
    questions: List[MCQ]
    is_fallback: bool = False
    fallback_reason: Optional[str] = None


def _load_taxonomy() -> dict:
    path = os.path.join(_DATA_DIR, "competency_taxonomy.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Competency taxonomy not found: {path}")
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def _domain_map() -> Dict[str, dict]:
    taxonomy = _load_taxonomy()
    domains = taxonomy.get("domains", [])
    return {domain["domain"]: domain for domain in domains}


def _allowed_competency_lines(domain_map: Dict[str, dict]) -> str:
    lines = []
    for domain_name, domain in domain_map.items():
        names = ", ".join(domain.get("competencies", []))
        lines.append(
            f"- For domain {domain_name}, choose only from: {names}. "
            f"The competency_type must be {domain.get('frac_pillar')}."
        )
    return "\n".join(lines)


def _build_system_prompt(domain_map: Dict[str, dict]) -> str:
    return (
        "You are an assessment designer for India's Official Statistical System. "
        "Generate objective MCQs that diagnose competency gaps from the supplied "
        "learning material. Every question must be answerable from the provided "
        "content, must have one correct option, and must include a concise "
        "explanation.\n\n"
        "Use only these exact competency names and matching domains:\n"
        f"{_allowed_competency_lines(domain_map)}\n\n"
        "Do not invent competency names. Prefer a balanced spread across the "
        "available domains when the document supports it. Use Bloom levels from "
        "Remember, Understand, Apply, and Analyze only."
    )


def _build_user_prompt(text: str, document_title: str, num_questions: int) -> str:
    return (
        f"Document title: {document_title}\n"
        f"Question count: {num_questions}\n\n"
        "Create the assessment payload now. The document text is below:\n\n"
        f"{text}"
    )


def _canonicalize_questions(payload: AssessmentPayload) -> AssessmentPayload:
    domains = _domain_map()
    for question in payload.questions:
        domain = domains.get(question.competency_domain)
        if not domain:
            continue

        allowed_names = domain.get("competencies", [])
        requested = question.competency_name.strip()
        exact_match = next(
            (name for name in allowed_names if name.casefold() == requested.casefold()),
            None,
        )
        if exact_match:
            question.competency_name = exact_match
            continue

        requested_cf = requested.casefold()
        substring_match = next(
            (
                name
                for name in allowed_names
                if requested_cf in name.casefold() or name.casefold() in requested_cf
            ),
            None,
        )
        if substring_match:
            question.competency_name = substring_match
    return payload


def _fallback_questions(document_title: str, reason: str, num_questions: int) -> AssessmentPayload:
    fallback_items = [
        {
            "question_id": 1,
            "competency_type": "Domain",
            "competency_domain": "Statistical",
            "competency_name": "Survey Design",
            "bloom_level": "Understand",
            "question": "Which step best ensures that a statistical survey collects data aligned with its policy objective?",
            "options": [
                "Defining the target population and survey objectives before designing questions",
                "Publishing raw responses before validation",
                "Selecting visualization colors before sampling",
                "Skipping metadata to reduce field workload"
            ],
            "correct_option_index": 0,
            "explanation": "A clear target population and objective guide the questionnaire, sampling approach, and quality plan."
        },
        {
            "question_id": 2,
            "competency_type": "Domain",
            "competency_domain": "Statistical",
            "competency_name": "Sampling",
            "bloom_level": "Apply",
            "question": "A district survey divides villages into strata by population size before drawing samples. What is the main benefit?",
            "options": [
                "It guarantees every selected unit gives the same response",
                "It improves representation of important subgroups in the sample",
                "It removes the need to calculate weights",
                "It makes non-response impossible"
            ],
            "correct_option_index": 1,
            "explanation": "Stratification helps ensure key subgroups are represented and can improve precision."
        },
        {
            "question_id": 3,
            "competency_type": "Functional",
            "competency_domain": "Technical",
            "competency_name": "Python",
            "bloom_level": "Apply",
            "question": "Why is Python useful in a statistical production workflow?",
            "options": [
                "It prevents all data quality issues automatically",
                "It can automate repeatable cleaning, analysis, and reporting tasks",
                "It replaces the need for survey methodology",
                "It stores confidential data without access controls"
            ],
            "correct_option_index": 1,
            "explanation": "Python is useful for repeatable scripts that clean, analyze, validate, and report data."
        },
        {
            "question_id": 4,
            "competency_type": "Functional",
            "competency_domain": "Technical",
            "competency_name": "Data Visualization",
            "bloom_level": "Analyze",
            "question": "Which visualization choice is best for comparing unemployment rates across states in one year?",
            "options": [
                "A time-series line chart with no state labels",
                "A ranked bar chart with state names and rate values",
                "A pie chart with every district as a slice",
                "A paragraph with no numeric table or graphic"
            ],
            "correct_option_index": 1,
            "explanation": "A ranked bar chart supports quick comparison across categories for a single period."
        },
        {
            "question_id": 5,
            "competency_type": "Functional",
            "competency_domain": "Digital Governance",
            "competency_name": "Data Privacy",
            "bloom_level": "Understand",
            "question": "What is the safest practice when publishing microdata from an official survey?",
            "options": [
                "Publish direct identifiers because the data is official",
                "Remove or protect identifiers and apply disclosure-control checks",
                "Share full raw files through personal email",
                "Avoid documenting privacy decisions"
            ],
            "correct_option_index": 1,
            "explanation": "Privacy protection requires identifiers and disclosure risks to be controlled before data release."
        },
        {
            "question_id": 6,
            "competency_type": "Functional",
            "competency_domain": "Digital Governance",
            "competency_name": "Cybersecurity",
            "bloom_level": "Remember",
            "question": "Which action is a basic cybersecurity practice for officials handling statistical data?",
            "options": [
                "Reuse one password across all systems",
                "Share login credentials with trusted colleagues",
                "Use strong authentication and report suspicious emails",
                "Disable software updates during field operations"
            ],
            "correct_option_index": 2,
            "explanation": "Strong authentication and phishing awareness reduce common security risks."
        },
        {
            "question_id": 7,
            "competency_type": "Behavioral",
            "competency_domain": "Behavioural & Managerial",
            "competency_name": "Ethics",
            "bloom_level": "Understand",
            "question": "Why is ethics central to official statistics?",
            "options": [
                "It allows selective reporting when results are inconvenient",
                "It supports impartiality, confidentiality, and public trust",
                "It removes the need for technical validation",
                "It lets analysts change results to match expectations"
            ],
            "correct_option_index": 1,
            "explanation": "Ethical practice protects confidentiality, impartiality, integrity, and trust in statistics."
        },
        {
            "question_id": 8,
            "competency_type": "Behavioral",
            "competency_domain": "Behavioural & Managerial",
            "competency_name": "Project Management",
            "bloom_level": "Apply",
            "question": "A survey field operation is falling behind schedule. Which project-management response is most appropriate?",
            "options": [
                "Wait until the final deadline before reviewing progress",
                "Remove quality checks to save time",
                "Review risks, update milestones, and reassign field resources where needed",
                "Stop communicating with stakeholders until data collection ends"
            ],
            "correct_option_index": 2,
            "explanation": "Active risk review, milestone adjustment, and resource planning help recover delivery while protecting quality."
        }
    ]
    selected = fallback_items[: max(1, min(num_questions, len(fallback_items)))]
    return AssessmentPayload(
        document_title=document_title,
        summary=(
            "Offline fallback assessment covering statistical, technical, digital "
            "governance, and behavioural competencies."
        ),
        questions=[MCQ(**item) for item in selected],
        is_fallback=True,
        fallback_reason=reason,
    )


def generate_mcqs(
    text: str,
    document_title: str,
    num_questions: int = 10,
    provider: str = "openai",
    model: Optional[str] = None,
    api_key: Optional[str] = None,
    use_fallback_on_error: bool = True,
) -> AssessmentPayload:
    if not text or len(text.strip()) < 50:
        raise ValueError("text must contain at least 50 characters for quiz generation")
    if num_questions <= 0:
        raise ValueError("num_questions must be greater than zero")

    try:
        domain_map = _domain_map()
        llm = get_llm_provider(name=provider, model=model, api_key=api_key)
        payload = llm.generate_structured(
            system_prompt=_build_system_prompt(domain_map),
            user_prompt=_build_user_prompt(text, document_title, num_questions),
            schema=AssessmentPayload,
            temperature=0.35,
            max_tokens=4096,
        )
        return _canonicalize_questions(payload)
    except Exception as exc:
        if use_fallback_on_error:
            return _fallback_questions(document_title, str(exc), num_questions)
        raise
