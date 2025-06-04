import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Minus, Plus } from 'lucide-react';

const quotes = [
  "Done is better than perfect.",
  "You don't have to finish everything. Starting still counts.",
  "Small steps are still progress. Even sitting up is a win some days.",
  "You can't build momentum until you move. Just tap the first domino.",
  "One page is a chapter someday. One minute is a start.",
  "If your brain doesn't work like theirs, your strategy shouldn't either.",
  "Focus isn't about intensity. It's about returning to the task gently.",
  "Forget discipline. Try curiosity and kindness.",
  "You're not lazy. Your brain just queues priorities differently.",
  "Your brain isn't broken. It's just wired for a different rhythm.",
  "You are not a productivity machine. You are a person.",
  "Your worth is not measured in checkboxes.",
  "You don't owe anyone neurotypical performance in a neurodivergent life.",
  "Some days, surviving is succeeding.",
  "You are allowed to rest. You are allowed to start again.",
  "The system isn't failing you. It just wasn't made for you.",
  "If it works, it isn't silly. Sticky notes, songs, reminders. All valid.",
  "Make your environment the boss. Let reminders and routines do the heavy lifting.",
  "You don't need to get better at remembering. You need better places to put things you can forget.",
  "Go slower to go longer.",
  "Every burst of energy deserves rest on the other side.",
  "Burnout isn't a failure. It's a message. Listen to it.",
  "If you sprint through today, there might be no tomorrow left in you.",
  "You are not behind. You are surviving a system that was never built for you.",
  "Breathe. Then begin.",
  "Get up. Brush your teeth. That's enough for now.",
  "Try again, not harder.",
  "You've done hard things before. One more won't scare you.",
  "Start small. Smaller than that. There you go.",
  "Progress is a loop, not a line.",
  "You don't need to feel ready. You just need to begin.",
  "Your pace is valid. Even if it looks different.",
  "Thinking about it counts too.",
  "You don't need to be consistent to be successful.",
  "It's okay to take longer. You're still going.",
  "Start with what you can reach. That's enough.",
  "You can pause without quitting.",
  "Resting is preparing.",
  "Forget motivation. Build gentle momentum.",
  "Your brain deserves systems that make sense to it.",
  "Celebrate showing up. That's the hard part.",
  "What you get done today doesn't define you.",
  "You're not falling behind. You're just moving differently.",
  "You're not bad at this. You're just using the wrong tools.",
  "Tomorrow counts too.",
  "You don't need to do it perfectly. You just need to do it your way.",
  "Having needs doesn't make you a burden.",
  "Try it messy. Try it clumsy. Try it anyway.",
  "Just because it's hard doesn't mean you're doing it wrong.",
  "Structure is not punishment. It's scaffolding.",
  "Forget the plan. Try the next right step.",
  "Keep the goal. Change the method.",
  "You don't have to trust the process. You can just test it.",
  "Your brain is not late. It's just nonlinear.",
  "Distractions are not a moral failing.",
  "Working differently is not working less.",
  "Needing help isn't weakness. It's design.",
  "You don't have to push. You can glide for a bit.",
  "You're not lazy. You're overloaded.",
  "The plan is allowed to change.",
  "Nothing needs to be fixed before you can begin.",
  "Permission to take a breath. Granted.",
  "You are not your to-do list.",
  "You don't have to earn rest.",
  "Plans can be flexible. So can you.",
  "It's okay if it takes you longer. You're still learning.",
  "Mistakes are just data.",
  "The win is in the trying.",
  "If it helps, it's valid.",
  "You're allowed to be proud of tiny victories.",
  "Let the hard thing be hard. Do it anyway.",
  "You're allowed to try again with a gentler grip.",
  "Urgency is not always importance.",
  "Even a false start is a start.",
  "You don't need to fix everything today.",
  "Overwhelm is a signal, not a verdict.",
  "You're more than your productivity graph.",
  "The work will wait. You come first.",
  "You're doing better than you think.",
  "You can move forward without rushing.",
  "You are allowed to make this easier for yourself.",
];

const QUOTE_DURATION = 15000; // 15 seconds per quote

export const MoodBoard: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (QUOTE_DURATION / 100));
      });
    }, 100);

    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % quotes.length);
      setProgress(0);
    }, QUOTE_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Quote className="w-5 h-5 text-purple-500" />
          Gentle Reminders
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center py-6 px-4 bg-purple-50 rounded-lg"
          >
            <p className="text-lg text-purple-900 font-medium leading-relaxed mb-4">
              {quotes[currentQuote]}
            </p>
            <div className="w-full h-1 bg-purple-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};