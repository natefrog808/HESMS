/**
 * ArgOS Hierarchical Episodic-Semantic Memory System (HESMS)
 * 
 * A sophisticated, cloud-integrated memory extension for the ArgOS framework,
 * modeling human-like memory with episodic and semantic layers.
 * 
 * Enhances agent cognition with persistent memory, pattern recognition,
 * and memory-guided decisions.
 * Part of Project 89's consciousness simulation exploration.
 */

import axios from 'axios';
import { 
  Position, 
  Environmental, 
  SensoryData, 
  Actions, 
  Goals, 
  CognitiveState, 
  RealityFlux 
} from './argos-framework.js';
import { defineComponent, defineQuery, defineSystem, Types, addComponent } from 'bitecs';

// ### Configuration
const CONFIG = {
  API_ENDPOINT: process.env.API_ENDPOINT || 'http://localhost:5001/api',
  MEMORY_SYNC_INTERVAL: 10,
  SEMANTIC_UPDATE_INTERVAL: 50,
  MAX_EPISODIC_MEMORY_AGE: 1000,
  MEMORY_DECAY_RATE: 0.05,
  PATTERN_CONFIDENCE_THRESHOLD: 0.7,
  ENABLE_CLOUD_SYNC: true,
  BATCH_SIZE: 50,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
  CONSOLIDATION_INTERVAL: 100,
  SPATIAL_CELL_SIZE: 10
};

// ### EnhancedMemory Component
export const EnhancedMemory = defineComponent({
  shortTermCapacity: Types.ui8,
  shortTermIndex: Types.ui8,
  shortTermIds: [Types.eid, 10],
  shortTermTypes: [Types.ui8, 10],
  shortTermPositionsX: [Types.f32, 10],
  shortTermPositionsY: [Types.f32, 10],
  shortTermTimestamps: [Types.ui32, 10],
  shortTermImportance: [Types.f32, 10],
  shortTermFidelity: [Types.f32, 10],
  memoryId: Types.ui32,
  lastSyncTime: Types.ui32,
  semanticUpdateTime: Types.ui32,
  globalFidelity: Types.f32,
  syncPending: Types.ui8,
  semanticPending: Types.ui8
});

// ### EpisodicMemory Class
class EpisodicMemory {
  constructor(agentId, event) {
    this.id = `${agentId}-${event.timestamp}-${Math.random().toString(36).slice(2, 9)}`;
    this.timestamp = event.timestamp || 0;
    this.entityId = event.entityId || 0;
    this.entityType = event.entityType || 0;
    this.position = event.position || { x: 0, y: 0 };
    this.importance = Math.min(1, Math.max(0, event.importance || 0.5));
    this.context = event.context || {};
    this.agentId = agentId;
    this.fidelity = Math.min(1, Math.max(0, event.fidelity || 1.0));
    this.tags = event.tags || [];
    this.emotionalImpact = event.emotional || 50;
    this.creationTime = Date.now();
  }

  compress() {
    return {
      id: this.id,
      ts: this.timestamp,
      eid: this.entityId,
      et: this.entityType,
      pos: `${this.position.x.toFixed(1)},${this.position.y.toFixed(1)}`,
      imp: this.importance,
      ctx: JSON.stringify(this.context),
      fid: this.fidelity,
      tags: this.tags.join('|'),
      emo: this.emotionalImpact
    };
  }

  static decompress(agentId, data) {
    const [x, y] = data.pos.split(',').map(parseFloat);
    return new EpisodicMemory(agentId, {
      timestamp: data.ts,
      entityId: data.eid,
      entityType: data.et,
      position: { x, y },
      importance: data.imp,
      context: JSON.parse(data.ctx),
      fidelity: data.fid,
      tags: data.tags.split('|'),
      emotional: data.emo
    });
  }
}

// ### SemanticMemory Class
class SemanticMemory {
  constructor() {
    this.patterns = [];
    this.associations = new Map();
    this.confidence = new Map();
    this.lastUpdated = 0;
    this.version = 1;
  }

  addPattern(pattern) {
    const existing = this.patterns.find(p => p.type === pattern.type);
    if (existing) {
      const totalCount = existing.sourceCount + pattern.sourceCount;
      existing.confidence = (existing.confidence * existing.sourceCount + pattern.confidence * pattern.sourceCount) / totalCount;
      existing.sourceCount = totalCount;
      existing.lastConfirmed = pattern.timestamp;
      existing.evidence.push(...(pattern.evidence || []));
    } else {
      this.patterns.push({
        type: pattern.type,
        rule: pattern.rule,
        confidence: pattern.confidence,
        sourceCount: pattern.sourceCount,
        created: pattern.timestamp,
        lastConfirmed: pattern.timestamp,
        evidence: pattern.evidence || []
      });
    }
  }

  addAssociation(concept1, concept2, strength = 0.5) {
    const key = `${concept1}:${concept2}`;
    const reverseKey = `${concept2}:${concept1}`;
    const current = this.associations.get(key) || 0;
    const newStrength = Math.min(1.0, current + strength * 0.3);
    this.associations.set(key, newStrength);
    this.associations.set(reverseKey, newStrength);
  }

  getConfidence(concept) {
    return this.confidence.get(concept) || 0;
  }

  updateFromEpisodic(episodicMemories, timestamp) {
    this.extractResourcePatterns(episodicMemories);
    this.extractHazardPatterns(episodicMemories);
    this.extractTemporalSequences(episodicMemories);
    this.extractSequences(episodicMemories);
    this.lastUpdated = timestamp;
  }

  extractResourcePatterns(memories) {
    const resources = memories.filter(m => m.entityType === 0);
    if (resources.length < 3) return;
    this._extractProximityPattern(resources, 1, 'resource_obstacle_proximity', 'Resources are often near obstacles');
    this._extractClusterPattern(resources, 'resource_clustering', 'Resources tend to cluster');
  }

  extractHazardPatterns(memories) {
    const hazards = memories.filter(m => m.entityType === 2);
    if (hazards.length < 2) return;
    const realityEvents = memories.filter(m => m.context?.realityShift);
    if (realityEvents.length > 0) {
      const beforeShift = hazards.filter(h => h.timestamp < realityEvents[0].timestamp);
      const afterShift = hazards.filter(h => h.timestamp >= realityEvents[0].timestamp);
      let shifted = 0;
      beforeShift.forEach(before => {
        if (afterShift.some(after => Math.hypot(after.position.x - before.position.x, after.position.y - before.position.y) > 20)) shifted++;
      });
      if (beforeShift.length > 0) {
        const shiftRatio = shifted / beforeShift.length;
        this.addPattern({
          type: 'hazard_shift_stability',
          rule: shiftRatio > 0.7 ? 'Hazards often relocate during shifts' : 'Hazards tend to stay stable',
          confidence: Math.min(0.5 + shiftRatio * 0.5, 0.95),
          sourceCount: beforeShift.length,
          timestamp: memories[memories.length - 1].timestamp,
          evidence: beforeShift.map(m => m.id)
        });
      }
    }
  }

  extractTemporalSequences(memories) {
    memories.sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 1; i < memories.length; i++) {
      const prev = memories[i - 1];
      const curr = memories[i];
      if (curr.timestamp - prev.timestamp < 20) {
        const seqKey = `${prev.entityType}->${curr.entityType}`;
        this.addAssociation(seqKey, `seq_${prev.timestamp}`, 0.4);
        this.confidence.set(seqKey, (this.confidence.get(seqKey) || 0) + 0.1);
      }
    }
  }

  extractSequences(memories) {
    const sequences = new Map();
    memories.sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 0; i < memories.length - 1; i++) {
      const seq = `${memories[i].entityType}->${memories[i+1].entityType}`;
      sequences.set(seq, (sequences.get(seq) || 0) + 1);
    }
    const frequentSequences = Array.from(sequences.entries())
      .filter(([seq, count]) => count > 2)
      .map(([seq, count]) => ({ type: 'sequence', rule: seq, confidence: count / (memories.length - 1) }));
    frequentSequences.forEach(seq => this.addPattern(seq));
  }

  _extractProximityPattern(memories, targetType, patternType, rule) {
    let proximalCount = 0;
    const evidence = [];
    for (const memory of memories) {
      const nearby = memories.filter(m => 
        m !== memory && m.entityType === targetType &&
        Math.abs(m.timestamp - memory.timestamp) < 10 &&
        Math.hypot(m.position.x - memory.position.x, m.position.y - memory.position.y) < 15
      );
      if (nearby.length > 0) {
        proximalCount++;
        evidence.push(memory.id);
        this.addAssociation(`type_${memory.entityType}`, `type_${targetType}`, 0.3);
      }
    }
    const confidence = proximalCount / memories.length;
    if (confidence > 0.3) {
      this.addPattern({
        type: patternType,
        rule,
        confidence,
        sourceCount: memories.length,
        timestamp: memories[memories.length - 1].timestamp,
        evidence
      });
    }
  }

  _extractClusterPattern(memories, patternType, rule) {
    let clusterCount = 0;
    const evidence = [];
    for (const memory of memories) {
      const nearby = memories.filter(m => 
        m !== memory && Math.hypot(m.position.x - memory.position.x, m.position.y - memory.position.y) < 20
      );
      if (nearby.length >= 2) {
        clusterCount++;
        evidence.push(memory.id);
      }
    }
    const confidence = clusterCount / memories.length;
    if (confidence > 0.4) {
      this.addPattern({
        type: patternType,
        rule,
        confidence,
        sourceCount: memories.length,
        timestamp: memories[memories.length - 1].timestamp,
        evidence
      });
    }
  }
}

// ### SpatialIndex Class
class SpatialIndex {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  addMemory(memory) {
    const key = `${Math.floor(memory.position.x / this.cellSize)},${Math.floor(memory.position.y / this.cellSize)}`;
    if (!this.grid.has(key)) this.grid.set(key, []);
    this.grid.get(key).push(memory);
  }

  getMemoriesNear(x, y, radius) {
    const memories = [];
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);
    for (let i = minX; i <= maxX; i++) {
      for (let j = minY; j <= maxY; j++) {
        const key = `${i},${j}`;
        if (this.grid.has(key)) {
          memories.push(...this.grid.get(key));
        }
      }
    }
    return memories.filter(m => Math.hypot(m.position.x - x, m.position.y - y) <= radius);
  }
}

// ### MemoryManager Class
export class MemoryManager {
  constructor(world, options = {}) {
    this.world = world;
    this.options = { ...CONFIG, ...options };
    this.apiEndpoint = this.options.API_ENDPOINT;
    this.agentMemoryCache = new Map();
    this.episodicQueue = new Map();
    this.longTermMemory = new Map();
    this.spatialIndex = new SpatialIndex(this.options.SPATIAL_CELL_SIZE);
    this.pendingSemanticUpdates = new Set();
    this.initialized = false;
    this.syncInProgress = false;
    this.retryQueue = new Map();
  }

  async initialize() {
    if (this.initialized) return;
    const agentEntities = this.findAgentEntities();
    await Promise.all(agentEntities.map(agent => this.initializeAgentMemory(agent)));
    this.initialized = true;
    console.log(`HESMS: Initialized memory for ${agentEntities.length} agents`);
    return this;
  }

  findAgentEntities() {
    return Array.from({ length: this.world.entities.length }, (_, i) => i)
      .filter(i => SensoryData[i] && Position[i]);
  }

  async initializeAgentMemory(agent) {
    if (EnhancedMemory[agent]) return;
    addComponent(this.world, EnhancedMemory, agent);
    EnhancedMemory.shortTermCapacity[agent] = 10;
    EnhancedMemory.shortTermIndex[agent] = 0;
    EnhancedMemory.globalFidelity[agent] = 1.0;
    EnhancedMemory.lastSyncTime[agent] = this.world.time || 0;
    EnhancedMemory.semanticUpdateTime[agent] = this.world.time || 0;
    EnhancedMemory.memoryId[agent] = Date.now() + agent;
    for (let i = 0; i < 10; i++) {
      EnhancedMemory.shortTermIds[agent * 10 + i] = 0;
      EnhancedMemory.shortTermTypes[agent * 10 + i] = 0;
      EnhancedMemory.shortTermPositionsX[agent * 10 + i] = 0;
      EnhancedMemory.shortTermPositionsY[agent * 10 + i] = 0;
      EnhancedMemory.shortTermTimestamps[agent * 10 + i] = 0;
      EnhancedMemory.shortTermImportance[agent * 10 + i] = 0;
      EnhancedMemory.shortTermFidelity[agent * 10 + i] = 1.0;
    }
    this.agentMemoryCache.set(EnhancedMemory.memoryId[agent], new SemanticMemory());
    if (this.options.ENABLE_CLOUD_SYNC) {
      await this.retryOperation(() => this.createCloudMemory(EnhancedMemory.memoryId[agent]));
    }
  }

  async createCloudMemory(memoryId) {
    if (!this.options.ENABLE_CLOUD_SYNC) return;
    const response = await axios.post(`${this.apiEndpoint}/memory/${memoryId}/create`, {});
    console.log(`HESMS: Cloud memory created for ID ${memoryId}`);
    return response.data;
  }

  recordEpisodicMemory(agent, event) {
    const memoryId = EnhancedMemory.memoryId[agent];
    const shortTermIndex = EnhancedMemory.shortTermIndex[agent];
    const capacity = EnhancedMemory.shortTermCapacity[agent];
    const context = {
      action: Actions[agent]?.currentAction || null,
      success: Actions[agent]?.successRate || null,
      emotionalState: CognitiveState[agent]?.emotionalState || null,
      realityShift: RealityFlux[agent]?.effectType > 0
    };
    const emotionalBoost = (context.emotionalState > 70 || context.emotionalState < 30) ? 0.2 : 0;
    event.importance = Math.min(1, (event.importance || 0.5) + emotionalBoost);

    EnhancedMemory.shortTermIds[agent * 10 + shortTermIndex] = event.entityId;
    EnhancedMemory.shortTermTypes[agent * 10 + shortTermIndex] = event.entityType;
    EnhancedMemory.shortTermPositionsX[agent * 10 + shortTermIndex] = event.position.x;
    EnhancedMemory.shortTermPositionsY[agent * 10 + shortTermIndex] = event.position.y;
    EnhancedMemory.shortTermTimestamps[agent * 10 + shortTermIndex] = this.world.time;
    EnhancedMemory.shortTermImportance[agent * 10 + shortTermIndex] = event.importance;
    EnhancedMemory.shortTermFidelity[agent * 10 + shortTermIndex] = EnhancedMemory.globalFidelity[agent];
    EnhancedMemory.shortTermIndex[agent] = (shortTermIndex + 1) % capacity;

    if (!this.episodicQueue.has(memoryId)) this.episodicQueue.set(memoryId, []);
    const episodicMemory = new EpisodicMemory(agent, {
      timestamp: this.world.time,
      entityId: event.entityId,
      entityType: event.entityType,
      position: event.position,
      importance: event.importance,
      context,
      fidelity: EnhancedMemory.globalFidelity[agent],
      tags: this.generateMemoryTags(event, context),
      emotional: context.emotionalState || 50
    });
    this.episodicQueue.get(memoryId).push(episodicMemory);
    this.spatialIndex.addMemory(episodicMemory);

    if (this.episodicQueue.get(memoryId).length >= 5) {
      this.pendingSemanticUpdates.add(memoryId);
    }
    return episodicMemory;
  }

  generateMemoryTags(event, context) {
    return [
      `type_${event.entityType}`,
      `imp_${Math.floor(event.importance * 10)}`,
      ...(context.action !== null ? [`act_${context.action}`] : []),
      ...(context.success > 80 ? ['success_high'] : []),
      ...(context.realityShift ? ['shift'] : []),
      `quad_${event.position.y < 50 ? 'n' : 's'}_${event.position.x < 50 ? 'w' : 'e'}`
    ];
  }

  async syncEpisodicMemories() {
    if (!this.options.ENABLE_CLOUD_SYNC || this.syncInProgress || this.episodicQueue.size === 0) return;
    this.syncInProgress = true;
    const memoryIds = Array.from(this.episodicQueue.keys());
    for (const memoryId of memoryIds) {
      const memories = this.episodicQueue.get(memoryId).sort((a, b) => b.importance - a.importance);
      if (memories.length === 0) continue;
      const batches = [];
      for (let i = 0; i < memories.length; i += this.options.BATCH_SIZE) {
        batches.push(memories.slice(i, i + this.options.BATCH_SIZE));
      }
      for (const batch of batches) {
        await this.retryOperation(async () => {
          const payload = batch.map(m => m.compress());
          await axios.post(`${this.apiEndpoint}/memory/${memoryId}/episodic`, { memories: payload });
          console.log(`HESMS: Synced ${batch.length} memories for ID ${memoryId}`);
        });
      }
      this.episodicQueue.set(memoryId, []);
    }
    this.syncInProgress = false;
  }

  async updateSemanticPatterns() {
    if (this.pendingSemanticUpdates.size === 0) return;
    const memoryIds = Array.from(this.pendingSemanticUpdates);
    for (const memoryId of memoryIds) {
      let semantic = this.agentMemoryCache.get(memoryId) || new SemanticMemory();
      const episodicMemories = this.episodicQueue.get(memoryId) || [];
      semantic.updateFromEpisodic(episodicMemories, this.world.time);
      this.agentMemoryCache.set(memoryId, semantic);
      if (this.options.ENABLE_CLOUD_SYNC) {
        await this.retryOperation(() => axios.post(`${this.apiEndpoint}/memory/${memoryId}/semantic`, semantic));
      }
      this.pendingSemanticUpdates.delete(memoryId);
    }
  }

  getSemanticMemory(agent) {
    return this.agentMemoryCache.get(EnhancedMemory.memoryId[agent]) || new SemanticMemory();
  }

  findRelevantPatterns(agent, context = {}) {
    const semantic = this.getSemanticMemory(agent);
    if (!semantic.patterns?.length) return [];
    const relevant = semantic.patterns.filter(p => 
      p.confidence >= this.options.PATTERN_CONFIDENCE_THRESHOLD &&
      (!context.type || p.type.includes(context.type))
    );
    return relevant.sort((a, b) => b.confidence - a.confidence);
  }

  processRealityShift(agent) {
    const realityEffect = RealityFlux[agent]?.effectType || 0;
    if (realityEffect > 0) {
      switch (realityEffect) {
        case 1: EnhancedMemory.globalFidelity[agent] *= 0.8; break; // Teleport
        case 2: this.distortTemporalMemories(agent); break; // Phase
        case 3: this.distortTypeMemories(agent); break; // Transform
      }
      this.recordEpisodicMemory(agent, {
        entityId: agent,
        entityType: 99,
        position: { x: Position.x[agent], y: Position.y[agent] },
        importance: 0.9,
        context: { realityShift: true, effectType: realityEffect }
      });
      EnhancedMemory.globalFidelity[agent] = Math.max(0.2, EnhancedMemory.globalFidelity[agent]);
    } else {
      EnhancedMemory.globalFidelity[agent] = Math.min(1.0, EnhancedMemory.globalFidelity[agent] + 0.01);
    }
  }

  distortTemporalMemories(agent) {
    const capacity = EnhancedMemory.shortTermCapacity[agent];
    for (let i = 0; i < capacity; i++) {
      if (Math.random() < 0.3 && EnhancedMemory.shortTermTimestamps[agent * 10 + i] > 0) {
        EnhancedMemory.shortTermTimestamps[agent * 10 + i] += (Math.random() * 20 - 10) | 0;
        EnhancedMemory.shortTermFidelity[agent * 10 + i] *= 0.9;
      }
    }
  }

  distortTypeMemories(agent) {
    const capacity = EnhancedMemory.shortTermCapacity[agent];
    for (let i = 0; i < capacity; i++) {
      if (Math.random() < 0.3 && EnhancedMemory.shortTermTypes[agent * 10 + i] <= 2) {
        EnhancedMemory.shortTermTypes[agent * 10 + i] = (Math.random() * 3) | 0;
        EnhancedMemory.shortTermFidelity[agent * 10 + i] *= 0.9;
      }
    }
  }

  async consolidateMemories() {
    for (const [memoryId, episodicMemories] of this.episodicQueue) {
      const importantMemories = episodicMemories.filter(m => m.importance > 0.7);
      if (!this.longTermMemory.has(memoryId)) {
        this.longTermMemory.set(memoryId, []);
      }
      this.longTermMemory.get(memoryId).push(...importantMemories);
      this.episodicQueue.set(memoryId, episodicMemories.filter(m => m.importance <= 0.7));
      const semantic = this.agentMemoryCache.get(memoryId) || new SemanticMemory();
      semantic.updateFromEpisodic(importantMemories, this.world.time);
      this.agentMemoryCache.set(memoryId, semantic);
    }
  }

  applyMemoryDecay() {
    const decayRate = this.options.MEMORY_DECAY_RATE;
    for (const [memoryId, memories] of this.episodicQueue) {
      memories.forEach(m => {
        const age = this.world.time - m.timestamp;
        m.importance *= Math.exp(-decayRate * age);
        if (m.importance < 0.1) {
          // Remove or archive the memory
        }
      });
    }
    for (const [memoryId, memories] of this.longTermMemory) {
      memories.forEach(m => {
        const age = this.world.time - m.timestamp;
        m.importance *= Math.exp(-decayRate * age);
        if (m.importance < 0.1) {
          // Remove or archive the memory
        }
      });
    }
  }

  async retryOperation(operation, retries = this.options.MAX_RETRIES) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === retries - 1) throw error;
        console.warn(`HESMS: Retry ${attempt + 1}/${retries} failed: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, this.options.RETRY_DELAY * (attempt + 1)));
      }
    }
  }
}

// ### Enhanced Memory System
export const createEnhancedMemorySystem = (memoryManager) => {
  const memoryQuery = defineQuery([EnhancedMemory, SensoryData, Position]);
  return defineSystem(async (world) => {
    if (!memoryManager.initialized) await memoryManager.initialize();
    const agents = memoryQuery(world);
    const currentTime = world.time || 0;
    for (const agent of agents) {
      memoryManager.processRealityShift(agent);
      for (let j = 0; j < 10; j++) {
        const entity = SensoryData.entitiesDetected[agent * 10 + j];
        if (entity === 0 || checkRecentlyRecorded(agent, entity)) continue;
        const type = Environmental[entity]?.type || 0;
        const importance = calculateImportance(type, entity, agent);
        memoryManager.recordEpisodicMemory(agent, {
          entityId: entity,
          entityType: type,
          position: { x: Position.x[entity], y: Position.y[entity] },
          importance
        });
      }
      if (currentTime - EnhancedMemory.lastSyncTime[agent] >= memoryManager.options.MEMORY_SYNC_INTERVAL) {
        EnhancedMemory.lastSyncTime[agent] = currentTime;
        EnhancedMemory.syncPending[agent] = 1;
      }
      if (currentTime - EnhancedMemory.semanticUpdateTime[agent] >= memoryManager.options.SEMANTIC_UPDATE_INTERVAL) {
        EnhancedMemory.semanticUpdateTime[agent] = currentTime;
        EnhancedMemory.semanticPending[agent] = 1;
      }
      if (currentTime % memoryManager.options.CONSOLIDATION_INTERVAL === 0) {
        memoryManager.consolidateMemories();
        memoryManager.applyMemoryDecay();
      }
    }
    if (memoryManager.options.ENABLE_CLOUD_SYNC) {
      await memoryManager.syncEpisodicMemories();
      await memoryManager.updateSemanticPatterns();
    }
    return world;
  });
};

// ### Helper Functions
function checkRecentlyRecorded(agent, entityId) {
  const capacity = EnhancedMemory.shortTermCapacity[agent];
  return Array.from({ length: capacity }, (_, i) => i)
    .some(i => EnhancedMemory.shortTermIds[agent * 10 + i] === entityId && 
               (memoryManager.world.time - EnhancedMemory.shortTermTimestamps[agent * 10 + i]) < 10);
}

function calculateImportance(type, entityId, agent) {
  let importance = [0.7, 0.4, 0.8][type] || 0.5;
  if (Goals[agent]?.primaryType === 1 && type === 0) importance += 0.2;
  if (Goals[agent]?.primaryType === 2 && type === 2) importance += 0.2;
  if (RealityFlux[entityId]?.effectType > 0) importance += 0.1;
  if (CognitiveState[agent]?.emotionalState > 70 || CognitiveState[agent]?.emotionalState < 30) importance += 0.15;
  return Math.min(1.0, Math.max(0.1, importance));
}

// ### Integration with ArgOS
export function integrateHESMSWithArgOS(world, options = {}) {
  console.log("Initializing HESMS...");
  const memoryManager = new MemoryManager(world, options);
  const memorySystem = createEnhancedMemorySystem(memoryManager);
  const decisionSystem = createEnhancedDecisionSystem(memoryManager);
  return { memoryManager, memorySystem, decisionSystem };
}

// ### Demo Utility
export function runHESMSDemoSetup(world, options = {}) {
  console.log("Running HESMS demo setup...");
  const { memoryManager } = integrateHESMSWithArgOS(world, options);
  return memoryManager;
}

// ### Visualization
export function visualizeAgentMemory(ctx, agent, memoryManager, pixelsPerUnit = 5) {
  if (!EnhancedMemory[agent]) return;
  const x = Position.x[agent] * pixelsPerUnit;
  const y = Position.y[agent] * pixelsPerUnit;
  const semantic = memoryManager.getSemanticMemory(agent);
  const fidelity = EnhancedMemory.globalFidelity[agent];
  const auraSize = 10 * (0.5 + fidelity * 0.5);
  ctx.beginPath();
  ctx.arc(x, y, auraSize, 0, 2 * Math.PI);
  ctx.fillStyle = `rgba(155, 89, 182, ${0.3 * fidelity})`;
  ctx.fill();
  if (semantic?.patterns?.length > 0) {
    const patternCount = Math.min(3, semantic.patterns.length);
    for (let i = 0; i < patternCount; i++) {
      const pattern = semantic.patterns[i];
      const angle = (i / patternCount) * Math.PI * 2;
      const dist = 15 + Math.sin(Date.now() / 1000) * 2;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(41, 128, 185, ${0.7 * pattern.confidence})`;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(px, py);
      ctx.strokeStyle = `rgba(41, 128, 185, ${0.4 * pattern.confidence})`;
      ctx.lineWidth = 1 + Math.sin(Date.now() / 500) * 0.5;
      ctx.stroke();
    }
  }
  const memories = memoryManager.longTermMemory.get(EnhancedMemory.memoryId[agent]) || [];
  memories.forEach(m => {
    const mx = m.position.x * pixelsPerUnit;
    const my = m.position.y * pixelsPerUnit;
    ctx.beginPath();
    if (m.entityType === 0) {
      ctx.arc(mx, my, 2, 0, 2 * Math.PI);
    } else if (m.entityType === 1) {
      ctx.rect(mx - 2, my - 2, 4, 4);
    } else if (m.entityType === 2) {
      ctx.moveTo(mx, my - 2);
      ctx.lineTo(mx - 2, my + 2);
      ctx.lineTo(mx + 2, my + 2);
      ctx.closePath();
    }
    ctx.fillStyle = `rgba(255, 0, 0, ${m.importance})`;
    ctx.fill();
  });
}

// ### Enhanced Decision System
export const createEnhancedDecisionSystem = (memoryManager) => {
  const decisionQuery = defineQuery([EnhancedMemory, Goals, SensoryData, CognitiveState, Position]);
  return defineSystem((world) => {
    const agents = decisionQuery(world);
    for (const agent of agents) {
      const memoryId = EnhancedMemory.memoryId[agent];
      const semantic = memoryManager.getSemanticMemory(agent);
      const context = {
        agentPos: { x: Position.x[agent], y: Position.y[agent] },
        emotionalState: CognitiveState[agent]?.emotionalState || 50,
        adaptability: CognitiveState[agent]?.adaptability || 50
      };
      const entities = { resources: [], obstacles: [], hazards: [], agents: [] };
      for (let j = 0; j < 10; j++) {
        const entity = SensoryData.entitiesDetected[agent * 10 + j];
        if (entity === 0) continue;
        const pos = { x: Position.x[entity], y: Position.y[entity] };
        if (Environmental[entity]) {
          const type = Environmental.type[entity];
          entities[['resources', 'obstacles', 'hazards'][type]].push({ entity, pos });
        } else if (SensoryData[entity]) {
          entities.agents.push({ entity, pos });
        }
      }
      let goalType = 0, targetX = 0, targetY = 0, targetEntity = 0, priority = 0;
      const patterns = memoryManager.findRelevantPatterns(agent, context);
      if (patterns.length > 0) {
        const topPattern = patterns[0];
        switch (topPattern.type) {
          case 'resource_obstacle_proximity':
            if (entities.obstacles.length > 0 && entities.resources.length === 0) {
              const obs = entities.obstacles[Math.floor(Math.random() * entities.obstacles.length)];
              const angle = Math.random() * Math.PI * 2;
              goalType = 1;
              targetX = obs.pos.x + Math.cos(angle) * (5 + Math.random() * 5);
              targetY = obs.pos.y + Math.sin(angle) * (5 + Math.random() * 5);
              priority = 60 * topPattern.confidence;
            }
            break;
          case 'resource_clustering':
            if (entities.resources.length === 1) {
              const res = entities.resources[0];
              const angle = Math.random() * Math.PI * 2;
              goalType = 1;
              targetX = res.pos.x + Math.cos(angle) * (3 + Math.random() * 7);
              targetY = res.pos.y + Math.sin(angle) * (3 + Math.random() * 7);
              priority = 55 * topPattern.confidence;
            }
            break;
          case 'hazard_shift_stability':
            if (world.realityWave?.active && topPattern.confidence > 0.7 && entities.hazards.length > 0) {
              const haz = entities.hazards[0];
              const dx = context.agentPos.x - haz.pos.x;
              const dy = context.agentPos.y - haz.pos.y;
              const dist = Math.hypot(dx, dy);
              if (dist > 0) {
                goalType = 2;
                targetX = context.agentPos.x + (dx / dist) * 20;
                targetY = context.agentPos.y + (dy / dist) * 20;
                priority = 80 * topPattern.confidence;
              }
            }
            break;
        }
      }
      const nearbyMemories = memoryManager.spatialIndex.getMemoriesNear(context.agentPos.x, context.agentPos.y, 20);
      const emotionalMemories = memoryManager.longTermMemory.get(memoryId)
        .filter(m => Math.abs(m.emotionalImpact - context.emotionalState) < 10);
      if (nearbyMemories.some(m => m.entityType === 2)) {
        priority += 20;
      }
      if (emotionalMemories.some(m => m.context.success < 50)) {
        priority += 10;
      }
      if (priority === 0) {
        if (entities.hazards.length > 0) {
          const haz = entities.hazards[0];
          const dx = context.agentPos.x - haz.pos.x;
          const dy = context.agentPos.y - haz.pos.y;
          const dist = Math.hypot(dx, dy);
          goalType = 2;
          targetX = context.agentPos.x + (dx / dist) * 15;
          targetY = context.agentPos.y + (dy / dist) * 15;
          priority = 70;
        } else if (entities.resources.length > 0) {
          const res = entities.resources[0];
          goalType = 1;
          targetX = res.pos.x;
          targetY = res.pos.y;
          targetEntity = res.entity;
          priority = 50;
        } else if (entities.agents.length > 0 && Math.random() < 0.2) {
          const agt = entities.agents[0];
          goalType = 3;
          targetX = agt.pos.x;
          targetY = agt.pos.y;
          targetEntity = agt.entity;
          priority = 30;
        } else {
          const angle = Math.random() * Math.PI * 2;
          goalType = 0;
          targetX = context.agentPos.x + Math.cos(angle) * 10;
          targetY = context.agentPos.y + Math.sin(angle) * 10;
          priority = 20;
        }
      }
      Goals.primaryType[agent] = goalType;
      Goals.targetEntity[agent] = targetEntity;
      Goals.targetX[agent] = targetX;
      Goals.targetY[agent] = targetY;
      Goals.priority[agent] = priority;
    }
    return world;
  });
};
