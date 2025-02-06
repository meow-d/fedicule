import { MultiDirectedGraph } from "graphology";
import louvain from "graphology-communities-louvain";
import iwanthue from "iwanthue";

import { Node, Interaction, ProcessedData } from "../../stores/data";
import { communities, setCommunities, setNodes } from "../../stores/graph";

export function updateGraph(data: ProcessedData): MultiDirectedGraph {
  const graph = new MultiDirectedGraph();

  data.interaction.forEach((interaction: Interaction) => {
    updateEdge(interaction.sender, interaction.receiver, interaction.type);
  });

  function updateEdge(sender: Node, receiver: Node, type: string) {
    let score: number = 1;
    switch (type) {
      case "like":
        score = 1;
        break;
      case "boost":
        score = 2;
        break;
      case "mention":
        score = 3;
        break;
      case "follow":
        score = 4;
        break;
    }

    updateNode(sender, score);
    updateNode(receiver, score);

    graph.updateEdge(sender.label, receiver.label, (attr) => {
      const finalScore = (attr.score || 0) + score * 1;
      // const size = score;
      const size = Math.log(score) * 2;
      return {
        ...attr,
        score: finalScore,
        size: size,
      };
    });
  }

  function updateNode(node: Node, score: number) {
    graph.updateNode(node.label, (attr) => {
      return {
        ...attr,
        label: node.label,
        mastoApiId: node.mastoApiId,
        display_name: node.display_name,
        image: node.image,
        score: (attr.score || 0) + score,
        size: 5,
        x: Math.random(),
        y: Math.random(),
      };
    });
  }

  // filter out nodes with low scores
  graph.forEachNode((node, attr) => {
    if (attr.score <= 2) {
      graph.dropNode(node);
    }
  });
  // graph.forEachEdge((edge, attr) => {
  //   if (attr.score < 2) {
  //     graph.dropEdge(edge);
  //   }
  // });

  // node size based on updated edge scores
  graph.forEachNode((node, attr) => {
    const edges = graph.edges(node);
    const score = edges.reduce((acc, edge) => acc + graph.getEdgeAttribute(edge, "score"), 0);
    const size = 5 + Math.log(score) * 3;
    graph.setNodeAttribute(node, "size", size);
  });

  // community detection using louvain
  louvain.assign(graph, { nodeCommunityAttribute: "community" });

  const communitiesSet = new Set<string>();
  graph.forEachNode((_, attrs) => communitiesSet.add(attrs.community));
  setCommunities(
    Array.from(communitiesSet).map((community) => ({
      id: community,
      largestNode: "",
      color: "",
    }))
  );

  // comunity colors
  const palette: Record<string, string> = iwanthue(communitiesSet.size).reduce(
    (iter, color, i) => ({
      ...iter,
      [communities()[i].id]: color,
    }),
    {}
  );
  graph.forEachNode((node, attr) => graph.setNodeAttribute(node, "color", palette[attr.community]));

  // find largest node in each community
  const updatedCommunities = communities().map((community) => {
    const nodesInCommunity = graph.filterNodes((node, attrs) => attrs.community === community.id);

    if (nodesInCommunity.length > 0) {
      const largestNode = nodesInCommunity.reduce((a, b) =>
        graph.getNodeAttribute(a, "size") > graph.getNodeAttribute(b, "size") ? a : b
      );
      return {
        ...community,
        largestNode,
        color: palette[community.id],
      };
    }
    return community;
  });
  setCommunities(updatedCommunities);

  // update list of nodes, for search suggestions
  setNodes(graph.nodes().map((n) => ({ id: n, label: graph.getNodeAttribute(n, "label") as string })));

  return graph;
}
