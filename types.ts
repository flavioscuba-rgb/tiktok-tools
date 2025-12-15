export enum AppStage {
  URL_CLEANING = 1,
  TRANSCRIPTION = 2,
  TRANSLATION = 3
}

export interface TranscriptionState {
  originalText: string;
  isTranscribing: boolean;
  error: string | null;
}

export interface TranslationState {
  translatedText: string;
  isTranslating: boolean;
  error: string | null;
}

export interface FileData {
  file: File;
  previewUrl: string;
  mimeType: string;
  base64Data: string;
}
