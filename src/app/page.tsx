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
      const timelines = JSON.parse(savedTimelinesData);
      setSavedTimelines(timelines);
      // Set the most recent timeline as current
      if (timelines.length > 0) {
        setCurrentTimeline(timelines[timelines.length - 1]);
      }
    }
    if (savedLayout) {
      setTimelineLayout(savedLayout as TimelineLayout);
    }
  }, []);

  // Save activities to localStorage
  useEffect(() => {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  // Save timelines to localStorage
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

  const saveTimeline = (config: Omit<TimelineConfig, 'id' | 'createdAt'>) => {
    const newTimeline: TimelineConfig = {
      ...config,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setSavedTimelines([...savedTimelines, newTimeline]);
    setCurrentTimeline(newTimeline);
  };

  const loadTimeline = (timeline: TimelineConfig) => {
    setCurrentTimeline(timeline);
  };

  const deleteTimeline = (timelineId: string) => {
    const updatedTimelines = savedTimelines.filter(t => t.id !== timelineId);
    setSavedTimelines(updatedTimelines);
    
    // If we're deleting the current timeline, set to the most recent one
    if (currentTimeline?.id === timelineId) {
      setCurrentTimeline(updatedTimelines.length > 0 ? updatedTimelines[updatedTimelines.length - 1] : null);
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
    // Clear all data
    setActivities([]);
    setFilteredActivities([]);
    setSelectedActivity(null);
    setCurrentTimeline(null);
    setSavedTimelines([]);
    setTimelineLayout('inline');
    
    // Clear localStorage
    localStorage.removeItem(ACTIVITIES_STORAGE_KEY);
    localStorage.removeItem(TIMELINES_STORAGE_KEY);
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    
    // Reset colors to default
    resetColors();
    
    // Clear any other stored data
    localStorage.removeItem('colorSettings');
    localStorage.removeItem('customThemes');
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-10" style={{ backgroundColor: colors.pageBackground }}>
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Journey Timeline</h1>
      
      {/* Control buttons */}
      <div className="flex gap-4 mb-6">
        <TimelineSetup
          onSave={saveTimeline}
          onLoad={loadTimeline}
          onDelete={deleteTimeline}
          savedTimelines={savedTimelines}
          currentTimeline={currentTimeline}
        />
        <PDFExport
          activities={filteredActivities}
          timelineConfig={currentTimeline}
        />
        <TimelineSharing
          currentTimeline={currentTimeline}
          activities={activities}
        />
        <FileImport
          onImport={importActivities}
        />
        <StartOver onStartOver={handleStartOver} />
      </div>

      {/* Current timeline info */}
      {currentTimeline && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.modalBackground }}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: colors.activityBoxText }}>
            {currentTimeline.name}
          </h2>
          <p className="text-sm" style={{ color: colors.activityBoxText }}>
            {currentTimeline.startDate} - {currentTimeline.endDate}
          </p>
        </div>
      )}

      <div className="w-full max-w-2xl mb-10">
        <ActivityForm onAdd={addActivity} />
      </div>
      
      <div className="w-full max-w-4xl">
        <Timeline
          activities={filteredActivities}
          onSelect={setSelectedActivity}
          layout={timelineLayout}
        />
      </div>
      
      {selectedActivity && (
        <ActivityModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onDelete={deleteActivity}
          onEdit={editActivity}
        />
      )}
      
      {editingActivity && (
        <ActivityEditModal
          activity={editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={saveEditedActivity}
        />
      )}
      
      <ActivityFilter
        activities={activities}
        currentTimeline={currentTimeline}
        onFilterChange={handleFilterChange}
      />
      
      <TimelineLayoutSwitcher
        currentLayout={timelineLayout}
        onLayoutChange={handleLayoutChange}
      />
      
      <ColorSettings />
    </main>
  );
}
