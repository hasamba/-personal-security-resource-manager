export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  API_BASE_URL: string;
  API_PORT: number;
}

export function getEnvConfig(): EnvConfig {
  return {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
    API_PORT: parseInt(process.env.API_PORT || '3000', 10),
  };
}
