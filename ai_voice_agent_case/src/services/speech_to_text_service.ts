import { PipelineLogger } from '../../utils/logger.js';
// Note: You may need 'brew install whisper-cpp' or a node wrapper
// @ts-ignore - node-whisper often lacks built-in types
import whisper from 'node-whisper'; 

// Define what the whisper library returns to avoid "property does not exist" errors
interface WhisperResult {
  text?: string;
  segments?: any[];
  [key: string]: any;
}

export class STTService {
  async transcribe(audioPath: string): Promise<string> {
    const start = Date.now();
    try {
      const result: WhisperResult = await whisper(audioPath, {
        model: 'base.en',
        language: 'en'
      });
      
      PipelineLogger.logLatency('STT (Whisper)', start);
      return (result?.text || "").trim();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("STT Error:", errorMessage);
      throw new Error(`Transcription failed: ${errorMessage}`);
    }
  }
}