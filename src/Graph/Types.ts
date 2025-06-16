type VisNode = {
    id: string;
    label: string;
    color?: any;
    x?: number;
    y?: number;
    degree?: number;
}

type VisEdge = {
    id: string;
    from: string;
    to: string;
    label?: string;
    color?: any;
}

export {
    VisEdge,
    VisNode,
}