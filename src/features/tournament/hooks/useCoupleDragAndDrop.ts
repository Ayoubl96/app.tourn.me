import { useState } from 'react';
import { Couple } from '../types';
import { TournamentGroup, GroupCouple } from '@/api/tournaments/types';
import {
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';

/**
 * Custom hook for handling drag and drop functionality for couple assignment to groups
 */
export function useCoupleDragAndDrop(
  couples: Couple[],
  groups: TournamentGroup[],
  onAssignCouple: (groupId: number, coupleId: number) => Promise<void>,
  onRemoveCouple: (groupId: number, coupleId: number) => Promise<void>
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCouple, setActiveCouple] = useState<Couple | null>(null);

  // Set up sensors for drag and drop with longer press delay for mobile
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5 // 5px movement before drag starts
    }
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100, // 100ms wait before drag starts
      tolerance: 8 // 8px movement allowed during delay
    }
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;

    setActiveId(id);

    // Check if this is a couple being dragged
    if (id.startsWith('couple-')) {
      // Find the couple being dragged
      const coupleIdMatch = id.match(/^couple-(\d+)$/);
      if (!coupleIdMatch || !coupleIdMatch[1]) {
        return;
      }

      const coupleId = parseInt(coupleIdMatch[1], 10);
      if (isNaN(coupleId)) {
        return;
      }

      const couple = couples.find((c) => c.id === coupleId);

      if (couple) {
        setActiveCouple(couple);
      }
    }
    // Handle group couples being dragged (already assigned)
    else if (id.startsWith('group-couple-')) {
      // Format is group-couple-{groupId}-{coupleId}
      const parts = id.split('-');
      if (parts.length < 4) {
        return;
      }

      const coupleId = parseInt(parts[3], 10);
      if (isNaN(coupleId)) {
        return;
      }

      // Find the couple
      const couple = couples.find((c) => c.id === coupleId);

      if (couple) {
        setActiveCouple(couple);
      }
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // If we don't have an active or over element, return
    if (!active || !over) {
      setActiveId(null);
      setActiveCouple(null);
      return;
    }

    const activeId = active.id as string;
    let coupleId: number | null = null;
    let sourceGroupId: number | null = null;

    // Parse source info from drag item
    if (activeId.startsWith('couple-')) {
      // From unassigned couples
      coupleId = Number(activeId.replace('couple-', ''));
    } else if (activeId.startsWith('group-couple-')) {
      // From a group
      const parts = activeId.split('-');
      if (parts.length >= 4) {
        sourceGroupId = parseInt(parts[2], 10);
        coupleId = parseInt(parts[3], 10);
      } else {
        setActiveId(null);
        setActiveCouple(null);
        return;
      }
    }

    // Validate we have a valid couple ID
    if (!coupleId || isNaN(coupleId)) {
      setActiveId(null);
      setActiveCouple(null);
      return;
    }

    // Handle drop destination
    const overId = over.id as string;

    // If couple is dropped on a group
    if (overId.startsWith('group-') && coupleId) {
      // Extract group ID using a more robust approach
      // The format is 'group-{groupId}'
      const match = overId.match(/^group-(\d+)$/);

      if (!match || !match[1]) {
        setActiveId(null);
        setActiveCouple(null);
        return;
      }

      const targetGroupId = parseInt(match[1], 10);

      // Validate target group ID
      if (isNaN(targetGroupId)) {
        setActiveId(null);
        setActiveCouple(null);
        return;
      }

      // If from another group, remove first
      if (sourceGroupId && !isNaN(sourceGroupId)) {
        await onRemoveCouple(sourceGroupId, coupleId);
      }

      // Assign to new group
      await onAssignCouple(targetGroupId, coupleId);
    }

    // If couple is dropped on unassigned area
    if (
      overId === 'unassigned-dropzone' &&
      coupleId &&
      sourceGroupId &&
      !isNaN(sourceGroupId)
    ) {
      // Remove from group
      await onRemoveCouple(sourceGroupId, coupleId);
    }

    // Reset active id and couple
    setActiveId(null);
    setActiveCouple(null);
  };

  return {
    sensors,
    activeId,
    activeCouple,
    handleDragStart,
    handleDragEnd
  };
}
