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

    public AddEdge(fromVertexId: string, toVertexId: string, weight?: number): void {
        if (fromVertexId === toVertexId) {
            return;
        }

        const fromVertex = this.vertices.get(fromVertexId);
        const toVertex = this.vertices.get(toVertexId);

        if (!fromVertex || !toVertex) {
            return;
        }

        const newEdge = new Edge(fromVertexId, toVertexId, weight ? weight : 1);
        if (this.edges.has(newEdge.id)) {
            return;
        }
        this.edges.set(newEdge.id, newEdge);

        if (!this.adjacencyList.has(fromVertexId)) {
            this.adjacencyList.set(fromVertexId, new Map());
        }
        if (!this.adjacencyList.has(toVertexId)) {
            this.adjacencyList.set(toVertexId, new Map());
        }

        this.adjacencyList.get(fromVertexId)?.set(toVertexId, newEdge);
        this.adjacencyList.get(toVertexId)?.set(fromVertexId, newEdge);
    }

    public GetEdge(fromVertexId: string, toVertexId: string): Edge | undefined {
        const edgeId = new Edge(fromVertexId, toVertexId).id;
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

    ExistEdge(fromVertexId: string, toVertexId: string): boolean {
        const canonicalEdge = new Edge(fromVertexId, toVertexId);
        return this.edges.has(canonicalEdge.id);
    }

    Dist(start: string, end: string): number {
        if (start === end) {
            return 0;
        }
        const queue: { vertexId: string, distance: number }[] = [{ vertexId: start, distance: 0 }];
        const visited: Set<string> = new Set<string>();
        visited.add(start);

        while (queue.length > 0) {
            const { vertexId, distance } = queue.shift()!;
            if (vertexId === end) {
                return distance;
            }
            for (const neighborId of this.adjacencyList.get(vertexId)?.keys() || []) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push({ vertexId: neighborId, distance: distance + 1 });
                }
            }
        }
        return Infinity;
    }

    Path(start: string, end: string): string[] {
        const queue: { vertexId: string, path: string[] }[] = [{ vertexId: start, path: [start] }];
        const visited: Set<string> = new Set<string>();
        visited.add(start);

        while (queue.length > 0) {
            const { vertexId, path } = queue.shift()!;
            if (vertexId === end) {
                return path;
            }
            for (const neighborId of this.adjacencyList.get(vertexId)?.keys() || []) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push({ vertexId: neighborId, path: [...path, neighborId] });
                }
            }
        }
        return [];
    }

    Contract(centerVertexId: string, vertexToContractId: string): void {
        if (!this.vertices.has(centerVertexId) || !this.vertices.has(vertexToContractId)) {
            return;
        }
        if (centerVertexId === vertexToContractId) {
            return;
        }

        const neighborsOfContracted = Array.from(this.adjacencyList.get(vertexToContractId)?.keys() || []);

        for (const neighborId of neighborsOfContracted) {
            if (neighborId === centerVertexId) {
                continue;
            }

            const edgeToRemove = new Edge(vertexToContractId, neighborId);
            this.edges.delete(edgeToRemove.id);

            this.adjacencyList.get(neighborId)?.delete(vertexToContractId);
            this.adjacencyList.get(vertexToContractId)?.delete(neighborId);

            if (!this.ExistEdge(centerVertexId, neighborId)) {
                this.AddEdge(centerVertexId, neighborId);
            }
        }

        this.vertices.delete(vertexToContractId);
        this.adjacencyList.delete(vertexToContractId);

        this.UpdateVertexDegrees();
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

    public DeleteEdgeFromAdjacencyListByKey(fromVertexId: string, toVertexId: string): void {
        this.adjacencyList.get(fromVertexId)?.delete(toVertexId);
    }

    public DeleteEdgeFromEdges(edgeId: string): void {
        this.edges.delete(edgeId);
    }

    public SetEdgeToAdjacencyListByKey(fromVertexId: string, toVertexId: string, edge: Edge): void {
        this.adjacencyList.get(fromVertexId)?.set(toVertexId, edge);
    }

    public SetEdgeToAdjacencyList(vertexId: string, edge: Map<string, Edge>): void {
        this.adjacencyList.set(vertexId, edge);
    }

    public SetEdgeToEdges(edgeId: string, edge: Edge): void {
        this.edges.set(edgeId, edge);
    }

    public HasVertex(vertex: string): boolean {
        return this.adjacencyList.has(vertex)
    }
}

export {
    Graph,
};