import React from "react";
import "./SessionControl.css";

function SessionControl({ graphIndex, graphCount, currentGraph, onPrev, onNext }) {
    return (
        <div className="floating-right">
            <button disabled={graphIndex <= 0} onClick={onPrev}>↑ Prev Graph</button>
            <span>Graph {currentGraph?.graphNumber}</span>
            <button disabled={graphIndex >= graphCount - 1} onClick={onNext}>↓ Next Graph</button>
        </div>
    );
}

export default SessionControl;
