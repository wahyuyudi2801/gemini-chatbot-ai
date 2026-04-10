import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-2.5-flash-lite';

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if (!Array.isArray(conversation)) {
            throw new Error('Conversation must be an array');
        }

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }))

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: "Jawab dengan bahasa indonesia",
            }
        })

        res.status(200).json({
            response: response.text
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});