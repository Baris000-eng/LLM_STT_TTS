export class PipelineLogger {
  static logLatency(step: string, startTime: number) {
    const elapsed = Date.now() - startTime;
    console.log(`[LATENCY] ${step.padEnd(20)} | ${elapsed}ms`);
  }

  static info(message: string) {
    console.log(`[SYSTEM]  ${message}`);
  }
}