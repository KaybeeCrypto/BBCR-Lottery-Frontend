(() => {
  const API_BASE = "https://bbcr-lottery.onrender.com";
  fetch(`${API_BASE}/health`)
  .then(r => r.json())
  .then(j => console.log("BACKEND OK:", j))
  .catch(e => console.error("BACKEND DOWN:", e));

  const termMain = document.getElementById("termMain");
  const termArt  = document.getElementById("termArt");
  const termMeta = document.getElementById("termMeta");
  if (!termMain || !termArt) return;

  let timer = null;
  let frame = 0;
  let lastState = null;
  let cursorOn = true;

  function withCursor(html) {
    return (
      html +
      `<span style="color: var(--term-muted, rgba(255,255,255,0.6))">${
        cursorOn ? "|" : " "
      }</span>`
    );
  }

  function teal(text) {
    return `<span style="color: var(--sol-teal, #00ffa3)">${text}</span>`;
  }

  function purple(text) {
    return `<span style="color: var(--sol-purple, #dc1fff)">${text}</span>`;
  }

  function muted(text) {
    return `<span style="color: var(--term-muted, rgba(255,255,255,0.6))">${text}</span>`;
  }

  // Blink cursor (single stable timer)
  setInterval(() => {
    cursorOn = !cursorOn;
  }, 500);

  // ASCII ART FRAMES
  const IDLE_ART_1 =










`⢻⣿⡗⢶⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     ⣀⣀
⠀⢻⣇⠀⠈⠙⠳⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠛⠋⢻⣹⣿⡿
⠀⠀⠹⣆⠀⠀⠀⠀⠙⢷⣄⣀⣀⣀⣤⣤⣤⣄⣀⣴⠞⠋⠉⠀⠀⠀⢀⣿⡟⠁
⠀⠀⠀⠙⢷⡀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀
⠀⠀⠀⠀⠈⠻⡶⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣠⡾⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⠃⠀⢠⠒⣆⠀⠀⠀⠀⠀⠀⢠⢲⣄⠀⠀⠀⢻⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⡏⠀⠀⠈⠛⠋⠀⢀⣀⡀⠀⠀⠘⠛⠃⠀⠀⠀⠈⣿⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⡟⠛⢳⠀⠀⠀⠀⠀⣉⣀⠀⠀⠀⠀⣰⠛⠙⣶⠀⢹⣇⠀⠀⠀⠀
⠀⠀⠀⠀⢿⡗⠛⠋⠀⠀⠀⠀⣾⠋⠀⢱⠀⠀⠀⠘⠲⠗⠋⠀⠈⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠘⢷⡀⠀⠀⠀⠀⠀⠈⠓⠒⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣧⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠁⠀`;

  const IDLE_ART_2 =










`⢻⣿⡗⢶⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     ⣀⣀
⠀⢻⣇⠀⠈⠙⠳⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠛⠋⢻⣹⣿⡿
⠀⠀⠹⣆⠀⠀⠀⠀⠙⢷⣄⣀⣀⣀⣤⣤⣤⣄⣀⣴⠞⠋⠉⠀⠀⠀⢀⣿⡟⠁
⠀⠀⠀⠙⢷⡀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀
⠀⠀⠀⠀⠈⠻⡶⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣠⡾⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⠃⠀⢠⠒⣆⠀⠀⠀⠀⠀⠀⢠⢲⣄⠀⠀⠀⢻⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⡏⠀⠀⠈⠛⠋⠀⢀⣀⡀⠀⠀⠘⠛⠃⠀⠀⠀⠈⣿⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⡟⠛⢳⠀⠀⠀⠀⣀⣉⣀⣀⠀⠀⣰⠛⠙⣶⠀ ⢹⣇⠀⠀⠀⠀
⠀⠀⠀⠀⢿⡗⠛⠋⠀⠀⠀⠀⣿⠋⠀ ⡇⠀⠘⠲⠗⠋⠀ ⠈⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠘⢷⡀⠀⠀⠀⠀⠀⠈⠓⠒⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣧⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠁⠀⠀`;

  // STATE FRAMES
  const FRAMES = {
  IDLE: [
    () => ({
      main: withCursor(
        muted("SYSTEM ONLINE\n") +
        muted("----------------\n") +
        "WAITING FOR NEXT ROUND\n" +
        muted("NODE SYNCED • CHAIN ALIVE\n") +
        muted("NEXT MOVE: ") + teal("SNAPSHOT")
      ),
      art: IDLE_ART_1
    }),
    () => ({
      main: withCursor(
        muted("SYSTEM ONLINE\n") +
        muted("----------------\n") +
        "WAITING FOR NEXT ROUND\n" +
        muted("NODE SYNCED • CHAIN ALIVE\n") +
        muted("NEXT MOVE: ") + teal("SNAPSHOT")
      ),
      art: IDLE_ART_2
    })
  ],

  SNAPSHOT_TAKEN: [
    {
      main:
        purple("SNAPSHOT TAKEN\n") +
        muted("--------------\n") +
        "HOLDERS " + teal("LOCKED") + "\n" +
        "NO MORE MOVES\n" +
        muted("\nPROOF IN META PANEL ↑"),
      art: ""
    },
    {
      main:
        purple("SNAPSHOT TAKEN\n") +
        muted("--------------\n") +
        "HOLDERS " + teal("LOCKED") + "\n" +
        "THIS SET IS " + teal("FINAL") + "\n" +
        muted("\nMISS THIS BLOCK = YOU'RE OUT"),
      art: ""
    }
  ],

  COMMIT: [
    {
      main:
        teal("COMMIT PHASE LIVE\n") +
        muted("-----------------\n") +
        "HASH " + teal("LOCKED") + "\n" +
        "SEED " + muted("HIDDEN") + "\n" +
        muted("\nEVEN WE CAN'T SEE IT"),
      art: ""
    },
    {
      main:
        teal("COMMIT PHASE LIVE\n") +
        muted("-----------------\n") +
        "COMMIT HASH: " + teal("SEALED") + "\n" +
        muted("\nCHANGE THIS? ") + purple("IMPOSSIBLE."),
      art: ""
    }
  ],

  REVEAL: [
    {
      main:
        teal("REVEAL STARTED\n") +
        muted("--------------\n") +
        "SECRETS OPENING...\n" +
        muted("HASHES MATCHING..."),
      art: ""
    },
    {
      main:
        teal("REVEAL STARTED\n") +
        muted("--------------\n") +
        "CHECK 1 " + teal("✓") + "\n" +
        "CHECK 2 " + teal("✓") + "\n" +
        muted("DERIVING ENTROPY..."),
      art: ""
    },
    {
      main:
        teal("REVEAL STARTED\n") +
        muted("--------------\n") +
        "CHECK 1 " + teal("✓") + "\n" +
        "CHECK 2 " + teal("✓") + "\n" +
        "FINAL SEED " + teal("DERIVED") + "\n" +
        muted("\nPROOF IN META PANEL ↑"),
      art: ""
    }
  ],

  FINALIZED: [
    {
      main:
        purple("ROUND FINALIZED\n") +
        muted("---------------\n") +
        "WINNER " + purple("LOCKED") + "\n" +
        "NO RE-RUNS\n" +
        muted("\nRUN THIS LOCALLY — SAME RESULT."),
      art: ""
    },
    {
      main:
        purple("ROUND FINALIZED\n") +
        muted("---------------\n") +
        "WINNER " + purple("LOCKED") + "\n" +
        muted("\nDON'T TRUST — ") + teal("VERIFY"),
      art: ""
    }
  ]
};


  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    frame = 0;
  }

  function renderFrame(f) {
    const out = typeof f === "function" ? f() : f;
    termMain.innerHTML = out.main || "";
    termArt.textContent = out.art || "";
  }

  function renderMeta(data) {
  if (!termMeta) return;

  const state = data?.round_state ?? "UNKNOWN";

  // Your backend is moving towards: data.snapshot.{snapshot_id, snapshot_slot, snapshot_root...}
  // But older versions may have flat fields. Support both safely:
  const snap = data?.snapshot ?? {};
  const snapshotId   = snap.snapshot_id   ?? data?.snapshot_id;
  const snapshotSlot = snap.snapshot_slot ?? data?.snapshot_slot;
  const snapshotRoot = snap.snapshot_root ?? data?.snapshot_root ?? data?.snapshot_merkle_root;

  const commitDeadline = data?.commit_deadline;
  const revealDeadline = data?.reveal_deadline;

  const winner = data?.winner_wallet;

  termMeta.innerHTML =
    pill("PHASE:", (state === "FINALIZED" ? purple(state) : teal(state))) +
    pill("SNAP:", snapshotSlot ? teal(esc(snapshotSlot)) : muted("PENDING")) +
    pill("ROOT:", snapshotRoot ? teal(short(esc(snapshotRoot))) : muted("PENDING")) +
    pill("WIN:", winner ? purple(short(esc(winner))) : muted("—")) +
    `<br>` +
    `<span class="label">SNAPSHOT_ID:</span> <span class="val">${snapshotId ? teal(short(esc(snapshotId))) : muted("PENDING")}</span> &nbsp; ` +
    `<span class="label">COMMIT_DL:</span> <span class="val">${commitDeadline ? teal(esc(commitDeadline)) : muted("—")}</span> &nbsp; ` +
    `<span class="label">REVEAL_DL:</span> <span class="val">${revealDeadline ? teal(esc(revealDeadline)) : muted("—")}</span>`;
}

  function play(state) {
  stop();

  const frames = FRAMES[state] || [{
    main: muted("COMMIT://LOTTERY_PROTOCOL v1.0...\n") + purple("UNKNOWN STATE"),
    art: ""
  }];

  // Render first instantly
  renderFrame(frames[0]);

  // IDLE loops forever (good)
  if (state === "IDLE") {
    timer = setInterval(() => {
      renderFrame(frames[frame % frames.length]);
      frame++;
    }, 650);
    return;
  }

  // Non-IDLE: play through frames once, then stop on last frame
  if (frames.length <= 1) return;

  timer = setInterval(() => {
    frame++;
    if (frame >= frames.length) {
      stop();
      renderFrame(frames[frames.length - 1]);
      return;
    }
    renderFrame(frames[frame]);
  }, 650);
}

function short(s, head = 6, tail = 4) {
  s = String(s ?? "");
  if (s.length <= head + tail + 3) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function pill(label, valueHtml) {
  return `<span class="pill"><span class="label">${label}</span> ${valueHtml}</span>`;
}

function valOrPending(v, colorFn = teal) {
  if (!v) return muted("PENDING");
  return colorFn(esc(v));
}

  
  async function fetchState() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${API_BASE}/api/public/state`, {
        cache: "no-store",
        signal: controller.signal
      });

      console.log("STATE RESPONSE STATUS:", res.status);
      console.log("STATE RESPONSE HEADERS:", [...res.headers.entries()]);

      if (!res.ok) {
        throw new Error(`state fetch failed: ${res.status}`);
      }

      return await res.json();
    } finally {
      clearTimeout(timeout);
    }
  }


  async function tick() {
    try {
      const data = await fetchState();
      const state = data.round_state;

      // Always update meta panel
      renderMeta(data);

      if (state !== lastState) {
        lastState = state;
        play(state);
      }

      // IDLE still needs manual frame refresh because you're toggling cursor and using art frames
      if (state === "IDLE") {
        const frames = FRAMES.IDLE;
        renderFrame(frames[frame % frames.length]);
      }
    } catch (e) {
      console.warn("STATE FETCH FAILED:", e);

      if (termMeta) {
        termMeta.innerHTML =
          pill("PHASE:", muted("CONNECTING")) +
          pill("SNAP:", muted("—")) +
          pill("ROOT:", muted("—")) +
          pill("WIN:", muted("—")) +
          `<br>` +
          muted("BACKEND DOWN OR SLEEPING…");
      }

      termMain.innerHTML =
        muted("COMMIT://LOTTERY_PROTOCOL v1.0...\n") +
        purple("CONNECTING\n") +
        muted("AWAITING BACKEND...");
      termArt.textContent = "";
    }
  }


  tick();
  setInterval(tick, 5000);
})();
