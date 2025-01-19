from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Polizza, ReclamoInfo, Sinistro
from app.schemas import PolizzaSchema, ReclamoInfoSchema, SinistroSchema
from app.database import get_db

router = APIRouter()

@router.get("/polizze", response_model=list[PolizzaSchema])
async def get_polizze(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Polizza))
    polizze = result.scalars().all()
    return polizze

@router.get("/reclami_info", response_model=list[ReclamoInfoSchema])
async def get_reclami_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ReclamoInfo))
    reclami = result.scalars().all()
    return reclami

@router.get("/sinistri", response_model=list[SinistroSchema])
async def get_sinistri(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Sinistro))
    sinistri = result.scalars().all()
    return sinistri
