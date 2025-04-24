import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center'>
      {icon && <div className='mb-2 text-muted-foreground'>{icon}</div>}
      <h3 className='mb-2 text-lg font-semibold'>{title}</h3>
      <p className='mb-4 text-sm text-muted-foreground'>{description}</p>
      {action}
    </div>
  );
}
