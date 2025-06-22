function generateGraph(events) {
  const nodeSet = new Set();
  const edges = [];

  for (const event of events) {
    if (event.type !== "RUNNER_DEFINE") continue;

    const source = event.source;
    const target = event.target;

    if (!source.capability || !source.provider) continue;
    if (!target.capability || !target.provider) continue; // skip if target is empty

    const srcKey = `${source.capability}:${source.provider}`;
    const tgtKey = `${target.capability}:${target.provider}`;

    nodeSet.add(srcKey);
    nodeSet.add(tgtKey);

    edges.push({
      from: { capability: source.capability, provider: source.provider },
      to: { capability: target.capability, provider: target.provider },
    });
  }

  const nodes = Array.from(nodeSet).map((key) => {
    const [capability, provider] = key.split(":");
    return { capability, provider };
  });

  return { nodes, edges };
}

module.exports = generateGraph;
