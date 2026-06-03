/**
 * sentiment.js — Lexicon-Based Sentiment Analysis Engine
 *
 * Implements a lightweight, browser-native NLP sentiment classifier
 * using a curated lexicon with:
 *   - Positive/negative word scoring
 *   - Negation handling ("not good", "never happy")
 *   - Intensifier amplification ("very", "extremely")
 *   - Diminisher reduction ("slightly", "somewhat")
 *   - Emoticon/emoji recognition
 *   - Confidence scoring
 *
 * Based on principles from VADER (Valence Aware Dictionary and sEntiment Reasoner)
 * and the author's research in aspect-level sentiment analysis.
 *
 * Author: Juliet Chinenye Duru
 * ORCID:  0009-0002-0530-8082
 */

const SentimentEngine = (() => {

  // ── LEXICON ──────────────────────────────────────────────────
  // Each word maps to a valence score: -1.0 (very negative) to +1.0 (very positive)
  const LEXICON = {
    // Strong positive
    excellent: 0.9, outstanding: 0.9, fantastic: 0.9, amazing: 0.85,
    wonderful: 0.85, brilliant: 0.85, superb: 0.85, exceptional: 0.85,
    extraordinary: 0.9, magnificent: 0.9, phenomenal: 0.9, incredible: 0.85,
    perfect: 0.9, flawless: 0.85, spectacular: 0.85,

    // Moderate positive
    good: 0.6, great: 0.7, nice: 0.55, happy: 0.7, love: 0.75,
    like: 0.45, enjoy: 0.55, pleased: 0.6, glad: 0.6, delighted: 0.75,
    excited: 0.7, thrilled: 0.8, grateful: 0.65, thankful: 0.6,
    helpful: 0.55, useful: 0.5, impressive: 0.65, beautiful: 0.7,
    lovely: 0.65, positive: 0.55, optimistic: 0.6, confident: 0.55,
    proud: 0.6, satisfied: 0.6, comfortable: 0.5, calm: 0.45,
    hopeful: 0.6, encouraged: 0.6, inspired: 0.65, motivated: 0.6,
    successful: 0.65, productive: 0.55, effective: 0.5, efficient: 0.5,
    clear: 0.4, easy: 0.45, fun: 0.6, interesting: 0.5, fascinating: 0.65,
    learned: 0.45, understand: 0.4, right: 0.45, correct: 0.45,

    // Mild positive
    okay: 0.25, ok: 0.25, fine: 0.3, decent: 0.35, alright: 0.25,
    acceptable: 0.3, adequate: 0.25, reasonable: 0.35,

    // Strong negative
    terrible: -0.9, horrible: -0.9, awful: -0.85, dreadful: -0.85,
    atrocious: -0.9, disgusting: -0.85, appalling: -0.85, abysmal: -0.9,
    catastrophic: -0.9, disastrous: -0.85, hideous: -0.8,

    // Moderate negative
    bad: -0.6, wrong: -0.55, hate: -0.75, dislike: -0.5, angry: -0.65,
    sad: -0.6, upset: -0.6, unhappy: -0.65, disappointed: -0.65,
    frustrated: -0.65, annoyed: -0.55, confused: -0.4, lost: -0.4,
    worried: -0.55, anxious: -0.55, scared: -0.6, afraid: -0.55,
    nervous: -0.5, stressed: -0.6, overwhelmed: -0.6, exhausted: -0.55,
    tired: -0.45, bored: -0.45, difficult: -0.4, hard: -0.3,
    problem: -0.45, issue: -0.35, error: -0.5, mistake: -0.45,
    fail: -0.65, failed: -0.65, failure: -0.65, broken: -0.55,
    missing: -0.35, lacking: -0.4, poor: -0.55, weak: -0.45,
    useless: -0.65, pointless: -0.55, waste: -0.5, wrong: -0.55,
    unfair: -0.55, unjust: -0.6, corrupt: -0.7, dishonest: -0.65,

    // Mild negative
    unsure: -0.25, uncertain: -0.3, unclear: -0.3, complicated: -0.35,
    slow: -0.3, late: -0.3, limited: -0.25, minor: -0.15,

    // Emoticons (positive)
    ':)': 0.7, ':-)': 0.7, ':D': 0.8, ':-D': 0.8, ';)': 0.6,
    '😊': 0.7, '😀': 0.8, '😄': 0.8, '😃': 0.75, '🥰': 0.85,
    '❤️': 0.8, '👍': 0.65, '✅': 0.55, '🎉': 0.8, '🙌': 0.75,
    '💪': 0.65, '🔥': 0.6, '⭐': 0.6, '💯': 0.8,

    // Emoticons (negative)
    ':(' : -0.7, ':-(': -0.7, ":'(": -0.8,
    '😢': -0.7, '😭': -0.8, '😡': -0.75, '😠': -0.65,
    '😞': -0.65, '😟': -0.6, '👎': -0.65, '❌': -0.6,
    '😰': -0.6, '😱': -0.7,
  };

  // Negation words — invert the next scored word
  const NEGATIONS = new Set([
    'not', "n't", 'no', 'never', 'neither', 'nor', 'nobody',
    'nothing', 'nowhere', 'hardly', 'scarcely', 'barely', 'without',
    "don't", "doesn't", "didn't", "won't", "wouldn't", "can't",
    "couldn't", "isn't", "aren't", "wasn't", "weren't"
  ]);

  // Intensifiers — boost score magnitude
  const INTENSIFIERS = {
    very: 1.4, extremely: 1.6, incredibly: 1.5, absolutely: 1.5,
    totally: 1.35, completely: 1.4, utterly: 1.5, deeply: 1.3,
    really: 1.3, quite: 1.2, super: 1.35, so: 1.25,
    highly: 1.3, enormously: 1.5, tremendously: 1.5, insanely: 1.4,
    awfully: 1.3, terribly: 1.3, remarkably: 1.3, genuinely: 1.2,
  };

  // Diminishers — reduce score magnitude
  const DIMINISHERS = {
    slightly: 0.5, somewhat: 0.6, rather: 0.7, fairly: 0.7,
    pretty: 0.75, kind: 0.7, sort: 0.65, little: 0.5,
    bit: 0.55, mildly: 0.55, marginally: 0.4, barely: 0.3,
  };

  // ── TOKENISER ────────────────────────────────────────────────
  function tokenise(text) {
    // Preserve emoticons, then split on word boundaries
    const emoticonPattern = /[:;=8][\-o\*\']?[\)\(\[\]dDpP\/\:\}\{@\|\\]|[\)\(\[\]dDpP\/\:\}\{@\|\\][\-o\*\']?[:;=8]|[😀-🙏❤️👍👎✅❌⭐💯🔥💪🎉🙌]/gu;
    const emoticons = [];
    let cleaned = text.replace(emoticonPattern, (match) => {
      emoticons.push(match);
      return ` __EMO${emoticons.length - 1}__ `;
    });

    const tokens = cleaned
      .toLowerCase()
      .split(/[\s,\.!?;:]+/)
      .filter(Boolean)
      .map(t => t.replace(/^__emo(\d+)__$/, (_, i) => emoticons[parseInt(i)]));

    return tokens;
  }

  // ── ANALYSER ─────────────────────────────────────────────────
  function analyse(text) {
    if (!text || text.trim().length === 0) {
      return { score: 0, label: 'neutral', confidence: 0, positive: 0, negative: 0, neutral: 1, tokens: [] };
    }

    const tokens = tokenise(text);
    let scores = [];
    let negated = false;
    let intensifierMultiplier = 1.0;
    let diminisherMultiplier = 1.0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Check for negation
      if (NEGATIONS.has(token)) {
        negated = true;
        continue;
      }

      // Check for intensifier
      if (INTENSIFIERS[token]) {
        intensifierMultiplier = INTENSIFIERS[token];
        continue;
      }

      // Check for diminisher
      if (DIMINISHERS[token]) {
        diminisherMultiplier = DIMINISHERS[token];
        continue;
      }

      // Score the token
      if (LEXICON[token] !== undefined) {
        let val = LEXICON[token];
        val *= intensifierMultiplier;
        val *= diminisherMultiplier;
        if (negated) val *= -0.74; // Negate and slightly dampen (research-backed)
        scores.push(val);
        negated = false;
        intensifierMultiplier = 1.0;
        diminisherMultiplier = 1.0;
      } else {
        // Reset modifiers after non-lexicon word
        negated = false;
        intensifierMultiplier = 1.0;
        diminisherMultiplier = 1.0;
      }
    }

    if (scores.length === 0) {
      return { score: 0, label: 'neutral', confidence: 0.5, positive: 0.1, negative: 0.1, neutral: 0.8, tokens };
    }

    // Aggregate score (VADER-style: sum / sqrt(sum^2 + alpha))
    const alpha = 15;
    const rawSum = scores.reduce((a, b) => a + b, 0);
    const compound = rawSum / Math.sqrt(rawSum * rawSum + alpha);

    // Proportional breakdown
    const posScores = scores.filter(s => s > 0);
    const negScores = scores.filter(s => s < 0);
    const posSum = posScores.reduce((a, b) => a + b, 0);
    const negSum = Math.abs(negScores.reduce((a, b) => a + b, 0));
    const total = posSum + negSum + 0.01;
    const neuRatio = Math.max(0, 1 - scores.length * 0.1);

    const positive = posSum / (total + neuRatio);
    const negative = negSum / (total + neuRatio);
    const neutral  = Math.max(0, 1 - positive - negative);

    // Label
    let label, confidence;
    if (compound >= 0.05) {
      label = 'positive';
      confidence = Math.min(0.99, 0.5 + compound * 0.5);
    } else if (compound <= -0.05) {
      label = 'negative';
      confidence = Math.min(0.99, 0.5 + Math.abs(compound) * 0.5);
    } else {
      label = 'neutral';
      confidence = 0.5 + (1 - Math.abs(compound)) * 0.3;
    }

    return {
      score: parseFloat(compound.toFixed(4)),
      label,
      confidence: parseFloat(confidence.toFixed(2)),
      positive: parseFloat(positive.toFixed(2)),
      negative: parseFloat(negative.toFixed(2)),
      neutral:  parseFloat(neutral.toFixed(2)),
      tokens,
    };
  }

  // ── PUBLIC API ───────────────────────────────────────────────
  return { analyse, tokenise };

})();
