from __future__ import annotations

"""Database engine and FastAPI session dependency.

Keeping engine creation here gives the API one place to switch from the local
SQLite demo database to a production URL without changing endpoint code.
"""

import os

from sqlmodel import Session, SQLModel, create_engine


DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./igot_diagnostic.db")
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
