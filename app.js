// 1) Set your backend base URL here (single source of truth)
const API_BASE = "https://bbcr-lottery.onrender.com";

/* ---------------------------
   Small helpers
---------------------------- */
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ---------------------------
   Round UI helpers
---------------------------- */
function setRoundUpdatedNow() {
  const el = document.getElementById("round-updated");
  if (el) el.textContent = new Date().toLocaleString();
}

function setRoundPill(status) {
  const pill = document.getElementById("round-pill");
  if (!pill) return;

  pill.classList.remove("pill--ok", "pill--bad", "pill--loading");

  // You can expand these statuses later.
  if (status === "open") {
    pill.classList.add("pill--ok");
    pill.textContent = "Open";
  } else if (status === "revealed") {
    pill.classList.add("pill--ok");
    pill.textContent = "Revealed";
  } else if (status) {
    pill.classList.add("pill--loading");
    pill.textContent = status; // shows whatever backend returns
  } else {
    pill.classList.add("pill--loading");
    pill.textContent = "Unknown";
  }
}

async function loadCurrentRound() {
  // optional: show we are fetching
  setRoundPill("loading");

  try {
    const res = await fetch(`${API_BASE}/rounds/current`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // If backend returns: { round: null }
    if (!data.round) {
      setRoundPill("No round");
      setText("round-id", "—");
      setText("round-status-text", "—");
      setText("round-started", "—");
      setText("round-message", "No active round found.");
      setRoundUpdatedNow();
      return;
    }

    const r = data.round;

    setText("round-id", String(r.id ?? "—"));
    setText("round-status-text", r.status ?? "—");
    setText(
      "round-started",
      r.created_at ? new Date(r.created_at).toLocaleString() : "—"
    );

    setText("round-message", "Round loaded from backend successfully.");
    setRoundPill(r.status);
    setRoundUpdatedNow();
  } catch (err) {
    setText(
      "round-message",
      "Failed to load round data. Check backend URL or CORS."
    );
    setRoundPill("Offline");
    setRoundUpdatedNow();
  }
}

/* ---------------------------
   System status (health) UI
---------------------------- */
function setPill(state) {
  const pill = document.getElementById("status-pill");
  if (!pill) return;

  pill.classList.remove("pill--ok", "pill--bad", "pill--loading");

  if (state === "ok") {
    pill.classList.add("pill--ok");
    pill.textContent = "Online";
  } else if (state === "bad") {
    pill.classList.add("pill--bad");
    pill.textContent = "Offline";
  } else {
    pill.classList.add("pill--loading");
    pill.textContent = "Checking…";
  }
}

async function checkHealth() {
  setPill("loading");
  setText("api-base", API_BASE);

  try {
    const res = await fetch(`${API_BASE}/health`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (data && data.status === "ok") {
      setPill("ok");
      setText("backend-status", "OK");
    } else {
      setPill("bad");
      setText("backend-status", "Unexpected response");
    }
  } catch (err) {
    setPill("bad");
    setText("backend-status", "Unreachable");
  } finally {
    setText("last-check", new Date().toLocaleString());
  }
}

/* ---------------------------
   Run on load + polling
---------------------------- */
checkHealth();
setInterval(checkHealth, 30000);

loadCurrentRound();
setInterval(loadCurrentRound, 15000);
