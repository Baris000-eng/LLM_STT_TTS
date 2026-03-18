import { STTService } from './services/speech_to_text_service.ts';
import { LLMService } from './services/large_language_model_service.ts';
import { TTSService } from './services/text_to_speech_service.ts';
import { IntentHandler } from './handlers/intent.handler.ts';
import { PipelineLogger } from './utils/logger.ts';


const sessionMemory = new Map<string, any[]>();

async function runVoicePipeline(audioInputPath: string, sessionId: string) {
    const pipelineStart = Date.now();
    PipelineLogger.info(`Pipeline has been started: ${sessionId}`);

    // Start the services 
    const stt = new STTService();
    const llm = new LLMService();
    const tts = new TTSService();
    const intentHandler = new IntentHandler();

    try {

        const transcribedText = await stt.transcribe(audioInputPath);
        if (!transcribedText) throw new Error("Voice transcription failed or returned empty text.");
        console.log(`[USER]: ${transcribedText}`);

        const history = sessionMemory.get(sessionId) || [];

        const { response, intent, detectedName } = await llm.processInput(
            transcribedText, 
            history
        );

        // Intent-based processing (Task 2)
        const finalMessage = await intentHandler.handle(intent);
        const fullResponse = `${response} ${finalMessage}`;

        // 4. Memory Update(Task 3)
        history.push({ role: "user", content: transcribedText });
        history.push({ role: "assistant", content: fullResponse });
        sessionMemory.set(sessionId, history);

        // 5. Text to Speech (TTS)
        await tts.speak(fullResponse, `output_${sessionId}.mp3`);

        PipelineLogger.logLatency('Total Pipeline Time', pipelineStart);
        
        console.log(`[AGENT]: ${fullResponse}`);
        console.log(`[INTENT]: ${intent}`);

    } catch (error) {
        console.error("Pipeline Hatası:", error);
    }
}


runVoicePipeline('./input.wav', 'session_123');