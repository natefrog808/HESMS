/**
 * ArgOS Consciousness Extension
 * 
 * Extends the HESMS with higher-order consciousness functions:
 * - Dream state simulation
 * - Self-reflection capabilities
 * - Narrative generation
 * - Imagination and hypothesis testing
 * 
 * Part of Project 89's advanced cognitive simulation exploration.
 */

import { 
  Position, 
  SensoryData, 
  Actions, 
  Goals, 
  CognitiveState, 
  RealityFlux 
} from './argos-framework.js';
import { EnhancedMemory, MemoryManager } from './argos-memory-extension.js';
import { defineComponent, defineQuery, defineSystem, Types, addComponent } from 'bitecs';

// Configuration
const CONSCIOUSNESS_CONFIG = {
  DREAM_CYCLE_LENGTH: 200,
  DREAM_INTENSITY: 0.6,
  NARRATIVE_THRESHOLD: 0.4,
  SELF_REFLECTION_INTERVAL: 100,
  IMAGINATION_DEPTH: 3,
  DREAM_ENABLED: true,
  REFLECTION_ENABLED: true,
  IMAGINATION_ENABLED: true,
  NARRATIVE_ENABLED: true
};

// ConsciousnessState Component
export const ConsciousnessState = defineComponent({
  dreamCyclePhase: Types.f32,
  dreamingActive: Types.ui8,
  lastReflectionTime: Types.ui32,
  lastNarrativeTime: Types.ui32,
  selfAwarenessLevel: Types.f32,
  narrativeComplexity: Types.f32,
  imaginationCapacity: Types.f32,
  integrationIndex: Types.f32
});

// Dream State Class
class DreamState {
  constructor(agent, memoryManager) {
    this.agent = agent;
    this.memoryManager = memoryManager;
    this.dreamMemories = [];
    this.significantEntities = new Map();
    this.emotionalThemes = new Map();
    this.narrativeFragments = [];
    this.isActive = false;
    this.intensity = 0;
    this.duration = 0;
  }

  activate(intensity = CONSCIOUSNESS_CONFIG.DREAM_INTENSITY) {
    this.isActive = true;
    this.intensity = Math.min(1, Math.max(0, intensity));
    this.duration = 0;
    this.dreamMemories = [];
    this.narrativeFragments = [];
    this.gatherSignificantMemories();
    console.log(`Dream state activated for agent ${this.agent} with intensity ${this.intensity.toFixed(2)}`);
    return this;
  }

  deactivate() {
    this.isActive = false;
    this.consolidateDreamExperience();
    console.log(`Dream state deactivated for agent ${this.agent} after ${this.duration} cycles`);
    return this;
  }

  gatherSignificantMemories() {
    // Get important memories from short-term buffer
    const memoryId = EnhancedMemory.memoryId[this.agent];
    const capacity = EnhancedMemory.shortTermCapacity[this.agent];
    const currentTime = this.memoryManager.world.time;
    const shortTermMemories = [];
    
    for (let i = 0; i < capacity; i++) {
      const importance = EnhancedMemory.shortTermImportance[this.agent * 10 + i];
      const timestamp = EnhancedMemory.shortTermTimestamps[this.agent * 10 + i];
      if (importance > 0.6 && timestamp > 0 && currentTime - timestamp < 500) {
        shortTermMemories.push({
          entityId: EnhancedMemory.shortTermIds[this.agent * 10 + i],
          entityType: EnhancedMemory.shortTermTypes[this.agent * 10 + i],
          position: { 
            x: EnhancedMemory.shortTermPositionsX[this.agent * 10 + i],
            y: EnhancedMemory.shortTermPositionsY[this.agent * 10 + i]
          },
          timestamp,
          importance,
          fidelity: EnhancedMemory.shortTermFidelity[this.agent * 10 + i]
        });
      }
    }

    // Process memories into themes and significant entities
    shortTermMemories.forEach(memory => {
      const typeKey = `type_${memory.entityType}`;
      this.emotionalThemes.set(
        typeKey, 
        (this.emotionalThemes.get(typeKey) || 0) + memory.importance
      );
      
      this.significantEntities.set(
        memory.entityId, 
        (this.significantEntities.get(memory.entityId) || 0) + memory.importance
      );
    });

    // Sort by importance
    this.dreamMemories = shortTermMemories.sort((a, b) => b.importance - a.importance);
  }

  update() {
    if (!this.isActive) return;
    
    this.duration++;
    
    // Generate new dream fragment
    if (this.duration % 10 === 0 && this.dreamMemories.length > 0) {
      this.generateDreamFragment();
    }
    
    // Apply dream effects
    this.applyDreamEffects();
    
    // Auto-deactivate if duration exceeds limit
    if (this.duration >= CONSCIOUSNESS_CONFIG.DREAM_CYCLE_LENGTH) {
      this.deactivate();
    }
  }

  generateDreamFragment() {
    // Select memories to combine (usually 2-3)
    const memoryCount = Math.floor(1 + Math.random() * 2);
    const selectedMemories = [];
    
    for (let i = 0; i < memoryCount && i < this.dreamMemories.length; i++) {
      const index = Math.floor(Math.random() * this.dreamMemories.length);
      selectedMemories.push(this.dreamMemories[index]);
    }
    
    if (selectedMemories.length === 0) return;
    
    // Determine the primary theme
    const themes = Array.from(this.emotionalThemes.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    const primaryTheme = themes.length > 0 ? themes[0] : 'neutral';
    
    // Generate narrative fragment
    const fragment = {
      theme: primaryTheme,
      memories: selectedMemories,
      transformations: this.generateTransformations(selectedMemories),
      emotionalTone: this.calculateEmotionalTone(),
      timestamp: this.memoryManager.world.time,
      duration: 30 + Math.random() * 50
    };
    
    this.narrativeFragments.push(fragment);
    console.log(`Dream fragment generated with theme ${primaryTheme}`);
    
    return fragment;
  }

  generateTransformations(memories) {
    const transformations = [];
    
    // Spatial transformations
    if (Math.random() < 0.7) {
      const spatialShift = {
        type: 'spatial',
        scale: 0.5 + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2,
        translation: {
          x: (Math.random() * 2 - 1) * 20,
          y: (Math.random() * 2 - 1) * 20
        }
      };
      transformations.push(spatialShift);
    }
    
    // Entity transformations
    if (Math.random() < 0.4) {
      const entityTypes = [0, 1, 2, 3]; // Resource, Obstacle, Hazard, Agent
      const sourceType = memories[0]?.entityType || 0;
      const availableTypes = entityTypes.filter(t => t !== sourceType);
      const targetType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      
      transformations.push({
        type: 'entity',
        sourceType,
        targetType,
        partial: Math.random() < 0.3
      });
    }
    
    // Temporal transformations
    if (Math.random() < 0.5) {
      transformations.push({
        type: 'temporal',
        compression: 0.2 + Math.random() * 1.5,
        reversal: Math.random() < 0.2
      });
    }
    
    return transformations;
  }

  calculateEmotionalTone() {
    const baseEmotion = CognitiveState[this.agent]?.emotionalState || 50;
    const variation = (Math.random() * 30 - 15);
    return Math.min(100, Math.max(0, baseEmotion + variation));
  }

  applyDreamEffects() {
    if (!this.isActive || this.narrativeFragments.length === 0) return;
    
    const fragment = this.narrativeFragments[this.narrativeFragments.length - 1];
    if (!fragment) return;
    
    // Apply dream effects to cognitive state
    if (CognitiveState[this.agent]) {
      // Dream emotions leak into waking emotional state slightly
      const emotionalBleed = (fragment.emotionalTone - CognitiveState[this.agent].emotionalState) * 0.01;
      CognitiveState[this.agent].emotionalState += emotionalBleed;
      
      // Dreams momentarily affect adaptability in proportion to transformations count
      const transformationEffect = fragment.transformations.length * 0.02;
      CognitiveState[this.agent].adaptability = Math.min(
        100, 
        CognitiveState[this.agent].adaptability + transformationEffect
      );
    }
    
    // Apply dream effects to memory fidelity
    EnhancedMemory.globalFidelity[this.agent] *= (0.995 + Math.random() * 0.01);
  }

  consolidateDreamExperience() {
    if (this.narrativeFragments.length === 0) return;
    
    // Create a synthetic memory from the dream experience
    const dreamMemory = {
      entityId: this.agent,
      entityType: 99, // Special type for dream
      position: { x: Position.x[this.agent], y: Position.y[this.agent] },
      importance: 0.7 + (this.intensity * 0.3),
      context: {
        dreamState: true,
        fragments: this.narrativeFragments.length,
        theme: this.getDominantTheme(),
        emotional: this.getAverageEmotionalTone()
      }
    };
    
    // Record the dream as an episodic memory
    this.memoryManager.recordEpisodicMemory(this.agent, dreamMemory);
    
    // Increase self-awareness after dreaming
    if (ConsciousnessState[this.agent]) {
      ConsciousnessState.selfAwarenessLevel[this.agent] += 0.05;
      ConsciousnessState.narrativeComplexity[this.agent] += 0.02;
    }
  }

  getDominantTheme() {
    return Array.from(this.emotionalThemes.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])[0] || 'neutral';
  }

  getAverageEmotionalTone() {
    if (this.narrativeFragments.length === 0) return 50;
    
    const sum = this.narrativeFragments.reduce(
      (acc, fragment) => acc + fragment.emotionalTone, 
      0
    );
    
    return sum / this.narrativeFragments.length;
  }
}

// Self-Reflection Class
class SelfReflection {
  constructor(agent, memoryManager) {
    this.agent = agent;
    this.memoryManager = memoryManager;
    this.insightLog = [];
    this.behavioralPatterns = new Map();
    this.adaptationProgress = new Map();
    this.lastReflectionTime = 0;
  }

  performReflection() {
    const currentTime = this.memoryManager.world.time;
    if (currentTime - this.lastReflectionTime < CONSCIOUSNESS_CONFIG.SELF_REFLECTION_INTERVAL) return;
    
    this.lastReflectionTime = currentTime;
    ConsciousnessState.lastReflectionTime[this.agent] = currentTime;
    
    // Analyze recent behaviors
    this.analyzeRecentBehaviors();
    
    // Evaluate goal achievement patterns
    this.evaluateGoalAchievement();
    
    // Generate insight
    const insight = this.generateInsight();
    if (insight) {
      this.insightLog.push(insight);
      this.applyInsight(insight);
    }
    
    return insight;
  }

  analyzeRecentBehaviors() {
    // Analyze the agent's behavior patterns based on recent actions
    const recentActions = []; // Would be populated from action history
    const actionCounts = new Map();
    
    // Count action frequencies
    for (const action of recentActions) {
      actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
    }
    
    // Detect dominant behaviors
    const totalActions = recentActions.length || 1;
    actionCounts.forEach((count, action) => {
      const frequency = count / totalActions;
      if (frequency > 0.3) {
        this.behavioralPatterns.set(action, frequency);
      }
    });
  }

  evaluateGoalAchievement() {
    // Evaluate how well the agent has been achieving its goals
    const goal = Goals.primaryType[this.agent];
    const successRate = Actions[this.agent]?.successRate || 0.5;
    
    this.adaptationProgress.set(goal, successRate);
  }

  generateInsight() {
    // Aggregate semantic patterns from memory
    const semanticPatterns = this.memoryManager.findRelevantPatterns(this.agent);
    if (semanticPatterns.length === 0) return null;
    
    // Combine with behavioral patterns
    const behaviors = Array.from(this.behavioralPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    
    // Generate insight
    const insight = {
      timestamp: this.memoryManager.world.time,
      patterns: semanticPatterns.slice(0, 2),
      behaviors,
      adaptations: Array.from(this.adaptationProgress.entries()),
      conclusion: this.formulateConclusion(semanticPatterns, behaviors),
      confidence: this.calculateInsightConfidence(semanticPatterns)
    };
    
    return insight;
  }

  formulateConclusion(patterns, behaviors) {
    if (patterns.length === 0) return "Insufficient data for conclusion";
    
    const topPattern = patterns[0];
    const topBehavior = behaviors[0] || [null, 0];
    
    const behaviorMatrix = {
      'resource_clustering': {
        0: "Exploration increases chance of finding resource clusters",
        1: "Focused resource gathering is efficient for known clusters",
        2: "Avoiding hazards limits access to resource-rich areas",
        3: "Collaboration may help locate resource clusters"
      },
      'resource_obstacle_proximity': {
        0: "Exploring near obstacles often yields resources",
        1: "Focused search near obstacles is high-yield strategy",
        2: "Hazard avoidance can still allow obstacle investigation",
        3: "Group searches near obstacles maximize resource discovery"
      },
      'hazard_shift_stability': {
        0: "Exploration during reality shifts is high-risk, high-reward",
        1: "Focus on stable resource areas during shifts",
        2: "Enhanced hazard avoidance during shifts is critical",
        3: "Group cohesion during shifts increases survival"
      }
    };
    
    // Return appropriate conclusion based on pattern and behavior
    if (behaviorMatrix[topPattern.type] && behaviorMatrix[topPattern.type][topBehavior[0]]) {
      return behaviorMatrix[topPattern.type][topBehavior[0]];
    }
    
    return `Pattern identified: ${topPattern.rule}`;
  }

  calculateInsightConfidence(patterns) {
    if (patterns.length === 0) return 0.3;
    
    const patternConfidence = patterns.reduce(
      (sum, pattern) => sum + pattern.confidence, 
      0
    ) / patterns.length;
    
    const experienceModifier = Math.min(1, ConsciousnessState.selfAwarenessLevel[this.agent] * 0.5);
    
    return Math.min(0.95, patternConfidence * (0.7 + experienceModifier));
  }

  applyInsight(insight) {
    if (!insight || insight.confidence < 0.4) return;
    
    // Apply insight to cognitive parameters
    CognitiveState[this.agent].adaptability += 0.02;
    
    // Enhance memory importance for related patterns
    insight.patterns.forEach(pattern => {
      if (pattern.evidence && pattern.evidence.length > 0) {
        // Would increase importance of memories related to this pattern
        // Implementation depends on memory system details
      }
    });
    
    // Create a new semantic pattern from this insight
    const semanticMemory = this.memoryManager.getSemanticMemory(this.agent);
    semanticMemory.addPattern({
      type: 'self_insight',
      rule: insight.conclusion,
      confidence: insight.confidence,
      sourceCount: 1,
      timestamp: insight.timestamp,
      evidence: []
    });
    
    // Increment integration index
    ConsciousnessState.integrationIndex[this.agent] += 0.03;
  }
}

// Imagination Class
class Imagination {
  constructor(agent, memoryManager) {
    this.agent = agent;
    this.memoryManager = memoryManager;
    this.scenarios = [];
    this.currentScenario = null;
    this.simulationResults = [];
  }

  generateScenario(context = {}) {
    // Only generate new scenarios occasionally
    if (Math.random() > 0.3) return null;
    
    // Use current sensory data and goals to set up scenario
    const goal = Goals.primaryType[this.agent];
    const currentPos = { x: Position.x[this.agent], y: Position.y[this.agent] };
    const entityType = context.entityType || (Math.random() < 0.5 ? 0 : 2); // Resource or hazard
    
    // Create a hypothetical scenario
    const scenario = {
      id: `scenario-${this.agent}-${Date.now()}`,
      baseGoal: goal,
      startPosition: { ...currentPos },
      entityType,
      entityPositions: this.generateHypotheticalPositions(currentPos, entityType),
      strategies: this.generatePossibleStrategies(goal, entityType),
      outcome: null,
      confidence: 0,
      timestamp: this.memoryManager.world.time
    };
    
    this.scenarios.push(scenario);
    this.currentScenario = scenario;
    
    return scenario;
  }

  generateHypotheticalPositions(basePos, entityType) {
    const positions = [];
    const count = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < count; i++) {
      const distance = 5 + Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      positions.push({
        x: basePos.x + Math.cos(angle) * distance,
        y: basePos.y + Math.sin(angle) * distance,
        type: entityType
      });
    }
    
    return positions;
  }

  generatePossibleStrategies(goal, entityType) {
    const strategies = [];
    
    // Direct approach strategy
    strategies.push({
      id: 'direct',
      description: entityType === 0 ? 'Direct resource acquisition' : 'Direct hazard avoidance',
      steps: ['move_directly', entityType === 0 ? 'gather' : 'avoid'],
      estimatedSuccess: 0.6,
      energyCost: 10
    });
    
    // Cautious strategy
    strategies.push({
      id: 'cautious',
      description: entityType === 0 ? 'Careful resource assessment' : 'Careful hazard monitoring',
      steps: ['observe', 'plan', 'execute_carefully'],
      estimatedSuccess: 0.8,
      energyCost: 25
    });
    
    // Opportunistic strategy
    if (Math.random() < 0.7) {
      strategies.push({
        id: 'opportunistic',
        description: 'Adaptive approach based on changing conditions',
        steps: ['assess_environment', 'identify_opportunity', 'quick_action'],
        estimatedSuccess: 0.5 + Math.random() * 0.3,
        energyCost: 15
      });
    }
    
    return strategies;
  }

  simulateScenario() {
    if (!this.currentScenario) return null;
    
    // Choose a strategy to test
    const strategy = this.selectStrategyToTest();
    if (!strategy) return null;
    
    // Simulate outcome based on agent capabilities and strategy
    const adaptability = CognitiveState[this.agent]?.adaptability || 50;
    const awareness = ConsciousnessState.selfAwarenessLevel[this.agent];
    
    // Calculate base success probability
    let successProb = strategy.estimatedSuccess;
    
    // Adjust for agent capabilities
    successProb += (adaptability - 50) * 0.003;
    successProb += awareness * 0.05;
    
    // Random component
    successProb += (Math.random() * 0.3 - 0.15);
    successProb = Math.min(0.95, Math.max(0.05, successProb));
    
    // Determine outcome
    const success = Math.random() < successProb;
    const result = {
      scenarioId: this.currentScenario.id,
      strategy: strategy.id,
      success,
      alternatePath: this.generateAlternatePath(strategy, success),
      insightsGained: this.calculateInsightsGained(strategy, success),
      timestamp: this.memoryManager.world.time
    };
    
    this.simulationResults.push(result);
    this.currentScenario.outcome = result;
    this.currentScenario.confidence = Math.min(0.9, 0.4 + (awareness * 0.5));
    
    // Record the imagination result as a low-importance memory
    this.recordImaginationResult(result);
    
    return result;
  }

  selectStrategyToTest() {
    if (!this.currentScenario || !this.currentScenario.strategies.length) return null;
    
    const strategies = this.currentScenario.strategies;
    
    // Select strategy with preference for higher estimated success
    const totalSuccess = strategies.reduce((sum, s) => sum + s.estimatedSuccess, 0);
    let randomPoint = Math.random() * totalSuccess;
    
    for (const strategy of strategies) {
      randomPoint -= strategy.estimatedSuccess;
      if (randomPoint <= 0) return strategy;
    }
    
    return strategies[0];
  }

  generateAlternatePath(strategy, success) {
    if (success) return null; // No need for alternate path if successful
    
    // Create an alternate approach based on the failed strategy
    const alternateSteps = [...strategy.steps];
    
    // Modify one step randomly
    const stepToChange = Math.floor(Math.random() * alternateSteps.length);
    const alternativeActions = ['wait', 'retreat', 'circle', 'accelerate', 'zigzag'];
    alternateSteps[stepToChange] = alternativeActions[Math.floor(Math.random() * alternativeActions.length)];
    
    return {
      modifiedStrategy: strategy.id + '_modified',
      newSteps: alternateSteps,
      estimatedImprovement: 0.1 + Math.random() * 0.2
    };
  }

  calculateInsightsGained(strategy, success) {
    // Calculate what the agent learns from this simulation
    const insightValue = success ? 0.05 : 0.1; // We often learn more from failures
    
    return {
      strategicValue: insightValue,
      applicationDomains: [this.currentScenario.entityType === 0 ? 'resource_acquisition' : 'hazard_avoidance'],
      adaptabilityIncrease: success ? 0.01 : 0.02
    };
  }

  recordImaginationResult(result) {
    // Record the imagination result as a memory
    this.memoryManager.recordEpisodicMemory(this.agent, {
      entityId: this.agent,
      entityType: 98, // Special type for imagined scenarios
      position: { x: Position.x[this.agent], y: Position.y[this.agent] },
      importance: 0.3, // Lower importance than real memories
      context: {
        imagination: true,
        scenarioId: result.scenarioId,
        strategy: result.strategy,
        success: result.success,
        insights: result.insightsGained
      }
    });
    
    // Apply insights to consciousness state
    ConsciousnessState.imaginationCapacity[this.agent] += 0.01;
    CognitiveState[this.agent].adaptability += result.insightsGained.adaptabilityIncrease;
  }

  getRelevantScenarios(context) {
    if (!context || !context.entityType) return [];
    
    return this.scenarios.filter(scenario => 
      scenario.entityType === context.entityType && 
      scenario.outcome && 
      scenario.outcome.success
    ).sort((a, b) => b.confidence - a.confidence);
  }
}

// Narrative Construction Class
class NarrativeConstruction {
  constructor(agent, memoryManager) {
    this.agent = agent;
    this.memoryManager = memoryManager;
    this.narrativeFragments = [];
    this.currentNarrative = null;
    this.thematicAssociations = new Map();
    this.characterRoles = new Map();
    this.narrativeComplexity = 0;
  }

  generateNarrative() {
    const currentTime = this.memoryManager.world.time;
    if (currentTime - ConsciousnessState.lastNarrativeTime[this.agent] < 150) return null;
    
    ConsciousnessState.lastNarrativeTime[this.agent] = currentTime;
    
    // Gather significant memories
    const memories = this.gatherSignificantMemories();
    if (memories.length < 3) return null;
    
    // Extract main characters and themes
    this.identifyCharactersAndThemes(memories);
    
    // Construct narrative structure
    const narrative = {
      id: `narrative-${this.agent}-${Date.now()}`,
      title: this.generateNarrativeTitle(),
      protagonist: this.agent,
      supporting: Array.from(this.characterRoles.entries())
        .filter(([_, role]) => role.importance > 0.5)
        .map(([id, _]) => id),
      chapters: this.constructChapters(memories),
      themes: Array.from(this.thematicAssociations.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([theme, _]) => theme),
      complexity: this.calculateNarrativeComplexity(),
      timestamp: currentTime
    };
    
    this.currentNarrative = narrative;
    this.narrativeFragments.push(narrative);
    
    // Record narrative as a special memory
    this.recordNarrativeMemory(narrative);
    
    return narrative;
  }

  gatherSignificantMemories() {
    // Extract important memories from memory system
    const semantic = this.memoryManager.getSemanticMemory(this.agent);
    const patterns = semantic.patterns || [];
    const memoryIds = new Set();
    
    // Collect memory IDs from pattern evidence
    patterns.forEach(pattern => {
      if (pattern.evidence && pattern.evidence.length) {
        pattern.evidence.forEach(id => memoryIds.add(id));
      }
    });
    
    // Get short-term memories as well
    const shortTermMemories = [];
    const capacity = EnhancedMemory.shortTermCapacity[this.agent];
    
    for (let i = 0; i < capacity; i++) {
      const importance = EnhancedMemory.shortTermImportance[this.agent * 10 + i];
      if (importance > CONSCIOUSNESS_CONFIG.NARRATIVE_THRESHOLD) {
        shortTermMemories.push({
          entityId: EnhancedMemory.shortTermIds[this.agent * 10 + i],
          entityType: EnhancedMemory.shortTermTypes[this.agent * 10 + i],
          position: { 
            x: EnhancedMemory.shortTermPositionsX[this.agent * 10 + i],
            y: EnhancedMemory.shortTermPositionsY[this.agent * 10 + i]
          },
          timestamp: EnhancedMemory.shortTermTimestamps[this.agent * 10 + i],
          importance,
          fidelity: EnhancedMemory.shortTermFidelity[this.agent * 10 + i]
        });
      }
    }
    
    return shortTermMemories.sort((a, b) => a.timestamp - b.timestamp);
  }

  identifyCharactersAndThemes(memories) {
    this.characterRoles.clear();
    this.thematicAssociations.clear();
    
    // Process each memory to identify characters and themes
    memories.forEach(memory => {
      // Handle entities as characters
      if (memory.entityId !== this.agent) {
        const entityImportance = memory.importance;
        const existing = this.characterRoles.get(memory.entityId) || { 
          importance: 0, 
          type: memory.entityType,
          appearances: 0,
          relationshipValence: 0
        };
        
        existing.importance += entityImportance * 0.3;
        existing.appearances += 1;
        
        // Determine relationship based on entity type
        const relationshipModifier = memory.entityType === 2 ? -0.2 : 0.1;
        existing.relationshipValence += relationshipModifier;
        
        this.characterRoles.set(memory.entityId, existing);
      }
      
      // Extract themes
      const entityTheme = `type_${memory.entityType}`;
      this.thematicAssociations.set(
        entityTheme, 
        (this.thematicAssociations.get(entityTheme) || 0) + memory.importance
      );
      
      // Add spatial themes
      const spatialTheme = memory.position.y < 50 ? 
        (memory.position.x < 50 ? 'northwest' : 'northeast') : 
        (memory.position.x < 50 ? 'southwest' : 'southeast');
      
      this.thematicAssociations.set(
        spatialTheme, 
        (this.thematicAssociations.get(spatialTheme) || 0) + memory.importance * 0.5
      );
    });
    
    // Normalize character roles
    this.characterRoles.forEach((role, id) => {
      role.relationshipValence = Math.max(-1, Math.min(1, role.relationshipValence));
      role.importance = Math.min(1, role.importance);
    });
  }

  generateNarrativeTitle() {
    // Create a title based on the top themes
    const themes = Array.from(this.thematicAssociations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([theme, _]) => theme);
    
    const themeDescriptions = {
      'type_0': 'Resources',
      'type_1': 'Obstacles',
      'type_2': 'Hazards',
      'type_3': 'Agents',
      'northwest': 'Northwest',
      'northeast': 'Northeast',
      'southwest': 'Southwest',
      'southeast': 'Southeast'
    };
    
    const titleParts = themes.map(theme => themeDescriptions[theme] || theme);
    
    if (titleParts.length === 0) return 'The Journey';
    if (titleParts.length === 1) return `The Quest for ${titleParts[0]}`;
    
    return `${titleParts[0]} and ${titleParts[1]}`;
  }

  constructChapters(memories) {
    // Group memories into chapters based on time and themes
    const chapters = [];
    let currentChapter = { events: [], theme: '', start: 0, end: 0 };
    
    // Sort memories by timestamp
    const sortedMemories = [...memories].sort((a, b) => a.timestamp - b.timestamp);
    
    sortedMemories.forEach((memory, index) => {
      // Start a new chapter if this is the first memory or if there's a significant time gap
      if (index === 0 || memory.timestamp - sortedMemories[index-1].timestamp > 50) {
        if (currentChapter.events.length > 0) {
          currentChapter.theme = this.identifyChapterTheme(currentChapter.events);
          currentChapter.end = currentChapter.events[currentChapter.events.length-1].timestamp;
          chapters.push(currentChapter);
        }
        
        currentChapter = {
          events: [memory],
          theme: '',
          start: memory.timestamp,
          end: 0
        };
      } else {
        currentChapter.events.push(memory);
      }
    });
    
    // Add the last chapter
    if (currentChapter.events.length > 0) {
      currentChapter.theme = this.identifyChapterTheme(currentChapter.events);
      currentChapter.end = currentChapter.events[currentChapter.events.length-1].timestamp;
      chapters.push(currentChapter);
    }
    
    // Create chapter summaries
    return chapters.map((chapter, index) => ({
      chapterNumber: index + 1,
      title: this.generateChapterTitle(chapter, index),
      eventCount: chapter.events.length,
      theme: chapter.theme,
      timespan: { start: chapter.start, end: chapter.end },
      characters: this.identifyChapterCharacters(chapter.events)
    }));
  }

  identifyChapterTheme(events) {
    // Count theme frequencies in the chapter events
    const themeCounts = new Map();
    
    events.forEach(event => {
      const theme = `type_${event.entityType}`;
      themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
    });
    
    // Return the most frequent theme
    return Array.from(themeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([theme, _]) => theme)[0] || 'mixed';
  }

  generateChapterTitle(chapter, index) {
    const themeDescriptions = {
      'type_0': 'Discovery',
      'type_1': 'Challenge',
      'type_2': 'Danger',
      'type_3': 'Encounter',
      'mixed': 'Journey'
    };
    
    const themeTitle = themeDescriptions[chapter.theme] || 'Events';
    
    // First chapter is typically an introduction
    if (index === 0) return `The Beginning: First ${themeTitle}`;
    
    // Middle chapters use the theme
    if (index < 3) return `The ${themeTitle}`;
    
    // Later chapters have more dramatic titles
    return `The Great ${themeTitle}`;
  }

  identifyChapterCharacters(events) {
    const characters = new Map();
    
    events.forEach(event => {
      if (event.entityId !== this.agent) {
        characters.set(event.entityId, event.entityType);
      }
    });
    
    return Array.from(characters.entries()).map(([id, type]) => ({
      id,
      type,
      role: type === 2 ? 'antagonist' : 'supporting'
    }));
  }

  calculateNarrativeComplexity() {
    const complexity = 0.3 + 
      (this.currentNarrative?.chapters?.length || 0) * 0.1 +
      Math.min(0.4, (ConsciousnessState.selfAwarenessLevel[this.agent] || 0) * 0.5);
    
    this.narrativeComplexity = Math.min(1.0, complexity);
    ConsciousnessState.narrativeComplexity[this.agent] = this.narrativeComplexity;
    
    return this.narrativeComplexity;
  }

  recordNarrativeMemory(narrative) {
    // Record the narrative as a special memory
    this.memoryManager.recordEpisodicMemory(this.agent, {
      entityId: this.agent,
      entityType: 97, // Special type for narrative memories
      position: { x: Position.x[this.agent], y: Position.y[this.agent] },
      importance: 0.6,
      context: {
        narrative: true,
        title: narrative.title,
        chapterCount: narrative.chapters.length,
        themes: narrative.themes,
        complexity: narrative.complexity
      }
    });
  }
}

// Consciousness Manager Class
export class ConsciousnessManager {
  constructor(memoryManager, options = {}) {
    this.memoryManager = memoryManager;
    this.options = { ...CONSCIOUSNESS_CONFIG, ...options };
    this.dreamStates = new Map();
    this.selfReflections = new Map();
    this.imaginations = new Map();
    this.narrativeConstructions = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    const agentEntities = this.memoryManager.findAgentEntities();
    await Promise.all(agentEntities.map(agent => this.initializeAgentConsciousness(agent)));
    this.initialized = true;
    console.log(`Consciousness Extension: Initialized for ${agentEntities.length} agents`);
    return this;
  }

  async initializeAgentConsciousness(agent) {
    if (ConsciousnessState[agent]) return;
    
    addComponent(this.memoryManager.world, ConsciousnessState, agent);
    ConsciousnessState.dreamCyclePhase[agent] = Math.random();
    ConsciousnessState.dreamingActive[agent] = 0;
    ConsciousnessState.lastReflectionTime[agent] = this.memoryManager.world.time || 0;
    ConsciousnessState.lastNarrativeTime[agent] = this.memoryManager.world.time || 0;
    ConsciousnessState.selfAwarenessLevel[agent] = 0.1;
    ConsciousnessState.narrativeComplexity[agent] = 0.1;
    ConsciousnessState.imaginationCapacity[agent] = 0.1;
    ConsciousnessState.integrationIndex[agent] = 0.0;
    
    // Initialize dream state
    this.dreamStates.set(agent, new DreamState(agent, this.memoryManager));
    
    // Initialize self-reflection
    this.selfReflections.set(agent, new SelfReflection(agent, this.memoryManager));
    
    // Initialize imagination
    this.imaginations.set(agent, new Imagination(agent, this.memoryManager));
    
    // Initialize narrative construction
    this.narrativeConstructions.set(agent, new NarrativeConstruction(agent, this.memoryManager));
  }

  updateConsciousness(agent) {
    if (!ConsciousnessState[agent]) return;
    
    // Update dream cycle
    this.updateDreamState(agent);
    
    // Perform self-reflection if not dreaming
    if (!ConsciousnessState.dreamingActive[agent] && this.options.REFLECTION_ENABLED) {
      this.performSelfReflection(agent);
    }
    
    // Update imagination
    if (this.options.IMAGINATION_ENABLED) {
      this.updateImagination(agent);
    }
    
    // Generate narrative occasionally
    if (this.options.NARRATIVE_ENABLED && Math.random() < 0.01) {
      this.generateNarrative(agent);
    }
    
    // Gradually integrate consciousness aspects
    this.integrateConsciousnessAspects(agent);
  }

  updateDreamState(agent) {
    if (!this.options.DREAM_ENABLED) return;
    
    const dreamState = this.dreamStates.get(agent);
    if (!dreamState) return;
    
    // Update dream cycle phase
    const cyclePhaseStep = 1 / (CONSCIOUSNESS_CONFIG.DREAM_CYCLE_LENGTH * 3);
    ConsciousnessState.dreamCyclePhase[agent] = (ConsciousnessState.dreamCyclePhase[agent] + cyclePhaseStep) % 1;
    
    // Check if agent should enter dream state
    if (!ConsciousnessState.dreamingActive[agent]) {
      // Enter dream state at specific phase points and when not otherwise occupied
      if (ConsciousnessState.dreamCyclePhase[agent] > 0.85 && Math.random() < 0.1) {
        ConsciousnessState.dreamingActive[agent] = 1;
        dreamState.activate();
      }
    } else {
      // Update active dream state
      dreamState.update();
      
      // Check if dream state should end
      if (dreamState.duration >= CONSCIOUSNESS_CONFIG.DREAM_CYCLE_LENGTH || Math.random() < 0.02) {
        ConsciousnessState.dreamingActive[agent] = 0;
        dreamState.deactivate();
      }
    }
  }

  performSelfReflection(agent) {
    const selfReflection = this.selfReflections.get(agent);
    if (!selfReflection) return;
    
    const currentTime = this.memoryManager.world.time;
    const timeSinceLastReflection = currentTime - ConsciousnessState.lastReflectionTime[agent];
    
    if (timeSinceLastReflection >= CONSCIOUSNESS_CONFIG.SELF_REFLECTION_INTERVAL) {
      const insight = selfReflection.performReflection();
      if (insight) {
        ConsciousnessState.selfAwarenessLevel[agent] += 0.01;
      }
    }
  }

  updateImagination(agent) {
    const imagination = this.imaginations.get(agent);
    if (!imagination) return;
    
    // Occasionally generate new scenarios
    if (Math.random() < 0.05) {
      // Create context based on current perceptions
      const context = {};
      for (let j = 0; j < 10; j++) {
        const entity = SensoryData.entitiesDetected[agent * 10 + j];
        if (entity && Environmental[entity]) {
          context.entityType = Environmental.type[entity];
          break;
        }
      }
      
      const scenario = imagination.generateScenario(context);
      if (scenario) {
        const result = imagination.simulateScenario();
        if (result && result.success) {
          // Apply successful imagination results to decision making
          ConsciousnessState.integrationIndex[agent] += 0.02;
        }
      }
    }
  }

  generateNarrative(agent) {
    const narrativeConstruction = this.narrativeConstructions.get(agent);
    if (!narrativeConstruction) return;
    
    const narrative = narrativeConstruction.generateNarrative();
    if (narrative) {
      ConsciousnessState.narrativeComplexity[agent] = 
        Math.max(ConsciousnessState.narrativeComplexity[agent], narrative.complexity);
    }
  }

  integrateConsciousnessAspects(agent) {
    // Integrate the various aspects of consciousness
    const selfAwareness = ConsciousnessState.selfAwarenessLevel[agent];
    const narrativeComplex = ConsciousnessState.narrativeComplexity[agent];
    const imaginationCap = ConsciousnessState.imaginationCapacity[agent];
    
    // Average into integration index
    const newIntegration = (selfAwareness + narrativeComplex + imaginationCap) / 3;
    const currentIntegration = ConsciousnessState.integrationIndex[agent];
    
    // Gradual integration
    ConsciousnessState.integrationIndex[agent] = 
      currentIntegration * 0.95 + newIntegration * 0.05;
    
    // Apply consciousness integration to cognitive state
    if (CognitiveState[agent]) {
      // Higher integration improves adaptability
      CognitiveState[agent].adaptability += 
        ConsciousnessState.integrationIndex[agent] * 0.001;
    }
  }

  getConsciousnessReport(agent) {
    if (!ConsciousnessState[agent]) return null;
    
    return {
      agent,
      selfAwareness: ConsciousnessState.selfAwarenessLevel[agent],
      narrativeComplexity: ConsciousnessState.narrativeComplexity[agent],
      imaginationCapacity: ConsciousnessState.imaginationCapacity[agent],
      integrationIndex: ConsciousnessState.integrationIndex[agent],
      isDreaming: ConsciousnessState.dreamingActive[agent] > 0,
      dreamPhase: ConsciousnessState.dreamCyclePhase[agent],
      lastReflection: ConsciousnessState.lastReflectionTime[agent],
      lastNarrative: ConsciousnessState.lastNarrativeTime[agent]
    };
  }

  // Access reflection insights for an agent
  getAgentInsights(agent) {
    const selfReflection = this.selfReflections.get(agent);
    if (!selfReflection) return [];
    return selfReflection.insightLog;
  }

  // Access dream content for an agent
  getAgentDreams(agent) {
    const dreamState = this.dreamStates.get(agent);
    if (!dreamState) return [];
    return dreamState.narrativeFragments;
  }

  // Access narratives for an agent
  getAgentNarratives(agent) {
    const narrativeConstruction = this.narrativeConstructions.get(agent);
    if (!narrativeConstruction) return [];
    return narrativeConstruction.narrativeFragments;
  }
}

// Consciousness System
export const createConsciousnessSystem = (consciousnessManager) => {
  const consciousnessQuery = defineQuery([ConsciousnessState, EnhancedMemory, CognitiveState]);
  return defineSystem(async (world) => {
    if (!consciousnessManager.initialized) {
      await consciousnessManager.initialize();
    }
    
    const agents = consciousnessQuery(world);
    
    for (const agent of agents) {
      consciousnessManager.updateConsciousness(agent);
    }
    
    return world;
  });
};

// Integration with ArgOS
export function integrateConsciousnessWithArgOS(world, memoryManager, options = {}) {
  console.log("Initializing Consciousness Extension...");
  const consciousnessManager = new ConsciousnessManager(memoryManager, options);
  const consciousnessSystem = createConsciousnessSystem(consciousnessManager);
  
  return { consciousnessManager, consciousnessSystem };
}

// Visualization
export function visualizeAgentConsciousness(ctx, agent, consciousnessManager, pixelsPerUnit = 5) {
  if (!ConsciousnessState[agent]) return;
  
  const x = Position.x[agent] * pixelsPerUnit;
  const y = Position.y[agent] * pixelsPerUnit;
  
  const report = consciousnessManager.getConsciousnessReport(agent);
  if (!report) return;
  
  // Draw integration index as an outer aura
  const integrationAura = 15 * (0.5 + report.integrationIndex * 0.5);
  ctx.beginPath();
  ctx.arc(x, y, integrationAura, 0, 2 * Math.PI);
  ctx.fillStyle = `rgba(41, 128, 185, ${0.2 * report.integrationIndex})`;
  ctx.fill();
  
  // Draw dream state if active
  if (report.isDreaming) {
    const dreamIntensity = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    
    // Dream waves
    const waveCount = 3;
    for (let i = 0; i < waveCount; i++) {
      const wavePhase = (Date.now() / 1000 + i * 0.5) % (Math.PI * 2);
      const waveSize = 5 + i * 3;
      
      ctx.beginPath();
      ctx.arc(x, y, waveSize, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(142, 68, 173, ${0.6 * dreamIntensity * (1 - i/waveCount)})`;
      ctx.lineWidth = 1 + Math.sin(wavePhase) * 0.5;
      ctx.stroke();
    }
    
    // Dream thought bubbles
    const bubbleCount = Math.floor(3 * report.narrativeComplexity);
    for (let i = 0; i < bubbleCount; i++) {
      const angle = (i / bubbleCount) * Math.PI * 2 + (Date.now() / 2000);
      const distance = 8 + Math.sin(Date.now() / 700 + i) * 2;
      const bubbleX = x + Math.cos(angle) * distance;
      const bubbleY = y + Math.sin(angle) * distance;
      const bubbleSize = 1 + Math.random() * 1.5;
      
      ctx.beginPath();
      ctx.arc(bubbleX, bubbleY, bubbleSize, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(142, 68, 173, ${0.7 * dreamIntensity})`;
      ctx.fill();
    }
  }
  
  // Draw self-awareness level as small connecting nodes
  const nodeCount = Math.floor(5 * report.selfAwareness);
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const distance = 6;
    const nodeX = x + Math.cos(angle) * distance;
    const nodeY = y + Math.sin(angle) * distance;
    
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, 1.2, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(39, 174, 96, ${0.6 + 0.4 * report.selfAwareness})`;
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nodeX, nodeY);
    ctx.strokeStyle = `rgba(39
