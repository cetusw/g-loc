import { SimulationManager } from './Simulation/SimulationManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const simulationManager = new SimulationManager();
    simulationManager.HandleGenerateGraphClick();
});