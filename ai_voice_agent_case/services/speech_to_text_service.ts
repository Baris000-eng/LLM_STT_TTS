import { PipelineLogger } from '../utils/logger.js';
// Note: You may need 'brew install whisper-cpp' or a node wrapper
import whisper from 'node-whisper'; 

export class STTService {
  async transcribe(audioPath: string): Promise<string> {
    const start = Date.now();
    try {
      // 1. Ensure the result is awaited properly
      const result = await whisper(audioPath, {
        model: 'base.en',
        whisperOptions: { 
          gen_file_txt: false,
          language: 'en' // Explicitly setting language can reduce "hallucinations"
        }
      });
      
      PipelineLogger.logLatency('STT (Whisper)', start);

      // 2. Extract the text property. 
      // result is usually { text: "...", segments: [...] }
      const transcription = result?.text || ""; 
      
      return transcription.trim();
    } catch (error) {
      console.error("STT Error:", error);
      // It's often better to throw the error or return a specific 
      // error string so the UI knows it failed.
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }
}