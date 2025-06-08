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
  "Rest is not a reward. It's a right.",
  "You don't have to be consistent to be committed.",
  "Clarity comes after the pause.",
  "You're allowed to unlearn urgency.",
  "Softness is still strength.",
  "Trying differently still counts.",
  "You're not late. You're on your own clock.",
  "Progress looks different every day.",
  "Some days surviving is the success.",
  "Your needs are not negotiable.",
  "Focus is not a moral issue.",
  "You are not a machine. You are a person.",
  "You're allowed to need things more than once.",
  "Permission beats pressure.",
  "Regulation is not the same as repression.",
  "Getting there slowly is still getting there.",
  "You don't owe the world constant output.",
  "Your pace is not a problem.",
  "Let your brain be your brain.",
  "You are not failing. You are adapting.",
  "You don't have to explain your process.",
  "Silence can be safety.",
  "You can honour your limits without guilt.",
  "Let go of 'should'. Stay with what is.",
  "You're allowed to start over, even mid-sentence.",
  "One wobble doesn't undo the work.",
  "You don't have to be okay to be worthy.",
  "You're allowed to care less sometimes.",
  "Comfort is a valid goal.",
  "You don't have to optimise everything.",
  "You can be whole and still healing.",
  "Your way of working is real work.",
  "Needing support doesn't make you less capable.",
  "You're not the sum of your bad days.",
  "Slow does not mean stuck.",
  "It's okay to protect your energy.",
  "Quiet effort is still effort.",
  "Your story is unfolding in its own time.",
  "Attention drifts. You can bring it back.",
  "Today can be gentler.",
  "You can come back to it tomorrow.",
  "You're allowed to write your own rules.",
  "Some days need soft focus.",
  "The checklist can wait. You can't.",
  "You don't need to earn breaks.",
  "Doing it messily is still doing it.",
  "You can set boundaries even with yourself.",
  "It's not always a productivity issue. Sometimes it's a capacity issue.",
  "Step back. Breathe. Begin again.",
  "Not knowing is a starting point, not a flaw.",
  "Even if it's small, it matters.",
  "You're allowed to change how you cope.",
  "Mess is part of making.",
  "It's okay to go slow on purpose.",
  "Pausing is not quitting.",
  "You are not the exception to kindness.",
  "Notice what helps. Keep that close.",
  "You are not lost. You're in process.",
  "Some things take longer. That's okay.",
  "You're allowed to stop explaining yourself.",
  "Trying counts.",
  "Small wins are still wins.",
  "You can hold both effort and ease.",
  "The way you do it is a valid way.",
  "You don't have to be ready. You just have to begin.",
  "Success can be soft and quiet.",
  "Your attention is a resource. Use it kindly.",
  "You don't owe anyone your mask.",
  "Low energy days deserve compassion.",
  "Your path is yours. Walk it how you need.",
  "You're not broken. You're building.",
  "One kind step at a time.",
  "Not everything needs to be fixed. Some things just need space.",
  "It's okay to want peace more than progress.",
  "You're allowed to forget and remember again.",
  "You're allowed to log off the world for a bit.",
  "Some days it's enough to just show up.",
  "Your effort is enough, even when it's invisible.",
  "You're allowed to be proud of your persistence.",
  "There is no right way to be yourself.",
  "Celebrate the days you keep going.",
  "You are still you, even when tired.",
  "Softness is not weakness. It's wisdom.",
  "Keep what works. Release what doesn't.",
  "Ease is not the enemy of growth.",
  "However you got through today, it was enough.",
];

const QUOTE_DURATION = 15000; // 15 seconds per quote

// Function to get a random quote that's different from the current one
const getRandomQuote = (currentIndex: number, totalQuotes: number): number => {
  if (totalQuotes <= 1) return 0;
  
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * totalQuotes);
  } while (newIndex === currentIndex);
  
  return newIndex;
};

export const MoodBoard: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(() => Math.floor(Math.random() * quotes.length));
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
      setCurrentQuote(prev => getRandomQuote(prev, quotes.length));
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