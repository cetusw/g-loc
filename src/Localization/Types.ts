type SequenceEntry = {
    edgeWeight: number;
    fromVertexDegree: number;
    toVertexDegree: number;
}

type HypotheticalVertex = {
    vertexId: string;
    pathSequence: SequenceEntry[];
}

export {
    SequenceEntry,
    HypotheticalVertex,
}