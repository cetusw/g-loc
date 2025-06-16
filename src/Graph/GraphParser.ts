import { Graph } from './Graph.js';
import { Vertex } from '../Vertex/Vertex.js';

class GraphParser {
    public StringToAdjacencyMatrix(matrixString: string): Graph {
        const graph = new Graph();
        const rows = matrixString.trim().split('\n').map(row =>
            row.trim().split(',').map(s => Number(s.trim()))
        );

        if (rows.length === 0 || rows[0].length === 0) {
            throw new Error("Matrix empty.");
        }

        const numVertices = rows.length;
        if (!rows.every(row => row.length === numVertices)) {
            throw new Error("Matrix must be square (NxN).");
        }

        for (let i = 1; i <= numVertices; i++) {
            graph.AddVertex(new Vertex(i.toString(), `V${i}`));
        }

        for (let i = 0; i < numVertices; i++) {
            for (let j = i; j < numVertices; j++) {
                const weight = rows[i][j];
                if (weight > 0) {
                    graph.AddEdge((i + 1).toString(), (j + 1).toString(), weight);
                } else if (weight < 0) {
                    throw new Error(`Invalid edge weight (${weight}) in [${i+1},${j+1}]. Weight cannot be negative.`);
                }
            }
        }

        graph.UpdateVertexDegrees();
        return graph;
    }
}

export {
    GraphParser,
};