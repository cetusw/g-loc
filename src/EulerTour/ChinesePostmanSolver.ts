import {Graph} from '../Graph/Graph.js';
import {BlossomAlgorithm} from './BlossomAlgorithm.js';
import {Matching} from './Matching.js';
import {Edge} from "../Edge/Edge.js";

class ChinesePostmanSolver {
    private readonly graph: Graph;

    constructor(graph: Graph) {
        this.graph = graph;
    }

    public FindChinesePostmanTour(): string[] | null {
        if (this.graph.GetAllVertices().length === 0) {
            return null;
        }

        const oddDegreeVertices: string[] = this.FindOddDegreeVertices();

        if (oddDegreeVertices.length === 0) {
            return this.FindEulerTourDirectly(this.graph);
        }

        const perfectMatching: Matching = BlossomAlgorithm.MaximumMatchingInitial(this.graph);

        if (perfectMatching.Size() * 2 !== oddDegreeVertices.length) {
            return null;
        }

        const graphWithDuplicatedEdges: Graph = this.AddDuplicateEdges(perfectMatching);
        console.log("Graph modified to have all even degrees.");

        console.log("Finding Euler tour in the modified graph...");
        return this.FindEulerTourDirectly(graphWithDuplicatedEdges);
    }

    private FindOddDegreeVertices(): string[] {
        const oddVertices: string[] = [];
        this.graph.UpdateVertexDegrees();
        for (const vertex of this.graph.GetAllVertices()) {
            const degree = this.graph.GetNeighbors(vertex.id).length;
            if (degree % 2 !== 0) {
                oddVertices.push(vertex.id);
            }
        }
        return oddVertices;
    }

    private AddDuplicateEdges(perfectMatching: Matching): Graph {
        const modifiedGraph = new Graph();
        this.graph.GetAllVertices().forEach(vertex => modifiedGraph.AddVertex(vertex));
        this.graph.GetAllEdges().forEach(edge => modifiedGraph.AddEdge(edge.fromVertexId, edge.toVertexId, edge.weight));


        for (const matchedEdge of perfectMatching.GetMatchingEdges()) {
            const fromVertexId = matchedEdge.fromVertexId;
            const toVertexId = matchedEdge.toVertexId;

            modifiedGraph.AddEdge(fromVertexId, toVertexId);
        }
        modifiedGraph.UpdateVertexDegrees();
        return modifiedGraph;
    }

    private CountReachableVertices(graph: Graph, startVertexId: string, excludedEdgeId: string | null = null): number {
        if (!graph.GetVertex(startVertexId)) {
            return 0;
        }

        let visitedCount = 0;
        const visited: Set<string> = new Set();
        const queue: string[] = [startVertexId];
        visited.add(startVertexId);
        visitedCount++;

        while (queue.length > 0) {
            const currentVertexId = queue.shift()!;
            for (const neighborId of graph.GetNeighbors(currentVertexId)) {
                const edge = new Edge(currentVertexId, neighborId);

                if (excludedEdgeId && edge.id === excludedEdgeId) {
                    continue;
                }
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    visitedCount++;
                    queue.push(neighborId);
                }
            }
        }
        return visitedCount;
    }

    private FindEulerTourDirectly(targetGraph: Graph): string[] | null {
        const currentGraph = new Graph();
        targetGraph.GetAllVertices().forEach(vertex => currentGraph.AddVertex(vertex));
        targetGraph.GetAllEdges().forEach(edge => currentGraph.AddEdge(edge.fromVertexId, edge.toVertexId, edge.weight));

        let currentPath: string[] = [];
        let currentVertexId: string | undefined = currentGraph.GetAllVertices()[0]?.id;

        if (!currentVertexId) {
            return null;
        }

        if (this.CountReachableVertices(currentGraph, currentVertexId) !== currentGraph.GetAllVertices().length) {
            return null;
        }

        currentPath.push(currentVertexId);

        while (currentGraph.numEdges > 0) {
            const neighbors = currentGraph.GetNeighbors(currentVertexId);
            let nextVertex: string | null = null;
            let edgeToTake: Edge | null = null;

            for (const neighborId of neighbors) {
                const potentialEdge = currentGraph.GetEdge(currentVertexId, neighborId);
                if (!potentialEdge) {
                    continue;
                }

                currentGraph.DeleteEdgeFromEdges(potentialEdge.id);
                currentGraph.DeleteEdgeFromAdjacencyListByKey(currentVertexId, neighborId);
                currentGraph.DeleteEdgeFromAdjacencyListByKey(neighborId, currentVertexId);

                const reachableCountAfterRemoval = this.CountReachableVertices(currentGraph, currentVertexId);

                currentGraph.SetEdgeToEdges(potentialEdge.id, potentialEdge);
                if (!currentGraph.HasVertex(currentVertexId)) {
                    currentGraph.SetEdgeToAdjacencyList(currentVertexId, new Map());
                }
                if (!currentGraph.HasVertex(neighborId)) {
                    currentGraph.SetEdgeToAdjacencyList(neighborId, new Map());
                }
                currentGraph.SetEdgeToAdjacencyListByKey(currentVertexId, neighborId, potentialEdge);
                currentGraph.SetEdgeToAdjacencyListByKey(neighborId, currentVertexId, potentialEdge);

                if (reachableCountAfterRemoval === currentGraph.numVertices) {
                    nextVertex = neighborId;
                    edgeToTake = potentialEdge;
                    break;
                }
            }

            if (nextVertex === null && neighbors.length > 0) {
                const firstNeighborId = neighbors[0];
                nextVertex = firstNeighborId;
                edgeToTake = currentGraph.GetEdge(currentVertexId, firstNeighborId)!;
            }

            if (nextVertex === null || edgeToTake === null) {
                return null;
            }

            currentPath.push(nextVertex);

            currentGraph.DeleteEdgeFromEdges(edgeToTake.id);
            currentGraph.DeleteEdgeFromAdjacencyListByKey(currentVertexId, nextVertex);
            currentGraph.DeleteEdgeFromAdjacencyListByKey(nextVertex, currentVertexId);

            currentVertexId = nextVertex;
        }

        if (currentGraph.numEdges !== 0) {
            return null;
        }

        return currentPath
    }
}

export {
    ChinesePostmanSolver,
};