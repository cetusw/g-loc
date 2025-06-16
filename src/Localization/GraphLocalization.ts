import { Graph } from '../Graph/Graph.js';
import { Vertex } from '../Vertex/Vertex.js';

import { SequenceEntry, HypotheticalVertex } from './Types.js';

class GraphLocalization {
    private graph: Graph;
    private observedSequence: SequenceEntry[] = [];
    private hypotheses: HypotheticalVertex[] = [];
    private _localizedVertex: Vertex | null = null;

    constructor(graph: Graph) {
        this.graph = graph;
        this.InitializeHypotheses();
    }

    private InitializeHypotheses(): void {
        const allVertices = this.graph.GetAllVertices();
        if (allVertices.length === 0) {
            console.warn("Graph has no vertices for hypothesis initialization.");
            this.hypotheses = [];
            return;
        }

        this.hypotheses = allVertices.map(vertex => ({
            vertexId: vertex.id,
            pathSequence: [],
            probability: 1,
        }));
        this._localizedVertex = null;
        console.log("Localization: Initial hypotheses IDs:", this.hypotheses.map(h => h.vertexId).join(', '));
    }

    public Move(observedFromVertexDegree: number, observedEdgeWeight: number, observedToVertexDegree: number): string | null {
        this.observedSequence.push({
            fromVertexDegree: observedFromVertexDegree,
            edgeWeight: observedEdgeWeight,
            toVertexDegree: observedToVertexDegree,
        });

        this.UpdateHypotheses();

        const remainingHypotheses = this.hypotheses.filter(h => h.probability > 0);

        if (remainingHypotheses.length === 1) {
            this._localizedVertex = this.graph.GetVertex(remainingHypotheses[0].vertexId)!;
            console.log(`Localization: Robot localized at vertex: ${this._localizedVertex.id}`);
            return this._localizedVertex.id;
        } else if (remainingHypotheses.length === 0) {
            console.warn("Localization failed: No hypotheses left.");
            this._localizedVertex = null;
            return null;
        } else {
            this._localizedVertex = null;
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
            if (oldHypothesis.probability === 0) {
                continue;
            }

            const currentHypotheticalVertex = this.graph.GetVertex(oldHypothesis.vertexId);
            if (!currentHypotheticalVertex) {
                console.warn(`Localization: Hypothetical vertex ${oldHypothesis.vertexId} not found. Dropping hypothesis.`);
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
                const matchDegree = lastObservedEntry.toVertexDegree === nextHypotheticalVertex.degree; // Match with observedToVertexDegree

                if (matchEdge && matchDegree) {
                    potentialNewHypotheses.push({
                        vertexId: nextHypotheticalVertex.id,
                        pathSequence: [...oldHypothesis.pathSequence, lastObservedEntry],
                        probability: 1,
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
            console.error("Localization failed. There are no remaining hypotheses.");
            this._localizedVertex = null;
        }
        console.log("Localization: New active hypotheses after filtering and deduplication:", this.hypotheses.map(h => h.vertexId).join(', '));
    }

    public GetHypotheses(): HypotheticalVertex[] {
        return this.hypotheses;
    }

    public GetLocalizedVertex(): Vertex | null {
        return this._localizedVertex;
    }
}

export {
    GraphLocalization,
};