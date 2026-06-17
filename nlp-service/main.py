from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import torch
import requests
import os
import uvicorn
import numpy as np
import threading
import time

app = FastAPI()

# Load model globally so it's ready for requests
print("Loading sentence-transformers model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully.")

# In-memory index: dict of id -> numpy array
product_embeddings = {}

BACKEND_URL = os.getenv("NLP_BACKEND_SYNC_URL", "http://backend:8080")

class ProductIndexRequest(BaseModel):
    id: int
    text: str

def fetch_products():
    """Background thread to fetch existing products from Spring Boot on startup."""
    print(f"Starting background sync with backend: {BACKEND_URL}/api/products")
    # Try connecting for up to 60 seconds (12 * 5s)
    for _ in range(12):
        try:
            response = requests.get(f"{BACKEND_URL}/api/products", timeout=5)
            if response.status_code == 200:
                products = response.json()
                count = 0
                for p in products:
                    # Create a rich text representation of the product
                    text = f"{p.get('title', '')} {p.get('category', '')} {p.get('description', '')}"
                    embedding = model.encode(text)
                    product_embeddings[p['id']] = embedding
                    count += 1
                print(f"Successfully synced and indexed {count} existing products.")
                return
            else:
                print(f"Backend returned status {response.status_code}. Retrying in 5s...")
        except Exception as e:
            print(f"Could not connect to backend ({e}). Retrying in 5s...")
        time.sleep(5)
    print("Failed to sync with backend after 60 seconds. Starting with empty index.")

@app.on_event("startup")
def startup_event():
    # Start the sync in a background thread so it doesn't block the FastAPI startup
    threading.Thread(target=fetch_products, daemon=True).start()

@app.post("/index")
def index_product(req: ProductIndexRequest):
    embedding = model.encode(req.text)
    product_embeddings[req.id] = embedding
    return {"status": "success", "id": req.id}

@app.delete("/index/{product_id}")
def delete_product(product_id: int):
    if product_id in product_embeddings:
        del product_embeddings[product_id]
    return {"status": "success", "id": product_id}

@app.get("/search")
def search(q: str, k: int = 10):
    if not product_embeddings:
        return []
    
    query_embedding = model.encode(q)
    
    results = []
    for pid, emb in product_embeddings.items():
        # Cosine similarity: dot product of normalized vectors
        cos_sim = np.dot(query_embedding, emb) / (np.linalg.norm(query_embedding) * np.linalg.norm(emb))
        results.append((pid, float(cos_sim)))
        
    # Sort by similarity descending
    results.sort(key=lambda x: x[1], reverse=True)
    
    # Return top K product IDs
    top_k = results[:k]
    return [pid for pid, sim in top_k]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
