
import React, { useState } from 'react';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto px-4">
      {/* FIX: Replaced theme variables with hardcoded tailwind classes to resolve missing 'Theme' type error. */}
      <div className={`relative rounded-xl shadow-lg transition-colors duration-500 bg-cyan-100/50 border border-cyan-400`}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A majestic lion wearing a crown, king of the jungle..."
          className={`w-full h-24 p-4 pr-32 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-all duration-500 text-cyan-800`}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 font-bold rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-cyan-500 text-white focus:ring-cyan-500 active:scale-95 disabled:scale-100`}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </form>
  );
};

export default PromptForm;