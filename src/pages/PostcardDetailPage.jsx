import React, { useEffect, useState, useCallback } from 'react';
    import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'; 
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; 
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter, DialogTrigger } from "@/components/ui/dialog"; // Added DialogTrigger
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import PostcardPreview from '@/components/editor/PostcardPreview';
    import useUserData from '@/hooks/useUserData';
    import { Loader2, ArrowLeft, Edit, Trash2, Share2, Copy, Link2 as LinkIcon, PlusCircle } from 'lucide-react'; 
    import { motion } from 'framer-motion';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 


    // Extracted components for better structure
    const PostcardInfo = ({ postcard, creatorProfile, displayDate, visibilityText }) => (
      <>
        <CardTitle className="text-3xl md:text-4xl font-bold text-primary">{postcard.title || 'Unbenannte Postkarte'}</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1 mt-2">
          <p>Erstellt von: <span className="font-semibold">{creatorProfile?.username || creatorProfile?.full_name || 'Unbekannt'}</span></p>
          <p>Am: <span className="font-semibold">{displayDate}</span></p>
          <p>Sichtbarkeit: <span className="font-semibold">{visibilityText}</span> {postcard.is_draft && <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full inline-block ml-2">Entwurf</span>}</p>
        </div>
      </>
    );

    const ShareLinkDialogContent = ({ postcard, user, sharedLinks, setSharedLinks, newlyCreatedLink, setNewlyCreatedLink, handleCopyToClipboard, fetchPostcardDetails }) => {
      const { toast } = useToast();
      const [isCreatingLink, setIsCreatingLink] = useState(false);
      const [isDeletingLink, setIsDeletingLink] = useState(null);

      const handleCreateShareLink = async () => {
        if (!user || !postcard) return;
        setIsCreatingLink(true);
        setNewlyCreatedLink('');
        
        const { data, error } = await supabase
          .from('shared_links')
          .insert({ postcard_id: postcard.id, user_id: user.id }) 
          .select('share_token, id') 
          .single();

        setIsCreatingLink(false);
        if (error || !data || !data.share_token) {
          toast({ title: 'Fehler beim Erstellen des Links', description: error?.message || "Token nicht erhalten.", variant: 'destructive' });
        } else {
          const fullLink = `${window.location.origin}/share/${data.share_token}`;
          setNewlyCreatedLink(fullLink);
          fetchPostcardDetails(); 
          toast({ title: 'Freigabelink erstellt!', description: 'Der Link kann nun kopiert und geteilt werden.' });
        }
      };
      
      const handleDeleteShareLink = async (linkId) => {
        setIsDeletingLink(linkId);
        const { error } = await supabase.from('shared_links').delete().eq('id', linkId);
        setIsDeletingLink(null);
        if (error) {
          toast({ title: 'Fehler beim Löschen des Links', description: error.message, variant: 'destructive' });
        } else {
          setSharedLinks(prev => prev.filter(link => link.id !== linkId));
          toast({ title: 'Freigabelink gelöscht.' });
        }
      };

      return (
        <>
          <DialogHeader>
            <DialogTitle>Postkarte teilen</DialogTitle>
            <DialogDescription>
              Erstellen und verwalten Sie Freigabelinks für diese Postkarte.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Button onClick={handleCreateShareLink} disabled={isCreatingLink} className="w-full">
              {isCreatingLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <PlusCircle className="mr-2 h-4 w-4" /> Neuen Freigabelink erstellen
            </Button>

            {newlyCreatedLink && (
              <div className="mt-4 p-3 border rounded-md bg-green-50 border-green-200">
                <Label htmlFor="newLink" className="text-sm font-medium text-green-700">Neuer Link:</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input id="newLink" value={newlyCreatedLink} readOnly className="flex-grow"/>
                  <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(newlyCreatedLink)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {sharedLinks.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-md font-semibold text-muted-foreground">Aktive Freigabelinks:</h4>
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                  {sharedLinks.map(link => (
                    <div key={link.id || link.share_token} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50">
                      <div className="flex items-center space-x-2 overflow-hidden">
                        <LinkIcon className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-xs truncate" title={`${window.location.origin}/share/${link.share_token}`}>
                          {`${window.location.origin.replace(/^(https?:\/\/)/,'')}/share/${link.share_token.substring(0,8)}...`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(`${window.location.origin}/share/${link.share_token}`)} className="h-7 w-7">
                              <Copy className="h-3 w-3"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteShareLink(link.id)} disabled={isDeletingLink === link.id} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                          {isDeletingLink === link.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <Trash2 className="h-3 w-3"/>}
                          </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
             {sharedLinks.length === 0 && !newlyCreatedLink && (
                  <p className="text-sm text-muted-foreground text-center pt-2">Noch keine Freigabelinks für diese Postkarte erstellt.</p>
             )}
          </div>
          <DialogFooter>
              <DialogClose asChild>
                  <Button type="button" variant="outline">Schließen</Button>
              </DialogClose>
          </DialogFooter>
        </>
      );
    };


    const PostcardDetailPage = () => {
      const { postcardId } = useParams();
      const navigate = useNavigate();
      const { toast } = useToast();
      const { user } = useUserData();

      const [postcard, setPostcard] = useState(null);
      const [creatorProfile, setCreatorProfile] = useState(null);
      const [sharedLinks, setSharedLinks] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [isDeleting, setIsDeleting] = useState(false);
      const [newlyCreatedLink, setNewlyCreatedLink] = useState('');
      const [activeSide, setActiveSide] = useState('front');


      const fetchPostcardDetails = useCallback(async () => {
        setIsLoading(true);
        const { data: postcardData, error: postcardError } = await supabase
          .from('postcards')
          .select('*, profiles (username, full_name)')
          .eq('id', postcardId)
          .single();

        if (postcardError || !postcardData) {
          toast({ title: 'Fehler beim Laden der Postkarte', description: postcardError?.message || 'Postkarte nicht gefunden.', variant: 'destructive' });
          navigate('/dashboard/my-postcards');
          return;
        }
        setPostcard(postcardData);
        setCreatorProfile(postcardData.profiles);

        if (user && postcardData.user_id === user.id) {
          const { data: linksData, error: linksError } = await supabase
            .from('shared_links')
            .select('*')
            .eq('postcard_id', postcardId)
            .order('created_at', { ascending: false });
          
          if (linksError) {
            toast({ title: 'Fehler beim Laden der Freigabelinks', description: linksError.message, variant: 'warning' });
          } else {
            setSharedLinks(linksData || []);
          }
        }
        setIsLoading(false);
      }, [postcardId, navigate, toast, user]);

      useEffect(() => {
        fetchPostcardDetails();
      }, [fetchPostcardDetails]);

      const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
          toast({ title: 'Link kopiert!', description: 'Der Link wurde in die Zwischenablage kopiert.' });
        }).catch(err => {
          toast({ title: 'Fehler beim Kopieren', description: err.message, variant: 'destructive' });
        });
      };

      const handleDeletePostcard = async () => {
        setIsDeleting(true);
        const { error } = await supabase.from('postcards').delete().eq('id', postcardId);
        setIsDeleting(false);
        if (error) {
          toast({ title: 'Fehler beim Löschen', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Postkarte gelöscht', description: 'Die Postkarte wurde erfolgreich entfernt.' });
          navigate('/dashboard/my-postcards');
        }
      };

      if (isLoading) {
        return (
          <div className="flex flex-col justify-center items-center h-[calc(100vh-128px)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Lade Postkartendetails...</p>
          </div>
        );
      }

      if (!postcard) {
        return ( 
          <div className="flex flex-col justify-center items-center h-[calc(100vh-128px)]">
            <p className="text-xl text-destructive">Postkarte nicht gefunden.</p>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
              Zurück zum Dashboard
            </Button>
          </div>
        );
      }

      const isOwner = user && postcard.user_id === user.id;
      const canView = postcard.visibility === 'public' || isOwner;

      if (!canView) {
        return (
          <div className="flex flex-col justify-center items-center h-[calc(100vh-128px)]">
            <p className="text-xl text-destructive">Keine Berechtigung</p>
            <p className="text-muted-foreground">Sie haben keine Berechtigung, diese Postkarte anzusehen.</p>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
              Zurück zum Dashboard
            </Button>
          </div>
        );
      }
      
      const displayDate = new Date(postcard.created_at).toLocaleDateString('de-DE', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      
      const visibilityText = {
        public: 'Öffentlich',
        private: 'Privat',
        unlisted: 'Nicht gelistet (nur mit Link)'
      }[postcard.visibility] || 'Unbekannt';

      const currentActivePageData = postcard.design_data[activeSide];

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto p-4 md:p-6"
        >
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>

          <Card className="shadow-xl border-border/60">
            <CardHeader className="border-b border-border/50 pb-4">
              <PostcardInfo postcard={postcard} creatorProfile={creatorProfile} displayDate={displayDate} visibilityText={visibilityText} />
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 flex flex-col justify-center items-center">
                <Tabs value={activeSide} onValueChange={setActiveSide} className="w-full mb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="front">Vorderseite</TabsTrigger>
                    <TabsTrigger value="back">Rückseite</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex justify-center items-start p-1 bg-grid-pattern rounded-md border border-dashed">
                  {postcard.design_data && postcard.design_data.dimensions ? (
                     <PostcardPreview 
                        pageData={currentActivePageData} 
                        dimensions={postcard.design_data.dimensions} 
                        previewMode="detailPage"
                     />
                  ) : (
                     <p className="text-muted-foreground p-10">Vorschau nicht verfügbar.</p>
                  )}
                </div>
              </div>
              <div className="md:col-span-1 space-y-4">
                {isOwner && (
                  <>
                    <h3 className="text-lg font-semibold text-muted-foreground border-b pb-2">Aktionen</h3>
                    <Button onClick={() => navigate(`/dashboard/editor/${postcardId}`)} className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                      <Edit className="mr-2 h-4 w-4" /> Postkarte bearbeiten
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full justify-start">
                          <Trash2 className="mr-2 h-4 w-4" /> Postkarte löschen
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird Ihre Postkarte dauerhaft gelöscht.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeletePostcard} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <Dialog onOpenChange={(open) => !open && setNewlyCreatedLink('')}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Share2 className="mr-2 h-4 w-4" /> Teilen
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[525px]">
                        <ShareLinkDialogContent 
                          postcard={postcard} 
                          user={user}
                          sharedLinks={sharedLinks}
                          setSharedLinks={setSharedLinks}
                          newlyCreatedLink={newlyCreatedLink}
                          setNewlyCreatedLink={setNewlyCreatedLink}
                          handleCopyToClipboard={handleCopyToClipboard}
                          fetchPostcardDetails={fetchPostcardDetails}
                        />
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                {!isOwner && postcard.visibility === 'public' && (
                    <p className="text-sm text-muted-foreground">Dies ist eine öffentliche Postkarte. Sie können sie ansehen, aber nicht bearbeiten oder eigene Links dafür erstellen.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default PostcardDetailPage;