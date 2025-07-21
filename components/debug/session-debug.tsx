'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from '@/lib/contexts/session-context';

export function SessionDebug() {
  const { session, updateProgress } = useSession();
  const [localStorageData, setLocalStorageData] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const data = localStorage.getItem('phoneticSession');
      setLocalStorageData(data || 'No data in localStorage');
    }
  }, [isClient, session]);

  const testUpdate = () => {
    updateProgress({
      totalQuizzesTaken: session.userProgress.totalQuizzesTaken + 1,
      experience: session.userProgress.experience + 10,
    });
  };

  const checkLocalStorage = () => {
    const data = localStorage.getItem('phoneticSession');
    console.log('Current localStorage data:', data);
    setLocalStorageData(data || 'No data in localStorage');
  };

  if (!isClient) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-background border rounded-lg p-4 max-w-md shadow-lg">
      <h3 className="font-bold mb-2">Session Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Level:</strong> {session.userProgress.level}
        </div>
        <div>
          <strong>XP:</strong> {session.userProgress.experience}
        </div>
        <div>
          <strong>Quizzes:</strong> {session.userProgress.totalQuizzesTaken}
        </div>
        <div>
          <strong>localStorage:</strong>
          <pre className="text-xs overflow-auto max-h-32 bg-muted p-2 rounded mt-1">
            {localStorageData.substring(0, 200)}...
          </pre>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={testUpdate}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs"
          >
            Test Update
          </button>
          <button
            onClick={checkLocalStorage}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs"
          >
            Check Storage
          </button>
        </div>
      </div>
    </div>
  );
}