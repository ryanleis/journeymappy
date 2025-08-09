"use client";

import React, { useState } from 'react';
import { useColors } from '../context/ColorContext';

type StartOverProps = {
  onStartOver: () => void;
};

export default function StartOver({ onStartOver }: StartOverProps) {
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will permanently delete all timelines, activities, and settings. This action cannot be undone.')) {
      onStartOver();
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed top-4 left-36 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-2xl p-3 shadow-sm hover:shadow-md transition"
        style={{ 
          backgroundColor: colors.activityBoxBackground,
          color: colors.activityBoxText,
          border: `1px solid ${colors.activityBoxText}`
        }}
        title="Start Over"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-16 left-0 rounded-2xl shadow-2xl p-6 w-80 animate-slideDown"
          style={{ backgroundColor: colors.modalBackground, border: `1px solid ${colors.activityBoxText}` }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>Start Over</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: colors.activityBoxBackground }}>
              <h4 className="font-medium mb-2" style={{ color: colors.activityBoxText }}>⚠️ Warning</h4>
              <p className="text-sm" style={{ color: colors.activityBoxText }}>
                Starting over will permanently delete:
              </p>
              <ul className="text-sm mt-2 space-y-1" style={{ color: colors.activityBoxText }}>
                <li>• All timelines</li>
                <li>• All activities</li>
                <li>• All custom themes</li>
                <li>• All color settings</li>
                <li>• All imported data</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStartOver}
                className="flex-1 p-2 rounded-2xl transition-colors text-sm shadow-sm"
                style={{ 
                  backgroundColor: '#ef4444',
                  color: 'white'
                }}
              >
                Start Over
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-2xl transition-colors text-sm"
                style={{ 
                  backgroundColor: colors.activityBoxBackground,
                  color: colors.activityBoxText,
                  border: `1px solid ${colors.activityBoxText}`
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes slideDown {
              from { transform: translateY(-10px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-slideDown {
              animation: slideDown 0.2s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}