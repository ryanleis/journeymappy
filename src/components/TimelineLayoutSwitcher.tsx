"use client";

import React, { useState } from 'react';
import { useColors } from '../context/ColorContext';

export type TimelineLayout = 'inline' | 'outline';

type TimelineLayoutSwitcherProps = {
  currentLayout: TimelineLayout;
  onLayoutChange: (layout: TimelineLayout) => void;
};

export default function TimelineLayoutSwitcher({ currentLayout, onLayoutChange }: TimelineLayoutSwitcherProps) {
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);

  const layouts = [
    {
      id: 'inline' as TimelineLayout,
      name: 'Inline',
      description: 'Activities displayed along the timeline',
      icon: '━',
    },
    {
      id: 'outline' as TimelineLayout,
      name: 'Outline',
      description: 'Activities above and below timeline with connecting lines',
      icon: '╱',
    },
  ];

  return (
    <div className="fixed top-4 left-20 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-2xl p-3 shadow-sm hover:shadow-md transition"
        style={{ 
          backgroundColor: colors.activityBoxBackground,
          color: colors.activityBoxText,
          border: `1px solid ${colors.activityBoxText}`
        }}
        title="Timeline Layout"
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
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-16 left-0 rounded-2xl shadow-2xl p-6 w-80 animate-slideDown"
          style={{ backgroundColor: colors.modalBackground, border: `1px solid ${colors.activityBoxText}` }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>Timeline Layout</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => {
                  onLayoutChange(layout.id);
                  setIsOpen(false);
                }}
                className="w-full p-4 rounded-2xl text-left transition-all"
                style={{ 
                  backgroundColor: currentLayout === layout.id ? colors.activityBoxText : colors.activityBoxBackground,
                  color: currentLayout === layout.id ? colors.activityBoxBackground : colors.activityBoxText,
                  border: `1px solid ${colors.activityBoxText}`,
                  transform: currentLayout === layout.id ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{layout.icon}</span>
                  <div>
                    <div className="font-medium">{layout.name}</div>
                    <div className="text-sm opacity-75">{layout.description}</div>
                  </div>
                </div>
              </button>
            ))}
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