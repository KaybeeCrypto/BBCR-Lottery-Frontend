(() => {
  const API_BASE = "https://bbcr-lottery.onrender.com";
  const terminal = document.getElementById("roundTerminal");
  if (!terminal) return;

  let timer = null;
  let frame = 0;
  let lastState = null;
  let cursorOn = true;

  // How many empty lines to push content to bottom-left
  const PAD_LINES = 18;

  function padBottom(text) {
    return "\n".repeat(PAD_LINES) + text;
  }

  function withCursor(text) {
    return text + (cursorOn ? "|" : " ");
  }

  setInterval(() => {
    cursorOn = !cursorOn;
  }, 500);

  const FRAMES = {
    IDLE: [
      () => padBottom(
        withCursor("COMMIT://LOTTERY_PROTOCOL v1.0...  IDLE STATE... ")
      ),
      () => padBottom(
        withCursor("COMMIT://LOTTERY_PROTOCOL v1.0...  IDLE STATE... ")
      ),
      () => padBottom(
        withCursor("COMMIT://LOTTERY_PROTOCOL v1.0...  IDLE STATE... ")
      )
    ],

    SNAPSHOT_TAKEN: [
      padBottom(
`COMMIT://LOTTERY_PROTOCOL v1.0...  SNAPSHOT

HOLDERS FROZEN.
AWAITING COMMIT START.`
      )
    ],

    COMMIT: [
      padBottom(
`COMMIT://LOTTERY_PROTOCOL v1.0...  COMMIT

COMMIT WINDOW OPEN.
LOCKING HASHES...`
      )
    ],

    REVEAL: [
      padBottom(
`COMMIT://LOTTERY_PROTOCOL v1.0...  REVEAL

VERIFYING SECRETS...
CALCULATING ENTROPY...`
      )
    ],

    FINALIZED: [
      padBottom(
`COMMIT://LOTTERY_PROTOCOL v1.0...  FINALIZED

WINNER DERIVED.
PROOF VERIFIED.`
      )
    ]
  };

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    frame = 0;
  }

  function play(state) {
    stop();
    const frames = FRAMES[state] || [
      padBottom("COMMIT://LOTTERY_PROTOCOL v1.0...  UNKNOWN STATE")
    ];

    timer = setInterval(() => {
      const f = frames[frame % frames.length];
      terminal.textContent = typeof f === "function" ? f() : f;
      frame++;
    }, 650);
  }

  async function fetchState() {
    const res = await fetch(`${API_BASE}/api/public/state`, {
      cache: "no-store"
    });
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
    } catch {
      stop();
      terminal.textContent = padBottom(
        "COMMIT://LOTTERY_PROTOCOL v1.0...\nOFFLINE\nSTATE ENDPOINT UNREACHABLE."
      );
    }
  }

  tick();
  setInterval(tick, 5000);
})();
