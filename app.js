// 1) Set your backend base URL here (single source of truth)
const API_BASE = "https://bbcr-lottery.onrender.com";

// 2) Small helpers
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

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
    // Expecting: { "status": "ok" }
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
    const now = new Date();
    setText("last-check", now.toLocaleString());
  }
}

// Run once on load, then every 30 seconds
checkHealth();
setInterval(checkHealth, 30000);
