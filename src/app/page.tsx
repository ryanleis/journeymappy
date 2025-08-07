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

  // Load saved data from localStorage
  useEffect(() => {
    const savedActivities = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    const savedTimelinesData = localStorage.getItem(TIMELINES_STORAGE_KEY);
    const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
    
    if (savedActivities) {
      const parsedActivities = JSON.parse(savedActivities);
      setActivities(parsedActivities);
      setFilteredActivities(parsedActivities);
    }
    if (savedTimelinesData) {
      // Backward compatibility transform (add missing fields)
      const timelinesRaw = JSON.parse(savedTimelinesData);
      const timelines: TimelineConfig[] = timelinesRaw.map((t: any) => ({
        ...t,
        activities: t.activities || [],
        updatedAt: t.updatedAt || t.createdAt || new Date().toISOString(),
      }));
      setSavedTimelines(timelines);
      if (timelines.length > 0) {
        setCurrentTimeline(timelines[timelines.length - 1]);
        // Load that timeline's activities snapshot if stored
        const timelineActs = timelines[timelines.length - 1].activities;
        if (timelineActs?.length) {
          setActivities(timelineActs);
          setFilteredActivities(timelineActs);
        }
      }
    }
    if (savedLayout) {
      setTimelineLayout(savedLayout as TimelineLayout);
    }
  }, []);

  // Persist activities (global list for backward compatibility) and also sync to current timeline snapshot
  useEffect(() => {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
    if (currentTimeline) {
      setSavedTimelines(prev => prev.map(t => t.id === currentTimeline.id ? { ...t, activities, updatedAt: new Date().toISOString() } : t));
    }
  }, [activities]);

  // Save timelines list to localStorage
  useEffect(() => {
    localStorage.setItem(TIMELINES_STORAGE_KEY, JSON.stringify(savedTimelines));
  }, [savedTimelines]);

  // Save layout to localStorage
  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, timelineLayout);
  }, [timelineLayout]);

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

  const saveTimeline = (config: Omit<TimelineConfig, 'id' | 'createdAt' | 'updatedAt' | 'activities'>) => {
    const newTimeline: TimelineConfig = {
      ...config,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: activities, // snapshot of current activities
    };
    setSavedTimelines([...savedTimelines, newTimeline]);
    setCurrentTimeline(newTimeline);
  };

  const updateCurrentTimeline = (updates: { name: string; startDate: string; endDate: string }) => {
    if (!currentTimeline) return;
    const updated = { ...currentTimeline, ...updates, updatedAt: new Date().toISOString() };
    setCurrentTimeline(updated);
    setSavedTimelines(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const loadTimeline = (timeline: TimelineConfig) => {
    setCurrentTimeline(timeline);
    // Load its activity snapshot
    setActivities(timeline.activities || []);
    setFilteredActivities(timeline.activities || []);
  };

  const deleteTimeline = (timelineId: string) => {
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
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Journey Timeline</h1>
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
          className="rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow"
          style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText }}
          title="Manage Timelines"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" /></svg>
        </button>
        <PDFExport activities={filteredActivities} timelineConfig={currentTimeline} />
        <TimelineSharing currentTimeline={currentTimeline} activities={activities} />
        <FileImport onImport={importActivities} />
        <StartOver onStartOver={handleStartOver} />
      </div>

      {currentTimeline && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.modalBackground }}>
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
      <div className="w-full max-w-4xl">
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
