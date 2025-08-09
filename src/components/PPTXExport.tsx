"use client";

import React from 'react';
import PptxGenJS from 'pptxgenjs';
import { Activity } from '../app/page';
import type { TimelineConfig } from './TimelineSetup';
import type { TimelineLayout } from './TimelineLayoutSwitcher';
import { useColors } from '../context/ColorContext';

interface PPTXExportProps {
  activities: Activity[];
  timelineConfig: TimelineConfig | null;
  layout: TimelineLayout;
}

function toHex(color: string) {
  if (!color) return '#000000';
  const c = color.replace('#', '');
  const base = c.length === 8 ? c.substring(0, 6) : c;
  return `#${base}`;
}

export default function PPTXExport({ activities, timelineConfig, layout }: PPTXExportProps) {
  const { colors } = useColors();

  const exportPptx = async () => {
    if (!activities || activities.length === 0) {
      alert('No activities to export');
      return;
    }

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    // Defaults for 16x9 slides (~10in x 5.63in)
    const pageW = (pptx as any).presLayout?.width || 10;
    const pageH = (pptx as any).presLayout?.height || 5.63;

    const marginX = 0.5;
    const marginY = 0.5;
    const contentW = pageW - marginX * 2;
    const centerY = pageH / 2;

    // Colors
    const timelineHex = toHex(colors.timelineColor);
    const boxBgHex = toHex(colors.activityBoxBackground);
    const boxTextHex = toHex(colors.activityBoxText);

    // Compute positions similar to UI (scaled to slide width)
    const sorted = [...activities].sort((a,b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    const minDate = new Date(sorted[0].endDate).getTime();
    const maxDate = new Date(sorted[sorted.length - 1].endDate).getTime();
    const range = Math.max(1, maxDate - minDate);

    // Slightly smaller boxes as requested
    const boxW = 2.1; // inches (was 2.4)
    const boxH = 0.55; // inches (was 0.65)
    const minSpacing = 0.4; // inches
    const minGap = boxW + minSpacing; // inches between centers
    const baseWidthPerActivity = boxW + minSpacing;
    const baseWidth = Math.max(baseWidthPerActivity * sorted.length, contentW);

    const raw = sorted.map(a => ((new Date(a.endDate).getTime() - minDate) / range) * baseWidth);
    const adjusted: number[] = [];
    raw.forEach((pos, i) => adjusted.push(i === 0 ? pos : Math.max(pos, adjusted[i - 1] + minGap)));
    const lastPos = adjusted[adjusted.length - 1];
    const leftEdgeFirst = adjusted[0] - boxW / 2;
    const shift = leftEdgeFirst;
    const normalized = adjusted.map(p => p - shift);
    const naturalWidth = (lastPos - shift) + boxW / 2;

    let positions = normalized.slice();
    if (naturalWidth > 0) {
      const scaleFactor = contentW / naturalWidth;
      positions = positions.map(p => p * scaleFactor);
    }

    const slide = pptx.addSlide();

    // Title
    slide.addText(
      timelineConfig ? `${timelineConfig.name}` : 'Journey Timeline',
      { x: marginX, y: 0.2, w: pageW - marginX * 2, h: 0.4, align: 'center', bold: true, fontSize: 20, color: boxTextHex }
    );

    // Timeline line
    slide.addShape(pptx.ShapeType.line, {
      x: marginX, y: centerY, w: contentW, h: 0, line: { color: timelineHex, width: 2 }
    });

    // Vertical gap based on layout
    const verticalGap = layout === 'outline' ? 0.25 : 0.78; // inches

    positions.forEach((xIn, idx) => {
      const isAbove = idx % 2 === 0;
      const cx = marginX + xIn; // center x

      // Marker at the line
      const mr = 0.06;
      slide.addShape(pptx.ShapeType.ellipse, {
        x: cx - mr, y: centerY - mr, w: mr * 2, h: mr * 2,
        line: { color: timelineHex, width: 2 }, fill: { color: boxBgHex }
      });

      // Compute box position
      const boxX = cx - boxW / 2;
      const boxY = isAbove ? (centerY - verticalGap - boxH) : (centerY + verticalGap);

      // Connector line from timeline to box edge (vertical)
      const y1 = centerY;
      const y2 = isAbove ? (boxY + boxH) : boxY; // bottom/top edge of box
      slide.addShape(pptx.ShapeType.line, {
        x: cx, y: Math.min(y1, y2), w: 0, h: Math.abs(y2 - y1), line: { color: timelineHex, width: 1.5 }
      });

      // Activity box (rounded rect) with requested font size 18
      slide.addText(sorted[idx].name, {
        x: boxX, y: boxY, w: boxW, h: boxH,
        shape: pptx.ShapeType.roundRect,
        fill: { color: boxBgHex },
        line: { color: timelineHex, width: 1 },
        align: 'center', bold: true, color: boxTextHex, fontSize: 18,
        margin: 4
      });
    });

    const fileName = timelineConfig ? `${timelineConfig.name}_timeline.pptx` : 'journey_timeline.pptx';
    await pptx.writeFile({ fileName });
  };

  return (
    <button
      onClick={exportPptx}
      className="rounded-2xl p-3 shadow-sm hover:shadow-md transition"
      style={{ backgroundColor: colors.activityBoxBackground, color: colors.activityBoxText, border: `1px solid ${colors.activityBoxText}` }}
      title="Export to PowerPoint (PPTX). You can open this in Google Slides."
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 3a2 2 0 0 0-2 2v14.005A1.995 1.995 0 0 0 5.995 21H18a2 2 0 0 0 2-2V9l-6-6H6zm7 1.5V9h4.5L13 4.5zM8.75 12a3.25 3.25 0 1 1 0 6.5H7v-6.5h1.75zm0 1.5H8.5V17h.25a1.75 1.75 0 0 0 0-3.5z" />
      </svg>
    </button>
  );
}
