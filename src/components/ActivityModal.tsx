import React from "react";
import { Activity } from "../app/page";
import { useColors } from "../context/ColorContext";

type ActivityModalProps = {
  activity: Activity;
  onClose: () => void;
};

export default function ActivityModal({ activity, onClose }: ActivityModalProps) {
  const { colors } = useColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div 
        className="rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn"
        style={{ backgroundColor: colors.modalBackground }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{activity.name}</h2>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Description:</span> {activity.description || <span className="italic text-gray-400">No description</span>}
        </div>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Start Date:</span> {activity.startDate}
        </div>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">End Date:</span> {activity.endDate}
        </div>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Status:</span> {activity.status}
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
  );
} 