import sys
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
import ollama

def query_documents(question, language="en"):
    print(f"\nQuestion: {question}")
    print("-" * 50)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    vectorstore = Chroma(
        collection_name="gov_documents",
        embedding_function=embeddings,
        persist_directory="./chroma_store"
    )

    results = vectorstore.similarity_search(question, k=5)

    if not results:
        if language == "si":
            print("Answer: අදාළ තොරතුරු සොයා ගැනීමට නොහැකි විය. කරුණාකර අදාළ රජයේ දෙපාර්තමේන්තුව අමතන්න.")
        elif language == "ta":
            print("Answer: தொடர்புடைய தகவல்களை கண்டுபிடிக்க முடியவில்லை. தயவுசெய்து அந்தந்த அரசு திணைக்களத்தை தொடர்பு கொள்ளுங்கள்.")
        else:
            print("Answer: No relevant documents found. Please contact the relevant government department.")
        print("Sources found: 0 relevant sections")
        return

    context = "\n\n".join([doc.page_content for doc in results])

    language_instructions = {
        "si": "Respond ONLY in Sinhala language (සිංහල). Do not use English in your response.",
        "ta": "Respond ONLY in Tamil language (தமிழ்). Do not use English in your response.",
        "en": "Respond in English."
    }

    lang_instruction = language_instructions.get(language, language_instructions["en"])

    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "system",
                "content": f"""You are a helpful Sri Lankan government information assistant.
Answer the question using ONLY the provided document context.
Always mention which law or regulation your answer comes from.
{lang_instruction}
If the answer is not in the context, say so clearly in the same language."""
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
        print("Usage: python query.py \"your question here\" [language]")
    else:
        lang = sys.argv[2] if len(sys.argv) > 2 else "en"
        query_documents(" ".join(sys.argv[1:-1]) if len(sys.argv) > 2 else " ".join(sys.argv[1:]), lang)