import React from 'react';

// Lexical rendering functions for full description
export function LexicalRenderer({ lexicalData }: { lexicalData: any }) {
  if (!lexicalData || !lexicalData.root || !lexicalData.root.children) {
    return null;
  }

  return <>{lexicalData.root.children.map(renderNode)}</>;
}

function renderNode(
  node: any,
  index?: number
): React.ReactNode | string | null {
  if (!node) return null;
  const key = index !== undefined ? index : Math.random();

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className='mb-2'>
          {node.children?.map((child: any, idx: number) =>
            renderNode(child, idx)
          )}
        </p>
      );
    case 'text':
      let text = node.text;
      if (node.format & 1) text = <strong key={key}>{text}</strong>; // Bold
      if (node.format & 2) text = <em key={key}>{text}</em>; // Italic
      if (node.format & 8) text = <u key={key}>{text}</u>; // Underline
      return <React.Fragment key={key}>{text}</React.Fragment>;
    case 'heading': {
      // Use dynamic heading elements (h1, h2, etc.)
      switch (node.tag) {
        case '1':
          return (
            <h1 key={key} className='mb-2 mt-4'>
              {node.children?.map((child: any, idx: number) =>
                renderNode(child, idx)
              )}
            </h1>
          );
        case '2':
          return (
            <h2 key={key} className='mb-2 mt-4'>
              {node.children?.map((child: any, idx: number) =>
                renderNode(child, idx)
              )}
            </h2>
          );
        case '3':
          return (
            <h3 key={key} className='mb-2 mt-4'>
              {node.children?.map((child: any, idx: number) =>
                renderNode(child, idx)
              )}
            </h3>
          );
        case '4':
          return (
            <h4 key={key} className='mb-2 mt-4'>
              {node.children?.map((child: any, idx: number) =>
                renderNode(child, idx)
              )}
            </h4>
          );
        case '5':
          return (
            <h5 key={key} className='mb-2 mt-4'>
              {node.children?.map((child: any, idx: number) =>
                renderNode(child, idx)
              )}
            </h5>
          );
        default:
          return (
            <h6 key={key} className='mb-2 mt-4'>
              {node.children?.map((child: any, idx: number) =>
                renderNode(child, idx)
              )}
            </h6>
          );
      }
    }
    default:
      return null;
  }
}
