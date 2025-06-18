import {Graph} from '../Graph/Graph.js';
import {Vertex} from '../Vertex/Vertex.js';

import {SequenceEntry, HypotheticalVertex} from './Types.js';

class GraphLocalization {
    private graph: Graph;
    private observedSequence: SequenceEntry[] = [];
    private hypotheses: HypotheticalVertex[] = [];
    private localizedVertex: Vertex | null = null;

    constructor(graph: Graph, currentVertex: Vertex) {
        this.graph = graph;
        this.InitializeHypotheses(currentVertex);
    }

    private InitializeHypotheses(currentVertex: Vertex): void {
        const allVertices = this.graph.GetAllVertices();
        if (allVertices.length === 0) {
            this.hypotheses = [];
            return;
        }

        let initialHypotheticalVertices = allVertices.filter(vertex => {
            return vertex.degree === currentVertex.degree;
        });

        this.hypotheses = initialHypotheticalVertices.map(vertex => ({
            vertexId: vertex.id,
            pathSequence: [],
        }));

        this.localizedVertex = null;
        console.log("Initial hypotheses IDs:", this.hypotheses.map(h => h.vertexId).join(', '));
    }

    public Move(observedFromVertexDegree: number, observedEdgeWeight: number, observedToVertexDegree: number, currentVertex: Vertex): string | null {
        this.observedSequence.push({
            fromVertexDegree: observedFromVertexDegree,
            edgeWeight: observedEdgeWeight,
            toVertexDegree: observedToVertexDegree,
        });

        this.UpdateHypotheses();

        const remainingHypotheses = this.hypotheses;

        if (remainingHypotheses.length === 1) {
            this.localizedVertex = this.graph.GetVertex(remainingHypotheses[0].vertexId)!;
            console.log(`Robot localized at vertex: ${this.localizedVertex.id}`);
            return this.localizedVertex.id;
        } else if (remainingHypotheses.length === 0) {
            console.log("Localization failed: No hypotheses left.");
            this.localizedVertex = null;
            return null;
        } else if (remainingHypotheses.length === this.graph.numVertices) {
            this.localizedVertex = currentVertex;
            console.log(`Robot localized at vertex: ${this.localizedVertex.id}`);
            return this.localizedVertex.id;
        } else {
            this.localizedVertex = null;
            return null;
        }
    }

    private UpdateHypotheses(): void {
        const potentialNewHypotheses: HypotheticalVertex[] = [];
        const lastObservedEntry = this.observedSequence[this.observedSequence.length - 1];

        if (!lastObservedEntry) {
            return;
        }

        for (const oldHypothesis of this.hypotheses) {
            const currentHypotheticalVertex = this.graph.GetVertex(oldHypothesis.vertexId);
            if (!currentHypotheticalVertex) {
                continue;
            }

            if (oldHypothesis.pathSequence.length === 0) {
                if (currentHypotheticalVertex.degree !== lastObservedEntry.fromVertexDegree) {
                    continue;
                }
            } else {
                const lastHypoObservedToDegree = oldHypothesis.pathSequence[oldHypothesis.pathSequence.length - 1].toVertexDegree;
                if (currentHypotheticalVertex.degree !== lastHypoObservedToDegree) {
                    continue;
                }
            }

            const neighbors = this.graph.GetNeighbors(currentHypotheticalVertex.id);

            for (const neighborId of neighbors) {
                const hypotheticalEdge = this.graph.GetEdge(currentHypotheticalVertex.id, neighborId);
                const nextHypotheticalVertex = this.graph.GetVertex(neighborId);

                if (!hypotheticalEdge || !nextHypotheticalVertex) {
                    continue;
                }

                const matchEdge = lastObservedEntry.edgeWeight === hypotheticalEdge.weight;
                const matchDegree = lastObservedEntry.toVertexDegree === nextHypotheticalVertex.degree;

                if (matchEdge && matchDegree) {
                    potentialNewHypotheses.push({
                        vertexId: nextHypotheticalVertex.id,
                        pathSequence: [...oldHypothesis.pathSequence, lastObservedEntry],
                    });
                }
            }
        }

        const uniqueHypothesisMap = new Map<string, HypotheticalVertex>();
        for (const hypo of potentialNewHypotheses) {
            if (!uniqueHypothesisMap.has(hypo.vertexId)) {
                uniqueHypothesisMap.set(hypo.vertexId, hypo);
            }
        }
        this.hypotheses = Array.from(uniqueHypothesisMap.values());

        if (this.hypotheses.length === 0 && this.observedSequence.length > 0) {
            console.log("Localization failed. There are no remaining hypotheses.");
            this.localizedVertex = null;
        }
        console.log("New active hypotheses after filtering:", this.hypotheses.map(h => h.vertexId).join(', '));
    }

    public GetHypotheses(): HypotheticalVertex[] {
        console.log(this.hypotheses);
        return this.hypotheses;
    }

    public GetLocalizedVertex(): Vertex | null {
        return this.localizedVertex;
    }
}

export {
    GraphLocalization,
};