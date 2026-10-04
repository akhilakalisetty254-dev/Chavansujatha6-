import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System instruction for the multi-turn CampusBot assistant
const CAMPUS_BOT_SYSTEM_INSTRUCTION = `You are CampusBot, the official AI Peer Rental Advisor for CampusShare — a student-to-student peer rental and reuse platform.
Your mission is to help college students rent, borrow, share, and reuse equipment affordably and safely.

Your key capabilities & roles:
1. Campus Item Matchmaker: Recommend ideal items for students based on their course, project, hostel need, or budget.
2. Fair Pricing & Valuation: Calculate realistic student rental prices (standard college benchmark is 1-3% of retail value per day, or 5-10% weekly) and recommend fair refundable security deposits (20-40% of replacement value).
3. Message & Request Drafter: Help borrowers draft polite, persuasive, and clear messages/requests to item owners (e.g. asking for flexible returns, exam week extensions, or confirming item condition).
4. Safety & Handover Coordination: Recommend safe on-campus handover spots (Library lobby, Student Union, Campus Cafe, Main Quad security desk) and provide pre-rental inspection checklists.
5. Campus Reuse & Sustainability: Encourage circular economy, waste reduction, and mindful borrowing.

Tone: Friendly, supportive, collegiate, practical, concise. Use markdown formatting with bullet points and bold highlights when helpful.`;

// API: Generate High-Quality Images using gemini-3-pro-image-preview
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '1:1' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A valid text prompt is required.' });
    }

    // Supported sizes for gemini-3-pro-image-preview: "1K", "2K", "4K"
    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : '1K';

    // Supported aspect ratios
    const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    // Use gemini-3-pro-image-preview as requested
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `High quality, realistic photograph of: ${prompt}. Clean background, college student item showcase, crisp natural lighting, professional product photo.`,
          },
        ],
      },
      config: {
        imageConfig: {
          imageSize: chosenSize as '1K' | '2K' | '4K',
          aspectRatio: chosenRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
        },
      },
    });

    let imageUrl: string | null = null;
    let caption: string | null = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          caption = part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: 'No image was returned by the model. Please refine your prompt and try again.',
        caption,
      });
    }

    return res.json({
      success: true,
      imageUrl,
      model: 'gemini-3-pro-image-preview',
      imageSize: chosenSize,
      aspectRatio: chosenRatio,
      caption,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate image. Please verify API key configuration.',
    });
  }
});

// API: Multi-turn Chat with Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      taskType = 'general', // 'fast' | 'general' | 'complex'
      itemContext,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Select model according to prompt requirements:
    // - gemini-3.1-pro-preview for particularly complex tasks
    // - gemini-3.5-flash for general tasks
    // - gemini-3.1-flash-lite for tasks that should happen fast
    let selectedModel = 'gemini-3.5-flash';
    if (taskType === 'complex') {
      selectedModel = 'gemini-3.1-pro-preview';
    } else if (taskType === 'fast') {
      selectedModel = 'gemini-3.1-flash-lite';
    }

    // Prepare system instruction with dynamic campus item context if available
    let systemInstruction = CAMPUS_BOT_SYSTEM_INSTRUCTION;
    if (itemContext) {
      systemInstruction += `\n\nCURRENT USER ITEM CONTEXT: The student is currently viewing or discussing this item:
- Name: ${itemContext.name}
- Category: ${itemContext.cat}
- Daily Rate: ₹${itemContext.price}/day
- Condition: ${itemContext.condition}
- Owner: ${itemContext.owner}
- Handover Zone: ${itemContext.location || 'Campus Center'}
- Description: ${itemContext.desc}
Keep these details in mind when responding.`;
    }

    // Transform multi-turn history into the format required by @google/genai
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "I'm here to help with your campus rentals and sharing! What would you like to know?";

    return res.json({
      reply,
      model: selectedModel,
      taskType,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: error?.message || 'Chat service encountered an error.',
    });
  }
});

// Mount Vite or static file serving
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CampusShare server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
