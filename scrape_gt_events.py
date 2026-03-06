#!/usr/bin/env python3
"""
GT Campus Labs Event Scraper (Fast Edition — API-powered)
Hits the Campus Labs discovery JSON API directly — no browser needed.
Dates and times come from structured ISO fields, so they are never N/A.

Usage:
    pip install requests pandas
    python scrape_gt_events.py

Output:
    gt_events_output.csv  — ready to merge into your BuzzBoard template
"""

import requests
import pandas as pd
from datetime import datetime, timezone

# ── Config ────────────────────────────────────────────────────────────────────
SCHOOL      = "gatech"
PAGE_SIZE   = 100    # max per request (Campus Labs cap)
MAX_EVENTS  = 9999   # set lower to limit total; script stops when pages run out
OUTPUT_CSV  = "gt_events_output.csv"

API_URL = f"https://{SCHOOL}.campuslabs.com/engage/api/discovery/event/search"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; GTEventScraper/1.0)",
    "Accept": "application/json",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_iso(iso: str) -> tuple[str, str]:
    """
    Parse an ISO-8601 datetime string like '2026-03-29T10:00:00-04:00'
    into ('March 29 2026', '10:00 AM').
    Returns ('N/A', 'N/A') if the string is missing or unparseable.
    """
    if not iso:
        return "N/A", "N/A"
    try:
        # Python 3.7+ handles offset-aware ISO strings
        dt = datetime.fromisoformat(iso)
        date_str = dt.strftime("%B %d %Y").replace(" 0", " ")  # strip leading zero
        time_str = dt.strftime("%I:%M %p").lstrip("0")
        return date_str, time_str
    except ValueError:
        return iso, "N/A"


def fetch_page(skip: int) -> dict:
    params = {
        "endsAfter": datetime.now(timezone.utc).strftime("%Y-%m-%dT00:00:00Z"),
        "orderByField": "startsOn",
        "orderByDirection": "ascending",
        "status": "Approved",
        "take": PAGE_SIZE,
        "skip": skip,
    }
    resp = requests.get(API_URL, headers=HEADERS, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


def fetch_all_events() -> list[dict]:
    events = []
    skip = 0

    while len(events) < MAX_EVENTS:
        print(f"  Fetching events {skip + 1}–{skip + PAGE_SIZE}…")
        try:
            data = fetch_page(skip)
        except Exception as e:
            print(f"  API error: {e}")
            break

        items = data.get("value", [])
        if not items:
            print("  No more events.")
            break

        events.extend(items)
        skip += PAGE_SIZE

        # Campus Labs returns total count — stop early if we have everything
        total = data.get("@odata.count", None)
        if total is not None and skip >= total:
            break

    return events[:MAX_EVENTS]


def parse_event(item: dict) -> dict:
    starts_on = item.get("startsOn", "")
    ends_on   = item.get("endsOn", "")

    date_str,  start_time = parse_iso(starts_on)
    _,         end_time   = parse_iso(ends_on)

    # Description: strip HTML tags if present
    desc = item.get("description", "") or "N/A"
    if "<" in desc:
        import re
        desc = re.sub(r"<[^>]+>", " ", desc).strip()
        desc = re.sub(r"\s+", " ", desc)

    # Location: prefer address string, fall back to location name
    location = (
        item.get("address", {}) or {}
    )
    location_str = (
        location.get("name")
        or location.get("line1")
        or item.get("location", "")
        or "N/A"
    )

    # Organization
    org = item.get("organizationName") or "N/A"

    # Category / themes
    themes = item.get("themes", []) or []
    category = ", ".join(t.get("name", "") for t in themes if t.get("name")) or "N/A"

    return {
        "Title":        item.get("name", "N/A"),
        "Description":  desc,
        "Date":         date_str,
        "Start_time":   start_time,
        "End_time":     end_time,
        "Location":     location_str,
        "Organization": org,
        "Category":     category,
        "url": f"https://{SCHOOL}.campuslabs.com/engage/event/{item.get('id', '')}",
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("GT Campus Labs Event Scraper — API Edition")
    print(f"Source: {API_URL}")
    print("=" * 60)

    print("\nFetching events from Campus Labs API…")
    raw_events = fetch_all_events()
    print(f"  → {len(raw_events)} events fetched\n")

    if not raw_events:
        print("No events returned. The API may require authentication or the URL changed.")
        print(f"Try opening this in your browser to check:\n  {API_URL}?take=5&status=Approved")
        return

    parsed = [parse_event(e) for e in raw_events]

    df = pd.DataFrame(parsed)
    df.insert(0, "Id", range(300000, 300000 + len(df)))
    df["Submission_source"] = "N/A"
    df["Approved (bool)"]   = "TRUE"
    df["Created_at"]        = datetime.today().strftime("%B %d %Y")

    cols = ["Id", "Title", "Description", "Date", "Start_time", "End_time",
            "Location", "Organization", "Category",
            "Submission_source", "Approved (bool)", "Created_at"]
    df = df[[c for c in cols if c in df.columns]]
    df.to_csv(OUTPUT_CSV, index=False)

    print(f"✓ {len(df)} events saved to '{OUTPUT_CSV}'")
    print(df[["Title", "Date", "Start_time", "End_time", "Organization"]].head(10).to_string(index=False))


if __name__ == "__main__":
    main()

