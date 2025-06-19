"use client";

import React, { useState, useRef } from 'react';
import { useColors } from '../context/ColorContext';
import { Activity } from '../app/page';

type FileImportProps = {
  onImport: (activities: Omit<Activity, 'id'>[]) => void;
};

type ImportPreview = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  isValid: boolean;
  errors: string[];
};

export default function FileImport({ onImport }: FileImportProps) {
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateActivity = (data: any): ImportPreview => {
    const errors: string[] = [];
    
    // Check required fields
    if (!data.name || data.name.trim() === '') {
      errors.push('Name is required');
    }
    if (!data.startDate || data.startDate.trim() === '') {
      errors.push('Start Date is required');
    }
    if (!data.endDate || data.endDate.trim() === '') {
      errors.push('End Date is required');
    }

    // Validate dates
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid Start Date format');
      }
      if (isNaN(endDate.getTime())) {
        errors.push('Invalid End Date format');
      }
      if (startDate > endDate) {
        errors.push('Start Date cannot be after End Date');
      }
    }

    // Validate status
    const validStatuses = ['Planned', 'In Progress', 'Completed'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.push('Status must be one of: Planned, In Progress, Completed');
    }

    return {
      name: data.name || '',
      description: data.description || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      status: data.status || 'Planned',
      isValid: errors.length === 0,
      errors,
    };
  };

  const parseCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const Papa = require('papaparse');
          const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
          resolve(result.data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseExcel = async (file: File): Promise<any[]> => {
    const XLSX = await import('xlsx');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        data = await parseCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await parseExcel(file);
      } else {
        throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
      }

      // Map column names to expected format
      const mappedData = data.map(row => {
        const mapped: any = {};
        
        // Try different possible column names
        mapped.name = row.name || row.Name || row.NAME || row['Activity Name'] || row['Activity'] || '';
        mapped.description = row.description || row.Description || row.DESC || row['Activity Description'] || '';
        mapped.startDate = row.startDate || row['Start Date'] || row['start_date'] || row['StartDate'] || '';
        mapped.endDate = row.endDate || row['End Date'] || row['end_date'] || row['EndDate'] || '';
        mapped.status = row.status || row.Status || row['Activity Status'] || 'Planned';

        return mapped;
      });

      // Validate and create preview
      const preview = mappedData.map(validateActivity);
      setPreviewData(preview);
      
    } catch (error) {
      alert('Error reading file: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    const validActivities = previewData
      .filter(item => item.isValid)
      .map(item => ({
        name: item.name,
        description: item.description,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status,
      }));

    if (validActivities.length === 0) {
      alert('No valid activities to import');
      return;
    }

    onImport(validActivities);
    setIsOpen(false);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Sample Activity 1',
        description: 'This is a sample activity description',
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        status: 'Planned'
      },
      {
        name: 'Sample Activity 2',
        description: 'Another sample activity',
        startDate: '2024-01-16',
        endDate: '2024-01-31',
        status: 'In Progress'
      }
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'name,description,startDate,endDate,status\n' +
      template.map(row => Object.values(row).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'timeline_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow"
        style={{ 
          backgroundColor: colors.activityBoxBackground,
          color: colors.activityBoxText 
        }}
        title="Import Activities"
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
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div 
            className="rounded-2xl shadow-2xl p-8 w-[800px] max-h-[80vh] overflow-y-auto animate-fadeIn"
            style={{ backgroundColor: colors.modalBackground }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>Import Activities</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* File Upload Section */}
              <div>
                <h4 className="font-medium mb-3" style={{ color: colors.activityBoxText }}>Upload File</h4>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="w-full p-2 rounded-lg border border-gray-300"
                    disabled={isLoading}
                  />
                  {isLoading && (
                    <div className="text-sm" style={{ color: colors.activityBoxText }}>
                      Processing file...
                    </div>
                  )}
                  <button
                    onClick={downloadTemplate}
                    className="text-sm underline"
                    style={{ color: colors.activityBoxText }}
                  >
                    Download CSV Template
                  </button>
                </div>
              </div>

              {/* Preview Section */}
              {previewData.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3" style={{ color: colors.activityBoxText }}>
                    Preview ({previewData.filter(item => item.isValid).length} valid, {previewData.filter(item => !item.isValid).length} invalid)
                  </h4>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0" style={{ backgroundColor: colors.activityBoxBackground }}>
                        <tr>
                          <th className="p-2 text-left" style={{ color: colors.activityBoxText }}>Name</th>
                          <th className="p-2 text-left" style={{ color: colors.activityBoxText }}>Description</th>
                          <th className="p-2 text-left" style={{ color: colors.activityBoxText }}>Start Date</th>
                          <th className="p-2 text-left" style={{ color: colors.activityBoxText }}>End Date</th>
                          <th className="p-2 text-left" style={{ color: colors.activityBoxText }}>Status</th>
                          <th className="p-2 text-left" style={{ color: colors.activityBoxText }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((item, index) => (
                          <tr 
                            key={index} 
                            className={item.isValid ? '' : 'bg-red-50'}
                            style={{ 
                              backgroundColor: item.isValid ? 'transparent' : 'rgba(254, 226, 226, 0.5)'
                            }}
                          >
                            <td className="p-2" style={{ color: colors.activityBoxText }}>{item.name}</td>
                            <td className="p-2" style={{ color: colors.activityBoxText }}>{item.description}</td>
                            <td className="p-2" style={{ color: colors.activityBoxText }}>{item.startDate}</td>
                            <td className="p-2" style={{ color: colors.activityBoxText }}>{item.endDate}</td>
                            <td className="p-2" style={{ color: colors.activityBoxText }}>{item.status}</td>
                            <td className="p-2">
                              {item.isValid ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600 text-xs" title={item.errors.join(', ')}>✗</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Button */}
              {previewData.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={handleImport}
                    disabled={previewData.filter(item => item.isValid).length === 0}
                    className="flex-1 p-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                    style={{ 
                      backgroundColor: colors.activityBoxText,
                      color: colors.activityBoxBackground
                    }}
                  >
                    Import {previewData.filter(item => item.isValid).length} Activities
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg transition-colors text-sm"
                    style={{ 
                      backgroundColor: colors.activityBoxBackground,
                      color: colors.activityBoxText,
                      border: `1px solid ${colors.activityBoxText}`
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
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