import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Type, Image as ImageIcon, RotateCcw, RotateCw } from 'lucide-react';

    const Toolbar = ({ onAddElement, onUndo, onRedo, canUndo, canRedo }) => {
      return (
        <div className="flex items-center space-x-2 p-2 bg-card border border-border/50 rounded-lg shadow">
          <Button variant="outline" size="sm" onClick={() => onAddElement('text')} title="Textelement hinzufügen">
            <Type className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Text</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddElement('image')} title="Bildelement hinzufügen">
            <ImageIcon className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Bild</span>
          </Button>
          <div className="flex-grow"></div> {/* Spacer */}
          <Button variant="outline" size="icon" onClick={onUndo} disabled={!canUndo} title="Rückgängig">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onRedo} disabled={!canRedo} title="Wiederherstellen">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      );
    };

    export default Toolbar;
