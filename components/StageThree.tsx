import React, { useState, useEffect } from 'react';
import { TranslationState } from '../types';
import { translateText } from '../services/geminiService';

interface StageThreeProps {
  originalText: string;
  onBack: () => void;
  onReset: () => void;
}

const StageThree: React.FC<StageThreeProps> = ({ originalText, onBack, onReset }) => {
  const [state, setState] = useState<TranslationState>({
    translatedText: '',
    isTranslating: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const performTranslation = async () => {
      try {
        const result = await translateText(originalText);
        if (isMounted) {
            setState({ translatedText: result, isTranslating: false, error: null });
        }
      } catch (err: any) {
        if (isMounted) {
            setState({ translatedText: '', isTranslating: false, error: err.message || "Erro na tradução" });
        }
      }
    };

    performTranslation();

    return () => { isMounted = false; };
  }, [originalText]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
            Tradução (PT-BR)
          </h2>
          <div className="space-x-4 text-sm">
             <button onClick={onBack} className="text-slate-400 hover:text-white underline">
                Voltar
            </button>
            <button onClick={onReset} className="text-slate-400 hover:text-red-400 underline">
                Início
            </button>
          </div>
        </div>

        {state.isTranslating ? (
           <div className="flex flex-col items-center justify-center py-12">
             <svg className="animate-spin h-8 w-8 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <p className="text-slate-300 animate-pulse">Traduzindo conteúdo...</p>
           </div>
        ) : state.error ? (
           <div className="text-center py-8">
               <p className="text-red-400 mb-4">{state.error}</p>
               <button onClick={onBack} className="text-slate-200 underline">Tentar Novamente</button>
           </div>
        ) : (
            <div className="animate-fade-in-up">
                <label className="block text-slate-400 text-sm font-medium mb-2">
                    Texto Traduzido
                </label>
                <div className="w-full min-h-[160px] bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-100 text-base leading-relaxed whitespace-pre-wrap">
                    {state.translatedText}
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(state.translatedText);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors text-sm"
                    >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                         Copiar Tradução
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default StageThree;
