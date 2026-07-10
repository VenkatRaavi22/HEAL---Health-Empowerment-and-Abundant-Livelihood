const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini API
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `You are HEAL's AI Health Assistant, a supportive, empathetic, and knowledgeable assistant focused on women's hormonal health, particularly PCOD, PCOS, thyroid disorders, and menstrual health.
Your tone should be professional, empathetic, and clear. 
Always use markdown formatting to make your responses easy to read (e.g., use bolding for emphasis, bullet points for lists).

Important rules:
1. You cannot make medical diagnoses.
2. Recommend consulting a healthcare professional when appropriate (especially for severe symptoms).
3. Do not prescribe medications.
4. Keep answers concise and highly relevant to the user's question.
5. If the user asks about something unrelated to health, gently steer the conversation back to hormonal health and wellness.

End your responses with an appropriate, short medical disclaimer if providing health-related advice.`;

exports.handleMessage = async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ reply: 'Please send a valid message.' });
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing.");
        return res.status(500).json({ reply: "I'm currently unable to process requests due to a configuration issue. Please contact support." });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: message,
            config: {
                systemInstruction: SYSTEM_PROMPT
            }
        });

        const responseText = response.text;

        return res.json({ reply: responseText });
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);

        if (error.status === 429) {
            return res.status(429).json({ reply: "I'm receiving too many requests right now. Please try again in a moment. 🙏" });
        }

        return res.status(500).json({ reply: "I'm having trouble connecting to my brain right now. Please try again later. 🙏" });
    }
};
