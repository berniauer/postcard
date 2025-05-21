import { useState, useCallback, useEffect } from 'react'; // Added useEffect
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';
    import { DEFAULT_DESIGN_DATA } from '@/pages/PostcardEditorPage';

    const usePostcardData = (postcardId, user) => {
      const [title, setTitle] = useState('');
      const [designData, setDesignData] = useState(DEFAULT_DESIGN_DATA);
      const [isLoading, setIsLoading] = useState(false);
      const [isSaving, setIsSaving] = useState(false);
      const { toast } = useToast();
      const navigate = useNavigate();

      const fetchPostcard = useCallback(async () => {
        if (!postcardId || !user) {
          setDesignData(DEFAULT_DESIGN_DATA);
          setTitle('');
          return null;
        }
        setIsLoading(true);
        const { data, error } = await supabase
          .from('postcards')
          .select('title, design_data, user_id')
          .eq('id', postcardId)
          .single();

        setIsLoading(false);
        if (error) {
          toast({ title: 'Fehler beim Laden der Postkarte', description: error.message, variant: 'destructive' });
          setDesignData(DEFAULT_DESIGN_DATA);
          setTitle('');
          navigate('/dashboard/my-postcards');
          return null;
        }
        if (data) {
          if (data.user_id !== user.id) {
            toast({ title: 'Zugriff verweigert', description: 'Sie sind nicht berechtigt, diese Postkarte zu bearbeiten.', variant: 'destructive' });
            setDesignData(DEFAULT_DESIGN_DATA);
            setTitle('');
            navigate('/dashboard/my-postcards');
            return null;
          }
          setTitle(data.title || '');
          // Ensure loaded design_data has the full structure
          const loadedDesign = data.design_data || {};
          const validatedDesignData = {
            front: loadedDesign.front || { ...DEFAULT_DESIGN_DATA.front },
            back: loadedDesign.back || { ...DEFAULT_DESIGN_DATA.back },
            dimensions: loadedDesign.dimensions || { ...DEFAULT_DESIGN_DATA.dimensions },
          };
          // Ensure elements arrays exist
          if (!validatedDesignData.front.elements) validatedDesignData.front.elements = [];
          if (!validatedDesignData.back.elements) validatedDesignData.back.elements = [];

          setDesignData(validatedDesignData);
          return data; 
        }
        setDesignData(DEFAULT_DESIGN_DATA);
        setTitle('');
        return null;
      }, [postcardId, user, toast, navigate]);
      
      // Initialize on mount or when postcardId/user changes
      useEffect(() => {
        if (postcardId && user) {
          fetchPostcard();
        } else if (!postcardId) {
          // Reset for new postcard
          setTitle('');
          setDesignData(DEFAULT_DESIGN_DATA);
        }
      }, [postcardId, user, fetchPostcard]);


      const savePostcard = async (currentTitle, currentDesignData) => {
        if (!user) {
          toast({ title: 'Nicht angemeldet', description: 'Bitte melden Sie sich an, um zu speichern.', variant: 'destructive' });
          return false;
        }
        
        setIsSaving(true);
        const postcardPayload = {
          user_id: user.id,
          title: currentTitle,
          design_data: currentDesignData, // This now includes front, back, dimensions
          updated_at: new Date().toISOString(),
        };

        let response;
        if (postcardId) {
          response = await supabase.from('postcards').update(postcardPayload).eq('id', postcardId).select().single();
        } else {
          postcardPayload.created_at = new Date().toISOString();
          postcardPayload.visibility = 'private'; // Default visibility
          postcardPayload.is_draft = true; // Default draft status
          response = await supabase.from('postcards').insert(postcardPayload).select().single();
        }
        setIsSaving(false);

        if (response.error) {
          toast({ title: 'Fehler beim Speichern', description: response.error.message, variant: 'destructive' });
          return false;
        } else {
          toast({ title: 'Postkarte gespeichert!', description: `Ihre Postkarte "${response.data.title}" wurde erfolgreich gespeichert.` });
          // If it's a new postcard, update the designData state to include the ID from the response
          // This is not strictly necessary for navigation but good for consistency if staying on page
          if (!postcardId && response.data) {
             // navigate(`/dashboard/editor/${response.data.id}`); // Option to navigate to edit mode of new card
          }
          return true;
        }
      };
      
      return {
        title,
        setTitle,
        designData,
        setDesignData,
        isLoading,
        isSaving,
        fetchPostcard,
        savePostcard,
      };
    };

    export default usePostcardData;
