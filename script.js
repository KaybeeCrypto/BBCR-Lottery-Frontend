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

  let lastData = null;
  let consecutiveFailures = 0;
  let timer = null;
  let idleTimer = null;
  let frame = 0;
  let lastState = null;
  let hasRenderedOnce = false;
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
  function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


  // Blink cursor (single stable timer)
  setInterval(() => {
    cursorOn = !cursorOn;
  }, 500);

  // ASCII ART FRAMES
  const IDLE_ART_1 =










`⢻⣿⡗⢶⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀     ⣀⣀
⠀⢻⣇⠀⠈⠙⠳⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⠶⠛⠋⢻⣹⣿⡿
⠀⠀⠹⣆⠀⠀⠀⠀⠙⢷⣄⣀⣀⣀⣤⣤⣤⣄⣀⣴⠞⠋⠉⠀⠀⢀⣿⡟⠁
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
⠀⠀⠹⣆⠀⠀⠀⠀⠙⢷⣄⣀⣀⣀⣤⣤⣤⣄⣀⣴⠞⠋⠉⠀⠀⢀⣿⡟⠁
⠀⠀⠀⠙⢷⡀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡾⠋⠀⠀
⠀⠀⠀⠀⠈⠻⡶⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣠⡾⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⠃⠀⢠⠒⣆⠀⠀⠀⠀⠀⠀⢠⢲⣄⠀⠀⠀⢻⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⡏⠀⠀⠈⠛⠋⠀⢀⣀⡀⠀⠀⠘⠛⠃⠀⠀⠀⠈⣿⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⡟⠛⢳⠀⠀⠀⠀⣀⣉⣀⣀⠀⠀⣰⠛⠙⣶⠀ ⢹⣇⠀⠀⠀⠀
⠀⠀⠀⠀⢿⡗⠛⠋⠀⠀⠀⠀⣿⠋⠀ ⡇⠀⠘⠲⠗⠋⠀ ⠈⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠘⢷⡀⠀⠀⠀⠀⠀⠈⠓⠒⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡇⠀⠀⠀
⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣧⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠉⠁⠀⠀`;


const COMMIT_LOCK_OPEN =









`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣤⣤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⠟⠋⠁⠀⠀⠈⠙⠻⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢠⣿⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⡇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⠛⠉⠉⠛⣿⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⡶⠀⠀⢶⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⢹⣿⣿⣿⣿⣿⡿⠋⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠛⢿⣿⣿⣶⣶⣶⣶⣶⣶⣿⣿⡿⠛⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠛⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`;

const COMMIT_LOCK_CLOSED =









`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣤⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣰⣿⣿⣿⠟⠉⠀⠀⠀⠈⠙⠿⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢰⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣸⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⡇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⡇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⡀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠉⠉⠛⣿⣿⣿⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⡶⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⡿⠃⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠛⢿⣿⣿⣶⣶⣶⣶⣶⣾⣿⣿⠿⠛⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠙⠛⠛⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`;


const SNAP_CAM_1 =









`
     ⠀⠀⠀⠀⠀⠀⠀⢠⠶⣞⡩⠽⢷⣆⣀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣀⡤⢿⠀⢹⠖⠒⡛⠧⠐⠉⣧⠀⠀⠀⠀
⠀⢀⡠⠴⣲⣭⡁⠲⠇⢈⡑⢚⠪⠭⠤⠤⢄⣀⣿⠀⠀⠀⠀
⢠⠃⠤⠄⠉⠉⠀⠐⠉⣡⠞⠁⢀⡴⠞⠉⢉⣩⠿⠶⠤⣄⠀
⢸⠀⠀⠀⠀⡄⠀⠀⣰⠃⠀⢠⡞⠀⠀⡴⢋⣴⣿⣿⣷⡘⣆
⢸⠀⠀⠀⠀⡇⠀⠀⡏⠀⠀⣾⠀⠀⡜⢀⣾⣿⣤⣾⣿⡇⣿
⢨⠀⠀⠀⠀⡇⠀⠀⣇⠀⠀⡏⠀⠀⡇⢸⣿⣿⣿⣿⣿⢁⡏
⠈⠀⣀⠀⠀⣷⠀⠀⠘⢄⠀⢳⠀⠀⡇⠸⣿⣿⣹⡿⢃⡼⠁
⢰⡀⠛⠓⠀⢻⠀⠀⠀⠀⢙⣻⡷⠦⣼⣦⣈⣉⣡⡴⠚⠀⠀
⠀⢷⣄⡀⠀⠀⠀⢀⡠⠖⠋⠀⠀⠀⠀⠀⠉⠉⠁⠀⠀⠀⠀
⠀⠀⠉⠛⠓⠒⠚⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`;

const SNAP_CAM_2 =









`
     ⠀⠀⠀⠀⠀⠀⠀⢠⠶⣞⡩⠽⢷⣆⣀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣀⡤⢿⠀⢹⠖⠒⡛⠧⠐⠉⣧⠀⠀⠀⠀
⠀⢀⡠⠴⣲⣭⡁⠲⠇⢈⡑⢚⠪⠭⠤⠤⢄⣀⣿⠀⠀⠀⠀
⢠⠃⠤⠄⠉⠉⠀⠐⠉⣡⠞⠁⢀⡴⠞⠉⢉⣩⠿⠶⠤⣄⠀
⢸⠀⠀⠀⠀⡄⠀⠀⣰⠃⠀⢠⡞⠀⠀⡴⢋⣴⣿⣿⣷⡘⣆
⢸⠀⠀⠀⠀⡇⠀⠀⡏⠀⠀⣾⠀⠀⡜⢀⣾⣿⣤⣾⣿⡇⣿
⢨⠀⠀⠀⠀⡇⠀⠀⣇⠀⠀⡏⠀⠀⡇⢸⣿⣿⣿⣿⣿⢁⡏
⠈⠀⣀⠀⠀⣷⠀⠀⠘⢄⠀⢳⠀⠀⡇⠸⣿⣿⣹⡿⢃⡼⠁
⢰⡀⠛⠓⠀⢻⠀⠀⠀⠀⢙⣻⡷⠦⣼⣦⣈⣉⣡⡴⠚⠀⠀
⠀⢷⣄⡀⠀⠀⠀⢀⡠⠖⠋⠀⠀⠀⠀⠀⠉⠉⠁⠀⠀⠀⠀
⠀⠀⠉⠛⠓⠒⠚⠉⠀⠀⠀⠀⠀  ✦⠀⠀⠀⠀⠀⠀⠀⠀⠀
`;

const REVEAL_ART =









`

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡀⡀⠀⣠⠐⠒⢣⣀⡰⠃⠀⢼⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡀⠀⢠⢔⠒⠲⣀⣠⠃⠀⠀⢙⠒⠡⠤⣈⣂⣀⣤⣿⡇⢹⠀⠀
⠀⠀⠀⠀⠀⠀⢠⠤⠖⢢⡀⢠⠏⠀⡄⣑⡒⠃⠀⠪⣂⣀⡠⠬⠴⠒⢲⣿⡿⢉⣉⡀⠤⢾⡿⡇⢻⠀⠀
⣖⠈⣉⠓⠦⠼⢉⠊⠀⠀⣁⣐⣤⠭⠽⢶⠒⠉⢉⠁⢀⣿⣀⣶⠂⢀⣾⢙⣯⡤⠤⠒⠒⣨⣿⡇⢽⠀⠀
⣗⠸⣾⣭⡤⠖⠒⠚⢉⣽⣧⣀⣤⠆⢀⣾⣗⣾⠋⠀⡾⣿⣿⣇⣠⣼⡾⠯⢗⣒⣲⣭⣭⣟⣗⡇⣸⠀⠀
⢮⠀⣿⣟⠒⠒⣈⣉⠽⣿⣼⡿⣁⣀⣾⣿⣯⠯⠶⣒⣛⣯⣭⠽⣶⠒⢺⠉⠉⠉⠀⣀⣿⣳⢣⡞⠁⠀⠀
⢰⠆⣯⣟⣋⣉⣤⠤⠴⣟⣛⣻⣭⡭⠷⢶⡾⠛⢹⡉⠈⠙⠁⠀⢹⠀⢸⡷⣿⠀⢸⣯⣿⡜⠉⠳⣤⠀⠀
⢸⠃⢗⣯⡭⠗⠒⠚⡟⠉⡁⠀⠀⢷⠀⢀⠁⣀⠀⣇⠀⣦⣼⡇⢸⡇⠀⣿⢹⣄⣤⣟⠝⣳⡆⠀⣱⠀⠀
⠈⠙⢮⢹⡇⠀⣦⣴⣿⠀⢀⣰⠄⢸⡄⠸⡟⣿⣀⣻⣀⣿⠮⣷⣒⣟⣽⢭⡼⣞⣿⣿⣗⣿⢽⠀⢾⠀⠀
⢀⣰⢺⢾⣇⠀⠛⠓⢻⣧⣀⣠⡤⢾⣓⣖⠷⠧⣗⣛⡛⣛⢛⠻⢿⣿⡋⠀⡽⣿⡛⠈⣻⣿⣯⠀⠹⡀⠀
⠨⣗⢀⡿⣻⣗⣚⣫⣭⡿⣶⣿⣻⢟⣩⣖⣋⡉⠤⠤⠒⣷⡓⠸⢈⢻⣾⡷⡿⠻⣿⣾⢃⣂⢻⣇⢐⡇⠀
⠀⡧⠘⣿⡯⣼⣏⢹⠿⣄⡴⢻⡇⠋⠻⡵⠖⢒⣈⣉⡥⠜⢋⢀⣾⠊⣮⣿⣳⣺⣿⣷⠸⠁⣄⠿⡄⢷⠀
⠀⢸⡁⣸⣟⡿⠛⠙⠉⠛⠫⢞⣧⡆⣤⢩⢉⠉⠀⢀⣂⡬⠞⣪⢅⡎⠈⣿⡟⠉⠹⡇⣧⡴⠽⣧⡇⣹⡄
⠀⠸⡆⢸⡇⠤⣀⠠⠀⠀⣀⠤⣳⢨⣭⢛⣪⠩⠉⢁⣀⡼⠼⠚⢍⣆⡴⠋⠉⢸⣖⡷⣿⣦⢸⣳⡟⢀⣇
⠀⠀⣯⠈⣰⡩⢕⣊⠅⠈⡢⢕⣪⡇⡍⢩⢉⢩⢉⠁⢀⣜⣼⣼⣾⣟⣭⡷⠶⠛⠓⠏⢉⠝⡛⠋⠐⢠⠾
⠀⠀⢸⣁⠹⢽⣣⠶⣭⣭⣶⢻⣧⡿⣵⢿⣺⣚⠿⠭⠝⠒⠚⠉⠉⠀⠀⠀⣠⠤⣄⣀⡰⠟⠙⠓⠒⠋⠀
⠀⠀⠈⣗⡐⢿⣻⣶⣻⡵⠿⠿⠛⠛⠍⠉⠁⠄⣠⢤⡀⠀⣀⡼⠙⠳⠔⠒⠋⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢹⣅⠜⠛⠉⣀⠀⠀⠀⢰⠖⠷⠤⠤⠼⠁⠀⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠈⡗⣈⣀⡞⠉⠻⠒⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`;


const FINALIZE_ART =









`

⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢐⣤⣼⣿⣿⣿⣿⣿⣿⣷⣶⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣢⣾⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⡟⠛⢻⠉⡉⠍⠁⠁⠀⠈⠙⢻⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠏⢠⢀⡼⡄⠃⠤⠀⠀⠀⠀⠀⡐⠸⣿⣿⣿⣿⣿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⢰⣸⡎⣀⣷⣤⣶⣶⣶⣦⡀⠀⠈⠓⢿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣇⣤⣯⣿⣿⣿⣿⣿⣿⣿⣭⣯⡆⠀⠀⠘⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡿⣻⣿⣿⣼⠀⢹⣿⣿⣿⣿⡿⠋⠁⠀⠀⠀⢘⣿⠙⠡⢽⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢙⣛⣿⣯⠏⠀⢀⣿⣿⣿⣯⣠⡀⠀⠀⠀⢀⣾⡏⠒⢻⣷⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⡟⢘⣏⣺⣤⣬⣭⣼⣿⣿⣯⡉⢻⣦⣌⣦⣾⣿⣿⡚⠾⠿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢹⡼⣿⣿⢼⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⡿⣿⢿⡟⢳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢳⣿⣧⡞⣻⣩⣽⡽⣿⣿⣿⣿⣿⣿⣿⣿⡟⣠⣿⢸⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡿⣇⣬⣿⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⡿⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡛⣿⣄⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢼⡃⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⠁⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠓⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠈⢳⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠿⢿⡟⠻⢿⣿⡷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣍⠓⠲⠤⢤⣄⡀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣇⠀⠈⣿⡏⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠈⠈⢯⡁⠀⠀⠀⠉⠹⠶⢤⣀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣻⠀⢀⠹⣿⡆⠀⢰⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣷⣤⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠴⠚⢩⠀⢸⡄⢹⣿⣦⣸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⣿⣿⣷⣤⡄⠀⢀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠴⠋⡀⣀⣰⣿⠀⠄⠹⣾⣿⣿⡿⣿⠀⢠⣤⣀⣴⣤⣤⡴⠶⠶⠿⠿⠛⠛⠋⠉⠉⣠⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⠞⠁⢀⡱⠏⠉⡟⠃⠀⠀⠀⢸⣿⣿⠇⣿⡴⠾⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡿⠟
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡤⠖⢋⣡⣶⣿⣂⡼⠁⠉⠙⠋⠙⠿⠟⣢⣄⢿⡟⠴⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠈⠀⠀
⠀⠀⠀⢀⣠⠴⠚⠉⠉⠀⠀⠀⠀⠀⣸⡿⠟⠀⠀⠀⠀⠀⠀⠲⣾⡛⣿⣬⡄⠀⠀⠁⠠⣤⠆⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣠⠞⠉⠀⠀⠀⠀⠀⠀⠀⠀⠤⠚⠉⠀⠀⠀⠀⠀⠀⠀⠀⠺⣿⡟⣿⡟⠀⠀⠂⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀
⠞⠁⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢐⡀⡀⣼⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠈⠁⠆⠀⠀⠀
`;




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

  SNAPSHOT: [
  (data) => ({
    main:
      purple("SNAPSHOT TAKEN\n") +
      muted("--------------\n") +
      "HOLDERS " + teal("LOCKED") + "\n\n" +
      "TX: " + solscanLink(data?.snapshot?.snapshot_tx_sig),
    art: SNAP_CAM_1
  }),
  (data) => ({
    main:
      purple("SNAPSHOT TAKEN\n") +
      muted("--------------\n") +
      "HOLDERS " + teal("LOCKED") + "\n\n" +
      "TX: " + solscanLink(data?.snapshot?.snapshot_tx_sig),
    art: SNAP_CAM_2
  })
],



  COMMIT: [
  (data) => ({
    main:
      teal("COMMIT PHASE LIVE\n") +
      muted("-----------------\n") +
      "HASH " + teal("LOCKED") + "\n" +
      "SEED " + muted("HIDDEN") + "\n\n" +
      muted("ENTROPY SEALED"),
    art: COMMIT_LOCK_OPEN
  }),
  (data) => ({
    main:
      teal("COMMIT PHASE LIVE\n") +
      muted("-----------------\n") +
      "HASH " + teal("LOCKED") + "\n" +
      "SEED " + muted("HIDDEN") + "\n\n" +
      muted("ENTROPY SEALED"),
    art: COMMIT_LOCK_CLOSED
  })
],



  REVEAL: [
  (data) => ({
    main:
      teal("REVEAL STARTED\n") +
      muted("--------------\n") +
      "CHECK 1 " + teal("✓") + "\n" +
      "CHECK 2 " + teal("✓") + "\n" +
      "FINAL SEED " + teal("DERIVED") + "\n\n" +
      "TX: " + solscanLink(data?.reveal?.reveal_tx_sig),
    art: REVEAL_ART
  })
],

  FINALIZED: [
  (data) => {
    const winner =
      data?.winner_wallet ??
      data?.finalize?.winner_wallet ??
      data?.finalized?.winner_wallet ??
      null;

    return {
      main:
        purple("ROUND FINALIZED\n") +
        muted("---------------\n") +
        "WINNER:\n" +
        (winner ? teal(short(winner)) : muted("—")) + "\n\n" +
        "🎉 CONGRATS 🎉\n\n" +
        "VERIFY EVERYTHING ON-CHAIN",
      art: FINALIZE_ART
    };
  }
]
};

  function solscanLink(signature) {
    if (!signature) return muted("—");
    const url = `https://solscan.io/tx/${signature}`;
    return `<a href="${url}" target="_blank" style="color:#00ffa3;text-decoration:none">
      ${short(signature)}
    </a>`;
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    frame = 0;
  }

  function renderFrame(f, data) {
    const out = typeof f === "function" ? f(data) : f;
    termMain.innerHTML = out.main || "";
    termArt.textContent = out.art || "";
  }


  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderMeta(data) {
  if (!termMeta) return;

  const state = normalizeState(data?.round_state ?? "UNKNOWN");


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
    `<span class="label">COMMIT_DL:</span> <span class="val">${formatCountdown(commitDeadline)}</span> &nbsp; ` +
    `<span class="label">REVEAL_DL:</span> <span class="val">${formatCountdown(revealDeadline)}</span>`
  }

  function normalizeState(state) {
    if (state === "SNAPSHOT_TAKEN") return "SNAPSHOT";
    return state;
  }
  
  function setArtHeight(px) {
    if (!termArt) return;
    termArt.style.maxHeight = px + "px";
  }

  function play(state) {
     switch (state) {
      case "REVEAL":
        setArtHeight(320);
        break;
      case "FINALIZED":
        setArtHeight(300);
        break;
      default:
        setArtHeight(420);
    }
    
    stop();
    if (idleTimer) {
      clearInterval(idleTimer);
      idleTimer = null;
    }

    const frames = FRAMES[state] || [{
      main: muted("COMMIT://LOTTERY_PROTOCOL v1.0...\n") + purple("UNKNOWN STATE"),
      art: ""
    }];

    renderFrame(frames[0], lastData);

    if (state === "IDLE") {
      frame = 0;
      idleTimer = setInterval(() => {
        frame = (frame + 1) % frames.length;
        renderFrame(frames[frame], lastData);
      }, 650);
      return;
    }

    if (frames.length <= 1) return;

    timer = setInterval(() => {
      frame++;
      if (frame >= frames.length) {
        stop();
        renderFrame(frames[frames.length - 1], lastData);
        return;
      }
      renderFrame(frames[frame], lastData);
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

function formatCountdown(deadlineIso) {
  if (!deadlineIso || !lastData?.server_time) return muted("—");

  const now = new Date(lastData.server_time).getTime();
  const end = new Date(deadlineIso).getTime();
  let diff = Math.floor((end - now) / 1000);

  if (diff <= 0) return purple("ENDED");

  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  return teal(
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  );
}

  
  async function fetchState() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

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
    consecutiveFailures = 0;

    const state = normalizeState(data?.round_state ?? "UNKNOWN");
    lastData = data;

    // 🔹 ALWAYS update top terminal info
    renderMeta(lastData);

    // 🔹 Only restart animations if state changed
    if (!hasRenderedOnce || state !== lastState) {
      lastState = state;
      hasRenderedOnce = true;
      play(state);
    }

  } catch (e) {
    consecutiveFailures++;

    if (consecutiveFailures < 3) return;

    if (termMeta) {
      termMeta.innerHTML =
        pill("PHASE:", muted("CONNECTING")) +
        pill("SNAP:", muted("—")) +
        pill("ROOT:", muted("—")) +
        pill("WIN:", muted("—")) +
        `<br>` +
        muted("BACKEND DOWN OR WAKING UP…");
    }

    termMain.innerHTML =
      muted("COMMIT://LOTTERY_PROTOCOL v1.0...\n") +
      purple("CONNECTING\n") +
      muted("AWAITING BACKEND...");
    termArt.textContent = "";
  }
}




  // initial load
tick();

// poll backend every 1s
setInterval(() => {
  tick();
}, 1000);

})();
