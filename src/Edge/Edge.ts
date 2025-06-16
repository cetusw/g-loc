class Edge {
    public id: string;
    public fromVertexId: string;
    public toVertexId: string;
    public weight: number;
    public isTraversed: boolean = false;

    constructor(id: string, from: string, to: string, weight: number) {
        this.id = id;
        this.fromVertexId = from;
        this.toVertexId = to;
        this.weight = weight;
    }
}

export {
    Edge,
};