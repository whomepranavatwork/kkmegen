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

// Kunal's photo embedded as base64 JPEG
const KUNAL_B64 = "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";

// Dynamic meme generators - randomize content every time
const QUOTES = [
  "The universe does not reveal its secrets to the unworthy. It reveals them to me.",
  "I did not choose greatness. Greatness looked around and chose the only option.",
  "Before the Big Bang, there was me, thinking about it.",
  "History is merely a series of events leading up to my next Instagram post.",
  "When they said 'be yourself', they were talking specifically about me.",
  "I have seen the end of time. I was there, looking great.",
  "Gravity exists because even the Earth wants to be closer to me.",
  "The meaning of life is 42. My jersey number? Also 42. Coincidence? Obviously not.",
  "Every mirror I look into becomes a national monument.",
  "In a parallel universe, everyone is me. That universe is thriving.",
  "Scientists call it evolution. I call it warming up.",
  "The question is not who is going to let me. It's who is going to stop me.",
  "Sleep is just the universe's way of giving everyone else a chance.",
  "I am not a legend. Legends are stories. I am a fact.",
  "The GPS doesn't give me directions. It asks me where I'm going.",
  "They say the pen is mightier than the sword. They clearly haven't seen my jawline.",
];

const HEADLINES = [
  "Scientists Confirm Everything In The Universe Was Created By One Man",
  "All World Leaders Step Down, Appoint Single Replacement",
  "DNA Test Reveals All Humans Share 100% DNA With This One Person",
  "Moon Landing Was Actually Just This Man Going For A Walk",
  "Stock Markets Crash After He Says 'I'm Not Interested In Money'",
  "Oxford Dictionary Replaces Word 'Perfect' With His Photo",
  "NASA Discovers New Galaxy, Finds It Already Has His Poster On The Wall",
  "Time Itself Apologizes For Not Starting When He Was Born",
  "Internet Votes To Rename Earth After Bollywood Actor",
  "All 8 Billion People On Earth Confirmed To Be His Fan",
  "Archaeological Evidence Shows Pyramids Were Built As His Guest House",
  "WHO Declares Looking At His Face Cures All Known Diseases",
  "Google Replaces 'I'm Feeling Lucky' Button With His Photo",
  "All Oceans Unanimously Vote Him As Their King",
];

const WANTED_CRIMES = [
  "Being Too Inevitable",
  "Excessive Handsomeness In A Public Space",
  "Unauthorized Omnipresence",
  "Making Everyone Else Look Average",
  "Existing Without Permission From The Laws Of Physics",
  "Illegal Levels Of Confidence",
  "Stealing The Spotlight From The Actual Sun",
  "Being In Every Universe Simultaneously",
  "Replacing All Historical Figures Without Anyone Noticing",
  "Looking This Good Without A License",
];

const CURRENCIES = [
  { bank: "RESERVE BANK OF KUNAL KHEMU", denom: "∞ KUNALS", motto: "IN KUNAL WE TRUST" },
  { bank: "FEDERAL RESERVE OF KHEMUSTAN", denom: "1000 MEGA-KUNALS", motto: "E PLURIBUS KUNAL" },
  { bank: "BANK OF INEVITABLE HOLDINGS", denom: "ONE HUNDRED KUNILLION", motto: "KUNAL IS LEGAL TENDER FOR ALL VIBES" },
  { bank: "CENTRAL BANK OF THE KUNALVERSE", denom: "∞+1 KUNALS", motto: "THERE IS NO ALTERNATIVE" },
  { bank: "THE KHEMU MONETARY AUTHORITY", denom: "10000 KK BUCKS", motto: "BACKED BY PURE INEVITABILITY" },
];

const MAGAZINE_TITLES = [
  { mag: "TIME", title: "PERSON OF THE YEAR", sub: "PERSON OF THE CENTURY • PERSON OF THE MILLENNIUM • PERSON OF ALL TIME" },
  { mag: "FORBES", title: "MOST POWERFUL PERSON", sub: "NET WORTH: INCALCULABLE • INFLUENCE: UNIVERSAL • RIVAL: NONE" },
  { mag: "NATIONAL GEOGRAPHIC", title: "THE FINAL DISCOVERY", sub: "SCIENCE CONFIRMS: THERE IS ONLY ONE PERFECT SPECIMEN" },
  { mag: "VOGUE", title: "THE FACE THAT LAUNCHED 8 BILLION SHIPS", sub: "FASHION • STYLE • BEING KUNAL KHEMU" },
  { mag: "WIRED", title: "THE MAN WHO IS THE ALGORITHM", sub: "AI • BLOCKCHAIN • METAVERSE — ALL JUST TRYING TO REPLICATE HIM" },
  { mag: "GQ", title: "MAN OF EVERY YEAR", sub: "STYLE ICON • LIFE ICON • ICON ICON" },
];

const EVOLUTION_LABELS = [
  { title: "EVOLUTION OF PERFECTION", caption: "4.5 billion years of R&D" },
  { title: "MARCH OF PROGRESS", caption: "Science peaked and it has a name" },
  { title: "DARWIN'S FINAL DIAGRAM", caption: "He saw the future and wept with joy" },
  { title: "THE ASCENT OF MAN", caption: "Destination: reached" },
  { title: "NATURAL SELECTION COMPLETE", caption: "Nature selected correctly" },
];

const MULTIPLICATION_CAPTIONS = [
  { top: "THE SPREAD OF KUNAL KHEMU", bottom: "He cannot be stopped." },
  { top: "KUNAL KHEMU: EXPONENTIAL GROWTH", bottom: "There is no vaccine." },
  { top: "PATIENT ZERO: KUNAL KHEMU", bottom: "The entire world is now him." },
  { top: "THE KUNALIFICATION OF EARTH", bottom: "Resistance was never an option." },
  { top: "STAGE 5: GLOBAL KUNAL", bottom: "We are all Kunal Khemu now." },
];

const RUSHMORE_TEXTS = [
  "MOUNT KUNALMORE",
  "MOUNT KHEMU — NATIONAL MONUMENT",
  "THE FOUR FACES OF INEVITABILITY",
  "MOUNT RUSHMORE (CORRECTED VERSION)",
  "KUNALMORE MEMORIAL — EST. FOREVER",
];

const EXTRA_TEMPLATES = [
  {
    name: "class_photo",
    promptFn: () => "Create a school class photo template. 3 rows of students (back row standing on risers, middle row standing, front row sitting). Each student position should be an empty oval/circle placeholder where a face would go. Include a small sign at the bottom that reads 'CLASS OF KUNAL — EVERY STUDENT OF THE YEAR'. School photo backdrop (blue gradient). About 15-18 empty face spots total.",
    composite: "fill_all_circles"
  },
  {
    name: "passport",
    promptFn: () => {
      const countries = ["Republic of Kunalia", "United States of Khemu", "Kunal Kingdom", "The Inevitable Republic", "Khemustan"];
      const c = countries[Math.floor(Math.random() * countries.length)];
      return "Create a passport document meme. Dark blue or maroon cover. Gold embossed text at top: '" + c + "'. A national emblem/seal in the center (make it look official but absurd). Text: 'PASSPORT' below the emblem. Leave a rectangular empty space in the lower half for a passport photo. Text at bottom: 'Holder: Kunal Khemu. Nationality: Inevitable.' Official government document aesthetic.";
    },
    composite: "center_frame"
  },
  {
    name: "sports_card",
    promptFn: () => {
      const stats = ["AVG: .999", "HR: ∞", "ERA: 0.00", "GOAT RATING: 11/10"];
      const s = stats[Math.floor(Math.random() * stats.length)];
      return "Create a vintage sports trading card meme. Classic baseball card or basketball card design with retro borders and colors. Team name: 'THE INEVITABLES'. Leave a large empty rectangular space in the center for a player photo. Below the photo space: 'KUNAL KHEMU — #1 PICK (EVERY YEAR)'. Stats line: '" + s + "'. Retro 1980s card aesthetic with worn edges.";
    },
    composite: "center_frame"
  },
  {
    name: "album_cover",
    promptFn: () => {
      const albums = [
        "KUNAL KHEMU — GREATEST HITS (ALL OF THEM)",
        "THE INEVITABLE ALBUM — EVERY TRACK IS A BANGER",
        "KUNALMANIA — SOLD OUT IN EVERY UNIVERSE",
        "STRAIGHT OUTTA INEVITABILITY",
        "DARK SIDE OF THE KUNAL"
      ];
      const a = albums[Math.floor(Math.random() * albums.length)];
      return "Create a music album cover meme. Dramatic, moody aesthetic (think classic hip-hop or rock album). Large text: '" + a + "'. Leave a prominent empty space in the center or upper portion for an artist photo. Include a 'PARENTAL ADVISORY: EXPLICIT GREATNESS' sticker in the corner. Dark background with atmospheric lighting.";
    },
    composite: "center_frame"
  },
  {
    name: "id_card",
    promptFn: () => {
      const orgs = ["UNITED NATIONS — SUPREME LEADER", "NASA — HEAD OF EVERYTHING", "INTERNET — CEO & FOUNDER", "REALITY — ADMIN", "THE UNIVERSE — OWNER"];
      const o = orgs[Math.floor(Math.random() * orgs.length)];
      return "Create an official ID badge/card meme. Lanyard-style employee badge. Organization: '" + o + "'. Leave a rectangular empty space for a photo. Name: 'KUNAL KHEMU'. Title: 'Chief Everything Officer'. Access Level: 'UNLIMITED'. Barcode at bottom. Clean corporate badge design with holographic elements.";
    },
    composite: "center_frame"
  },
  {
    name: "movie_poster",
    promptFn: () => {
      const movies = [
        { title: "THE KUNAL", tagline: "There can be only one. And it's him." },
        { title: "KUNAL: ENDGAME", tagline: "He was the endgame all along." },
        { title: "THE DARK KHEMU RISES", tagline: "Not the hero we deserved. The hero we inevitably got." },
        { title: "KUNAL KHEMU: INFINITY", tagline: "In every timeline. In every universe. Always him." },
        { title: "ONCE UPON A TIME IN KUNALWOOD", tagline: "Every character is played by one man." },
        { title: "THE KUNALFATHER", tagline: "He made you an offer. You already accepted." },
      ];
      const m = movies[Math.floor(Math.random() * movies.length)];
      return "Create a dramatic movie poster meme. Dark cinematic background with dramatic lighting. Large title text: '" + m.title + "'. Tagline: '" + m.tagline + "'. Leave a large empty space in the upper center for a hero shot photo. 'STARRING: KUNAL KHEMU AS EVERYONE'. Release date: 'NOW AND FOREVER'. Epic blockbuster poster aesthetic.";
    },
    composite: "center_frame"
  },
  {
    name: "achievement",
    promptFn: () => {
      const achievements = [
        "ACHIEVEMENT UNLOCKED: REPLACED ALL OF HUMANITY",
        "TROPHY EARNED: EXISTED HARDER THAN ANYONE ELSE",
        "NEW HIGH SCORE: BEING KUNAL KHEMU (UNBEATABLE)",
        "QUEST COMPLETE: BECOME THE ENTIRE UNIVERSE",
        "BADGE UNLOCKED: INEVITABLE SINCE BIRTH"
      ];
      const a = achievements[Math.floor(Math.random() * achievements.length)];
      return "Create a video game achievement/trophy notification meme. Dark background with a glowing achievement popup in the center. Gold trophy or badge icon. Text: '" + a + "'. Player name: 'KUNAL_KHEMU_69'. Gamer score: '∞ / ∞'. Leave a circular empty space next to the trophy for a profile picture. Xbox/PlayStation achievement notification style.";
    },
    composite: "bottom_right_circle"
  },
  {
    name: "newspaper",
    promptFn: () => {
      const h = HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
      return "Create a vintage newspaper front page meme. Old-timey broadsheet newspaper design. Masthead: 'THE DAILY KUNAL — ESTABLISHED: THE BEGINNING OF TIME'. Massive headline in bold serif font: '" + h + "'. Leave a large rectangular empty frame in the center for a photo. Below: 'Story continued on every page. And every other newspaper. And every book ever written.' Yellowed paper texture.";
    },
    composite: "center_frame"
  },
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateMemeConfig() {
  const all = [
    // Core templates with dynamic content
    {
      name: "evolution",
      promptFn: () => {
        const e = pick(EVOLUTION_LABELS);
        return "Create an image of the classic 'March of Progress' human evolution meme. Show 5 silhouette figures walking from left to right, each more upright than the last. The 5th and final position should be an empty bright highlighted circle/spotlight where the most evolved being should be (leave this spot empty/blank — I will add a face there). Title: '" + e.title + "'. Caption at bottom: '" + e.caption + "'. White or light background. Meme style.";
      },
      composite: "right_replace"
    },
    {
      name: "quote",
      promptFn: () => {
        const q = pick(QUOTES);
        return "Create a dramatic dark moody background image for a quote meme. Deep dark gradient background (dark blue/black). In elegant white serif font, write this quote in the center: '" + q + "' Put a small dash and the text '— Kunal Khemu' below the quote in gold/orange text. Leave a circular empty space in the bottom-right corner for a portrait photo. Inspirational quote meme aesthetic.";
      },
      composite: "bottom_right_circle"
    },
    {
      name: "breaking_news",
      promptFn: () => {
        const h = pick(HEADLINES);
        const channels = ["KK NEWS", "KUNAL BROADCASTING CORP", "THE INEVITABLE NETWORK", "KHEMU TV WORLD", "KNN — KUNAL NEWS NOW"];
        const ch = pick(channels);
        return "Create a breaking news TV broadcast screenshot meme. Red banner at the bottom with 'BREAKING NEWS' in white bold text. The headline reads: '" + h + "'. A secondary text line says 'Source: Kunal Khemu'. Include a red 'LIVE' indicator in the top-right. Leave a large rectangular empty space on the right side of the screen for a person's photo. Professional news broadcast look. Channel name '" + ch + "'.";
      },
      composite: "news_anchor"
    },
    {
      name: "wanted",
      promptFn: () => {
        const c = pick(WANTED_CRIMES);
        return "Create a Wild West style 'WANTED' poster meme. Aged paper/parchment texture background. Big bold text at top: 'WANTED'. Below that: 'DEAD OR ALIVE'. Leave a large empty rectangular frame in the center where a photo would go. Below the frame write: 'KUNAL KHEMU'. Then: 'CRIME: " + c + "'. Then: 'REWARD: Immeasurable'. Old western typography style.";
      },
      composite: "center_frame"
    },
    {
      name: "currency",
      promptFn: () => {
        const c = pick(CURRENCIES);
        return "Create a fake currency banknote meme. Ornate border designs like a real banknote. Text at top: '" + c.bank + "'. Denomination: '" + c.denom + "'. Leave an oval/rectangular empty frame in the center-left where a portrait would go. Include serial numbers and official-looking text. Green/beige color scheme like US dollar. Text at bottom: '" + c.motto + "'.";
      },
      composite: "center_left_oval"
    },
    {
      name: "magazine",
      promptFn: () => {
        const m = pick(MAGAZINE_TITLES);
        return "Create a " + m.mag + " magazine cover meme. Iconic " + m.mag + " magazine styling and layout. Leave a large empty rectangular space in the center for a photo. Below the photo space, text reads '" + m.title + "' in bold. Smaller text: '" + m.sub + "'. At the bottom: 'Kunal Khemu'. Professional magazine cover look.";
      },
      composite: "center_frame"
    },
    {
      name: "mount_rushmore",
      promptFn: () => {
        const t = pick(RUSHMORE_TEXTS);
        return "Create a Mount Rushmore meme image. Show the mountain with 4 carved face-shaped indentations/outlines but leave the actual faces as blank/empty light-colored ovals where photos can be placed. Blue sky background. At the bottom text: '" + t + "'. Photorealistic style mountain with clearly empty face spots.";
      },
      composite: "rushmore_faces"
    },
    {
      name: "multiplication",
      promptFn: () => {
        const m = pick(MULTIPLICATION_CAPTIONS);
        return "Create a dark background meme image with a grid layout. The image should have text at the top saying '" + m.top + "' and show an exponential growth diagram: Row 1 has 1 empty circle, Row 2 has 2 empty circles, Row 3 has 4 empty circles, Row 4 has 8 smaller empty circles. Each circle should be a blank placeholder where a face will go. Dark dramatic background with slight glow around circles. Text at bottom: '" + m.bottom + "'";
      },
      composite: "fill_all_circles"
    },
    // Extra templates
    ...EXTRA_TEMPLATES
  ];

  const meme = pick(all);
  return {
    name: meme.name,
    prompt: meme.promptFn(),
    composite: meme.composite
  };
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ ok: true, gemini: !!GEMINI_KEY }));

// ── Generate meme ─────────────────────────────────────────────────────────────
app.post("/api/generate", async (_req, res) => {
  const logs = [];
  const log = (msg) => { logs.push("[" + new Date().toISOString() + "] " + msg); console.log(msg); };

  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY not configured on server.", logs });

  // Pick random meme type with dynamic content
  const meme = generateMemeConfig();
  log("Selected meme type: " + meme.name);
  log("Prompt length: " + meme.prompt.length + " chars");

  try {
    // Step 1: Gemini generates the template
    log("Calling Gemini API...");
    log("URL: " + GEMINI_URL);
    log("Key prefix: " + GEMINI_KEY.slice(0, 10) + "...");

    const reqBody = {
      contents: [{ parts: [{ text: meme.prompt }] }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
    };
    log("Request body keys: " + JSON.stringify(Object.keys(reqBody)));

    const r = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_KEY
      },
      body: JSON.stringify(reqBody)
    });

    log("Gemini HTTP status: " + r.status);
    log("Gemini response headers content-type: " + (r.headers.get("content-type") || "none"));

    const rawText = await r.text();
    log("Gemini raw response length: " + rawText.length + " chars");
    log("Gemini raw response preview: " + rawText.slice(0, 500));

    let b;
    try { b = JSON.parse(rawText); } catch (e) {
      log("ERROR: Failed to parse Gemini response as JSON: " + e.message);
      return res.status(500).json({ error: "Gemini returned non-JSON response", logs });
    }

    if (!r.ok) {
      const msg = b?.error?.message || "Unknown error";
      log("ERROR: Gemini API error: " + msg);
      return res.status(r.status).json({ error: "Gemini error " + r.status + ": " + msg, logs });
    }

    // Log response structure
    log("Gemini response candidates count: " + (b?.candidates?.length || 0));
    if (b?.candidates?.[0]) {
      const c = b.candidates[0];
      log("Candidate finish reason: " + (c.finishReason || "none"));
      const parts = c?.content?.parts || [];
      log("Parts count: " + parts.length);
      parts.forEach((p, i) => {
        if (p.text) log("Part " + i + ": TEXT (" + p.text.length + " chars): " + p.text.slice(0, 100));
        if (p.inlineData) log("Part " + i + ": IMAGE (" + p.inlineData.mimeType + ", " + p.inlineData.data.length + " b64 chars)");
        if (!p.text && !p.inlineData) log("Part " + i + ": UNKNOWN keys: " + JSON.stringify(Object.keys(p)));
      });
    } else {
      log("No candidates returned");
      if (b?.promptFeedback) log("Prompt feedback: " + JSON.stringify(b.promptFeedback));
    }

    const parts = b?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData);
    if (!imgPart) {
      log("ERROR: No image part found in response");
      return res.status(422).json({ error: "Gemini returned no image — try again.", logs });
    }

    log("Got image! Proceeding to composite...");

    // Step 2: Composite Kunal's face onto the template
    const templateBuf = Buffer.from(imgPart.inlineData.data, "base64");
    const kunalBuf = Buffer.from(KUNAL_B64, "base64");
    const meta = await sharp(templateBuf).metadata();
    const w = meta.width || 1024;
    const h = meta.height || 1024;
    log("Template image size: " + w + "x" + h);

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
    log("Composite done! Final image: " + resultB64.length + " b64 chars");

    return res.json({
      mimeType: "image/jpeg",
      data: resultB64,
      type: meme.name,
      logs
    });
  } catch (e) {
    log("EXCEPTION: " + e.message);
    log("Stack: " + (e.stack || "").slice(0, 300));
    return res.status(500).json({ error: e.message, logs });
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

  <details id="logsDetails" style="display:none;margin-bottom:16px">
    <summary style="font-size:12px;color:var(--muted);cursor:pointer">View debug logs</summary>
    <pre id="logsBox" style="font-size:11px;padding:14px;border-radius:10px;margin-top:8px;background:var(--card);border:1px solid var(--border);color:var(--muted);line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:400px;overflow:auto;font-family:monospace"></pre>
  </details>

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
  document.getElementById("logsDetails").style.display = "none";
  document.getElementById("logsBox").textContent = "";
  currentImage = null;

  try {
    setStatus("Gemini is creating your meme template + compositing Kunal's face...");
    var res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    var data = await res.json();

    // Always show logs if present
    if (data.logs && data.logs.length) {
      document.getElementById("logsBox").textContent = data.logs.join("\\n");
      document.getElementById("logsDetails").style.display = "block";
    }

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
    // logs should already be shown from the response above
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
