import React from "react";
import { Activity } from "../app/page";
import { useColors } from "../context/ColorContext";

type ActivityModalProps = {
  activity: Activity;
  onClose: () => void;
  onDelete: (activityId: string) => void;
  onEdit: (activity: Activity) => void;
};

export default function ActivityModal({ activity, onClose, onDelete, onEdit }: ActivityModalProps) {
  const { colors } = useColors();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${activity.name}"? This action cannot be undone.`)) {
      onDelete(activity.id);
      onClose();
    }
  };

  const handleEdit = () => {
    onEdit(activity);
    onClose();
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
        
        <h2 className="text-2xl font-bold mb-4" style={{ color: colors.activityBoxText }}>{activity.name}</h2>
        
        <div className="space-y-3 mb-6">
          <div style={{ color: colors.activityBoxText }}>
            <span className="font-semibold">Description:</span> {activity.description || <span className="italic text-gray-400">No description</span>}
          </div>
          <div style={{ color: colors.activityBoxText }}>
            <span className="font-semibold">Start Date:</span> {activity.startDate}
          </div>
          <div style={{ color: colors.activityBoxText }}>
            <span className="font-semibold">End Date:</span> {activity.endDate}
          </div>
          <div style={{ color: colors.activityBoxText }}>
            <span className="font-semibold">Status:</span> {activity.status}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleEdit}
            className="flex-1 p-3 rounded-2xl transition-colors text-sm font-medium shadow-sm"
            style={{ 
              backgroundColor: '#3b82f6',
              color: 'white'
            }}
          >
            Edit Activity
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 p-3 rounded-2xl transition-colors text-sm font-medium shadow-sm"
            style={{ 
              backgroundColor: '#ef4444',
              color: 'white'
            }}
          >
            Delete Activity
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-3 p-3 rounded-2xl transition-colors text-sm font-medium"
          style={{ 
            backgroundColor: colors.activityBoxBackground,
            color: colors.activityBoxText,
            border: `1px solid ${colors.activityBoxText}`
          }}
        >
          Close
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
  );
}