import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Widget } from '../../types';

interface SortableItemProps {
  widget: Widget;
  title: string;
  onToggle: () => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({ widget, title, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        isDragging ? 'bg-purple-50 shadow-lg' : 'bg-gray-50 hover:bg-gray-100'
      }`}
      {...attributes}
    >
      <div className="flex items-center gap-3">
        <button
          {...listeners}
          className="touch-none cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>
        <span className="font-medium text-gray-700">{title}</span>
      </div>
      <button
        onClick={onToggle}
        className={`p-2 rounded-lg transition-colors ${
          widget.visible
            ? 'text-purple-600 hover:bg-purple-100'
            : 'text-gray-400 hover:bg-gray-200'
        }`}
      >
        {widget.visible ? (
          <Eye className="w-5 h-5" />
        ) : (
          <EyeOff className="w-5 h-5" />
        )}
      </button>
    </motion.div>
  );
};