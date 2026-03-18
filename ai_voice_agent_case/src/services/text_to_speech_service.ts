import OpenAI from "openai";
import fs from "fs";
import { Buffer } from "buffer"; 
import { PipelineLogger } from "../utils/logger.js";

export class TTSService {
  private openai = new OpenAI();

  async speak(text: string, outputPath: string = 'response.mp3') {
    const start = Date.now();
    
    const mp3 = await this.openai.audio.speech.create({
      model: "tts-1", // 'tts-1' is optimized for lowest latency
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(outputPath, buffer);
    
    PipelineLogger.logLatency('TTS (OpenAI)', start);
    PipelineLogger.info(`Audio is saved to ${outputPath}`);
  }
}