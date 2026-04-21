"use strict";

const express = require("express");
const app = express();
app.use(express.json({ limit: "10mb" }));

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
const PORT       = process.env.PORT || 3003;
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_KEY) console.warn("WARNING: GEMINI_API_KEY not set");
else console.log("GEMINI_API_KEY is set (" + GEMINI_KEY.slice(0, 12) + "...)");

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true, gemini: !!GEMINI_KEY }));

// ── Generate meme: Gemini writes the concept + generates the image ────────────
app.post("/api/generate", async (_req, res) => {
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured on server. Add it in Railway Variables." });

  try {
    const r = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: MEME_PROMPT }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
      })
    });

    const b = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ error: "Gemini error " + r.status + ": " + (b?.error?.message || "") });
    }

    const parts = b?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData);
    const textPart = parts.find(p => p.text);

    if (!imgPart) {
      return res.status(422).json({ error: "Gemini returned no image. It may have refused the prompt — try again." });
    }

    return res.json({
      mimeType: imgPart.inlineData.mimeType,
      data: imgPart.inlineData.data,
      description: textPart ? textPart.text : ""
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── The meme prompt ───────────────────────────────────────────────────────────
const MEME_PROMPT = `You are an absurdist meme creator. Generate a funny meme IMAGE featuring Indian Bollywood actor Kunal Khemu (known for Go Goa Gone, Dhol, Kalank).

The Kunal Khemu meme format: he is aggressively inserted into contexts where he clearly doesn't belong. The humor is deadpan, low-effort edit aesthetic, and treats him as universally important for no reason.

Pick ONE of these meme types randomly and generate the image:
- Evolution of man silhouettes but the final evolved form is Kunal Khemu smiling
- Dark dramatic background with a fake philosophical quote attributed to "— Kunal Khemu"
- A famous person's family tree where every single node/face is Kunal Khemu
- Breaking news TV broadcast screenshot with Kunal Khemu as the expert source
- Kunal Khemu's face multiplying exponentially (1→2→4→8→16) filling the frame
- Mount Rushmore but all four presidential faces replaced with Kunal Khemu
- The Last Supper painting but every person at the table is Kunal Khemu
- Solar system diagram where every planet is Kunal Khemu's smiling face
- School class photo where every student and teacher is Kunal Khemu
- Currency note with Kunal Khemu's face instead of the national leader
- TIME Magazine "Person of the Year" cover featuring Kunal Khemu
- Museum gallery where every painting on the wall is a portrait of Kunal Khemu
- Movie poster for a blockbuster but every cast member is Kunal Khemu
- A "Wanted" poster with Kunal Khemu wanted for "being too inevitable"

Generate the meme image now. Make it look like a low-effort internet meme — obvious edits, absurd, deadpan funny. Also include a short funny description of what you made.`;

// ── Serve frontend ────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(getHTML());
});

app.listen(PORT, () => console.log("Kunal Khemu Meme Generator running on port " + PORT));

// ═══════════════════════════════════════════════════════════════════════════════
// HTML
// ═══════════════════════════════════════════════════════════════════════════════
function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Kunal Khemu Meme Generator</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0f;
  --card:#14141f;
  --border:#1e1e32;
  --text:#f0f0f5;
  --muted:#6b6b8a;
  --accent:#f97316;
  --accent2:#8b5cf6;
  --danger:#ef4444;
}
body{background:var(--bg);color:var(--text);font-family:'Space Grotesk',system-ui,sans-serif;min-height:100vh;display:flex;justify-content:center;padding:24px 16px}
.app{max-width:580px;width:100%}
h1{font-size:28px;font-weight:700;margin-bottom:4px;letter-spacing:-0.02em}
h1 span{font-size:13px;font-weight:400;color:var(--accent);vertical-align:middle;margin-left:8px;padding:3px 10px;border:1px solid var(--accent);border-radius:20px}
.sub{font-size:13px;color:var(--muted);margin-bottom:28px;line-height:1.5}
.row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
button{font-family:inherit;cursor:pointer;border:none;border-radius:10px;font-size:14px;font-weight:600;padding:12px 28px;transition:all .15s}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:#ea580c}
.btn-primary:disabled{opacity:0.35;cursor:not-allowed}
.btn-secondary{background:transparent;border:1px solid var(--border);color:var(--text);padding:12px 20px}
.btn-secondary:hover{border-color:var(--muted)}
.status{font-size:13px;color:var(--accent2);margin-bottom:12px;min-height:20px}
.error{font-size:13px;color:var(--danger);background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);padding:10px 14px;border-radius:10px;margin-bottom:12px}
.img-wrap{border-radius:14px;overflow:hidden;border:1px solid var(--border);margin-bottom:16px;background:var(--card)}
.img-wrap img{display:block;width:100%}
.desc{font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.5;font-style:italic}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid var(--border);font-size:11px;color:var(--muted);text-align:center}
</style>
</head>
<body>
<div class="app">
  <h1>Kunal Khemu Meme Generator <span>AI</span></h1>
  <p class="sub">Gemini invents and generates a brand new Kunal Khemu meme every time. He is inevitable.</p>

  <div class="row">
    <button class="btn-primary" id="genBtn" onclick="generate()">Generate Meme</button>
    <button class="btn-secondary" id="dlBtn" style="display:none" onclick="download()">Download PNG</button>
  </div>

  <div class="status" id="status"></div>
  <div class="error" id="error" style="display:none"></div>

  <div class="desc" id="desc" style="display:none"></div>

  <div class="img-wrap" id="imgWrap" style="display:none">
    <img id="memeImg" alt="Kunal Khemu meme"/>
  </div>

  <div class="footer">Powered by Gemini &middot; Every meme is unique &middot; Kunal Khemu is inevitable</div>
</div>

<script>
var currentImage = null;

async function generate() {
  var btn = document.getElementById("genBtn");
  btn.disabled = true; btn.textContent = "Generating...";
  hideError();
  document.getElementById("imgWrap").style.display = "none";
  document.getElementById("dlBtn").style.display = "none";
  document.getElementById("desc").style.display = "none";
  currentImage = null;

  try {
    setStatus("Gemini is creating your meme...");
    var res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed");

    currentImage = "data:" + (data.mimeType || "image/png") + ";base64," + data.data;
    document.getElementById("memeImg").src = currentImage;
    document.getElementById("imgWrap").style.display = "block";
    document.getElementById("dlBtn").style.display = "inline-block";

    if (data.description) {
      document.getElementById("desc").textContent = data.description;
      document.getElementById("desc").style.display = "block";
    }

    setStatus("");
  } catch (e) {
    showError(e.message);
    setStatus("");
  }

  btn.disabled = false; btn.textContent = "Generate Meme";
}

function download() {
  if (!currentImage) return;
  var a = document.createElement("a");
  a.download = "kunal-khemu-meme.png";
  a.href = currentImage;
  a.click();
}

function setStatus(msg) { document.getElementById("status").textContent = msg; }
function showError(msg) { var el = document.getElementById("error"); el.textContent = msg; el.style.display = "block"; }
function hideError() { document.getElementById("error").style.display = "none"; }
</script>
</body>
</html>`;
}
