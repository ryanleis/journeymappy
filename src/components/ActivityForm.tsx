import React, { useState } from "react";
import { Activity } from "../app/page";
import { useColors } from "../context/ColorContext";

type ActivityFormProps = {
  onAdd: (activity: Omit<Activity, "id">) => void;
};

const initialState = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "Planned",
};

export default function ActivityForm({ onAdd }: ActivityFormProps) {
  const [form, setForm] = useState(initialState);
  const { colors } = useColors();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return;
    onAdd(form);
    setForm(initialState);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="rounded-2xl shadow-sm p-6 flex flex-col gap-4 border"
      style={{ backgroundColor: colors.formBackground, borderColor: colors.activityBoxText }}
    >
      <div>
        <label className="block font-medium mb-1" style={{ color: colors.activityBoxText }}>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: colors.formBackground, color: colors.activityBoxText, borderColor: colors.activityBoxText, caretColor: colors.activityBoxText }}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1" style={{ color: colors.activityBoxText }}>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: colors.formBackground, color: colors.activityBoxText, borderColor: colors.activityBoxText, caretColor: colors.activityBoxText }}
          rows={2}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium mb-1" style={{ color: colors.activityBoxText }}>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: colors.formBackground, color: colors.activityBoxText, borderColor: colors.activityBoxText, caretColor: colors.activityBoxText }}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1" style={{ color: colors.activityBoxText }}>End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ backgroundColor: colors.formBackground, color: colors.activityBoxText, borderColor: colors.activityBoxText, caretColor: colors.activityBoxText }}
            required
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1" style={{ color: colors.activityBoxText }}>Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: colors.formBackground, color: colors.activityBoxText, borderColor: colors.activityBoxText }}
        >
          <option>Planned</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>
      <button
        type="submit"
        className="mt-2 rounded-full px-5 py-2 font-semibold shadow-sm hover:shadow-md transition"
        style={{ backgroundColor: '#007aff', color: 'white' }}
      >
        Add Activity
      </button>
    </form>
  );
}