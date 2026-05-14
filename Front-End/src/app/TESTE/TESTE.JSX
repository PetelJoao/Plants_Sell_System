"use client"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import  {supabase}  from '@/services/supabase'

import { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000/api";

// ── helpers ──────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ── api calls ─────────────────────────────────────────────────────────────────
async function fetchPlants() {
  const res = await fetch(`${API}/dashboard/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Erro ao carregar plantas");
  return res.json();
}

async function savePlant(userId, formData) {
  const res = await fetch(`${API}/dashboard/${userId}`, {
    method: "POST",
    headers: authHeaders(), // NÃO inclua Content-Type — o browser define multipart automaticamente
    body: formData,
  });
  if (!res.ok) throw new Error("Erro ao cadastrar planta");
  return res.json();
}

async function deletePlant(plantId) {
  const res = await fetch(`${API}/dashboard/DeletarPlanta/${plantId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao deletar planta");
  return res.json();
}

// ── login (simplificado) ──────────────────────────────────────────────────────
async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Credenciais inválidas");
  return res.json(); // espera { access_token, user_id, ... }
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTES
// ═════════════════════════════════════════════════════════════════════════════

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_id", data.user_id ?? data.id ?? "");
      onLogin();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <span style={styles.loginLeaf}>🌿</span>
        <h1 style={styles.loginTitle}>PlantSell</h1>
        <p style={styles.loginSub}>Acesse sua conta</p>

        <input
          style={styles.input}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        {error && <p style={styles.errorText}>{error}</p>}

        <button style={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function PlantCard({ plant, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const img = plant.imagens?.[0] ?? plant.plantas_arquivo ?? null;

  return (
    <div style={styles.card}>
      {img && (
        <img
          src={img}
          alt={plant.nome}
          style={styles.cardImg}
          onError={(e) => (e.target.style.display = "none")}
        />
      )}
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{plant.nome}</h3>
        {plant.descricao && <p style={styles.cardDesc}>{plant.descricao}</p>}
        <div style={styles.cardMeta}>
          {plant.dimensao && <span style={styles.tag}>📐 {plant.dimensao} m²</span>}
          {plant.orcamento != null && (
            <span style={{ ...styles.tag, ...styles.tagGreen }}>
              R$ {Number(plant.orcamento).toFixed(2)}
            </span>
          )}
        </div>
      </div>
      <div style={styles.cardFooter}>
        {!confirming ? (
          <button style={styles.btnDanger} onClick={() => setConfirming(true)}>
            Deletar
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button style={styles.btnDangerSolid} onClick={() => onDelete(plant.id)}>
              Confirmar
            </button>
            <button style={styles.btnSecondary} onClick={() => setConfirming(false)}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function UploadModal({ userId, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (!title || !file) {
      setError("Título e imagem são obrigatórios.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // ✅ FormData — a única forma correta de enviar arquivo + campos juntos
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("squareFeet", squareFeet);
      fd.append("price", price || "0");
      fd.append("file", file);

      await savePlant(userId, fd);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>🌱 Nova Planta</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.modalBody}>
          {/* Preview de imagem */}
          <div style={styles.imageZone} onClick={() => fileRef.current.click()}>
            {preview ? (
              <img src={preview} alt="preview" style={styles.previewImg} />
            ) : (
              <div style={styles.imagePlaceholder}>
                <span style={{ fontSize: 32 }}>📷</span>
                <span style={{ fontSize: 13, color: "#8a9b7c" }}>Clique para selecionar imagem</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFile}
            />
          </div>

          <div style={styles.formGrid}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={styles.label}>Título *</label>
              <input
                style={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Samambaia Imperial"
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={styles.label}>Descrição</label>
              <textarea
                style={{ ...styles.input, height: 72, resize: "vertical" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva a planta..."
              />
            </div>
            <div>
              <label style={styles.label}>Dimensão (m²)</label>
              <input
                style={styles.input}
                value={squareFeet}
                onChange={(e) => setSquareFeet(e.target.value)}
                placeholder="Ex: 1.5"
              />
            </div>
            <div>
              <label style={styles.label}>Preço (R$)</label>
              <input
                style={styles.input}
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {error && <p style={styles.errorText}>{error}</p>}
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btnSecondary} onClick={onClose}>Cancelar</button>
          <button style={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar Planta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════

function Dashboard({ onLogout }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const userId = localStorage.getItem("user_id");

  async function loadPlants() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPlants();
      setPlants(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(plantId) {
    try {
      await deletePlant(plantId);
      setPlants((prev) => prev.filter((p) => p.id !== plantId));
    } catch (e) {
      alert("Erro ao deletar: " + e.message);
    }
  }

  useEffect(() => { loadPlants(); }, []);

  const filtered = plants.filter((p) =>
    p.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>🌿 PlantSell</div>
        <nav style={styles.nav}>
          <div style={styles.navItem}>🏠 Dashboard</div>
          <div style={{ ...styles.navItem, opacity: 0.5 }}>👤 Perfil</div>
          <div style={{ ...styles.navItem, opacity: 0.5 }}>📦 Pedidos</div>
        </nav>
        <button style={styles.logoutBtn} onClick={onLogout}>Sair →</button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Minhas Plantas</h1>
            <p style={styles.pageSub}>{plants.length} plantas cadastradas</p>
          </div>
          <button style={styles.btnPrimary} onClick={() => setShowModal(true)}>
            + Nova Planta
          </button>
        </div>

        {/* Search */}
        <input
          style={{ ...styles.input, maxWidth: 340, marginBottom: 28 }}
          placeholder="🔍 Buscar plantas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* States */}
        {loading && <p style={styles.stateText}>Carregando plantas...</p>}
        {error && <p style={styles.errorText}>{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 48 }}>🪴</span>
            <p>Nenhuma planta encontrada.</p>
            <button style={styles.btnPrimary} onClick={() => setShowModal(true)}>
              Cadastrar primeira planta
            </button>
          </div>
        )}

        {/* Grid */}
        <div style={styles.grid}>
          {filtered.map((plant) => (
            <PlantCard key={plant.id} plant={plant} onDelete={handleDelete} />
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <UploadModal
          userId={userId}
          onClose={() => setShowModal(false)}
          onSuccess={loadPlants}
        />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [logged, setLogged] = useState(!!localStorage.getItem("token"));

  function handleLogin() { setLogged(true); }
  function handleLogout() {
    localStorage.clear();
    setLogged(false);
  }

  return logged ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════════

const styles = {
  // Login
  loginWrap: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #1a3322 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Georgia', serif",
  },
  loginCard: {
    background: "#f8f5ef",
    borderRadius: 20,
    padding: "48px 40px",
    width: 360,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  loginLeaf: { fontSize: 36, textAlign: "center" },
  loginTitle: { margin: 0, fontSize: 28, color: "#2d4a2d", textAlign: "center", fontWeight: 700 },
  loginSub: { margin: 0, color: "#8a9b7c", fontSize: 14, textAlign: "center", marginBottom: 8 },

  // Layout
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "#f4f1ea",
    fontFamily: "'Trebuchet MS', sans-serif",
  },
  sidebar: {
    width: 220,
    background: "#1e321e",
    display: "flex",
    flexDirection: "column",
    padding: "32px 20px",
    gap: 8,
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  sidebarLogo: {
    color: "#a8c5a0",
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 32,
    fontFamily: "Georgia, serif",
  },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navItem: {
    color: "#c8dfc0",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    background: "rgba(168,197,160,0.1)",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #4a6a4a",
    color: "#8aaa8a",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    textAlign: "left",
  },
  main: { flex: 1, padding: "40px 48px", overflowY: "auto" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  pageTitle: { margin: 0, fontSize: 28, color: "#1e321e", fontFamily: "Georgia, serif" },
  pageSub: { margin: "4px 0 0", color: "#8a9b7c", fontSize: 14 },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 24,
  },

  // Card
  card: {
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardImg: { width: "100%", height: 180, objectFit: "cover" },
  cardBody: { padding: "16px 16px 8px", flex: 1 },
  cardTitle: { margin: "0 0 6px", fontSize: 16, color: "#1e321e", fontWeight: 700 },
  cardDesc: { margin: "0 0 10px", fontSize: 13, color: "#6b7c6b", lineHeight: 1.5 },
  cardMeta: { display: "flex", gap: 8, flexWrap: "wrap" },
  tag: {
    background: "#f0f5ec",
    color: "#4a6a3a",
    fontSize: 12,
    padding: "3px 10px",
    borderRadius: 99,
    fontWeight: 600,
  },
  tagGreen: { background: "#e0f5e0", color: "#2a5a2a" },
  cardFooter: { padding: "10px 16px 16px" },

  // Inputs
  input: {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid #dde8d0",
    borderRadius: 10,
    fontSize: 14,
    outline: "none",
    background: "#fafff8",
    boxSizing: "border-box",
    color: "#1e321e",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#4a6a3a", marginBottom: 5 },

  // Buttons
  btnPrimary: {
    background: "#2d6a2d",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  btnSecondary: {
    background: "#fff",
    color: "#4a6a3a",
    border: "1.5px solid #c5d8b8",
    borderRadius: 10,
    padding: "11px 22px",
    fontSize: 14,
    cursor: "pointer",
  },
  btnDanger: {
    background: "transparent",
    color: "#b44",
    border: "1.5px solid #e0b0b0",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    width: "100%",
  },
  btnDangerSolid: {
    background: "#b44",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
  },

  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,20,10,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#f8f5ef",
    borderRadius: 20,
    width: "100%",
    maxWidth: 520,
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
    overflow: "hidden",
    boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px 16px",
    borderBottom: "1px solid #e0ddd5",
  },
  modalTitle: { margin: 0, fontSize: 20, color: "#1e321e", fontFamily: "Georgia, serif" },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#888",
    padding: 4,
  },
  modalBody: { padding: "20px 28px", overflowY: "auto" },
  modalFooter: {
    padding: "16px 28px",
    borderTop: "1px solid #e0ddd5",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },

  // Image zone
  imageZone: {
    border: "2px dashed #c5d8b8",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    cursor: "pointer",
    minHeight: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fafff8",
  },
  previewImg: { width: "100%", maxHeight: 220, objectFit: "cover" },
  imagePlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: 24,
    color: "#8a9b7c",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" },

  // States
  stateText: { color: "#4a6a3a", fontSize: 15 },
  errorText: { color: "#b44", fontSize: 13, margin: "4px 0" },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: 60,
    color: "#6b8c6b",
    fontSize: 15,
  },
};