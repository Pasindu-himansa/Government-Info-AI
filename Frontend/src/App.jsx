import { useState } from "react";
import assets from "./assets/assets.js";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "හෙලෝ! I am the Sri Lanka Government Information Assistant. Ask me anything about government regulations, fines, or procedures in English, Sinhala, or Tamil.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.answer, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl bg-blue-700 text-white rounded-t-2xl p-4 flex items-center gap-3">
        <img
          src={assets.govLogo}
          alt="Sri Lanka Emblem"
          className="w-10 h-10 object-contain"
        />
        <div>
          <h1 className="font-bold text-lg">Sri Lanka Gov Info Assistant</h1>
          <p className="text-blue-200 text-sm">
            Powered by AI • English / සිංහල / தமிழ்
          </p>
        </div>
        <div className="ml-auto w-3 h-3 bg-green-400 rounded-full"></div>
      </div>

      {/* Messages */}
      <div className="w-full max-w-2xl bg-white flex flex-col gap-3 p-4 h-[500px] overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              <p>{m.text}</p>
              {m.sources && (
                <p className="text-xs mt-2 opacity-60">{m.sources}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="w-full max-w-2xl bg-white border-t rounded-b-2xl p-3 flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          placeholder="Ask a question in English, Sinhala, or Tamil..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
