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
      className="rounded-xl shadow-lg p-6 flex flex-col gap-4"
      style={{ backgroundColor: colors.formBackground }}
    >
      <div>
        <label className="block text-gray-700 font-medium mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 font-medium mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Planned</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>
      <button
        type="submit"
        className="mt-2 bg-blue-600 text-white rounded-md px-4 py-2 font-semibold shadow hover:bg-blue-700 transition"
      >
        Add Activity
      </button>
    </form>
  );
} 