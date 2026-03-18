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
      model: "gpt-4o", // 'gpt-4o' is optimized for lowest latency 
      messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: text }],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;

    if(!content) { 
      return {response: "I am sorry, I have trouble thinking.", intent: 'fallback'};
    }

    const result = JSON.parse(content);
    console.log(`[LATENCY] LLM Processing: ${Date.now() - startTime}ms`);
    
    return {response: result.reply, intent: result.intent};
  }
}

const content = completion.choices[0]?.message?.content;

    if (!content) {
      return { response: "I'm sorry, I'm having trouble thinking.", intent: 'fallback' };
    }

    const result = JSON.parse(content);
    
    // Ensure the intent is valid based on your Type
    const validIntents: Intent[] = ['policy_enquiry', 'report_claim', 'schedule_appointment', 'fallback'];
    const finalIntent = validIntents.includes(result.intent) ? result.intent : 'fallback';

    return { response: result.reply, intent: finalIntent };

  } catch (error) {
    console.error("LLM Error:", error);
    return { response: "An error occurred.", intent: 'fallback' };
  }
}
