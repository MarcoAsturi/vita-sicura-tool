# GenerAI: The Tool for Vita Sicura Insurance Agents

## Project Description
Vita Sicura AI is an innovative tool designed to support Vita Sicura (fictional company) insurance agents in their daily planning and operations. The system integrates advanced features for:

- **Work Planning**: Using descriptive and predictive analytics to organize activities.
- **Operational Management**: Support with conversational tools (chatbot and speech-to-text) for more efficient customer interactions.
- **Interactive Dashboards**: Detailed analyses for a deep understanding of customer data and business operations.

## Main Features
### 1. **Dashboard and Database**
- Interactive data visualization on customers, policies, claims, and incidents.
- Ability to filter, sort, and modify data directly from the interface.
- Implementation of quality controls on entered or modified data, with detailed feedback on detected errors.

#### Technical Features
- **Frontend**: Built with React.js, integrating libraries like Chart.js for charts and React Query for request management.
- **Backend**: Built with FastAPI and PostgreSQL for secure and performant data management.
- **Data Quality**: Custom validation functions, such as:
    - Verification of the validity of first and last names.
    - Ensuring age is between 18 and 120 years.
    - Validation of income changes to ensure there are no excessive variations compared to previous data.

#### Table Structure
**Customer Table**
```sql
CREATE TABLE clienti (
        codice_cliente SERIAL PRIMARY KEY,
        nome VARCHAR(50) NOT NULL,
        cognome VARCHAR(50) NOT NULL,
        eta INT,
        luogo_di_nascita VARCHAR(50),
        luogo_di_residenza VARCHAR(50),
        professione VARCHAR(50),
        reddito DECIMAL CHECK,
        reddito_familiare DECIMAL,
        numero_figli INT,
        anzianita_con_la_compagnia INT,
        stato_civile VARCHAR(20),
        numero_familiari_a_carico INT,
        reddito_stimato DECIMAL,
        patrimonio_finanziario_stimato DECIMAL,
        patrimonio_reale_stimato DECIMAL,
        consumi_stimati DECIMAL,
        propensione_acquisto_prodotti_vita DECIMAL,
        propensione_acquisto_prodotti_danni DECIMAL,
        valore_immobiliare_medio DECIMAL,
        probabilita_furti_stimata DECIMAL,
        probabilita_rapine_stimata DECIMAL,
        zona_di_residenza VARCHAR(50),
        agenzia VARCHAR(50)
);
```

**Policy Table**
```sql
CREATE TABLE polizze (
        id SERIAL PRIMARY KEY,
        codice_cliente INT REFERENCES clienti(codice_cliente),
        prodotto VARCHAR(255),
        area_di_bisogno VARCHAR(255),
        data_di_emissione DATE,
        premio_ricorrente DECIMAL,
        premio_unico DECIMAL,
        capitale_rivalutato DECIMAL,
        massimale DECIMAL
);
```

**Claims Table**
```sql
CREATE TABLE reclami_info (
        id SERIAL PRIMARY KEY,
        codice_cliente INT REFERENCES clienti(codice_cliente),
        prodotto VARCHAR(255),
        area_di_bisogno VARCHAR(255),
        reclami_e_info TEXT
);
```

**Incidents Table**
```sql
CREATE TABLE sinistri (
        id SERIAL PRIMARY KEY,
        codice_cliente INT REFERENCES clienti(codice_cliente),
        prodotto VARCHAR(255),
        area_di_bisogno VARCHAR(255),
        sinistro TEXT
);
```

**Notes Table**
```sql
CREATE TABLE note (
        id_nota SERIAL PRIMARY KEY,
        codice_cliente INT REFERENCES clienti(codice_cliente),
        nome VARCHAR(50),
        cognome VARCHAR(50),
        nota TEXT
);
```

### 2. **GI.A.D.A. (Chatbot)**
GI.A.D.A. (Generative Intelligence for Assurance Data Assistant) is a virtual assistant designed to:
- Provide information on products and services offered by Vita Sicura.
- Use a vector archive to search and retrieve specific information from company documents.

#### Technologies Used:
- **OpenAI GPT**: Response generation.
- **LlamaIndex**: Document indexing and management.
- **Document Cache**: Use of hashes to avoid unnecessary document reloads.

### 3. **Speech-to-Text Assistant**
The voice assistant allows agents to:
- Transcribe conversations with customers.
- Automatically generate concise summaries of transcriptions via OpenAI APIs.
- Record voice notes to update the customer database.

#### Workflow:
1. **Transcription**: Using Vosk to convert audio to text.
2. **Summary**: Integration with OpenAI to synthesize key points.
3. **Archiving**: Saving information in the database.

### 4. **Predictive and Descriptive Analytics**
- **Descriptive**: Charts and statistics on customer data, such as age distribution, incomes, and policies.
- **Predictive**: Models estimating the likelihood of future claims or incidents using machine learning algorithms.

## Technologies and Libraries
- **Frontend**: React.js, Chart.js, Styled Components.
- **Backend**: FastAPI, PostgreSQL.
- **AI**: OpenAI API (gpt-3.5-turbo), Vosk, LlamaIndex.

## Backend API Endpoints
### Endpoints List
- **GET /clienti**: Fetch all customers.
- **GET /clienti/{codice_cliente}**: Fetch details of a specific customer.
- **PATCH /clienti/{codice_cliente}**: Update customer data.
- **GET /polizze**: Fetch all policies.
- **GET /polizze/{id}**: Fetch details of a specific policy.

### Example Requests and Responses
**Fetching Customer Details**:
**Request**:
```http
GET /clienti/9500
```
**Response**:
```json
{
  "codice_cliente": 9500,
  "nome": "Rosina",
  "cognome": "Biagi",
  "eta": 60,
  "luogo_di_residenza": "Napoli",
  "reddito": 19243
}
```

**Updating Customer Data**:
**Request**:
```http
PATCH /clienti/9500
Content-Type: application/json
{
  "nome": "Rosa",
  "eta": 61
}
```
**Response**:
```json
{
  "message": "Customer updated successfully",
  "data": {
    "codice_cliente": 9500,
    "nome": "Rosa",
    "eta": 61
  }
}
```

## Error Handling
### Backend
- **Validation Errors**: Errors are returned with HTTP status `422 Unprocessable Entity`.
- Example:
    ```json
    {
      "detail": "Age must be between 18 and 120."
    }
    ```
- **Database Errors**: Return HTTP status `400 Bad Request` or `500 Internal Server Error`.

### Frontend
- Displays error messages directly below the form fields when validation fails.
- Example:
    - "Name cannot be empty."
    - "Income variation exceeds allowed limits."

## Architecture
The project follows a microservices architecture with:
- A RESTful backend developed in FastAPI.
- A relational PostgreSQL database for data management.
- A React.js frontend for the user interface.

## Project Setup
### Prerequisites
- Node.js (>=16.x)
- Python (>=3.10)
- PostgreSQL

### Installation
1. **Clone the repository**:
     ```bash
     git clone https://github.com/MarcoAsturi/vita-sicura-tool.git
     cd vita-sicura-tool
     ```
2. **Configure the Backend**:
     - Create a virtual environment:
         ```bash
         cd backend
         python -m venv env
         source env/bin/activate  # On Windows: env\Scripts\activate
         ```
     - Install dependencies:
         ```bash
         pip install -r requirements.txt
         python -m spacy download it_core_news_md
         ```
     - Configure the `.env` file with database and OpenAI API credentials. Example:
         ```env
         DB_NAME=yourdbname
         DB_USER=youruser
         DB_PASSWORD=yourpassword
         DB_HOST=localhost
         DB_PORT=5432
         OPENAI_API_KEY=your_openai_api_key
         ALLOWED_CORS_ORIGINS=http://localhost:3000
         REACT_APP_API_BASE_URL=http://localhost:8000
         VOSK_MODEL_PATH=./models/vosk-model-small-it-0.22
         ```
        - **DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT**: Database connection settings.
        - **OPENAI_API_KEY**: API key for accessing OpenAI services.
        - **ALLOWED_CORS_ORIGINS**: Defines which frontend domains can access the backend.
        - **REACT_APP_API_BASE_URL**: Base URL for the backend API.
        - **VOSK_MODEL_PATH**: Path to the Vosk model for speech-to-text.
     - Start the backend:
         ```bash
         uvicorn app.main:app --reload
         ```
3. **Configure the Frontend**:
     - Install dependencies:
         ```bash
         cd frontend
         npm install
         ```
     - Start the development server:
         ```bash
         npm start
         ```

## Issues and Future Implementations
### Issues
- Limitations in predictive models on incidents due to insufficient historical data.

### Future Implementations
- **GI.A.D.A.**: Voice queries and greater integration with the customer database.
- **Speech-to-Text**: Support for real-time audio file uploads.
- **Data Quality**: Addition of further specific validation rules.

## Conclusions
GenerAI represents a significant innovation for the insurance sector, simplifying data management and enhancing agent efficiency. Current and future features promise to improve service quality, making GenerAI an indispensable tool.
