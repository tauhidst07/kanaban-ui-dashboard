import { useSortable } from '@dnd-kit/sortable';
import React from 'react'
import { taskId } from '../utils/helper.js';
import { Heart, MessageSquare } from 'lucide-react'; 
import { CSS } from "@dnd-kit/utilities";
import { users } from '../data/users.js';

const SortableTask = ({task}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: taskId(task.id) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : "auto",
    };

    //  FIND ASSIGNED USER (based on assignedTo field)
    const assignedUser = users.find((u) => u.id === task.assignedTo);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-move border border-gray-200 hover:-translate-y-1"
        >
            {/* TASK LABEL + PRIORITY DOT */}
            <div className="flex items-center justify-between mb-3">
                <span
                    className={`text-xs px-3 py-1.5 rounded-full font-inter font-semibold ${task.labelColor}`}
                >
                    {task.label}
                </span>
                <span className={`w-2 h-2 rounded-full ${task.priorityColor}`}></span>
            </div>

            {/* TITLE */}
            <h3 className="font-inter text-gray-800 font-semibold text-[15px] leading-snug mb-2">
                {task.title}
            </h3>

            {/* DESCRIPTION */}
            <p className="font-inter text-gray-500 text-sm leading-relaxed mb-4">
                {task.description}
            </p>

            <div className="flex items-center justify-between">

                {/* ASSIGNED USER AVATAR */}
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

                {/* COMMENTS + LIKES */}
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1">
                        <MessageSquare size={16} />
                        <span className="text-sm font-inter">{task.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart size={16} />
                        <span className="text-sm font-inter">{task.likes}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default SortableTask