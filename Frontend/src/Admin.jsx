import { useState } from "react";
import { Link } from "react-router-dom";
import assets from "./assets/assets.js";

export default function Admin() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await fetch("http://localhost:3001/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `Successfully ingested ${data.chunksStored} chunks from ${file.name}`,
        });
        setUploadedDocs((prev) => [
          ...prev,
          {
            name: file.name,
            chunks: data.chunksStored,
            date: new Date().toLocaleDateString(),
          },
        ]);
        setFile(null);
      } else {
        setMessage({ type: "error", text: "Upload failed. Please try again." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not connect to server." });
    }

    setUploading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-2xl bg-blue-700 text-white rounded-2xl p-4 flex items-center gap-3 mb-6">
        <img
          src={assets.govLogo}
          alt="Sri Lanka Emblem"
          className="w-10 h-10 object-contain"
        />
        <div>
          <h1 className="font-bold text-lg">Admin Panel</h1>
          <p className="text-blue-200 text-sm">Upload government documents</p>
        </div>
        <Link
          to="/"
          className="ml-auto text-xs bg-white text-blue-700 px-3 py-1 rounded-full font-medium hover:bg-blue-50 transition"
        >
          Back to Chat
        </Link>
      </div>

      {/* Upload Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">
          Upload New Document
        </h2>

        <label className="block border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition">
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? (
            <div>
              <p className="text-blue-600 font-medium">{file.name}</p>
              <p className="text-gray-400 text-sm mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 text-sm">
                Click to select a PDF file
              </p>
              <p className="text-gray-300 text-xs mt-1">
                Only PDF files are supported
              </p>
            </div>
          )}
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-medium transition"
        >
          {uploading ? "Uploading & Ingesting..." : "Upload Document"}
        </button>

        {message && (
          <div
            className={`mt-4 p-3 rounded-xl text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Uploaded Documents
          </h2>
          <div className="flex flex-col gap-3">
            {uploadedDocs.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {doc.chunks} chunks • {doc.date}
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Ingested
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
