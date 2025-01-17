from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Cliente, Polizza, ReclamoInfo, Sinistro
from app.schemas import (
    ClienteSchema, 
    ClienteDetailsSchema, 
    PolizzaSchema, 
    ReclamoInfoSchema, 
    SinistroSchema
)
from app.database import get_db

router = APIRouter()

@router.get("/clienti", response_model=list[ClienteSchema])
async def get_clienti(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cliente))
    clienti = result.scalars().all()
    return clienti

@router.get("/clienti/{codice_cliente}", response_model=ClienteDetailsSchema)
async def get_cliente_details(codice_cliente: int, db: AsyncSession = Depends(get_db)):
    result_cliente = await db.execute(select(Cliente).where(Cliente.codice_cliente == codice_cliente))
    cliente = result_cliente.scalars().first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    result_polizze = await db.execute(select(Polizza).where(Polizza.codice_cliente == codice_cliente))
    polizze = result_polizze.scalars().all()

    result_reclami = await db.execute(select(ReclamoInfo).where(ReclamoInfo.codice_cliente == codice_cliente))
    reclami_info = result_reclami.scalars().all()

    result_sinistri = await db.execute(select(Sinistro).where(Sinistro.codice_cliente == codice_cliente))
    sinistri = result_sinistri.scalars().all()

    return ClienteDetailsSchema(
        cliente=ClienteSchema.from_orm(cliente),
        polizze=[PolizzaSchema.from_orm(p) for p in polizze],
        reclami_info=[ReclamoInfoSchema.from_orm(r) for r in reclami_info],
        sinistri=[SinistroSchema.from_orm(s) for s in sinistri]
    )
