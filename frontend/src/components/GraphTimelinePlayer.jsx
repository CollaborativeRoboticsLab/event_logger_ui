import React, { useState, useEffect } from "react";

function GraphTimelinePlayer({ graph }) {
  const [step, setStep] = useState(0);
  const [currentState, setCurrentState] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    if (!graph) return;

    // Start from idle
    const baseNodes = graph.nodes.map(n => ({ ...n, state: "idle" }));
    const baseEdges = graph.edges.map(e => ({ ...e, activated: 0 }));

    const replay = JSON.parse(JSON.stringify({ nodes: baseNodes, edges: baseEdges }));

    for (let i = 0; i <= step && i < graph.eventLog.length; i++) {
      const log = graph.eventLog[i];
      const srcKey = `${log.source.capability}:${log.source.provider}`;
      const tgtKey = `${log.target.capability}:${log.target.provider}`;

      if (log.edgeFound) {
        for (const edge of replay.edges) {
          if (
            `${edge.from.capability}:${edge.from.provider}` === srcKey &&
            `${edge.to.capability}:${edge.to.provider}` === tgtKey
          ) {
            edge.activated++;
          }
        }
        for (const node of replay.nodes) {
          if (`${node.capability}:${node.provider}` === srcKey) node.state = "complete";
          if (`${node.capability}:${node.provider}` === tgtKey) node.state = "executing";
        }
      } else {
        for (const node of replay.nodes) {
          if (`${node.capability}:${node.provider}` === srcKey) node.state = "failed";
        }
      }
    }

    setCurrentState(replay);
  }, [step, graph]);

  if (!graph) return <div>Loading graph...</div>;

  return (
    <div>
      <div>
        <button disabled={step <= 0} onClick={() => setStep(step - 1)}>← Back</button>
        <span style={{ margin: "0 10px" }}>
          Step {step + 1} of {graph.eventLog.length}
        </span>
        <button disabled={step >= graph.eventLog.length - 1} onClick={() => setStep(step + 1)}>→ Forward</button>
      </div>

      <div>
        {/* Your GraphCanvas component here */}
        {/* Pass currentState.nodes and currentState.edges */}
      </div>
    </div>
  );
}

export default GraphTimelinePlayer;
