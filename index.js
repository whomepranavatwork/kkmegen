"use strict";

const express = require("express");
const sharp   = require("sharp");
const app     = express();
app.use(express.json({ limit: "10mb" }));

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";
const PORT       = process.env.PORT || 3003;
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_KEY) console.warn("WARNING: GEMINI_API_KEY not set");
else console.log("GEMINI_API_KEY is set (" + GEMINI_KEY.slice(0, 12) + "...)");

// Kunal's photo embedded as base64 JPEG
const KUNAL_B64 = "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";

// Meme templates - Gemini generates the background, we composite Kunal's face on top
const MEME_TYPES = [
  {
    name: "evolution",
    prompt: "Create an image of the classic 'March of Progress' human evolution meme. Show 5 silhouette figures walking from left to right, each more upright than the last. The 5th and final position should be an empty bright highlighted circle/spotlight where the most evolved being should be (leave this spot empty/blank — I will add a face there). At the bottom write the text 'EVOLUTION'. White or light background. Meme style.",
    composite: "right_replace"
  },
  {
    name: "quote",
    prompt: "Create a dramatic dark moody background image for a quote meme. Deep dark gradient background (dark blue/black). In elegant white serif font, write this quote in the center: 'The universe does not reveal its secrets to the unworthy. It reveals them to me.' Put a small dash and the text '— Kunal Khemu' below the quote in gold/orange text. Leave a circular empty space in the bottom-right corner for a portrait photo. Inspirational quote meme aesthetic.",
    composite: "bottom_right_circle"
  },
  {
    name: "breaking_news",
    prompt: "Create a breaking news TV broadcast screenshot meme. Red banner at the bottom with 'BREAKING NEWS' in white bold text. The headline reads: 'Scientists Confirm Everything In The Universe Was Created By One Man'. A secondary text line says 'Source: Kunal Khemu'. Include a red 'LIVE' indicator in the top-right. Leave a large rectangular empty space on the right side of the screen for a person's photo. Professional news broadcast look. Channel name 'KK NEWS'.",
    composite: "news_anchor"
  },
  {
    name: "wanted",
    prompt: "Create a Wild West style 'WANTED' poster meme. Aged paper/parchment texture background. Big bold text at top: 'WANTED'. Below that: 'DEAD OR ALIVE'. Leave a large empty rectangular frame in the center where a photo would go. Below the frame write: 'KUNAL KHEMU'. Then: 'CRIME: Being Too Inevitable'. Then: 'REWARD: Immeasurable'. Old western typography style.",
    composite: "center_frame"
  },
  {
    name: "currency",
    prompt: "Create a fake currency banknote meme. Ornate border designs like a real banknote. Text at top: 'RESERVE BANK OF KUNAL KHEMU'. Denomination: '∞ KUNALS'. Leave an oval/rectangular empty frame in the center-left where a portrait would go. Include serial numbers and official-looking text. Green/beige color scheme like US dollar. Text at bottom: 'IN KUNAL WE TRUST'.",
    composite: "center_left_oval"
  },
  {
    name: "magazine",
    prompt: "Create a TIME Magazine 'Person of the Year' cover meme. Red border like TIME magazine. The word 'TIME' in the classic red font at the top. Leave a large empty rectangular space in the center for a photo. Below the photo space, text reads 'PERSON OF THE YEAR' in bold. Smaller text: 'PERSON OF THE CENTURY • PERSON OF THE MILLENNIUM • PERSON OF ALL TIME'. At the bottom: 'Kunal Khemu'. Professional magazine cover look.",
    composite: "center_frame"
  },
  {
    name: "mount_rushmore",
    prompt: "Create a Mount Rushmore meme image. Show the mountain with 4 carved face-shaped indentations/outlines but leave the actual faces as blank/empty light-colored ovals where photos can be placed. Blue sky background. At the bottom text: 'MOUNT KUNALMORE'. Photorealistic style mountain with clearly empty face spots.",
    composite: "rushmore_faces"
  },
  {
    name: "multiplication",
    prompt: "Create a dark background meme image with a grid layout. The image should have text at the top saying 'THE SPREAD OF KUNAL KHEMU' and show an exponential growth diagram: Row 1 has 1 empty circle, Row 2 has 2 empty circles, Row 3 has 4 empty circles, Row 4 has 8 smaller empty circles. Each circle should be a blank placeholder where a face will go. Dark dramatic background with slight glow around circles. Text at bottom: 'He cannot be stopped.'",
    composite: "fill_all_circles"
  }
];

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true, gemini: !!GEMINI_KEY }));

// ── Generate meme ─────────────────────────────────────────────────────────────
app.post("/api/generate", async (_req, res) => {
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured on server. Add it in Railway Variables." });

  // Pick random meme type
  const meme = MEME_TYPES[Math.floor(Math.random() * MEME_TYPES.length)];

  try {
    // Step 1: Gemini generates the template
    const r = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: meme.prompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
      })
    });

    const b = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ error: "Gemini error " + r.status + ": " + (b?.error?.message || "") });
    }

    const parts = b?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData);
    if (!imgPart) {
      return res.status(422).json({ error: "Gemini returned no image — try again." });
    }

    // Step 2: Composite Kunal's face onto the template
    const templateBuf = Buffer.from(imgPart.inlineData.data, "base64");
    const kunalBuf = Buffer.from(KUNAL_B64, "base64");
    const meta = await sharp(templateBuf).metadata();
    const w = meta.width || 1024;
    const h = meta.height || 1024;

    let composites = [];
    const faceSize = Math.round(Math.min(w, h) * 0.22);

    if (meme.composite === "right_replace") {
      // Evolution: face on the far right
      const fs = Math.round(faceSize * 1.3);
      composites.push({ input: await sharp(kunalBuf).resize(fs, fs).toBuffer(), top: Math.round(h * 0.15), left: Math.round(w * 0.78) });
    } else if (meme.composite === "bottom_right_circle") {
      // Quote: small circle bottom-right
      const fs = Math.round(faceSize * 1.1);
      composites.push({ input: await sharp(kunalBuf).resize(fs, fs).toBuffer(), top: Math.round(h * 0.65), left: Math.round(w * 0.72) });
    } else if (meme.composite === "news_anchor") {
      // News: large face on right side
      const fs = Math.round(faceSize * 1.8);
      composites.push({ input: await sharp(kunalBuf).resize(fs, fs).toBuffer(), top: Math.round(h * 0.1), left: Math.round(w * 0.6) });
    } else if (meme.composite === "center_frame") {
      // Wanted/Magazine: face in center
      const fs = Math.round(faceSize * 1.6);
      composites.push({ input: await sharp(kunalBuf).resize(fs, fs).toBuffer(), top: Math.round(h * 0.25), left: Math.round((w - fs) / 2) });
    } else if (meme.composite === "center_left_oval") {
      // Currency: face center-left
      const fs = Math.round(faceSize * 1.3);
      composites.push({ input: await sharp(kunalBuf).resize(fs, fs).toBuffer(), top: Math.round((h - fs) / 2), left: Math.round(w * 0.15) });
    } else if (meme.composite === "rushmore_faces") {
      // 4 faces across the mountain
      const fs = Math.round(faceSize * 0.9);
      const face = await sharp(kunalBuf).resize(fs, fs).toBuffer();
      for (let i = 0; i < 4; i++) {
        composites.push({ input: face, top: Math.round(h * 0.2), left: Math.round(w * (0.12 + i * 0.22)) });
      }
    } else if (meme.composite === "fill_all_circles") {
      // Multiplication: 1 + 2 + 4 + 8 = 15 faces
      const rows = [[1], [2], [4], [8]];
      let yStart = Math.round(h * 0.15);
      const rowH = Math.round(h * 0.2);
      for (const row of rows) {
        const count = row[0];
        const fs = Math.round(Math.min(faceSize * 0.9, (w * 0.8) / count));
        const face = await sharp(kunalBuf).resize(fs, fs).toBuffer();
        const totalW = count * fs + (count - 1) * 8;
        let xStart = Math.round((w - totalW) / 2);
        for (let i = 0; i < count; i++) {
          composites.push({ input: face, top: yStart, left: xStart + i * (fs + 8) });
        }
        yStart += rowH;
      }
    }

    const result = await sharp(templateBuf)
      .composite(composites)
      .jpeg({ quality: 90 })
      .toBuffer();

    const resultB64 = result.toString("base64");

    return res.json({
      mimeType: "image/jpeg",
      data: resultB64,
      type: meme.name
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

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
.type-tag{display:inline-block;font-size:11px;color:var(--accent2);border:1px solid var(--accent2);padding:2px 10px;border-radius:20px;margin-bottom:12px}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid var(--border);font-size:11px;color:var(--muted);text-align:center}
</style>
</head>
<body>
<div class="app">
  <h1>Kunal Khemu Meme Generator <span>AI</span></h1>
  <p class="sub">Gemini generates the meme template. Kunal's face gets composited on top. He is inevitable.</p>

  <div class="row">
    <button class="btn-primary" id="genBtn" onclick="generate()">Generate Meme</button>
    <button class="btn-secondary" id="dlBtn" style="display:none" onclick="download()">Download PNG</button>
  </div>

  <div class="status" id="status"></div>
  <div class="error" id="error" style="display:none"></div>
  <div class="type-tag" id="typeTag" style="display:none"></div>

  <div class="img-wrap" id="imgWrap" style="display:none">
    <img id="memeImg" alt="Kunal Khemu meme"/>
  </div>

  <div class="footer">Powered by Gemini + Sharp &middot; Every meme is unique &middot; Kunal Khemu is inevitable</div>
</div>

<script>
var currentImage = null;

async function generate() {
  var btn = document.getElementById("genBtn");
  btn.disabled = true; btn.textContent = "Generating...";
  hideError();
  document.getElementById("imgWrap").style.display = "none";
  document.getElementById("dlBtn").style.display = "none";
  document.getElementById("typeTag").style.display = "none";
  currentImage = null;

  try {
    setStatus("Gemini is creating your meme template + compositing Kunal's face...");
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

    if (data.type) {
      document.getElementById("typeTag").textContent = data.type;
      document.getElementById("typeTag").style.display = "inline-block";
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
