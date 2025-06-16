import {Graph} from './Graph.js';
import {Vertex} from '../Vertex/Vertex.js';

class GraphGenerator {
    public GenerateConnectedRandomGraph(
        numVertices: number,
        numAdditionalEdges: number,
        minWeight: number,
        maxWeight: number
    ): Graph {
        const graph = new Graph();

        for (let i = 1; i <= numVertices; i++) {
            graph.AddVertex(new Vertex(i.toString(), `V${i}`));
        }

        const vertices = graph.GetAllVertices();
        if (vertices.length === 0) {
            return graph;
        }

        const visitedVertices = new Set<string>();
        const unvisitedVertices = new Set<string>(vertices.map(v => v.id));
        const startVertex = vertices[0];

        visitedVertices.add(startVertex.id);
        unvisitedVertices.delete(startVertex.id);

        while (unvisitedVertices.size > 0) {
            const randomVisitedId = Array.from(visitedVertices)[Math.floor(Math.random() * visitedVertices.size)];

            const nextUnvisitedId = Array.from(unvisitedVertices)[Math.floor(Math.random() * unvisitedVertices.size)];
            const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
            graph.AddEdge(randomVisitedId, nextUnvisitedId, weight);
            visitedVertices.add(nextUnvisitedId);
            unvisitedVertices.delete(nextUnvisitedId);
        }

        let edgesAdded = 0;
        const maxPossibleEdges = numVertices * (numVertices - 1) / 2;
        let attempts = 0;
        const maxAttemptsFactor = 5;

        while (edgesAdded < numAdditionalEdges && attempts < maxPossibleEdges * maxAttemptsFactor) {
            const v1 = vertices[Math.floor(Math.random() * numVertices)];
            const v2 = vertices[Math.floor(Math.random() * numVertices)];

            if (v1.id === v2.id) {
                attempts++;
                continue;
            }

            if (!graph.GetEdge(v1.id, v2.id)) {
                const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
                graph.AddEdge(v1.id, v2.id, weight);
                edgesAdded++;
            }
            attempts++;
        }

        graph.UpdateVertexDegrees();
        return graph;
    }
}

export {
    GraphGenerator,
};