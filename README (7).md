# SentiMind — Sentiment-Aware NLP Chatbot

> **Applied NLP Research** | Lexicon-Based Sentiment Analysis | Adaptive Dialogue | Vanilla JavaScript

[![NLP](https://img.shields.io/badge/NLP-Sentiment%20Analysis-00d4b4)](https://github.com/JulietChinenyeDuru/chatbot)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen)](https://github.com/JulietChinenyeDuru/chatbot)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Overview

**SentiMind** is a fully browser-native, sentiment-aware chatbot that analyses the emotional tone of user messages in real time and adapts its responses accordingly. It demonstrates the practical application of **Natural Language Processing (NLP) sentiment analysis** — translating academic research directly into a deployable, interactive application.

The project bridges two areas of the author's work: **NLP/sentiment analysis research** (8 peer-reviewed publications) and **applied AI engineering** — showing that theoretical understanding of sentiment models translates into real, working systems.

---

## Live Demo

🔗 **[Try SentiMind](https://github.com/JulietChinenyeDuru/chatbot)** — open `index.html` in any browser, no installation needed.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Real-time sentiment detection** | Analyses emotional tone as you type, before you even send |
| **Sentiment-adaptive responses** | The same question gets different responses depending on detected emotion |
| **Compound score display** | Shows positive/negative/neutral breakdown with confidence percentage |
| **Negation handling** | Correctly processes "not good", "never happy", "don't like" |
| **Intensifier amplification** | "Very happy" scores higher than "happy"; "extremely bad" scores lower than "bad" |
| **Emoticon recognition** | 😊 :) 👍 contribute to positive score; 😢 :( 👎 to negative |
| **Live sentiment gauge** | Visual gauge and session statistics update with each message |
| **Zero dependencies** | Pure HTML/CSS/JavaScript — no frameworks, no APIs, no build tools |

---

## NLP Engine Architecture

```
User Input Text
      │
      ▼
┌─────────────────────────────────────────────┐
│              TOKENISER                       │
│  • Preserves emoticons before splitting      │
│  • Lowercases and normalises input           │
│  • Produces token array                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           LEXICON LOOKUP (~120 words)        │
│  • Each token looked up in valence lexicon   │
│  • Scores range from -1.0 to +1.0           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           MODIFIER DETECTION                 │
│  • Negation: "not", "never", "n't" → ×-0.74 │
│  • Intensifier: "very", "extremely" → ×1.4+ │
│  • Diminisher: "slightly", "barely" → ×0.5  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        COMPOUND SCORE AGGREGATION            │
│  score = Σ(vals) / √(Σ(vals)² + α)         │
│  Output: -1.0 (very negative) → +1.0        │
│  Threshold: ≥0.05 positive, ≤-0.05 negative │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       SENTIMENT-ADAPTIVE RESPONSE ENGINE     │
│  • Matches intent from message content       │
│  • Selects response pool by sentiment label  │
│  • Returns contextually appropriate reply    │
└─────────────────────────────────────────────┘
```

---

## Sentiment Engine: Technical Detail

The `sentiment.js` module implements a **lexicon-based approach** inspired by the VADER (Valence Aware Dictionary and sEntiment Reasoner) model. Key design decisions:

**Negation handling** follows the VADER convention of multiplying the following word's score by -0.74 rather than -1.0, preserving the insight that "not good" is less negative than "bad."

**Compound score formula:** `score = Σ / √(Σ² + α)` normalises the raw sum to the range (-1, 1) regardless of sentence length. `α = 15` was selected empirically.

**Thresholds:** ≥0.05 = positive, ≤-0.05 = negative, between = neutral. These match the published VADER thresholds.

**Confidence** is derived from the distance of the compound score from zero, ranging from 0.5 (pure neutral) to 0.99 (extreme polarity).

---

## Project Structure

```
chatbot/
├── index.html      # Application shell and layout
├── style.css       # Dark editorial UI with CSS custom properties
├── sentiment.js    # Lexicon-based NLP sentiment engine
├── chatbot.js      # Intent matching + sentiment-adaptive response engine
├── app.js          # UI orchestration, real-time preview, stats
└── README.md
```

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/JulietChinenyeDuru/chatbot.git
cd chatbot

# Open directly in browser — no build step needed
open index.html
```

---

## Example Interactions

| User Input | Detected Sentiment | Bot Behaviour |
|------------|-------------------|---------------|
| "I'm feeling amazing today!" | Positive (0.72) | Enthusiastic, affirming response |
| "I'm so frustrated and lost" | Negative (-0.65) | Empathetic, supportive response |
| "How does sentiment analysis work?" | Neutral (0.01) | Technical explanation |
| "I'm NOT happy with this" | Negative (-0.38) | Negation correctly processed |
| "This is very very good 😊" | Positive (0.89) | Intensifier + emoticon boost detected |

---

## Connection to Research

This project is grounded in the author's academic research in NLP and sentiment analysis. The lexicon-based engine here represents **Tier 1** of the KG-SentIF research framework:

```
Tier 1 (This project):  Lexicon-based sentiment · browser-native · interpretable
Tier 2 (Planned):       Transformer-based (BERT/RoBERTa) · fine-tuned on social media
Tier 3 (PhD research):  KG-SentIF — Knowledge Graph-Enhanced Sentiment Intelligence
                        · Wikidata + ConceptNet enrichment
                        · Graph Neural Network reasoning
                        · Aspect-level granularity
                        · Confidence calibration
```

SentiMind demonstrates that NLP sentiment research is not purely theoretical — it produces working, deployable systems that adapt to human emotional context in real time.

---

## Skills Demonstrated

- Natural Language Processing (lexicon-based sentiment analysis)
- Negation, intensifier, and diminisher handling in NLP pipelines
- VADER-inspired compound score aggregation
- Sentiment-adaptive dialogue system design
- Vanilla JavaScript (no frameworks)
- Responsive CSS layout with CSS custom properties
- Real-time DOM manipulation and event-driven UI
- Canvas API (particle background animation)

---

## Extending SentiMind

The codebase is structured for easy extension:

**Upgrade the sentiment engine** → swap `sentiment.js` for a transformer-based model via TensorFlow.js or a REST API (Hugging Face Inference API)

**Add new conversation topics** → add an object to the `INTENTS` array in `chatbot.js` with patterns and sentiment-keyed responses

**Persist sessions** → add a backend (Node.js/Flask) to store conversation history

**Aspect-level analysis** → extend the engine to detect sentiment about specific entities within a sentence (the KG-SentIF direction)

---

## Author

**Juliet Chinenye Duru**
NLP Researcher · DevOps/Cloud Engineer · Agentic AI Engineer
MSc Information Technology with Distinction, University of the West of Scotland (2024)
8 peer-reviewed publications in NLP and AI

[GitHub](https://github.com/JulietChinenyeDuru) · [ORCID: 0009-0002-0530-8082](https://orcid.org/0009-0002-0530-8082) · [AgricAI-Insight](https://agriai-insight.netlify.app/)

---

## License

MIT License — see [LICENSE](LICENSE) for details.
