'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
        const token = await user.getIdToken();
        const response = await fetch('/api/v1/auth', {
          method: 'POST',
          headers: {
            'authorization': `Bearer ${token}`,
          },
          body: ""
        });

        const data = await response.json();
        if(data.success && !data.isLoggedIn){
          router.refresh();
        }
      }else{
        const r = await fetch('/api/v1/logout', { method: 'POST' });
        const data = await r.json();
        if(data.success){
          router.refresh();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);