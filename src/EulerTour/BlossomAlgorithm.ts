import {Graph} from '../Graph/Graph.js';
import {Edge} from '../Edge/Edge.js';
import {Matching} from './Matching.js';
import {Vertex} from '../Vertex/Vertex.js';

class BlossomAlgorithm {
    private static ExposedVertices(graph: Graph, matching: Matching): string[] {
        const exposed: string[] = [];
        for (const vertex of graph.GetAllVertices()) {
            if (!matching.ExistsVertex(vertex.id)) {
                exposed.push(vertex.id);
            }
        }
        return exposed;
    }

    private static FindIndex(forest: Graph[], vertexId: string): number {
        for (let i = 0; i < forest.length; ++i) {
            if (forest[i].GetVertex(vertexId)) {
                return i;
            }
        }
        throw new Error(`Vertex ${vertexId} not found in forest`);
    }

    private static CandidateVertex(forest: Graph[], vertexMark: Set<string>, forestNodes: string[]): {
        firstVertexId: string,
        index: number
    } {
        for (const v of forestNodes) {
            if (!vertexMark.has(v)) {
                return {firstVertexId: v, index: BlossomAlgorithm.FindIndex(forest, v)};
            }
        }
        return {firstVertexId: "", index: -1};
    }

    private static CandidateEdge(graph: Graph, vertexId: string, edgeMark: Set<string>): { secondVertexId: string, found: boolean } {
        const neighborsId = graph.GetNeighbors(vertexId);
        for (const neighborId of neighborsId) {
            const candidate = new Edge(vertexId, neighborId);
            if (!edgeMark.has(candidate.id)) {
                return {secondVertexId: neighborId, found: true};
            }
        }
        return {secondVertexId: "", found: false};
    }

    private static ExistInTree(forest: Graph[], vertexId: string): boolean {
        for (let i = 0; i < forest.length; ++i) {
            if (forest[i].GetVertex(vertexId)) {
                return true;
            }
        }
        return false;
    }

    private static VertexPathToEdgePath(vertexPath: string[]): Edge[] {
        const edgePath: Edge[] = [];
        for (let i = 0; i < vertexPath.length - 1; ++i) {
            edgePath.push(new Edge(vertexPath[i], vertexPath[i + 1]));
        }
        return edgePath;
    }

    private static FindBase(matching: Matching, blossom: string[]): string {
        const tempBlossom = [...blossom, blossom[0], blossom[1]];

        for (let i = 0; i < tempBlossom.length - 2; ++i) {
            const u = tempBlossom[i];
            const v = tempBlossom[i + 1];
            const w = tempBlossom[i + 2];

            const edge1 = new Edge(u, v);
            const edge2 = new Edge(v, w);

            if (!matching.Contains(edge1) && !matching.Contains(edge2)) {
                return v;
            }
        }
        throw new Error("Blossom has no base");
    }

    private static LiftLeft(graph: Graph, blossom: string[], leftStem: string[]): string[] {
        const lastStemVertex = leftStem[leftStem.length - 1];

        for (let i = 0; i < blossom.length; ++i) {
            if (graph.ExistEdge(blossom[i], lastStemVertex)) {
                let resultPath: string[];
                if (i % 2 === 0) {
                    resultPath = blossom.slice(0, i + 1);
                    resultPath.reverse();
                } else {
                    resultPath = blossom.slice(i);
                }
                return resultPath;
            }
        }
        throw new Error("Left stem is not connected to blossom in a valid way for lifting.");
    }

    private static LiftRight(graph: Graph, blossom: string[], rightStem: string[]): string[] {
        const firstStemVertex = rightStem[0];

        for (let i = 0; i < blossom.length; ++i) {
            if (graph.ExistEdge(blossom[i], firstStemVertex)) {
                let resultPath: string[];
                if (i % 2 === 0) {
                    resultPath = blossom.slice(0, i + 1);
                } else {
                    resultPath = blossom.slice(i);
                    resultPath.reverse();
                }
                return resultPath;
            }
        }
        throw new Error("Right stem is not connected to blossom in a valid way for lifting.");
    }

    private static InitializeSearchForest(graph: Graph, matching: Matching, forest: Graph[], forestRoots: string[], forestNodes: string[]): void {
        for (const v of BlossomAlgorithm.ExposedVertices(graph, matching)) {
            const tempGraph = new Graph();
            tempGraph.AddVertex(new Vertex(v, v));
            forest.push(tempGraph);

            forestRoots.push(v);
            forestNodes.push(v);
        }
    }

    private static HandleNewVertexInForest(firstVertexId: string, secondVertexId: string, firstVertexIndex: number, matching: Matching, forest: Graph[], forestNodes: string[]): void {
        const u = matching.MatchedVertex(secondVertexId);
        if (u === null) {
            throw new Error(`Vertex ${secondVertexId} not in forest but not matched in M. Algorithm error.`);
        }

        forest[firstVertexIndex].AddVertex(new Vertex(secondVertexId, secondVertexId));
        forest[firstVertexIndex].AddVertex(new Vertex(u, u));
        forestNodes.push(u);

        forest[firstVertexIndex].AddEdge(firstVertexId, secondVertexId);
        forest[firstVertexIndex].AddEdge(secondVertexId, u);
    }

    private static HandleAugmentingPathFound(
        firstVertexId: string,
        firstVertexIndex: number,
        secondVertexId: string,
        secondVertexIndex: number,
        forest: Graph[],
        forestRoots: string[]
    ): string[] {
        const pathFirstVertex = forest[firstVertexIndex].Path(forestRoots[firstVertexIndex], firstVertexId);
        const pathSecondVertex = forest[secondVertexIndex].Path(secondVertexId, forestRoots[secondVertexIndex]);
        return pathFirstVertex.concat(pathSecondVertex);
    }

    private static ContractBlossom(graph: Graph, matching: Matching, blossom: string[], w: string): {
        graphContract: Graph,
        matchingContract: Matching
    } {
        const graphContract = new Graph();
        graph.GetAllVertices().forEach(vertex => graphContract.AddVertex(vertex));
        graph.GetAllEdges().forEach(edge => graphContract.AddEdge(edge.fromVertexId, edge.toVertexId, edge.weight));

        const matchingContract = new Matching(matching.GetMatchingEdges());

        for (const u of blossom) {
            if (u !== w) {
                graphContract.Contract(w, u);
                matchingContract.RemoveIncidentEdge(u);
            }
        }
        return {graphContract, matchingContract};
    }

    private static RotateBlossomForLifting(blossomForLifting: string[], base: string): string[] {
        const rotatedBlossom = [...blossomForLifting];
        const actualBaseIndex = rotatedBlossom.indexOf(base);
        if (actualBaseIndex !== -1) {
            const part1 = rotatedBlossom.slice(actualBaseIndex);
            const part2 = rotatedBlossom.slice(0, actualBaseIndex);
            rotatedBlossom.splice(0, rotatedBlossom.length, ...part1, ...part2);
        }
        return rotatedBlossom;
    }

    private static HandleBlossomAtPathEnd(graph: Graph, leftStem: string[], rightStem: string[], base: string, rotatedBlossom: string[]): string[] {
        let finalPath: string[];
        if (leftStem.length > 0) {
            if (graph.ExistEdge(base, leftStem[leftStem.length - 1])) {
                finalPath = leftStem.concat([base]);
            } else {
                const liftedBlossom = BlossomAlgorithm.LiftLeft(graph, rotatedBlossom, leftStem);
                finalPath = leftStem.concat(liftedBlossom);
            }
        } else {
            if (graph.ExistEdge(base, rightStem[0])) {
                finalPath = [base].concat(rightStem);
            } else {
                const liftedBlossom = BlossomAlgorithm.LiftRight(graph, rotatedBlossom, rightStem);
                finalPath = liftedBlossom.concat(rightStem);
            }
        }
        return finalPath;
    }

    private static HandleBlossomInPathMiddle(graph: Graph, matching: Matching, leftStem: string[], rightStem: string[], base: string, rotatedBlossom: string[]): string[] {
        let pathThroughBlossom: string[];
        const lastLeftStemVertex = leftStem[leftStem.length - 1];

        if (matching.Contains(new Edge(base, lastLeftStemVertex))) {
            pathThroughBlossom = [base].concat(BlossomAlgorithm.LiftRight(graph, rotatedBlossom, rightStem));
        } else {
            pathThroughBlossom = BlossomAlgorithm.LiftLeft(graph, rotatedBlossom, leftStem).concat([base]);
        }
        return leftStem.concat(pathThroughBlossom).concat(rightStem);
    }

    private static LiftBlossomPath(graph: Graph, matching: Matching, blossom: string[], blossomForLifting: string[], augmentingPath: string[], b: string): string[] {
        const bIndexInPath = augmentingPath.indexOf(b);
        const leftStem = augmentingPath.slice(0, bIndexInPath);
        const rightStem = augmentingPath.slice(bIndexInPath + 1);

        const base = BlossomAlgorithm.FindBase(matching, blossom);
        const rotatedBlossom = BlossomAlgorithm.RotateBlossomForLifting(blossomForLifting, base);

        let finalPath: string[];
        if (leftStem.length === 0 || rightStem.length === 0) {
            finalPath = BlossomAlgorithm.HandleBlossomAtPathEnd(graph, leftStem, rightStem, base, rotatedBlossom);
        } else {
            finalPath = BlossomAlgorithm.HandleBlossomInPathMiddle(graph, matching, leftStem, rightStem, base, rotatedBlossom);
        }
        return finalPath;
    }

    public static AugmentingPath(graph: Graph, matching: Matching, blossomStack: string[] = []): string[] {
        const forest: Graph[] = [];
        const forestRoots: string[] = [];
        const forestNodes: string[] = [];

        const vertexMark: Set<string> = new Set<string>();
        const edgeMark: Set<string> = new Set<string>();

        BlossomAlgorithm.InitializeSearchForest(graph, matching, forest, forestRoots, forestNodes);

        while (true) {
            const {firstVertexId, index: firstVertexIndex} = BlossomAlgorithm.CandidateVertex(forest, vertexMark, forestNodes);
            if (firstVertexIndex === -1) {
                break;
            }

            while (true) {
                const {secondVertexId, found: secondVertexState} = BlossomAlgorithm.CandidateEdge(graph, firstVertexId, edgeMark);
                if (!secondVertexState) {
                    break;
                }

                if (!BlossomAlgorithm.ExistInTree(forest, secondVertexId)) {
                    BlossomAlgorithm.HandleNewVertexInForest(firstVertexId, secondVertexId, firstVertexIndex, matching, forest, forestNodes);
                } else {
                    const secondVertexIndex = BlossomAlgorithm.FindIndex(forest, secondVertexId);
                    if (forest[secondVertexIndex].Dist(secondVertexId, forestRoots[secondVertexIndex]) % 2 === 0) {
                        if (firstVertexIndex !== secondVertexIndex) {
                            return BlossomAlgorithm.HandleAugmentingPathFound(firstVertexId, firstVertexIndex, secondVertexId, secondVertexIndex, forest, forestRoots);
                        } else {
                            const blossom = forest[firstVertexIndex].Path(firstVertexId, secondVertexId);

                            const {graphContract, matchingContract} = BlossomAlgorithm.ContractBlossom(graph, matching, blossom, secondVertexId);

                            const blossomForLifting = [...blossom, firstVertexId];
                            const newBlossomStack = [...blossomStack];
                            newBlossomStack.push(secondVertexId);

                            const augmentingPath = BlossomAlgorithm.AugmentingPath(graphContract, matchingContract, newBlossomStack);

                            if (newBlossomStack.length === 0) {
                                throw new Error("Blossom stack is empty unexpectedly after recursive call.");
                            }

                            const b = newBlossomStack.pop()!;

                            if (augmentingPath.includes(b)) {
                                return BlossomAlgorithm.LiftBlossomPath(graph, matching, blossom, blossomForLifting, augmentingPath, b);
                            } else {
                                return augmentingPath;
                            }
                        }
                    }
                }
                edgeMark.add(new Edge(firstVertexId, secondVertexId).id);
            }
            vertexMark.add(firstVertexId);
        }

        return [];
    }

    public static MaximumMatching(graph: Graph, matching: Matching): Matching {
        const vertexPath = BlossomAlgorithm.AugmentingPath(graph, matching);
        if (vertexPath.length > 0) {
            const edgePath = BlossomAlgorithm.VertexPathToEdgePath(vertexPath);
            matching.Augment(edgePath);
            return BlossomAlgorithm.MaximumMatching(graph, matching);
        } else {
            return matching;
        }
    }

    public static MaximumMatchingInitial(graph: Graph): Matching {
        let initialMatching: Matching;
        if (graph.numEdges > 0) {
            const firstEdge = graph.GetAllEdges()[0];
            initialMatching = new Matching([firstEdge]);
        } else {
            initialMatching = new Matching();
        }
        return BlossomAlgorithm.MaximumMatching(graph, initialMatching);
    }
}

export {
    BlossomAlgorithm,
};