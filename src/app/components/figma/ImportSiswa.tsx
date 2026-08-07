import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

export default function ImportSiswa() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
    setMessage("");
    setError("");
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Silakan pilih file Excel terlebih dahulu.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Mengambil token sesuai dengan nama key yang tersimpan di browser
      const token = localStorage.getItem("tabungan-swad-token"); 

      const API_URL = "https://tabunganswad-production.up.railway.app";

      const response = await fetch(`${API_URL}/api/admin/import-students`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message || "Data siswa berhasil diimpor!");
        setFile(null);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(result.message || "Gagal mengunggah data.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan atau server belum merespons.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm max-w-lg mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-2">Import Data Siswa</h2>
      <p className="text-sm text-gray-500 mb-4">
        Unggah file berformat <b>.xlsx</b> yang berisi kolom: Nama, NIS, Kelas, dan Password.
      </p>

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <button 
          type="submit" 
          disabled={!file || loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <UploadCloud className="w-5 h-5" />
          {loading ? "Memproses Data..." : "Unggah Excel"}
        </button>
      </form>

      {message && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-start gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
