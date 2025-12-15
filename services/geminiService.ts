import { GoogleGenAI } from "@google/genai";
import { FileData } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

export const transcribeVideo = async (fileData: FileData): Promise<string> => {
  const ai = getAiClient();
  
  // Gemini 2.5 Flash is efficient for multimodal tasks
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
  // Client-side helper to fetch video bytes from a public TikTok resolver API.
  // Note: This relies on the availability and CORS headers of the third-party API (TikWM).
  try {
    // 1. Resolve the TikTok URL to a direct video link
    const resolverApi = `https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`;
    const resolverResponse = await fetch(resolverApi);
    const resolverData = await resolverResponse.json();

    if (resolverData.code !== 0 || !resolverData.data?.play) {
      throw new Error("Could not resolve video URL.");
    }

    const directVideoUrl = resolverData.data.play;

    // 2. Fetch the video blob
    // We attempt to fetch the video. If the CDN does not allow CORS, this will fail.
    const videoResponse = await fetch(directVideoUrl);
    if (!videoResponse.ok) throw new Error("Failed to download video data.");
    const blob = await videoResponse.blob();

    // 3. Convert to Base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data:video/mp4;base64, prefix
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // 4. Send to Gemini
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'video/mp4',
              data: base64Data,
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

  } catch (error: any) {
    console.error("Direct URL transcription error:", error);
    throw new Error(
      error.message?.includes("Failed to fetch") 
      ? "Não foi possível baixar o vídeo automaticamente devido a restrições do navegador (CORS). O serviço de terceiros pode estar indisponível."
      : "Falha na transcrição automática."
    );
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
