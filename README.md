# Kunal Khemu Meme Generator

Gemini invents and generates a brand new Kunal Khemu meme every time. He is inevitable.

## Deploy

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "init"
gh repo create kunal-meme-generator --public --push
```

Or create a repo on github.com, then push manually.

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
2. Select `kunal-meme-generator`
3. Go to **Variables** tab and add:
   - `GEMINI_API_KEY` → your key from [aistudio.google.com](https://aistudio.google.com)
4. Go to **Settings** → **Networking** → **Generate Domain**
5. Open your public URL — hit Generate Meme

### 3. Use

Just open the URL and click **Generate Meme**. No keys needed in the browser — everything is server-side.

## How It Works

```
Browser → POST /api/generate
                ↓
       Server calls Gemini (using GEMINI_API_KEY env var)
       Gemini writes the meme concept + generates the image in one call
                ↓
       Base64 image returned to browser
                ↓
       Image displayed + Download PNG available
```

## Environment Variables

| Variable | Required | Source |
|---|---|---|
| `GEMINI_API_KEY` | Yes | [aistudio.google.com](https://aistudio.google.com) |

## Stack

- **Server**: Express.js (Node 18+)
- **AI**: Gemini 3 Flash (writes concept + generates image in one call)
- **Frontend**: Vanilla HTML/CSS/JS served by Express
- **Hosting**: Railway
