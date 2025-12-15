import { GoogleGenAI } from "@google/genai";

export const config = {
  maxDuration: 60, // Aumenta o tempo limite para 60 segundos (para vídeos maiores)
};

export default async function handler(req, res) {
  // Configuração de CORS para permitir chamadas do próprio frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: API_KEY missing' });
    }

    // 1. Resolver a URL do TikTok para pegar o link direto do vídeo (MP4)
    // Usamos a API tikwm.com como intermediária para extrair o link sem marca d'água/direto
    const resolverApi = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const resolverResponse = await fetch(resolverApi);
    const resolverData = await resolverResponse.json();

    if (resolverData.code !== 0 || !resolverData.data?.play) {
      throw new Error("Não foi possível processar o vídeo do TikTok. O link pode ser privado ou inválido.");
    }

    const directVideoUrl = resolverData.data.play;

    // 2. Baixar o vídeo (Server-side fetch ignora CORS)
    const videoResponse = await fetch(directVideoUrl);
    if (!videoResponse.ok) {
      throw new Error("Falha ao baixar o conteúdo do vídeo.");
    }
    
    const arrayBuffer = await videoResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // 3. Enviar para o Gemini
    const ai = new GoogleGenAI({ apiKey });
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
      throw new Error("O modelo não retornou nenhuma transcrição.");
    }

    return res.status(200).json({ text });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}