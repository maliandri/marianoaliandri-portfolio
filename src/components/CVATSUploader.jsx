import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CVATSUploader() {
  // ---------- estado ----------
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  // ---------- base URL backend ----------
  const BASE = (
    import.meta.env.VITE_ATS_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    ""
  ).replace(/\/+$/, "");
  const endpoint = BASE ? `${BASE}/api/analyze-cv` : `/api/analyze-cv`;

  // ---------- deep link abrir al cargar ----------
  useEffect(() => {
    const path = window.location.pathname || "";
    const q = new URLSearchParams(window.location.search);
    const hash = (window.location.hash || "").replace("#", "");
    if (hash === "ats" || q.get("tool") === "ats" || path.includes("/analizador-ats")) {
      setIsOpen(true);
    }
  }, []);

  // ---------- sync URL open/close ----------
  const openWithUrl = () => {
    setIsOpen(true);
    const url = new URL(window.location.href);
    url.hash = "ats";
    url.searchParams.set("tool", "ats");
    window.history.replaceState({}, "", url.toString());
  };
  const closeAndCleanUrl = () => {
    setIsOpen(false);
    const url = new URL(window.location.href);
    if (url.hash === "#ats") url.hash = "";
    if (url.searchParams.get("tool") === "ats") url.searchParams.delete("tool");
    window.history.replaceState({}, "", url.toString());
  };

  // ---------- upload ----------
  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErr(null);
    setLoading(true);
    setResults(null);
    setShowShare(false);
    setCopied(false);

    try {
      const form = new FormData();
      form.append("cv", file);
      form.append("topN", "5");

      console.log("POST", endpoint);

      const res = await fetch(endpoint, { method: "POST", body: form });

      let data = null, text = "";
      const ct = res.headers.get("content-type") || "";
      try {
        if (ct.includes("application/json")) data = await res.json();
        else text = await res.text();
      } catch {}

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || text || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      if (!data) throw new Error("Respuesta sin JSON del servidor.");

      setResults(data.results || []);
    } catch (e) {
      setErr(e.message || "Error desconocido al analizar el CV.");
    } finally {
      setLoading(false);
    }
  }

  // ---------- compartir ----------
  const best = results?.[0];
  const shareTitle = best
    ? `Mi score ATS: ${best.score}% como ${best.profesion}`
    : "Analizador ATS de CV";
  const shareText = best
    ? `Obtuve ${best.score}% de compatibilidad para ${best.profesion}. Probá tu CV 👇`
    : "Analizá tu CV con este ATS gratuito.";
  const shareUrl = (() => {
    const u = new URL(window.location.href);
    u.hash = "ats";
    u.searchParams.set("tool", "ats");
    return u.toString();
  })();

  async function handleNativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } else {
        setShowShare((s) => !s);
      }
    } catch {
      // usuario canceló
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareText}\n${shareUrl}`)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const xt = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTitle} — ${shareText}`)}&url=${encodeURIComponent(shareUrl)}`;

  // ---------- render ----------
  return (
    <>
      {/* Botón flotante */}
      <motion.button
        onClick={openWithUrl}
        className="fixed bottom-36 left-6 z-40 bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.6 }}
        aria-label="Abrir Analizador ATS"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 3a1 1 0 00-1 1v11.5A1.5 1.5 0 004.5 17H16a1 1 0 001-1V4a1 1 0 00-1-1H4zm1 2h10v10H5V5zm2 2h6v2H7V7zm0 3h6v2H7v-2z"/>
        </svg>
        <span className="font-semibold">Analizador ATS</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAndCleanUrl}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Analizador de CV — ATS</h2>
                    <p className="text-red-100 mt-1">Subí tu PDF/DOCX y obtené score + skills detectadas</p>
                  </div>
                  <button
                    onClick={closeAndCleanUrl}
                    className="text-white hover:text-red-100 transition-colors"
                    aria-label="Cerrar"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-6">
                {/* Upload */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cargá tu CV (PDF/DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFile}
                    className="block w-full text-sm"
                  />
                  <p className="text-xs opacity-70 mt-2">
                    No se guarda el archivo: se procesa en memoria y se descarta.
                  </p>
                </motion.div>

                {/* Estados */}
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analizando tu CV…</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Extrayendo texto y comparando skills</p>
                  </div>
                )}

                {err && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 dark:text-red-400 text-sm whitespace-pre-wrap"
                  >
                    {err}
                  </motion.p>
                )}

                {/* Resultados */}
                {results && !loading && !err && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {results.length === 0 ? (
                      <p className="text-sm opacity-80">No se encontraron coincidencias.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((r, i) => (
                          <div key={i} className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{r.profesion}</h3>
                              <span className="text-sm">
                                Score: <b>{r.score}%</b>
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm opacity-80">
                                Skills encontradas ({r.skills_found?.length ?? 0}/{r.skills_total ?? 0}):{" "}
                                {r.skills_found?.length ? r.skills_found.join(", ") : "—"}
                              </p>
                              <p className="text-sm opacity-80">
                                Skills faltantes:{" "}
                                {r.skills_missing?.length ? r.skills_missing.join(", ") : "—"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 🔹 Barra de acciones: Compartir + Cafecito */}
                    <div className="flex flex-col items-center gap-4 pt-2">
                      {/* Compartir */}
                      <div className="relative">
                        <button
                          onClick={handleNativeShare}
                          className="px-4 py-2 rounded-full border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          Compartir
                        </button>

                        {/* Fallback share */}
                        <AnimatePresence>
                          {showShare && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 w-64 z-50"
                            >
                              <p className="text-xs mb-2 opacity-70">
                                Compartí tu resultado:
                              </p>
                              <div className="flex items-center justify-between gap-2">
                                <a href={wa} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded-full bg-green-500 text-white hover:opacity-90">WhatsApp</a>
                                <a href={li} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded-full bg-blue-600 text-white hover:opacity-90">LinkedIn</a>
                                <a href={xt} target="_blank" rel="noopener noreferrer" className="text-sm px-3 py-1 rounded-full bg-gray-900 text-white hover:opacity-90">X</a>
                              </div>
                              <div className="mt-3">
                                <button
                                  onClick={handleCopyLink}
                                  className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                  {copied ? "¡Copiado!" : "Copiar enlace"}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Cafecito */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-center"
                      >
                        <a
                          href="https://cafecito.app/marianoaliandri"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="inline-block"
                        >
                          <img
                            srcSet="https://cdn.cafecito.app/imgs/buttons/button_2.png 1x, https://cdn.cafecito.app/imgs/buttons/button_2_2x.png 2x, https://cdn.cafecito.app/imgs/buttons/button_2_3.75x.png 3.75x"
                            src="https://cdn.cafecito.app/imgs/buttons/button_2.png"
                            alt="Invitame un café en cafecito.app"
                            className="mx-auto"
                          />
                        </a>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
