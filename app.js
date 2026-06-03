/**
 * app.js — SentiMind UI Orchestration
 *
 * Connects the sentiment engine (sentiment.js) and response engine
 * (chatbot.js) to the DOM, managing:
 *   - Message rendering and scroll behaviour
 *   - Real-time sentiment preview as user types
 *   - Sidebar stats and gauge updates
 *   - Typing simulation
 *   - Background particle animation
 *   - Mobile sidebar toggle
 *
 * Author: Juliet Chinenye Duru
 */

(function () {
  'use strict';

  // ── DOM REFS ──────────────────────────────────────────────────
  const messagesEl    = document.getElementById('chat-messages');
  const inputEl       = document.getElementById('user-input');
  const sendBtn       = document.getElementById('send-btn');
  const typingEl      = document.getElementById('typing-indicator');
  const gaugeFill     = document.getElementById('gauge-fill');
  const badgeDot      = document.getElementById('badge-dot');
  const badgeLabel    = document.getElementById('badge-label');
  const sentPreview   = document.getElementById('sentiment-preview');
  const previewLabel  = document.getElementById('preview-label');
  const statMessages  = document.getElementById('stat-messages');
  const statSentiment = document.getElementById('stat-sentiment');
  const statPositive  = document.getElementById('stat-positive');
  const statNegative  = document.getElementById('stat-negative');
  const clearBtn      = document.getElementById('clear-btn');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar       = document.querySelector('.sidebar');

  // ── SESSION STATE ─────────────────────────────────────────────
  let messageCount   = 0;
  let scoreHistory   = [];
  let positiveCount  = 0;
  let negativeCount  = 0;
  let isTyping       = false;

  // ── WELCOME MESSAGE ───────────────────────────────────────────
  function showWelcome() {
    const card = document.createElement('div');
    card.className = 'welcome-card';
    card.innerHTML = `
      <div class="welcome-icon">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="1.5"/>
          <path d="M10 16 Q16 8 22 16 Q16 24 10 16Z" fill="currentColor" opacity="0.6"/>
          <circle cx="16" cy="16" r="3" fill="currentColor"/>
        </svg>
      </div>
      <h2>Welcome to SentiMind</h2>
      <p>I'm a sentiment-aware NLP assistant. I analyse the emotional tone of your messages in real time and adapt my responses accordingly — demonstrating applied Natural Language Processing research.</p>
      <div class="welcome-chips">
        <button class="chip" data-text="Hello! I'm feeling great today.">😊 Say something positive</button>
        <button class="chip" data-text="I'm feeling quite frustrated and overwhelmed.">😔 Say something negative</button>
        <button class="chip" data-text="How does sentiment analysis work?">🧠 Explain sentiment analysis</button>
        <button class="chip" data-text="Tell me about your research.">🎓 About the research</button>
      </div>
    `;
    messagesEl.appendChild(card);

    // Chip click handlers
    card.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        inputEl.value = chip.dataset.text;
        handleInput();
        autoResize();
        sendMessage();
      });
    });
  }

  // ── RENDER MESSAGE ────────────────────────────────────────────
  function renderMessage(text, role, sentiment = null) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    wrapper.appendChild(bubble);

    // Sentiment tag for user messages
    if (role === 'user' && sentiment) {
      const tag = document.createElement('div');
      tag.className = `sentiment-tag ${sentiment.label}`;
      const emoji = sentiment.label === 'positive' ? '↑' : sentiment.label === 'negative' ? '↓' : '→';
      tag.innerHTML = `<span>${emoji}</span> ${sentiment.label} · score ${sentiment.score > 0 ? '+' : ''}${sentiment.score}`;
      wrapper.appendChild(tag);
    }

    // Score breakdown for bot messages
    if (role === 'bot' && sentiment) {
      const breakdown = document.createElement('div');
      breakdown.className = 'score-breakdown';
      breakdown.innerHTML = `
        <div class="score-row">
          <span class="score-label">Positive</span>
          <div class="score-bar-bg"><div class="score-bar pos" style="width:${(sentiment.positive * 100).toFixed(0)}%"></div></div>
          <span class="score-pct">${(sentiment.positive * 100).toFixed(0)}%</span>
        </div>
        <div class="score-row">
          <span class="score-label">Negative</span>
          <div class="score-bar-bg"><div class="score-bar neg" style="width:${(sentiment.negative * 100).toFixed(0)}%"></div></div>
          <span class="score-pct">${(sentiment.negative * 100).toFixed(0)}%</span>
        </div>
        <div class="score-row">
          <span class="score-label">Neutral</span>
          <div class="score-bar-bg"><div class="score-bar neu" style="width:${(sentiment.neutral * 100).toFixed(0)}%"></div></div>
          <span class="score-pct">${(sentiment.neutral * 100).toFixed(0)}%</span>
        </div>
      `;
      wrapper.appendChild(breakdown);
    }

    // Timestamp
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wrapper.appendChild(time);

    messagesEl.appendChild(wrapper);
    scrollToBottom();
    return wrapper;
  }

  // ── SCROLL ────────────────────────────────────────────────────
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── UPDATE SIDEBAR ────────────────────────────────────────────
  function updateSidebar(sentiment) {
    // Gauge: map score from [-1,1] to [5%,95%]
    const pct = ((sentiment.score + 1) / 2 * 90 + 5);
    gaugeFill.style.width = pct + '%';

    // Badge
    badgeDot.className = 'badge-dot ' + sentiment.label;
    const labelMap = {
      positive: `Positive · ${(sentiment.confidence * 100).toFixed(0)}% confidence`,
      negative: `Negative · ${(sentiment.confidence * 100).toFixed(0)}% confidence`,
      neutral:  `Neutral · ${(sentiment.confidence * 100).toFixed(0)}% confidence`,
    };
    badgeLabel.textContent = labelMap[sentiment.label];

    // Stats
    messageCount++;
    scoreHistory.push(sentiment.score);
    if (sentiment.label === 'positive') positiveCount++;
    if (sentiment.label === 'negative') negativeCount++;

    statMessages.textContent = messageCount;
    const avg = scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length;
    statSentiment.textContent = avg > 0.05 ? '😊' : avg < -0.05 ? '😔' : '😐';
    statPositive.textContent  = positiveCount;
    statNegative.textContent  = negativeCount;
  }

  // ── TYPING SIMULATION ─────────────────────────────────────────
  function showTyping() {
    isTyping = true;
    typingEl.classList.add('visible');
    scrollToBottom();
  }

  function hideTyping() {
    isTyping = false;
    typingEl.classList.remove('visible');
  }

  // ── SEND MESSAGE ──────────────────────────────────────────────
  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isTyping) return;

    // Remove welcome card if present
    const welcome = messagesEl.querySelector('.welcome-card');
    if (welcome) welcome.remove();

    // Analyse user sentiment
    const sentiment = SentimentEngine.analyse(text);

    // Render user message
    renderMessage(text, 'user', sentiment);

    // Update sidebar
    updateSidebar(sentiment);

    // Clear input
    inputEl.value = '';
    sendBtn.disabled = true;
    previewLabel.textContent = 'Type a message to analyse sentiment';
    sentPreview.className = 'sentiment-preview';
    autoResize();

    // Simulate typing delay (proportional to response complexity)
    const delay = 800 + Math.random() * 600;
    showTyping();

    setTimeout(() => {
      hideTyping();

      // Get bot response
      const { text: responseText } = ChatbotEngine.respond(text, sentiment);

      // Render bot response with sentiment breakdown
      renderMessage(responseText, 'bot', sentiment);

    }, delay);
  }

  // ── REAL-TIME PREVIEW ─────────────────────────────────────────
  function handleInput() {
    const text = inputEl.value.trim();
    sendBtn.disabled = text.length === 0;

    if (text.length < 3) {
      previewLabel.textContent = 'Type a message to analyse sentiment';
      sentPreview.className = 'sentiment-preview';
      return;
    }

    const s = SentimentEngine.analyse(text);
    const arrow = s.label === 'positive' ? '↑' : s.label === 'negative' ? '↓' : '→';
    const conf = (s.confidence * 100).toFixed(0);
    previewLabel.textContent = `${arrow} Detecting ${s.label} sentiment · score ${s.score > 0 ? '+' : ''}${s.score} · ${conf}% confidence`;
    sentPreview.className = `sentiment-preview ${s.label}`;

    // Live gauge update
    const pct = ((s.score + 1) / 2 * 90 + 5);
    gaugeFill.style.width = pct + '%';
    badgeDot.className = 'badge-dot ' + s.label;
    badgeLabel.textContent = `Typing... ${s.label}`;
  }

  // ── AUTO RESIZE TEXTAREA ──────────────────────────────────────
  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 140) + 'px';
  }

  // ── CLEAR CONVERSATION ────────────────────────────────────────
  function clearConversation() {
    messagesEl.innerHTML = '';
    messageCount = 0;
    scoreHistory = [];
    positiveCount = 0;
    negativeCount = 0;
    statMessages.textContent = '0';
    statSentiment.textContent = '—';
    statPositive.textContent = '0';
    statNegative.textContent = '0';
    gaugeFill.style.width = '50%';
    badgeDot.className = 'badge-dot';
    badgeLabel.textContent = 'Awaiting input...';
    showWelcome();
  }

  // ── BACKGROUND PARTICLES ──────────────────────────────────────
  function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
      };
    }

    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 80; i++) particles.push(createParticle());

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 180, ${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });

      // Draw faint connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 212, 180, ${0.04 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  // ── EVENT LISTENERS ───────────────────────────────────────────
  inputEl.addEventListener('input', () => { handleInput(); autoResize(); });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);
  clearBtn.addEventListener('click', clearConversation);

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // ── INIT ──────────────────────────────────────────────────────
  showWelcome();
  initParticles();

})();
