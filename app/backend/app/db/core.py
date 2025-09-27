import threading
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator

from sqlmodel import SQLModel, Session, create_engine, select

DATABASE_URL = "sqlite:///./data/polypore.db"
engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    """
    Create all database tables if they do not exist.
    """
    # Ensure models are imported so relationship string references resolve in mapper
    from ..models import item as _item  # noqa: F401
    from ..models import shoot as _shoot  # noqa: F401
    from ..models import loan as _loan  # noqa: F401

    SQLModel.metadata.create_all(engine)


@contextmanager
def get_session() -> Iterator[Session]:
    """
    Provide a SQLModel session context manager.

    :return Iterator[Session]: Active database session
    """
    with Session(engine) as session:
        yield session


class _AutoReturnTask:
    """Background loop to auto-return overdue loans."""

    def __init__(self, interval_seconds: int = 30) -> None:
        """
        Initialize the auto-return task.

        :param int interval_seconds: Interval in seconds
        """
        self.interval_seconds = interval_seconds
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None

    def _run(self) -> None:
        """
        Run the auto-return task.
        """
        from ..models.loan import Loan

        while not self._stop_event.is_set():
            try:
                now = datetime.now(timezone.utc)
                with get_session() as session:
                    overdue = session.exec(
                        select(Loan).where(Loan.end_date <= now)
                    ).all()
                    deleted = 0
                    for loan in overdue:
                        session.delete(loan)
                        deleted += 1
                    if deleted:
                        session.commit()
                        print(
                            f"✅ Auto-canceled {deleted} loan(s) at {now.isoformat()}"
                        )
            except Exception as exc:  # noqa: BLE001
                print(f"⚠️ Auto-cancel task error: {exc}")
            finally:
                time.sleep(self.interval_seconds)

    def start(self) -> None:
        """
        Start the background task.
        """
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        """
        Stop the background task.
        """
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=2)


auto_return_task = _AutoReturnTask(interval_seconds=20)
