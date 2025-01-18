from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY 
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Cliente(Base):
    __tablename__ = 'clienti'
    __table_args__ = {'schema': 'vitasicura_schema'}

    codice_cliente = Column(Integer, primary_key=True, index=True)
    nome = Column(String(50))
    cognome = Column(String(50))
    eta = Column(Integer)
    luogo_di_nascita = Column(String(50))
    luogo_di_residenza = Column(String(50))
    professione = Column(String(50))
    reddito = Column(Integer)
    reddito_familiare = Column(Integer)
    numero_figli = Column(Integer)
    anzianita_con_la_compagnia = Column(Integer)
    stato_civile = Column(String(20))
    numero_familiari_a_carico = Column(Integer)
    reddito_stimato = Column(Float)
    patrimonio_finanziario_stimato = Column(Float)
    patrimonio_reale_stimato = Column(Float)
    consumi_stimati = Column(Float)
    propensione_acquisto_prodotti_vita = Column(Float)
    propensione_acquisto_prodotti_danni = Column(Float)
    valore_immobiliare_medio = Column(Float)
    probabilita_furti_stimata = Column(Float)
    probabilita_rapine_stimata = Column(Float)
    zona_di_residenza = Column(String(50))
    agenzia = Column(String(50))

class Polizza(Base):
    __tablename__ = 'polizze'
    __table_args__ = {'schema': 'vitasicura_schema'}

    id = Column(Integer, primary_key=True)
    codice_cliente = Column(Integer, ForeignKey("vitasicura_schema.clienti.codice_cliente"))
    prodotto = Column(String(50))
    area_di_bisogno = Column(String(50))
    data_di_emissione = Column(Date)
    premio_ricorrente = Column(Float)
    premio_unico = Column(Float)
    capitale_rivalutato = Column(Float)
    massimale = Column(Float)

class ReclamoInfo(Base):
    __tablename__ = 'reclami_info'
    __table_args__ = {'schema': 'vitasicura_schema'}

    id = Column(Integer, primary_key=True)
    codice_cliente = Column(Integer, ForeignKey("vitasicura_schema.clienti.codice_cliente"))
    prodotto = Column(String(50))
    area_di_bisogno = Column(String(50))
    reclami_e_info = Column(String)

class Sinistro(Base):
    __tablename__ = 'sinistri'
    __table_args__ = {'schema': 'vitasicura_schema'}

    id = Column(Integer, primary_key=True)
    codice_cliente = Column(Integer, ForeignKey("vitasicura_schema.clienti.codice_cliente"))
    prodotto = Column(String(50))
    area_di_bisogno = Column(String(50))
    sinistro = Column(String)

class Note(Base):
    __tablename__ = 'note'
    __table_args__ = {'schema': 'vitasicura_schema'}

    codice_cliente = Column(Integer, primary_key=True, index=True)
    nome = Column(String(50))
    cognome = Column(String(50))
    note = Column(ARRAY(String))
