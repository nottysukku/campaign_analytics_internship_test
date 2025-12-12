from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import Iterable, List

from typing_extensions import TypedDict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

DB_PATH = Path(__file__).parent / "campaigns.db"

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    clicks INTEGER NOT NULL,
    cost REAL NOT NULL,
    impressions INTEGER NOT NULL
);
"""

SAMPLE_CAMPAIGNS: List[tuple[int, str, str, int, float, int]] = [
    (1, "Summer Sale", "Active", 150, 45.99, 1000),
    (2, "Black Friday", "Paused", 320, 89.50, 2500),
    (3, "Spring Launch", "Active", 210, 54.10, 1800),
    (4, "Holiday Blitz", "Active", 540, 132.75, 5000),
    (5, "Clearance", "Paused", 95, 21.40, 900),
    (6, "New Arrivals", "Active", 410, 101.20, 3600),
    (7, "Referral Push", "Active", 88, 19.99, 700),
    (8, "Back to School", "Paused", 275, 73.25, 2400),
    (9, "VIP Upsell", "Active", 160, 62.35, 1200),
    (10, "Reactivation", "Paused", 130, 28.65, 1100),
]


class CampaignRow(TypedDict):
    id: int
    name: str
    status: str
    clicks: int
    cost: float
    impressions: int


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def seed_if_empty(conn: sqlite3.Connection) -> None:
    cursor = conn.execute("SELECT COUNT(*) AS total FROM campaigns;")
    total = cursor.fetchone()["total"]
    if total:
        return
    conn.executemany(
        "INSERT INTO campaigns (id, name, status, clicks, cost, impressions) VALUES (?, ?, ?, ?, ?, ?);",
        SAMPLE_CAMPAIGNS,
    )
    conn.commit()


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as conn:
        conn.execute(CREATE_TABLE_SQL)
        seed_if_empty(conn)


app = FastAPI(title="Campaign Analytics Mock API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    init_db()


@app.get("/campaigns")
async def list_campaigns(status: str | None = None) -> List[CampaignRow]:
    init_db()  # Ensure DB exists even if startup not awaited (e.g., tests).
    query = "SELECT id, name, status, clicks, cost, impressions FROM campaigns"
    params: Iterable[str] = []

    if status:
        normalized = status.capitalize()
        if normalized not in {"Active", "Paused"}:
            raise HTTPException(status_code=400, detail="status must be Active or Paused")
        query += " WHERE status = ?"
        params = [normalized]

    query += " ORDER BY id;"

    with get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        campaigns: List[CampaignRow] = [
            {
                "id": row["id"],
                "name": row["name"],
                "status": row["status"],
                "clicks": row["clicks"],
                "cost": float(row["cost"]),
                "impressions": row["impressions"],
            }
            for row in rows
        ]
    return campaigns


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "ok", "message": "Campaign Analytics Mock API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
