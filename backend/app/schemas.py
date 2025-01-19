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
    reddito_familiare: int
    numero_figli: int
    anzianita_con_la_compagnia: int
    stato_civile: str
    numero_familiari_a_carico: int
    reddito_stimato: float
    patrimonio_finanziario_stimato: float
    patrimonio_reale_stimato: float
    consumi_stimati: float
    propensione_acquisto_prodotti_vita: float 
    propensione_acquisto_prodotti_danni: float
    valore_immobiliare_medio: float
    probabilita_furti_stimata: float
    probabilita_rapine_stimata: float
    zona_di_residenza: str
    agenzia: str

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

class NoteSchema(BaseModel):
    id_nota: int
    codice_cliente: int
    nome: str
    cognome: str
    nota: str

    class Config:
        orm_mode = True
        from_attributes = True

class NoteCreateSchema(BaseModel):
    nome: str
    cognome: str
    nota: str

    class Config:
        orm_mode = True
        from_attributes = True
