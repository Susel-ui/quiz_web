from __future__ import annotations

"""Mock iGOT/NSSTA API adapter for local demos.

Real iGOT Karmayogi integration is not publicly available for this prototype,
so this module exposes the catalog shape the rest of the app expects while
keeping the word "mock" loud and visible in the codebase.
"""

import copy
import json
import os
from typing import Dict, List


_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
_CLIENT = None


class MockIgotClient:
    def __init__(self):
        self._enrolments: Dict[str, Dict[str, str]] = {}

    def _load_json(self, filename: str):
        path = os.path.join(_DATA_DIR, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Catalog file not found: {path}")
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)

    def get_igot_courses(self) -> List[dict]:
        return copy.deepcopy(self._load_json("igot_courses.json"))

    def get_nssta_programmes(self) -> List[dict]:
        return copy.deepcopy(self._load_json("nssta_tpac_programmes.json"))

    def enroll_learner(self, learner_id: str, course_id: str) -> dict:
        self._enrolments.setdefault(str(learner_id), {})[course_id] = "enrolled"
        return {"learner_id": learner_id, "course_id": course_id, "status": "enrolled"}

    def mark_completed(self, learner_id: str, course_id: str) -> dict:
        self._enrolments.setdefault(str(learner_id), {})[course_id] = "completed"
        return {"learner_id": learner_id, "course_id": course_id, "status": "completed"}

    def get_learner_progress(self, learner_id: str) -> dict:
        return {
            "learner_id": learner_id,
            "enrolments": copy.deepcopy(self._enrolments.get(str(learner_id), {})),
        }


def get_mock_client() -> MockIgotClient:
    global _CLIENT
    if _CLIENT is None:
        _CLIENT = MockIgotClient()
    return _CLIENT
