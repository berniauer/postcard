import React, { useEffect, useState } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Users } from 'lucide-react';
    import PostcardItem from '@/components/dashboard/PostcardItem';

    const PublicGallery = () => {
      const [postcards, setPostcards] = useState([]);
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      useEffect(() => {
        const fetchPublicPostcards = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('postcards')
            .select(`
              id, 
              title, 
              created_at, 
              rendered_image_url, 
              design_data, 
              visibility,
              is_draft,
              user_id,
              profiles ( username, full_name, avatar_url )
            `)
            .eq('visibility', 'public')
            .eq('is_draft', false)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching public postcards:', error);
            toast({ title: "Fehler beim Laden der Galerie", description: error.message, variant: "destructive" });
          } else {
            setPostcards(data);
          }
          setLoading(false);
        };
        fetchPublicPostcards();
      }, [toast]);

      if (loading) {
        return (
          <div className="flex justify-center items-center h-full">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
      }

      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-primary flex items-center">
              <Users className="mr-3 h-8 w-8" /> Öffentliche Galerie
            </h1>
            {/* Optional: Filter/Sortier-Buttons hier einfügen */}
          </div>

          {postcards.length === 0 && !loading && (
             <Card className="text-center py-10 shadow-lg border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl text-muted-foreground">Die Galerie ist noch leer.</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Es wurden noch keine Postkarten öffentlich geteilt.
                </CardDescription>
              </CardContent>
            </Card>
          )}

          {postcards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postcards.map((postcard, index) => (
                 <motion.div
                  key={postcard.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PostcardItem postcard={postcard} isOwner={false} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      );
    };

    export default PublicGallery;