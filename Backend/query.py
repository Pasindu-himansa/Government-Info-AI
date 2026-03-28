import sys
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import ollama

def query_documents(question):
    print(f"\nQuestion: {question}")
    print("-" * 50)

    # 1. Load embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    # 2. Connect to ChromaDB
    vectorstore = Chroma(
        collection_name="gov_documents",
        embedding_function=embeddings,
        persist_directory="./chroma_store"
    )

    # 3. Search for relevant chunks
    results = vectorstore.similarity_search(question, k=5)

    if not results:
        print("No relevant documents found.")
        print("Please contact the relevant government department.")
        return

    # 4. Build context from results
    context = "\n\n".join([doc.page_content for doc in results])

    # 5. Ask Ollama (free local AI)
    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "system",
                "content": """You are a helpful Sri Lankan government information assistant.
Answer the question using ONLY the provided document context.
Always mention which law or regulation your answer comes from.
If the answer is not in the context, say 'I could not find this information in the available documents.'"""
            },
            {
                "role": "user",
                "content": f"Context from government documents:\n{context}\n\nQuestion: {question}"
            }
        ]
    )

    print("Answer:", response['message']['content'])
    print("\nSources found:", len(results), "relevant sections")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python query.py \"your question here\"")
    else:
        query_documents(" ".join(sys.argv[1:]))