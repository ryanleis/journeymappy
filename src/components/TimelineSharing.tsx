"use client";

import React, { useState } from 'react';
import { useColors } from '../context/ColorContext';
import { Activity } from '../app/page';
import type { TimelineConfig } from './TimelineSetup';

type TimelineData = {
  timeline: TimelineConfig;
  activities: Activity[];
  colors: any;
  exportDate: string;
};

type TimelineSharingProps = {
  currentTimeline: TimelineConfig | null;
  activities: Activity[];
};

export default function TimelineSharing({ currentTimeline, activities }: TimelineSharingProps) {
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [importData, setImportData] = useState('');

  const exportTimeline = () => {
    if (!currentTimeline) {
      alert('No timeline selected');
      return;
    }

    const timelineData: TimelineData = {
      timeline: currentTimeline,
      activities: activities,
      colors: colors,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(timelineData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTimeline.name}_timeline.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateShareLink = () => {
    if (!currentTimeline) {
      alert('No timeline selected');
      return;
    }

    const timelineData: TimelineData = {
      timeline: currentTimeline,
      activities: activities,
      colors: colors,
      exportDate: new Date().toISOString(),
    };

    const encodedData = btoa(JSON.stringify(timelineData));
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;
    setShareLink(shareUrl);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('Share link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share link copied to clipboard!');
    }
  };

  const importTimeline = () => {
    try {
      const data: TimelineData = JSON.parse(importData);
      
      // Validate the imported data
      if (!data.timeline || !data.activities) {
        throw new Error('Invalid timeline data format');
      }

      // Store the imported data in localStorage
      const importedTimeline = {
        ...data.timeline,
        id: Date.now().toString(), // Generate new ID
        createdAt: new Date().toISOString(),
      };

      const existingTimelines = JSON.parse(localStorage.getItem('timelineConfigs') || '[]');
      const existingActivities = JSON.parse(localStorage.getItem('timelineActivities') || '[]');

      // Add imported timeline
      const updatedTimelines = [...existingTimelines, importedTimeline];
      localStorage.setItem('timelineConfigs', JSON.stringify(updatedTimelines));

      // Add imported activities with new IDs
      const importedActivities = data.activities.map(activity => ({
        ...activity,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      }));
      
      const updatedActivities = [...existingActivities, ...importedActivities];
      localStorage.setItem('timelineActivities', JSON.stringify(updatedActivities));

      // Apply imported colors if available
      if (data.colors) {
        localStorage.setItem('timelineColorSettings', JSON.stringify(data.colors));
      }

      alert('Timeline imported successfully! Please refresh the page to see the changes.');
      setIsOpen(false);
    } catch (error) {
      alert('Error importing timeline: ' + (error as Error).message);
    }
  };

  const loadSharedTimeline = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');
    
    if (shareData) {
      try {
        const decodedData = atob(shareData);
        const data: TimelineData = JSON.parse(decodedData);
        setImportData(decodedData);
        setIsOpen(true);
      } catch (error) {
        alert('Invalid share link');
      }
    }
  };

  // Check for shared timeline on component mount
  React.useEffect(() => {
    loadSharedTimeline();
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow"
        style={{ 
          backgroundColor: colors.activityBoxBackground,
          color: colors.activityBoxText 
        }}
        title="Share Timeline"
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
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div 
            className="rounded-2xl shadow-2xl p-8 w-96 max-h-[80vh] overflow-y-auto animate-fadeIn"
            style={{ backgroundColor: colors.modalBackground }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>Share Timeline</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Export Section */}
              <div>
                <h4 className="font-medium mb-3" style={{ color: colors.activityBoxText }}>Export Timeline</h4>
                <div className="space-y-2">
                  <button
                    onClick={exportTimeline}
                    className="w-full p-2 rounded-lg transition-colors text-sm"
                    style={{ 
                      backgroundColor: colors.activityBoxText,
                      color: colors.activityBoxBackground
                    }}
                  >
                    Download as JSON
                  </button>
                  <button
                    onClick={generateShareLink}
                    className="w-full p-2 rounded-lg transition-colors text-sm"
                    style={{ 
                      backgroundColor: colors.activityBoxBackground,
                      color: colors.activityBoxText,
                      border: `1px solid ${colors.activityBoxText}`
                    }}
                  >
                    Generate Share Link
                  </button>
                </div>
              </div>

              {/* Share Link Section */}
              {shareLink && (
                <div>
                  <h4 className="font-medium mb-3" style={{ color: colors.activityBoxText }}>Share Link</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      style={{ backgroundColor: colors.formBackground, color: colors.activityBoxText, borderColor: colors.activityBoxText }}
                    />
                    <button
                      onClick={copyShareLink}
                      className="w-full p-2 rounded-lg transition-colors text-sm"
                      style={{ 
                        backgroundColor: colors.activityBoxText,
                        color: colors.activityBoxBackground
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              )}

              {/* Import Section */}
              <div>
                <h4 className="font-medium mb-3" style={{ color: colors.activityBoxText }}>Import Timeline</h4>
                <div className="space-y-2">
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste timeline JSON data here..."
                    rows={4}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={{ backgroundColor: colors.formBackground, color: colors.activityBoxText, borderColor: colors.activityBoxText, caretColor: colors.activityBoxText }}
                  />
                  <button
                    onClick={importTimeline}
                    className="w-full p-2 rounded-lg transition-colors text-sm"
                    style={{ 
                      backgroundColor: colors.activityBoxText,
                      color: colors.activityBoxBackground
                    }}
                  >
                    Import Timeline
                  </button>
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.97); }
                to { opacity: 1; transform: scale(1); }
              }
              .animate-fadeIn {
                animation: fadeIn 0.2s ease;
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
}