class Edge {
    public id: string;
    public fromVertexId: string;
    public toVertexId: string;
    public weight: number;
    public isTraversed: boolean = false;

    constructor(from: string, to: string, weight?: number) {
        this.id = [from, to].sort().join('-');
        this.fromVertexId = from;
        this.toVertexId = to;
        this.weight = weight ? weight : 1;
    }

    Equals(other: Edge): boolean {
        return this.fromVertexId === other.fromVertexId && this.toVertexId === other.toVertexId;
    }
}

export {
    Edge,
};