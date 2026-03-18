export type Intent = 'policy_enquiry' | 'report_claim' | 'schedule_appointment' | 'fallback';

export class IntentHandler {
  async handle(intent: Intent, data?: any) {
    switch (intent) {
      case 'policy_enquiry':
        return "I'm checking your policy status now. Everything looks active.";
      case 'report_claim':
        // Task 1: Simulate the next step
        return "I have initiated a damage report. Can you describe the incident?";
      case 'schedule_appointment':
        return "I can help with that. Are you looking for a morning or afternoon slot?";
      default:
        return "I am not sure I understood. Could you repeat that for our insurance assistant?";
    }
  }
}