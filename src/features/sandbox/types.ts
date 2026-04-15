export interface SandboxAccessSettings {
  allowCommands: boolean;
  allowFileDownload: boolean;
  allowFileUpload: boolean;
  allowFilesystem: boolean;
  allowInternetAccess: boolean;
  allowPty: boolean;
}

export interface SandboxSettings {
  access: SandboxAccessSettings;
  apiKey: string;
  autoPause: boolean;
  enabled: boolean;
  envVarsText: string;
  secure: boolean;
  template: string;
  timeoutSeconds: number;
  workingDirectory: string;
}

export interface SandboxTemplateOption {
  isPublic: boolean;
  label: string;
  value: string;
}
