import React, { useState, useEffect } from "react";
import GraphCanvas from "./GraphCanvas";
import "./GraphTimelinePlayer.css";

function GraphTimelinePlayer({ graph }) {
  const [step, setStep] = useState(0);
  const [currentNodes, setCurrentNodes] = useState([]);
  const [currentEdges, setCurrentEdges] = useState([]);

  useEffect(() => {
    setStep(0);
  }, [graph]);

  useEffect(() => {
    if (!graph) return;

    console.log("Loaded graph:", graph);

    const nodeMap = new Map();
    const edgeMap = new Map();

    const builtNodes = [];
    const builtEdges = [];

    if (!graph.eventLog || graph.eventLog.length === 0) {
      // No event log, just render initial nodes and edges without timeline
      const baseNodes = graph.nodes.map(n => ({
        ...n,
        id: n.nodeId, // Must match edge source/target
        state: "idle",
      }));

      const baseEdges = graph.edges.map(e => ({
        ...e,
        source: e.sourceNodeID,
        target: e.targetNodeID,
        activated: 0,
      }));

      setCurrentNodes(baseNodes);
      setCurrentEdges(baseEdges);
    } else {
      for (let i = 0; i <= step && i < graph.eventLog.length; i++) {
        const entry = graph.eventLog[i];

        if (entry.nodeId !== null && !nodeMap.has(entry.nodeId)) {
          // Create node
          const nodeData = graph.nodes.find(n => n.nodeId === entry.nodeId);
          if (nodeData) {
            const node = {
              ...nodeData,
              id: `${nodeData.capability}:${nodeData.provider}`,
              state: entry.nodeState || "idle"
            };
            builtNodes.push(node);
            nodeMap.set(entry.nodeId, node);
          }
        }

        if (entry.edgeId !== null && !edgeMap.has(entry.edgeId)) {
          // Create edge
          const edgeData = graph.edges.find(e => e.edgeId === entry.edgeId);
          if (edgeData) {
            const edge = {
              ...edgeData,
              source: edgeData.sourceNodeID,
              target: edgeData.targetNodeID,
              activated: entry.edgeState ? 1 : 0
            };
            builtEdges.push(edge);
            edgeMap.set(entry.edgeId, edge);
          }
        }

        // Update node state if node exists already
        if (entry.nodeId !== null && nodeMap.has(entry.nodeId)) {
          const node = nodeMap.get(entry.nodeId);
          if (entry.nodeState) node.state = entry.nodeState;
        }

        // Update edge activation if edge exists already
        if (entry.edgeId !== null && edgeMap.has(entry.edgeId)) {
          const edge = edgeMap.get(entry.edgeId);
          if (entry.edgeState) edge.activated += 1;
        }
      }

      setCurrentNodes([...nodeMap.values()]);
      setCurrentEdges([...edgeMap.values()]);
    }
  }, [graph, step]);

  if (!graph) return <p>No graph selected.</p>;

  return (
    <div className="graph-timeline-container">
      <GraphCanvas nodes={currentNodes} links={currentEdges} />
      <div className="timeline-controls floating-left">
        <button disabled={step <= 0} onClick={() => setStep(step - 1)}>← Back</button>
        <span>Step {graph.eventLog.length ? step + 1 : 0} / {graph.eventLog.length}</span>
        <button disabled={step >= graph.eventLog.length - 1} onClick={() => setStep(step + 1)}>→ Forward</button>
      </div>
    </div>
  );
}

export default GraphTimelinePlayer;
