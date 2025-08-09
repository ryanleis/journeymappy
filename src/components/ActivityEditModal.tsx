"use client";

import React, { useState, useEffect } from "react";
import { Activity } from "../app/page";
import { useColors } from "../context/ColorContext";

type ActivityEditModalProps = {
  activity: Activity;
  onClose: () => void;
  onSave: (activity: Activity) => void;
};

export default function ActivityEditModal({ activity, onClose, onSave }: ActivityEditModalProps) {
  const { colors } = useColors();
  const [formData, setFormData] = useState({
    name: activity.name,
    description: activity.description,
    startDate: activity.startDate,
    endDate: activity.endDate,
    status: activity.status,
  });

  useEffect(() => {
    setFormData({
      name: activity.name,
      description: activity.description,
      startDate: activity.startDate,
      endDate: activity.endDate,
      status: activity.status,
    });
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields (name, start date, and end date).");
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert("Start date cannot be after end date.");
      return;
    }

    const updatedActivity: Activity = {
      ...activity,
      ...formData,
    };

    onSave(updatedActivity);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div 
        className="rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.modalBackground, border: `1px solid ${colors.activityBoxText}` }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold mb-6" style={{ color: colors.activityBoxText }}>
          Edit Activity
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.activityBoxText }}>
              Activity Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                backgroundColor: colors.formBackground,
                color: colors.activityBoxText,
                borderColor: colors.activityBoxText,
                caretColor: colors.activityBoxText 
              }}
              placeholder="Enter activity name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.activityBoxText }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              style={{ 
                backgroundColor: colors.formBackground,
                color: colors.activityBoxText,
                borderColor: colors.activityBoxText,
                caretColor: colors.activityBoxText 
              }}
              placeholder="Enter activity description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.activityBoxText }}>
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.formBackground,
                  color: colors.activityBoxText,
                  borderColor: colors.activityBoxText,
                  caretColor: colors.activityBoxText 
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.activityBoxText }}>
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: colors.formBackground,
                  color: colors.activityBoxText,
                  borderColor: colors.activityBoxText,
                  caretColor: colors.activityBoxText 
                }}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.activityBoxText }}>
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                backgroundColor: colors.formBackground,
                color: colors.activityBoxText,
                borderColor: colors.activityBoxText 
              }}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 p-3 rounded-full transition-colors text-sm font-medium"
              style={{ 
                backgroundColor: '#10b981',
                color: 'white'
              }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 rounded-2xl transition-colors text-sm font-medium"
              style={{ 
                backgroundColor: colors.activityBoxBackground,
                color: colors.activityBoxText,
                border: `1px solid ${colors.activityBoxText}`
              }}
            >
              Cancel
            </button>
          </div>
        </form>
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
  );
}