"use client";

import React, { useState } from 'react';
import { useColors } from '../context/ColorContext';
import { Activity } from '../app/page';
import type { TimelineConfig } from './TimelineSetup';

type PDFExportProps = {
  activities: Activity[];
  timelineConfig: TimelineConfig | null;
};

type PDFOptions = {
  includeDescription: boolean;
  includeStatus: boolean;
  includeDates: boolean;
  layout: 'list' | 'table' | 'timeline';
  fontSize: 'small' | 'medium' | 'large';
  includeHeader: boolean;
  includeFooter: boolean;
};

export default function PDFExport({ activities, timelineConfig }: PDFExportProps) {
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<PDFOptions>({
    includeDescription: true,
    includeStatus: true,
    includeDates: true,
    layout: 'list',
    fontSize: 'medium',
    includeHeader: true,
    includeFooter: true,
  });

  const exportToPDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Header
    if (options.includeHeader) {
      doc.setFontSize(options.fontSize === 'large' ? 24 : options.fontSize === 'medium' ? 20 : 16);
      doc.setFont('helvetica', 'bold');
      doc.text('Journey Timeline', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      if (timelineConfig) {
        doc.setFontSize(options.fontSize === 'large' ? 14 : options.fontSize === 'medium' ? 12 : 10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Timeline: ${timelineConfig.name}`, margin, yPosition);
        yPosition += 8;
        doc.text(`Period: ${timelineConfig.startDate} to ${timelineConfig.endDate}`, margin, yPosition);
        yPosition += 15;
      }
    }

    // Activities section
    doc.setFontSize(options.fontSize === 'large' ? 16 : options.fontSize === 'medium' ? 14 : 12);
    doc.setFont('helvetica', 'bold');
    doc.text('Activities', margin, yPosition);
    yPosition += 15;

    const fontSize = options.fontSize === 'large' ? 12 : options.fontSize === 'medium' ? 10 : 8;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');

    if (options.layout === 'table') {
      // Table layout
      const headers = ['#', 'Name'];
      if (options.includeDates) headers.push('Start Date', 'End Date');
      if (options.includeStatus) headers.push('Status');
      if (options.includeDescription) headers.push('Description');

      const colWidths = [10, 50];
      if (options.includeDates) colWidths.push(30, 30);
      if (options.includeStatus) colWidths.push(25);
      if (options.includeDescription) colWidths.push(60);

      let xPosition = margin;
      headers.forEach((header, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 10;

      activities.forEach((activity, index) => {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }

        xPosition = margin;
        doc.setFont('helvetica', 'normal');
        doc.text(`${index + 1}`, xPosition, yPosition);
        xPosition += colWidths[0];
        doc.text(activity.name, xPosition, yPosition);
        xPosition += colWidths[1];

        if (options.includeDates) {
          doc.text(activity.startDate, xPosition, yPosition);
          xPosition += colWidths[2];
          doc.text(activity.endDate, xPosition, yPosition);
          xPosition += colWidths[3];
        }
        if (options.includeStatus) {
          doc.text(activity.status, xPosition, yPosition);
          xPosition += colWidths[options.includeDates ? 4 : 2];
        }
        if (options.includeDescription) {
          const description = activity.description || 'No description';
          doc.text(description.length > 30 ? description.substring(0, 30) + '...' : description, xPosition, yPosition);
        }
        yPosition += 8;
      });
    } else if (options.layout === 'timeline') {
      // Timeline layout
      const sortedActivities = [...activities].sort((a, b) => 
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      );

      sortedActivities.forEach((activity, index) => {
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${activity.name}`, margin, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        if (options.includeDates) {
          doc.text(`📅 ${activity.startDate} - ${activity.endDate}`, margin + 10, yPosition);
          yPosition += 6;
        }
        if (options.includeStatus) {
          doc.text(`📊 Status: ${activity.status}`, margin + 10, yPosition);
          yPosition += 6;
        }
        if (options.includeDescription && activity.description) {
          const lines = doc.splitTextToSize(activity.description, pageWidth - 2 * margin - 20);
          doc.text(`📝 ${lines[0]}`, margin + 10, yPosition);
          yPosition += 6;
          if (lines.length > 1) {
            doc.text(lines.slice(1).join(' '), margin + 20, yPosition);
            yPosition += 6;
          }
        }
        yPosition += 8;
      });
    } else {
      // List layout (default)
      activities.forEach((activity, index) => {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${activity.name}`, margin, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        if (options.includeDates) {
          doc.text(`Start: ${activity.startDate} | End: ${activity.endDate}`, margin + 10, yPosition);
          yPosition += 6;
        }
        if (options.includeStatus) {
          doc.text(`Status: ${activity.status}`, margin + 10, yPosition);
          yPosition += 6;
        }
        if (options.includeDescription && activity.description) {
          doc.text(`Description: ${activity.description}`, margin + 10, yPosition);
          yPosition += 6;
        }
        yPosition += 8;
      });
    }

    // Footer
    if (options.includeFooter) {
      const footerText = `Generated on ${new Date().toLocaleDateString()} | Total Activities: ${activities.length}`;
      doc.setFontSize(8);
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    const fileName = timelineConfig 
      ? `${timelineConfig.name}_timeline.pdf`
      : 'journey_timeline.pdf';
    doc.save(fileName);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-2xl p-3 shadow-sm hover:shadow-md transition"
        style={{ 
          backgroundColor: colors.activityBoxBackground,
          color: colors.activityBoxText,
          border: `1px solid ${colors.activityBoxText}`
        }}
        title="Export to PDF"
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div 
            className="rounded-2xl shadow-2xl p-8 w-96 animate-fadeIn"
            style={{ backgroundColor: colors.modalBackground, border: `1px solid ${colors.activityBoxText}` }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>PDF Export Options</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Layout Options */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.activityBoxText }}>Layout</label>
                <select
                  value={options.layout}
                  onChange={(e) => setOptions({ ...options, layout: e.target.value as any })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="list">List</option>
                  <option value="table">Table</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.activityBoxText }}>Font Size</label>
                <select
                  value={options.fontSize}
                  onChange={(e) => setOptions({ ...options, fontSize: e.target.value as any })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              {/* Content Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: colors.activityBoxText }}>Include</label>
                <div className="space-y-2">
                  {[
                    { key: 'includeDescription', label: 'Descriptions' },
                    { key: 'includeStatus', label: 'Status' },
                    { key: 'includeDates', label: 'Dates' },
                    { key: 'includeHeader', label: 'Header' },
                    { key: 'includeFooter', label: 'Footer' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={options[key as keyof PDFOptions] as boolean}
                        onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm" style={{ color: colors.activityBoxText }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={exportToPDF}
                className="flex-1 p-2 rounded-2xl transition-colors text-sm"
                style={{ 
                  backgroundColor: colors.activityBoxText,
                  color: colors.activityBoxBackground
                }}
              >
                Export PDF
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-2xl transition-colors text-sm"
                style={{ 
                  backgroundColor: colors.activityBoxBackground,
                  color: colors.activityBoxText,
                  border: `1px solid ${colors.activityBoxText}`
                }}
              >
                Cancel
              </button>
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