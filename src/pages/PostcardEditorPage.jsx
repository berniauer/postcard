import React, { useState, useEffect, useCallback } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Removed CardContent, CardFooter as they are not directly used
    import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Removed TabsContent
    import { motion } from 'framer-motion';
    import { Save, Loader2, ArrowLeft, FileImage as ImageIconIcon, AlertTriangle } from 'lucide-react';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; // Removed AlertDialogTrigger

    import PostcardPreview from '@/components/editor/PostcardPreview';
    import PropertyInspector from '@/components/editor/PropertyInspector';
    import Toolbar from '@/components/editor/Toolbar';

    import useUserData from '@/hooks/useUserData';
    import useTemplates from '@/hooks/useTemplates';
    import usePostcardData from '@/hooks/usePostcardData';
    import { supabase } from '@/lib/supabaseClient'; 

    export const DEFAULT_ELEMENT_STYLE = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#000000',
      textAlign: 'left',
      fontWeight: 'normal',
      fontStyle: 'normal',
      opacity: 1,
      zIndex: 1,
    };

    export const DEFAULT_TEXT_ELEMENT = {
      type: 'text',
      id: '', 
      content: 'Neuer Text',
      x: 10,
      y: 10,
      width: 200,
      height: 50,
      rotation: 0,
      style: { ...DEFAULT_ELEMENT_STYLE },
    };

    export const DEFAULT_IMAGE_ELEMENT = {
      type: 'image',
      id: '', 
      src: 'https://via.placeholder.com/150', 
      x: 50,
      y: 50,
      width: 150,
      height: 100,
      rotation: 0,
      style: { ...DEFAULT_ELEMENT_STYLE, opacity: 1 },
    };
    
    export const DEFAULT_PAGE_DATA = {
      elements: [],
      backgroundColor: '#FFFFFF',
    };

    export const DEFAULT_DESIGN_DATA = {
      front: { ...DEFAULT_PAGE_DATA, elements: [{...DEFAULT_TEXT_ELEMENT, id: crypto.randomUUID(), content: "Vorderseite Text"}] },
      back: { ...DEFAULT_PAGE_DATA, elements: [{...DEFAULT_TEXT_ELEMENT, id: crypto.randomUUID(), content: "Rückseite Text"}] },
      dimensions: { width: 600, height: 400 }, 
    };

    // Refactored: Extracted stateful logic into custom hooks where possible (usePostcardData, useTemplates, useUserData)
    // Refactored: Logic for template handling and element manipulation remains here as it's specific to editor orchestration.

    const PostcardEditorPage = () => {
      const { postcardId } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();
      
      const { user } = useUserData();
      const { templates, fetchTemplates } = useTemplates();
      
      const {
        title,
        setTitle,
        designData,
        setDesignData, // Direct setDesignData is now wrapped by updateDesignDataWithHistory
        isLoading,
        isSaving,
        fetchPostcard,
        savePostcard
      } = usePostcardData(postcardId, user);

      const [activeSide, setActiveSide] = useState('front'); 
      const [selectedElementId, setSelectedElementId] = useState(null);
      const [selectedTemplateId, setSelectedTemplateId] = useState(postcardId ? '' : 'none'); // Initial template selection
      const [initialDesignDataForTemplates, setInitialDesignDataForTemplates] = useState(DEFAULT_DESIGN_DATA); // Stores the design before a template is applied
      const [isTemplateAlertOpen, setIsTemplateAlertOpen] = useState(false);
      const [pendingTemplateId, setPendingTemplateId] = useState(null); // Template to apply after confirmation
      
      // History for Undo/Redo
      const [history, setHistory] = useState([DEFAULT_DESIGN_DATA]);
      const [historyStep, setHistoryStep] = useState(0);

      useEffect(() => {
        fetchTemplates();
      }, [fetchTemplates]);

      // Effect to load postcard or initialize new one, and set up history
      useEffect(() => {
        let isMounted = true;
        const initializeEditor = async () => {
          if (user && postcardId) {
            const data = await fetchPostcard(); // fetchPostcard now returns data
            if (isMounted && data && data.design_data) {
              const loadedDesign = {
                front: data.design_data.front || { ...DEFAULT_PAGE_DATA },
                back: data.design_data.back || { ...DEFAULT_PAGE_DATA },
                dimensions: data.design_data.dimensions || { ...DEFAULT_DESIGN_DATA.dimensions }
              };
              if (!loadedDesign.front.elements) loadedDesign.front.elements = [];
              if (!loadedDesign.back.elements) loadedDesign.back.elements = [];

              setInitialDesignDataForTemplates(loadedDesign);
              setHistory([loadedDesign]);
              setHistoryStep(0);
              // setDesignData from usePostcardData will handle setting the actual designData state
            } else if (isMounted && data) {
              setInitialDesignDataForTemplates(DEFAULT_DESIGN_DATA);
              setHistory([DEFAULT_DESIGN_DATA]);
              setHistoryStep(0);
            }
          } else if (isMounted && !postcardId) {
            setTitle('');
            // setDesignData(DEFAULT_DESIGN_DATA); // This is handled by usePostcardData's initialization
            setInitialDesignDataForTemplates(DEFAULT_DESIGN_DATA);
            setSelectedTemplateId('none');
            setHistory([DEFAULT_DESIGN_DATA]);
            setHistoryStep(0);
          }
        };
        initializeEditor();
        return () => { isMounted = false; };
      }, [user, postcardId, fetchPostcard, setTitle]); // Removed setDesignData from dep array as it's from hook

      // Wrapper for setDesignData to include history update
      const updateDesignDataWithHistory = useCallback((newDesignDataOrUpdater) => {
        setDesignData(prevDesignData => {
          const newDesignData = typeof newDesignDataOrUpdater === 'function' 
            ? newDesignDataOrUpdater(prevDesignData) 
            : newDesignDataOrUpdater;
          
          const currentHistory = history.slice(0, historyStep + 1);
          const updatedHistory = [...currentHistory, newDesignData];
          setHistory(updatedHistory);
          setHistoryStep(currentHistory.length);
          return newDesignData;
        });
      }, [history, historyStep, setDesignData]);


      const handleTemplateSelectChange = (templateId) => {
        const currentDesignString = JSON.stringify(designData);
        // Compare against the designData state *before* this template change, which is history[historyStep]
        const previousDesignString = JSON.stringify(history[historyStep]);


        // Check if there are meaningful changes compared to the last saved history state
        // Or if postcardId exists, compare to initial loaded data for templates
        const baseForComparison = postcardId ? initialDesignDataForTemplates : history[0];
        const hasMeaningfulChanges = JSON.stringify(designData) !== JSON.stringify(baseForComparison);

        if (hasMeaningfulChanges && templateId !== 'none' && JSON.stringify(designData) !== previousDesignString ) {
            setPendingTemplateId(templateId);
            setIsTemplateAlertOpen(true);
        } else {
            applyTemplate(templateId);
        }
      };

      const applyTemplate = (templateId) => {
        setSelectedTemplateId(templateId);
        if (templateId === 'none') {
          updateDesignDataWithHistory(initialDesignDataForTemplates);
        } else {
          const template = templates.find(t => t.id === templateId);
          if (template && template.design_data) {
            const templateDesign = {
              front: template.design_data.front || { ...DEFAULT_PAGE_DATA },
              back: template.design_data.back || { ...DEFAULT_PAGE_DATA },
              dimensions: template.design_data.dimensions || { ...DEFAULT_DESIGN_DATA.dimensions }
            };
            if(!templateDesign.front.elements) templateDesign.front.elements = [];
            if(!templateDesign.back.elements) templateDesign.back.elements = [];
            updateDesignDataWithHistory(templateDesign);
          }
        }
        setIsTemplateAlertOpen(false);
        setPendingTemplateId(null);
      };

      const confirmApplyTemplate = () => {
        if (pendingTemplateId) {
            applyTemplate(pendingTemplateId);
        }
      };

      const cancelApplyTemplate = () => {
        setIsTemplateAlertOpen(false);
        setPendingTemplateId(null);
        const currentTemplateStillApplied = templates.find(t => {
          // Deep compare template's design_data with current designData
          if (!t.design_data) return false;
          const templateDesign = {
            front: t.design_data.front || { ...DEFAULT_PAGE_DATA },
            back: t.design_data.back || { ...DEFAULT_PAGE_DATA },
            dimensions: t.design_data.dimensions || { ...DEFAULT_DESIGN_DATA.dimensions }
          };
          return JSON.stringify(templateDesign) === JSON.stringify(designData);
        });
        setSelectedTemplateId(currentTemplateStillApplied ? currentTemplateStillApplied.id : 'none');
      };

      const handleSave = async () => {
        if (!title.trim()) {
            toast({ title: 'Titel fehlt', description: 'Bitte geben Sie einen Titel für Ihre Postkarte ein.', variant: 'warning' });
            return;
        }
        const currentDesignDataToSave = (designData && designData.front && designData.back) ? designData : DEFAULT_DESIGN_DATA;
        const success = await savePostcard(title, currentDesignDataToSave);
        if (success) {
          navigate(`/dashboard/my-postcards`);
        }
      };

      const addElement = (type) => {
        const newElementBase = type === 'text' ? DEFAULT_TEXT_ELEMENT : DEFAULT_IMAGE_ELEMENT;
        const newElement = { ...newElementBase, id: crypto.randomUUID() };
        
        updateDesignDataWithHistory(prevDesign => {
          const newDesign = JSON.parse(JSON.stringify(prevDesign));
          if (!newDesign[activeSide]) newDesign[activeSide] = { ...DEFAULT_PAGE_DATA };
          if (!newDesign[activeSide].elements) newDesign[activeSide].elements = [];
          newDesign[activeSide].elements.push(newElement);
          return newDesign;
        });
        setSelectedElementId(newElement.id);
      };
      
      // updateElement is now element-type agnostic for base properties, style is merged
      const updateElement = (elementId, updates) => {
        updateDesignDataWithHistory(prevDesign => {
            const newDesign = JSON.parse(JSON.stringify(prevDesign));
            if (!newDesign[activeSide] || !newDesign[activeSide].elements) return prevDesign; // Should not happen
            
            const pageElements = newDesign[activeSide].elements;
            const elementIndex = pageElements.findIndex(el => el.id === elementId);

            if (elementIndex > -1) {
                const existingElement = pageElements[elementIndex];
                // Merge updates, ensuring style is also merged rather than replaced
                pageElements[elementIndex] = {
                    ...existingElement,
                    ...updates,
                    style: {
                        ...(existingElement.style || {}),
                        ...(updates.style || {}),
                    },
                };
            }
            return newDesign;
        });
      };
      
      const deleteElement = (elementIdToDelete) => {
        updateDesignDataWithHistory(prevDesign => {
          const newDesign = JSON.parse(JSON.stringify(prevDesign));
          if (!newDesign[activeSide] || !newDesign[activeSide].elements) return prevDesign;
          newDesign[activeSide].elements = newDesign[activeSide].elements.filter(el => el.id !== elementIdToDelete);
          return newDesign;
        });
        setSelectedElementId(prevSelected => (prevSelected === elementIdToDelete ? null : prevSelected));
      };

      const updatePageBackground = (color) => {
        updateDesignDataWithHistory(prevDesign => {
          const newDesign = JSON.parse(JSON.stringify(prevDesign));
          if (!newDesign[activeSide]) newDesign[activeSide] = { ...DEFAULT_PAGE_DATA };
          newDesign[activeSide].backgroundColor = color;
          return newDesign;
        });
      };

      const selectedElement = designData[activeSide]?.elements.find(el => el.id === selectedElementId);

      const uploadImage = async (file) => {
        if (!file || !user) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from('postcard_images') 
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('postcard_images')
            .getPublicUrl(filePath);
          
          return publicUrlData.publicUrl;

        } catch (error) {
          toast({ title: 'Bild-Upload fehlgeschlagen', description: error.message, variant: 'destructive' });
          return null;
        }
      };
      
      const handleUndo = () => {
        if (historyStep > 0) {
          const newStep = historyStep - 1;
          setHistoryStep(newStep);
          setDesignData(history[newStep]); // Directly set designData from history, bypassing updateDesignDataWithHistory
        }
      };

      const handleRedo = () => {
        if (historyStep < history.length - 1) {
          const newStep = historyStep + 1;
          setHistoryStep(newStep);
          setDesignData(history[newStep]); // Directly set designData from history
        }
      };

      if (isLoading && postcardId) { 
        return (
          <div className="flex justify-center items-center h-[calc(100vh-128px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Lade Editor...</p>
          </div>
        );
      }
      
      const currentActivePageData = designData[activeSide] || DEFAULT_PAGE_DATA;

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto p-2 md:p-4"
        >
          <Card className="shadow-xl border-border/60 overflow-hidden">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="self-start sm:self-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
                <CardTitle className="text-xl md:text-2xl font-bold text-primary flex items-center">
                  <ImageIconIcon className="mr-2 h-6 w-6" /> 
                  {postcardId ? 'Postkarte bearbeiten' : 'Neue Postkarte erstellen'}
                </CardTitle>
                <Button onClick={handleSave} disabled={isSaving || (isLoading && !postcardId)} size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white font-semibold self-end sm:self-center">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {postcardId ? 'Speichern' : 'Erstellen'}
                </Button>
              </div>
              {postcardId && <CardDescription className="text-center mt-1 text-xs">ID: {postcardId}</CardDescription>}
            </CardHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-9 bg-muted/30 p-2 md:p-4 flex flex-col">
                <Toolbar 
                  onAddElement={addElement} 
                  onUndo={handleUndo} 
                  onRedo={handleRedo}
                  canUndo={historyStep > 0}
                  canRedo={historyStep < history.length - 1}
                />
                <Tabs value={activeSide} onValueChange={setActiveSide} className="w-full mt-2 mb-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="front">Vorderseite</TabsTrigger>
                    <TabsTrigger value="back">Rückseite</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex-grow flex items-center justify-center p-1 md:p-2 bg-grid-pattern rounded-md border border-dashed">
                   <PostcardPreview 
                    pageData={currentActivePageData} 
                    dimensions={designData.dimensions}
                    selectedElementId={selectedElementId}
                    onSelectElement={setSelectedElementId}
                    onUpdateElement={updateElement} // Pass the direct update function
                  />
                </div>
              </div>

              <div className="lg:col-span-3 bg-card border-l border-border/50 p-3 md:p-4 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-none">
                <PropertyInspector
                  title={title}
                  setTitle={setTitle}
                  selectedElement={selectedElement}
                  activePageData={currentActivePageData}
                  onUpdateElement={updateElement} // Pass the direct update function
                  onDeleteElement={deleteElement}
                  onUpdatePageBackground={updatePageBackground}
                  templates={templates}
                  selectedTemplateId={selectedTemplateId}
                  onTemplateSelect={handleTemplateSelectChange}
                  initialDesignDataForTemplates={initialDesignDataForTemplates}
                  onUploadImage={uploadImage}
                  dimensions={designData.dimensions}
                  setDesignData={updateDesignDataWithHistory} // Pass the history wrapper for direct designData changes from inspector
                  designData={designData}
                />
              </div>
            </div>
          </Card>

          <AlertDialog open={isTemplateAlertOpen} onOpenChange={setIsTemplateAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-yellow-500"/> Änderungen überschreiben?</AlertDialogTitle>
                <AlertDialogDescription>
                  Das Anwenden einer Vorlage überschreibt alle aktuellen Änderungen auf der Postkarte. Möchten Sie fortfahren?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelApplyTemplate}>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={confirmApplyTemplate} className="bg-primary hover:bg-primary/90">Vorlage anwenden</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </motion.div>
      );
    };

    export default PostcardEditorPage;