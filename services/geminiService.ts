import { GoogleGenAI } from "@google/genai";
import { FileData } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

// Mantido para upload manual de arquivos (futuro uso)
export const transcribeVideo = async (fileData: FileData): Promise<string> => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64Data,
            },
          },
          {
            text: "Transcribe the spoken audio in this video exactly as it is spoken in its original language. Do not add any commentary, timestamps, or descriptions. Just provide the raw transcript.",
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No transcription generated.");
    }
    return text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe video. Please try again.");
  }
};

export const transcribeVideoUrl = async (videoUrl: string): Promise<string> => {
  // Alteração: Agora chamamos a API Route da Vercel (/api/transcribe)
  // Isso resolve o problema de CORS que bloqueava o download do vídeo no navegador.
  
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: videoUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Tenta pegar a mensagem de erro específica da API
      throw new Error(data.error || "Erro desconhecido no servidor.");
    }

    return data.text;

  } catch (error: any) {
    console.error("Service Error:", error);
    // Mensagem amigável para o usuário
    throw new Error(error.message || "Falha na transcrição automática.");
  }
};

export const translateText = async (textToTranslate: string): Promise<string> => {
  const ai = getAiClient();
  const model = 'gemini-2.5-flash';

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Translate the following text into Brazilian Portuguese (PT-BR). Only provide the translation, no conversational filler:\n\n"${textToTranslate}"`,
    });

    const text = response.text;
    if (!text) {
      throw new Error("No translation generated.");
    }
    return text;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text.");
  }
};

export const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};