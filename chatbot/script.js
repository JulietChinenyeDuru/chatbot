const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';

    setTimeout(() => {
        const response = generateResponse(message);
        addMessage(response, 'bot');
    }, 500);
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const p = document.createElement('p');
    p.textContent = text;
    messageDiv.appendChild(p);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
        return "Hello! How can I assist you today?";
    }
    
    // How are you
    if (lowerMessage.includes('how are you')) {
        return "I'm doing great, thank you for asking! How can I help you?";
    }
    
    // Name
    if (lowerMessage.includes('your name') || lowerMessage.includes('who are you')) {
        return "I'm ChatBot, your friendly AI assistant!";
    }
    
    // Time
    if (lowerMessage.includes('time')) {
        const now = new Date();
        return `The current time is ${now.toLocaleTimeString()}.`;
    }
    
    // Date
    if (lowerMessage.includes('date') || lowerMessage.includes('today')) {
        const now = new Date();
        return `Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }
    
    // Help
    if (lowerMessage.includes('help')) {
        return "I can chat with you, tell you the time and date, and answer basic questions. Just type your message!";
    }
    
    // Thanks
    if (lowerMessage.match(/(thank|thanks)/)) {
        return "You're welcome! Is there anything else I can help you with?";
    }
    
    // Bye
    if (lowerMessage.match(/^(bye|goodbye|see you)/)) {
        return "Goodbye! Have a great day!";
    }
    
    // Weather
    if (lowerMessage.includes('weather')) {
        return "I don't have access to weather data yet, but you can check the weather app for that!";
    }
    
    // Joke
    if (lowerMessage.includes('joke')) {
        const jokes = [
            "Why don't programmers like nature? It has too many bugs!",
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "How many programmers does it take to change a light bulb? None, that's a hardware problem!"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Default responses
    const defaultResponses = [
        "That's interesting! Tell me more.",
        "I see. Can you elaborate on that?",
        "Interesting question! I'm still learning about that topic.",
        "I understand. What else would you like to know?",
        "That's a good point! Anything else on your mind?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}
