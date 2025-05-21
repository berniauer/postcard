import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Eye, EyeOff, LogIn, Chrome as ChromeIcon } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';
    import { useNavigate } from 'react-router-dom';

    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const [isGoogleLoading, setIsGoogleLoading] = useState(false);
      const { toast } = useToast();
      const navigate = useNavigate();

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          toast({
            title: 'Anmeldung fehlgeschlagen',
            description: error.message || 'Ungültige E-Mail-Adresse oder Passwort.',
            variant: 'destructive',
          });
        } else if (data.user) {
          toast({
            title: 'Anmeldung erfolgreich',
            description: 'Willkommen zurück!',
            variant: 'default',
          });
          navigate('/dashboard'); 
        }
        setIsLoading(false);
      };

      const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (error) {
          toast({
            title: 'Google Anmeldung fehlgeschlagen',
            description: error.message || 'Ein Fehler ist aufgetreten.',
            variant: 'destructive',
          });
          setIsGoogleLoading(false);
        }
      };

      const toggleShowPassword = () => setShowPassword(!showPassword);

      return (
        <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-md glassmorphism-card shadow-2xl">
              <CardHeader className="text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                  className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4"
                >
                  <LogIn size={32} />
                </motion.div>
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-slate-700 to-primary">
                  Willkommen zurück!
                </CardTitle>
                <CardDescription className="text-muted-foreground pt-2">
                  Melden Sie sich an, um Ihre digitalen Postkarten zu gestalten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail Adresse</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@beispiel.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/80 dark:bg-slate-800/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Passwort</Label>
                      <a href="#" className="text-sm text-primary hover:underline" onClick={(e) => { e.preventDefault(); alert("Passwort vergessen Funktion noch nicht implementiert.");}}>
                        Passwort vergessen?
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/80 dark:bg-slate-800/80"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={toggleShowPassword}
                        aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button type="submit" className="w-full font-semibold" disabled={isLoading || isGoogleLoading}>
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Anmelden...
                        </div>
                      ) : (
                        'Anmelden'
                      )}
                    </Button>
                  </motion.div>
                </form>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Oder weiter mit
                      </span>
                    </div>
                  </div>

                  <motion.div
                    className="mt-6"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="w-full font-semibold" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
                      {isGoogleLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verbinde mit Google...
                        </div>
                      ) : (
                        <>
                          <ChromeIcon className="mr-2 h-4 w-4" />
                          Mit Google anmelden
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Noch kein Konto?{' '}
                  <a href="#" className="text-primary hover:underline font-semibold" onClick={(e) => { e.preventDefault(); alert("Registrierungsfunktion noch nicht implementiert.");}}>
                    Registrieren
                  </a>
                </p>
                <p className="text-xs text-muted-foreground/70 pt-4">
                  © {new Date().getFullYear()} Ihre Postkarten-App. Alle Rechte vorbehalten.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default LoginPage;