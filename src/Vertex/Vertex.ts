class Vertex {
    public id: string;
    public label: string;
    public degree: number = 0;
    public isVisited: boolean = false;

    constructor(id: string, label: string) {
        this.id = id;
        this.label = label;
    }
}

export {
    Vertex,
};