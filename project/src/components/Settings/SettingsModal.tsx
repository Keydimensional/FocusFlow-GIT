import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { X, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Widget } from '../../types';

const widgetNames: Record<string, string> = {
  dailyFocus: 'Daily Focus',
  focusTimer: 'Focus Timer',
  streakCounter: 'Streak Counter',
  moodCheck: 'Mood Check',
  brainDump: 'Brain Dump',
  moodHistory: 'Mood History',
  goalList: 'Goals',
  reminderList: 'Reminders',
  habitTracker: 'Habits',
  moodBoard: 'Gentle Reminders'
};

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { widgets, updateWidgetOrder, toggleWidget, resetWidgets } = useApp();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      
      const newWidgets = arrayMove(widgets, oldIndex, newIndex).map((widget, index) => ({
        ...widget,
        order: index,
      }));
      
      updateWidgetOrder(newWidgets);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full"
        >
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Customise Dashboard</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Drag and drop to reorder
              </p>
              <button
                onClick={resetWidgets}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>

            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={widgets}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {widgets.map((widget) => (
                    <SortableItem
                      key={widget.id}
                      widget={widget}
                      title={widgetNames[widget.type]}
                      onToggle={() => toggleWidget(widget.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};