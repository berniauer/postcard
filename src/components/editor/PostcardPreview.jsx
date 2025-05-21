import React from 'react';
    import { motion } from 'framer-motion';
    import { Maximize2 } from 'lucide-react';

    const PostcardPreview = ({ pageData, dimensions, selectedElementId, onSelectElement, onUpdateElement, previewMode = false }) => {
      if (!pageData || !dimensions) {
        return <div className="flex items-center justify-center h-full text-muted-foreground">Vorschau lädt...</div>;
      }

      const { elements, backgroundColor } = pageData;
      const { width: postcardWidth, height: postcardHeight } = dimensions;

      let scale;
      if (previewMode === 'sharePage') {
        // For share page, try to make it larger, fit within a certain width, but also consider height
        const containerWidth = Math.min(window.innerWidth * 0.9, 700); // Example: 90% of viewport or max 700px
        scale = containerWidth / postcardWidth;
        // If scaled height is too much for viewport, adjust scale based on height
        if (postcardHeight * scale > window.innerHeight * 0.7) {
          scale = (window.innerHeight * 0.7) / postcardHeight;
        }
        scale = Math.min(scale, 1.5); // Don't scale up too extremely

      } else if (previewMode === 'detailPage') {
        const containerWidth = Math.min(window.innerWidth * 0.8, 600);
        scale = containerWidth / postcardWidth;
        if (postcardHeight * scale > window.innerHeight * 0.6) {
             scale = (window.innerHeight * 0.6) / postcardHeight;
        }
        scale = Math.min(scale, 1.2);
      }
      else { // Editor mode
        const previewContainerMaxWidth = 450; 
        const previewContainerMaxHeight = 350;
        scale = Math.min(
          previewContainerMaxWidth / postcardWidth,
          previewContainerMaxHeight / postcardHeight,
          1 
        );
      }


      const scaledWidth = postcardWidth * scale;
      const scaledHeight = postcardHeight * scale;

      const handleElementClick = (e, elementId) => {
        if (previewMode) return; // No selection in preview-only modes
        e.stopPropagation(); 
        onSelectElement(elementId);
      };
      
      const handleCanvasClick = () => {
        if (previewMode) return;
        onSelectElement(null); 
      };

      const handleDragEnd = (event, info, elementId) => {
        if (previewMode) return;
        const newX = Math.round(info.point.x / scale); 
        const newY = Math.round(info.point.y / scale);
        onUpdateElement(elementId, { x: newX, y: newY });
      };

      return (
        <div 
          className={`postcard-canvas relative shadow-lg border border-primary/30 overflow-hidden ${previewMode ? '' : 'cursor-grab'}`}
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            backgroundColor: backgroundColor || '#FFFFFF',
          }}
          onClick={!previewMode ? handleCanvasClick : undefined}
        >
          {(elements || []).map((element) => {
            const isSelected = !previewMode && element.id === selectedElementId;
            const commonStyle = {
              position: 'absolute',
              left: `${element.x * scale}px`,
              top: `${element.y * scale}px`,
              width: `${element.width * scale}px`,
              height: `${element.height * scale}px`,
              transform: `rotate(${element.rotation || 0}deg)`,
              zIndex: element.style?.zIndex || 1,
              outline: isSelected ? '2px dashed #007bff' : 'none',
              outlineOffset: '2px',
              cursor: previewMode ? 'default' : 'pointer',
            };

            if (element.type === 'text') {
              return (
                <motion.div
                  key={element.id}
                  style={{
                    ...commonStyle,
                    color: element.style?.color || '#000000',
                    fontSize: `${parseFloat(element.style?.fontSize || '16px') * scale}px`,
                    fontFamily: element.style?.fontFamily || 'Arial, sans-serif',
                    fontWeight: element.style?.fontWeight || 'normal',
                    fontStyle: element.style?.fontStyle || 'normal',
                    textAlign: element.style?.textAlign || 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: element.style?.textAlign || 'left',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                  onClick={(e) => handleElementClick(e, element.id)}
                  drag={!previewMode}
                  dragMomentum={false}
                  onDragEnd={(event, info) => handleDragEnd(event, info, element.id)}
                  className={isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  whileDrag={!previewMode ? { scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.2)" } : {}}
                >
                  {element.content}
                </motion.div>
              );
            } else if (element.type === 'image') {
              return (
                <motion.div
                  key={element.id}
                  style={{
                    ...commonStyle,
                    opacity: element.style?.opacity || 1,
                  }}
                  onClick={(e) => handleElementClick(e, element.id)}
                  drag={!previewMode}
                  dragMomentum={false}
                  onDragEnd={(event, info) => handleDragEnd(event, info, element.id)}
                  className={isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                   whileDrag={!previewMode ? { scale: 1.02, boxShadow: "0px 5px 15px rgba(0,0,0,0.2)" } : {}}
                >
                  <img 
                    src={element.src}
                    alt={`Postcard image ${element.id}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/150?text=Bild+nicht+gefunden"; }}
                  />
                </motion.div>
              );
            }
            return null;
          })}
        </div>
      );
    };

    export default PostcardPreview;