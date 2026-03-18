import { PipelineLogger } from '../utils/logger.js';
// Note: You may need 'brew install whisper-cpp' or a node wrapper
import whisper from 'node-whisper'; 

export class STTService {
  async transcribe(audioPath: string): Promise<string> {
    const start = Date.now();
    try {
      const result = await whisper(audioPath, {
        model: 'base.en', // Small/Fast model for latency
        whisperOptions: { gen_file_txt: false }
      });
      
      PipelineLogger.logLatency('STT (Whisper)', start);
      return result.trim();
    } catch (error) {
      console.error("STT Error:", error);
      return "";
    }
  }
}