import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import { WIDGET_JS, WIDGET_CSS } from "./widget_assets";

// Define Prompt interface
interface Prompt {
  id: string;
  title: string;
  content: string;
}

// In-memory storage (reset on worker restart)
let prompts: Prompt[] = [
  { id: "1", title: "Welcome", content: "This is your first prompt!" }
];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export class PromptManager extends McpAgent {
	server = new McpServer({
		name: "My Prompts",
		version: "1.0.0",
	});

	async init() {
		// Register UI Resource
		this.server.resource(
			"prompts-widget",
			"ui://widget/prompts.html",
			{},
			async () => ({
				contents: [
					{
						uri: "ui://widget/prompts.html",
						mimeType: "text/html+skybridge",
						text: `
<div id="root"></div>
<style>${WIDGET_CSS}</style>
<script type="module">${WIDGET_JS}</script>
            `.trim(),
						_meta: {
							"openai/widgetPrefersBorder": true,
							"openai/widgetDomain": "https://chatgpt.com",
							"openai/widgetCSP": {
								connect_domains: ["https://chatgpt.com"],
								resource_domains: ["https://*.oaistatic.com"],
							},
						},
					},
				],
			})
		);

		// Tool: List Prompts
		this.server.tool(
			"list_prompts",
			{},
			async () => ({
				structuredContent: { prompts },
				content: [{ type: "text", text: `Found ${prompts.length} prompts.` }],
				_meta: {
					"openai/outputTemplate": "ui://widget/prompts.html",
				},
			})
		);

		// Tool: Add Prompt
		this.server.tool(
			"add_prompt",
			{ title: z.string(), content: z.string() },
			async ({ title, content }) => {
				const newPrompt = { id: generateId(), title, content };
				prompts.push(newPrompt);
				return {
					structuredContent: { prompts },
					content: [{ type: "text", text: `Added prompt: ${title}` }],
					_meta: {
						"openai/outputTemplate": "ui://widget/prompts.html",
					},
				};
			}
		);

		// Tool: Delete Prompt
		this.server.tool(
			"delete_prompt",
			{ id: z.string() },
			async ({ id }) => {
				prompts = prompts.filter((p) => p.id !== id);
				return {
					structuredContent: { prompts },
					content: [{ type: "text", text: `Deleted prompt with ID: ${id}` }],
					_meta: {
						"openai/outputTemplate": "ui://widget/prompts.html",
					},
				};
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return PromptManager.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return PromptManager.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
