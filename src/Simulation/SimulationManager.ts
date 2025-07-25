import {Graph} from '../Graph/Graph.js';
import {Vertex} from '../Vertex/Vertex.js';
import {GraphGenerator} from '../Graph/GraphGenerator.js';
import {GraphParser} from '../Graph/GraphParser.js';
import {GraphVisualizer} from '../Graph/GraphVisualizer.js';
import {GraphLocalization} from '../Localization/GraphLocalization.js';
import {DepthFirstSearch} from '../DepthFirstSearch/DepthFirstSearch.js';
import {
    TRAVERSED_EDGE_COLOR,
    CURRENT_VERTEX_COLOR,
    VISITED_VERTEX_COLOR,
    LOCALIZED_VERTEX_COLOR,
    DEFAULT_VERTEX_COLOR,
    HYPOTHESIS_VERTEX_COLOR,
} from '../utils/constants.js';

class SimulationManager {
    private graphGenerator: GraphGenerator;
    private graphParser: GraphParser;
    private graphVisualizer: GraphVisualizer;
    private localizationAlgorithm!: GraphLocalization;
    private traversalStrategy!: DepthFirstSearch;

    private currentGraph!: Graph;

    private currentRobotVertex: Vertex | null = null;
    private nextMoveTimer: number | null = null;

    private adjacencyMatrixInput: HTMLTextAreaElement;
    private initialVertexInput: HTMLInputElement;
    private generateGraphButton: HTMLButtonElement;
    private autoMoveButton: HTMLButtonElement;
    private resetSimulationButton: HTMLButtonElement;
    private loadMatrixButton: HTMLButtonElement;

    private numVerticesInput: HTMLInputElement;
    private numAdditionalEdgesInput: HTMLInputElement;
    private minWeightInput: HTMLInputElement;
    private maxWeightInput: HTMLInputElement;
    private stepDelayInput: HTMLInputElement;

    constructor() {
        this.graphGenerator = new GraphGenerator();
        this.graphParser = new GraphParser();
        this.graphVisualizer = new GraphVisualizer('main-graph-container', 'robot-view-graph-container');

        this.adjacencyMatrixInput = document.getElementById('adjacencyMatrixInput') as HTMLTextAreaElement;
        this.initialVertexInput = document.getElementById('initialVertexInput') as HTMLInputElement;
        this.generateGraphButton = document.getElementById('generateGraphButton') as HTMLButtonElement;
        this.autoMoveButton = document.getElementById('autoMoveButton') as HTMLButtonElement;
        this.resetSimulationButton = document.getElementById('resetSimulationButton') as HTMLButtonElement;
        this.loadMatrixButton = document.getElementById('loadMatrixButton') as HTMLButtonElement;

        this.numVerticesInput = document.getElementById('numVerticesInput') as HTMLInputElement;
        this.numAdditionalEdgesInput = document.getElementById('numAdditionalEdgesInput') as HTMLInputElement;
        this.minWeightInput = document.getElementById('minWeightInput') as HTMLInputElement;
        this.maxWeightInput = document.getElementById('maxWeightInput') as HTMLInputElement;
        this.stepDelayInput = document.getElementById('stepDelayInput') as HTMLInputElement;


        this.BindEventListeners();
    }

    private BindEventListeners(): void {
        this.generateGraphButton.onclick = () => this.HandleGenerateGraphClick();
        this.autoMoveButton.onclick = () => this.StartExploration(parseInt(this.stepDelayInput.value));
        this.resetSimulationButton.onclick = () => this.ResetSimulation();
        this.loadMatrixButton.onclick = () => this.HandleLoadMatrixGraphClick();
    }

    public InitializeSimulation(graphToDisplay: Graph, initialVertexId?: string): void {
        if (this.nextMoveTimer !== null) {
            clearTimeout(this.nextMoveTimer);
            this.nextMoveTimer = null;
        }
        this.currentRobotVertex = null;

        this.currentGraph = graphToDisplay;
        this.traversalStrategy = new DepthFirstSearch(this.currentGraph);

        this.graphVisualizer.InitializeMainGraph(this.currentGraph);
        this.graphVisualizer.InitializeRobotViewGraph();

        const allVertices = this.currentGraph.GetAllVertices();
        for (const vertex of allVertices) {
            vertex.isVisited = false;
        }
        let robotStartVertex: Vertex | undefined;

        if (allVertices.length === 0) {
            return;
        }

        if (initialVertexId) {
            robotStartVertex = this.currentGraph.GetVertex(initialVertexId);
            if (!robotStartVertex) {
                robotStartVertex = allVertices[Math.floor(Math.random() * allVertices.length)];
            }
        } else {
            robotStartVertex = allVertices[Math.floor(Math.random() * allVertices.length)];
        }

        this.localizationAlgorithm = new GraphLocalization(this.currentGraph, robotStartVertex);

        this.currentRobotVertex = robotStartVertex;

        this.graphVisualizer.AddOrUpdateRobotVertex(this.currentRobotVertex, CURRENT_VERTEX_COLOR);

        console.log(`Robot started in vertex: ${this.currentRobotVertex.id}`);

        this.UpdateHypothesisVisualization();

    }

    public HandleGenerateGraphClick(): void {
        try {
            const numVertices = parseInt(this.numVerticesInput.value);
            const numAdditionalEdges = parseInt(this.numAdditionalEdgesInput.value);
            const minWeight = parseInt(this.minWeightInput.value);
            const maxWeight = parseInt(this.maxWeightInput.value);

            if (isNaN(numVertices) || numVertices < 2) {
                alert("Количество вершин должно быть >= 2.");
                return;
            }
            if (isNaN(numAdditionalEdges) || numAdditionalEdges < 0) {
                alert("Количество дополнительных рёбер должно быть >= 0.");
                return;
            }
            if (isNaN(minWeight) || minWeight < 1) {
                alert("Минимальный вес должен быть >= 1.");
                return;
            }
            if (isNaN(maxWeight) || maxWeight < minWeight) {
                alert("Максимальный вес должен быть больше минимального веса.");
                return;
            }

            const newGraph = this.graphGenerator.GenerateConnectedRandomGraph(
                numVertices,
                numAdditionalEdges,
                minWeight,
                maxWeight
            );
            this.InitializeSimulation(newGraph);
        } catch (error) {
            console.error("Error generating random graph:", (error as Error).message);
            alert(`Error: ${(error as Error).message}`);
        }
    }

    private HandleLoadMatrixGraphClick(): void {
        if (this.nextMoveTimer !== null) {
            clearTimeout(this.nextMoveTimer);
            this.nextMoveTimer = null;
        }

        const matrixString = this.adjacencyMatrixInput.value;
        if (!matrixString.trim()) {
            alert("Пожалуйста, введите матрицу смежности.");
            return;
        }

        try {
            const newGraph = this.graphParser.StringToAdjacencyMatrix(matrixString);

            const requestedInitialVertexNum = parseInt(this.initialVertexInput.value);
            if (isNaN(requestedInitialVertexNum) || requestedInitialVertexNum < 1 || requestedInitialVertexNum > newGraph.numVertices) {
                alert(`Некорректный ID начальной вершины. Введите число от 1 до ${newGraph.numVertices}.`);
                return;
            }
            const initialVertexId = requestedInitialVertexNum.toString();

            this.InitializeSimulation(newGraph, initialVertexId);
        } catch (error) {
            console.error("Error loading graph from matrix:", (error as Error).message);
            alert(`Ошибка загрузки графа из матрицы: ${(error as Error).message}`);
        }
    }

    private ResetSimulation(): void {
        this.InitializeSimulation(this.currentGraph, this.initialVertexInput.value);
    }

    private SimulateMove(fromId: string, toId: string): void {
        if (!this.currentGraph || !this.localizationAlgorithm || !this.currentRobotVertex) {
            return;
        }

        const fromVertex = this.currentGraph.GetVertex(fromId)!;
        const toVertex = this.currentGraph.GetVertex(toId)!;
        const edge = this.currentGraph.GetEdge(fromId, toId)!;

        fromVertex.isVisited = true;
        edge.isTraversed = true;

        this.currentRobotVertex = toVertex;

        this.graphVisualizer.mainVisNodes.update({id: toVertex.id, label: `${toVertex.label} (D:${toVertex.degree})`});

        this.graphVisualizer.AddOrUpdateRobotVertex(toVertex, CURRENT_VERTEX_COLOR);
        this.graphVisualizer.AddOrUpdateRobotVertex(fromVertex, VISITED_VERTEX_COLOR);
        this.graphVisualizer.AddOrUpdateRobotEdge(fromVertex.id, toVertex.id, edge.weight, TRAVERSED_EDGE_COLOR);

        const allVerticesTraversed = this.currentGraph.GetAllVertices().every(vertex => vertex.isVisited);

        const localizedVertexId = this.localizationAlgorithm.Move(fromVertex.degree, edge.weight, toVertex.degree, toVertex, allVerticesTraversed);

        this.UpdateHypothesisVisualization();

        if (localizedVertexId) {
            this.graphVisualizer.DisplayFullGraphInRobotView(this.currentGraph, localizedVertexId);
            const localizedVertex = this.currentGraph.GetVertex(localizedVertexId)!;

            this.graphVisualizer.UpdateVertexColor(localizedVertexId, LOCALIZED_VERTEX_COLOR, this.graphVisualizer.mainVisNodes);
            this.graphVisualizer.UpdateVertexLabel(localizedVertexId, `${localizedVertex.label} (D:${localizedVertex.degree})`, this.graphVisualizer.mainVisNodes);

            this.graphVisualizer.UpdateVertexColor(localizedVertexId, LOCALIZED_VERTEX_COLOR, this.graphVisualizer.robotVisNodes);
            this.graphVisualizer.UpdateVertexLabel(localizedVertexId, `${localizedVertex.label} (D:${localizedVertex.degree})`, this.graphVisualizer.robotVisNodes);

            if (this.nextMoveTimer !== null) {
                clearTimeout(this.nextMoveTimer);
                this.nextMoveTimer = null;
            }
        }
    }

    private UpdateHypothesisVisualization(): void {
        const currentHypotheses = this.localizationAlgorithm.GetHypotheses();
        const localizedVertex = this.localizationAlgorithm.GetLocalizedVertex();
        const allVertices = this.currentGraph.GetAllVertices();

        allVertices.forEach(vertex => {
            let nodeColor = DEFAULT_VERTEX_COLOR;

            if (localizedVertex && vertex.id === localizedVertex.id) {
                nodeColor = LOCALIZED_VERTEX_COLOR;
            } else {
                const isActiveHypothesis = currentHypotheses.some(hypo => hypo.vertexId === vertex.id);
                if (isActiveHypothesis) {
                    nodeColor = HYPOTHESIS_VERTEX_COLOR;
                }
            }
            this.graphVisualizer.UpdateVertexColor(vertex.id, nodeColor, this.graphVisualizer.mainVisNodes);
            this.graphVisualizer.mainVisNodes.update({id: vertex.id, label: `${vertex.label} (D:${vertex.degree})`});
        });
    }

    public StartExploration(stepDelay: number): void {
        if (this.nextMoveTimer !== null) {
            clearTimeout(this.nextMoveTimer);
        }

        if (!this.currentRobotVertex) {
            return;
        }

        this.traversalStrategy.InitializeDFS(this.currentRobotVertex.id);

        const MoveNext = () => {
            if (this.localizationAlgorithm.GetLocalizedVertex()) {
                if (this.nextMoveTimer !== null) {
                    clearTimeout(this.nextMoveTimer);
                }
                return;
            }

            const currentVertexId = this.currentRobotVertex!.id;
            const nextVertexId = this.traversalStrategy.GetNextMove(currentVertexId);

            if (!nextVertexId) {
                if (this.nextMoveTimer !== null) {
                    clearTimeout(this.nextMoveTimer);
                }
                return;
            }

            this.SimulateMove(currentVertexId, nextVertexId);

            this.nextMoveTimer = setTimeout(MoveNext, stepDelay);
        };

        this.nextMoveTimer = setTimeout(MoveNext, 500);
    }
}

export {
    SimulationManager,
};