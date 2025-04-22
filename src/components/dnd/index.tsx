import React, { ReactNode } from 'react';
import { useSortable, SortableContext } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface DraggableItemProps {
  id: string;
  data?: any;
  children: ReactNode;
  className?: string;
  handleClassName?: string;
  dragHandleRender?: (isDragging: boolean) => ReactNode;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  data,
  children,
  className = '',
  handleClassName = '',
  dragHandleRender
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, data });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

interface DropZoneProps {
  id: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  children,
  className = '',
  activeClassName = 'bg-accent/40'
}) => {
  const { setNodeRef, isOver, active } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? activeClassName : ''}`}
    >
      {children}
    </div>
  );
};

interface SortableListProps<T> {
  items: T[];
  idPrefix?: string;
  getItemId: (item: T) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  emptyMessage?: ReactNode;
}

export function SortableList<T>({
  items,
  idPrefix = '',
  getItemId,
  renderItem,
  className = '',
  emptyMessage = <p>No items</p>
}: SortableListProps<T>) {
  const sortableIds = items.map((item) => `${idPrefix}${getItemId(item)}`);

  return (
    <div className={className}>
      {items.length === 0 ? (
        emptyMessage
      ) : (
        <SortableContext items={sortableIds}>
          {items.map((item, index) => renderItem(item, index))}
        </SortableContext>
      )}
    </div>
  );
}
