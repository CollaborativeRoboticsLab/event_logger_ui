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
        linkColor={(link) => (link.activated ? "#28a745" : "#000")} // green if activated
        nodeCanvasObject={(node, ctx, globalScale) => {
          const radius = 5;
          const fontSize = 10 / globalScale;

          // Extract short capability name
          const capabilityParts = (node.capability || "").split("/");
          const shortCapability = capabilityParts[capabilityParts.length - 1] || "";

          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle =
            node.state === "executing" ? "#ffd700" :
              node.state === "complete" ? "#28a745" :
                node.state === "failed" ? "#ff4d4d" :
                  "#add8e6"; // idle - light blue
          ctx.fill();
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Draw short label
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
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
