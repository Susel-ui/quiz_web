from __future__ import annotations

"""SQLModel tables for persisting diagnostics and demo progress.

The API is mostly stateless, but a hackathon dashboard needs durable learner
history, attempts, gaps, and enrolments. These small tables keep that state in
SQLite by default while remaining portable to a real database later.
"""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Learner(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    designation: str
    cadre: Optional[str] = None
    department: Optional[str] = None
    years_of_experience: Optional[float] = None
    education: Optional[str] = None
    # SQLite has no native array type; store json.dumps(list) here.
    previous_trainings_json: str = "[]"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Assessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    learner_id: int = Field(foreign_key="learner.id")  # Required: assessments must belong to a learner
    document_title: str
    summary: str
    # SQLite has no native array/object type; store json.dumps(list of MCQ dicts).
    questions_json: str
    is_fallback: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QuizAttempt(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_id: int = Field(foreign_key="assessment.id")
    learner_id: int = Field(foreign_key="learner.id")  # Required: attempts must have a learner
    # SQLite has no native object type; store json.dumps({question_id: selected_index}).
    user_answers_json: str
    overall_percentage: float
    submitted_at: datetime = Field(default_factory=datetime.utcnow)


class GapSnapshot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    learner_id: int = Field(foreign_key="learner.id", index=True)
    competency_name: str = Field(index=True)
    domain: str = Field(index=True)
    source: str
    quiz_percentage: Optional[float] = None
    expected_level: Optional[str] = None
    status: str
    # Written one row per competency every time /gap-analysis runs for a learner.
    # Admin/trend queries hit this table, so learner/domain/name/time stay indexed.
    computed_at: datetime = Field(default_factory=datetime.utcnow, index=True)


class Enrolment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    learner_id: int = Field(foreign_key="learner.id")
    course_id: str
    catalog_source: str
    status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)  # Track enrollment start
    updated_at: datetime = Field(default_factory=datetime.utcnow)
