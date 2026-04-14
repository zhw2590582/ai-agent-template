import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { API_RATE_LIMITS } from '@/config/api-rate-limit';
import { MCP_CONFIG } from '@/config/mcp';
import { API_NAMESPACES } from '@/config/namespaces';
import { createDemoMcpServer } from '@/features/mcp/server/demo-mcp-server';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function applyMcpRateLimit(request: Request) {
  enforceRateLimit(request, {
    config: API_RATE_LIMITS.MCP,
    namespace: API_NAMESPACES.MCP,
  });
}

async function handleMcpRequest(request: Request) {
  applyMcpRateLimit(request);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  const server = createDemoMcpServer();

  await server.connect(transport);

  return transport.handleRequest(request);
}

export async function GET(request: Request) {
  return handleMcpRequest(request);
}

export async function POST(request: Request) {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request) {
  return handleMcpRequest(request);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: MCP_CONFIG.CORS_ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Headers': MCP_CONFIG.CORS_ALLOWED_HEADERS.join(', '),
      'Access-Control-Allow-Methods': MCP_CONFIG.CORS_ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Origin': MCP_CONFIG.CORS_ALLOWED_ORIGIN,
      'Access-Control-Expose-Headers': MCP_CONFIG.EXPOSED_HEADERS.join(', '),
    },
  });
}
