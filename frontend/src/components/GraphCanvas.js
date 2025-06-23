import React from "react";
import ForceGraph2D from "react-force-graph-2d";

function GraphCanvas({ nodes, links }) {
  return (
    <ForceGraph2D
      graphData={{ nodes, links }}
      nodeAutoColorBy="state"
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      nodeLabel={(node) => `${node.capability}:${node.provider} (${node.state})`}
      linkLabel={(link) => `${link.source.capability} → ${link.target.capability}`}
    />
  );
}

export default GraphCanvas;
