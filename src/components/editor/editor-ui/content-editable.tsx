import { JSX } from 'react';
import { ContentEditable as LexicalContentEditable } from '@lexical/react/LexicalContentEditable';

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
  minHeight?: string;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
  minHeight = '220px'
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        `ContentEditable__root block overflow-auto px-8 py-4 focus:outline-none`
      }
      style={{ minHeight: minHeight }}
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis px-8 py-[18px] text-muted-foreground`
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
