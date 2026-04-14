export type McpTransportType = 'http' | 'sse';

export interface McpServerSettings {
  bearerToken: string;
  enabled: boolean;
  id: string;
  serverName: string;
  serverUrl: string;
  transport: McpTransportType;
}

export interface McpSettings {
  enabled: boolean;
  servers: McpServerSettings[];
}
