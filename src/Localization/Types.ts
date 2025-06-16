type SequenceEntry = {
    edgeWeight: number;
    fromVertexDegree: number;
    toVertexDegree: number;
}

type HypotheticalVertex = {
    vertexId: string;
    pathSequence: SequenceEntry[];
    probability: number;
}

export {
    SequenceEntry,
    HypotheticalVertex,
}