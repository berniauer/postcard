import React, { useState, useEffect } from 'react';
    import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
    import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfileOverview from '@/components/dashboard/ProfileOverview';
import MyPostcards from '@/components/dashboard/MyPostcards';
import PublicGallery from '@/components/dashboard/PublicGallery';
import PostcardEditorPage from '@/pages/PostcardEditorPage';
import PostcardDetailPage from '@/pages/PostcardDetailPage';
import SharePage from '@/pages/SharePage';
import ImageGeneratorPage from '@/pages/ImageGeneratorPage';
    import { Button } from '@/components/ui/button'; // Added import for Button
    
    import { Toaster } from '@/components/ui/toaster';
    import { MotionConfig } from 'framer-motion';
    import { supabase } from '@/lib/supabaseClient';

    function App() {
      const [session, setSession] = useState(null);
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();
      const location = useLocation();

      useEffect(() => {
        const getSession = async () => {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
          setLoading(false);
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            setSession(newSession);
            if (newSession && (location.pathname === '/login' || location.pathname === '/')) {
              navigate('/dashboard/my-postcards'); 
            } else if (!newSession && !location.pathname.startsWith('/login') && !location.pathname.startsWith('/share/')) { 
              navigate('/login');
            }
          }
        );

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }, [navigate, location.pathname]);

      if (loading) {
        return (
          <div className="min-h-screen flex items-center justify-center gradient-bg">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-white text-xl">Lade Anwendung...</p>
            </div>
          </div>
        );
      }

      return (
        <MotionConfig transition={{ duration: 0.3, type: "tween" }}>
          <Routes>
            <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/dashboard/my-postcards" />} />
            <Route 
              path="/dashboard" 
              element={session ? <DashboardPage /> : <Navigate to="/login" />}
            >
              <Route index element={<Navigate to="my-postcards" replace />} />
              <Route path="profile" element={<ProfileOverview />} />
              <Route path="my-postcards" element={<MyPostcards />} />
              <Route path="gallery" element={<PublicGallery />} />
              <Route path="postcards/:postcardId" element={<PostcardDetailPage />} />
              <Route path="editor" element={<PostcardEditorPage />} />
              <Route path="editor/:postcardId" element={<PostcardEditorPage />} />
              <Route path="generator" element={<ImageGeneratorPage />} />
            </Route>
            <Route path="/share/:shareToken" element={<SharePage />} /> 
            <Route path="/" element={<Navigate to={session ? "/dashboard/my-postcards" : "/login"} />} />
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center gradient-bg text-center p-4">
                <h1 className="text-6xl font-bold text-destructive mb-4">404</h1>
                <p className="text-2xl text-foreground mb-2">Seite nicht gefunden</p>
                <p className="text-muted-foreground mb-8">Die gesuchte Seite existiert nicht oder wurde verschoben.</p>
                <Button onClick={() => navigate('/')} variant="default">Zur Startseite</Button>
              </div>
            } /> 
          </Routes>
          <Toaster />
        </MotionConfig>
      );
    }


export default App;
