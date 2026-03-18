import { STTService } from './services/speech_to_text_service.ts';
import { LLMService } from './services/large_language_model_service.ts';
import { TTSService } from './services/text_to_speech_service.ts';
import { IntentHandler } from './handlers/intent.handler.ts';
import { PipelineLogger } from './utils/logger.js';

// Using a more specific type for session history
interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

const sessionMemory = new Map<string, ChatMessage[]>();

async function runVoicePipeline(audioInputPath: string, sessionId: string) {
    const pipelineStart = Date.now();
    console.info(`Pipeline has been started: ${sessionId}`);

    const stt = new STTService();
    const llm = new LLMService();
    const tts = new TTSService();
    const intentHandler = new IntentHandler();

    try {
        // 1. STT Phase
        const transcribedText = await stt.transcribe(audioInputPath);
        if (!transcribedText) throw new Error("Voice transcription failed or returned empty text.");
        console.log(`[USER]: ${transcribedText}`);

        const history = sessionMemory.get(sessionId) || [];

        // 2. LLM Phase - Destructuring detectedName
        const { response, intent, detectedName } = await llm.processInput(
            transcribedText, 
            history
        );

        // 3. Intent & Personalization Phase
        // Use detectedName to make the response more natural if available
        const greeting = detectedName ? `Hello, ${detectedName}. ` : "";
        const intentFeedback = await intentHandler.handle(intent);
        
        const fullResponse = `${greeting}${response} ${intentFeedback}`.trim();

        // 4. Memory Update
        history.push({ role: "user", content: transcribedText });
        history.push({ role: "assistant", content: fullResponse });
        sessionMemory.set(sessionId, history);

        // 5. TTS Phase
        await tts.speak(fullResponse, `output_${sessionId}.mp3`);

        // Final Logging
        const duration = Date.now() - pipelineStart;
        console.log(`[AGENT]: ${fullResponse}`);
        console.log(`[INTENT]: ${intent}`);
        console.log(`[LATENCY]: ${duration}ms`);

    } catch (error: unknown) {
        // Fix: Safe error handling
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Pipeline Error:", errorMessage);
    }
}

runVoicePipeline('./input.wav', 'session_123');

