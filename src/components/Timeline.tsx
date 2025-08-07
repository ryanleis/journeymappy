"use client";

import React, { useEffect, useState, useRef } from "react";
import type { Activity } from "../app/page";
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
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    const measure = () => {
      const w = containerRef.current?.clientWidth ?? window.innerWidth;
      setContainerWidth(Math.max(0, w));
    };
    measure();
    // Safely use ResizeObserver if available
    let ro: ResizeObserver | null = null;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window && containerRef.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(containerRef.current);
    }
    window.addEventListener('resize', measure);
    return () => {
      try { ro && ro.disconnect(); } catch {}
      window.removeEventListener('resize', measure);
    };
  }, []);

  if (sorted.length === 0) return <div className="text-gray-400 text-center py-10">No activities yet. Add one above!</div>;

  // Core positioning independent of viewport to avoid SSR/CSR mismatch
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
  const normalizedPositions = adjustedPositions.map(p => p - shift);
  const naturalContainerWidth = Math.ceil((lastPos - shift) + activityWidth / 2);

  // Available width is based on this component's container, not the viewport
  const availableWidth = mounted ? Math.max(300, containerWidth) : Infinity;

  // Proportional scaling: fill container when there's space; scroll when too wide
  let positions = normalizedPositions;
  let contentWidth = naturalContainerWidth;
  let needsScroll = false;

  if (mounted) {
    if (contentWidth > availableWidth) {
      needsScroll = true; // only timeline section scrolls horizontally
    } else {
      const scaleFactor = contentWidth > 0 ? (availableWidth / contentWidth) : 1;
      positions = positions.map(p => p * scaleFactor);
      contentWidth = Math.round(availableWidth);
    }
  }

  const lineStart = 0;
  const lineEnd = contentWidth;
  const lineWidth = lineEnd - lineStart;

  // Equal vertical gap from the line for above/below boxes
  const verticalGapBase = layout === 'outline' ? 32 : 100; // original gap in px
  const verticalGap = Math.round(verticalGapBase * 0.75); // 25% smaller
  const boxApproxHeight = 56; // approximate button height for container sizing only
  const containerHeight = verticalGap * 2 + boxApproxHeight * 2;

  const markerElements = positions.map((x, idx) => (
    <div
      key={`marker-${sorted[idx].id}`}
      className={`absolute top-1/2 ${layout === 'outline' ? 'w-4 h-4' : 'w-3 h-3'} rounded-full border-2 shadow-sm z-10`}
      style={{ left: `${x}px`, backgroundColor: colors.activityBoxBackground, borderColor: colors.timelineColor, transform: 'translate(-50%, -50%)' }}
    />
  ));

  const OutlineContent = (
    <div className="relative" style={{ width: `${contentWidth}px`, height: `${containerHeight}px` }}>
      <div className="absolute" style={{ left: `${lineStart}px`, top: '50%', width: `${lineWidth}px`, height: '4px', backgroundColor: colors.timelineColor, transform: 'translateY(-50%)', borderRadius: '2px' }} />
      {markerElements}
      {sorted.map((activity, index) => {
        const x = positions[index];
        const isAbove = index % 2 === 0;
        return (
          <div
            key={activity.id}
            className="absolute z-20"
            style={{
              left: `${x}px`,
              top: '50%',
              transform: isAbove
                ? `translateX(-50%) translateY(calc(-100% - ${verticalGap}px))`
                : `translateX(-50%) translateY(${verticalGap}px)`,
            }}
          >
            <div
              className="absolute left-1/2 w-px"
              style={{
                top: isAbove ? '100%' : undefined,
                bottom: !isAbove ? '100%' : undefined,
                height: `${verticalGap}px`,
                backgroundColor: colors.timelineColor,
                transform: 'translateX(-50%)',
              }}
            />
            <button
              onClick={() => onSelect(activity)}
              className="rounded-xl shadow-lg px-6 py-3 min-w-[140px] text-center font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200"
              style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText }}
            >
              {activity.name}
            </button>
          </div>
        );
      })}
    </div>
  );

  const InlineContent = (
    <div className="relative" style={{ width: `${contentWidth}px`, height: `${containerHeight}px` }}>
      <div className="absolute" style={{ left: `${lineStart}px`, top: '50%', width: `${lineWidth}px`, height: '4px', backgroundColor: colors.timelineColor, transform: 'translateY(-50%)', borderRadius: '2px' }} />
      {markerElements}
      {sorted.map((activity, index) => {
        const x = positions[index];
        const isAbove = index % 2 === 0;
        return (
          <div
            key={activity.id}
            className="absolute z-20"
            style={{
              left: `${x}px`,
              top: '50%',
              transform: isAbove
                ? `translateX(-50%) translateY(calc(-100% - ${verticalGap}px))` // bottom edge is verticalGap above the line
                : `translateX(-50%) translateY(${verticalGap}px)`, // top edge is verticalGap below the line
            }}
          >
            <div
              className="absolute left-1/2 w-px"
              style={{
                top: isAbove ? '100%' : undefined,
                bottom: !isAbove ? '100%' : undefined,
                height: `${verticalGap}px`,
                backgroundColor: colors.timelineColor,
                transform: 'translateX(-50%)',
              }}
            />
            <button
              onClick={() => onSelect(activity)}
              className="rounded-xl shadow-lg px-6 py-3 min-w-[140px] text-center font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-200"
              style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText }}
            >
              {activity.name}
            </button>
          </div>
        );
      })}
    </div>
  );

  const content = layout === 'outline' ? OutlineContent : InlineContent;

  if (needsScroll) {
    // Enable horizontal scroll when too wide (only timeline section scrolls)
    return (
      <div ref={containerRef} className="relative w-full">
        <div className="overflow-x-auto pb-4" style={{ scrollbarColor: `${colors.timelineColor} transparent` }}>
          <div style={{ width: `${contentWidth}px` }}>
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

  return (
    <div ref={containerRef} className="relative w-full" style={{ maxWidth: '100%' }}>
      {content}
    </div>
  );
}