import {Graph} from "../Graph/Graph";

class DepthFirstSearch {
    private graph: Graph;
    private dfsStack: string[] = [];
    private visitedVertices: Set<string> = new Set<string>();

    constructor(graph: Graph) {
        this.graph = graph;
    }

    public InitializeDFS(startVertexId: string): void {
        this.Reset();
        this.dfsStack.push(startVertexId);
        this.visitedVertices.add(startVertexId);
    }

    public Reset(): void {
        this.dfsStack = [];
        this.visitedVertices = new Set<string>();
    }

    public GetNextMove(currentVertexId: string): string | null {
        if (this.dfsStack.length === 0 || this.dfsStack[this.dfsStack.length - 1] !== currentVertexId) {
            this.Reset();
            return null;
        }

        const currentVertex = this.graph.GetVertex(currentVertexId);
        if (!currentVertex) {
            this.Reset();
            return null;
        }

        const neighbors = this.graph.GetNeighbors(currentVertex.id);
        let nextVertexToVisit: string | null = null;

        for (const neighborId of neighbors) {
            if (!this.visitedVertices.has(neighborId)) {
                nextVertexToVisit = neighborId;
                break;
            }
        }

        if (nextVertexToVisit) {
            this.dfsStack.push(nextVertexToVisit);
            this.visitedVertices.add(nextVertexToVisit);
            return nextVertexToVisit;
        } else {
            this.dfsStack.pop();

            if (this.dfsStack.length > 0) {
                return this.dfsStack[this.dfsStack.length - 1]
            } else {
                return null;
            }
        }
    }

}

export {
    DepthFirstSearch,
};