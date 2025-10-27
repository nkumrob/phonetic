/**
 * Environment configuration and validation
 */

interface EnvConfig {
  // Public environment variables
  siteUrl: string;
  gaId?: string;
  googleSiteVerification?: string;
  sentryDsn?: string;
  enableAnalytics: boolean;
  enablePwa: boolean;
  
  // Server-only environment variables
  nodeEnv: 'development' | 'test' | 'production';
  apiRateLimitMax: number;
  apiRateLimitWindowMs: number;
  csrfSecret: string;
}

class EnvironmentConfig {
  private config: EnvConfig;
  
  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }
  
  private loadConfig(): EnvConfig {
    const nodeEnv = (process.env.NODE_ENV as EnvConfig['nodeEnv']) || 'development';
    const isProduction = nodeEnv === 'production';
    
    return {
      // Public vars
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || (isProduction ? 'https://www.natophonetic.com' : 'http://localhost:3000'),
      gaId: process.env.NEXT_PUBLIC_GA_ID,
      googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      enablePwa: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
      
      // Server-only vars
      nodeEnv,
      apiRateLimitMax: parseInt(process.env.API_RATE_LIMIT_MAX || '100', 10),
      apiRateLimitWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000', 10),
      csrfSecret: process.env.CSRF_SECRET || 'development-secret',
    };
  }
  
  private validateConfig(): void {
    const errors: string[] = [];
    
    // Validate required fields
    if (!this.config.siteUrl) {
      errors.push('NEXT_PUBLIC_SITE_URL is required');
    }
    
    // Validate production requirements
    if (this.isProduction()) {
      // CSRF_SECRET is optional for static sites
      // Only validate if it's set but still using development value
      if (this.config.csrfSecret === 'development-secret' && process.env.CSRF_SECRET) {
        console.warn('Warning: CSRF_SECRET is using development value in production');
      }
      
      // Allow http://localhost for local production builds
      if (!this.config.siteUrl.startsWith('https://') && !this.config.siteUrl.includes('localhost')) {
        errors.push('NEXT_PUBLIC_SITE_URL must use HTTPS in production (unless localhost)');
      }
    }
    
    // Validate numeric values
    if (isNaN(this.config.apiRateLimitMax) || this.config.apiRateLimitMax <= 0) {
      errors.push('API_RATE_LIMIT_MAX must be a positive number');
    }
    
    if (isNaN(this.config.apiRateLimitWindowMs) || this.config.apiRateLimitWindowMs <= 0) {
      errors.push('API_RATE_LIMIT_WINDOW_MS must be a positive number');
    }
    
    if (errors.length > 0) {
      throw new Error(`Environment configuration errors:\n${errors.join('\n')}`);
    }
  }
  
  public get(): EnvConfig {
    return { ...this.config };
  }
  
  public isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }
  
  public isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }
  
  public isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }
  
  public isServer(): boolean {
    return typeof window === 'undefined';
  }
  
  public isClient(): boolean {
    return typeof window !== 'undefined';
  }
}

// Export singleton instance
export const env = new EnvironmentConfig();

// Export specific config values for convenience
export const config = env.get();