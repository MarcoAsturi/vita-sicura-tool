from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Cliente, Polizza, ReclamoInfo, Sinistro
from app.schemas import (
    ClienteSchema, 
    ClienteDetailsSchema, 
    PolizzaSchema, 
    ReclamoInfoSchema, 
    SinistroSchema,
    ClienteUpdateSchema
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

@router.patch("/clienti/{codice_cliente}", response_model=ClienteSchema)
async def update_cliente(codice_cliente: int, update_data: ClienteUpdateSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cliente).where(Cliente.codice_cliente == codice_cliente))
    cliente = result.scalars().first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente non trovato")
    
    # check data quality of reddito
    if update_data.reddito is not None:
        current_reddito = cliente.reddito
        new_reddito = update_data.reddito
        if current_reddito > 0:
            variation = abs(new_reddito - current_reddito) / current_reddito
            if variation > 0.3:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Il nuovo reddito ({new_reddito}) differisce troppo dal valore attuale ({current_reddito}). Variazione massima consentita del 30%."
                )
        
    # check data quality of nome, cognome, eta
    if update_data.nome is not None:
        if not update_data.nome.isalpha():
            raise HTTPException(
                status_code=400,
                detail="Il nome deve contenere solo lettere."
            )
        cliente.nome = update_data.nome
    if update_data.cognome is not None:
        if not update_data.cognome.isalpha():
            raise HTTPException(
                status_code=400,
                detail="Il cognome deve contenere solo lettere."
            )
        cliente.cognome = update_data.cognome
    if update_data.eta is not None:
        if update_data.eta < 0 or update_data.eta > 120:
            raise HTTPException(
                status_code=400,
                detail="Età non valida. Deve essere compresa tra 0 e 120."
            )
        cliente.eta = update_data.eta
    if update_data.reddito is not None:
        cliente.reddito = update_data.reddito

    await db.commit()
    await db.refresh(cliente)
    return cliente