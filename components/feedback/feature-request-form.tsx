'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function FeatureRequestForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [request, setRequest] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/feature-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request,
          name: name || null,
          email: email || null,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorMsg(body?.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  }

  function handleReset() {
    setStatus('idle');
    setErrorMsg('');
    setRequest('');
    setName('');
    setEmail('');
  }

  if (status === 'success') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-warmNeutral-100">
          Got it. Thanks for helping shape the roadmap.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm font-semibold text-coolBlue-600 hover:text-coolBlue-700 dark:text-coolBlue-400 dark:hover:text-coolBlue-300 transition-colors"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label
          htmlFor="feature-request-text"
          className="block text-sm font-semibold text-gray-700 dark:text-warmNeutral-200"
        >
          Your request
        </label>
        <textarea
          id="feature-request-text"
          required
          maxLength={2000}
          rows={5}
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Describe the feature or improvement you would like to see..."
          className="w-full rounded-lg border border-warmNeutral-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-coolBlue-500 focus:outline-none focus:ring-2 focus:ring-coolBlue-500/20 dark:border-warmNeutral-600 dark:bg-warmNeutral-900 dark:text-warmNeutral-100 dark:placeholder-warmNeutral-500"
        />
      </div>

      <div className="flex flex-row gap-4">
        <div className="flex-1 space-y-1.5">
          <label
            htmlFor="feature-request-name"
            className="block text-sm font-semibold text-gray-700 dark:text-warmNeutral-200"
          >
            Name
          </label>
          <input
            id="feature-request-name"
            type="text"
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border border-warmNeutral-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-coolBlue-500 focus:outline-none focus:ring-2 focus:ring-coolBlue-500/20 dark:border-warmNeutral-600 dark:bg-warmNeutral-900 dark:text-warmNeutral-100 dark:placeholder-warmNeutral-500"
          />
        </div>

        <div className="flex-1 space-y-1.5">
          <label
            htmlFor="feature-request-email"
            className="block text-sm font-semibold text-gray-700 dark:text-warmNeutral-200"
          >
            Email
          </label>
          <input
            id="feature-request-email"
            type="email"
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border border-warmNeutral-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-coolBlue-500 focus:outline-none focus:ring-2 focus:ring-coolBlue-500/20 dark:border-warmNeutral-600 dark:bg-warmNeutral-900 dark:text-warmNeutral-100 dark:placeholder-warmNeutral-500"
          />
        </div>
      </div>

      {status === 'error' && errorMsg && (
        <p
          role="alert"
          className="rounded-lg border border-error/30 bg-white p-3 text-sm font-semibold text-error dark:bg-warmNeutral-800"
        >
          {errorMsg}
        </p>
      )}

      <Button type="submit" disabled={status === 'submitting'} className="w-full">
        {status === 'submitting' ? 'Submitting...' : 'Submit request'}
      </Button>
    </form>
  );
}
