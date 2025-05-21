import React, { useEffect, useState } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { PlusCircle, Image as ImageIcon, Edit, Trash2, Eye, FileText } from 'lucide-react';
    import PostcardItem from '@/components/dashboard/PostcardItem';

    const MyPostcards = () => {
      const [postcards, setPostcards] = useState([]);
      const [loading, setLoading] = useState(true);
      const [user, setUser] = useState(null);
      const { toast } = useToast();
      const navigate = useNavigate();

      useEffect(() => {
        const fetchUserAndPostcards = async () => {
          setLoading(true);
          const { data: { user: authUser } } = await supabase.auth.getUser();
          setUser(authUser);

          if (authUser) {
            const { data, error } = await supabase
              .from('postcards')
              .select('id, title, created_at, rendered_image_url, design_data, visibility, is_draft')
              .eq('user_id', authUser.id)
              .order('created_at', { ascending: false });

            if (error) {
              console.error('Error fetching postcards:', error);
              toast({ title: "Fehler beim Laden der Postkarten", description: error.message, variant: "destructive" });
            } else {
              setPostcards(data);
            }
          }
          setLoading(false);
        };
        fetchUserAndPostcards();
      }, [toast]);

      const handleDeletePostcard = async (postcardId) => {
        // Die Löschbestätigung wird jetzt in PostcardDetailPage.jsx gehandhabt
        // Hier könnten wir direkt löschen, wenn wir es von hier aus tun wollten,
        // aber es ist konsistenter, es auf der Detailseite zu belassen.
        // Für den Fall, dass wir es doch hier bräuchten:
        // if (!window.confirm("Möchten Sie diese Postkarte wirklich löschen?")) return;
        // const { error } = await supabase.from('postcards').delete().eq('id', postcardId);
        // if (error) {
        //   toast({ title: "Fehler beim Löschen", description: error.message, variant: "destructive" });
        // } else {
        //   setPostcards(prev => prev.filter(p => p.id !== postcardId));
        //   toast({ title: "Postkarte gelöscht", description: "Die Postkarte wurde erfolgreich entfernt." });
        // }
        // Stattdessen navigieren wir zur Detailseite, wo der Nutzer löschen kann
        navigate(`/dashboard/postcards/${postcardId}`);
      };

      if (loading) {
        return (
          <div className="flex justify-center items-center h-full">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-muted-foreground">Lade meine Postkarten...</span>
          </div>
        );
      }

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
              <ImageIcon className="mr-3 h-7 w-7 sm:h-8 sm:w-8" /> Meine Postkarten
            </h1>
            {/* Der Button "Neue Postkarte erstellen" ist jetzt in der Dashboard-Kopfzeile */}
          </div>

          {postcards.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center py-10"
            >
              <Card className="max-w-lg mx-auto shadow-xl border-border/50 bg-gradient-to-br from-card to-muted/30 p-6 sm:p-10">
                <CardHeader className="items-center">
                  <FileText className="h-16 w-16 text-primary mb-4" />
                  <CardTitle className="text-2xl sm:text-3xl font-semibold">Ihre Leinwand wartet!</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-6 text-base">
                    Sie haben noch keine Postkarten erstellt. Lassen Sie Ihrer Kreativität freien Lauf und gestalten Sie Ihre erste einzigartige digitale Postkarte.
                  </CardDescription>
                  <Button 
                    onClick={() => navigate('/dashboard/editor')} 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white text-lg px-8 py-6 shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105"
                  >
                    <PlusCircle className="mr-2 h-6 w-6" /> Erste Postkarte gestalten
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {postcards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {postcards.map((postcard, index) => (
                <motion.div
                  key={postcard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="h-full" 
                >
                  <PostcardItem postcard={postcard} isOwner={true} onDelete={() => handleDeletePostcard(postcard.id)} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      );
    };

    export default MyPostcards;