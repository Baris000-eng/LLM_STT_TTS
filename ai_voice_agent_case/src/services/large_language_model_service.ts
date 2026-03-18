import { OpenAI } from 'openai';

export type Intent = 'policy_enquiry' | 'report_claim' | 'schedule_appointment' | 'fallback';

// 1. Define the return interface to include detectedName
export interface LLMResult {
  response: string;
  intent: Intent;
  detectedName?: string; // Optional: might not always find a name
}

export class LLMService {
  private openai = new OpenAI();

  async processInput(text: string, history: any[], userName?: string): Promise<LLMResult> {
    const startTime = Date.now();
    
    try {
      const systemPrompt = `
        You are an insurance AI. Current User: ${userName || 'Unknown'}.
        Tasks:
        1. Detect intent: policy_enquiry, report_claim, schedule_appointment, or fallback.
        2. If the user mentions their name for the first time, extract it.
        Return ONLY JSON: { "intent": "...", "reply": "...", "detectedName": "..." }
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt }, 
          ...history, 
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) { 
        return { response: "I am sorry, I have trouble thinking.", intent: 'fallback' };
      }

      const result = JSON.parse(content);
      
      // 2. Validate Intent
      const validIntents: Intent[] = ['policy_enquiry', 'report_claim', 'schedule_appointment', 'fallback'];
      const finalIntent: Intent = validIntents.includes(result.intent) ? result.intent : 'fallback';

      console.log(`[LATENCY] LLM Processing: ${Date.now() - startTime}ms`);

      // 3. Return all three properties
      return {
        response: result.reply || "No response generated.",
        intent: finalIntent,
        detectedName: result.detectedName || undefined
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("LLM Error:", errorMessage);
      return { response: "An error occurred during processing.", intent: 'fallback' };
    }
  }
}