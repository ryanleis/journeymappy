import React from "react";
import { Activity } from "../app/page";
import { useColors } from "../context/ColorContext";
import type { TimelineLayout } from "./TimelineLayoutSwitcher";

type TimelineProps = {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
  layout: TimelineLayout;
};

function sortByEndDate(a: Activity, b: Activity) {
  return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
}

export default function Timeline({ activities, onSelect, layout }: TimelineProps) {
  const { colors } = useColors();
  const sorted = [...activities].sort(sortByEndDate);
  
  if (sorted.length === 0) {
    return <div className="text-gray-400 text-center py-10">No activities yet. Add one above!</div>;
  }

  // Calculate timeline range
  const minDate = new Date(sorted[0].endDate).getTime();
  const maxDate = new Date(sorted[sorted.length - 1].endDate).getTime();
  const range = maxDate - minDate || 1;

  if (layout === 'outline') {
    return (
      <div className="relative py-8">
        {/* Top row of activities */}
        <div className="relative h-32 flex items-center mb-8">
          {sorted.map((activity, index) => {
            // Only show activities with even indices above the timeline
            if (index % 2 !== 0) return null;
            
            const pos = ((new Date(activity.endDate).getTime() - minDate) / range) * 100;
            return (
              <div
                key={activity.id}
                className="absolute z-10"
                style={{ left: `calc(${pos}% - 60px)` }}
              >
                <button
                  onClick={() => onSelect(activity)}
                  className="rounded-xl shadow-lg px-6 py-3 min-w-[120px] text-center font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer"
                  style={{ 
                    backgroundColor: colors.activityBoxBackground,
                    color: colors.activityBoxText,
                    boxShadow: "0 4px 16px 0 rgba(0,0,0,0.07)" 
                  }}
                >
                  {activity.name}
                </button>
                {/* Connecting line to timeline */}
                <div 
                  className="absolute top-full left-1/2 w-px h-8"
                  style={{ 
                    backgroundColor: colors.timelineColor,
                    transform: "translateX(-50%)"
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Timeline line */}
        <div 
          className="relative h-1 rounded-full mx-4"
          style={{ backgroundColor: colors.timelineColor }}
        >
          {/* Timeline markers */}
          {sorted.map((activity) => {
            const pos = ((new Date(activity.endDate).getTime() - minDate) / range) * 100;
            return (
              <div
                key={activity.id}
                className="absolute top-1/2 w-3 h-3 rounded-full border-2"
                style={{ 
                  left: `${pos}%`,
                  backgroundColor: colors.activityBoxBackground,
                  borderColor: colors.activityBoxText,
                  transform: "translate(-50%, -50%)"
                }}
              />
            );
          })}
        </div>

        {/* Bottom row of activities */}
        <div className="relative h-32 flex items-center mt-8">
          {sorted.map((activity, index) => {
            // Only show activities with odd indices below the timeline
            if (index % 2 !== 1) return null;
            
            const pos = ((new Date(activity.endDate).getTime() - minDate) / range) * 100;
            return (
              <div
                key={activity.id}
                className="absolute z-10"
                style={{ left: `calc(${pos}% - 60px)` }}
              >
                {/* Connecting line to timeline */}
                <div 
                  className="absolute bottom-full left-1/2 w-px h-8"
                  style={{ 
                    backgroundColor: colors.timelineColor,
                    transform: "translateX(-50%)"
                  }}
                />
                <button
                  onClick={() => onSelect(activity)}
                  className="rounded-xl shadow-lg px-6 py-3 min-w-[120px] text-center font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer"
                  style={{ 
                    backgroundColor: colors.activityBoxBackground,
                    color: colors.activityBoxText,
                    boxShadow: "0 4px 16px 0 rgba(0,0,0,0.07)" 
                  }}
                >
                  {activity.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Inline layout (original)
  return (
    <div className="relative h-32 flex items-center">
      {/* Timeline line */}
      <div 
        className="absolute left-0 right-0 top-1/2 h-1 rounded-full z-0" 
        style={{ 
          backgroundColor: colors.timelineColor,
          transform: "translateY(-50%)" 
        }} 
      />
      {/* Activity boxes */}
      {sorted.map((activity) => {
        const pos = ((new Date(activity.endDate).getTime() - minDate) / range) * 100;
        return (
          <div
            key={activity.id}
            className="absolute z-10"
            style={{ left: `calc(${pos}% - 60px)` }}
          >
            <button
              onClick={() => onSelect(activity)}
              className="rounded-xl shadow-lg px-6 py-3 min-w-[120px] text-center font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200 cursor-pointer"
              style={{ 
                backgroundColor: colors.activityBoxBackground,
                color: colors.activityBoxText,
                boxShadow: "0 4px 16px 0 rgba(0,0,0,0.07)" 
              }}
            >
              {activity.name}
            </button>
          </div>
        );
      })}
    </div>
  );
} 