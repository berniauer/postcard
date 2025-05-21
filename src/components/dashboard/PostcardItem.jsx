import React from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Image as ImageIcon, Edit, Trash2, Eye, User, CalendarDays, ShieldAlert, Globe } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { cn } from '@/lib/utils';

    const PostcardItem = ({ postcard, isOwner, onDelete }) => {
      const navigate = useNavigate();
      const displayDate = new Date(postcard.created_at).toLocaleDateString('de-DE', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      const getVisibilityInfo = () => {
        switch (postcard.visibility) {
          case 'public':
            return { icon: <Globe className="h-4 w-4 text-green-500" />, text: 'Öffentlich' };
          case 'unlisted':
            return { icon: <ShieldAlert className="h-4 w-4 text-yellow-500" />, text: 'Nicht gelistet' };
          case 'private':
          default:
            return { icon: <User className="h-4 w-4 text-red-500" />, text: 'Privat' };
        }
      };
      const visibilityInfo = getVisibilityInfo();

      return (
        <motion.div
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          className="h-full"
        >
          <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/50">
            <CardHeader className="pb-2">
              <div className="aspect-[3/2] bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
                {postcard.rendered_image_url ? (
                  <img-replace src={postcard.rendered_image_url} alt={postcard.title || 'Postkarte'} className="object-cover w-full h-full" />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center">
                    <ImageIcon size={48} />
                    <span className="text-xs mt-1">Kein Vorschaubild</span>
                  </div>
                )}
              </div>
              <CardTitle className="text-xl font-semibold truncate hover:text-primary transition-colors">
                <Link to={`/dashboard/postcards/${postcard.id}`} title={postcard.title}>
                  {postcard.title || 'Unbenannte Postkarte'}
                </Link>
              </CardTitle>
              {postcard.is_draft && <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full inline-block">Entwurf</span>}
            </CardHeader>
            <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CalendarDays size={16} />
                <span>Erstellt: {displayDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                {visibilityInfo.icon}
                <span>{visibilityInfo.text}</span>
              </div>
              {!isOwner && postcard.profiles && (
                <div className="flex items-center space-x-2 pt-1">
                  <User size={16} />
                  <span>Von: {postcard.profiles.username || postcard.profiles.full_name || 'Unbekannt'}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/30">
              <div className="flex w-full justify-between items-center">
                <Button variant="outline" size="sm" asChild className="text-primary hover:bg-primary/10">
                  <Link to={`/dashboard/postcards/${postcard.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> Ansehen
                  </Link>
                </Button>
                {isOwner && (
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/editor/${postcard.id}`)} className="text-blue-600 hover:bg-blue-100">
                      <Edit className="h-5 w-5" />
                      <span className="sr-only">Bearbeiten</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(postcard.id)} className="text-red-600 hover:bg-red-100">
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Löschen</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default PostcardItem;