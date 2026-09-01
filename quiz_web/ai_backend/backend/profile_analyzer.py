from __future__ import annotations

"""Deterministic profile-to-role mapping for expected competencies.

The hackathon needs repeatable diagnostics: the same official profile should
always produce the same role expectations before any LLM quiz signal is added.
This module keeps that role lookup simple, explainable, and independent from
the assessment/recommendation pipeline.
"""

import json
import os
from typing import List, Optional

from pydantic import BaseModel, Field


_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class LearnerProfile(BaseModel):
    name: str
    designation: str
    cadre: Optional[str] = None
    department: Optional[str] = None
    years_of_experience: Optional[float] = None
    education: Optional[str] = None
    previous_trainings: List[str] = Field(default_factory=list)


class ExpectedCompetency(BaseModel):
    competency_name: str
    expected_level: str
    already_trained: bool = False


def load_role_matrix() -> dict:
    path = os.path.join(_DATA_DIR, "role_competency_matrix.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Role competency matrix not found: {path}")
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def _normalise(value: Optional[str]) -> str:
    return (value or "").strip().lower()


def _role_score(profile: LearnerProfile, role: dict) -> int:
    score = 0
    designation = _normalise(profile.designation)
    role_designation = _normalise(role.get("designation"))
    cadre = _normalise(profile.cadre)
    role_cadre = _normalise(role.get("cadre"))
    role_id = _normalise(role.get("role_id"))

    if role_designation and role_designation in designation:
        score += 5
    if designation and designation in role_designation:
        score += 4
    if role_cadre and role_cadre == cadre:
        score += 3
    if role_cadre and role_cadre in designation:
        score += 2
    for token in role_id.replace("-", " ").split():
        if token and token in designation:
            score += 1
    return score


def _matched_role(profile: LearnerProfile) -> dict:
    matrix = load_role_matrix()
    roles = matrix.get("roles", [])
    if not roles:
        raise ValueError("Role competency matrix contains no roles")

    best_role = max(roles, key=lambda role: _role_score(profile, role))
    if _role_score(profile, best_role) > 0:
        return best_role

    default_role_id = matrix.get("default_role_id")
    for role in roles:
        if role.get("role_id") == default_role_id:
            return role
    return roles[0]


def _was_trained(competency_name: str, previous_trainings: List[str]) -> bool:
    needle = competency_name.lower()
    return any(needle in training.lower() for training in previous_trainings)


def infer_expected_competencies(profile: LearnerProfile) -> List[ExpectedCompetency]:
    role = _matched_role(profile)
    expected_levels = role.get("expected_levels", {})
    return [
        ExpectedCompetency(
            competency_name=competency_name,
            expected_level=expected_level,
            already_trained=_was_trained(competency_name, profile.previous_trainings),
        )
        for competency_name, expected_level in expected_levels.items()
    ]


def get_matched_role_label(profile: LearnerProfile) -> str:
    role = _matched_role(profile)
    designation = role.get("designation") or role.get("role_id") or "Unknown role"
    cadre = role.get("cadre")
    return f"{designation} ({cadre})" if cadre else designation
