/**
 * ArgOS Extensions Integration Path
 * 
 * This file outlines the step-by-step process for integrating the Temporal Consciousness
 * and Cross-Reality Knowledge extensions into the existing ArgOS HESMS framework.
 * 
 * The integration is designed to be non-disruptive, preserving the existing functionality
 * while adding new cognitive capabilities to the agents.
 */

// =====================================================================
// STEP 1: Project File Structure Setup
// =====================================================================

/*
Organize the project with the following folder structure:

/HESMS
  /src
    /core
      ArgOS-Framework.js
    /memory
      argos-memory-extension.js
    /consciousness
      argos-consciousness-extension.js
      temporal-consciousness-system.js
    /knowledge
      cross-reality-knowledge.js
    /integration
      ArgOS-Framework-Integration.js
  /demo
    ArgOS-HESMS-Demo.HTML
    demo.css
  /docs
    README.md
  LICENSE

This structure separates core functionality, memory systems, consciousness extensions,
and knowledge systems into logical components.
*/

// =====================================================================
// STEP 2: Update Framework Integration File
// =====================================================================

// Import the new systems
import { 
  TemporalConsciousness,
  createTemporalConsciousnessSystem,
  integrateTemporalConsciousnessWithArgOS
} from '../consciousness/temporal-consciousness-system.js';

import { 
  CrossRealityKnowledge,
  createCrossRealitySystem,
  integrateCrossRealityWithArgOS
} from '../knowledge/cross-reality-knowledge.js';

// Extend the ArgOSCognitiveArchitecture class to include the new components
export class ArgOSCognitiveArchitecture {
  constructor(simulationWorld, options = {}) {
    this.world = simulationWorld || createWorld();
    this.options = { ...INTEGRATION_CONFIG, ...options };
    
    // Existing managers and systems
    this.memoryManager = null;
    this.memorySystem = null;
    this.decisionSystem = null;
    this.consciousnessManager = null;
    this.consciousnessSystem = null;
    
    // New extension managers and systems
    this.temporalConsciousnessManager = null;
    this.temporalConsciousnessSystem = null;
    this.crossRealityManager = null;
    this.crossRealitySystem = null;
    
    this.initialized = false;
    this.enhancedRenderSystem = null;
  }

  // Update the configuration with new extension options
  static get DEFAULT_CONFIG() {
    return {
      ENABLE_ENHANCED_MEMORY: true,
      ENABLE_CONSCIOUSNESS: true,
      ENABLE_VISUALIZATION: true,
      
      // New extension toggles
      ENABLE_TEMPORAL_CONSCIOUSNESS: true,
      ENABLE_CROSS_REALITY_KNOWLEDGE: true,
      
      MEMORY_OPTIONS: {
        ENABLE_CLOUD_SYNC: false,
        MEMORY_SYNC_INTERVAL: 20,
        SEMANTIC_UPDATE_INTERVAL: 60
      },
      CONSCIOUSNESS_OPTIONS: {
        DREAM_ENABLED: true,
        REFLECTION_ENABLED: true,
        IMAGINATION_ENABLED: true,
        NARRATIVE_ENABLED: true
      },
      
      // Configuration for new extensions
      TEMPORAL_CONSCIOUSNESS_OPTIONS: {
        FUTURE_SIMULATION_STEPS: 5,
        PATTERN_DETECTION_THRESHOLD: 0.65,
        MEMORY_RECONSTRUCTION_INTERVAL: 50,
        NARRATIVE_UPDATE_INTERVAL: 25
      },
      CROSS_REALITY_OPTIONS: {
        ABSTRACTION_CONFIDENCE_THRESHOLD: 0.6,
        GENERALIZATION_INTERVAL: 50,
        ENVIRONMENT_TRANSITION_THRESHOLD: 0.6
      }
    };
  }

  // Update initialize method to include the new extensions
  async initialize() {
    if (this.initialized) return this;
    console.log("Initializing ArgOS Cognitive Architecture...");
    
    // Initialize HESMS (original)
    if (this.options.ENABLE_ENHANCED_MEMORY) {
      const hesms = integrateHESMSWithArgOS(this.world, this.options.MEMORY_OPTIONS);
      this.memoryManager = hesms.memoryManager;
      this.memorySystem = hesms.memorySystem;
      this.decisionSystem = hesms.decisionSystem;
      await this.memoryManager.initialize();
    }
    
    // Initialize Consciousness Extension (original)
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
    
    // Initialize Temporal Consciousness Extension (new)
    if (this.options.ENABLE_TEMPORAL_CONSCIOUSNESS && this.memoryManager) {
      const temporalConsciousness = integrateTemporalConsciousnessWithArgOS(
        this.world,
        this.memoryManager,
        this.options.TEMPORAL_CONSCIOUSNESS_OPTIONS
      );
      this.temporalConsciousnessManager = temporalConsciousness.temporalConsciousnessManager;
      this.temporalConsciousnessSystem = temporalConsciousness.temporalConsciousnessSystem;
      await this.temporalConsciousnessManager.initialize();
    }
    
    // Initialize Cross-Reality Knowledge Extension (new)
    if (this.options.ENABLE_CROSS_REALITY_KNOWLEDGE && this.memoryManager) {
      const crossReality = integrateCrossRealityWithArgOS(
        this.world,
        this.memoryManager,
        this.options.CROSS_REALITY_OPTIONS
      );
      this.crossRealityManager = crossReality.crossRealityManager;
      this.crossRealitySystem = crossReality.crossRealitySystem;
      await this.crossRealityManager.initialize();
    }
    
    // Create enhanced render system
    if (this.options.ENABLE_VISUALIZATION) {
      this.enhancedRenderSystem = this.createEnhancedRenderSystem();
    }
    
    this.initialized = true;
    return this;
  }

  // Update systems collection to include new extensions
  getSystems() {
    const systems = [];
    
    // Add original systems
    if (this.memorySystem) systems.push(this.memorySystem);
    if (this.consciousnessSystem) systems.push(this.consciousnessSystem);
    if (this.decisionSystem) systems.push(this.decisionSystem);
    
    // Add new extension systems
    if (this.temporalConsciousnessSystem) systems.push(this.temporalConsciousnessSystem);
    if (this.crossRealitySystem) systems.push(this.crossRealitySystem);
    
    return systems;
  }

  // Update createEnhancedRenderSystem to visualize new extensions
  createEnhancedRenderSystem() {
    const baseRenderSystem = createRenderSystem();
    const memoryManager = this.memoryManager;
    const consciousnessManager = this.consciousnessManager;
    const temporalConsciousnessManager = this.temporalConsciousnessManager;
    const crossRealityManager = this.crossRealityManager;
    
    // Extend the base render system to include memory and consciousness visualization
    return (world, canvas) => {
      baseRenderSystem(world, canvas);
      
      if (!canvas) return world;
      
      const ctx = canvas.getContext('2d');
      const agents = Array.from({ length: world.entities.length }, (_, i) => i)
        .filter(i => Position[i] && SensoryData[i]);
      
      const pixelsPerUnit = 5; // Scale factor for visualization
      
      // Draw memory visualizations
      if (memoryManager && this.options.ENABLE_ENHANCED_MEMORY) {
        agents.forEach(agent => {
          visualizeAgentMemory(ctx, agent, memoryManager, pixelsPerUnit);
        });
      }
      
      // Draw consciousness visualizations
      if (consciousnessManager && this.options.ENABLE_CONSCIOUSNESS) {
        agents.forEach(agent => {
          visualizeAgentConsciousness(ctx, agent, consciousnessManager, pixelsPerUnit);
        });
      }
      
      // Draw temporal consciousness visualizations (new)
      if (temporalConsciousnessManager && this.options.ENABLE_TEMPORAL_CONSCIOUSNESS) {
        agents.forEach(agent => {
          this.visualizeTemporalConsciousness(ctx, agent, temporalConsciousnessManager, pixelsPerUnit);
        });
      }
      
      // Draw cross-reality knowledge visualizations (new)
      if (crossRealityManager && this.options.ENABLE_CROSS_REALITY_KNOWLEDGE) {
        agents.forEach(agent => {
          this.visualizeCrossRealityKnowledge(ctx, agent, crossRealityManager, pixelsPerUnit);
        });
      }
      
      return world;
    };
  }

  // Add visualization for temporal consciousness
  visualizeTemporalConsciousness(ctx, agent, temporalConsciousnessManager, pixelsPerUnit) {
    if (!TemporalConsciousness[agent]) return;
    
    const x = Position.x[agent] * pixelsPerUnit;
    const y = Position.y[agent] * pixelsPerUnit;
    
    // Get agent's temporal consciousness data
    const report = temporalConsciousnessManager.getTemporalConsciousnessReport(agent);
    if (!report) return;
    
    // Draw future projections as faint trajectory lines
    const futureScenarios = report.futureScenarios || [];
    if (futureScenarios.length > 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      
      futureScenarios.forEach((scenario, index) => {
        const probability = scenario.probability || 0.5;
        
        // Draw trajectory line with opacity based on probability
        ctx.strokeStyle = `rgba(65, 105, 225, ${probability * 0.7})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        // Draw a future path line
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // Calculate a future point based on current direction and scenario
        const angle = index * (Math.PI / futureScenarios.length);
        const distance = 15 * probability;
        ctx.lineTo(
          x + Math.cos(angle) * distance,
          y + Math.sin(angle) * distance
        );
        ctx.stroke();
      });
      
      ctx.restore();
    }
    
    // Draw narrative coherence as a subtle glow
    const coherence = report.narrative?.coherence || 0.5;
    if (coherence > 0.4) {
      const glowSize = 8 * coherence;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
      gradient.addColorStop(0, `rgba(147, 112, 219, ${coherence * 0.4})`);
      gradient.addColorStop(1, 'rgba(147, 112, 219, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add visualization for cross-reality knowledge
  visualizeCrossRealityKnowledge(ctx, agent, crossRealityManager, pixelsPerUnit) {
    if (!CrossRealityKnowledge[agent]) return;
    
    const x = Position.x[agent] * pixelsPerUnit;
    const y = Position.y[agent] * pixelsPerUnit;
    
    // Get agent's cross-reality knowledge data
    const report = crossRealityManager.getCrossRealityReport(agent);
    if (!report) return;
    
    // Draw abstraction level as a colored aura
    const abstractionLevel = report.abstractionLevel || 0.3;
    const auraSize = 7 + (abstractionLevel * 5);
    
    // Color based on which level of knowledge is dominant
    const counts = report.knowledgeCounts || { low: 0, mid: 0, high: 0 };
    let auraColor;
    
    if (counts.high > counts.mid && counts.high > counts.low) {
      // High-level knowledge dominant - blue
      auraColor = `rgba(30, 144, 255, ${0.2 + abstractionLevel * 0.3})`;
    } else if (counts.mid > counts.low) {
      // Mid-level knowledge dominant - purple
      auraColor = `rgba(138, 43, 226, ${0.2 + abstractionLevel * 0.3})`;
    } else {
      // Low-level knowledge dominant - green
      auraColor = `rgba(46, 139, 87, ${0.2 + abstractionLevel * 0.3})`;
    }
    
    ctx.fillStyle = auraColor;
    ctx.beginPath();
    ctx.arc(x, y, auraSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw environment transition indicator if agent recently changed environments
    const environmentSimilarity = report.environmentSimilarity || 1.0;
    if (environmentSimilarity < 0.8) {
      // Lower similarity = stronger transition effect
      const transitionStrength = (1 - environmentSimilarity) * 0.7;
      const pulseSize = 10 + Math.sin(Date.now() / 300) * 3;
      
      ctx.strokeStyle = `rgba(255, 165, 0, ${transitionStrength})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Update createAgent to include new components
  createAgent(config = {}) {
    const agent = addEntity(this.world);
    
    // Add required components to agent (original)
    if (!Position[agent]) {
      Position.addTo(this.world)(agent);
      Position.x[agent] = config.x || Math.random() * 100;
      Position.y[agent] = config.y || Math.random() * 100;
    }
    
    if (!SensoryData[agent]) {
      SensoryData.addTo(this.world)(agent);
    }
    
    if (!Actions[agent]) {
      Actions.addTo(this.world)(agent);
    }
    
    if (!Goals[agent]) {
      Goals.addTo(this.world)(agent);
      Goals.primaryType[agent] = config.goalType || 0;
    }
    
    if (!CognitiveState[agent]) {
      CognitiveState.addTo(this.world)(agent);
      CognitiveState.emotionalState[agent] = config.emotional || 50;
      CognitiveState.adaptability[agent] = config.adaptability || 50;
    }
    
    if (!RealityFlux[agent]) {
      RealityFlux.addTo(this.world)(agent);
    }
    
    // Initialize memory and consciousness for this agent
    if (this.initialized) {
      if (this.memoryManager) {
        this.memoryManager.initializeAgentMemory(agent);
      }
      
      if (this.consciousnessManager) {
        this.consciousnessManager.initializeAgentConsciousness(agent);
      }
      
      // Initialize new extensions for this agent
      if (this.temporalConsciousnessManager) {
        this.temporalConsciousnessManager.initializeAgentTemporalConsciousness(agent);
      }
      
      if (this.crossRealityManager) {
        this.crossRealityManager.initializeAgentCrossRealityKnowledge(agent);
      }
    }
    
    return agent;
  }

  // Add a method to get extended agent stats
  getExtendedAgentStats(agent) {
    if (!this.initialized) return null;
    
    // Get basic stats
    const basicStats = this.getAgentStats(agent);
    if (!basicStats) return null;
    
    // Add temporal consciousness stats
    let temporalStats = null;
    if (this.temporalConsciousnessManager && TemporalConsciousness[agent]) {
      temporalStats = this.temporalConsciousnessManager.getTemporalConsciousnessReport(agent);
    }
    
    // Add cross-reality knowledge stats
    let crossRealityStats = null;
    if (this.crossRealityManager && CrossRealityKnowledge[agent]) {
      crossRealityStats = this.crossRealityManager.getCrossRealityReport(agent);
    }
    
    // Combine all stats
    return {
      ...basicStats,
      temporalConsciousness: temporalStats,
      crossRealityKnowledge: crossRealityStats
    };
  }
}

// =====================================================================
// STEP 3: Update Demo Application
// =====================================================================

// Import the updated integration file
import { ArgOSCognitiveArchitecture, createCognitiveSimulation } from '../integration/ArgOS-Framework-Integration.js';

// Add UI elements to visualize and control the new extensions
function addExtensionControls() {
  // Add extension control panel to demo HTML
  const controlPanel = document.createElement('div');
  controlPanel.className = 'extension-controls';
  controlPanel.innerHTML = `
    <h3>Extensions</h3>
    <div class="control-group">
      <label>
        <input type="checkbox" id="enableTemporalConsciousness" checked>
        Temporal Consciousness
      </label>
      <label>
        <input type="checkbox" id="enableCrossRealityKnowledge" checked>
        Cross-Reality Knowledge
      </label>
    </div>
    <div class="control-actions">
      <button id="triggerEnvironmentSwitch">Switch Environment</button>
      <button id="visualizeTemporalPatterns">View Temporal Patterns</button>
      <button id="visualizeKnowledgeHierarchy">View Knowledge Hierarchy</button>
    </div>
  `;
  
  document.querySelector('.controls').appendChild(controlPanel);
  
  // Add extension visualization panel
  const visualizationPanel = document.createElement('div');
  visualizationPanel.className = 'extension-visualization';
  visualizationPanel.innerHTML = `
    <div class="panel-header">
      <h3>Extension Data</h3>
      <select id="extensionDataType">
        <option value="temporalPatterns">Temporal Patterns</option>
        <option value="futureScenarios">Future Scenarios</option>
        <option value="narrativeStructure">Narrative Structure</option>
        <option value="knowledgeHierarchy">Knowledge Hierarchy</option>
        <option value="environmentProfiles">Environment Profiles</option>
      </select>
    </div>
    <div class="visualization-content" id="extensionDataContent">
      Select an agent and data type to view details
    </div>
  `;
  
  document.querySelector('.stats-panel').after(visualizationPanel);
  
  // Wire up extension controls
  setupExtensionControlHandlers();
}

// =====================================================================
// STEP 4: Add Extension API Endpoints
// =====================================================================

// These would be added to an API interface if you have one

// Get agent's temporal consciousness data
function getAgentTemporalConsciousnessData(agentId) {
  if (!simulation || !simulation.temporalConsciousnessManager) return null;
  return simulation.temporalConsciousnessManager.getTemporalConsciousnessReport(agentId);
}

// Get agent's cross-reality knowledge data
function getAgentCrossRealityKnowledgeData(agentId) {
  if (!simulation || !simulation.crossRealityManager) return null;
  return simulation.crossRealityManager.getCrossRealityReport(agentId);
}

// Get all environment profiles from cross-reality system
function getEnvironmentProfiles() {
  if (!simulation || !simulation.crossRealityManager) return [];
  return Array.from(simulation.crossRealityManager.environments.values())
    .map(env => env.getSummary());
}

// Trigger an environment transition for testing
function triggerEnvironmentTransition(agentId, newEnvironmentId) {
  if (!simulation || !simulation.world) return false;
  
  // Create a reality flux to simulate environment change
  if (RealityFlux[agentId]) {
    RealityFlux.effectType[agentId] = 1; // Teleport effect
    
    // Set a timeout to reset the effect
    setTimeout(() => {
      if (RealityFlux[agentId]) {
        RealityFlux.effectType[agentId] = 0;
      }
    }, 2000);
    
    // Force environment ID update if we have cross-reality system
    if (simulation.crossRealityManager && CrossRealityKnowledge[agentId]) {
      CrossRealityKnowledge.currentEnvironmentId[agentId] = newEnvironmentId;
    }
    
    return true;
  }
  
  return false;
}

// =====================================================================
// STEP 5: Extension Configuration File
// =====================================================================

// Create a separate configuration file for fine-tuning the extensions

export const EXTENSION_CONFIG = {
  // Temporal Consciousness Configuration
  TEMPORAL_CONSCIOUSNESS: {
    FUTURE_SIMULATION_STEPS: 5,         // How many steps ahead to simulate
    FUTURE_SIMULATION_COUNT: 3,         // Number of alternate futures to simulate
    PATTERN_DETECTION_THRESHOLD: 0.65,  // Minimum confidence for pattern detection
    MEMORY_RECONSTRUCTION_INTERVAL: 50, // Cycles between memory reconstructions
    NARRATIVE_UPDATE_INTERVAL: 25,      // Cycles between narrative updates
    MAX_NARRATIVE_LENGTH: 100,          // Maximum events in the temporal narrative
    MIN_PATTERN_INSTANCES: 3,           // Minimum occurrences for pattern recognition
    MAX_TEMPORAL_PATTERNS: 20,          // Maximum patterns to track
    FUTURE_WEIGHT_DECAY: 0.85,          // How quickly future predictions lose certainty
    MEMORY_SIMILARITY_THRESHOLD: 0.7    // Threshold for considering memories similar
  },
  
  // Cross-Reality Knowledge Configuration
  CROSS_REALITY_KNOWLEDGE: {
    LOW_LEVEL_CAPACITY: 20,             // Max low-level knowledge entries
    MID_LEVEL_CAPACITY: 15,             // Max mid-level knowledge entries
    HIGH_LEVEL_CAPACITY: 10,            // Max high-level knowledge entries
    ABSTRACTION_CONFIDENCE_THRESHOLD: 0.6, // Min confidence to abstract to higher level
    ABSTRACTION_INSTANCE_THRESHOLD: 5,  // Min instances to consider for abstraction
    KNOWLEDGE_DECAY_RATE: 0.05,         // How quickly knowledge decays without reinforcement
    ADAPTATION_LEARNING_RATE: 0.2,      // How quickly adaptation occurs in new environments
    MINIMUM_KNOWLEDGE_CONFIDENCE: 0.2,  // Threshold below which knowledge is forgotten
    GENERALIZATION_INTERVAL: 50,        // Cycles between generalization attempts
    VALIDATION_THRESHOLD: 0.7,          // Threshold for validating knowledge in new environment
    ENVIRONMENT_TRANSITION_THRESHOLD: 0.6, // How different environments must be to trigger adaptation
    MAX_ENVIRONMENT_CACHE: 5            // Maximum number of environments to remember
  }
};

// =====================================================================
// STEP 6: Integration Test
// =====================================================================

// Create a simple test to verify all extensions are working

async function runIntegrationTest() {
  console.log("Running ArgOS HESMS Extensions Integration Test...");
  
  // Create simulation with all extensions enabled
  const simulation = await createCognitiveSimulation({
    ENABLE_ENHANCED_MEMORY: true,
    ENABLE_CONSCIOUSNESS: true,
    ENABLE_TEMPORAL_CONSCIOUSNESS: true,
    ENABLE_CROSS_REALITY_KNOWLEDGE: true,
    ENABLE_VISUALIZATION: true
  });
  
  // Create test agent
  const agent = simulation.createAgent({
    x: 50,
    y: 50,
    adaptability: 60,
    emotional: 50
  });
  
  // Create environment entities
  for (let i = 0; i < 5; i++) {
    simulation.createEnvironmentalEntity(0, 30 + Math.random() * 40, 30 + Math.random() * 40);
    simulation.createEnvironmentalEntity(1, 30 + Math.random() * 40, 30 + Math.random() * 40);
    simulation.createEnvironmentalEntity(2, 80 + Math.random() * 20, 80 + Math.random() * 20);
  }
  
  // Run simulation for a few steps
  await simulation.runSimulation(50);
  
  // Verify components were added correctly
  console.log("Components verification:");
  console.log("- EnhancedMemory:", EnhancedMemory[agent] ? "OK" : "Missing");
  console.log("- ConsciousnessState:", ConsciousnessState[agent] ? "OK" : "Missing");
  console.log("- TemporalConsciousness:", TemporalConsciousness[agent] ? "OK" : "Missing");
  console.log("- CrossRealityKnowledge:", CrossRealityKnowledge[agent] ? "OK" : "Missing");
  
  // Get agent stats
  const stats = simulation.getExtendedAgentStats(agent);
  console.log("Agent Stats:", stats);
  
  // Test environment transition
  triggerEnvironmentTransition(agent, 2);
  console.log("Triggered environment transition");
  
  // Run more steps after transition
  await simulation.runSimulation(50);
  
  // Get updated stats after transition
  const updatedStats = simulation.getExtendedAgentStats(agent);
  console.log("Updated Agent Stats:", updatedStats);
  
  console.log("Integration test complete.");
  return simulation;
}

// =====================================================================
// STEP 7: Documentation
// =====================================================================

/*
Update the project README.md and create specific documentation for each extension:

1. Update main README.md to mention new extensions
2. Create docs/temporal-consciousness.md with detailed documentation
3. Create docs/cross-reality-knowledge.md with detailed documentation
4. Update API documentation to include new methods

Example update to the README Features section:

## ✨ Key Features

### 🧩 Memory System
- **Dual-Layer Memory Architecture**
  - **Episodic Memory**: Records specific events with context, position, importance, and emotional impact
  - **Semantic Memory**: Extracts patterns and relationships from episodic memories

...

### 🌀 Temporal Consciousness
- **Episodic Future Thinking**: Agents project themselves into hypothetical future scenarios
- **Temporal Pattern Recognition**: Detection of patterns that unfold over time
- **Memory Reconstruction**: Reinterpretation of past memories based on new information
- **Temporal Identity**: Development of a continuous sense of self across time

### 🔄 Cross-Reality Knowledge
- **Hierarchical Knowledge Structure**: Knowledge organized at low, mid, and high abstraction levels
- **Knowledge Transfer**: Application of learned patterns across different environments
- **Environment Recognition**: Identification of environment characteristics and similarities
- **Adaptive Abstraction**: Dynamic adjustment of knowledge confidence based on context
*/

// Export integration utilities
export {
  runIntegrationTest,
  addExtensionControls,
  getAgentTemporalConsciousnessData,
  getAgentCrossRealityKnowledgeData,
  getEnvironmentProfiles,
  triggerEnvironmentTransition,
  EXTENSION_CONFIG
};
