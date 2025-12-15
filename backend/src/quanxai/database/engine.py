"""Database engine and session management."""
from sqlmodel import SQLModel, create_engine, Session
from typing import Generator

from quanxai.config import settings

# SQLite requires check_same_thread=False for FastAPI
connect_args = {"check_same_thread": False}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args, echo=settings.DEBUG)


def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependency that provides a database session."""
    with Session(engine) as session:
        yield session
