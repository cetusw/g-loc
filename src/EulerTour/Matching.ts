import {Edge} from '../Edge/Edge';

class Matching {
    public matchingEdges: Map<string, Edge>;

    constructor(initialEdges: Edge[] = []) {
        this.matchingEdges = new Map<string, Edge>();
        for (const edge of initialEdges) {
            this.matchingEdges.set(edge.id, edge);
        }
    }

    ExistsVertex(vertexId: string): boolean {
        for (const edge of this.matchingEdges.values()) {
            if (edge.fromVertexId === vertexId || edge.toVertexId === vertexId) {
                return true;
            }
        }
        return false;
    }

    MatchedVertex(vertexId: string): string | null {
        for (const edge of this.matchingEdges.values()) {
            if (edge.fromVertexId === vertexId) {
                return edge.toVertexId;
            }
            if (edge.toVertexId === vertexId) {
                return edge.fromVertexId;
            }
        }
        return null;
    }

    Augment(pathEdges: Edge[]): void {
        for (const pathEdge of pathEdges) {
            if (this.matchingEdges.has(pathEdge.id)) {
                this.matchingEdges.delete(pathEdge.toString());
            } else {
                this.matchingEdges.set(pathEdge.id, pathEdge);
            }
        }
    }

    RemoveIncidentEdge(vertexId: string): void {
        const edgesToRemove: string[] = [];
        for (const edge of this.matchingEdges.values()) {
            if (edge.fromVertexId === vertexId || edge.toVertexId === vertexId) {
                edgesToRemove.push(edge.id);
            }
        }
        for (const edgeId of edgesToRemove) {
            this.matchingEdges.delete(edgeId);
        }
    }

    Contains(edge: Edge): boolean {
        return this.matchingEdges.has(edge.id);
    }

    GetMatchingEdges(): Edge[] {
        return Array.from(this.matchingEdges.values());
    }

    Size(): number {
        return this.matchingEdges.size;
    }
}

export {Matching};