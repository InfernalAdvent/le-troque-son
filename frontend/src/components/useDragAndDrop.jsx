import { useState } from 'react';

export function useDragAndDrop(photos, newPhotos, onReorder) {
    const [draggedIndex, setDraggedIndex] = useState(null);

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (index) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const allPhotos = [...photos, ...newPhotos];
        const newPhotosArray = [...allPhotos];
        const draggedPhoto = newPhotosArray[draggedIndex];

        newPhotosArray.splice(draggedIndex, 1);
        newPhotosArray.splice(index, 0, draggedPhoto);

        setDraggedIndex(null);

        // Callback pour notifier le parent du changement
        if (onReorder) {
            onReorder(newPhotosArray);
        }
    };

    return {
        draggedIndex,
        handleDragStart,
        handleDragOver,
        handleDrop
    };
}