import React, { useState } from "react";
import { X } from "lucide-react";
import { users } from "../data/users";

const labelColors = {
    Research: "bg-blue-100 text-blue-600",
    Development: "bg-green-100 text-green-700",
    Bug: "bg-red-100 text-red-600",
    UIUX: "bg-pink-100 text-pink-600",
    Ideas: "bg-purple-100 text-purple-600",
    Review: "bg-orange-100 text-orange-600",
    API: "bg-teal-100 text-teal-700",
    Design: "bg-indigo-100 text-indigo-700",
    Copywriting: "bg-yellow-100 text-yellow-700",
};

const priorityColors = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
};

export default function AddTaskModal({ isOpen, onClose, columns, setColumns }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        label: "Research",
        priority: "medium",
        assignedTo: "",
        column: "todo",
        due: "",       // ⭐ NEW FIELD
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAddTask = () => {
        if (!form.title.trim()) return alert("Task title is required!");
        if (!form.assignedTo) return alert("Please assign the task to a user.");

        const newTask = {
            id: Date.now(), // Unique ID
            title: form.title,
            description: form.description,
            label: form.label,
            labelColor: labelColors[form.label] || "bg-gray-200 text-gray-700",
            priority: form.priority,
            priorityColor: priorityColors[form.priority],
            assignedTo: Number(form.assignedTo),
            due: form.due || null,             // ⭐ SAVE DATE
            comments: 0,
            likes: 0,
            avatars: [], // legacy field
        };

        const updated = { ...columns };
        updated[form.column].tasks.push(newTask);
        setColumns(updated);

        // Reset form
        setForm({
            title: "",
            description: "",
            label: "Research",
            priority: "medium",
            assignedTo: "",
            column: "todo",
            due: "",
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl shadow-xl relative flex flex-col">

                {/* Close Button */}
                <button
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    <X size={22} />
                </button>

                {/* Header */}
                <div className="p-6 pb-3">
                    <h2 className="text-xl font-jakarta font-semibold text-gray-800">
                        Add New Task
                    </h2>
                </div>

                {/* ⭐ Scrollable Body */}
                <div className="px-6 pb-4 overflow-y-auto flex-1 space-y-4">

                    {/* Title */}
                    <div>
                        <label className="text-sm font-inter text-gray-700">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 
                                   focus:ring-2 focus:ring-purple-400 outline-none"
                            placeholder="Enter task title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-inter text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 
                                   focus:ring-2 focus:ring-purple-400 outline-none"
                            placeholder="Task description"
                            rows="3"
                        />
                    </div>

                    {/* Label */}
                    <div>
                        <label className="text-sm font-inter text-gray-700">Label</label>
                        <select
                            name="label"
                            value={form.label}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50"
                        >
                            {Object.keys(labelColors).map((lbl) => (
                                <option key={lbl} value={lbl}>
                                    {lbl}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="text-sm font-inter text-gray-700">Priority</label>
                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50"
                        >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    {/* Assigned User */}
                    <div>
                        <label className="text-sm font-inter text-gray-700">Assign To</label>
                        <select
                            name="assignedTo"
                            value={form.assignedTo}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50"
                        >
                            <option value="">Select user</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ⭐ Due Date */}
                    <div>
                        <label className="text-sm font-inter text-gray-700">Due Date</label>
                        <input
                            type="date"
                            name="due"
                            value={form.due}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-400 outline-none"
                        />
                    </div>

                    {/* Column */}
                    <div>
                        <label className="text-sm font-inter text-gray-700">Column</label>
                        <select
                            name="column"
                            value={form.column}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50"
                        >
                            {Object.keys(columns).map((col) => (
                                <option key={col} value={col}>
                                    {columns[col].title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ⭐ Footer Buttons (fixed) */}
                <div className="p-4 border-t bg-white flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border text-gray-700"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleAddTask}
                        className="px-5 py-2 rounded-xl bg-purple-600 text-white shadow-md hover:bg-purple-700"
                    >
                        Add Task
                    </button>
                </div>
            </div>
        </div>
    );

}
