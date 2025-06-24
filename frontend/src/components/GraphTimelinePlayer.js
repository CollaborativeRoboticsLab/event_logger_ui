import React, { useState, useEffect } from "react";
import GraphCanvas from "./GraphCanvas";
import "./GraphTimelinePlayer.css";

function GraphTimelinePlayer({ graph }) {
  const [step, setStep] = useState(0);
  const [currentNodes, setCurrentNodes] = useState([]);
  const [currentEdges, setCurrentEdges] = useState([]);

  useEffect(() => {
    setStep(0); // Reset step when a new graph is loaded
  }, [graph]);

  useEffect(() => {
    if (!graph) return;

    const baseNodes = graph.nodes.map(n => ({
      ...n,
      id: `${n.capability}:${n.provider}`,
      state: "idle"
    }));

    const baseEdges = graph.edges.map(e => ({
      source: `${e.from.capability}:${e.from.provider}`,
      target: `${e.to.capability}:${e.to.provider}`,
      activated: 0,
      from: { ...e.from },  // ✅ Needed for matching later
      to: { ...e.to }
    }));


    const logSteps = graph.eventLog?.slice(0, step + 1) || [];

    for (const entry of logSteps) {
      const srcKey = `${entry.source.capability}:${entry.source.provider}`;
      const tgtKey = `${entry.target.capability}:${entry.target.provider}`;

      for (const e of baseEdges) {
        const fromKey = `${e.from.capability}:${e.from.provider}`;
        const toKey = `${e.to.capability}:${e.to.provider}`;
        if (fromKey === srcKey && toKey === tgtKey && entry.edgeFound) {
          e.activated += 1;
        }
      }

      for (const n of baseNodes) {
        const key = `${n.capability}:${n.provider}`;
        if (key === srcKey && entry.edgeFound) n.state = "complete";
        if (key === tgtKey && entry.edgeFound) n.state = "executing";
        if (key === srcKey && !entry.edgeFound) n.state = "failed";
      }
    }

    setCurrentNodes(baseNodes);
    setCurrentEdges(baseEdges);
  }, [graph, step]);

  if (!graph) return <p>No graph selected.</p>;

  return (
    <div className="graph-timeline-container">
      <GraphCanvas
        nodes={currentNodes}
        links={currentEdges}
      />

      <div className="timeline-controls floating-left">
        <button disabled={step <= 0} onClick={() => setStep(step - 1)}>← Back</button>
        <span>Step {graph.eventLog?.length ? step + 1 : 0} / {graph.eventLog?.length || 0}</span>
        <button
          disabled={step >= (graph.eventLog?.length || 0) - 1}
          onClick={() => setStep(step + 1)}
        >→ Forward</button>
      </div>
    </div>
  );
}

export default GraphTimelinePlayer;
