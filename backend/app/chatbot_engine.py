import os
import hashlib
import pickle
from llama_index.core.chat_engine.types import ChatMode
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core import VectorStoreIndex, Document
from llama_index.core import SimpleDirectoryReader
from openai import OpenAI
from llama_index.core import QueryBundle
from dotenv import load_dotenv

load_dotenv()

class AIQueryEngine:
    def __init__(self, openai_api_key: str, embedding_model: str = "text-embedding-ada-002", chat_model: str = "gpt-3.5-turbo"):
        print("Starting AI Query Engine")

        self.client = OpenAI(api_key=openai_api_key)
        self.embedding_model = embedding_model
        self.chat_model = chat_model

        self.docs_path = os.environ.get("CHATBOT_DOCS_PATH", "./documents")
        self.embedding_cache_path = "embeddings_cache.pkl"

        self.index = self.load_or_create_index()

        self.memory = ChatMemoryBuffer.from_defaults(
            llm=None,
            token_limit=15000,
        )

        self.system_prompt = """
        Il tuo compito è rispondere alle domande dell'utente (tag <question>...</question>) utilizzando i soli documenti caricati in formato vettoriale.

        Analizza i documenti e ritorna la risposta alla domanda dell'utente all'interno di un tag html <response> senza includere il link al documento correlato.

        Linee guida:
        - Sii breve e schematico.
        - Usa la terminologia dei documenti.
        - Non includere tecnologie non menzionate nei documenti.

        Esempio:
        <question>Quale strumento posso utilizzare per produrre eventi di test su kafka?</question>
        <response>Anemoi è il building block per generare eventi su kafka topic</response>

        Si inizia!
        """

        self.chat_engine = self.index.as_chat_engine(
            chat_mode=ChatMode.CONTEXT,
            memory=self.memory,
        )

    def get_embedding(self, text: str) -> list:
        """Genera embedding usando OpenAI"""
        response = self.client.embeddings.create(
            input=text,
            model=self.embedding_model
        )
        return response.data[0].embedding

    def hash_text(self, text: str) -> str:
        return hashlib.sha256(text.encode()).hexdigest()

    def load_or_create_index(self):
        """Carica i documenti e crea/rigenera l'indice vettoriale"""
        documents = SimpleDirectoryReader(self.docs_path).load_data()
        doc_texts = {doc.metadata['file_name']: doc.text for doc in documents}

        if os.path.exists(self.embedding_cache_path) and os.path.getsize(self.embedding_cache_path) > 0:
            with open(self.embedding_cache_path, "rb") as f:
                cached_data = pickle.load(f)
            print("✅ Embedding cache loaded successfully.")
        else:
            cached_data = {"hashes": {}, "embeddings": {}}
            print("⚠️ No cache found; generating new embeddings.")

        cached_text_hashes = cached_data.get("hashes", {})
        cached_embeddings = cached_data.get("embeddings", {})

        new_embeddings = {}
        documents_updated = 0

        for file_name, text in doc_texts.items():
            text_hash = self.hash_text(text)
            if file_name in cached_text_hashes and cached_text_hashes[file_name] == text_hash:
                new_embeddings[file_name] = {
                    "embedding": cached_embeddings[file_name],
                    "hash": cached_text_hashes[file_name]
                }
                print(f"🔄 {file_name}: Embedding loaded from cache.")
            else:
                embedding = self.get_embedding(text)
                new_embeddings[file_name] = {
                    "embedding": embedding,
                    "hash": text_hash
                }
                documents_updated += 1
                print(f"🆕 {file_name}: Embedding regenerated.")

        with open(self.embedding_cache_path, "wb") as f:
            pickle.dump({"hashes": {k: v["hash"] for k, v in new_embeddings.items()},
                         "embeddings": {k: v["embedding"] for k, v in new_embeddings.items()}}, f)

        print(f"📁 Total updated documents: {documents_updated}")

        docs = [
            Document(text=doc_texts[file_name], embedding=new_embeddings[file_name]["embedding"])
            for file_name in new_embeddings
        ]
        print(f"📁 Total documents loaded: {len(docs)}")
        return VectorStoreIndex.from_documents(docs, show_progress=True)

    def query(self, question: str) -> str:
        """Esegue una query al chatbot e restituisce la risposta."""
        query_embedding = self.get_embedding(question)
        query_bundle = QueryBundle(query_str=question, embedding=query_embedding)
        results = self.index.as_retriever().retrieve(query_bundle)
        context = " ".join([node.text for node in results])
        response = self.client.chat.completions.create(
            model=self.chat_model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": f"Contesto: {context}\n\nDomanda: {question}"}
            ]
        )
        return response.choices[0].message.content

