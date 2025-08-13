import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export default function Protected({ children }: { children: JSX.Element }) {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'checking' | 'ok' | 'fail'>('checking');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!cancelled) setStatus(res.ok ? 'ok' : 'fail');
      } catch {
        if (!cancelled) setStatus('fail');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (status === 'fail') navigate('/');
  }, [status]);

  if (status === 'checking') return null;
  if (status === 'fail') return null;
  return children;
}

