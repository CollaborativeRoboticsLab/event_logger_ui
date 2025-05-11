import React, { useRef, useState } from "react";
import "./ResizablePanel.css";

function ResizablePanel({ topContent, bottomContent, minHeight = 100, defaultHeight = 200 }) {
    const containerRef = useRef(null);
    const [panelHeight, setPanelHeight] = useState(defaultHeight);
    const isDragging = useRef(false);

    const startDragging = (e) => {
        isDragging.current = true;
        e.preventDefault();
    };

    const stopDragging = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current || !containerRef.current) return;
        const containerTop = containerRef.current.getBoundingClientRect().top;
        const newHeight = containerRef.current.clientHeight - (e.clientY - containerTop);
        setPanelHeight(Math.max(minHeight, newHeight));
    };

    return (
        <div
            className="resizable-container"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
        >
            <div className="resizable-top" style={{ height: `calc(100% - ${panelHeight}px)` }}>
                {topContent}
            </div>
            <div className="resize-handle" onMouseDown={startDragging} />
            <div className="resizable-bottom" style={{ height: `${panelHeight}px` }}>
                {bottomContent}
            </div>
        </div>
    );
}

export default ResizablePanel;
