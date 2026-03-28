import sys
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

def ingest_pdf(file_path):
    print(f"Loading {file_path}...")
    
    # 1. Load PDF
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    print(f"Loaded {len(documents)} pages")

    # 2. Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunks")

    # 3. Create embeddings (free, runs locally)
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    # 4. Store in ChromaDB
    vectorstore = Chroma(
        collection_name="gov_documents",
        embedding_function=embeddings,
        persist_directory="./chroma_store"
    )
    vectorstore.add_documents(chunks)
    print(f"Successfully stored {len(chunks)} chunks in ChromaDB!")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingest.py <path_to_pdf>")
    else:
        ingest_pdf(sys.argv[1])