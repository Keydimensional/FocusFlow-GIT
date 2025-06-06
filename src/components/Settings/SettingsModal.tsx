import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { X, RotateCcw, User, Edit2, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Widget } from '../../types';
import { UsernameEditor } from './UsernameEditor';

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
  const { widgets, updateWidgetOrder, toggleWidget, resetWidgets, setShowTutorial } = useApp();
  const { user } = useAuth();
  const [showUsernameEditor, setShowUsernameEditor] = React.useState(false);
  
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

  const getDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handleShowTutorial = () => {
    console.log('🎓 Show tutorial button clicked');
    setShowTutorial(true);
    onClose(); // Close settings modal
  };

  return (
    <>
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
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
          >
            <div className="p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Account Section */}
              {user && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Account</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium">
                          {getInitials()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getDisplayName()}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowUsernameEditor(true)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tutorial Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Help</h3>
                
                <button
                  onClick={handleShowTutorial}
                  className="flex items-center gap-3 w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Show Tutorial</p>
                    <p className="text-sm text-gray-500">Learn how to use BrainBounce</p>
                  </div>
                </button>
              </div>

              {/* Dashboard Customization */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800">Dashboard</h3>
                  <button
                    onClick={resetWidgets}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                <p className="text-sm text-gray-600">
                  Drag and drop to reorder widgets
                </p>

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
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Username Editor */}
      {showUsernameEditor && (
        <UsernameEditor onClose={() => setShowUsernameEditor(false)} />
      )}
    </>
  );
};