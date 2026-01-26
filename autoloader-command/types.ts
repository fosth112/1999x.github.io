export interface VersionConfig {
  version: string;
  downloadUrl: string;
  executableName: string;
  hiddenFileName: string;
  serverUrl: string;
  // New fields for file management
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  CONFIGURE = 'CONFIGURE',
  CLIENT_SCRIPT = 'CLIENT_SCRIPT',
  GEMINI_HELP = 'GEMINI_HELP'
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}