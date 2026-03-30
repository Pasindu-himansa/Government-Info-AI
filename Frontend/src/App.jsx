import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import assets from "./assets/assets.js";
import Admin from "./Admin.jsx";

function Chat() {
  const getWelcomeMessage = (lang) => {
    if (lang === "si")
      return "ආයුබෝවන්! මම ශ්‍රී ලංකා රජයේ තොරතුරු සහයක වෙමි. රජයේ නීති, දඩ මුදල් හෝ ක්‍රියාපටිපාටි ගැන ඔබේ විමසීම් යොමු කරන්න.";
    if (lang === "ta")
      return "வணக்கம்! நான் இலங்கை அரசாங்க தகவல் உதவியாளர். அரசாங்க விதிமுறைகள், அபராதங்கள் அல்லது நடைமுறைகள் பற்றி கேளுங்கள்.";
    return "Hello! I am the Sri Lanka Government Information Assistant. Ask me anything about government regulations, fines, or procedures in English, Sinhala, or Tamil.";
  };

  const [messages, setMessages] = useState([
    { role: "bot", text: getWelcomeMessage("en") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");

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
        body: JSON.stringify({ question: input, language }),
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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `url(${assets.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 z-0" />

      {/* Chat Container */}
      <div
        className="relative z-10 w-full max-w-2xl flex flex-col rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center gap-3"
          style={{
            background: "rgba(153,0,0,0.75)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <img
            src={assets.govLogo}
            alt="Sri Lanka Emblem"
            className="w-12 h-12 object-contain drop-shadow-lg"
          />

          {/* Title */}
          <div>
            <h1 className="font-bold text-lg text-white drop-shadow">
              {language === "si"
                ? "ශ්‍රී ලංකා රජයේ තොරතුරු සහයක"
                : language === "ta"
                  ? "இலங்கை அரசாங்க தகவல் உதவியாளர்"
                  : "Sri Lanka Government Info Assistant"}
            </h1>
            <p className="text-yellow-300 text-xs">
              {language === "si"
                ? "AI මගින් බල ගැන්වූ • English / සිංහල / தமிழ்"
                : language === "ta"
                  ? "AI ஆல் இயக்கப்படுகிறது • English / සිංහල / தமிழ்"
                  : "Powered by AI • English / සිංහල / தமிழ்"}
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex gap-1 ml-auto">
            {["en", "si", "ta"].map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setMessages([{ role: "bot", text: getWelcomeMessage(lang) }]);
                }}
                className="text-xs px-2 py-1 rounded-full font-medium transition"
                style={{
                  background:
                    language === lang ? "#FDE047" : "rgba(255,255,255,0.15)",
                  color: language === lang ? "#7f1d1d" : "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {lang === "en" ? "EN" : lang === "si" ? "සිං" : "தமி"}
              </button>
            ))}
          </div>

          {/* Admin Link */}
          <Link
            to="/admin"
            className="text-xs px-3 py-1 rounded-full font-medium transition ml-1"
            style={{
              background: "#FDE047",
              color: "#7f1d1d",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {language === "si"
              ? "පරිපාලන"
              : language === "ta"
                ? "நிர்வாகம்"
                : "Admin"}
          </Link>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-3 p-4 h-[460px] overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
                style={
                  m.role === "user"
                    ? {
                        background: "rgba(153,0,0,0.85)",
                        color: "white",
                        borderRadius: "18px 18px 4px 18px",
                        border: "1px solid rgba(255,255,255,0.15)",
                        backdropFilter: "blur(10px)",
                      }
                    : {
                        background: "rgba(255,255,255,0.15)",
                        color: "white",
                        borderRadius: "18px 18px 18px 4px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                      }
                }
              >
                <p>{m.text}</p>
                {m.sources && (
                  <p className="text-xs mt-2 text-yellow-300 opacity-80">
                    {m.sources}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div
          className="p-3 flex gap-2"
          style={{
            background: "rgba(0,0,0,0.3)",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <input
            className="flex-1 rounded-xl px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
            placeholder={
              language === "si"
                ? "රජයේ නීති රෙගුලාසි ගැන ඔබේ විමසීම් මෙහි සටහන් කරන්න..."
                : language === "ta"
                  ? "அரசாங்க விதிமுறைகள் பற்றி உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யுங்கள்..."
                  : "Ask your questions here..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: loading ? "rgba(153,0,0,0.4)" : "#990000",
              color: "white",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = "#cc0000";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = "#990000";
            }}
            onMouseDown={(e) => {
              if (!loading) e.target.style.background = "#660000";
            }}
            onMouseUp={(e) => {
              if (!loading) e.target.style.background = "#cc0000";
            }}
          >
            {language === "si"
              ? "යවන්න"
              : language === "ta"
                ? "அனுப்பு"
                : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
