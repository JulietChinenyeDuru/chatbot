/**
 * chatbot.js — Sentiment-Adaptive Response Engine
 *
 * Generates contextually appropriate responses based on:
 *  1. Detected user intent (what they're asking about)
 *  2. Detected sentiment (emotional tone)
 *
 * Response selection is sentiment-aware: the same intent yields
 * different replies depending on whether the user is positive,
 * neutral, or negative, demonstrating applied sentiment intelligence.
 *
 * Author: Juliet Chinenye Duru
 * ORCID:  0009-0002-0530-8082
 */

const ChatbotEngine = (() => {

  // ── INTENT DEFINITIONS ───────────────────────────────────────
  // Each intent has: patterns to match + responses keyed by sentiment
  const INTENTS = [

    {
      id: 'greeting',
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings', 'what\'s up', 'whats up'],
      responses: {
        positive: [
          "Hello! Your positive energy is wonderful to see 😊 I'm SentiMind, your sentiment-aware NLP assistant. What's on your mind today?",
          "Hey there! Love the great vibes! I'm here and ready to chat. What would you like to explore?",
        ],
        neutral: [
          "Hello! I'm SentiMind — an NLP chatbot that analyses the emotional tone of your messages. What can I help you with?",
          "Hi there! Great to meet you. I use sentiment analysis to understand your messages better. Feel free to ask me anything.",
        ],
        negative: [
          "Hello. I can sense things might not be at their best right now — that's okay. I'm here to listen and help in any way I can.",
          "Hey. I'm SentiMind, and I'm here for you. No matter how you're feeling, you're welcome here. What would you like to talk about?",
        ],
      },
    },

    {
      id: 'sentiment_ask',
      patterns: ['what is sentiment', 'explain sentiment', 'what is sentiment analysis', 'how do you analyse', 'how does this work', 'what do you do', 'how does sentiment work', 'what is nlp'],
      responses: {
        positive: [
          "Great question! Sentiment analysis is a branch of NLP (Natural Language Processing) that determines the emotional tone of text — positive, negative, or neutral. I'm using a lexicon-based approach where each word in your message is scored for valence, then combined using an aggregation formula similar to VADER. Right now, your messages are reading as quite positive! 🌟",
          "Sentiment analysis identifies emotional polarity in text. My engine scores individual words from a curated lexicon, handles negations (like 'not good'), amplifies intensifiers (like 'very'), and computes a compound sentiment score. It's core to my research in aspect-level sentiment analysis!",
        ],
        neutral: [
          "Sentiment analysis is an NLP technique that classifies the emotional tone of text as positive, negative, or neutral. My engine works by: (1) tokenising your input, (2) looking up each word in a sentiment lexicon, (3) applying modifiers like negations and intensifiers, and (4) computing a compound score from -1 to +1.",
          "Great question! Sentiment analysis detects emotional polarity in text. I use a lexicon-based approach inspired by VADER, with negation handling and intensifier amplification built in. Try saying something strongly positive or negative and watch the sentiment gauge update!",
        ],
        negative: [
          "Sentiment analysis is an NLP technique that helps understand emotions in text. Even when things feel difficult, understanding emotional patterns can be empowering. My engine analyses word-level valence in your messages — I can see you might be going through something tough right now.",
          "NLP sentiment analysis classifies text as positive, negative, or neutral. My engine is picking up on some negative signals in your messages. Would you like to talk about what's on your mind?",
        ],
      },
    },

    {
      id: 'about_research',
      patterns: ['your research', 'research', 'publications', 'nlp research', 'kg-sentif', 'knowledge graph', 'aspect sentiment', 'who made you', 'who built you', 'who created you', 'your author'],
      responses: {
        positive: [
          "I was built by Juliet Chinenye Duru, an NLP researcher and Cloud/AI Engineer with 8 peer-reviewed publications in NLP and AI. Her research focuses on KG-SentIF — a Knowledge Graph-Enhanced Sentiment Intelligence Framework for aspect-level sentiment analysis using transformers and graph neural networks. I'm a practical demonstration of that research! 🎓",
          "My creator is Juliet Chinenye Duru — researcher, lecturer, and engineer. Her work on KG-SentIF explores how knowledge graphs (Wikidata, ConceptNet) can enrich transformer-based sentiment models. This chatbot bridges her academic NLP research and applied AI engineering.",
        ],
        neutral: [
          "I was created by Juliet Chinenye Duru, an NLP researcher with 8 published papers. Her research area is aspect-level sentiment analysis — analysing sentiment at a granular level within text. I demonstrate the practical application of her research. You can find her work via ORCID: 0009-0002-0530-8082.",
          "My author is Juliet Chinenye Duru — ICT lecturer, DevOps/Cloud Engineer, and AI researcher. Her PhD research proposal, KG-SentIF, combines knowledge graphs with transformer-based NLP for fine-grained sentiment analysis. I'm the applied side of that work.",
        ],
        negative: [
          "I was built by Juliet Chinenye Duru, an NLP researcher whose work focuses on understanding human emotion through text — which feels relevant right now. Her research aims to make AI systems that are genuinely aware of how people feel. Is there anything I can do to help you feel better?",
        ],
      },
    },

    {
      id: 'feelings_positive',
      patterns: ['i am happy', 'i feel good', 'i am great', 'feeling great', 'feeling happy', 'i am excited', 'i feel amazing', 'doing well', 'i am doing well', 'things are good', 'life is good'],
      responses: {
        positive: [
          "That's genuinely great to hear! 😊 Your sentiment score is confirming the positive energy in your message. Positive emotional states have been shown to improve cognitive performance and creativity — make the most of it!",
          "Wonderful! My sentiment engine is registering strongly positive scores from your message. Positive affect — that's the technical term — is associated with broader attention and more flexible thinking. Keep it up!",
        ],
        neutral: [
          "That's good to hear! I can detect positive signals in your message. Is there anything specific making you feel this way, or would you like to explore something together?",
        ],
        negative: [
          "I'm glad things are looking up. My sentiment engine is picking up on positive language even if things feel uncertain — sometimes the words we use shape our experience.",
        ],
      },
    },

    {
      id: 'feelings_negative',
      patterns: ['i am sad', 'i feel bad', 'i am unhappy', 'feeling low', 'feeling down', 'i am stressed', 'i feel terrible', 'things are bad', 'having a bad day', 'i am struggling', 'i feel lost', 'i am worried', 'i am anxious', 'i feel awful'],
      responses: {
        positive: [
          "I hear you — despite some positive language, I'm detecting emotional difficulty in your message. It's okay to not be okay. What would help most right now?",
        ],
        neutral: [
          "I'm sorry to hear that. My sentiment engine has flagged negative signals in your message. Sometimes naming the feeling — stressed, anxious, overwhelmed — is the first step. What's going on?",
          "That sounds difficult. I'm detecting a negative emotional tone. I'm here to listen — would you like to talk through what's happening?",
        ],
        negative: [
          "I can clearly see the difficulty in your words — my sentiment analysis is confirming it. That takes courage to express. You don't have to work through it alone. Is there something specific weighing on you?",
          "I can sense this is genuinely hard. Negative sentiment is clearly present. Please know that difficult feelings are valid, and reaching out — even to a chatbot — shows strength. What would help most right now?",
        ],
      },
    },

    {
      id: 'tech_question',
      patterns: ['how do you work', 'your code', 'javascript', 'lexicon', 'algorithm', 'machine learning', 'deep learning', 'transformer', 'bert', 'nlp model', 'how are you built', 'your architecture'],
      responses: {
        positive: [
          "Great question! I'm built with a lexicon-based sentiment engine in vanilla JavaScript — no external APIs or ML frameworks needed in the browser. My sentiment.js module uses a curated lexicon of ~120 words with valence scores, handles negations, intensifiers, and diminishers, then computes a compound score using a formula inspired by VADER. Want to explore the GitHub repo?",
          "I love technical curiosity! My architecture: (1) sentiment.js — lexicon-based NLP engine with negation handling, (2) chatbot.js — intent matcher with sentiment-adaptive responses, (3) app.js — UI orchestration. It's a clean, dependency-free implementation that demonstrates NLP fundamentals. The next version (KG-SentIF) will use transformers and knowledge graphs!",
        ],
        neutral: [
          "Technically, I use: a tokeniser that preserves emoticons, a ~120-word valence lexicon, negation detection ('not good' → negative), intensifier amplification ('very good' → stronger positive), and a VADER-inspired compound score formula. All in pure JavaScript — no backend, no ML frameworks.",
          "My NLP pipeline: tokenise → lookup lexicon → apply negation/intensifier modifiers → aggregate compound score. The compound ranges from -1 (very negative) to +1 (very positive). The thresholds are ≥0.05 for positive and ≤-0.05 for negative, consistent with the VADER paper.",
        ],
        negative: [
          "I'm built on lexicon-based NLP — a transparent, interpretable approach to sentiment. Unlike black-box neural models, every score I produce can be traced back to specific words. If something isn't working as you'd expect, let me know and I can explain my reasoning.",
        ],
      },
    },

    {
      id: 'about_agric',
      patterns: ['agriculture', 'farming', 'crop', 'agrici', 'agric', 'nigeria', 'smallholder', 'yield'],
      responses: {
        positive: [
          "You might be thinking of AgricAI-Insight — my author Juliet's full-stack AI system for crop yield prediction for Nigerian smallholder farmers! It's a separate deployed project at agriai-insight.netlify.app. My focus is NLP and sentiment, but they share the same vision: AI for social good.",
        ],
        neutral: [
          "That sounds like it's related to AgricAI-Insight — Juliet's deployed AI crop yield prediction system for Nigerian farmers. It uses ML models to help smallholder farmers make better decisions. Want to know more about the sentiment/NLP side of her work instead?",
        ],
        negative: [
          "Agriculture and food security are serious concerns for millions. Juliet's AgricAI-Insight project was built precisely for that — helping Nigerian smallholder farmers access AI-powered crop yield predictions. Important work that deserves more attention.",
        ],
      },
    },

    {
      id: 'thanks',
      patterns: ['thank you', 'thanks', 'thank', 'appreciate', 'helpful', 'great help', 'cheers'],
      responses: {
        positive: [
          "You're very welcome! 😊 It's been a pleasure. The positive sentiment in your message is mutual!",
          "Glad I could help! Your positive energy makes this conversation a joy.",
        ],
        neutral: [
          "You're welcome! Feel free to come back anytime you want to explore NLP, sentiment analysis, or just have a chat.",
          "Happy to help! Is there anything else you'd like to explore?",
        ],
        negative: [
          "You're welcome. I hope things start to look up soon. I'm always here if you need to talk.",
        ],
      },
    },

    {
      id: 'goodbye',
      patterns: ['bye', 'goodbye', 'see you', 'take care', 'farewell', 'exit', 'quit', 'leave'],
      responses: {
        positive: [
          "Goodbye! 🌟 It's been a wonderful conversation. Come back anytime — SentiMind will be here!",
          "Take care! Your positive energy has made this a great session. See you soon!",
        ],
        neutral: [
          "Goodbye! Thanks for chatting with SentiMind. Come back anytime.",
          "Take care! It was great talking with you.",
        ],
        negative: [
          "Goodbye. I hope things feel lighter soon. Please take care of yourself — you matter.",
          "Take care. Come back whenever you need to talk. I'll be here.",
        ],
      },
    },

  ];

  // ── FALLBACK RESPONSES (sentiment-aware) ────────────────────
  const FALLBACKS = {
    positive: [
      "That's interesting! I'm still growing my knowledge base. Could you tell me more? Your positive energy makes me want to understand better.",
      "I love your enthusiasm! I don't have a specific answer for that yet, but I'm here to explore it with you.",
    ],
    neutral: [
      "That's an interesting point. I may not have a specific answer, but I can discuss NLP, sentiment analysis, and AI research — or just chat. What would you like to explore?",
      "I'm not sure I fully understood that. Could you rephrase? I'm best at discussing NLP, sentiment analysis, and AI topics.",
    ],
    negative: [
      "I want to help, even if I don't have a perfect answer. What's most on your mind right now?",
      "I hear frustration in your message. I may not have the exact answer, but I'm here to listen. What would help most?",
    ],
  };

  // ── INTENT MATCHER ───────────────────────────────────────────
  function matchIntent(text) {
    const lower = text.toLowerCase();
    const tokens = lower.split(/[\s,\.!?]+/);

    let bestIntent = null;
    let bestScore = 0;

    for (const intent of INTENTS) {
      for (const pattern of intent.patterns) {
        if (lower.includes(pattern)) {
          const score = pattern.split(' ').length; // longer match = higher priority
          if (score > bestScore) {
            bestScore = score;
            bestIntent = intent;
          }
        }
      }
    }

    return bestIntent;
  }

  // ── RESPONSE SELECTOR ────────────────────────────────────────
  function selectResponse(responses, label) {
    const pool = responses[label] || responses['neutral'] || [];
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── MAIN RESPONSE FUNCTION ───────────────────────────────────
  function respond(userText, sentimentResult) {
    const intent = matchIntent(userText);
    const label = sentimentResult.label; // 'positive' | 'neutral' | 'negative'

    if (intent) {
      const response = selectResponse(intent.responses, label);
      if (response) return { text: response, intent: intent.id };
    }

    // Fallback
    const fallbackPool = FALLBACKS[label] || FALLBACKS['neutral'];
    const fallback = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
    return { text: fallback, intent: 'fallback' };
  }

  return { respond, matchIntent };

})();
