from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Note
from app.database import get_db
from app.schemas import NoteSchema, NoteCreateSchema

router = APIRouter()

@router.get("/clienti/{codice_cliente}/note", response_model=list[NoteSchema])
async def list_notes(codice_cliente: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.codice_cliente == codice_cliente))
    notes = result.scalars().all()
    return notes

@router.delete("/note/{id_nota}")
async def delete_note(id_nota: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note).where(Note.id_nota == id_nota))
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Nota non trovata")
    await db.delete(note)
    await db.commit()
    return {"detail": "Nota eliminata con successo"}

@router.post("/clienti/{codice_cliente}/note", response_model=NoteSchema)
async def create_note(codice_cliente: int, payload: NoteCreateSchema, db: AsyncSession = Depends(get_db)):
    new_note = Note(
        codice_cliente=codice_cliente,
        nome=payload.nome,
        cognome=payload.cognome,
        nota=payload.nota
    )
    db.add(new_note)
    await db.commit()
    await db.refresh(new_note)
    return new_note