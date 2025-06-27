import React from "react";
import ForceGraph2D from "react-force-graph-2d";
import "./GraphCanvas.css";

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

          // Extract short capability name
          const capabilityParts = (node.capability || "").split("/");
          const shortCapability = capabilityParts[capabilityParts.length - 1] || "";

          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || "#0077cc";
          ctx.fill();
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Draw short label
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#000";
          ctx.fillText(shortCapability, node.x, node.y + radius + 2);
        }}
        nodeLabel={(node) =>
          `capability: ${node.capability || "N/A"}  |  provider: ${node.provider || "N/A"}`
        }
      />
    </div>
  );
}

export default GraphCanvas;
