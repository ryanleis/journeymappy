"use client";

import React, { useState } from 'react';
import { useColors } from '../context/ColorContext';
import { Activity } from '../app/page';
import type { TimelineConfig } from './TimelineSetup';

type ActivityFilterProps = {
  activities: Activity[];
  currentTimeline: TimelineConfig | null;
  onFilterChange: (filteredActivities: Activity[]) => void;
};

export default function ActivityFilter({ activities, currentTimeline, onFilterChange }: ActivityFilterProps) {
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchTerm: '',
  });

  const statusOptions = ['all', 'Planned', 'In Progress', 'Completed'];
  const dateRangeOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
  ];

  const applyFilters = () => {
    let filtered = [...activities];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(activity => activity.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.endDate);
        
        switch (filters.dateRange) {
          case 'today':
            return activityDate.getTime() === today.getTime();
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return activityDate >= weekStart && activityDate <= weekEnd;
          case 'month':
            return activityDate.getMonth() === today.getMonth() && 
                   activityDate.getFullYear() === today.getFullYear();
          case 'quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
            const quarterEnd = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
            return activityDate >= quarterStart && activityDate <= quarterEnd;
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.name.toLowerCase().includes(searchLower) ||
        activity.description.toLowerCase().includes(searchLower)
      );
    }

    onFilterChange(filtered);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all',
      searchTerm: '',
    });
    onFilterChange(activities);
  };

  React.useEffect(() => {
    applyFilters();
  }, [filters, activities]);

  return (
    <div className="fixed top-4 left-4 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow"
        style={{ 
          backgroundColor: colors.activityBoxBackground,
          color: colors.activityBoxText 
        }}
        title="Filter Activities"
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
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
          />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute top-16 left-0 rounded-xl shadow-2xl p-6 w-80 animate-slideDown"
          style={{ backgroundColor: colors.modalBackground }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold" style={{ color: colors.activityBoxText }}>Filter Activities</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            >
              ×
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: colors.activityBoxText }}>Search</label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              placeholder="Search activities..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="mb-4">
            <label className="block text-sm mb-1" style={{ color: colors.activityBoxText }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="mb-6">
            <label className="block text-sm mb-1" style={{ color: colors.activityBoxText }}>Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dateRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full p-2 rounded-lg transition-colors text-sm"
            style={{ 
              backgroundColor: colors.activityBoxBackground,
              color: colors.activityBoxText,
              border: `1px solid ${colors.activityBoxText}`
            }}
          >
            Clear All Filters
          </button>

          <style jsx>{`
            @keyframes slideDown {
              from { transform: translateY(-10px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-slideDown {
              animation: slideDown 0.2s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
} 