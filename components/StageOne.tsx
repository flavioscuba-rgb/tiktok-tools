import React, { useState, useEffect } from 'react';
import { cleanTikTokUrl, isValidTikTokUrl } from '../utils/urlUtils';

interface StageOneProps {
  onComplete: (cleanUrl: string) => void;
}

const StageOne: React.FC<StageOneProps> = ({ onComplete }) => {
  const [messyUrl, setMessyUrl] = useState('');
  const [cleanUrl, setCleanUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Auto-clean when messy URL changes
  useEffect(() => {
    if (messyUrl) {
      const cleaned = cleanTikTokUrl(messyUrl);
      if (cleaned) {
        setCleanUrl(cleaned);
        setError(null);
      } else {
        // Only show error if input is substantial enough to be a URL
        if (messyUrl.length > 10) {
          setError("Não foi possível extrair um link válido deste texto.");
        }
      }
    }
  }, [messyUrl]);

  const handleNext = () => {
    if (isValidTikTokUrl(cleanUrl)) {
      onComplete(cleanUrl);
    } else {
      setError("O link final não parece ser um vídeo válido do TikTok.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="bg-cyan-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
          Limpeza de Link
        </h2>

        {/* Messy URL Input */}
        <div className="mb-6">
          <label className="block text-slate-400 text-sm font-medium mb-2">
            Cole o link sem formatação (com redirecionamento, etc.)
          </label>
          <input
            type="text"
            value={messyUrl}
            onChange={(e) => setMessyUrl(e.target.value)}
            placeholder="https://www.tiktok.com/login?redirect_url=..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>

        {/* Clean URL Input/Output */}
        <div className="mb-6">
          <label className="block text-slate-400 text-sm font-medium mb-2">
            Link TikTok Limpo
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cleanUrl}
              onChange={(e) => setCleanUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@user/video/..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-cyan-400 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            />
            {cleanUrl && (
              <a 
                href={cleanUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg flex items-center justify-center transition-colors"
                title="Abrir link original"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <button
          onClick={handleNext}
          disabled={!isValidTikTokUrl(cleanUrl)}
          className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
            isValidTikTokUrl(cleanUrl)
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-700 cursor-not-allowed text-slate-500'
          }`}
        >
          Ir para Transcrição
        </button>
      </div>
    </div>
  );
};

export default StageOne;
