
import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { Message } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const chatConfig = {
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: "You are MindEase, a friendly and empathetic AI companion for students. Your goal is to provide emotional support, listen without judgment, and offer helpful, gentle guidance. Do not give medical advice. Keep your responses concise and conversational.",
  },
};

let chat: Chat;

const getChat = (): Chat => {
  if (!chat) {
    chat = ai.chats.create(chatConfig);
  }
  return chat;
}

export const getChatResponse = async (newMessage: string): Promise<string> => {
  try {
    const chatInstance = getChat();
    const result: GenerateContentResponse = await chatInstance.sendMessage({ message: newMessage });
    return result.text;
  } catch (error) {
    console.error("Error getting chat response from Gemini:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
};


export const analyzeSentiment = async (message: string): Promise<{ score: number; concern_label: string; summary: string } | null> => {
    const sentimentAnalysisSchema = {
        type: Type.OBJECT,
        properties: {
            score: {
                type: Type.NUMBER,
                description: "Sentiment score from -1.0 (very negative) to 1.0 (very positive)."
            },
            concern_label: {
                type: Type.STRING,
                description: "A label: 'High Concern', 'Moderate Concern', or 'Low Concern'."
            },
            summary: {
                type: Type.STRING,
                description: "A brief summary of the user's message and potential concerns."
            }
        },
        required: ["score", "concern_label", "summary"]
    };

    const prompt = `Analyze the sentiment of the following user message. Provide a sentiment score, a concern label, and a concise summary of potential concerns. The user is a student seeking emotional support. Focus on identifying themes of stress, anxiety, depression, or being overwhelmed. Message: "${message}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: sentimentAnalysisSchema
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        return result;

    } catch (error) {
        console.error("Error analyzing sentiment with Gemini:", error);
        return null;
    }
};
