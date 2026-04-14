import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod/v4';

const DEMO_SERVER_INFO = {
  name: 'ai-agent-template-demo-server',
  version: '0.1.0',
} as const;

function createUnavailableResult(capability: string, error: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: `${capability} is not available with this client yet.\n${error instanceof Error ? error.message : String(error)}`,
      },
    ],
    isError: true,
  };
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function createDemoMcpServer() {
  const server = new McpServer(DEMO_SERVER_INFO, {
    capabilities: {
      logging: {},
    },
  });

  server.registerTool(
    'hello',
    {
      description: 'A minimal demo tool that returns a greeting.',
      inputSchema: {
        name: z.string().default('friend').describe('Who to greet'),
      },
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: 'text',
            text: `Hello, ${name}. This response came from the local MCP demo server.`,
          },
        ],
      };
    }
  );

  server.registerTool(
    'emit_log',
    {
      description: 'Send a demo logging message through MCP logging notifications.',
      inputSchema: {
        message: z.string().default('Demo log from the MCP server.').describe('Log message'),
      },
    },
    async ({ message }, extra) => {
      await server.sendLoggingMessage(
        {
          data: {
            message,
            timestamp: new Date().toISOString(),
          },
          level: 'info',
          logger: 'demo-mcp-server',
        },
        extra.sessionId
      );

      return {
        content: [
          {
            type: 'text',
            text: 'A logging notification was sent from the demo MCP server.',
          },
        ],
      };
    }
  );

  server.registerTool(
    'collect_profile',
    {
      description: 'Demonstrates form elicitation by asking the client for simple profile data.',
      inputSchema: {},
    },
    async () => {
      try {
        const result = await server.server.elicitInput({
          message: 'Please fill in this short demo profile form.',
          mode: 'form',
          requestedSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                title: 'Name',
              },
              role: {
                type: 'string',
                title: 'Role',
              },
            },
            required: ['name'],
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: `Elicitation result:\n${formatJson(result)}`,
            },
          ],
        };
      } catch (error) {
        return createUnavailableResult('Elicitation', error);
      }
    }
  );

  server.registerTool(
    'summarize_with_sampling',
    {
      description:
        'Demonstrates MCP sampling by asking the client to summarize text with its own model.',
      inputSchema: {
        text: z.string().describe('Text to summarize'),
      },
    },
    async ({ text }) => {
      try {
        const response = await server.server.createMessage({
          maxTokens: 200,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Summarize this text in one short paragraph:\n\n${text}`,
              },
            },
          ],
        });

        return {
          content: [
            {
              type: 'text',
              text:
                response.content.type === 'text'
                  ? response.content.text
                  : 'Sampling returned a non-text response.',
            },
          ],
        };
      } catch (error) {
        return createUnavailableResult('Sampling', error);
      }
    }
  );

  server.registerTool(
    'list_client_roots',
    {
      description: 'Demonstrates roots by asking the client for its available roots.',
      inputSchema: {},
    },
    async () => {
      try {
        const result = await server.server.listRoots();

        return {
          content: [
            {
              type: 'text',
              text: `Client roots:\n${formatJson(result.roots)}`,
            },
          ],
        };
      } catch (error) {
        return createUnavailableResult('Roots', error);
      }
    }
  );

  server.registerResource(
    'demo-overview',
    'memo://demo/overview',
    {
      description: 'A tiny read-only resource exposed by the demo MCP server.',
      mimeType: 'text/markdown',
    },
    async () => {
      return {
        contents: [
          {
            uri: 'memo://demo/overview',
            text: [
              '# Demo MCP Resource',
              '',
              '- This resource is static.',
              '- It exists only to show how MCP resources are exposed.',
              '- You can list it and read it from an MCP client.',
            ].join('\n'),
          },
        ],
      };
    }
  );

  server.registerPrompt(
    'welcome-user',
    {
      description: 'A simple prompt template that prepares a friendly welcome message.',
      argsSchema: {
        product: z.string().default('AI Agent Template').describe('Product name'),
        userName: z.string().default('friend').describe('User name'),
      },
    },
    async ({ product, userName }) => {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Write a short welcome message for ${userName} in ${product}.`,
            },
          },
        ],
      };
    }
  );

  return server;
}
