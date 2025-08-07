import React, { useEffect, useState } from "react";
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
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (sorted.length === 0) return <div className="text-gray-400 text-center py-10">No activities yet. Add one above!</div>;

  // Date range + layout calculations (unchanged core logic)
  const minDate = new Date(sorted[0].endDate).getTime();
  const maxDate = new Date(sorted[sorted.length - 1].endDate).getTime();
  const range = maxDate - minDate || 1;
  const activityWidth = 140;
  const minSpacing = 40;
  const minGap = activityWidth + minSpacing;
  const baseWidthPerActivity = activityWidth + minSpacing;
  const baseWidth = Math.max(baseWidthPerActivity * sorted.length, 900);
  const rawPositions = sorted.map(a => ((new Date(a.endDate).getTime() - minDate) / range) * baseWidth);
  const adjustedPositions: number[] = [];
  rawPositions.forEach((pos, i) => adjustedPositions.push(i === 0 ? pos : Math.max(pos, adjustedPositions[i - 1] + minGap)));
  const lastPos = adjustedPositions[adjustedPositions.length - 1];
  const leftEdgeFirst = adjustedPositions[0] - activityWidth / 2;
  const shift = leftEdgeFirst;
  const displayPositions = adjustedPositions.map(p => p - shift);
  const containerWidth = Math.ceil((lastPos - shift) + activityWidth / 2);

  // Decide if we need scrolling
  const horizontalPadding = 48; // allowance for page side padding
  const needsScroll = containerWidth > (viewportWidth - horizontalPadding);

  const lineStart = 0;
  const lineEnd = containerWidth;
  const lineWidth = lineEnd - lineStart;

  const markerElements = displayPositions.map((x, idx) => (
    <div
      key={`marker-${sorted[idx].id}`}
      className={`absolute top-1/2 ${layout === 'outline' ? 'w-4 h-4' : 'w-3 h-3'} rounded-full border-2 shadow-sm z-10`}
      style={{ left: `${x}px`, backgroundColor: colors.activityBoxBackground, borderColor: colors.timelineColor, transform: 'translate(-50%, -50%)' }}
    />
  ));

  const OutlineContent = (
    <div className="relative py-8" style={{ width: `${containerWidth}px` }}>
      <div className="relative h-32 flex items-center mb-8">
        {sorted.map((activity, index) => {
          if (index % 2 !== 0) return null;
          const left = displayPositions[index];
          return (
            <div key={activity.id} className="absolute z-10" style={{ left: `${left}px`, transform: 'translateX(-50%)' }}>
              <button onClick={() => onSelect(activity)} className="rounded-xl shadow-lg px-6 py-3 min-w-[140px] text-center font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200" style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText }}>{activity.name}</button>
              <div className="absolute top-full left-1/2 w-px h-8" style={{ backgroundColor: colors.timelineColor, transform: 'translateX(-50%)' }} />
            </div>
          );
        })}
      </div>
      <div className="absolute" style={{ left: `${lineStart}px`, top: '50%', width: `${lineWidth}px`, height: '4px', backgroundColor: colors.timelineColor, transform: 'translateY(-50%)', borderRadius: '2px' }} />
      {markerElements}
      <div className="relative h-32 flex items-center mt-8">
        {sorted.map((activity, index) => {
          if (index % 2 !== 1) return null;
          const left = displayPositions[index];
          return (
            <div key={activity.id} className="absolute z-10" style={{ left: `${left}px`, transform: 'translateX(-50%)' }}>
              <div className="absolute bottom-full left-1/2 w-px h-8" style={{ backgroundColor: colors.timelineColor, transform: 'translateX(-50%)' }} />
              <button onClick={() => onSelect(activity)} className="rounded-xl shadow-lg px-6 py-3 min-w-[140px] text-center font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200" style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText }}>{activity.name}</button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const InlineContent = (
    <div className="relative h-64" style={{ width: `${containerWidth}px` }}>
      <div className="absolute" style={{ left: `${lineStart}px`, top: '50%', width: `${lineWidth}px`, height: '4px', backgroundColor: colors.timelineColor, transform: 'translateY(-50%)', borderRadius: '2px' }} />
      {markerElements}
      {sorted.map((activity, index) => {
        const x = displayPositions[index];
        const isAbove = index % 2 === 0;
        const boxTop = isAbove ? 'calc(50% - 130px)' : 'calc(50% + 30px)';
        return (
          <div key={activity.id} className="absolute z-20" style={{ left: `${x}px`, top: boxTop, transform: 'translateX(-50%)' }}>
            <div className="absolute left-1/2 w-px" style={{ top: isAbove ? '100%' : undefined, bottom: !isAbove ? '100%' : undefined, height: '100px', backgroundColor: colors.timelineColor, transform: 'translateX(-50%)' }} />
            <button onClick={() => onSelect(activity)} className="rounded-xl shadow-lg px-6 py-3 min-w-[140px] text-center font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200" style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText }}>{activity.name}</button>
          </div>
        );
      })}
    </div>
  );

  const content = layout === 'outline' ? OutlineContent : InlineContent;

  if (needsScroll) {
    return (
      <div className="relative w-full">
        <div className="overflow-x-auto pb-4" style={{ scrollbarColor: `${colors.timelineColor} transparent` }}>
          <div className="min-w-full inline-block" style={{ paddingBottom: '4px' }}>
            {content}
          </div>
        </div>
        <style jsx>{`
          .overflow-x-auto::-webkit-scrollbar { height: 10px; }
          .overflow-x-auto::-webkit-scrollbar-track { background: transparent; }
          .overflow-x-auto::-webkit-scrollbar-thumb { background: ${colors.timelineColor}; border-radius: 8px; }
        `}</style>
      </div>
    );
  }

  // Fits viewport: left align (shift) with no horizontal scroll
  return (
    <div className="relative w-full" style={{ maxWidth: '100%' }}>
      {content}
    </div>
  );
}