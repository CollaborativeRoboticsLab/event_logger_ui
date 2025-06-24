import React from "react";
import ForceGraph2D from "react-force-graph-2d";

function GraphCanvas({ nodes, links }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ForceGraph2D
        graphData={{ nodes, links }}
        nodeAutoColorBy="state"
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkColor={(link) => {
          if (link.activated > 2) return "#28a745";
          if (link.activated > 0) return "#ffc107";
          return "#ccc";
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const radius = 5;
          const fontSize = 10 / globalScale;
          const lineSpacing = 1;

          const cap = node.capability || "";
          const prov = node.provider || "";

          // Draw circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || "#0077cc";
          ctx.fill();
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Draw multiline label
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#000";
          ctx.fillText(cap, node.x, node.y + radius + 2);
          ctx.fillText(prov, node.x, node.y + radius + fontSize + lineSpacing + 2);
        }}
        nodeLabel="" // Disable default tooltip label
      />
    </div>
  );
}

export default GraphCanvas;
