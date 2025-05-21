import { useState, useEffect } from 'react';
    import { supabase } from '@/lib/supabaseClient';

    const useUserData = () => {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const getCurrentUser = async () => {
          setLoading(true);
          const { data: { user: authUser }, error } = await supabase.auth.getUser();
          if (error) {
            console.error("Error fetching user:", error);
          }
          setUser(authUser);
          setLoading(false);
        };
        getCurrentUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ?? null);
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }, []);

      return { user, loading };
    };

    export default useUserData;