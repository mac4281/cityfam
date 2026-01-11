'use client';

import Logo from './Logo';

interface WelcomeViewProps {
  onSelectBranch: () => void;
}

export default function WelcomeView({ onSelectBranch }: WelcomeViewProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-4">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <Logo size="splash" />

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome to Cityfam
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Select Your Branch
          </p>
        </div>

        <button
          onClick={onSelectBranch}
          className="w-full max-w-xs px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          Choose Community
        </button>
      </div>
    </div>
  );
}

