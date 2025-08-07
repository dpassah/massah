import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RequireAuth({ children }) {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('msaah_logged_in');
      if (!loggedIn) {
        router.replace('/login');
      }
    }
  }, [router]);

  return children;
}
