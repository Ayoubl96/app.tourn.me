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
    <div className='relative'>
      {/* toolbar plugins */}
      <div className='relative'>
        <RichTextPlugin
          contentEditable={
            <div className=''>
              <div className='' ref={onRef}>
                <ContentEditable placeholder={'Start typing ...'} />
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
