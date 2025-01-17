from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class ClienteSchema(BaseModel):
    codice_cliente: int
    nome: str
    cognome: str
    eta: int
    luogo_di_nascita: str
    luogo_di_residenza: str
    professione: str
    reddito: int

    class Config:
        orm_mode = True
        from_attributes = True

class PolizzaSchema(BaseModel):
    id: int
    codice_cliente: int
    prodotto: Optional[str] = None
    area_di_bisogno: Optional[str] = None
    data_di_emissione: Optional[date] = None
    premio_ricorrente: Optional[float] = None
    premio_unico: Optional[float] = None
    capitale_rivalutato: Optional[float] = None
    massimale: Optional[float] = None

    class Config:
        orm_mode = True
        from_attributes = True

class ReclamoInfoSchema(BaseModel):
    id: int
    codice_cliente: int
    prodotto: Optional[str] = None
    area_di_bisogno: Optional[str] = None
    reclami_e_info: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class SinistroSchema(BaseModel):
    id: int
    codice_cliente: int
    prodotto: Optional[str] = None
    area_di_bisogno: Optional[str] = None
    sinistro: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class ClienteDetailsSchema(BaseModel):
    cliente: ClienteSchema
    polizze: List[PolizzaSchema]
    reclami_info: List[ReclamoInfoSchema]
    sinistri: List[SinistroSchema]

    class Config:
        orm_mode = True
        from_attributes = True
