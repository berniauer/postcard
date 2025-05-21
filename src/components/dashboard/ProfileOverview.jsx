import React, { useEffect, useState } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { UserCircle, Mail, Edit3, Save, XCircle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';

    const ProfileOverview = () => {
      const [user, setUser] = useState(null);
      const [profile, setProfile] = useState(null);
      const [loading, setLoading] = useState(true);
      const [editing, setEditing] = useState(false);
      const [formData, setFormData] = useState({ username: '', full_name: '' });
      const [isSaving, setIsSaving] = useState(false);
      const { toast } = useToast();

      useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          const { data: { user: authUser } } = await supabase.auth.getUser();
          setUser(authUser);

          if (authUser) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url')
              .eq('id', authUser.id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') { // PGRST116: no rows found
              console.error('Error fetching profile:', profileError);
              toast({ title: "Fehler beim Laden des Profils", description: profileError.message, variant: "destructive" });
            } else {
              setProfile(profileData);
              setFormData({ 
                username: profileData?.username || '', 
                full_name: profileData?.full_name || '' 
              });
            }
          }
          setLoading(false);
        };
        fetchData();
      }, [toast]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleEditToggle = () => {
        if (editing && profile) { // Reset form if canceling edit
            setFormData({ username: profile.username || '', full_name: profile.full_name || '' });
        }
        setEditing(!editing);
      };

      const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);

        const updates = {
          id: user.id,
          username: formData.username,
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) {
          toast({ title: "Fehler beim Speichern", description: error.message, variant: "destructive" });
        } else {
          setProfile(prev => ({ ...prev, ...updates }));
          toast({ title: "Profil aktualisiert", description: "Ihre Profildaten wurden erfolgreich gespeichert." });
          setEditing(false);
        }
        setIsSaving(false);
      };
      
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

      if (!user) {
        return <p className="text-center text-muted-foreground">Benutzer nicht gefunden.</p>;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg border-border/50">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-primary flex items-center">
                  <UserCircle className="mr-3 h-8 w-8" /> Profilübersicht
                </CardTitle>
                <CardDescription>Verwalten Sie Ihre Profildaten.</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={handleEditToggle} className="text-primary hover:bg-primary/10">
                {editing ? <XCircle size={20} /> : <Edit3 size={20} />}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {editing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-muted-foreground">Benutzername</Label>
                    <Input 
                      id="username" 
                      name="username"
                      value={formData.username} 
                      onChange={handleInputChange} 
                      className="mt-1 bg-white/80 dark:bg-slate-800/80"
                      placeholder="Ihr einzigartiger Benutzername"
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name" className="text-muted-foreground">Vollständiger Name</Label>
                    <Input 
                      id="full_name" 
                      name="full_name"
                      value={formData.full_name} 
                      onChange={handleInputChange} 
                      className="mt-1 bg-white/80 dark:bg-slate-800/80"
                      placeholder="Ihr vollständiger Name"
                    />
                  </div>
                   <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="ghost" onClick={handleEditToggle} disabled={isSaving}>Abbrechen</Button>
                    <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white">
                      {isSaving ? (
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : <Save size={18} className="mr-2" />}
                      Speichern
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
                    <Mail className="h-5 w-5 text-primary" />
                    <p><span className="font-medium text-muted-foreground">E-Mail:</span> {user.email}</p>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <p><span className="font-medium text-muted-foreground">Benutzername:</span> {profile?.username || 'Nicht festgelegt'}</p>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
                    <UserCircle className="h-5 w-5 text-primary" /> {/* Icon anpassen falls gewünscht */}
                    <p><span className="font-medium text-muted-foreground">Vollständiger Name:</span> {profile?.full_name || 'Nicht festgelegt'}</p>
                  </div>
                  {profile?.avatar_url && (
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
                       <img-replace src={profile.avatar_url} alt="Avatar" className="h-10 w-10 rounded-full object-cover border-2 border-primary" />
                       <span>Avatar</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default ProfileOverview;