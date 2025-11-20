import { useDroppable } from '@dnd-kit/core';
import React from 'react'

const DroppableColumn = ({ id, children }) => {
    const { setNodeRef } = useDroppable({
        id,
    });

    return (
        <div ref={setNodeRef} className="w-full">
            {children}
        </div>
    );
}

export default DroppableColumn