import { createSignal } from "solid-js";
import { Node } from "./data";
import { createStore } from "solid-js/store";

interface SelectedNode extends Node {
  color: string;
  neighbors?: SelectedNode[];
}

export interface State {
  hoveredNode?: string;
  searchQuery: string;
  clickedNode?: string;
  selectedNodes: Map<string, SelectedNode>;
  suggestions?: Set<string>;
  hoveredNeighbors?: Set<string>;
}

export const [state, setState] = createStore<State>({
  searchQuery: "",
  selectedNodes: new Map(),
});

export interface community {
  id: string;
  largestNode: string;
  color: string;
}

export const [communities, setCommunities] = createSignal<community[]>([]);

interface nodes {
  id: string;
  label: string;
}

export const [nodes, setNodes] = createSignal<nodes[]>();
