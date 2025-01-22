# G.I.A.D.A. (Chatbot)

## Introduzione
GIADA (Gestione Interattiva per Attività e Dati Assicurativi) è un assistente virtuale creato per facilitare, velocizzare ed ottimizzare il lavoro dell’agente assicurativo prima, durante e dopo l’incontro con il cliente. Il suo obiettivo principale è fornire al rappresentante assicurativo tutti i dettagli necessari circa i servizi offerti da Vita Sicura, basandosi su documenti aziendali caricati e indicizzati in un archivio vettoriale.

## Caso d’Uso
Un agente assicurativo si prepara per un incontro con un potenziale cliente interessato a una polizza assicurativa per la casa. Prima dell’appuntamento, l’agente utilizza GIADA per:
- Raccogliere informazioni dettagliate sui prodotti disponibili nella categoria "Protezione".
- Identificare i prodotti più adatti alle esigenze del cliente.

Durante l’incontro, l’agente può interrogare il chatbot per ottenere ulteriori dettagli su una polizza specifica.

## Tecnologie Utilizzate
GIADA è interamente sviluppato in Python e sfrutta:
- **OpenAI GPT**: per generare risposte.
- **LlamaIndex**: per la gestione dell'indicizzazione vettoriale dei documenti.

### Librerie Utilizzate
- `os`: per la gestione dei percorsi dei file.
- `hashlib`: per la generazione di hash per il caching.
- `pickle`: per la gestione della cache degli embedding.
- `llama_index`: per la gestione dell'indicizzazione e il recupero dei documenti.
- `openai`: per generare embedding e risposte attraverso le API OpenAI.
- `dotenv`: per la gestione delle variabili d'ambiente (API Key e repository documenti).

## Funzionamento del Chatbot
Il funzionamento del chatbot si basa su 4 step fondamentali:
1. **Inizializzazione, configurazione e caricamento** dei modelli di embedding e di chat.
2. **Caricamento e indicizzazione** dei documenti aziendali.
3. **Generazione degli embedding** per ogni documento caricato.
4. **Esecuzione di query** per estrarre informazioni di interesse dai documenti.

## Modelli Utilizzati
- **Embedding Model**: `text-embedding-ada-002`.
- **Chat Model**: `gpt-3.5-turbo`.

Entrambi i modelli possono essere aggiornati in futuro con nuove release. Il modello GPT-3.5-turbo è stato selezionato per il suo rapporto costo-beneficio ottimale rispetto a modelli più recenti.

## Formati dei Documenti
I documenti forniti a GIADA sono preferibilmente in formato `.md`, poiché questo garantisce una struttura più efficace rispetto ad altri formati come `.pdf`. Tuttavia, il tool supporta anche formati differenti.

## Cache dei Documenti
- I documenti caricati vengono salvati in una cache per evitare ricaricamenti inutili.
- L’utilizzo degli hash consente di rilevare modifiche nei documenti e di aggiornare solo quelli nuovi o modificati.
- Questa strategia riduce i tempi di esecuzione e ottimizza i costi legati alla generazione degli embedding, la componente più onerosa del chatbot.

## Vantaggi del Sistema
- **Consultazione Semplice**: GIADA offre un'interfaccia automatizzata e user-friendly per la consultazione di documenti aziendali.
- **Prestazioni Ottimizzate**: L'uso della cache riduce i costi e migliora le performance.
- **Modularità del Codice**: Facilita l’estensione del tool con nuove funzionalità o miglioramenti.

## Conclusioni
GIADA rappresenta uno strumento innovativo per l’ottimizzazione del lavoro degli agenti assicurativi, fornendo risposte basate su dati accurati e aggiornati. L’integrazione di tecnologie avanzate come OpenAI GPT e LlamaIndex garantisce un’esperienza fluida e affidabile, permettendo un utilizzo versatile sia durante la preparazione degli incontri che nel corso degli stessi.
