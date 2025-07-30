import React, { useState, useEffect, useMemo } from "react";
import GraphCanvas from "./GraphCanvas";
import "./GraphTimelinePlayer.css";

function GraphTimelinePlayer({ graph }) {
  const [step, setStep] = useState(0);
  const [currentNodes, setCurrentNodes] = useState([]);
  const [currentEdges, setCurrentEdges] = useState([]);

  useEffect(() => {
    setStep(0);
  }, [graph]);

  const nodeLookup = useMemo(() => {
    const map = new Map();
    graph?.nodes?.forEach((n) => map.set(n.nodeId, n));
    return map;
  }, [graph]);

  const edgeLookup = useMemo(() => {
    const map = new Map();
    graph?.edges?.forEach((e) => map.set(e.edgeId, e));
    return map;
  }, [graph]);

  useEffect(() => {
    if (!graph) return;

    const nodeMap = new Map();
    const edgeMap = new Map();

    const eventLog = graph.eventLog || [];

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

      // Node
      if (entry.nodeId !== null) {
        let node = nodeMap.get(entry.nodeId);
        if (!node) {
          const orig = nodeLookup.get(entry.nodeId);
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

      // Edge
      if (entry.edgeId !== null) {
        let edge = edgeMap.get(entry.edgeId);
        if (!edge) {
          const orig = edgeLookup.get(entry.edgeId);
          if (orig) {
            edge = {
              ...orig,
              source: orig.sourceNodeID,
              target: orig.targetNodeID,
              activated: entry.edgeState ? 1 : 0,
            };
            edgeMap.set(entry.edgeId, edge);
          }
        } else {
          edge.activated = entry.edgeState ? 1 : 0;
        }
      }
    }

    setCurrentNodes([...nodeMap.values()]);
    setCurrentEdges([...edgeMap.values()]);
  }, [graph, step, nodeLookup, edgeLookup]);

  if (!graph) return <p>No graph loaded.</p>;

  const totalSteps = graph.eventLog?.length || 0;

  return (
    <div className="graph-timeline-container">
      <GraphCanvas nodes={currentNodes} links={currentEdges} />
      <div className="timeline-controls floating-left">
        <button disabled={step <= 0 || totalSteps === 0} onClick={() => setStep(step - 1)}>
          ← Back
        </button>
        <span>
          Step {totalSteps ? step + 1 : 0} / {totalSteps}
        </span>
        <button
          disabled={step >= totalSteps - 1 || totalSteps === 0}
          onClick={() => setStep(step + 1)}
        >
          → Forward
        </button>
      </div>
    </div>
  );
}

export default GraphTimelinePlayer;
