import React from 'react';

export default function UpgradePrompt({ featureKey, currentTier = 'starter' }) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">Plan upgrade needed</p>
          <p className="text-sm mt-1">
            This {featureKey} feature is not available on the {currentTier} plan.
          </p>
        </div>
        <button className="rounded-lg bg-[#0B0B45] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900">
          Upgrade plan
        </button>
      </div>
    </div>
  );
}
