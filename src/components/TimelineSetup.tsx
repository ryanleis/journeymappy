"use client";

import React, { useState } from 'react';
import { useColors } from '../context/ColorContext';
import type { Activity } from '../app/page';

export type TimelineConfig = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string; // last modified (metadata or activities)
  activities: Activity[]; // activities snapshot per timeline
};

// Deterministic UTC formatting to avoid SSR/CSR mismatch
function formatDateUTC(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
  } catch { return iso; }
}
function formatDateTimeUTC(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  } catch { return iso; }
}

type TimelineSetupProps = {
  onSave: (config: Omit<TimelineConfig, 'id' | 'createdAt' | 'updatedAt' | 'activities'>) => void | Promise<void>;
  onLoad: (config: TimelineConfig) => void | Promise<void>;
  onDelete: (timelineId: string) => void | Promise<void>;
  onUpdate: (updates: { name: string; startDate: string; endDate: string }) => void | Promise<void>;
  savedTimelines: TimelineConfig[];
  currentTimeline: TimelineConfig | null;
};

export default function TimelineSetup({ onSave, onLoad, onDelete, onUpdate, savedTimelines, currentTimeline }: TimelineSetupProps) {
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: currentTimeline?.name || '',
    startDate: currentTimeline?.startDate || '',
    endDate: currentTimeline?.endDate || '',
  });
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    // Sync form with current timeline when it changes
    setForm({
      name: currentTimeline?.name || '',
      startDate: currentTimeline?.startDate || '',
      endDate: currentTimeline?.endDate || '',
    });
  }, [currentTimeline?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return;
    onSave(form);
    setIsOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTimeline) return;
    if (!form.name || !form.startDate || !form.endDate) return;
    onUpdate(form);
    setIsOpen(false);
  };

  const handleDelete = (timelineId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this timeline? This action cannot be undone.')) {
      onDelete(timelineId);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow"
        style={{ 
          backgroundColor: colors.activityBoxBackground,
          color: colors.activityBoxText 
        }}
        title="Timeline Setup"
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-16 right-0 rounded-xl shadow-2xl p-6 w-96 animate-slideDown"
          style={{ backgroundColor: colors.modalBackground }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>Timeline Setup</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            >
              ×
            </button>
          </div>

          {/* Current Timeline Info */}
          {currentTimeline && (
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.activityBoxBackground }}>
              <h4 className="font-medium mb-2" style={{ color: colors.activityBoxText }}>Current Timeline</h4>
              <p className="text-sm" style={{ color: colors.activityBoxText }}>Name: {currentTimeline.name}</p>
              <p className="text-sm" style={{ color: colors.activityBoxText }}>
                Period: {currentTimeline.startDate} to {currentTimeline.endDate}
              </p>
              <p className="text-xs opacity-75" style={{ color: colors.activityBoxText }}>
                Created: {formatDateUTC(currentTimeline.createdAt)}
              </p>
              <p className="text-xs opacity-75" style={{ color: colors.activityBoxText }}>
                Last Modified: {formatDateTimeUTC(currentTimeline.updatedAt)}
              </p>
              <p className="text-xs opacity-50" style={{ color: colors.activityBoxText }}>
                Activities: {currentTimeline.activities.length}
              </p>
            </div>
          )}

          {/* Save / Update Timeline Form */}
          <form onSubmit={currentTimeline ? handleUpdate : handleSubmit} className="space-y-4 mb-6">
            <h4 className="font-medium" style={{ color: colors.activityBoxText }}>
              {currentTimeline ? 'Update Current Timeline' : 'Save New Timeline'}
            </h4>
            <div>
              <label className="block text-sm mb-1" style={{ color: colors.activityBoxText }}>Timeline Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1" style={{ color: colors.activityBoxText }}>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1" style={{ color: colors.activityBoxText }}>End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full p-2 rounded-lg transition-colors text-sm"
              style={{ 
                backgroundColor: colors.activityBoxText,
                color: colors.activityBoxBackground
              }}
            >
              {currentTimeline ? 'Update Timeline' : 'Save Timeline'}
            </button>
          </form>

          {/* Saved Timelines */}
          {savedTimelines.length > 0 && (
            <div>
              <h4 className="font-medium mb-3" style={{ color: colors.activityBoxText }}>Saved Timelines</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {savedTimelines.map((timeline) => (
                  <div
                    key={timeline.id}
                    className="relative group"
                  >
                    <button
                      onClick={() => onLoad(timeline)}
                      className="w-full p-3 rounded-lg text-left transition-colors"
                      style={{ 
                        backgroundColor: currentTimeline?.id === timeline.id ? colors.activityBoxText : colors.activityBoxBackground,
                        color: currentTimeline?.id === timeline.id ? colors.activityBoxBackground : colors.activityBoxText,
                        border: `1px solid ${colors.activityBoxText}`
                      }}
                    >
                      <div className="font-medium flex justify-between items-center">
                        <span>{timeline.name}</span>
                        <span className="text-xs opacity-70">{timeline.activities.length} acts</span>
                      </div>
                      <div className="text-sm opacity-75">
                        {timeline.startDate} - {timeline.endDate}
                      </div>
                      <div className="text-xs opacity-50">
                        Modified: {formatDateTimeUTC(timeline.updatedAt)}
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDelete(timeline.id, e)}
                      className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ 
                        backgroundColor: '#ef4444',
                        color: 'white'
                      }}
                      title="Delete Timeline"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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