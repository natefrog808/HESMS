/**
 * TemporalConsciousnessSystem
 * 
 * A system that manages temporal consciousness capabilities for agents in the ArgOS HESMS framework.
 * This includes:
 * - Episodic Future Thinking: Simulating possible future states
 * - Temporal Pattern Recognition: Detecting sequences of events over time
 * - Memory Reconstruction: Updating past memories with new insights
 * - Temporal Identity: Maintaining a coherent self-narrative over time
 * 
 * Part of the ArgOS Hierarchical Episodic-Semantic Memory System (HESMS)
 */

import { 
  defineComponent, 
  defineQuery, 
  defineSystem, 
  Types, 
  addComponent 
} from 'bitecs';
import { 
  Position, 
  SensoryData, 
  Goals, 
  CognitiveState, 
  RealityFlux 
} from './argos-framework.js';
import { 
  EnhancedMemory, 
  MemoryManager 
} from './argos-memory-extension.js';
import { 
  ConsciousnessState
} from './argos-consciousness-extension.js';

// Configuration constants
const TEMPORAL_CONFIG = {
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
};

// TemporalConsciousness Component
export const TemporalConsciousness = defineComponent({
  // Episodic Future Thinking: Stores IDs of simulated future states
  futureScenariosCount: Types.ui8,        // Number of active future scenarios
  futureScenarioEntities: [Types.eid, 15], // Entity IDs of future simulations
  futureScenarioProbabilities: [Types.f32, 15], // Probabilities of each future
  futureScenarioTimestamps: [Types.ui32, 15], // When each future was generated

  // Temporal Pattern Recognition: Tracks sequential patterns
  patternCount: Types.ui8,              // Number of detected temporal patterns
  patternStrengths: [Types.f32, 20],    // Confidence in each pattern
  patternLastMatched: [Types.ui32, 20], // When each pattern last occurred
  patternSequenceLength: [Types.ui8, 20], // Length of each pattern sequence
  
  // Memory Reconstruction: Tracks memories needing updates
  memoryUpdatePending: Types.ui8,       // Flag for pending updates
  memoriesToUpdate: [Types.eid, 10],    // Memory IDs needing reconstruction
  lastMemoryUpdateTime: Types.ui32,     // Last reconstruction timestamp
  
  // Temporal Identity: Maintains self-narrative over time
  narrativeLength: Types.ui16,          // Current length of the narrative
  narrativeLastUpdateTime: Types.ui32,  // Last narrative update timestamp
  narrativeCoherence: Types.f32,        // Measure of narrative consistency
  selfContinuity: Types.f32             // Agent's sense of temporal continuity
});

// Helper Classes for managing temporal data

/**
 * Class representing a future scenario predicted by an agent
 */
class FutureScenario {
  constructor(agent, timestamp, steps = TEMPORAL_CONFIG.FUTURE_SIMULATION_STEPS) {
    this.agentId = agent;
    this.timestamp = timestamp;
    this.steps = steps;
    this.probability = 1.0;
    this.stateSequence = [];
    this.actionSequence = [];
    this.outcomeValue = 0;
    this.entityId = 0; // Will be set when registered
  }

  /**
   * Add a predicted future state to this scenario
   */
  addState(state, action) {
    this.stateSequence.push(state);
    this.actionSequence.push(action);
    
    // Decay probability with each step (future becomes less certain)
    this.probability *= TEMPORAL_CONFIG.FUTURE_WEIGHT_DECAY;
    
    return this;
  }

  /**
   * Evaluate the predicted outcome value of this scenario
   */
  evaluateOutcome(goals) {
    // Simple evaluation: positive for resource gain, negative for hazards
    let value = 0;
    
    // Process the final state
    const finalState = this.stateSequence[this.stateSequence.length - 1];
    
    // Resource acquisition value
    if (finalState.resources > 0) {
      value += finalState.resources * 10;
    }
    
    // Hazard avoidance value
    if (finalState.hazards > 0) {
      value -= finalState.hazards * 15;
    }
    
    // Goal achievement value
    if (goals && finalState.goalProgress > 0) {
      value += finalState.goalProgress * 5;
    }
    
    this.outcomeValue = value;
    return value;
  }

  /**
   * Check if this scenario is still valid given the current state
   */
  isStillValid(currentState, validityThreshold = 0.6) {
    if (this.stateSequence.length === 0) return false;
    
    // Compare initial predicted state with current actual state
    const initialPrediction = this.stateSequence[0];
    
    // Calculate similarity between prediction and reality
    const similarity = this.calculateStateSimilarity(initialPrediction, currentState);
    
    return similarity >= validityThreshold;
  }

  /**
   * Calculate similarity between two states (0-1)
   */
  calculateStateSimilarity(state1, state2) {
    if (!state1 || !state2) return 0;
    
    // Compare key state properties
    let matches = 0;
    let total = 0;
    
    // Position similarity (if exists)
    if (state1.position && state2.position) {
      const posDist = Math.hypot(
        state1.position.x - state2.position.x, 
        state1.position.y - state2.position.y
      );
      matches += Math.max(0, 1 - (posDist / 20)); // Normalize distance
      total++;
    }
    
    // Resource state
    if (state1.resources !== undefined && state2.resources !== undefined) {
      const resourceDiff = Math.abs(state1.resources - state2.resources);
      matches += Math.max(0, 1 - (resourceDiff / 5)); // Normalize difference
      total++;
    }
    
    // Hazard state
    if (state1.hazards !== undefined && state2.hazards !== undefined) {
      const hazardDiff = Math.abs(state1.hazards - state2.hazards);
      matches += Math.max(0, 1 - (hazardDiff / 3)); // Normalize difference
      total++;
    }
    
    // Goal progress
    if (state1.goalProgress !== undefined && state2.goalProgress !== undefined) {
      const progressDiff = Math.abs(state1.goalProgress - state2.goalProgress);
      matches += Math.max(0, 1 - progressDiff); // Already 0-1
      total++;
    }
    
    return total > 0 ? matches / total : 0;
  }
  
  /**
   * Serialize the scenario for storage
   */
  serialize() {
    return {
      agentId: this.agentId,
      timestamp: this.timestamp,
      probability: this.probability,
      stateSequence: this.stateSequence,
      actionSequence: this.actionSequence,
      outcomeValue: this.outcomeValue
    };
  }
  
  /**
   * Deserialize from storage
   */
  static deserialize(data) {
    const scenario = new FutureScenario(data.agentId, data.timestamp);
    scenario.probability = data.probability;
    scenario.stateSequence = data.stateSequence;
    scenario.actionSequence = data.actionSequence;
    scenario.outcomeValue = data.outcomeValue;
    return scenario;
  }
}

/**
 * Class representing a temporal pattern recognized by an agent
 */
class TemporalPattern {
  constructor(sequence = [], agentId = 0) {
    this.sequence = sequence;       // Array of event types or states
    this.confidence = 0.5;          // Confidence in this pattern (0-1)
    this.occurrences = [];          // Timestamps when pattern was observed
    this.lastMatchedTime = 0;       // Last time this pattern was matched
    this.predictiveValue = 0.5;     // How useful for prediction (0-1)
    this.agentId = agentId;         // Agent who discovered this pattern
    this.id = `pattern-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  
  /**
   * Add a new occurrence of this pattern
   */
  addOccurrence(timestamp) {
    this.occurrences.push(timestamp);
    this.lastMatchedTime = timestamp;
    
    // Increase confidence with more occurrences
    this.confidence = Math.min(0.95, this.confidence + (1 / (this.occurrences.length + 5)));
    
    return this;
  }
  
  /**
   * Check if a sequence of events matches this pattern
   */
  matches(events) {
    if (events.length < this.sequence.length) return false;
    
    // Check for match starting at each position
    for (let i = 0; i <= events.length - this.sequence.length; i++) {
      let matches = true;
      
      for (let j = 0; j < this.sequence.length; j++) {
        if (!this.eventMatches(events[i + j], this.sequence[j])) {
          matches = false;
          break;
        }
      }
      
      if (matches) return true;
    }
    
    return false;
  }
  
  /**
   * Check if two events match (including fuzzy matching)
   */
  eventMatches(event1, event2) {
    // Simple comparison for basic types
    if (event1.type !== undefined && event2.type !== undefined) {
      return event1.type === event2.type;
    }
    
    // For complex events, check key attributes
    return JSON.stringify(event1) === JSON.stringify(event2);
  }
  
  /**
   * Predict what comes next after a partial match
   */
  predictNext(partialSequence) {
    if (partialSequence.length === 0) return null;
    
    // Check if this is a prefix of our pattern
    for (let i = 0; i < this.sequence.length - 1; i++) {
      if (i + partialSequence.length > this.sequence.length) break;
      
      let isPrefix = true;
      for (let j = 0; j < partialSequence.length; j++) {
        if (!this.eventMatches(partialSequence[j], this.sequence[i + j])) {
          isPrefix = false;
          break;
        }
      }
      
      if (isPrefix) {
        return this.sequence[i + partialSequence.length];
      }
    }
    
    return null;
  }
  
  /**
   * Calculate decay in confidence based on time since last match
   */
  updateConfidence(currentTime) {
    if (this.lastMatchedTime === 0) return this.confidence;
    
    const timeSinceMatch = currentTime - this.lastMatchedTime;
    const confidenceDecay = Math.min(0.2, timeSinceMatch / 5000);
    
    this.confidence = Math.max(0.1, this.confidence - confidenceDecay);
    return this.confidence;
  }
}

/**
 * Class for managing memory reconstruction
 */
class MemoryReconstructor {
  constructor(memoryManager) {
    this.memoryManager = memoryManager;
    this.reconstructionQueue = new Map(); // memory ID -> new context
  }
  
  /**
   * Queue a memory for reconstruction
   */
  queueMemoryForReconstruction(memoryId, newContext) {
    this.reconstructionQueue.set(memoryId, newContext);
  }
  
  /**
   * Process memory reconstruction queue
   */
  processReconstructions(agent) {
    if (this.reconstructionQueue.size === 0) return [];
    
    const processedMemories = [];
    this.reconstructionQueue.forEach((newContext, memoryId) => {
      const reconstructed = this.reconstructMemory(agent, memoryId, newContext);
      if (reconstructed) {
        processedMemories.push(reconstructed);
      }
    });
    
    this.reconstructionQueue.clear();
    return processedMemories;
  }
  
  /**
   * Reconstruct a specific memory with new information
   */
  reconstructMemory(agent, memoryId, newContext) {
    // Get episodic memories for this agent
    const memoryIdValue = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryIdValue) || [];
    
    // Find the specific memory to reconstruct
    const memory = memories.find(m => m.id === memoryId);
    if (!memory) return null;
    
    // Create reconstructed memory (copying original with modifications)
    const reconstructed = { ...memory };
    
    // Apply reconstruction changes
    reconstructed.context = { ...memory.context, ...newContext };
    reconstructed.importance = Math.min(1.0, memory.importance + 0.1); // Higher importance
    reconstructed.fidelity = Math.min(1.0, memory.fidelity * 0.95); // Slightly less accurate
    reconstructed.tags = [...memory.tags, 'reconstructed'];
    reconstructed.reconstructionTime = this.memoryManager.world.time;
    
    // Record the reconstruction as a new episodic memory
    return this.memoryManager.recordEpisodicMemory(agent, {
      entityId: memory.entityId,
      entityType: memory.entityType,
      position: memory.position,
      importance: reconstructed.importance,
      context: reconstructed.context,
      fidelity: reconstructed.fidelity,
      tags: reconstructed.tags,
      emotional: memory.emotionalImpact
    });
  }
  
  /**
   * Find memories that should be reconstructed based on new information
   */
  findMemoriesToReconstruct(agent, newExperience) {
    if (!newExperience) return [];
    
    const memoryIdValue = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryIdValue) || [];
    
    // Find memories that could be reinterpreted based on new experience
    return memories
      .filter(memory => {
        // Skip recently reconstructed memories
        if (memory.tags && memory.tags.includes('reconstructed')) {
          return false;
        }
        
        // Check if new experience is related to this memory
        return this.isExperienceRelatedToMemory(newExperience, memory);
      })
      .map(memory => memory.id);
  }
  
  /**
   * Check if a new experience is related to an existing memory
   */
  isExperienceRelatedToMemory(experience, memory) {
    // Check for same entity
    if (experience.entityId === memory.entityId) return true;
    
    // Check for proximity in space and time
    const spatialProximity = Math.hypot(
      experience.position.x - memory.position.x,
      experience.position.y - memory.position.y
    ) < 20;
    
    const temporalProximity = Math.abs(experience.timestamp - memory.timestamp) < 100;
    
    // Check for contextual similarity
    const contextMatch = experience.context && memory.context &&
      Object.keys(experience.context).some(key => 
        memory.context[key] === experience.context[key]
      );
    
    return (spatialProximity && temporalProximity) || contextMatch;
  }
}

/**
 * Class for maintaining temporal identity and narrative
 */
class TemporalNarrative {
  constructor(maxLength = TEMPORAL_CONFIG.MAX_NARRATIVE_LENGTH) {
    this.events = [];
    this.maxLength = maxLength;
    this.narrativeTheme = null;
    this.chapters = [];
    this.coherence = 0.5;
    this.lastUpdateTime = 0;
  }
  
  /**
   * Add an event to the narrative
   */
  addEvent(event, timestamp) {
    // Add new event
    this.events.push({
      event,
      timestamp,
      chapter: this.getCurrentChapter()
    });
    
    // Maintain maximum length
    if (this.events.length > this.maxLength) {
      this.events.shift();
    }
    
    // Update narrative organization
    this.updateNarrativeStructure();
    
    return this.events.length;
  }
  
  /**
   * Get current chapter number
   */
  getCurrentChapter() {
    return this.chapters.length > 0 ? this.chapters.length - 1 : 0;
  }
  
  /**
   * Update narrative structure after adding events
   */
  updateNarrativeStructure() {
    // Check for chapter transitions (significant shifts)
    if (this.shouldCreateNewChapter()) {
      this.startNewChapter();
    }
    
    // Update narrative theme
    this.updateTheme();
    
    // Calculate narrative coherence
    this.calculateCoherence();
  }
  
  /**
   * Check if we should create a new chapter
   */
  shouldCreateNewChapter() {
    if (this.events.length < 5) return false;
    
    const recentEvents = this.events.slice(-5);
    
    // Check for significant shifts in content
    const eventTypes = recentEvents.map(e => e.event.entityType);
    const uniqueTypes = [...new Set(eventTypes)];
    
    // New chapter if event types suddenly diverse
    if (uniqueTypes.length >= 3) return true;
    
    // New chapter if significant time gap
    const latestTimestamp = recentEvents[recentEvents.length - 1].timestamp;
    const earliestTimestamp = recentEvents[0].timestamp;
    if (latestTimestamp - earliestTimestamp > 200) return true;
    
    return false;
  }
  
  /**
   * Start a new narrative chapter
   */
  startNewChapter() {
    this.chapters.push({
      startIndex: this.events.length - 1,
      startTime: this.events[this.events.length - 1].timestamp,
      theme: null,
      keyEvents: []
    });
    
    // Mark the beginning of the new chapter
    if (this.events.length > 0) {
      this.events[this.events.length - 1].chapterStart = true;
    }
  }
  
  /**
   * Update the narrative theme based on events
   */
  updateTheme() {
    if (this.events.length < 3) return;
    
    // Count event types to find dominant theme
    const typeCounts = {};
    this.events.forEach(e => {
      const type = e.event.entityType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    // Find most common event type
    let maxCount = 0;
    let dominantType = null;
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantType = parseInt(type);
      }
    });
    
    // Assign narrative theme based on dominant type
    switch (dominantType) {
      case 0: // Resource
        this.narrativeTheme = 'exploration';
        break;
      case 2: // Hazard
        this.narrativeTheme = 'survival';
        break;
      case 3: // Agent
        this.narrativeTheme = 'social';
        break;
      default:
        this.narrativeTheme = 'journey';
    }
    
    // Update current chapter theme
    if (this.chapters.length > 0) {
      this.chapters[this.chapters.length - 1].theme = this.narrativeTheme;
    }
  }
  
  /**
   * Calculate the coherence of the narrative
   */
  calculateCoherence() {
    if (this.events.length < 5) {
      this.coherence = 0.5;
      return;
    }
    
    // Check for continuous spatial progression
    let spatialContinuity = 0;
    for (let i = 1; i < this.events.length; i++) {
      const prev = this.events[i - 1].event;
      const curr = this.events[i].event;
      
      const distance = Math.hypot(
        curr.position.x - prev.position.x,
        curr.position.y - prev.position.y
      );
      
      // Higher continuity for smaller distances
      spatialContinuity += Math.max(0, 1 - (distance / 30));
    }
    spatialContinuity /= (this.events.length - 1);
    
    // Check for thematic consistency
    const allTypes = this.events.map(e => e.event.entityType);
    const uniqueTypes = new Set(allTypes);
    const thematicConsistency = 1 - (uniqueTypes.size / 4); // Normalize by max types
    
    // Check for temporal continuity
    let temporalContinuity = 0;
    for (let i = 1; i < this.events.length; i++) {
      const timeDiff = this.events[i].timestamp - this.events[i - 1].timestamp;
      temporalContinuity += Math.max(0, 1 - (timeDiff / 100));
    }
    temporalContinuity /= (this.events.length - 1);
    
    // Overall coherence
    this.coherence = (
      spatialContinuity * 0.3 + 
      thematicConsistency * 0.4 + 
      temporalContinuity * 0.3
    );
    
    return this.coherence;
  }
  
  /**
   * Get a summary of the narrative
   */
  getSummary() {
    return {
      theme: this.narrativeTheme,
      chapterCount: this.chapters.length,
      eventCount: this.events.length,
      coherence: this.coherence,
      keyEvents: this.getKeyEvents(3)
    };
  }
  
  /**
   * Get key events from the narrative
   */
  getKeyEvents(count = 3) {
    // Sort events by importance
    return [...this.events]
      .sort((a, b) => b.event.importance - a.event.importance)
      .slice(0, count)
      .map(e => ({
        type: e.event.entityType,
        timestamp: e.timestamp,
        position: e.event.position,
        chapter: e.chapter
      }));
  }
}

// TemporalConsciousnessSystem implementation
export class TemporalConsciousnessSystem {
  constructor(world, memoryManager) {
    this.world = world;
    this.memoryManager = memoryManager;
    this.futureScenarios = new Map(); // agentId -> FutureScenario[]
    this.temporalPatterns = new Map(); // agentId -> TemporalPattern[]
    this.narratives = new Map(); // agentId -> TemporalNarrative
    this.memoryReconstructor = new MemoryReconstructor(memoryManager);
    this.initialized = false;
  }
  
  /**
   * Initialize the system
   */
  async initialize() {
    if (this.initialized) return;
    
    // Find all eligible agents (must have enhanced memory)
    const agentEntities = this.memoryManager.findAgentEntities();
    
    // Initialize temporal consciousness for each agent
    await Promise.all(agentEntities.map(agent => 
      this.initializeAgentTemporalConsciousness(agent)
    ));
    
    this.initialized = true;
    console.log(`TemporalConsciousnessSystem: Initialized for ${agentEntities.length} agents`);
    return this;
  }
  
  /**
   * Initialize temporal consciousness for an agent
   */
  async initializeAgentTemporalConsciousness(agent) {
    // Skip if agent already has temporal consciousness
    if (TemporalConsciousness[agent]) return;
    
    // Add the component
    addComponent(this.world, TemporalConsciousness, agent);
    
    // Initialize component values
    TemporalConsciousness.futureScenariosCount[agent] = 0;
    TemporalConsciousness.patternCount[agent] = 0;
    TemporalConsciousness.memoryUpdatePending[agent] = 0;
    TemporalConsciousness.narrativeLength[agent] = 0;
    TemporalConsciousness.narrativeLastUpdateTime[agent] = this.world.time;
    TemporalConsciousness.lastMemoryUpdateTime[agent] = this.world.time;
    TemporalConsciousness.narrativeCoherence[agent] = 0.5;
    TemporalConsciousness.selfContinuity[agent] = 0.3;
    
    // Initialize agent's data structures
    this.futureScenarios.set(agent, []);
    this.temporalPatterns.set(agent, []);
    this.narratives.set(agent, new TemporalNarrative());
    
    return agent;
  }
  
  /**
   * Create a system using this manager
   */
  createSystem() {
    // Define query for agents with temporal consciousness
    const tcQuery = defineQuery([TemporalConsciousness, EnhancedMemory, CognitiveState]);
    const temporalConsciousnessManager = this;
    
    // Define and return the system
    return defineSystem(async (world) => {
      if (!temporalConsciousnessManager.initialized) {
        await temporalConsciousnessManager.initialize();
      }
      
      const agents = tcQuery(world);
      const currentTime = world.time;
      
      for (const agent of agents) {
        // Process agent's temporal consciousness components
        temporalConsciousnessManager.updateFutureSimulations(agent, currentTime);
        temporalConsciousnessManager.updateTemporalPatterns(agent, currentTime);
        temporalConsciousnessManager.updateMemoryReconstruction(agent, currentTime);
        temporalConsciousnessManager.updateTemporalNarrative(agent, currentTime);
        
        // Integrate temporal aspects into consciousness
        temporalConsciousnessManager.integrateWithConsciousness(agent);
      }
      
      return world;
    });
  }
  
  /**
   * Update future simulations for an agent
   */
  updateFutureSimulations(agent, currentTime) {
    const agentScenarios = this.futureScenarios.get(agent) || [];
    
    // Prune invalid scenarios
    const currentState = this.getCurrentAgentState(agent);
    const validScenarios = agentScenarios.filter(scenario => 
      scenario.isStillValid(currentState)
    );
    
    // Generate new scenarios if needed
    if (validScenarios.length < TEMPORAL_CONFIG.FUTURE_SIMULATION_COUNT) {
      const newScenarioCount = TEMPORAL_CONFIG.FUTURE_SIMULATION_COUNT - validScenarios.length;
      for (let i = 0; i < newScenarioCount; i++) {
        const newScenario = this.generateFutureScenario(agent, currentTime, currentState);
        if (newScenario) {
          validScenarios.push(newScenario);
        }
      }
    }
    
    // Update component with scenario data
    TemporalConsciousness.futureScenariosCount[agent] = Math.min(validScenarios.length, 15);
    for (let i = 0; i < validScenarios.length && i < 15; i++) {
      const scenario = validScenarios[i];
      TemporalConsciousness.futureScenarioEntities[agent * 15 + i] = scenario.entityId;
      TemporalConsciousness.futureScenararioProbabilities[agent * 15 + i] = scenario.probability;
      TemporalConsciousness.futureScenarioTimestamps[agent * 15 + i] = scenario.timestamp;
    }
    
    // Store updated scenarios
    this.futureScenarios.set(agent, validScenarios);
  }
  
  /**
   * Generate a new future scenario for an agent
   */
  generateFutureScenario(agent, currentTime, currentState) {
    // Create new scenario
    const scenario = new FutureScenario(agent, currentTime);
    
    // Generate possible sequence of actions
    const possibleActions = this.getPossibleActions(agent);
    
    // Simulate sequence of steps
    let simulatedState = { ...currentState };
    for (let step = 0; step < TEMPORAL_CONFIG.FUTURE_SIMULATION_STEPS; step++) {
      // Choose action with some randomness
      const actionIndex = Math.floor(Math.random() * possibleActions.length);
      const action = possibleActions[actionIndex];
      
      // Predict next state using semantic patterns
      const nextState = this.predictNextState(agent, simulatedState, action);
      
      // Add to scenario
      scenario.addState(nextState, action);
      
      // Update for next iteration
      simulatedState = nextState;
    }
    
    // Evaluate scenario based on agent's goals
    const goals = this.getAgentGoals(agent);
    scenario.evaluateOutcome(goals);
    
    // Create an entity for this scenario (for reference)
    scenario.entityId = this.createScenarioEntity(agent, scenario);
    
    return scenario;
  }
  
  /**
   * Create an entity to represent a scenario (for reference)
   */
  createScenarioEntity(agent, scenario) {
    const entity = addEntity(this.world);
    // We could add components to track this entity, but for now just return its ID
    return entity;
  }
  
  /**
   * Get the current state of an agent
   */
  getCurrentAgentState(agent) {
    // Get data from agent's components
    return {
      position: {
        x: Position.x[agent],
        y: Position.y[agent]
      },
      resources: 0, // Would be populated from agent's inventory
      hazards: 0,   // Would be populated from sensory data
      goalProgress: Goals.completionPercentage[agent],
      emotionalState: CognitiveState.emotionalState[agent]
    };
  }
  
  /**
   * Get possible actions for an agent
   */
  getPossibleActions(agent) {
    // Basic actions that all agents can take
    const baseActions = [
      { type: 'move', direction: 'north' },
      { type: 'move', direction: 'south' },
      { type: 'move', direction: 'east' },
      { type: 'move', direction: 'west' },
      { type: 'explore', radius: 10 },
      { type: 'gather', target: 'resource' },
      { type: 'avoid', target: 'hazard' },
      { type: 'approach', target: 'agent' }
    ];
    
    // Add goal-specific actions
    const goalType = Goals.primaryType[agent];
    switch (goalType) {
      case 1: // Resource goal
        baseActions.push({ type: 'seekResource', priority: 'high' });
        break;
      case 2: // Hazard avoidance
        baseActions.push({ type: 'monitorHazard', range: 15 });
        break;
      case 3: // Social goal
        baseActions.push({ type: 'communicate', mode: 'signal' });
        break;
    }
    
    return baseActions;
  }
  
  /**
   * Get agent's current goals
   */
  getAgentGoals(agent) {
    return {
      type: Goals.primaryType[agent],
      targetX: Goals.targetX[agent],
      targetY: Goals.targetY[agent],
      targetEntity: Goals.targetEntity[agent],
      priority: Goals.priority[agent],
      completionPercentage: Goals.completionPercentage[agent]
    };
  }
  
  /**
   * Predict the next state given current state and action
   */
  predictNextState(agent, currentState, action) {
    // Copy current state as starting point
    const nextState = { ...currentState };
    
    // Use semantic patterns to predict outcomes when available
    const patterns = this.getRelevantPatterns(agent, action);
    
    // Apply action effects
    switch (action.type) {
      case 'move':
        // Update position based on direction
        switch (action.direction) {
          case 'north':
            nextState.position = { 
              x: nextState.position.x, 
              y: nextState.position.y - 1 
            };
            break;
          case 'south':
            nextState.position = { 
              x: nextState.position.x, 
              y: nextState.position.y + 1 
            };
            break;
          case 'east':
            nextState.position = { 
              x: nextState.position.x + 1, 
              y: nextState.position.y 
            };
            break;
          case 'west':
            nextState.position = { 
              x: nextState.position.x - 1, 
              y: nextState.position.y 
            };
            break;
        }
        break;
      
      case 'gather':
        // Simulate resource gathering
        if (patterns.includes('resource_clustering')) {
          // Apply pattern knowledge to increase success chance
          nextState.resources = nextState.resources + (Math.random() > 0.3 ? 1 : 0);
        } else {
          // Default success rate
          nextState.resources = nextState.resources + (Math.random() > 0.6 ? 1 : 0);
        }
        break;
      
      case 'avoid':
        // Simulate hazard avoidance
        if (patterns.includes('hazard_shift_stability')) {
          // Apply pattern knowledge to decrease risk
          nextState.hazards = Math.max(0, nextState.hazards - (Math.random() > 0.4 ? 1 : 0));
        } else {
          // Default risk reduction
          nextState.hazards = Math.max(0, nextState.hazards - (Math.random() > 0.7 ? 1 : 0));
        }
        break;
      
      // Additional actions would be handled here
    }
    
    // Simulate goal progress
    const goalType = Goals.primaryType[agent];
    switch (goalType) {
      case 1: // Resource
        if (action.type === 'gather' || action.type === 'seekResource') {
          nextState.goalProgress = Math.min(100, nextState.goalProgress + (5 + Math.random() * 10));
        }
        break;
      case 2: // Avoid hazard
        if (action.type === 'avoid' || action.type === 'monitorHazard') {
          nextState.goalProgress = Math.min(100, nextState.goalProgress + (10 + Math.random() * 15));
        }
        break;
      case 3: // Social
        if (action.type === 'approach' || action.type === 'communicate') {
          nextState.goalProgress = Math.min(100, nextState.goalProgress + (8 + Math.random() * 12));
        }
        break;
    }
    
    // Add some random variation for emotional state
    nextState.emotionalState = Math.max(0, Math.min(100, 
      nextState.emotionalState + (Math.random() * 10 - 5)
    ));
    
    return nextState;
  }
  
  /**
   * Get patterns relevant to a particular action
   */
  getRelevantPatterns(agent, action) {
    const agentPatterns = this.temporalPatterns.get(agent) || [];
    
    // Get pattern types relevant to this action
    const relevantTypes = [];
    switch (action.type) {
      case 'gather':
        relevantTypes.push('resource_clustering', 'resource_obstacle_proximity');
        break;
      case 'avoid':
        relevantTypes.push('hazard_shift_stability');
        break;
      case 'approach':
        relevantTypes.push('agent_interaction_outcomes');
        break;
    }
    
    // Return patterns matching these types
    return agentPatterns
      .filter(pattern => 
        pattern.id.includes(relevantTypes.find(type => pattern.id.includes(type)))
      )
      .map(pattern => pattern.id);
  }
  
  /**
   * Update temporal patterns for an agent
   */
  updateTemporalPatterns(agent, currentTime) {
    // Get recent events to analyze for patterns
    const recentEvents = this.getRecentEvents(agent);
    if (recentEvents.length < 3) return;
    
    // Get existing patterns
    let patterns = this.temporalPatterns.get(agent) || [];
    
    // Update existing pattern confidences based on time decay
    patterns.forEach(pattern => {
      pattern.updateConfidence(currentTime);
    });
    
    // Remove patterns with very low confidence
    patterns = patterns.filter(pattern => pattern.confidence > 0.2);
    
    // Try to detect new patterns in recent events
    const newPattern = this.detectPattern(recentEvents);
    if (newPattern) {
      // Check if pattern already exists
      const existingPattern = patterns.find(p => 
        JSON.stringify(p.sequence) === JSON.stringify(newPattern.sequence)
      );
      
      if (existingPattern) {
        // Update existing pattern
        existingPattern.addOccurrence(currentTime);
      } else {
        // Add new pattern if we have room
        if (patterns.length < TEMPORAL_CONFIG.MAX_TEMPORAL_PATTERNS) {
          newPattern.addOccurrence(currentTime);
          patterns.push(newPattern);
        } else {
          // Replace weakest pattern
          const weakestIndex = patterns
            .map((p, i) => ({ confidence: p.confidence, index: i }))
            .sort((a, b) => a.confidence - b.confidence)[0].index;
          
          patterns[weakestIndex] = newPattern;
        }
      }
    }
    
    // Check if existing patterns match recent events
    patterns.forEach(pattern => {
      if (pattern.matches(recentEvents)) {
        pattern.addOccurrence(currentTime);
      }
    });
    
    // Store patterns back
    this.temporalPatterns.set(agent, patterns);
    
    // Update component with pattern data
    TemporalConsciousness.patternCount[agent] = Math.min(patterns.length, 20);
    for (let i = 0; i < patterns.length && i < 20; i++) {
      TemporalConsciousness.patternStrengths[agent * 20 + i] = patterns[i].confidence;
      TemporalConsciousness.patternLastMatched[agent * 20 + i] = patterns[i].lastMatchedTime;
      TemporalConsciousness.patternSequenceLength[agent * 20 + i] = patterns[i].sequence.length;
    }
  }
  
  /**
   * Get recent events for pattern detection
   */
  getRecentEvents(agent) {
    const events = [];
    
    // Get episodic memories
    const memoryId = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryId) || [];
    
    // Sort by timestamp and take most recent
    const recentMemories = [...memories]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
    
    // Convert to simpler format for pattern detection
    recentMemories.forEach(memory => {
      events.push({
        type: memory.entityType,
        timestamp: memory.timestamp,
        position: memory.position,
        importance: memory.importance
      });
    });
    
    return events;
  }
  
  /**
   * Detect patterns in a sequence of events
   */
  detectPattern(events) {
    if (events.length < TEMPORAL_CONFIG.MIN_PATTERN_INSTANCES) return null;
    
    // Simple pattern detection: look for repeated entity type sequences
    // In a real implementation, this would use more sophisticated algorithms
    
    // Try sequence lengths from 2 to 4
    for (let length = 2; length <= 4; length++) {
      if (events.length < length * 2) continue;
      
      // Try each possible starting position for a sequence
      for (let start = 0; start <= events.length - length * 2; start++) {
        // Extract candidate sequence
        const candidateSequence = events.slice(start, start + length);
        const candidateTypes = candidateSequence.map(e => e.type);
        
        // Search for another occurrence
        let matchFound = false;
        for (let pos = start + length; pos <= events.length - length; pos++) {
          const potentialMatch = events.slice(pos, pos + length);
          const potentialTypes = potentialMatch.map(e => e.type);
          
          // Check if types match
          matchFound = candidateTypes.every((type, i) => type === potentialTypes[i]);
          if (matchFound) break;
        }
        
        if (matchFound) {
          // Create new pattern
          return new TemporalPattern(candidateSequence);
        }
      }
    }
    
    return null;
  }
  
  /**
   * Update memory reconstruction for an agent
   */
  updateMemoryReconstruction(agent, currentTime) {
    // Check if it's time for memory reconstruction
    const timeSinceLastUpdate = currentTime - TemporalConsciousness.lastMemoryUpdateTime[agent];
    if (timeSinceLastUpdate < TEMPORAL_CONFIG.MEMORY_RECONSTRUCTION_INTERVAL) return;
    
    TemporalConsciousness.lastMemoryUpdateTime[agent] = currentTime;
    
    // Get the latest experience to check for reinterpretation opportunities
    const latestExperience = this.getLatestExperience(agent);
    if (!latestExperience) return;
    
    // Find memories that should be reconstructed
    const memoriesToUpdate = this.memoryReconstructor.findMemoriesToReconstruct(agent, latestExperience);
    if (memoriesToUpdate.length === 0) return;
    
    // Update component with memories to update
    TemporalConsciousness.memoryUpdatePending[agent] = 1;
    const maxToUpdate = Math.min(memoriesToUpdate.length, 10);
    for (let i = 0; i < maxToUpdate; i++) {
      TemporalConsciousness.memoriesToUpdate[agent * 10 + i] = memoriesToUpdate[i];
    }
    
    // Queue memories for reconstruction
    memoriesToUpdate.forEach(memoryId => {
      // Generate new context based on semantic understanding
      const newContext = this.generateReconstructionContext(agent, memoryId);
      this.memoryReconstructor.queueMemoryForReconstruction(memoryId, newContext);
    });
    
    // Process reconstructions
    const reconstructedMemories = this.memoryReconstructor.processReconstructions(agent);
    if (reconstructedMemories.length > 0) {
      // Clear pending flag
      TemporalConsciousness.memoryUpdatePending[agent] = 0;
    }
  }
  
  /**
   * Get the latest experience for an agent
   */
  getLatestExperience(agent) {
    const memoryId = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryId) || [];
    
    if (memories.length === 0) return null;
    
    // Sort by timestamp and take most recent
    return [...memories].sort((a, b) => b.timestamp - a.timestamp)[0];
  }
  
  /**
   * Generate context for memory reconstruction
   */
  generateReconstructionContext(agent, memoryId) {
    // Use semantic patterns to generate new context
    const patterns = this.temporalPatterns.get(agent) || [];
    
    // Get high-confidence patterns
    const confidentPatterns = patterns
      .filter(p => p.confidence > TEMPORAL_CONFIG.PATTERN_DETECTION_THRESHOLD)
      .map(p => p.id);
    
    // Create new context with pattern insights
    return {
      reconstructed: true,
      reconstructionTime: this.world.time,
      semanticPatterns: confidentPatterns,
      interpretationUpdated: true
    };
  }
  
  /**
   * Update temporal narrative for an agent
   */
  updateTemporalNarrative(agent, currentTime) {
    // Check if it's time for narrative update
    const timeSinceLastUpdate = currentTime - TemporalConsciousness.narrativeLastUpdateTime[agent];
    if (timeSinceLastUpdate < TEMPORAL_CONFIG.NARRATIVE_UPDATE_INTERVAL) return;
    
    TemporalConsciousness.narrativeLastUpdateTime[agent] = currentTime;
    
    // Get or create narrative
    let narrative = this.narratives.get(agent);
    if (!narrative) {
      narrative = new TemporalNarrative();
      this.narratives.set(agent, narrative);
    }
    
    // Get latest significant event
    const latestEvent = this.getLatestSignificantEvent(agent);
    if (latestEvent) {
      // Add to narrative
      const newLength = narrative.addEvent(latestEvent, currentTime);
      TemporalConsciousness.narrativeLength[agent] = newLength;
      
      // Update narrative coherence
      const coherence = narrative.coherence;
      TemporalConsciousness.narrativeCoherence[agent] = coherence;
      
      // Update self-continuity based on narrative coherence
      const continuity = 0.3 + (coherence * 0.7); // Scale to 0.3-1.0 range
      TemporalConsciousness.selfContinuity[agent] = continuity;
    }
  }
  
  /**
   * Get the latest significant event for narrative
   */
  getLatestSignificantEvent(agent) {
    const memoryId = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryId) || [];
    
    if (memories.length === 0) return null;
    
    // Filter significant events (high importance)
    const significantMemories = memories.filter(m => 
      m.importance > TEMPORAL_CONFIG.NARRATIVE_THRESHOLD
    );
    
    if (significantMemories.length === 0) return null;
    
    // Sort by timestamp and take most recent
    return [...significantMemories].sort((a, b) => b.timestamp - a.timestamp)[0];
  }
  
  /**
   * Integrate temporal consciousness with overall consciousness
   */
  integrateWithConsciousness(agent) {
    if (!ConsciousnessState[agent]) return;
    
    // Enhance self-awareness through temporal continuity
    const temporalContribution = TemporalConsciousness.selfContinuity[agent] * 0.2;
    ConsciousnessState.selfAwarenessLevel[agent] += temporalContribution;
    
    // Enhance narrative complexity through temporal narratives
    const narrativeContribution = TemporalConsciousness.narrativeCoherence[agent] * 0.15;
    ConsciousnessState.narrativeComplexity[agent] += narrativeContribution;
    
    // Apply caps
    ConsciousnessState.selfAwarenessLevel[agent] = Math.min(1.0, ConsciousnessState.selfAwarenessLevel[agent]);
    ConsciousnessState.narrativeComplexity[agent] = Math.min(1.0, ConsciousnessState.narrativeComplexity[agent]);
  }
  
  /**
   * Get temporal consciousness report for an agent
   */
  getTemporalConsciousnessReport(agent) {
    if (!TemporalConsciousness[agent]) return null;
    
    // Get future scenarios
    const futureScenarios = this.futureScenarios.get(agent) || [];
    
    // Get temporal patterns
    const patterns = this.temporalPatterns.get(agent) || [];
    
    // Get narrative
    const narrative = this.narratives.get(agent);
    
    return {
      agent,
      futureScenarios: futureScenarios.map(s => ({
        probability: s.probability,
        steps: s.stateSequence.length,
        outcomeValue: s.outcomeValue
      })),
      temporalPatterns: patterns.map(p => ({
        confidence: p.confidence,
        sequenceLength: p.sequence.length,
        lastMatched: p.lastMatchedTime
      })),
      narrative: narrative ? narrative.getSummary() : null,
      selfContinuity: TemporalConsciousness.selfContinuity[agent],
      lastMemoryUpdateTime: TemporalConsciousness.lastMemoryUpdateTime[agent]
    };
  }
}

// Helper functions
function addComponent(world, component, entity) {
  component.addTo(world)(entity);
}

// Export the system creation function
export function createTemporalConsciousnessSystem(world, memoryManager) {
  console.log("Initializing Temporal Consciousness System...");
  const temporalConsciousnessManager = new TemporalConsciousnessSystem(world, memoryManager);
  const temporalConsciousnessSystem = temporalConsciousnessManager.createSystem();
  
  return { temporalConsciousnessManager, temporalConsciousnessSystem };
}

// Integration with ArgOS
export function integrateTemporalConsciousnessWithArgOS(world, memoryManager, options = {}) {
  console.log("Integrating Temporal Consciousness with ArgOS...");
  return createTemporalConsciousnessSystem(world, memoryManager);
}
