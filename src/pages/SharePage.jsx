import React, { useEffect, useState } from 'react';
    import { useParams, Link as RouterLink } from 'react-router-dom';
    import { supabase } from '@/lib/supabaseClient';
    import PostcardPreview from '@/components/editor/PostcardPreview'; 
    import { Button } from '@/components/ui/button';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Loader2, AlertTriangle, ShieldQuestion, Home, Image as ImageIcon } from 'lucide-react';
    import { Card, CardContent } from '@/components/ui/card';

    const SharePage = () => {
      const { shareToken } = useParams();
      const [postcardData, setPostcardData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [activeSide, setActiveSide] = useState('front');

      useEffect(() => {
        if (!shareToken) {
          setError('Kein Freigabe-Token gefunden.');
          setLoading(false);
          return;
        }

        const fetchPostcard = async () => {
          setLoading(true);
          setError(null);
          try {
            const { data, error: rpcError } = await supabase.rpc('get_postcard_by_share_token', {
              token_value: shareToken,
            });

            if (rpcError) {
              throw rpcError;
            }

            if (data && data.length > 0) {
              // Supabase RPC returns an array, even if it's a single record
              const card = data[0];
              const validatedDesignData = {
                front: card.design_data?.front || { elements: [], backgroundColor: '#FFFFFF' },
                back: card.design_data?.back || { elements: [], backgroundColor: '#FFFFFF' },
                dimensions: card.design_data?.dimensions || { width: 600, height: 400 },
              };
              setPostcardData({ ...card, design_data: validatedDesignData });
            } else {
              setError('Postkarte nicht gefunden oder der Link ist ungültig/abgelaufen.');
            }
          } catch (e) {
            console.error('Fehler beim Abrufen der geteilten Postkarte:', e);
            setError(e.message || 'Ein unerwarteter Fehler ist aufgetreten.');
          } finally {
            setLoading(false);
          }
        };

        fetchPostcard();
      }, [shareToken]);

      if (loading) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center gradient-bg p-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <p className="text-xl text-foreground">Lade geteilte Postkarte...</p>
          </div>
        );
      }

      if (error) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center gradient-bg text-center p-4">
            <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
            <h1 className="text-3xl font-semibold text-destructive mb-3">Fehler</h1>
            <p className="text-lg text-foreground mb-8">{error}</p>
            <Button asChild variant="secondary">
              <RouterLink to="/"><Home className="mr-2 h-4 w-4"/>Zur Startseite</RouterLink>
            </Button>
          </div>
        );
      }

      if (!postcardData) {
         return (
          <div className="min-h-screen flex flex-col items-center justify-center gradient-bg text-center p-4">
            <ShieldQuestion className="h-16 w-16 text-muted-foreground mb-6" />
            <h1 className="text-3xl font-semibold text-foreground mb-3">Postkarte nicht verfügbar</h1>
            <p className="text-lg text-muted-foreground mb-8">Die angeforderte Postkarte konnte nicht geladen werden.</p>
             <Button asChild variant="secondary">
              <RouterLink to="/"><Home className="mr-2 h-4 w-4"/>Zur Startseite</RouterLink>
            </Button>
          </div>
        );
      }
      
      const currentActivePageData = postcardData.design_data[activeSide];

      return (
        <div className="min-h-screen flex flex-col items-center justify-center gradient-bg p-2 sm:p-4">
          <Card className="w-full max-w-3xl shadow-2xl my-4">
            <CardContent className="p-4 sm:p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-2">
                {postcardData.title || 'Eine geteilte Postkarte'}
              </h1>
              {postcardData.creator_username && (
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Gestaltet von: {postcardData.creator_username}
                </p>
              )}

              <Tabs value={activeSide} onValueChange={setActiveSide} className="w-full mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="front">Vorderseite</TabsTrigger>
                  <TabsTrigger value="back">Rückseite</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex justify-center items-center p-1 bg-grid-pattern rounded-md border border-dashed">
                {postcardData.design_data && postcardData.design_data.dimensions ? (
                     <PostcardPreview 
                        pageData={currentActivePageData}
                        dimensions={postcardData.design_data.dimensions}
                        previewMode="sharePage" // Indicate this is for public sharing view
                    />
                ) : (
                    <p className="text-muted-foreground">Vorschau nicht verfügbar.</p>
                )}
              </div>
            </CardContent>
          </Card>
          <footer className="text-center py-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Geteilt mit <ImageIcon className="inline h-4 w-4 mx-1 text-primary"/> Postkarten App
            </p>
             <Button asChild variant="link" size="sm" className="mt-2 text-primary">
                <RouterLink to="/">Erstelle deine eigene Postkarte!</RouterLink>
             </Button>
          </footer>
        </div>
      );
    };

    export default SharePage;