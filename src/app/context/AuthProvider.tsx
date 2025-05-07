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

      // Check if login API already called
      const current = localStorage.getItem("current");
      console.log(current)

      // Set or clear the session cookie
      if (user && !current) {
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
        if(data.success){
          localStorage.setItem("current", "1");
          router.refresh();
        }
      } else if(!user && current){
        console.log("logging out")
        await fetch('/api/v1/logout', { method: 'POST' });
        localStorage.removeItem("current");
        router.refresh();
      }
    });

    return () => unsubscribe();
  }, [user]);

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