/**
 * ArgOS Framework Integration
 * 
 * Integrates HESMS (Hierarchical Episodic-Semantic Memory System) and 
 * the Consciousness Extension with the core ArgOS simulation framework.
 * 
 * Provides a single interface for initializing and managing the complete
 * cognitive architecture for simulation agents.
 * 
 * Part of Project 89's advanced cognitive simulation exploration.
 */

import { 
  World,
  createWorld,
  addEntity,
  Position, 
  SensoryData, 
  Actions, 
  Goals, 
  CognitiveState, 
  RealityFlux,
  Environmental,
  createDefaultSystems,
  createRenderSystem
} from './argos-framework.js';

import { 
  EnhancedMemory, 
  MemoryManager, 
  integrateHESMSWithArgOS,
  visualizeAgentMemory
} from './argos-memory-extension.js';

import {
  ConsciousnessState,
  integrateConsciousnessWithArgOS,
  visualizeAgentConsciousness
} from './argos-consciousness-extension.js';

// Configuration
const INTEGRATION_CONFIG = {
  ENABLE_ENHANCED_MEMORY: true,
  ENABLE_CONSCIOUSNESS: true,
  ENABLE_VISUALIZATION: true,
  MEMORY_OPTIONS: {
    ENABLE_CLOUD_SYNC: false,
    MEMORY_SYNC_INTERVAL: 20,
    SEMANTIC_UPDATE_INTERVAL: 60,
    CONSOLIDATION_INTERVAL: 100,
    SPATIAL_CELL_SIZE: 10
  },
  CONSCIOUSNESS_OPTIONS: {
    DREAM_ENABLED: true,
    REFLECTION_ENABLED: true,
    IMAGINATION_ENABLED: true,
    NARRATIVE_ENABLED: true
  },
  WORLD_WIDTH: 160,
  WORLD_HEIGHT: 120,
  PIXELS_PER_UNIT: 5
};

// Main Integration Class
export class ArgOSCognitiveArchitecture {
  constructor(simulationWorld, options = {}) {
    this.world = simulationWorld || createWorld();
    this.options = { ...INTEGRATION_CONFIG, ...options };
    this.memoryManager = null;
    this.memorySystem = null;
    this.decisionSystem = null;
    this.consciousnessManager = null;
    this.consciousnessSystem = null;
    this.initialized = false;
    this.enhancedRenderSystem = null;
  }

  async initialize() {
    if (this.initialized) return this;
    console.log("Initializing ArgOS Cognitive Architecture...");

    try {
      // Initialize HESMS
      if (this.options.ENABLE_ENHANCED_MEMORY) {
        const hesms = integrateHESMSWithArgOS(this.world, this.options.MEMORY_OPTIONS);
        this.memoryManager = hesms.memoryManager;
        this.memorySystem = hesms.memorySystem;
        this.decisionSystem = hesms.decisionSystem;
        await this.memoryManager.initialize();
      }

      // Initialize Consciousness Extension
      if (this.options.ENABLE_CONSCIOUSNESS && this.memoryManager) {
        const consciousness = integrateConsciousnessWithArgOS(
          this.world, 
          this.memoryManager, 
          this.options.CONSCIOUSNESS_OPTIONS
        );
        this.consciousnessManager = consciousness.consciousnessManager;
        this.consciousnessSystem = consciousness.consciousnessSystem;
        await this.consciousnessManager.initialize();
      }

      // Create enhanced render system
      if (this.options.ENABLE_VISUALIZATION) {
        this.enhancedRenderSystem = this.createEnhancedRenderSystem();
      }

      this.initialized = true;
      console.log("Initialization complete.");
    } catch (error) {
      console.error("Initialization failed:", error);
      throw error;
    }
    return this;
  }

  getSystems() {
    const systems = [];
    if (this.memorySystem) systems.push(this.memorySystem);
    if (this.consciousnessSystem) systems.push(this.consciousnessSystem);
    if (this.decisionSystem) systems.push(this.decisionSystem);
    return systems;
  }

  createEnhancedRenderSystem() {
    const baseRenderSystem = createRenderSystem();
    const memoryManager = this.memoryManager;
    const consciousnessManager = this.consciousnessManager;
    const pixelsPerUnit = this.options.PIXELS_PER_UNIT;

    return (world, canvas) => {
      baseRenderSystem(world, canvas);
      if (!canvas) return world;

      const ctx = canvas.getContext('2d');
      const agents = Array.from({ length: world.entities.length }, (_, i) => i)
        .filter(i => Position[i] && SensoryData[i]);

      if (memoryManager && this.options.ENABLE_ENHANCED_MEMORY) {
        agents.forEach(agent => {
          visualizeAgentMemory(ctx, agent, memoryManager, pixelsPerUnit);
        });
      }

      if (consciousnessManager && this.options.ENABLE_CONSCIOUSNESS) {
        agents.forEach(agent => {
          visualizeAgentConsciousness(ctx, agent, consciousnessManager, pixelsPerUnit);
        });
      }

      return world;
    };
  }

  createAgent(config = {}) {
    const agent = addEntity(this.world);

    Position.addTo(this.world)(agent);
    Position.x[agent] = config.x || Math.random() * this.options.WORLD_WIDTH;
    Position.y[agent] = config.y || Math.random() * this.options.WORLD_HEIGHT;

    SensoryData.addTo(this.world)(agent);
    Actions.addTo(this.world)(agent);

    Goals.addTo(this.world)(agent);
    Goals.primaryType[agent] = config.goalType ?? Math.floor(Math.random() * 3);

    CognitiveState.addTo(this.world)(agent);
    CognitiveState.emotionalState[agent] = config.emotional ?? (40 + Math.random() * 20);
    CognitiveState.adaptability[agent] = config.adaptability ?? (40 + Math.random() * 30);

    RealityFlux.addTo(this.world)(agent);

    if (this.initialized) {
      if (this.memoryManager) this.memoryManager.initializeAgentMemory(agent);
      if (this.consciousnessManager) this.consciousnessManager.initializeAgentConsciousness(agent);
    }

    return agent;
  }

  createEnvironmentalEntity(type, x, y) {
    const entity = addEntity(this.world);

    Position.addTo(this.world)(entity);
    Position.x[entity] = x ?? Math.random() * this.options.WORLD_WIDTH;
    Position.y[entity] = y ?? Math.random() * this.options.WORLD_HEIGHT;

    Environmental.addTo(this.world)(entity);
    Environmental.type[entity] = type; // 0: Resource, 1: Obstacle, 2: Hazard

    return entity;
  }

  getAgentStats(agent) {
    if (!this.initialized || !EnhancedMemory[agent]) return null;

    const memoryId = EnhancedMemory.memoryId[agent];
    const episodicMemories = this.memoryManager?.episodicQueue.get(memoryId)?.length || 0;
    const longTermMemories = this.memoryManager?.longTermMemory?.get(memoryId)?.length || 0;
    const patterns = this.memoryManager?.findRelevantPatterns(agent).length || 0;
    const consciousness = this.consciousnessManager?.getConsciousnessReport(agent) || null;

    return {
      agent,
      position: { x: Position.x[agent], y: Position.y[agent] },
      goal: Goals.primaryType[agent],
      emotional: CognitiveState[agent]?.emotionalState,
      adaptability: CognitiveState[agent]?.adaptability,
      memoryFidelity: EnhancedMemory.globalFidelity[agent],
      episodicMemories,
      longTermMemories,
      semanticPatterns: patterns,
      consciousness
    };
  }

  runSimulation(steps = 100, stepCallback = null) {
    if (!this.initialized) {
      console.warn("Cognitive architecture not initialized. Call initialize() first.");
      return Promise.resolve();
    }

    const systems = this.getSystems();
    let currentStep = 0;

    return new Promise((resolve) => {
      function runStep() {
        if (currentStep >= steps) {
          resolve();
          return;
        }

        systems.forEach(system => system(this.world));
        if (stepCallback) stepCallback(this.world, currentStep);

        currentStep++;
        setTimeout(runStep, 0);
      }.bind(this);

      runStep();
    });
  }
}

// Helper Function to Create a Complete Simulation
export async function createCognitiveSimulation(options = {}) {
  const world = createWorld();
  const defaultSystems = createDefaultSystems();
  defaultSystems.forEach(system => world.systems.push(system));

  const cognitiveArchitecture = new ArgOSCognitiveArchitecture(world, options);
  await cognitiveArchitecture.initialize();

  const cognitiveSystems = cognitiveArchitecture.getSystems();
  cognitiveSystems.forEach(system => world.systems.push(system));

  if (options.ENABLE_VISUALIZATION !== false && cognitiveArchitecture.enhancedRenderSystem) {
    world.renderSystem = cognitiveArchitecture.enhancedRenderSystem;
  }

  return cognitiveArchitecture;
}

// Demo Setup
export async function runDemoSimulation(
  elementId, 
  agentCount = 5, 
  resourceCount = 10, 
  obstacleCount = 7, 
  hazardCount = 3, 
  worldWidth = INTEGRATION_CONFIG.WORLD_WIDTH, 
  worldHeight = INTEGRATION_CONFIG.WORLD_HEIGHT
) {
  console.log("Setting up demo simulation...");

  const canvas = document.getElementById(elementId);
  if (!canvas) {
    console.error(`Element with ID ${elementId} not found.`);
    return;
  }

  const pixelsPerUnit = INTEGRATION_CONFIG.PIXELS_PER_UNIT;
  canvas.width = worldWidth * pixelsPerUnit;
  canvas.height = worldHeight * pixelsPerUnit;

  const cognitiveArchitecture = await createCognitiveSimulation({
    ENABLE_VISUALIZATION: true,
    MEMORY_OPTIONS: { ENABLE_CLOUD_SYNC: false },
    WORLD_WIDTH: worldWidth,
    WORLD_HEIGHT: worldHeight
  });

  const world = cognitiveArchitecture.world;

  for (let i = 0; i < agentCount; i++) {
    cognitiveArchitecture.createAgent();
  }

  for (let i = 0; i < resourceCount; i++) {
    cognitiveArchitecture.createEnvironmentalEntity(0);
  }

  for (let i = 0; i < obstacleCount; i++) {
    cognitiveArchitecture.createEnvironmentalEntity(1);
  }

  for (let i = 0; i < hazardCount; i++) {
    cognitiveArchitecture.createEnvironmentalEntity(2);
  }

  function animate() {
    world.systems.forEach(system => system(world));
    world.renderSystem(world, canvas);
    requestAnimationFrame(animate);
  }

  animate();
  return cognitiveArchitecture;
}

// Export All Components
export default {
  ArgOSCognitiveArchitecture,
  createCognitiveSimulation,
  runDemoSimulation,
  INTEGRATION_CONFIG
};
