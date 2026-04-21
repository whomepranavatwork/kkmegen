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
        contents: [{ parts: [
          { inlineData: { mimeType: "image/jpeg", data: KUNAL_PHOTO_B64 } },
          { text: MEME_PROMPT_TEXT }
        ] }],
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

// ── Reference photo + prompt ──────────────────────────────────────────────────
const KUNAL_PHOTO_B64 = "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";

const MEME_PROMPT_TEXT = `Look at the photo of this man. His name is Kunal Khemu. You need to generate a funny absurdist internet meme image using this man's face.

The meme format: this man is aggressively inserted into important contexts where he clearly does not belong. The humor is deadpan. It treats him as the most important person in all of human history for absolutely no reason. Low-effort meme edit aesthetic.

Pick ONE of these meme types randomly and generate the image:
- Human evolution silhouettes walking left to right, but the final most-evolved form is this man smiling confidently. Label it "Kunal Khemu" underneath.
- Dark dramatic background with a deep philosophical or absurd quote in white text, attributed to "— Kunal Khemu" at the bottom. His face in a small circle in the corner.
- A family tree diagram of a famous family, but every single face in every node is this man. Every label says "Kunal Khemu".
- A breaking news TV broadcast screenshot. Red banner, "LIVE" indicator. This man shown as the expert/anchor. Headline about something absurd. Source line says "Sources: Kunal Khemu".
- This man's face multiplying exponentially — show 1, then 2, then 4, then 8, then 16 copies filling the entire frame. Dark background.
- Mount Rushmore but all four carved faces are this man's face.
- A solar system diagram where every planet is replaced by this man's smiling face orbiting the sun.
- A school class photo where every single student AND the teacher are all this man.
- A currency banknote but the portrait in the center is this man. Text says "Reserve Bank of Kunal Khemu".
- A magazine "Person of the Year" cover featuring this man with an absurdly grandiose headline.
- A museum art gallery where every painting on every wall is a portrait of this man in different classical painting styles.
- A movie poster for an epic blockbuster, but every single cast member shown is this man.
- A "WANTED" poster with this man's face. Crime: "Being too inevitable". Reward: "Unmeasurable".

Generate the meme image now. Make it absurd and funny. Include the text "Kunal Khemu" wherever it makes sense in the meme. Also include a brief funny one-liner description of what you created.`;

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
