(() => {
  const API_BASE = "https://bbcr-lottery.onrender.com";

  const termMain = document.getElementById("termMain");
  const termArt  = document.getElementById("termArt");
  if (!termMain || !termArt) return;

  let timer = null;
  let frame = 0;
  let lastState = null;
  let cursorOn = true;

  function withCursor(text) {
    return text + (cursorOn ? "|" : " ");
  }

  // Blink cursor
  setInterval(() => { cursorOn = !cursorOn; }, 500);

  // Your bottom-right ASCII art panel (exactly as you sent)
  const IDLE_ART =
`⢻⣿⡗⢶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     ⣀⣀
⠀⢻⣇⠀⠈⠙⠳⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠛⠋⢻⣹⣿⡿
⠀⠀⠹⣆⠀⠀⠀⠀⠙⢷⣄⣀⣀⣀⣤⣤⣤⣄⣀⣴⠞⠋⠉⠀⠀⠀⢀⣿⡟⠁
⠀⠀⠀⠙⢷⡀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀
⠀⠀⠀⠀⠈⠻⡶⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣠⡾⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⠃⠀⢠⠒⣆⠀⠀⠀⠀⠀⠀⢠⢲⣄⠀⠀⠀⢻⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⡏⠀⠀⠈⠛⠋⠀⢀⣀⡀⠀⠀⠘⠛⠃⠀⠀⠀⠈⣿⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⡟⠛⢳⠀⠀⠀⠀⠀⣉⣀⠀⠀⠀⠀⣰⢛⠙⣶⠀⢹⣇⠀⠀⠀⠀
⠀⠀⠀⠀⢿⡗⠛⠋⠀⠀⠀⠀⣾⠋⠀⢱⠀⠀⠀⠘⠲⠗⠋⠀⠈⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠘⢷⡀⠀⠀⠀⠀⠀⠈⠓⠒⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣧⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠁⠀`;

  // Frames define what appears bottom-left, and what appears bottom-right
  const FRAMES = {
    IDLE: [
      () => ({
        main: withCursor("COMMIT://LOTTERY_PROTOCOL v1.0...  IDLE STATE... "),
        art: IDLE_ART
      }),
      () => ({
        main: withCursor("COMMIT://LOTTERY_PROTOCOL v1.0...  IDLE STATE... "),
        art: IDLE_ART
      })
    ],

    SNAPSHOT_TAKEN: [
      {
        main:
`COMMIT://LOTTERY_PROTOCOL v1.0...  SNAPSHOT

HOLDERS FROZEN.
AWAITING COMMIT START.`,
        art: "" // clear bottom-right panel in non-idle
      }
    ],

    COMMIT: [
      {
        main:
`COMMIT://LOTTERY_PROTOCOL v1.0...  COMMIT

COMMIT WINDOW OPEN.
LOCKING HASHES...`,
        art: ""
      }
    ],

    REVEAL: [
      {
        main:
`COMMIT://LOTTERY_PROTOCOL v1.0...  REVEAL

VERIFYING SECRETS...
CALCULATING ENTROPY...`,
        art: ""
      }
    ],

    FINALIZED: [
      {
        main:
`COMMIT://LOTTERY_PROTOCOL v1.0...  FINALIZED

WINNER DERIVED.
PROOF VERIFIED.`,
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
    const out = (typeof f === "function") ? f() : f;
    termMain.textContent = out.main || "";
    termArt.textContent  = out.art  || "";
  }

  function play(state) {
    stop();
    const frames = FRAMES[state] || [{
      main: "COMMIT://LOTTERY_PROTOCOL v1.0...  UNKNOWN STATE",
      art: ""
    }];

    renderFrame(frames[0]);

    timer = setInterval(() => {
      renderFrame(frames[frame % frames.length]);
      frame++;
    }, 650);
  }

  async function fetchState() {
    const res = await fetch(`${API_BASE}/api/public/state`, { cache: "no-store" });
    if (!res.ok) throw new Error("state fetch failed");
    return res.json();
  }

  async function tick() {
    try {
      const data = await fetchState();
      const state = data.round_state;

      if (state !== lastState) {
        lastState = state;
        play(state);
      }

      // keep cursor blinking even without state changes on IDLE
      if (state === "IDLE") {
        // force refresh the current frame to update cursor
        const frames = FRAMES.IDLE;
        renderFrame(frames[frame % frames.length]);
      }
    } catch {
      stop();
      termMain.textContent =
`COMMIT://LOTTERY_PROTOCOL v1.0...
OFFLINE
STATE ENDPOINT UNREACHABLE.`;
      termArt.textContent = "";
    }
  }

  tick();
  setInterval(tick, 5000);
})();
