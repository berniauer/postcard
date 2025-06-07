import React, { useState, useEffect } from 'react';
    import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, Image as ImageIcon, Users, UserCircle, PlusCircle, Menu, X as CloseIcon, PanelLeftClose, PanelRightClose, Wand2 } from 'lucide-react';
    import { cn } from '@/lib/utils';

    const DashboardPage = () => {
      const navigate = useNavigate();
      const location = useLocation();
      const { toast } = useToast();
      const [isLoggingOut, setIsLoggingOut] = useState(false);
      const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
      const [isSidebarMinimizedDesktop, setIsSidebarMinimizedDesktop] = useState(false);

      const handleLogout = async () => {
        setIsLoggingOut(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
          toast({
            title: 'Abmeldung fehlgeschlagen',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Abmeldung erfolgreich',
            description: 'Sie wurden erfolgreich abgemeldet.',
          });
          navigate('/login');
        }
        setIsLoggingOut(false);
      };

      const navItems = [
        { name: 'Profil', path: '/dashboard/profile', icon: UserCircle },
        { name: 'Meine Postkarten', path: '/dashboard/my-postcards', icon: ImageIcon },
        { name: 'Öffentliche Galerie', path: '/dashboard/gallery', icon: Users },
        { name: 'Bildgenerator', path: '/dashboard/generator', icon: Wand2 },
      ];

      useEffect(() => {
        if (isSidebarOpenMobile) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'auto';
        }
        return () => {
          document.body.style.overflow = 'auto';
        };
      }, [isSidebarOpenMobile]);

      const sidebarVariants = {
        open: { x: 0, transition: { type: "tween", duration: 0.3 } },
        closed: { x: "-100%", transition: { type: "tween", duration: 0.3 } },
        minimized: { width: "5rem", transition: { type: "tween", duration: 0.3 } },
        expanded: { width: "16rem", transition: { type: "tween", duration: 0.3 } },
      };
      
      const mainContentVariants = {
        expanded: { marginLeft: "16rem", width: "calc(100% - 16rem)", transition: { type: "tween", duration: 0.3 } },
        minimized: { marginLeft: "5rem", width: "calc(100% - 5rem)", transition: { type: "tween", duration: 0.3 } },
        mobile: { marginLeft: "0", width: "100%", transition: { type: "tween", duration: 0.3 } }
      };

      return (
        <div className="min-h-screen flex flex-col gradient-bg">
          <header className="bg-background/80 backdrop-blur-md shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setIsSidebarOpenMobile(true)}>
                  <Menu className="h-6 w-6" />
                </Button>
                <Link to="/dashboard/my-postcards" className="flex items-center space-x-2 text-xl font-bold text-primary">
                  <LayoutDashboard />
                  <span className={cn(isSidebarMinimizedDesktop && "md:hidden")}>Postkarten Dashboard</span>
                </Link>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button 
                  onClick={() => navigate('/dashboard/editor')} 
                  variant="default" 
                  size="sm"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white"
                >
                  <PlusCircle className="mr-0 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Neue Postkarte</span>
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" disabled={isLoggingOut}>
                  {isLoggingOut ? (
                     <svg className="animate-spin h-4 w-4 mr-0 sm:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  ) : <LogOut className="mr-0 sm:mr-2 h-4 w-4" />}
                  <span className="hidden sm:inline">Abmelden</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="flex flex-1 container mx-auto px-0 md:px-4 py-0 md:py-6 md:space-x-6 overflow-hidden">
            {/* Mobile Sidebar */}
            <AnimatePresence>
              {isSidebarOpenMobile && (
                <>
                  <motion.div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSidebarOpenMobile(false)}
                  />
                  <motion.aside
                    className="fixed top-0 left-0 h-full w-64 bg-card shadow-xl z-50 p-4 space-y-4 md:hidden"
                    variants={sidebarVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <div className="flex justify-between items-center mb-4">
                        <Link to="/dashboard/my-postcards" className="flex items-center space-x-2 text-lg font-bold text-primary">
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpenMobile(false)}>
                            <CloseIcon className="h-6 w-6" />
                        </Button>
                    </div>
                    <nav className="flex flex-col space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsSidebarOpenMobile(false)}
                          className={cn(
                            'flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                            (location.pathname === item.path || (item.path === '/dashboard/my-postcards' && location.pathname === '/dashboard'))
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </nav>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside 
              className="hidden md:flex flex-col bg-card rounded-lg shadow-xl p-4 space-y-4 overflow-hidden"
              variants={sidebarVariants}
              animate={isSidebarMinimizedDesktop ? "minimized" : "expanded"}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarMinimizedDesktop(!isSidebarMinimizedDesktop)} 
                className="self-end mb-2"
              >
                {isSidebarMinimizedDesktop ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </Button>
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    title={item.name}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors overflow-hidden',
                      (location.pathname === item.path || (item.path === '/dashboard/my-postcards' && location.pathname === '/dashboard'))
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className={cn(isSidebarMinimizedDesktop && "opacity-0 scale-0 delay-100")}>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </motion.aside>

            <motion.main 
              className="flex-1 bg-card p-3 md:p-6 rounded-lg shadow-xl overflow-y-auto"
              variants={mainContentVariants}
              animate={isSidebarOpenMobile ? "mobile" : (isSidebarMinimizedDesktop ? "minimized" : "expanded")}
            >
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </motion.main>
          </div>
           <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border/50 bg-background/80">
            © {new Date().getFullYear()} Ihre Postkarten-App. Alle Rechte vorbehalten.
          </footer>
        </div>
      );
    };

    export default DashboardPage;