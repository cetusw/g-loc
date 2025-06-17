import {Network, DataSet} from 'vis-network';
import {Graph} from './Graph.js';
import {Vertex} from '../Vertex/Vertex.js';
import {
    DEFAULT_VERTEX_COLOR,
    DEFAULT_EDGE_COLOR,
    COMMON_GRAPH_OPTIONS,
    LOCALIZED_VERTEX_COLOR,
    VISITED_VERTEX_COLOR,
    TRAVERSED_EDGE_COLOR,
} from "../utils/constants.js";

class GraphVisualizer {
    private readonly mainGraphContainer: HTMLElement;
    private readonly robotViewGraphContainer: HTMLElement;

    public mainVisNetwork!: Network;
    public mainVisNodes!: DataSet<any>;
    public mainVisEdges!: DataSet<any>;

    public robotVisNetwork!: Network;
    public robotVisNodes!: DataSet<any>;
    public robotVisEdges!: DataSet<any>;

    constructor(mainGraphContainerId: string, robotViewGraphContainerId: string) {
        const mainContainer = document.getElementById(mainGraphContainerId);
        const robotContainer = document.getElementById(robotViewGraphContainerId);

        if (!mainContainer || !robotContainer) {
            throw new Error(`Containers not found`);
        }
        this.mainGraphContainer = mainContainer;
        this.robotViewGraphContainer = robotContainer;
    }

    public InitializeMainGraph(graph: Graph): void {
        if (this.mainVisNetwork) {
            this.mainVisNetwork.destroy();
        }

        const mainGraphData = graph.ToVisData();
        mainGraphData.nodes.forEach(node => {
            const vertex = graph.GetVertex(node.id);
            if (vertex) {
                node.label = `${vertex.label} (D:${vertex.degree})`;
            }
        });

        this.mainVisNodes = new DataSet(mainGraphData.nodes);
        this.mainVisEdges = new DataSet(mainGraphData.edges);

        this.mainVisNetwork = new Network(this.mainGraphContainer, {
            nodes: this.mainVisNodes,
            edges: this.mainVisEdges
        }, COMMON_GRAPH_OPTIONS);
    }

    public InitializeRobotViewGraph(): void {
        if (this.robotVisNetwork) {
            this.robotVisNetwork.destroy();
        }

        this.robotVisNodes = new DataSet();
        this.robotVisEdges = new DataSet();

        this.robotVisNetwork = new Network(this.robotViewGraphContainer, {
            nodes: this.robotVisNodes,
            edges: this.robotVisEdges
        }, COMMON_GRAPH_OPTIONS);
    }

    public UpdateVertexColor(nodeId: string, color: typeof DEFAULT_VERTEX_COLOR, visVerticesSet: DataSet<any>): void {
        visVerticesSet.update({id: nodeId, color: color});
    }

    public UpdateEdgeColor(edgeId: string, color: typeof DEFAULT_EDGE_COLOR, visEdgesSet: DataSet<any>): void {
        visEdgesSet.update({id: edgeId, color: color});
    }

    public AddOrUpdateRobotVertex(vertex: Vertex, color: typeof DEFAULT_VERTEX_COLOR): void {
        this.robotVisNodes.update({
            id: vertex.id,
            label: `(D:${vertex.degree})`,
            color: color,
            degree: vertex.degree
        });
    }

    public AddOrUpdateRobotEdge(fromId: string, toId: string, weight: number, color: typeof DEFAULT_EDGE_COLOR): void {
        const edgeId = [fromId, toId].sort().join('-');
        this.robotVisEdges.update({
            id: edgeId,
            from: fromId,
            to: toId,
            label: weight.toString(),
            color: color
        });
    }

    public UpdateVertexLabel(nodeId: string, label: string, visNodesSet: DataSet<any>): void {
        visNodesSet.update({id: nodeId, label: label});
    }

    public DisplayFullGraphInRobotView(graph: Graph, localizedVertexId: string): void {
        this.robotVisNodes.clear();
        this.robotVisEdges.clear();

        graph.GetAllVertices().forEach(vertex => {
            let color = DEFAULT_VERTEX_COLOR;
            let label = `${vertex.label} (D:${vertex.degree})`;

            if (vertex.id === localizedVertexId) {
                color = LOCALIZED_VERTEX_COLOR;
            }
            else if (vertex.isVisited) {
                color = VISITED_VERTEX_COLOR;
            }

            this.robotVisNodes.add({
                id: vertex.id,
                label: label,
                color: color,
                x: this.mainVisNodes.get(vertex.id)?.x,
                y: this.mainVisNodes.get(vertex.id)?.y
            });
        });

        graph.GetAllEdges().forEach(edge => {
            let color = DEFAULT_EDGE_COLOR;
            if (edge.isTraversed) {
                color = TRAVERSED_EDGE_COLOR;
            }

            this.robotVisEdges.add({
                id: edge.id,
                from: edge.fromVertexId,
                to: edge.toVertexId,
                label: edge.weight.toString(),
                color: color
            });
        });
    }
}

export {
    GraphVisualizer,
};