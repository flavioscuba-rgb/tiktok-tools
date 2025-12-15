import React, { useState, useEffect } from 'react';
import { TranscriptionState } from '../types';
import { transcribeVideoUrl } from '../services/geminiService';

interface StageTwoProps {
  cleanUrl: string;
  onTranscriptionComplete: (text: string) => void;
  onBack: () => void;
}

const StageTwo: React.FC<StageTwoProps> = ({ cleanUrl, onTranscriptionComplete, onBack }) => {
  const [url, setUrl] = useState(cleanUrl);
  const [state, setState] = useState<TranscriptionState>({
    originalText: '',
    isTranscribing: false,
    error: null,
  });

  useEffect(() => {
    setUrl(cleanUrl);
  }, [cleanUrl]);

  const handleTranscribe = async () => {
    if (!url) return;

    setState(prev => ({ ...prev, isTranscribing: true, error: null, originalText: '' }));

    try {
      const text = await transcribeVideoUrl(url);
      setState(prev => ({ ...prev, originalText: text, isTranscribing: false }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isTranscribing: false, 
        error: error.message || "Falha na transcrição." 
      }));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(state.originalText);
  };

  const clearResult = () => {
    setState({
        originalText: '',
        isTranscribing: false,
        error: null
    });
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-2xl mx-auto">
      {/* Container styled to match StageOne and StageThree */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        
        {/* Header Section */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
            Transcrição de Áudio
        </h2>

        {/* Input Section */}
        <div className="mb-6">
            <label className="block text-slate-400 text-sm font-medium mb-2">
                Link do Vídeo
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@user/video/..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
                <button
                    onClick={handleTranscribe}
                    disabled={state.isTranscribing || !url}
                    className={`px-6 py-3 rounded-lg font-bold text-white transition-all whitespace-nowrap flex items-center justify-center ${
                        state.isTranscribing || !url
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 shadow-lg shadow-pink-500/20'
                    }`}
                >
                    {state.isTranscribing ? (
                         <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Processando...
                        </span>
                    ) : 'Transcrever'}
                </button>
            </div>
        </div>

        {/* Error Message */}
        {state.error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg mb-6 text-sm">
                {state.error}
            </div>
        )}

        {/* Result Section */}
        {state.originalText && (
            <div className="animate-fade-in-up">
                <label className="block text-slate-400 text-sm font-medium mb-2">
                    Texto Transcrito
                </label>
                <div className="relative mb-4">
                    <textarea
                        readOnly
                        value={state.originalText}
                        placeholder="A transcrição aparecerá aqui..."
                        className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 leading-relaxed resize-none focus:outline-none custom-scrollbar"
                    />
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
                        </svg>
                        Copiar
                    </button>

                    <button
                        onClick={clearResult}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Limpar
                    </button>
                    
                    <div className="flex-1"></div>

                    <button
                        onClick={() => onTranscriptionComplete(state.originalText)}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        Traduzir (PT-BR)
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>
            </div>
        )}
        
        {/* Back Link */}
        <div className="mt-6 text-center">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-300 text-sm underline">
                Voltar para Link
            </button>
        </div>
      </div>
    </div>
  );
};

export default StageTwo;