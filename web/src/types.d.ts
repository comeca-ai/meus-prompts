export {};

declare global {
  interface Window {
    openai: {
      toolOutput?: {
        prompts?: Array<{ id: string; title: string; content: string }>;
      };
      callTool: (name: string, args: any) => Promise<void>;
      // Add other properties if needed
    };
  }
}
