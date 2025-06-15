import React from 'react';
import { Brain, Heart, Target, Sparkles } from 'lucide-react';

export const SEOContent: React.FC = () => {
  return (
    <section className="bg-white rounded-xl shadow-sm p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-4 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10" />
            BrainBounce – Your Neurodiverse-Friendly Focus Space
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            A supportive productivity tool designed specifically for neurodiverse minds. 
            Build focus habits, track your mood, and celebrate small wins with gentle accountability that actually works.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-purple-50 rounded-lg p-6 text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Focus Without Overwhelm</h2>
            <p className="text-gray-600 text-sm">
              Set daily intentions, use customisable timers, and dump racing thoughts into a safe space designed for neurodiverse brains.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <Heart className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Gentle Accountability</h2>
            <p className="text-gray-600 text-sm">
              Track habits through fun mini-games, monitor your mood patterns, and build streaks that celebrate progress over perfection.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 text-center">
            <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Built for Neurodiversity</h2>
            <p className="text-gray-600 text-sm">
              No guilt, no shame, just tools that work with your brain's natural patterns. Flexible reminders and dopamine-friendly design.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Why BrainBounce Works for Neurodiverse Minds</h2>
          <p className="text-gray-700 mb-4 max-w-3xl mx-auto">
            Traditional productivity apps assume neurotypical brains, but neurodiverse minds need different approaches. 
            BrainBounce embraces the beautiful chaos of neurodivergent thinking with tools that bend to your needs, not the other way around.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white px-4 py-2 rounded-full text-purple-700 font-medium">Executive Function Support</span>
            <span className="bg-white px-4 py-2 rounded-full text-blue-700 font-medium">Dopamine-Friendly Design</span>
            <span className="bg-white px-4 py-2 rounded-full text-green-700 font-medium">Rejection Sensitive Dysphoria Safe</span>
            <span className="bg-white px-4 py-2 rounded-full text-orange-700 font-medium">Hyperfocus & Rest Balance</span>
          </div>
        </div>
      </div>
    </section>
  );
};