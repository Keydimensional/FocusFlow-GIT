import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Minus, List, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ListsWidget: React.FC = () => {
  const { lists, addList, deleteList, addListItem, toggleListItem, deleteListItem } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    
    addList(newListTitle.trim());
    setNewListTitle('');
    setShowNewListForm(false);
  };

  const handleAddItem = (listId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = newItemTexts[listId]?.trim();
    if (!text) return;
    
    addListItem(listId, text);
    setNewItemTexts(prev => ({ ...prev, [listId]: '' }));
  };

  const updateNewItemText = (listId: string, text: string) => {
    setNewItemTexts(prev => ({ ...prev, [listId]: text }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <List className="w-5 h-5 text-purple-500" />
          Lists
        </h2>
        <div className="flex items-center gap-2">
          {!showNewListForm && (
            <button
              onClick={() => setShowNewListForm(true)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* New List Form */}
            {showNewListForm && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleCreateList}
                className="bg-purple-50 p-4 rounded-lg"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="List name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewListForm(false);
                      setNewListTitle('');
                    }}
                    className="px-3 py-2 text-gray-600 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Lists */}
            <div className="space-y-4">
              {lists.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-gray-500 mb-2">No lists yet</p>
                  <p className="text-sm text-gray-400">Create your first list to get organised!</p>
                </div>
              ) : (
                lists.filter(list => list && typeof list === 'object').map((list) => (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    {/* List Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-800">{list.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {(list.items || []).filter(item => item.completed).length}/{(list.items || []).length}
                        </span>
                        <button
                          onClick={() => deleteList(list.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* List Items */}
                    <div className="space-y-2 mb-3">
                      {(list.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 group"
                        >
                          <button
                            onClick={() => toggleListItem(list.id, item.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              item.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {item.completed && <Check className="w-3 h-3" />}
                          </button>
                          <span
                            className={`flex-1 text-sm ${
                              item.completed
                                ? 'text-gray-500 line-through'
                                : 'text-gray-700'
                            }`}
                          >
                            {item.text}
                          </span>
                          <button
                            onClick={() => deleteListItem(list.id, item.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Item Form */}
                    <form
                      onSubmit={(e) => handleAddItem(list.id, e)}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={newItemTexts[list.id] || ''}
                        onChange={(e) => updateNewItemText(list.id, e.target.value)}
                        placeholder="Add item..."
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </form>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};