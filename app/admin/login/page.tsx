'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-warmNeutral-200 bg-white p-8 shadow-[0_16px_32px_-20px_rgba(92,54,38,0.35)] dark:border-warmNeutral-700 dark:bg-warmNeutral-800">
        <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-tertiary">Admin access</p>
        <h1 className="mt-2 text-2xl font-black tracking-headlines">Log in</h1>
        <div className="mt-6">
          <LoginForm onSuccess={() => router.push('/admin')} />
        </div>
      </div>
    </div>
  );
}
