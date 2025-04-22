import React, { JSX } from 'react';

// Main function to render lexical JSON data
export function renderLexicalDescription(lexicalData: any): JSX.Element | null {
  if (!lexicalData || !lexicalData.root || !lexicalData.root.children) {
    return null;
  }
  return <>{lexicalData.root.children.map(renderNode)}</>;
}

// Helper function to render individual lexical nodes
function renderNode(node: any): JSX.Element | string | null {
  if (!node) return null;

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={Math.random()} className='mb-2'>
          {node.children?.map(renderNode)}
        </p>
      );
    case 'text':
      let text = node.text;
      if (node.format & 1) text = <strong key={Math.random()}>{text}</strong>; // Bold
      if (node.format & 2) text = <em key={Math.random()}>{text}</em>; // Italic
      if (node.format & 8) text = <u key={Math.random()}>{text}</u>; // Underline
      return <React.Fragment key={Math.random()}>{text}</React.Fragment>;
    case 'heading':
      const HeadingTag = `h${node.tag}` as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag key={Math.random()} className='mb-2 mt-4'>
          {node.children?.map(renderNode)}
        </HeadingTag>
      );
    default:
      return null;
  }
}
