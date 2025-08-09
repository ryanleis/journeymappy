"use client";
import React, { useState, useEffect } from "react";
import ActivityForm from "../components/ActivityForm";
import Timeline from "../components/Timeline";
import ActivityModal from "../components/ActivityModal";
import ActivityEditModal from "../components/ActivityEditModal";
import ColorSettings from "../components/ColorSettings";
import TimelineSetup, { TimelineConfig } from "../components/TimelineSetup";
import PDFExport from "../components/PDFExport";
import ActivityFilter from "../components/ActivityFilter";
import TimelineSharing from "../components/TimelineSharing";
import FileImport from "../components/FileImport";
import TimelineLayoutSwitcher, { TimelineLayout } from "../components/TimelineLayoutSwitcher";
import StartOver from "../components/StartOver";
import { useColors } from "../context/ColorContext";

export type Activity = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
};

const TIMELINES_STORAGE_KEY = 'timelineConfigs';
const ACTIVITIES_STORAGE_KEY = 'timelineActivities';
const LAYOUT_STORAGE_KEY = 'timelineLayout';

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [currentTimeline, setCurrentTimeline] = useState<TimelineConfig | null>(null);
  const [savedTimelines, setSavedTimelines] = useState<TimelineConfig[]>([]);
  const [timelineLayout, setTimelineLayout] = useState<TimelineLayout>('inline');
  const { colors, resetColors } = useColors();
  const [isTimelineManagerOpen, setTimelineManagerOpen] = useState(false);
  const [isDisplayModeOpen, setDisplayModeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Load saved data from DB (timelines) and local activities as a fallback
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/timelines', { cache: 'no-store' });
        if (res.ok) {
          const timelines = await res.json();
          setSavedTimelines(timelines);
          const mostRecent = timelines[0] ?? null; // API returns desc by updatedAt
          if (mostRecent) {
            setCurrentTimeline(mostRecent);
            setActivities(mostRecent.activities || []);
            setFilteredActivities(mostRecent.activities || []);
          } else {
            // fallback to any locally cached activities (legacy)
            const savedActivities = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
            if (savedActivities) {
              const parsed = JSON.parse(savedActivities);
              setActivities(parsed);
              setFilteredActivities(parsed);
            }
          }
        }
      } catch (e) {
        // On error, fall back entirely to local cache to keep app usable
        const savedActivities = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
        if (savedActivities) {
          const parsed = JSON.parse(savedActivities);
          setActivities(parsed);
          setFilteredActivities(parsed);
        }
      }
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout) setTimelineLayout(savedLayout as TimelineLayout);
    };
    init();
  }, []);

  // Persist activities to local cache (legacy) and update the current timeline snapshot in DB
  useEffect(() => {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
    const persist = async () => {
      if (!currentTimeline) return;
      try {
        const res = await fetch('/api/timelines', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentTimeline.id,
            name: currentTimeline.name,
            startDate: currentTimeline.startDate,
            endDate: currentTimeline.endDate,
            activities,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          setCurrentTimeline(updated);
          setSavedTimelines(prev => {
            const copy = prev.slice();
            const i = copy.findIndex(t => t.id === updated.id);
            if (i >= 0) copy[i] = updated; else copy.unshift(updated);
            return copy;
          });
        }
      } catch {}
    };
    persist();
  }, [activities]);

  // Save layout to localStorage
  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, timelineLayout);
  }, [timelineLayout]);

  // Keyboard shortcuts: F to open Display Mode, ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
      if (typing) return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setDisplayModeOpen(true);
      } else if (e.key === 'Escape') {
        if (isDisplayModeOpen) {
          e.preventDefault();
          setDisplayModeOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDisplayModeOpen]);

  // Ensure hooks order is stable; gate rendering only after hooks have been declared
  if (!mounted) return null;

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity = { ...activity, id: Date.now().toString() };
    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    setFilteredActivities(updatedActivities);
  };

  const importActivities = (importedActivities: Omit<Activity, "id">[]) => {
    const newActivities = importedActivities.map(activity => ({
      ...activity,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }));
    const updatedActivities = [...activities, ...newActivities];
    setActivities(updatedActivities);
    setFilteredActivities(updatedActivities);
  };

  const saveTimeline = async (config: Omit<TimelineConfig, 'id' | 'createdAt' | 'updatedAt' | 'activities'>) => {
    try {
      const res = await fetch('/api/timelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, activities }),
      });
      if (!res.ok) return;
      const created = await res.json();
      setSavedTimelines(prev => [created, ...prev]);
      setCurrentTimeline(created);
    } catch {}
  };

  const updateCurrentTimeline = async (updates: { name: string; startDate: string; endDate: string }) => {
    if (!currentTimeline) return;
    try {
      const res = await fetch('/api/timelines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentTimeline.id, ...updates, activities }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setCurrentTimeline(updated);
      setSavedTimelines(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {}
  };

  const loadTimeline = (timeline: TimelineConfig) => {
    setCurrentTimeline(timeline);
    // Load its activity snapshot
    setActivities(timeline.activities || []);
    setFilteredActivities(timeline.activities || []);
  };

  const deleteTimeline = async (timelineId: string) => {
    try {
      await fetch(`/api/timelines?id=${encodeURIComponent(timelineId)}`, { method: 'DELETE' });
    } catch {}
    const updatedTimelines = savedTimelines.filter(t => t.id !== timelineId);
    setSavedTimelines(updatedTimelines);
    if (currentTimeline?.id === timelineId) {
      const fallback = updatedTimelines.length > 0 ? updatedTimelines[updatedTimelines.length - 1] : null;
      setCurrentTimeline(fallback);
      if (fallback) {
        setActivities(fallback.activities || []);
        setFilteredActivities(fallback.activities || []);
      } else {
        setActivities([]);
        setFilteredActivities([]);
      }
    }
  };

  const handleFilterChange = (filtered: Activity[]) => {
    setFilteredActivities(filtered);
  };

  const handleLayoutChange = (layout: TimelineLayout) => {
    setTimelineLayout(layout);
  };

  const deleteActivity = (activityId: string) => {
    const updatedActivities = activities.filter(activity => activity.id !== activityId);
    setActivities(updatedActivities);
    setFilteredActivities(updatedActivities);
  };

  const editActivity = (activity: Activity) => {
    setEditingActivity(activity);
  };

  const saveEditedActivity = (updatedActivity: Activity) => {
    const updatedActivities = activities.map(activity => 
      activity.id === updatedActivity.id ? updatedActivity : activity
    );
    setActivities(updatedActivities);
    setFilteredActivities(updatedActivities);
    setEditingActivity(null);
  };

  const handleStartOver = () => {
    setActivities([]);
    setFilteredActivities([]);
    setSelectedActivity(null);
    setCurrentTimeline(null);
    setSavedTimelines([]);
    setTimelineLayout('inline');
    localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
    localStorage.removeItem(TIMELINES_STORAGE_KEY);
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    resetColors();
    localStorage.removeItem('colorSettings');
    localStorage.removeItem('customThemes');
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-10" style={{ backgroundColor: colors.pageBackground }}>
      <h1 className="text-4xl font-bold mb-8" style={{ color: colors.activityBoxText }}>Journey Timeline</h1>
      <div className="flex gap-4 mb-6">
        <TimelineSetup
          onSave={saveTimeline}
          onLoad={loadTimeline}
          onDelete={deleteTimeline}
            onUpdate={updateCurrentTimeline}
          savedTimelines={savedTimelines}
          currentTimeline={currentTimeline}
        />
        <button
          onClick={() => setTimelineManagerOpen(true)}
          className="rounded-2xl p-3 shadow-sm hover:shadow-md transition"
          style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText, border: `1px solid ${colors.activityBoxText}` }}
          title="Manage Timelines"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>
        </button>
        <button
          onClick={() => setDisplayModeOpen(true)}
          className="rounded-2xl p-3 shadow-sm hover:shadow-md transition"
          style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText, border: `1px solid ${colors.activityBoxText}` }}
          title="Open Display Mode (Press F)"
          aria-label="Open Display Mode (Press F)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6a2 2 0 0 1 2-2h5v2H6v5H4V6zm10-2h4a2 2 0 0 1 2 2v4h-2V6h-4V4zM4 14h2v4h4v2H6a2 2 0 0 1-2-2v-4zm16 0v4a2 2 0 0 1-2 2h-4v-2h4v-4h2z" />
          </svg>
        </button>
        <PDFExport activities={filteredActivities} timelineConfig={currentTimeline} />
        <TimelineSharing currentTimeline={currentTimeline} activities={activities} />
        <FileImport onImport={importActivities} />
        <StartOver onStartOver={handleStartOver} />
      </div>

      {currentTimeline && (
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: colors.modalBackground, border: `1px solid ${colors.activityBoxText}` }}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: colors.activityBoxText }}>
            {currentTimeline.name}
          </h2>
          <p className="text-sm" style={{ color: colors.activityBoxText }}>
            {currentTimeline.startDate} - {currentTimeline.endDate}
          </p>
          <p className="text-xs mt-1" style={{ color: colors.activityBoxText }}>
            Last Modified: {new Date(currentTimeline.updatedAt).toLocaleString()}
          </p>
        </div>
      )}

      <div className="w-full max-w-2xl mb-10">
        <ActivityForm onAdd={addActivity} />
      </div>
      <div className="w-full px-4 md:px-8" style={{ marginTop: '1.125in' }}>
        <Timeline activities={filteredActivities} onSelect={setSelectedActivity} layout={timelineLayout} />
      </div>
      {selectedActivity && (
        <ActivityModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} onDelete={deleteActivity} onEdit={editActivity} />
      )}
      {editingActivity && (
        <ActivityEditModal activity={editingActivity} onClose={() => setEditingActivity(null)} onSave={saveEditedActivity} />
      )}
      <ActivityFilter activities={activities} currentTimeline={currentTimeline} onFilterChange={handleFilterChange} />
      <TimelineLayoutSwitcher currentLayout={timelineLayout} onLayoutChange={handleLayoutChange} />
      <ColorSettings />

      {/* Display Mode Fullscreen Overlay */}
      {isDisplayModeOpen && (
        <div className="fixed inset-0 z-50">
          {/* Dimmed backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setDisplayModeOpen(false)} />
          {/* Foreground content */}
          <div className="relative flex flex-col h-full" style={{ backgroundColor: colors.pageBackground }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colors.timelineColor }}>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>Display Mode</h3>
                {currentTimeline && (
                  <span className="text-sm opacity-75" style={{ color: colors.activityBoxText }}>{currentTimeline.name}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDisplayModeOpen(false)}
                  className="rounded-full px-3 py-2"
                  style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText, border: `1px solid ${colors.timelineColor}` }}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 w-full overflow-hidden p-4">
              <div className="w-full h-full" style={{ marginTop: '2in' }}>
                <Timeline activities={filteredActivities} onSelect={setSelectedActivity} layout={timelineLayout} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Manager Modal */}
      {isTimelineManagerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="rounded-2xl shadow-2xl p-8 w-[600px] max-h-[80vh] overflow-y-auto" style={{ backgroundColor: colors.modalBackground }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>Manage Timelines</h3>
              <button onClick={() => setTimelineManagerOpen(false)} className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none">×</button>
            </div>
            {savedTimelines.length === 0 && (
              <div className="text-sm" style={{ color: colors.activityBoxText }}>No timelines saved yet.</div>
            )}
            <ul className="divide-y" style={{ borderColor: colors.activityBoxText }}>
              {savedTimelines
                .slice()
                .sort((a,b)=> new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map(t => (
                <li key={t.id} className="py-3 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: colors.activityBoxText }}>{t.name}</div>
                    <div className="text-xs opacity-70" style={{ color: colors.activityBoxText }}>Period: {t.startDate} - {t.endDate}</div>
                  </div>
                  <div className="w-40 text-xs" style={{ color: colors.activityBoxText }}>
                    <div>Modified:</div>
                    <div>{new Date(t.updatedAt).toLocaleDateString()} {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { loadTimeline(t); setTimelineManagerOpen(false); }} className="px-3 py-1 rounded text-xs" style={{ backgroundColor: colors.activityBoxText, color: colors.activityBoxBackground }}>Open</button>
                    <button onClick={() => updateCurrentTimeline({ name: t.name + ' Copy', startDate: t.startDate, endDate: t.endDate })} className="px-3 py-1 rounded text-xs" style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText, border: `1px solid ${colors.activityBoxText}` }}>Clone</button>
                    <button onClick={() => deleteTimeline(t.id)} className="px-3 py-1 rounded text-xs bg-red-500 text-white">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
