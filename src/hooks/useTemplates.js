import { useState, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';

    const useTemplates = () => {
      const [templates, setTemplates] = useState([]);
      const [loadingTemplates, setLoadingTemplates] = useState(false);
      const { toast } = useToast();

      const fetchTemplates = useCallback(async () => {
        setLoadingTemplates(true);
        const { data, error } = await supabase
          .from('templates')
          .select('id, name, design_data')
          .eq('is_public', true)
          .order('name');
        
        if (error) {
          toast({ title: 'Fehler beim Laden der Vorlagen', description: error.message, variant: 'destructive' });
          setTemplates([]);
        } else {
          setTemplates(data || []);
        }
        setLoadingTemplates(false);
      }, [toast]);

      return { templates, loadingTemplates, fetchTemplates };
    };

    export default useTemplates;