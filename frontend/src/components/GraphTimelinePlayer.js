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

    const nodeMap = new Map();
    const edgeMap = new Map();

    const eventLog = graph.eventLog || [];

    // If no timeline, just show idle nodes and basic edges
    if (eventLog.length === 0) {
      const idleNodes = graph.nodes.map((n) => ({
        ...n,
        id: n.nodeId,
        state: "idle",
      }));

      const baseEdges = graph.edges.map((e) => ({
        ...e,
        source: e.sourceNodeID,
        target: e.targetNodeID,
        activated: 0,
      }));

      setCurrentNodes(idleNodes);
      setCurrentEdges(baseEdges);
      return;
    }

    for (let i = 0; i <= step && i < eventLog.length; i++) {
      const entry = eventLog[i];

      // Handle Node State
      if (entry.nodeId !== null) {
        let node = nodeMap.get(entry.nodeId);
        if (!node) {
          const orig = graph.nodes.find((n) => n.nodeId === entry.nodeId);
          if (orig) {
            node = {
              ...orig,
              id: orig.nodeId,
              state: entry.nodeState || "idle",
            };
            nodeMap.set(entry.nodeId, node);
          }
        } else if (entry.nodeState) {
          node.state = entry.nodeState;
        }
      }

      // Handle Edge State
      if (entry.edgeId !== null) {
        let edge = edgeMap.get(entry.edgeId);
        if (!edge) {
          const orig = graph.edges.find((e) => e.edgeId === entry.edgeId);
          if (orig) {
            edge = {
              ...orig,
              source: orig.sourceNodeID,
              target: orig.targetNodeID,
              activated: entry.edgeState ? 1 : 0,
            };
            edgeMap.set(entry.edgeId, edge);
          }
        } else if (entry.edgeState) {
          edge.activated += 1;
        }
      }
    }

    setCurrentNodes([...nodeMap.values()]);
    setCurrentEdges([...edgeMap.values()]);
  }, [graph, step]);

  if (!graph) return <p>No graph loaded.</p>;

  return (
    <div className="graph-timeline-container">
      <GraphCanvas nodes={currentNodes} links={currentEdges} />
      <div className="timeline-controls floating-left">
        <button disabled={step <= 0} onClick={() => setStep(step - 1)}>← Back</button>
        <span>
          Step {graph.eventLog.length ? step + 1 : 0} / {graph.eventLog.length}
        </span>
        <button
          disabled={step >= graph.eventLog.length - 1}
          onClick={() => setStep(step + 1)}
        >
          → Forward
        </button>
      </div>
    </div>
  );
}

export default GraphTimelinePlayer;
