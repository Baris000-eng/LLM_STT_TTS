import { OpenAI } from 'openai';

export type Intent = 'policy_enquiry' | 'report_claim' | 'schedule_appointment' | 'fallback';

export class LLMService {
  private openai = new OpenAI();

  async processInput(text: string, history: any[], userName?: string): Promise<{ response: string, intent: Intent }> {
    const startTime = Date.now();
    
    const systemPrompt = `
      You are an insurance AI. Current User: ${userName || 'Unknown'}.
      Detect intent: policy_enquiry, report_claim, schedule_appointment.
      Return JSON: { "intent": "...", "reply": "..." }
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: text }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content!);
    console.log(`[LATENCY] LLM Processing: ${Date.now() - startTime}ms`);
    
    return { response: result.reply, intent: result.intent };
  }
}