import React, { useState } from 'react';
import StageOne from './components/StageOne';
import StageTwo from './components/StageTwo';
import StageThree from './components/StageThree';
import { AppStage } from './types';

const App: React.FC = () => {
  const [stage, setStage] = useState<AppStage>(AppStage.URL_CLEANING);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [transcribedText, setTranscribedText] = useState<string>('');

  const handleStageOneComplete = (cleanUrl: string) => {
    setCurrentUrl(cleanUrl);
    setStage(AppStage.TRANSCRIPTION);
  };

  const handleStageTwoComplete = (text: string) => {
    setTranscribedText(text);
    setStage(AppStage.TRANSLATION);
  };

  const resetApp = () => {
    setStage(AppStage.URL_CLEANING);
    setCurrentUrl('');
    setTranscribedText('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl w-full text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-2">
          TikTok Tool
        </h1>
        <p className="text-slate-400">
          Limpe links, transcreva áudio e traduza conteúdo automaticamente.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-3xl w-full mb-8">
        <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-0"></div>
            
            {/* Step 1 Indicator */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${
                stage >= 1 
                ? 'bg-slate-900 border-cyan-500 text-cyan-500' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
                1
            </div>

            {/* Step 2 Indicator */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${
                stage >= 2
                ? 'bg-slate-900 border-pink-500 text-pink-500' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
                2
            </div>

            {/* Step 3 Indicator */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${
                stage >= 3
                ? 'bg-slate-900 border-emerald-500 text-emerald-500' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
                3
            </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
            <span>Link</span>
            <span>Transcrição</span>
            <span>Tradução</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full">
        {stage === AppStage.URL_CLEANING && (
          <StageOne onComplete={handleStageOneComplete} />
        )}
        
        {stage === AppStage.TRANSCRIPTION && (
          <StageTwo 
            cleanUrl={currentUrl} 
            onTranscriptionComplete={handleStageTwoComplete}
            onBack={() => setStage(AppStage.URL_CLEANING)}
          />
        )}

        {stage === AppStage.TRANSLATION && (
          <StageThree 
            originalText={transcribedText}
            onBack={() => setStage(AppStage.TRANSCRIPTION)}
            onReset={resetApp}
          />
        )}
      </main>

      <footer className="mt-12 text-slate-600 text-sm text-center">
        Criado por Flavio Jr
      </footer>
    </div>
  );
};

export default App;