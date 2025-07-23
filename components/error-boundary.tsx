'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui';
import { logger } from '@/lib/utils/logger';
import { env } from '@/lib/config/env';


interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-xl font-semibold">
              Oops! Something went wrong
            </h2>
            <p className="text-muted-foreground">
              This component encountered an error. Please try refreshing the page.
            </p>
            {env.isDevelopment() && this.state.error && (
              <div className="bg-muted p-3 rounded text-left">
                <p className="text-sm font-mono text-muted-foreground">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}