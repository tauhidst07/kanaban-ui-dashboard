export const taskId = (id) => `task-${id}`;
export const parseTaskId = (dndId) =>
    typeof dndId === "string" && dndId.startsWith("task-")
        ? Number(dndId.replace("task-", ""))
        : null;

export const columnId = (key) => `column-${key}`;
export const parseColumnId = (dndId) =>
    typeof dndId === "string" && dndId.startsWith("column-")
        ? dndId.replace("column-", "")
        : null;
