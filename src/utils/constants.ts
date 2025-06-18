const DEFAULT_VERTEX_COLOR = { background: 'lightblue', border: '#2B7CE9' };
const VISITED_VERTEX_COLOR = { background: '#D3D3D3', border: '#A9A9A9' };
const CURRENT_VERTEX_COLOR = { background: 'red', border: '#A50000' };
const HYPOTHESIS_VERTEX_COLOR = { background: 'orange', border: '#FF8C00' };
const LOCALIZED_VERTEX_COLOR = { background: 'purple', border: '#6A0DAD' };

const DEFAULT_EDGE_COLOR = { color: '#848484' };
const TRAVERSED_EDGE_COLOR = { color: 'green' };

const COMMON_GRAPH_OPTIONS = {
    edges: {
        arrows: undefined,
        font: { align: 'middle', size: 10, color: '#333' },
        color: DEFAULT_EDGE_COLOR,
        smooth: { enabled: true, type: "dynamic", roundness: 0 }
    },
    nodes: {
        color: DEFAULT_VERTEX_COLOR,
        shape: 'dot', size: 15,
        font: { size: 12, color: '#333' },
        borderWidth: 2
    },
    physics: { enabled: true, stabilization: { iterations: 2000 } },
    layout: { improvedLayout: true },
    interaction: { dragNodes: true, zoomView: true, navigationButtons: true }
};

export {
    DEFAULT_VERTEX_COLOR,
    VISITED_VERTEX_COLOR,
    CURRENT_VERTEX_COLOR,
    HYPOTHESIS_VERTEX_COLOR,
    LOCALIZED_VERTEX_COLOR,
    DEFAULT_EDGE_COLOR,
    TRAVERSED_EDGE_COLOR,
    COMMON_GRAPH_OPTIONS,
}