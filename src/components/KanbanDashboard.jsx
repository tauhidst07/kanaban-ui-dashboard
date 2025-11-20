import React, { useMemo, useState } from "react";
import {
    Search,
    Plus,
    Share2,
    ChevronDown,
    MessageSquare,
    Heart,
    Sparkles,
    Crown,
} from "lucide-react";
import Sidebar from "./Sidebar.jsx";

import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    closestCenter,
    DragOverlay,
    MeasuringStrategy,
    TouchSensor,
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { users } from "../data/users.js";
import { initialColumns } from "../data/kanabanData.js";
import AddTaskModal from "./AddTaskModal.jsx";
import { columnId, parseColumnId, parseTaskId, taskId } from "../utils/helper.js";
import DroppableColumn from "./DroppableColumn.jsx";
import SortableTask from "./SortableTask.jsx";


const KanbanDashboard = () => {

    const [columns, setColumns] = useState(initialColumns)
    const filters = [
        "All",
        "Development",
        "Research",
        "Bug",
        "Ideas",
        "Design",
        "Maintenance",
        "Frontend",
        "Backend",

    ];

    /* -------------------------
       DnD Kit sensors
    --------------------------- */
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // user must move 5px before drag begins
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 120,
                tolerance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const [activeDragId, setActiveDragId] = useState(null);

    /* -------------------------
      onDragEnd: reorder or move between columns
    --------------------------- */
    const onDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragId(null);

        // nothing to do
        if (!over) return;

        const activeTaskNumericId = parseTaskId(active.id);
        const overTaskNumericId = parseTaskId(over.id);
        const overColumnKey = parseColumnId(over.id);

        // find source and target column keys
        let sourceKey = null;
        let targetKey = null;
        Object.entries(columns).forEach(([k, col]) => {
            if (col.tasks.some((t) => t.id === activeTaskNumericId)) sourceKey = k;
            if (overTaskNumericId != null && col.tasks.some((t) => t.id === overTaskNumericId))
                targetKey = k;
            if (overColumnKey === k) targetKey = k;
        });

        if (!sourceKey || !targetKey) return;

        // If same column -> reorder
        if (sourceKey === targetKey && overTaskNumericId != null) {
            const col = columns[sourceKey];
            const oldIndex = col.tasks.findIndex((t) => t.id === activeTaskNumericId);
            const newIndex = col.tasks.findIndex((t) => t.id === overTaskNumericId);
            if (oldIndex !== -1 && newIndex !== -1) {
                const updated = { ...columns };
                updated[sourceKey] = {
                    ...updated[sourceKey],
                    tasks: arrayMove(updated[sourceKey].tasks, oldIndex, newIndex),
                };
                setColumns(updated);
            }
            return;
        }

        // Moving to a different column
        const updated = { ...columns };
        // remove from source
        const movingTask = updated[sourceKey].tasks.find((t) => t.id === activeTaskNumericId);
        updated[sourceKey].tasks = updated[sourceKey].tasks.filter((t) => t.id !== activeTaskNumericId);

        // if dropped onto a task in target column -> insert before its index
        if (overTaskNumericId != null) {
            const index = updated[targetKey].tasks.findIndex((t) => t.id === overTaskNumericId);
            updated[targetKey].tasks = [
                ...updated[targetKey].tasks.slice(0, index),
                movingTask,
                ...updated[targetKey].tasks.slice(index),
            ];
        } else {
            // dropped onto column (empty or end) -> push to end
            updated[targetKey].tasks = [...updated[targetKey].tasks, movingTask];
        }

        setColumns(updated);
    };

    const onDragStart = (event) => {
        setActiveDragId(event.active.id);
    };

    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddTask, setShowAddTask] = useState(false);
    const [prioritySort, setPrioritySort] = useState("");

    const filteredColumns = useMemo(() => {
        // Deep clone so drag-and-drop state isn't mutated
        const updated = JSON.parse(JSON.stringify(columns));

        // helper to normalize priority
        const norm = (p) =>
            (p || "").toString().trim().toLowerCase();

        // base priority scores (used for default descending: high->low)
        const baseScore = { high: 3, medium: 2, low: 1 };

        Object.keys(updated).forEach((colKey) => {
            let tasks = updated[colKey].tasks || [];

            tasks = tasks.slice();

            // SEARCH FILTER (title + description)
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                tasks = tasks.filter(
                    (t) =>
                        (t.title || "").toLowerCase().includes(q) ||
                        (t.description || "").toLowerCase().includes(q)
                );
            }

            // LABEL FILTER
            if (activeFilter && activeFilter !== "All") {
                tasks = tasks.filter((t) => t.label === activeFilter);
            }

            // PRIORITY SORT / ORDER
            // prioritySort expected values: "high", "medium", "low", or "" (no sort)
            if (prioritySort) {
                const sel = prioritySort.toString().toLowerCase();

                // create a mapping depending on which option user selected
                // the higher the number => comes first when sorting descending
                let orderMap;
                if (sel === "high") {
                    orderMap = { high: 3, medium: 2, low: 1 };
                } else if (sel === "medium") {
                    // medium first, then high, then low
                    orderMap = { medium: 3, high: 2, low: 1 };
                } else if (sel === "low") {
                    // low first (ascending by base), we'll invert when comparing
                    // use low highest score to put it first when descending
                    orderMap = { low: 3, medium: 2, high: 1 };
                } else {
                    // fallback to default
                    orderMap = baseScore;
                }

                tasks.sort((a, b) => {
                    const pa = norm(a.priority);
                    const pb = norm(b.priority);

                    const sa = orderMap[pa] || 0;
                    const sb = orderMap[pb] || 0;

                    // descending so higher score comes first
                    if (sb === sa) {
                        return (a.title || "").localeCompare(b.title || "");
                    }
                    return sb - sa;
                });
            }

            updated[colKey].tasks = tasks;
        });

        return updated;
    }, [columns, activeFilter, searchQuery, prioritySort]);




    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        >
            <div className="flex h-screen bg-linear-to-br from-gray-50 to-blue-50 font-inter ">
                <Sidebar />
                {/* MAIN WRAPPER */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* HEADER */}
                    <div className="bg-white border-b border-gray-200 p-4 shadow-sm">

                        {/* TOP BAR */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-jakarta font-semibold text-gray-800 flex items-center gap-1.5">
                                    Kanban Dashboard
                                    <Sparkles size={22} className="text-purple-500" />
                                </h1>
                                <p className="font-inter text-gray-500 text-sm mt-0.5">
                                    Manage your workflow efficiently
                                </p>
                            </div>

                            <div className="flex items-center">
                                <button
                                    onClick={() => setShowAddTask(true)}
                                    className="px-3.5 py-2 rounded-xl bg-linear-to-r from-purple-500 to-blue-500 
                           text-white font-inter font-medium shadow-md hover:shadow-lg 
                           transition-all flex items-center gap-1.5"
                                >
                                    <Plus size={17} />
                                    Add Task
                                </button>
                            </div>
                        </div>

                        {/* FILTER BAR */}
                        <div className="flex items-center justify-between gap-3">

                            {/* SEARCH */}
                            <div className="relative w-60">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={16}
                                />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 
                           text-sm font-inter focus:ring-2 focus:ring-purple-300 outline-none"
                                />
                            </div>

                            {/* PRIORITY SORT */}
                            <select
                                value={prioritySort}
                                onChange={(e) => setPrioritySort(e.target.value)}
                                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 border border-gray-200 
                       text-sm font-inter focus:ring-2 focus:ring-purple-300 outline-none"
                            >
                                <option value="">Sort by Priority</option>
                                <option value="high">High Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="low">Low Priority</option>
                            </select>

                            {/* FILTER BUTTONS */}
                            <div className="flex gap-2">
                                {filters.map((filter, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveFilter(filter)}
                                        className={`cursor-pointer px-3.5 py-2 rounded-xl font-inter text-sm transition-all ${activeFilter === filter
                                            ? "bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-md"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* KANBAN BOARD */}
                    <div className="flex-1 overflow-x-auto p-6">
                        <div className="flex gap-6 w-full h-full">

                            {Object.entries(filteredColumns).map(([key, column]) => {
                                const items = column.tasks.map((t) => taskId(t.id));

                                return (
                                    <div
                                        key={key}
                                        className="flex-1 min-w-[16rem] max-w-[18rem] flex flex-col h-full"
                                    >
                                        {/* COLUMN HEADER */}
                                        <div className="flex items-center mb-4">
                                            <div
                                                className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-r ${column.color} text-white font-jakarta font-semibold shadow-md`}
                                            >
                                                <span className="bg-white/30 px-2 py-0.5 rounded-full text-sm">
                                                    {column.tasks.length}
                                                </span>
                                                <span>{column.title}</span>
                                            </div>
                                        </div>

                                        {/* DROPPABLE AREA */}
                                        <DroppableColumn id={columnId(key)}>
                                            <SortableContext items={items} strategy={rectSortingStrategy}>
                                                <div
                                                    className={`
                                            overflow-y-auto hide-scrollbar space-y-4 
                                            rounded-2xl p-4 border-2 transition-all 
                                            h-[calc(100vh-250px)] mb-4
                                            ${column.borderColor} ${column.bgColor}
                                            ${column.tasks.length === 0 ? "flex items-center justify-center" : ""}
                                        `}
                                                >
                                                    {column.tasks.length === 0 ? (
                                                        <div className="text-sm text-gray-400">No tasks — drop here</div>
                                                    ) : (
                                                        column.tasks.map((task) => (
                                                            <SortableTask key={task.id} task={task} columnKey={key} />
                                                        ))
                                                    )}
                                                </div>
                                            </SortableContext>
                                        </DroppableColumn>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* DRAG OVERLAY */}
                <DragOverlay>
                    {activeDragId ? (
                        // find task data for overlay
                        (() => {
                            const tid = parseTaskId(activeDragId);
                            let found = null;
                            let assignedUser = null;
                            Object.values(columns).some((col) =>
                                col.tasks.some((t) => {
                                    if (t.id === tid) {
                                        found = t;
                                        assignedUser = users.find((u) => u.id === found.assignedTo);
                                        console.log("found in overlay: ", found);
                                        console.log("assignes user: ", assignedUser);
                                        return true;
                                    }
                                    return false;
                                })
                            );
                            return found ? (
                                <div className="w-80">
                                    <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-xs px-3 py-1.5 rounded-full ${found.labelColor}`}>
                                                {found.label}
                                            </span>
                                            <span className={`w-2 h-2 rounded-full ${found.priorityColor}`}></span>
                                        </div>

                                        <h3 className="font-inter text-gray-800 font-semibold text-[15px] leading-snug mb-2">
                                            {found.title}
                                        </h3>

                                        <p className="font-inter text-gray-500 text-sm leading-relaxed mb-4">
                                            {found.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center -space-x-2">
                                                {assignedUser ? (
                                                    <img
                                                        src={assignedUser.avatar}
                                                        alt={assignedUser.name}
                                                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare size={16} />
                                                    <span className="text-sm font-inter">{found.comments}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Heart size={16} />
                                                    <span className="text-sm font-inter">{found.likes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null;
                        })()
                    ) : null}
                </DragOverlay>

                {showAddTask && (
                    <AddTaskModal
                        isOpen={showAddTask}
                        onClose={() => setShowAddTask(false)}
                        columns={columns}
                        setColumns={setColumns}
                    />
                )}
            </div>

        </DndContext>
    );
};

export default KanbanDashboard;
