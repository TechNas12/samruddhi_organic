from typing import List, Dict

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import IndianState, IndianCity


INDIAN_STATES: List[Dict[str, str]] = [
    {"code": "AN", "name": "Andaman and Nicobar Islands", "type": "ut"},
    {"code": "AP", "name": "Andhra Pradesh", "type": "state"},
    {"code": "AR", "name": "Arunachal Pradesh", "type": "state"},
    {"code": "AS", "name": "Assam", "type": "state"},
    {"code": "BR", "name": "Bihar", "type": "state"},
    {"code": "CH", "name": "Chandigarh", "type": "ut"},
    {"code": "CG", "name": "Chhattisgarh", "type": "state"},
    {"code": "DN", "name": "Dadra and Nagar Haveli and Daman and Diu", "type": "ut"},
    {"code": "DL", "name": "Delhi", "type": "ut"},
    {"code": "GA", "name": "Goa", "type": "state"},
    {"code": "GJ", "name": "Gujarat", "type": "state"},
    {"code": "HR", "name": "Haryana", "type": "state"},
    {"code": "HP", "name": "Himachal Pradesh", "type": "state"},
    {"code": "JK", "name": "Jammu and Kashmir", "type": "ut"},
    {"code": "JH", "name": "Jharkhand", "type": "state"},
    {"code": "KA", "name": "Karnataka", "type": "state"},
    {"code": "KL", "name": "Kerala", "type": "state"},
    {"code": "LA", "name": "Ladakh", "type": "ut"},
    {"code": "LD", "name": "Lakshadweep", "type": "ut"},
    {"code": "MP", "name": "Madhya Pradesh", "type": "state"},
    {"code": "MH", "name": "Maharashtra", "type": "state"},
    {"code": "MN", "name": "Manipur", "type": "state"},
    {"code": "ML", "name": "Meghalaya", "type": "state"},
    {"code": "MZ", "name": "Mizoram", "type": "state"},
    {"code": "NL", "name": "Nagaland", "type": "state"},
    {"code": "OD", "name": "Odisha", "type": "state"},
    {"code": "PY", "name": "Puducherry", "type": "ut"},
    {"code": "PB", "name": "Punjab", "type": "state"},
    {"code": "RJ", "name": "Rajasthan", "type": "state"},
    {"code": "SK", "name": "Sikkim", "type": "state"},
    {"code": "TN", "name": "Tamil Nadu", "type": "state"},
    {"code": "TS", "name": "Telangana", "type": "state"},
    {"code": "TR", "name": "Tripura", "type": "state"},
    {"code": "UP", "name": "Uttar Pradesh", "type": "state"},
    {"code": "UK", "name": "Uttarakhand", "type": "state"},
    {"code": "WB", "name": "West Bengal", "type": "state"},
]


# Minimal city seed data so autocomplete works out of the box.
# This is intentionally small; you can later import a full dataset
# directly into the `indian_cities` table without changing code.
SEED_CITIES: List[Dict[str, str]] = [
    # Maharashtra
    {"name": "Mumbai", "state_code": "MH"},
    {"name": "Pune", "state_code": "MH"},
    {"name": "Nagpur", "state_code": "MH"},
    {"name": "Nashik", "state_code": "MH"},
    {"name": "Thane", "state_code": "MH"},
    # Karnataka
    {"name": "Bengaluru", "state_code": "KA"},
    {"name": "Mysuru", "state_code": "KA"},
    {"name": "Mangaluru", "state_code": "KA"},
    # Delhi
    {"name": "New Delhi", "state_code": "DL"},
    # Gujarat
    {"name": "Ahmedabad", "state_code": "GJ"},
    {"name": "Surat", "state_code": "GJ"},
    {"name": "Vadodara", "state_code": "GJ"},
    # Tamil Nadu
    {"name": "Chennai", "state_code": "TN"},
    {"name": "Coimbatore", "state_code": "TN"},
    {"name": "Madurai", "state_code": "TN"},
    # Telangana
    {"name": "Hyderabad", "state_code": "TS"},
    # West Bengal
    {"name": "Kolkata", "state_code": "WB"},
    # Uttar Pradesh
    {"name": "Lucknow", "state_code": "UP"},
    {"name": "Kanpur", "state_code": "UP"},
    {"name": "Varanasi", "state_code": "UP"},
    # Rajasthan
    {"name": "Jaipur", "state_code": "RJ"},
    {"name": "Jodhpur", "state_code": "RJ"},
]


async def seed_indian_states(session: AsyncSession) -> None:
    """Idempotently seed Indian states if the table is empty."""
    result = await session.execute(select(IndianState).limit(1))
    if result.scalar_one_or_none():
        return

    for s in INDIAN_STATES:
        state = IndianState(code=s["code"], name=s["name"], type=s["type"])
        session.add(state)

    await session.commit()


async def seed_indian_cities(session: AsyncSession) -> None:
    """Idempotently seed a small set of major Indian cities.

    This is only to make autocomplete immediately useful. For a full
    production dataset you can bulk-import into `indian_cities`.
    """
    count_result = await session.execute(
        select(func.count(IndianCity.id))
    )
    total = count_result.scalar_one() or 0
    if total > 0:
        return

    for c in SEED_CITIES:
        city = IndianCity(
            name=c["name"],
            state_code=c["state_code"],
        )
        session.add(city)

    await session.commit()

