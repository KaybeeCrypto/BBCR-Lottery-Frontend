(() => {
  const API_BASE = "https://bbcr-lottery.onrender.com";

  const termMain = document.getElementById("termMain");
  const termArt  = document.getElementById("termArt");
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

  const IDLE_ART_2 =
`⢻⣿⡗⢶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     ⣀⣀
⠀⢻⣇⠀⠈⠙⠳⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠛⠋⢻⣹⣿⡿
⠀⠀⠹⣆⠀⠀⠀⠀⠙⢷⣄⣀⣀⣀⣤⣤⣤⣄⣀⣴⠞⠋⠉⠀⠀⠀⢀⣿⡟⠁
⠀⠀⠀⠙⢷⡀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀
⠀⠀⠀⠀⠈⠻⡶⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣠⡾⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⠃⠀⢠⠒⣆⠀⠀⠀⠀⠀⠀⢠⢲⣄⠀⠀⠀⢻⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⡏⠀⠀⠈⠛⠋⠀⢀⣀⡀⠀⠀⠘⠛⠃⠀⠀⠀⠈⣿⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⡟⠛⢳⠀⠀⠀⠀⣀⣉⣀⣀⠀⠀⣰⠛⠙⣶⠀⢹⣇⠀⠀⠀⠀
⠀⠀⠀⠀⢿⡗⠛⠋⠀⠀⠀⠀⣿⠋⠀⡇⠀⠀⠘⠲⠗⠋⠀⠈⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠘⢷⡀⠀⠀⠀⠀⠀⠈⠓⠒⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣧⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠁⠀⠀`;

  // STATE FRAMES
  const FRAMES = {
    IDLE: [
      () => ({
        main: withCursor(
          muted("COMMIT://LOTTERY_PROTOCOL v1.0...") +
          teal("  IDLE STATE... ")
        ),
        art: IDLE_ART_1
      }),
      () => ({
        main: withCursor(
          muted("COMMIT://LOTTERY_PROTOCOL v1.0...") +
          teal("  IDLE STATE... ")
        ),
        art: IDLE_ART_2
      })
    ],

    SNAPSHOT_TAKEN: [
      {
        main:
          muted("COMMIT://LOTTERY_PROTOCOL v1.0... ") +
          purple("SNAPSHOT\n\n") +
          "HOLDERS FROZEN.\n" +
          muted("AWAITING COMMIT START."),
        art: ""
      }
    ],

    COMMIT: [
      {
        main:
          muted("COMMIT://LOTTERY_PROTOCOL v1.0... ") +
          teal("COMMIT\n\n") +
          "COMMIT WINDOW OPEN.\n" +
          teal("LOCKING HASHES..."),
        art: ""
      }
    ],

    REVEAL: [
      {
        main:
          muted("COMMIT://LOTTERY_PROTOCOL v1.0... ") +
          teal("REVEAL\n\n") +
          "VERIFYING SECRETS...\n" +
          muted("CALCULATING ENTROPY..."),
        art: ""
      }
    ],

    FINALIZED: [
      {
        main:
          muted("COMMIT://LOTTERY_PROTOCOL v1.0... ") +
          purple("FINALIZED\n\n") +
          "WINNER DERIVED.\n" +
          purple("PROOF VERIFIED."),
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

  function play(state) {
    stop();
    const frames = FRAMES[state] || [
      {
        main: muted("COMMIT://LOTTERY_PROTOCOL v1.0... UNKNOWN STATE"),
        art: ""
      }
    ];

    renderFrame(frames[0]);

    timer = setInterval(() => {
      renderFrame(frames[frame % frames.length]);
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

      if (state === "IDLE") {
        const frames = FRAMES.IDLE;
        renderFrame(frames[frame % frames.length]);
      }
    } catch {
      stop();
      termMain.innerHTML =
        muted("COMMIT://LOTTERY_PROTOCOL v1.0...\n") +
        purple("OFFLINE\n") +
        muted("STATE ENDPOINT UNREACHABLE.");
      termArt.textContent = "";
    }
  }

  tick();
  setInterval(tick, 5000);
})();
