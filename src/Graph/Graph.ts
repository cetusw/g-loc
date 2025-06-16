import { Vertex } from '../Vertex/Vertex.js';
import { Edge } from '../Edge/Edge.js';
import {
    VisEdge,
    VisNode
} from "./Types.js";

class Graph {
    private vertices: Map<string, Vertex> = new Map();
    private edges: Map<string, Edge> = new Map();
    private adjacencyList: Map<string, Map<string, Edge>> = new Map();

    public get numVertices(): number {
        return this.vertices.size;
    }

    public get numEdges(): number {
        return this.edges.size;
    }

    public AddVertex(vertex: Vertex): void {
        if (this.vertices.has(vertex.id)) {
            console.warn(`Vertex with ID ${vertex.id} already exists.`);
            return;
        }
        this.vertices.set(vertex.id, vertex);
        this.adjacencyList.set(vertex.id, new Map());
    }

    public GetVertex(id: string): Vertex | undefined {
        return this.vertices.get(id);
    }

    public GetAllVertices(): Vertex[] {
        return Array.from(this.vertices.values());
    }

    public AddEdge(fromVertexId: string, toVertexId: string, weight: number): void {
        if (fromVertexId === toVertexId) {
            console.warn(`Cannot add edge from vertex ${fromVertexId} to itself.`);
            return;
        }

        const fromVertex = this.vertices.get(fromVertexId);
        const toVertex = this.vertices.get(toVertexId);

        if (!fromVertex || !toVertex) {
            console.error(`One or both vertices for edge (${fromVertexId}, ${toVertexId}) not found.`);
            return;
        }

        const edgeId = [fromVertexId, toVertexId].sort().join('-');
        if (this.edges.has(edgeId)) {
            console.warn(`Edge between ${fromVertexId} and ${toVertexId} (ID: ${edgeId}) already exists.`);
            return;
        }

        const newEdge = new Edge(edgeId, fromVertexId, toVertexId, weight);
        this.edges.set(edgeId, newEdge);

        this.adjacencyList.get(fromVertexId)?.set(toVertexId, newEdge);
        this.adjacencyList.get(toVertexId)?.set(fromVertexId, newEdge);
    }

    public GetEdge(fromVertexId: string, toVertexId: string): Edge | undefined {
        const edgeId = [fromVertexId, toVertexId].sort().join('-');
        return this.edges.get(edgeId);
    }

    public GetAllEdges(): Edge[] {
        return Array.from(this.edges.values());
    }

    public GetNeighbors(vertexId: string): string[] {
        const neighborsMap = this.adjacencyList.get(vertexId);
        if (!neighborsMap) {
            return [];
        }
        return Array.from(neighborsMap.keys());
    }

    public UpdateVertexDegrees(): void {
        this.vertices.forEach(vertex => {
            vertex.degree = 0;
        });

        this.edges.forEach(edge => {
            const fromVertex = this.vertices.get(edge.fromVertexId);
            const toVertex = this.vertices.get(edge.toVertexId);

            if (fromVertex) {
                fromVertex.degree++;
            }
            if (toVertex) {
                toVertex.degree++;
            }
        });
    }

    public ToVisData(): { nodes: VisNode[]; edges: VisEdge[] } {
        const visNodes: VisNode[] = [];
        this.vertices.forEach(vertex => {
            visNodes.push({ id: vertex.id, label: vertex.label, degree: vertex.degree });
        });

        const visEdges: VisEdge[] = [];
        this.edges.forEach(edge => {
            visEdges.push({
                id: edge.id,
                from: edge.fromVertexId,
                to: edge.toVertexId,
                label: edge.weight.toString()
            });
        });

        return { nodes: visNodes, edges: visEdges };
    }
}

export {
    Graph,
};