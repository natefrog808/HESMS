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
  addComponent,
  addEntity 
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
  MEMORY_SIMILARITY_THRESHOLD: 0.7,   // Threshold for considering memories similar
  PATTERN_DECAY_RATE: 0.01,           // Rate at which pattern confidence decays
  PATTERN_MAX_DECAY: 0.2,             // Maximum decay per update
  NARRATIVE_THRESHOLD: 0.75,          // Importance threshold for narrative events
  NARRATIVE_COHERENCE_WEIGHT_SPATIAL: 0.3,
  NARRATIVE_COHERENCE_WEIGHT_THEMATIC: 0.4,
  NARRATIVE_COHERENCE_WEIGHT_TEMPORAL: 0.3
};

// TemporalConsciousness Component
export const TemporalConsciousness = defineComponent({
  // Episodic Future Thinking
  futureScenariosCount: Types.ui8,
  futureScenarioEntities: [Types.eid, 15],
  futureScenarioProbabilities: [Types.f32, 15],
  futureScenarioTimestamps: [Types.ui32, 15],

  // Temporal Pattern Recognition
  patternCount: Types.ui8,
  patternStrengths: [Types.f32, 20],
  patternLastMatched: [Types.ui32, 20],
  patternSequenceLength: [Types.ui8, 20],

  // Memory Reconstruction
  memoryUpdatePending: Types.ui8,
  memoriesToUpdate: [Types.eid, 10],
  lastMemoryUpdateTime: Types.ui32,

  // Temporal Identity
  narrativeLength: Types.ui16,
  narrativeLastUpdateTime: Types.ui32,
  narrativeCoherence: Types.f32,
  selfContinuity: Types.f32
});

// ### Helper Classes

/**
 * FutureScenario: Represents a predicted future scenario for an agent
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
    this.entityId = 0;
  }

  addState(state, action) {
    this.stateSequence.push(state);
    this.actionSequence.push(action);
    this.probability *= TEMPORAL_CONFIG.FUTURE_WEIGHT_DECAY;
    return this;
  }

  evaluateOutcome(goals) {
    let value = 0;
    const finalState = this.stateSequence[this.stateSequence.length - 1];
    if (finalState.resources > 0) value += finalState.resources * 10;
    if (finalState.hazards > 0) value -= finalState.hazards * 15;
    if (goals && finalState.goalProgress > 0) value += finalState.goalProgress * 5;
    this.outcomeValue = value;
    return value;
  }

  isStillValid(currentState, validityThreshold = 0.6) {
    if (this.stateSequence.length === 0) return false;
    const initialPrediction = this.stateSequence[0];
    return this.calculateStateSimilarity(initialPrediction, currentState) >= validityThreshold;
  }

  calculateStateSimilarity(state1, state2) {
    if (!state1 || !state2) return 0;
    let matches = 0, total = 0;
    if (state1.position && state2.position) {
      const posDist = Math.hypot(state1.position.x - state2.position.x, state1.position.y - state2.position.y);
      matches += Math.max(0, 1 - (posDist / 20));
      total++;
    }
    if (state1.resources !== undefined && state2.resources !== undefined) {
      matches += Math.max(0, 1 - (Math.abs(state1.resources - state2.resources) / 5));
      total++;
    }
    if (state1.hazards !== undefined && state2.hazards !== undefined) {
      matches += Math.max(0, 1 - (Math.abs(state1.hazards - state2.hazards) / 3));
      total++;
    }
    if (state1.goalProgress !== undefined && state2.goalProgress !== undefined) {
      matches += Math.max(0, 1 - Math.abs(state1.goalProgress - state2.goalProgress));
      total++;
    }
    return total > 0 ? matches / total : 0;
  }

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
 * TemporalPattern: Represents a recognized temporal pattern
 */
class TemporalPattern {
  constructor(sequence = [], agentId = 0) {
    this.sequence = sequence;
    this.confidence = 0.5;
    this.occurrences = [];
    this.lastMatchedTime = 0;
    this.predictiveValue = 0.5;
    this.agentId = agentId;
    this.id = `pattern-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  addOccurrence(timestamp) {
    this.occurrences.push(timestamp);
    this.lastMatchedTime = timestamp;
    this.confidence = Math.min(0.95, this.confidence + (1 / (this.occurrences.length + 5)));
    return this;
  }

  matches(events) {
    if (events.length < this.sequence.length) return false;
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

  eventMatches(event1, event2) {
    if (event1.type !== undefined && event2.type !== undefined) return event1.type === event2.type;
    return JSON.stringify(event1) === JSON.stringify(event2);
  }

  predictNext(partialSequence) {
    if (partialSequence.length === 0) return null;
    for (let i = 0; i < this.sequence.length - 1; i++) {
      if (i + partialSequence.length > this.sequence.length) break;
      let isPrefix = true;
      for (let j = 0; j < partialSequence.length; j++) {
        if (!this.eventMatches(partialSequence[j], this.sequence[i + j])) {
          isPrefix = false;
          break;
        }
      }
      if (isPrefix) return this.sequence[i + partialSequence.length];
    }
    return null;
  }

  updateConfidence(currentTime) {
    if (this.lastMatchedTime === 0) return this.confidence;
    const timeSinceMatch = currentTime - this.lastMatchedTime;
    const confidenceDecay = Math.min(TEMPORAL_CONFIG.PATTERN_MAX_DECAY, timeSinceMatch * TEMPORAL_CONFIG.PATTERN_DECAY_RATE);
    this.confidence = Math.max(0.1, this.confidence - confidenceDecay);
    return this.confidence;
  }
}

/**
 * MemoryReconstructor: Manages memory reconstruction
 */
class MemoryReconstructor {
  constructor(memoryManager) {
    this.memoryManager = memoryManager;
    this.reconstructionQueue = new Map();
  }

  queueMemoryForReconstruction(memoryId, newContext) {
    this.reconstructionQueue.set(memoryId, newContext);
  }

  processReconstructions(agent) {
    if (this.reconstructionQueue.size === 0) return [];
    const processedMemories = [];
    this.reconstructionQueue.forEach((newContext, memoryId) => {
      const reconstructed = this.reconstructMemory(agent, memoryId, newContext);
      if (reconstructed) processedMemories.push(reconstructed);
    });
    this.reconstructionQueue.clear();
    return processedMemories;
  }

  reconstructMemory(agent, memoryId, newContext) {
    const memoryIdValue = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryIdValue) || [];
    const memory = memories.find(m => m.id === memoryId);
    if (!memory) return null;
    const reconstructed = { ...memory };
    reconstructed.context = { ...memory.context, ...newContext };
    reconstructed.importance = Math.min(1.0, memory.importance + 0.1);
    reconstructed.fidelity = Math.min(1.0, memory.fidelity * 0.95);
    reconstructed.tags = [...memory.tags, 'reconstructed'];
    reconstructed.reconstructionTime = this.memoryManager.world.time;
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

  findMemoriesToReconstruct(agent, newExperience) {
    if (!newExperience) return [];
    const memoryIdValue = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryIdValue) || [];
    return memories
      .filter(memory => !memory.tags?.includes('reconstructed') && this.isExperienceRelatedToMemory(newExperience, memory))
      .map(memory => memory.id);
  }

  isExperienceRelatedToMemory(experience, memory) {
    if (experience.entityId === memory.entityId) return true;
    const spatialProximity = Math.hypot(experience.position.x - memory.position.x, experience.position.y - memory.position.y) < 20;
    const temporalProximity = Math.abs(experience.timestamp - memory.timestamp) < 100;
    const contextMatch = experience.context && memory.context && Object.keys(experience.context).some(key => memory.context[key] === experience.context[key]);
    return (spatialProximity && temporalProximity) || contextMatch;
  }
}

/**
 * TemporalNarrative: Maintains an agent's self-narrative
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

  addEvent(event, timestamp) {
    this.events.push({ event, timestamp, chapter: this.getCurrentChapter() });
    if (this.events.length > this.maxLength) this.events.shift();
    this.updateNarrativeStructure();
    return this.events.length;
  }

  getCurrentChapter() {
    return this.chapters.length > 0 ? this.chapters.length - 1 : 0;
  }

  updateNarrativeStructure() {
    if (this.shouldCreateNewChapter()) this.startNewChapter();
    this.updateTheme();
    this.calculateCoherence();
  }

  shouldCreateNewChapter() {
    if (this.events.length < 5) return false;
    const recentEvents = this.events.slice(-5);
    const eventTypes = recentEvents.map(e => e.event.entityType);
    const uniqueTypes = new Set(eventTypes);
    if (uniqueTypes.size >= 3) return true;
    const timeGap = recentEvents[recentEvents.length - 1].timestamp - recentEvents[0].timestamp;
    return timeGap > 200;
  }

  startNewChapter() {
    this.chapters.push({
      startIndex: this.events.length - 1,
      startTime: this.events[this.events.length - 1].timestamp,
      theme: null,
      keyEvents: []
    });
    if (this.events.length > 0) this.events[this.events.length - 1].chapterStart = true;
  }

  updateTheme() {
    if (this.events.length < 3) return;
    const typeCounts = {};
    this.events.forEach(e => {
      typeCounts[e.event.entityType] = (typeCounts[e.event.entityType] || 0) + 1;
    });
    let maxCount = 0, dominantType = null;
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantType = parseInt(type);
      }
    });
    this.narrativeTheme = dominantType === 0 ? 'exploration' : dominantType === 2 ? 'survival' : dominantType === 3 ? 'social' : 'journey';
    if (this.chapters.length > 0) this.chapters[this.chapters.length - 1].theme = this.narrativeTheme;
  }

  calculateCoherence() {
    if (this.events.length < 5) {
      this.coherence = 0.5;
      return;
    }
    let spatialContinuity = 0, temporalContinuity = 0;
    for (let i = 1; i < this.events.length; i++) {
      const prev = this.events[i - 1].event, curr = this.events[i].event;
      const distance = Math.hypot(curr.position.x - prev.position.x, curr.position.y - prev.position.y);
      spatialContinuity += Math.max(0, 1 - (distance / 30));
      const timeDiff = this.events[i].timestamp - this.events[i - 1].timestamp;
      temporalContinuity += Math.max(0, 1 - (timeDiff / 100));
    }
    spatialContinuity /= (this.events.length - 1);
    temporalContinuity /= (this.events.length - 1);
    const allTypes = this.events.map(e => e.event.entityType);
    const thematicConsistency = 1 - (new Set(allTypes).size / 4);
    this.coherence = (
      spatialContinuity * TEMPORAL_CONFIG.NARRATIVE_COHERENCE_WEIGHT_SPATIAL +
      thematicConsistency * TEMPORAL_CONFIG.NARRATIVE_COHERENCE_WEIGHT_THEMATIC +
      temporalContinuity * TEMPORAL_CONFIG.NARRATIVE_COHERENCE_WEIGHT_TEMPORAL
    );
    return this.coherence;
  }

  getSummary() {
    return {
      theme: this.narrativeTheme,
      chapterCount: this.chapters.length,
      eventCount: this.events.length,
      coherence: this.coherence,
      keyEvents: this.getKeyEvents(3)
    };
  }

  getKeyEvents(count = 3) {
    return [...this.events]
      .sort((a, b) => b.event.importance - a.event.importance)
      .slice(0, count)
      .map(e => ({ type: e.event.entityType, timestamp: e.timestamp, position: e.event.position, chapter: e.chapter }));
  }
}

// ### TemporalConsciousnessSystem Class
export class TemporalConsciousnessSystem {
  constructor(world, memoryManager) {
    this.world = world;
    this.memoryManager = memoryManager;
    this.futureScenarios = new Map();
    this.temporalPatterns = new Map();
    this.narratives = new Map();
    this.memoryReconstructor = new MemoryReconstructor(memoryManager);
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    const agentEntities = this.memoryManager.findAgentEntities();
    await Promise.all(agentEntities.map(agent => this.initializeAgentTemporalConsciousness(agent)));
    this.initialized = true;
    console.log(`TemporalConsciousnessSystem: Initialized for ${agentEntities.length} agents`);
    return this;
  }

  async initializeAgentTemporalConsciousness(agent) {
    if (TemporalConsciousness[agent]) return;
    addComponent(this.world, TemporalConsciousness, agent);
    TemporalConsciousness.futureScenariosCount[agent] = 0;
    TemporalConsciousness.patternCount[agent] = 0;
    TemporalConsciousness.memoryUpdatePending[agent] = 0;
    TemporalConsciousness.narrativeLength[agent] = 0;
    TemporalConsciousness.narrativeLastUpdateTime[agent] = this.world.time;
    TemporalConsciousness.lastMemoryUpdateTime[agent] = this.world.time;
    TemporalConsciousness.narrativeCoherence[agent] = 0.5;
    TemporalConsciousness.selfContinuity[agent] = 0.3;
    this.futureScenarios.set(agent, []);
    this.temporalPatterns.set(agent, []);
    this.narratives.set(agent, new TemporalNarrative());
    return agent;
  }

  createSystem() {
    const tcQuery = defineQuery([TemporalConsciousness, EnhancedMemory, CognitiveState]);
    const manager = this;
    return defineSystem(async (world) => {
      if (!manager.initialized) await manager.initialize();
      const agents = tcQuery(world);
      const currentTime = world.time;
      for (const agent of agents) {
        manager.updateFutureSimulations(agent, currentTime);
        manager.updateTemporalPatterns(agent, currentTime);
        manager.updateMemoryReconstruction(agent, currentTime);
        manager.updateTemporalNarrative(agent, currentTime);
        manager.integrateWithConsciousness(agent);
      }
      return world;
    });
  }

  updateFutureSimulations(agent, currentTime) {
    const agentScenarios = this.futureScenarios.get(agent) || [];
    const currentState = this.getCurrentAgentState(agent);
    const validScenarios = agentScenarios.filter(scenario => scenario.isStillValid(currentState));
    if (validScenarios.length < TEMPORAL_CONFIG.FUTURE_SIMULATION_COUNT) {
      const newScenarioCount = TEMPORAL_CONFIG.FUTURE_SIMULATION_COUNT - validScenarios.length;
      for (let i = 0; i < newScenarioCount; i++) {
        const newScenario = this.generateFutureScenario(agent, currentTime, currentState);
        if (newScenario) validScenarios.push(newScenario);
      }
    }
    TemporalConsciousness.futureScenariosCount[agent] = Math.min(validScenarios.length, 15);
    for (let i = 0; i < validScenarios.length && i < 15; i++) {
      const scenario = validScenarios[i];
      TemporalConsciousness.futureScenarioEntities[agent * 15 + i] = scenario.entityId;
      TemporalConsciousness.futureScenarioProbabilities[agent * 15 + i] = scenario.probability;
      TemporalConsciousness.futureScenarioTimestamps[agent * 15 + i] = scenario.timestamp;
    }
    this.futureScenarios.set(agent, validScenarios);
  }

  generateFutureScenario(agent, currentTime, currentState) {
    const scenario = new FutureScenario(agent, currentTime);
    const possibleActions = this.getPossibleActions(agent);
    let simulatedState = { ...currentState };
    for (let step = 0; step < TEMPORAL_CONFIG.FUTURE_SIMULATION_STEPS; step++) {
      const actionIndex = Math.floor(Math.random() * possibleActions.length);
      const action = possibleActions[actionIndex];
      const nextState = this.predictNextState(agent, simulatedState, action);
      scenario.addState(nextState, action);
      simulatedState = nextState;
    }
    const goals = this.getAgentGoals(agent);
    scenario.evaluateOutcome(goals);
    scenario.entityId = this.createScenarioEntity(agent, scenario);
    return scenario;
  }

  createScenarioEntity(agent, scenario) {
    return addEntity(this.world);
  }

  getCurrentAgentState(agent) {
    return {
      position: { x: Position.x[agent], y: Position.y[agent] },
      resources: SensoryData.resources?.[agent] || 0,
      hazards: SensoryData.hazards?.[agent] || 0,
      goalProgress: Goals.completionPercentage[agent],
      emotionalState: CognitiveState.emotionalState[agent]
    };
  }

  getPossibleActions(agent) {
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
    const goalType = Goals.primaryType[agent];
    switch (goalType) {
      case 1: baseActions.push({ type: 'seekResource', priority: 'high' }); break;
      case 2: baseActions.push({ type: 'monitorHazard', range: 15 }); break;
      case 3: baseActions.push({ type: 'communicate', mode: 'signal' }); break;
    }
    return baseActions;
  }

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

  predictNextState(agent, currentState, action) {
    const nextState = { ...currentState };
    const patterns = this.getRelevantPatterns(agent, action);
    switch (action.type) {
      case 'move':
        switch (action.direction) {
          case 'north': nextState.position.y -= 1; break;
          case 'south': nextState.position.y += 1; break;
          case 'east': nextState.position.x += 1; break;
          case 'west': nextState.position.x -= 1; break;
        }
        break;
      case 'gather':
        nextState.resources += patterns.includes('resource_clustering') ? (Math.random() > 0.3 ? 1 : 0) : (Math.random() > 0.6 ? 1 : 0);
        break;
      case 'avoid':
        nextState.hazards = Math.max(0, nextState.hazards - (patterns.includes('hazard_shift_stability') ? (Math.random() > 0.4 ? 1 : 0) : (Math.random() > 0.7 ? 1 : 0)));
        break;
    }
    const goalType = Goals.primaryType[agent];
    switch (goalType) {
      case 1: if (['gather', 'seekResource'].includes(action.type)) nextState.goalProgress = Math.min(100, nextState.goalProgress + (5 + Math.random() * 10)); break;
      case 2: if (['avoid', 'monitorHazard'].includes(action.type)) nextState.goalProgress = Math.min(100, nextState.goalProgress + (10 + Math.random() * 15)); break;
      case 3: if (['approach', 'communicate'].includes(action.type)) nextState.goalProgress = Math.min(100, nextState.goalProgress + (8 + Math.random() * 12)); break;
    }
    nextState.emotionalState = Math.max(0, Math.min(100, nextState.emotionalState + (Math.random() * 10 - 5)));
    return nextState;
  }

  getRelevantPatterns(agent, action) {
    const agentPatterns = this.temporalPatterns.get(agent) || [];
    const relevantTypes = [];
    switch (action.type) {
      case 'gather': relevantTypes.push('resource_clustering', 'resource_obstacle_proximity'); break;
      case 'avoid': relevantTypes.push('hazard_shift_stability'); break;
      case 'approach': relevantTypes.push('agent_interaction_outcomes'); break;
    }
    return agentPatterns.filter(pattern => relevantTypes.some(type => pattern.id.includes(type))).map(pattern => pattern.id);
  }

  updateTemporalPatterns(agent, currentTime) {
    const recentEvents = this.getRecentEvents(agent);
    if (recentEvents.length < 3) return;
    let patterns = this.temporalPatterns.get(agent) || [];
    patterns.forEach(pattern => pattern.updateConfidence(currentTime));
    patterns = patterns.filter(pattern => pattern.confidence > 0.2);
    const newPattern = this.detectPattern(recentEvents);
    if (newPattern) {
      const existingPattern = patterns.find(p => JSON.stringify(p.sequence) === JSON.stringify(newPattern.sequence));
      if (existingPattern) {
        existingPattern.addOccurrence(currentTime);
      } else if (patterns.length < TEMPORAL_CONFIG.MAX_TEMPORAL_PATTERNS) {
        newPattern.addOccurrence(currentTime);
        patterns.push(newPattern);
      } else {
        const weakestIndex = patterns.map((p, i) => ({ confidence: p.confidence, index: i })).sort((a, b) => a.confidence - b.confidence)[0].index;
        patterns[weakestIndex] = newPattern.addOccurrence(currentTime);
      }
    }
    patterns.forEach(pattern => { if (pattern.matches(recentEvents)) pattern.addOccurrence(currentTime); });
    this.temporalPatterns.set(agent, patterns);
    TemporalConsciousness.patternCount[agent] = Math.min(patterns.length, 20);
    for (let i = 0; i < patterns.length && i < 20; i++) {
      TemporalConsciousness.patternStrengths[agent * 20 + i] = patterns[i].confidence;
      TemporalConsciousness.patternLastMatched[agent * 20 + i] = patterns[i].lastMatchedTime;
      TemporalConsciousness.patternSequenceLength[agent * 20 + i] = patterns[i].sequence.length;
    }
  }

  getRecentEvents(agent) {
    const memoryId = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryId) || [];
    return [...memories]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(memory => ({ type: memory.entityType, timestamp: memory.timestamp, position: memory.position, importance: memory.importance }));
  }

  detectPattern(events) {
    if (events.length < TEMPORAL_CONFIG.MIN_PATTERN_INSTANCES) return null;
    for (let length = 2; length <= 4; length++) {
      if (events.length < length * 2) continue;
      for (let start = 0; start <= events.length - length * 2; start++) {
        const candidateSequence = events.slice(start, start + length);
        const candidateTypes = candidateSequence.map(e => e.type);
        let matchFound = false;
        for (let pos = start + length; pos <= events.length - length; pos++) {
          const potentialMatch = events.slice(pos, pos + length);
          const potentialTypes = potentialMatch.map(e => e.type);
          matchFound = candidateTypes.every((type, i) => type === potentialTypes[i]);
          if (matchFound) break;
        }
        if (matchFound) return new TemporalPattern(candidateSequence);
      }
    }
    return null;
  }

  updateMemoryReconstruction(agent, currentTime) {
    const timeSinceLastUpdate = currentTime - TemporalConsciousness.lastMemoryUpdateTime[agent];
    if (timeSinceLastUpdate < TEMPORAL_CONFIG.MEMORY_RECONSTRUCTION_INTERVAL) return;
    TemporalConsciousness.lastMemoryUpdateTime[agent] = currentTime;
    const latestExperience = this.getLatestExperience(agent);
    if (!latestExperience) return;
    const memoriesToUpdate = this.memoryReconstructor.findMemoriesToReconstruct(agent, latestExperience);
    if (memoriesToUpdate.length === 0) return;
    TemporalConsciousness.memoryUpdatePending[agent] = 1;
    const maxToUpdate = Math.min(memoriesToUpdate.length, 10);
    for (let i = 0; i < maxToUpdate; i++) {
      TemporalConsciousness.memoriesToUpdate[agent * 10 + i] = memoriesToUpdate[i];
    }
    memoriesToUpdate.forEach(memoryId => {
      const newContext = this.generateReconstructionContext(agent, memoryId);
      this.memoryReconstructor.queueMemoryForReconstruction(memoryId, newContext);
    });
    const reconstructedMemories = this.memoryReconstructor.processReconstructions(agent);
    if (reconstructedMemories.length > 0) TemporalConsciousness.memoryUpdatePending[agent] = 0;
  }

  getLatestExperience(agent) {
    const memoryId = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryId) || [];
    return memories.length === 0 ? null : [...memories].sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  generateReconstructionContext(agent, memoryId) {
    const patterns = this.temporalPatterns.get(agent) || [];
    const confidentPatterns = patterns.filter(p => p.confidence > TEMPORAL_CONFIG.PATTERN_DETECTION_THRESHOLD).map(p => p.id);
    return { reconstructed: true, reconstructionTime: this.world.time, semanticPatterns: confidentPatterns, interpretationUpdated: true };
  }

  updateTemporalNarrative(agent, currentTime) {
    const timeSinceLastUpdate = currentTime - TemporalConsciousness.narrativeLastUpdateTime[agent];
    if (timeSinceLastUpdate < TEMPORAL_CONFIG.NARRATIVE_UPDATE_INTERVAL) return;
    TemporalConsciousness.narrativeLastUpdateTime[agent] = currentTime;
    let narrative = this.narratives.get(agent) || new TemporalNarrative();
    this.narratives.set(agent, narrative);
    const latestEvent = this.getLatestSignificantEvent(agent);
    if (latestEvent) {
      const newLength = narrative.addEvent(latestEvent, currentTime);
      TemporalConsciousness.narrativeLength[agent] = newLength;
      TemporalConsciousness.narrativeCoherence[agent] = narrative.coherence;
      TemporalConsciousness.selfContinuity[agent] = 0.3 + (narrative.coherence * 0.7);
    }
  }

  getLatestSignificantEvent(agent) {
    const memoryId = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryId) || [];
    const significantMemories = memories.filter(m => m.importance > TEMPORAL_CONFIG.NARRATIVE_THRESHOLD);
    return significantMemories.length === 0 ? null : [...significantMemories].sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  integrateWithConsciousness(agent) {
    if (!ConsciousnessState[agent]) return;
    ConsciousnessState.selfAwarenessLevel[agent] = Math.min(1.0, ConsciousnessState.selfAwarenessLevel[agent] + (TemporalConsciousness.selfContinuity[agent] * 0.2));
    ConsciousnessState.narrativeComplexity[agent] = Math.min(1.0, ConsciousnessState.narrativeComplexity[agent] + (TemporalConsciousness.narrativeCoherence[agent] * 0.15));
  }

  getTemporalConsciousnessReport(agent) {
    if (!TemporalConsciousness[agent]) return null;
    const futureScenarios = this.futureScenarios.get(agent) || [];
    const patterns = this.temporalPatterns.get(agent) || [];
    const narrative = this.narratives.get(agent);
    return {
      agent,
      futureScenarios: futureScenarios.map(s => ({ probability: s.probability, steps: s.stateSequence.length, outcomeValue: s.outcomeValue })),
      temporalPatterns: patterns.map(p => ({ confidence: p.confidence, sequenceLength: p.sequence.length, lastMatched: p.lastMatchedTime })),
      narrative: narrative ? narrative.getSummary() : null,
      selfContinuity: TemporalConsciousness.selfContinuity[agent],
      lastMemoryUpdateTime: TemporalConsciousness.lastMemoryUpdateTime[agent]
    };
  }
}

// ### Export Functions
export function createTemporalConsciousnessSystem(world, memoryManager) {
  console.log("Initializing Temporal Consciousness System...");
  const manager = new TemporalConsciousnessSystem(world, memoryManager);
  const system = manager.createSystem();
  return { temporalConsciousnessManager: manager, temporalConsciousnessSystem: system };
}

export function integrateTemporalConsciousnessWithArgOS(world, memoryManager, options = {}) {
  console.log("Integrating Temporal Consciousness with ArgOS...");
  return createTemporalConsciousnessSystem(world, memoryManager);
}
