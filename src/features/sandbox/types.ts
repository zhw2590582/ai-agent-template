export interface SandboxAccessSettings {
  allowCommands: boolean;
  allowFileDownload: boolean;
  allowFileUpload: boolean;
  allowFilesystem: boolean;
  allowInternetAccess: boolean;
  allowPty: boolean;
}

export type SandboxProviderId = 'e2b';

export interface SandboxSettings {
  access: SandboxAccessSettings;
  apiKey: string;
  autoPause: boolean;
  enabled: boolean;
  envVarsText: string;
  provider: SandboxProviderId;
  secure: boolean;
  template: string;
  timeoutSeconds: number;
  workingDirectory: string;
}
