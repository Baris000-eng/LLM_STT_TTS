export class SessionManager {
  private sessions = new Map<string, { history: any[], userName?: string }>();

  getOrCreateSession(sessionId: string) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { history: [] });
    }
    return this.sessions.get(sessionId)!;
  }

  clearSession(sessionId: string) {
    this.sessions.delete(sessionId);
    console.log(`[SYSTEM] Session ${sessionId} cleared.`);
  }
}