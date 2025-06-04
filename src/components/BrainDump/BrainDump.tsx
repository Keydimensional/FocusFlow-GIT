import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Brain, Save, Trash2 } from 'lucide-react';

export const BrainDump: React.FC = () => {
  const { brainDump, addBrainDump, clearBrainDump } = useApp();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addBrainDump(text.trim());
    setText('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Brain Dump
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          rows={3}
          placeholder="Dump your thoughts here... Don't worry about organising them!"
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {brainDump.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 p-3 rounded-lg relative group"
          >
            <button
              onClick={() => {
                const newBrainDump = brainDump.filter(dump => dump.id !== item.id);
                clearBrainDump();
                newBrainDump.forEach(dump => addBrainDump(dump.text));
              }}
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
            </button>
            <p className="text-gray-700 pr-6">{item.text}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};