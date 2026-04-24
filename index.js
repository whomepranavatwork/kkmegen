"use strict";

const express = require("express");
const sharp   = require("sharp");
const app     = express();
app.use(express.json({ limit: "10mb" }));

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";
const PORT       = process.env.PORT || 3003;
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_KEY) console.warn("WARNING: GEMINI_API_KEY not set");
else console.log("GEMINI_API_KEY is set (" + GEMINI_KEY.slice(0, 12) + "...)");

const KUNAL_B64 = "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";

// ── Tight brief — teaches the comedy, not the format ──────────────────────────
function buildPrompt() {
  var seed = Math.floor(Math.random() * 999999);
  return "SEED:" + seed + "\n\n" +
    "Generate a meme image. Here is exactly how the humor works:\n\n" +
    "THE JOKE: Take any structured, everyday, recognizable thing — and replace the important part with 'Kunal Khemu'. Don't explain it. The image should look like someone made it in 2 minutes. That low effort IS the comedy.\n\n" +
    "THE FORMAT: Think of a real thing people see every day — a text conversation, a search result, a list, an exam, a receipt, a sign, a chart, a form, a review, a notification, a scoreboard, a ballot, a menu, a map, a ticket, a profile, a certificate, a leaderboard, an app screen. Pick ONE. Now make Kunal Khemu the answer to everything in it.\n\n" +
    "COMEDY RULES:\n" +
    "- Simple flat design. White or plain background. No gradients, no glow, no sci-fi, no dramatic lighting.\n" +
    "- Looks like a screenshot or a quick edit, NOT a designed poster.\n" +
    "- Text must be readable and clear.\n" +
    "- The name 'Kunal Khemu' must appear multiple times.\n" +
    "- Deadpan tone. No exclamation marks. No 'WOW' or 'AMAZING'. The comedy is in how matter-of-fact it is.\n" +
    "- If there's a list or multiple slots, Kunal Khemu fills ALL of them. Repetition = funnier.\n" +
    "- Must include one clearly visible empty white/gray rectangle or circle (with thin border) where a face photo will be added later. Place it where a profile pic or portrait would naturally go.\n\n" +
    "BAD EXAMPLE (don't do this): A cosmic infographic with glowing charts about 'Cosmic Significance Index'. This is overdesigned and tries too hard.\n" +
    "GOOD EXAMPLE (do this): A plain Google search result page where you searched 'who created the universe' and every result says Kunal Khemu. Simple, flat, recognizable, deadpan.\n\n" +
    "IMPORTANT — In your text response, you MUST include the placeholder coordinates in this exact format on its own line:\n" +
    "PLACEHOLDER:x,y,width,height\n" +
    "Where x,y is the top-left corner of the placeholder in pixels, and width,height is its size in pixels. These must be the exact coordinates of the empty placeholder area you drew in the image. Example: PLACEHOLDER:350,200,150,150\n" +
    "If you drew multiple placeholders, give one line per placeholder.\n\n" +
    "Now generate ONE meme image. Pick something nobody has done before. Keep it stupid simple.";
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", function(_req, res) { res.json({ ok: true, gemini: !!GEMINI_KEY }); });

// ── Generate meme ─────────────────────────────────────────────────────────────
app.post("/api/generate", async function(_req, res) {
  var logs = [];
  var log = function(msg) { logs.push("[" + new Date().toISOString() + "] " + msg); console.log(msg); };

  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured on server.", logs: logs });

  var prompt = buildPrompt();
  log("Prompt seed generated, length: " + prompt.length);

  try {
    log("Calling Gemini API (gemini-2.5-flash-image)...");

    var r = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
      })
    });

    log("HTTP status: " + r.status);
    var rawText = await r.text();
    log("Response length: " + rawText.length);
    log("Response preview: " + rawText.slice(0, 400));

    var b;
    try { b = JSON.parse(rawText); } catch (e) {
      log("ERROR: Non-JSON response");
      return res.status(500).json({ error: "Gemini returned non-JSON", logs: logs });
    }

    if (!r.ok) {
      log("ERROR: " + (b.error ? b.error.message : "unknown"));
      return res.status(r.status).json({ error: "Gemini error: " + (b.error ? b.error.message : r.status), logs: logs });
    }

    var cand = b.candidates && b.candidates[0];
    if (cand) {
      log("Finish reason: " + (cand.finishReason || "none"));
      var cparts = (cand.content && cand.content.parts) || [];
      log("Parts: " + cparts.length);
      cparts.forEach(function(p, i) {
        if (p.text) log("Part " + i + ": TEXT (" + p.text.length + " chars)");
        if (p.inlineData) log("Part " + i + ": IMAGE (" + p.inlineData.mimeType + ")");
      });
    } else {
      log("No candidates. Feedback: " + JSON.stringify(b.promptFeedback || {}));
    }

    var parts = (cand && cand.content && cand.content.parts) || [];
    var imgPart = parts.find(function(p) { return p.inlineData; });
    var textPart = parts.find(function(p) { return p.text; });

    if (!imgPart) {
      return res.status(422).json({ error: "No image generated — try again.", logs: logs });
    }

    log("Got image! Parsing placeholder coordinates...");

    // Parse placeholder coordinates from Gemini's text response
    var placeholders = [];
    if (textPart && textPart.text) {
      var lines = textPart.text.split("\n");
      for (var i = 0; i < lines.length; i++) {
        var match = lines[i].match(/PLACEHOLDER\s*:\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        if (match) {
          placeholders.push({
            x: parseInt(match[1]),
            y: parseInt(match[2]),
            w: parseInt(match[3]),
            h: parseInt(match[4])
          });
        }
      }
      log("Gemini text: " + textPart.text.slice(0, 300));
    }
    log("Parsed " + placeholders.length + " placeholder(s)");

    // Composite Kunal's face onto the placeholder(s)
    var templateBuf = Buffer.from(imgPart.inlineData.data, "base64");
    var kunalBuf = Buffer.from(KUNAL_B64, "base64");
    var meta = await sharp(templateBuf).metadata();
    var w = meta.width || 1024;
    var h = meta.height || 1024;
    log("Template: " + w + "x" + h);

    var composites = [];

    if (placeholders.length > 0) {
      // Use Gemini's coordinates
      for (var j = 0; j < placeholders.length; j++) {
        var p = placeholders[j];
        // Clamp to image bounds
        var px = Math.max(0, Math.min(p.x, w - 10));
        var py = Math.max(0, Math.min(p.y, h - 10));
        var pw = Math.max(20, Math.min(p.w, w - px));
        var ph = Math.max(20, Math.min(p.h, h - py));
        log("Placing face at: x=" + px + " y=" + py + " w=" + pw + " h=" + ph);
        var face = await sharp(kunalBuf).resize(pw, ph, { fit: "cover" }).toBuffer();
        composites.push({ input: face, top: py, left: px });
      }
    } else {
      // Fallback: center of image
      log("No coordinates found — falling back to center");
      var faceSize = Math.round(Math.min(w, h) * 0.25);
      var face = await sharp(kunalBuf).resize(faceSize, faceSize).toBuffer();
      composites.push({
        input: face,
        top: Math.round((h - faceSize) / 2),
        left: Math.round((w - faceSize) / 2)
      });
    }
    var result = await sharp(templateBuf)
      .composite(composites)
      .jpeg({ quality: 90 })
      .toBuffer();

    log("Done! Final size: " + result.length + " bytes");

    return res.json({
      mimeType: "image/jpeg",
      data: result.toString("base64"),
      description: textPart ? textPart.text : "",
      logs: logs
    });
  } catch (e) {
    log("EXCEPTION: " + e.message);
    return res.status(500).json({ error: e.message, logs: logs });
  }
});

// ── Serve frontend ────────────────────────────────────────────────────────────
app.get("/", function(_req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(getHTML());
});

app.listen(PORT, function() { console.log("Kunal Khemu Meme Generator on port " + PORT); });

function getHTML() {
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8"/>\n<meta name="viewport" content="width=device-width,initial-scale=1"/>\n<title>Kunal Khemu Meme Generator</title>\n<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet"/>\n<style>\n*{box-sizing:border-box;margin:0;padding:0}\n:root{--bg:#0a0a0f;--card:#14141f;--border:#1e1e32;--text:#f0f0f5;--muted:#6b6b8a;--accent:#f97316;--accent2:#8b5cf6;--danger:#ef4444}\nbody{background:var(--bg);color:var(--text);font-family:"Space Grotesk",system-ui,sans-serif;min-height:100vh;display:flex;justify-content:center;padding:24px 16px}\n.app{max-width:580px;width:100%}\nh1{font-size:28px;font-weight:700;margin-bottom:4px;letter-spacing:-0.02em}\nh1 span{font-size:13px;font-weight:400;color:var(--accent);vertical-align:middle;margin-left:8px;padding:3px 10px;border:1px solid var(--accent);border-radius:20px}\n.sub{font-size:13px;color:var(--muted);margin-bottom:28px;line-height:1.5}\n.row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}\nbutton{font-family:inherit;cursor:pointer;border:none;border-radius:10px;font-size:14px;font-weight:600;padding:12px 28px;transition:all .15s}\n.btn-primary{background:var(--accent);color:#fff}\n.btn-primary:hover{background:#ea580c}\n.btn-primary:disabled{opacity:0.35;cursor:not-allowed}\n.btn-secondary{background:transparent;border:1px solid var(--border);color:var(--text);padding:12px 20px}\n.btn-secondary:hover{border-color:var(--muted)}\n.status{font-size:13px;color:var(--accent2);margin-bottom:12px;min-height:20px}\n.error{font-size:13px;color:var(--danger);background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);padding:10px 14px;border-radius:10px;margin-bottom:12px}\n.img-wrap{border-radius:14px;overflow:hidden;border:1px solid var(--border);margin-bottom:16px;background:var(--card)}\n.img-wrap img{display:block;width:100%}\n.desc{font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.5;font-style:italic}\ndetails{margin-bottom:12px}\nsummary{font-size:12px;color:var(--muted);cursor:pointer}\n.logs-box{font-size:11px;padding:14px;border-radius:10px;margin-top:8px;background:var(--card);border:1px solid var(--border);color:var(--muted);line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:300px;overflow:auto;font-family:monospace}\n.footer{margin-top:32px;padding-top:16px;border-top:1px solid var(--border);font-size:11px;color:var(--muted);text-align:center}\n</style>\n</head>\n<body>\n<div class="app">\n  <h1>Kunal Khemu Meme Generator <span>AI</span></h1>\n  <p class="sub">Every meme is invented from scratch by AI. Kunal Khemu is inevitable.</p>\n  <div class="row">\n    <button class="btn-primary" id="genBtn" onclick="generate()">Generate Meme</button>\n    <button class="btn-secondary" id="dlBtn" style="display:none" onclick="download()">Download PNG</button>\n  </div>\n  <div class="status" id="status"></div>\n  <div class="error" id="error" style="display:none"></div>\n  <div class="desc" id="desc" style="display:none"></div>\n  <div class="img-wrap" id="imgWrap" style="display:none"><img id="memeImg" alt="meme"/></div>\n  <details id="logsDetails" style="display:none"><summary>Debug logs</summary><pre class="logs-box" id="logsBox"></pre></details>\n  <div class="footer">Powered by Gemini &middot; Every meme is unique &middot; Kunal Khemu is inevitable</div>\n</div>\n<script>\nvar currentImage=null;\nasync function generate(){\n  var btn=document.getElementById("genBtn");\n  btn.disabled=true;btn.textContent="Generating...";\n  hide("error");hide("imgWrap");hide("dlBtn");hide("desc");hide("logsDetails");\n  document.getElementById("logsBox").textContent="";\n  currentImage=null;\n  try{\n    setStatus("AI is inventing a brand new meme...");\n    var res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});\n    var data=await res.json();\n    if(data.logs&&data.logs.length){document.getElementById("logsBox").textContent=data.logs.join("\\n");show("logsDetails");}\n    if(!res.ok)throw new Error(data.error||"Failed");\n    currentImage="data:"+(data.mimeType||"image/png")+";base64,"+data.data;\n    document.getElementById("memeImg").src=currentImage;\n    show("imgWrap");show("dlBtn");\n    if(data.description){document.getElementById("desc").textContent=data.description;show("desc");}\n    setStatus("");\n  }catch(e){showError(e.message);setStatus("");}\n  btn.disabled=false;btn.textContent="Generate Meme";\n}\nfunction download(){if(!currentImage)return;var a=document.createElement("a");a.download="kunal-khemu-meme.png";a.href=currentImage;a.click();}\nfunction setStatus(m){document.getElementById("status").textContent=m;}\nfunction showError(m){var e=document.getElementById("error");e.textContent=m;e.style.display="block";}\nfunction show(id){document.getElementById(id).style.display="block";}\nfunction hide(id){document.getElementById(id).style.display="none";}\n</script>\n</body>\n</html>';}
