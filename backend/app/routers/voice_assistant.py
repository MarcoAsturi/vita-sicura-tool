import os
import wave
import subprocess
import hashlib
import psycopg2
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from vosk import Model, KaldiRecognizer
import spacy
import requests
import zipfile
import json

router = APIRouter()

# Funzione per scaricare e estrarre il modello Vosk (opzionale)
def download_and_extract_model(model_url: str, target_dir: str):
    """
    Scarica il modello dal URL specificato e lo estrae nella cartella target.
    """
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
    
    zip_path = os.path.join(target_dir, "model.zip")
    
    print(f"Scaricamento del modello da {model_url}...")
    response = requests.get(model_url, stream=True)
    if response.status_code != 200:
        raise ValueError(f"Errore durante il download del modello: {response.status_code}")
    
    with open(zip_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    print("Download completato.")

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(target_dir)
    os.remove(zip_path)
    print("Modello estratto con successo.")

# Configurazione del modello Vosk:
MODEL_NAME = "vosk-model-small-it-0.22"
MODELS_DIR = "./models"  # Assicurati di aggiungere questa cartella al .gitignore
VOSK_MODEL_PATH = os.path.join(MODELS_DIR, MODEL_NAME)

# Se il modello non è già presente, (opzionalmente) scaricalo automaticamente.
# if not os.path.exists(VOSK_MODEL_PATH):
#     MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-small-it-0.22.zip"
#     download_and_extract_model(MODEL_URL, MODELS_DIR)

def convert_m4a_to_wav(input_path: str, output_path: str):
    """
    Converte un file audio da M4A a WAV a 16kHz mono utilizzando ffmpeg.
    """
    command = ["ffmpeg", "-y", "-i", input_path, "-ac", "1", "-ar", "16000", output_path]
    print("Esecuzione comando ffmpeg per M4A:", " ".join(command))
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout_decoded = result.stdout.decode("utf-8")
    stderr_decoded = result.stderr.decode("utf-8")
    print("ffmpeg stdout:", stdout_decoded)
    print("ffmpeg stderr:", stderr_decoded)
    if result.returncode != 0:
        raise ValueError(f"Errore durante la conversione con ffmpeg: {stderr_decoded}")

def assicurati_audio_conforme(input_path: str, output_path: str) -> str:
    """
    Controlla se un file audio WAV è mono e a 16kHz.
    Se non lo è, lo converte in WAV conforme usando ffmpeg.
    Restituisce il percorso del file conforme.
    """
    try:
        wf = wave.open(input_path, "rb")
        channels = wf.getnchannels()
        framerate = wf.getframerate()
        wf.close()
        print(f"Verifica file WAV: canali={channels}, framerate={framerate} Hz")
    except Exception as e:
        raise ValueError(f"Errore nell'aprire il file audio: {e}")
    
    if channels == 1 and framerate == 16000:
        return input_path
    else:
        command = ["ffmpeg", "-y", "-i", input_path, "-ac", "1", "-ar", "16000", output_path]
        print("Esecuzione comando ffmpeg per rendere il WAV conforme:", " ".join(command))
        result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if result.returncode != 0:
            error_message = result.stderr.decode("utf-8")
            raise ValueError(f"Errore durante la conversione con ffmpeg: {error_message}")
        return output_path

def riconosci_audio_vosk(audio_path: str, model_path: str) -> str:
    """Riconosce il testo parlato da un file audio WAV usando Vosk."""
    if not os.path.exists(model_path):
        raise ValueError(f"Modello non trovato: {model_path}")
    if not os.path.exists(audio_path):
        raise ValueError(f"File audio non trovato: {audio_path}")
    
    print("Caricamento del modello Vosk...")
    model = Model(model_path)
    
    try:
        wf = wave.open(audio_path, "rb")
    except Exception as e:
        raise ValueError(f"Errore durante l'apertura del file WAV: {e}")
    
    channels = wf.getnchannels()
    framerate = wf.getframerate()
    sampwidth = wf.getsampwidth()
    nframes = wf.getnframes()
    print(f"Parametri file WAV: canali={channels}, framerate={framerate} Hz, sampwidth={sampwidth} bytes, nframes={nframes}")
    
    if channels != 1 or framerate != 16000:
        raise ValueError("Il file audio deve essere mono (1 canale) e a 16 kHz.")
    
    recognizer = KaldiRecognizer(model, framerate)
    testo_trascritto = ""
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if recognizer.AcceptWaveform(data):
            result = recognizer.Result()
            print(f"Risultato intermedio: {result}")
            # Estrai il campo "text" dal JSON
            result_json = json.loads(result)
            testo_trascritto += result_json.get("text", "") + " "
    final_result = recognizer.FinalResult()
    print(f"Risultato finale: {final_result}")
    final_result_json = json.loads(final_result)
    testo_trascritto += final_result_json.get("text", "")
    return testo_trascritto.strip()

def estrai_informazioni_chiave(testo: str) -> dict:
    """
    Estrae informazioni chiave (nome, cognome e nota) dal testo trascritto usando spaCy.
    - Se il testo contiene '}{', considera solo la prima parte (primo oggetto JSON).
    - Se viene trovato il marker "nota:" si estrae il testo successivo;
      altrimenti, se viene trovato " con nota " si estrae il testo successivo.
    - In assenza di marker, viene usata l'intera trascrizione come nota.
    """
    # Pulizia: se il testo contiene più oggetti JSON, prendi il primo oggetto
    if "},{" in testo:
        # Se vengono separati da "},{" prendi la prima parte, aggiungendoci la chiusura mancante
        testo = testo.split("},{")[0] + "}"
    elif "}{" in testo:
        testo = testo.split("}{")[0] + "}"

    try:
        nlp = spacy.load("it_core_news_md")
    except Exception as e:
        raise ValueError("Modello spaCy 'it_core_news_md' non trovato. Assicurati di aver eseguito: python -m spacy download it_core_news_md")
    
    doc = nlp(testo)
    nome = None
    cognome = None
    nota = None

    # Estrai entità di tipo PERSONA
    for ent in doc.ents:
        if ent.label_ == "PER":
            splitted = ent.text.split()
            if not nome and len(splitted) > 0:
                nome = splitted[0].capitalize()  # Capitalizza la prima lettera
                if len(splitted) > 1:
                    cognome = splitted[1].capitalize()
            else:
                # Se c'è più di un'entità, potresti voler assegnare la seconda come cognome
                if not cognome:
                    cognome = ent.text.capitalize()
    
    lower_text = testo.lower()
    if "nota:" in lower_text:
        start_idx = lower_text.find("nota:")
        nota = testo[start_idx + len("nota:"):].strip()
    elif " con nota " in lower_text:
        start_idx = lower_text.find(" con nota ")
        nota = testo[start_idx + len(" con nota "):].strip()
    else:
        nota = testo.strip()

    return {"nome": nome, "cognome": cognome, "nota": nota}


def recupera_codice_cliente(info: dict, conn_params: dict) -> int:
    """
    Recupera il codice_cliente dalla tabella 'clienti' usando nome e cognome in maniera case-insensitive.
    """
    try:
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT codice_cliente FROM vitasicura_schema.clienti WHERE lower(nome) = lower(%s) AND lower(cognome) = lower(%s);",
            (info["nome"], info["cognome"])
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        if row:
            return row[0]
        else:
            raise ValueError(f"Nessun cliente trovato con nome '{info['nome']}' e cognome '{info['cognome']}'")
    except psycopg2.Error as e:
        raise ValueError(f"Errore durante il recupero del codice_cliente: {e}")

def genera_query_note(info: dict, codice_cliente: int) -> tuple:
    """
    Genera una query parametrizzata per inserire o aggiornare il campo "note" nella tabella "note".
    Utilizza la funzione PostgreSQL array_append per aggiungere una nuova nota.
    In questo caso, il conflitto viene rilevato sulla chiave primaria codice_cliente.
    """
    query = """
    INSERT INTO vitasicura_schema.note (codice_cliente, nome, cognome, note)
    VALUES (%s, %s, %s, ARRAY[%s])
    ON CONFLICT (codice_cliente)
    DO UPDATE SET note = array_append(vitasicura_schema.note.note, EXCLUDED.note[1]);
    """
    valori = (codice_cliente, info["nome"], info["cognome"], info["nota"])
    return query, valori

def aggiorna_database_sicuro(query: str, valori: tuple, conn_params: dict) -> bool:
    """Esegue una query parametrizzata sul database PostgreSQL."""
    try:
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()
        cursor.execute(query, valori)
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except psycopg2.Error as e:
        print(f"Errore durante l'aggiornamento del database: {e}")
        return False

@router.post("/assistente-vocale")
async def assistente_vocale(file: UploadFile = File(...)):
    """
    Endpoint che riceve un file audio, lo converte se necessario, lo trascrive,
    estrae informazioni chiave, recupera il codice_cliente dalla tabella clienti e aggiorna la tabella "note".
    Restituisce trascrizione, informazioni estratte e lo stato dell’aggiornamento.
    """
    print(f"Ricevuto file: {file.filename}")
    contents = await file.read()
    print(f"Dimensione file: {len(contents)} bytes")
    
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as f:
        f.write(contents)
    
    # Se il file è in formato M4A, convertilo in WAV
    if file.filename.lower().endswith(".m4a"):
        wav_file_path = f"temp_{os.path.splitext(file.filename)[0]}.wav"
        try:
            print("Avvio conversione M4A -> WAV...")
            convert_m4a_to_wav(temp_file_path, wav_file_path)
            print("Conversione M4A -> WAV completata.")
        except Exception as e:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            raise HTTPException(status_code=400, detail=str(e))
        os.remove(temp_file_path)
        audio_path = wav_file_path
    else:
        audio_path = temp_file_path

    # Controlla la conformità del file WAV e convertilo se necessario
    try:
        fixed_wav_path = f"fixed_{os.path.basename(audio_path)}"
        audio_path = assicurati_audio_conforme(audio_path, fixed_wav_path)
        print(f"Audio conforme: {audio_path}")
    except Exception as e:
        if os.path.exists(audio_path):
            os.remove(audio_path)
        raise HTTPException(status_code=400, detail=str(e))
    
    try:
        print("Inizio trascrizione con Vosk...")
        trascrizione = riconosci_audio_vosk(audio_path, VOSK_MODEL_PATH)
    except Exception as e:
        print("Errore durante la trascrizione:", e)
        if os.path.exists(audio_path):
            os.remove(audio_path)
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)
    
    print("Trascrizione completata, inizio estrazione informazioni...")
    informazioni = estrai_informazioni_chiave(trascrizione)
    print("Informazioni estratte:", informazioni)
    
    conn_params = {
        "host": os.environ.get("DB_HOST"),
        "database": os.environ.get("DB_NAME"),
        "user": os.environ.get("DB_USER"),
        "password": os.environ.get("DB_PASSWORD")
    }
    
    try:
        codice_cliente = recupera_codice_cliente(informazioni, conn_params)
        print(f"Codice cliente recuperato: {codice_cliente}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    query, valori = genera_query_note(informazioni, codice_cliente)
    print("Query generata:", query)
    print("Valori:", valori)
    aggiornato = aggiorna_database_sicuro(query, valori, conn_params)
    print("Stato aggiornamento database:", aggiornato)
    
    if not aggiornato:
        raise HTTPException(status_code=500, detail="Errore durante l'aggiornamento del database.")
    
    return JSONResponse(content={
        "trascrizione": trascrizione,
        "informazioni": informazioni,
        "database_aggiornato": aggiornato
    })
