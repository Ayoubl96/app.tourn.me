import { useState, useCallback } from 'react';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@/components/editor/editor-ui/content-editable';

export function Plugins() {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  // Use useCallback to prevent recreating this function on each render
  const onRef = useCallback(
    (_floatingAnchorElem: HTMLDivElement | null) => {
      // Only update state if the element reference has changed
      if (
        _floatingAnchorElem !== null &&
        _floatingAnchorElem !== floatingAnchorElem
      ) {
        setFloatingAnchorElem(_floatingAnchorElem);
      }
    },
    [floatingAnchorElem]
  ); // Add dependency on floatingAnchorElem

  return (
    <div className='relative flex flex-1 flex-col'>
      {/* toolbar plugins */}
      <div className='relative flex flex-1 flex-col'>
        <RichTextPlugin
          contentEditable={
            <div className='h-full flex-1'>
              <div className='h-full' ref={onRef}>
                <ContentEditable
                  placeholder={'Start typing ...'}
                  minHeight='400px'
                />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* editor plugins */}
      </div>
      {/* actions plugins */}
    </div>
  );
}
