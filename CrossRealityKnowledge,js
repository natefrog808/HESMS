/**
   * Make a decision based on knowledge
   */
  makeDecisionFromKnowledge(agent, knowledge, context) {
    const outcome = knowledge.pattern.outcome || {};
    const pattern = knowledge.pattern;
    
    // Default decision structure
    const decision = {
      type: 'default',
      target: null,
      priority: 50,
      parameters: {}
    };
    
    // Set decision type based on pattern type
    switch (pattern.type) {
      case 'resource_location':
        decision.type = 'seek_resource';
        decision.priority = 60;
        
        // Use outcome to set target location
        if (context.position && pattern.conditions) {
          const quadrantCondition = pattern.conditions.find(c => c.property === 'quadrant');
          if (quadrantCondition && quadrantCondition.value !== null) {
            // Set target based on quadrant
            const targetQuadrant = quadrantCondition.value;
            const quadX = targetQuadrant % 2;
            const quadY = Math.floor(targetQuadrant / 2);
            
            decision.target = {
              x: quadX * 50 + 25,
              y: quadY * 50 + 25
            };
          }
        }
        break;
        
      case 'obstacle_properties':
        decision.type = 'navigate_obstacle';
        decision.priority = 55;
        
        if (outcome.requiresNavigation) {
          // Set navigation parameters
          decision.parameters.pathfinding = true;
          decision.parameters.detourDistance = 10;
        }
        break;
        
      case 'hazard_behavior':
        decision.type = 'avoid_hazard';
        decision.priority = 75;
        
        // Set avoidance parameters based on outcome
        decision.parameters.dangerLevel = outcome.dangerLevel || 0.5;
        decision.parameters.avoidanceDistance = outcome.avoidanceDistance || 15;
        
        if (context.detectedEntities.includes(2)) {
          decision.priority = 85; // Higher priority if hazard detected
        }
        break;
        
      case 'agent_interaction':
        decision.type = 'interact_agent';
        decision.priority = 40;
        
        // Set interaction parameters
        decision.parameters.cooperate = (outcome.cooperationValue || 0.5) > 0.5;
        break;
        
      case 'reality_flux_effect':
        decision.type = 'adapt_flux';
        decision.priority = 80;
        
        // Set adaptation parameters
        decision.parameters.conservativeMovement = true;
        decision.parameters.reduceGoalDistance = true;
        break;
        
      default:
        // Generic decision based on goal type
        switch (context.goalType) {
          case 1: // Resource goal
            decision.type = 'gather_resource';
            decision.priority = 50;
            break;
          case 2: // Hazard avoidance
            decision.type = 'avoid_hazard';
            decision.priority = 70;
            break;
          case 3: // Social goal
            decision.type = 'approach_agent';
            decision.priority = 45;
            break;
        }
    }
    
    return decision;
  }

  /**
   * Apply decision to agent
   */
  applyDecisionToAgent(agent, decision, appliedKnowledge) {
    // Update Goals component based on decision
    switch (decision.type) {
      case 'seek_resource':
        Goals.primaryType[agent] = 1; // Resource goal
        if (decision.target) {
          Goals.targetX[agent] = decision.target.x;
          Goals.targetY[agent] = decision.target.y;
        }
        Goals.priority[agent] = decision.priority;
        break;
        
      case 'navigate_obstacle':
        // Set navigation goal around obstacle
        Goals.primaryType[agent] = 0; // Exploration goal
        
        // If we have obstacle position, navigate around it
        const obstacleEntity = this.findClosestEntityOfType(agent, 1);
        if (obstacleEntity) {
          const obstacleX = Position.x[obstacleEntity];
          const obstacleY = Position.y[obstacleEntity];
          const agentX = Position.x[agent];
          const agentY = Position.y[agent];
          
          // Calculate direction vector
          const dx = agentX - obstacleX;
          const dy = agentY - obstacleY;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length > 0) {
            // Set target to move around the obstacle
            const detourDistance = decision.parameters.detourDistance || 10;
            Goals.targetX[agent] = obstacleX + (dx / length) * detourDistance;
            Goals.targetY[agent] = obstacleY + (dy / length) * detourDistance;
          }
        }
        
        Goals.priority[agent] = decision.priority;
        break;
        
      case 'avoid_hazard':
        Goals.primaryType[agent] = 2; // Hazard avoidance
        
        // Find closest hazard and move away from it
        const hazardEntity = this.findClosestEntityOfType(agent, 2);
        if (hazardEntity) {
          const hazardX = Position.x[hazardEntity];
          const hazardY = Position.y[hazardEntity];
          const agentX = Position.x[agent];
          const agentY = Position.y[agent];
          
          // Calculate direction vector away from hazard
          const dx = agentX - hazardX;
          const dy = agentY - hazardY;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length > 0) {
            const avoidanceDistance = decision.parameters.avoidanceDistance || 15;
            Goals.targetX[agent] = agentX + (dx / length) * avoidanceDistance;
            Goals.targetY[agent] = agentY + (dy / length) * avoidanceDistance;
          }
        }
        
        Goals.priority[agent] = decision.priority;
        break;
        
      case 'interact_agent':
        Goals.primaryType[agent] = 3; // Social goal
        
        // Find closest agent to interact with
        const targetAgent = this.findClosestEntityOfType(agent, 3);
        if (targetAgent) {
          Goals.targetEntity[agent] = targetAgent;
          Goals.targetX[agent] = Position.x[targetAgent];
          Goals.targetY[agent] = Position.y[targetAgent];
        }
        
        Goals.priority[agent] = decision.priority;
        break;
        
      case 'adapt_flux':
        // During reality flux, be conservative
        const currentGoalType = Goals.primaryType[agent];
        
        // Reduce movement range during flux
        if (decision.parameters.reduceGoalDistance) {
          const currentX = Goals.targetX[agent];
          const currentY = Goals.targetY[agent];
          const agentX = Position.x[agent];
          const agentY = Position.y[agent];
          
          // Calculate direction vector to goal
          const dx = currentX - agentX;
          const dy = currentY - agentY;
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length > 10) {
            // Reduce distance to goal
            Goals.targetX[agent] = agentX + (dx / length) * 10;
            Goals.targetY[agent] = agentY + (dy / length) * 10;
          }
        }
        
        // Increase priority for safety
        Goals.priority[agent] = Math.max(Goals.priority[agent], decision.priority);
        break;
        
      default:
        // Don't modify goals for other decision types
        break;
    }
  }

  /**
   * Find closest entity of a specific type
   */
  findClosestEntityOfType(agent, entityType) {
    let closestEntity = null;
    let closestDistance = Infinity;
    
    // Check each detected entity
    for (let i = 0; i < 10; i++) {
      const entityId = SensoryData.entitiesDetected[agent * 10 + i];
      if (entityId === 0) continue;
      
      let type = -1;
      if (Environmental[entityId]) {
        type = Environmental.type[entityId];
      } else if (SensoryData[entityId] && entityType === 3) {
        type = 3; // Agent
      }
      
      if (type === entityType) {
        const distance = SensoryData.entitiesDistance[agent * 10 + i];
        if (distance < closestDistance) {
          closestDistance = distance;
          closestEntity = entityId;
        }
      }
    }
    
    return closestEntity;
  }

  /**
   * Evaluate if a decision was successful
   */
  evaluateDecisionSuccess(agent, decision) {
    // In a full implementation, we would check if the goal was achieved
    // For now, use a simple heuristic based on goal completion
    const completionPercentage = Goals.completionPercentage[agent];
    return completionPercentage > 50;
  }

  /**
   * Update knowledge usage timestamps
   */
  updateKnowledgeUsage(agent, knowledge, level, currentTime) {
    // Update in the knowledge entry
    knowledge.lastUsed = currentTime;
    
    // Update in the component
    const capacity = level === 'low' ? CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY :
                     level === 'mid' ? CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY :
                     CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY;
    
    // Find knowledge in the component arrays
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return;
    
    const knowledgeMap = agentKnowledge[level];
    const knowledgeArray = Array.from(knowledgeMap.values());
    const index = knowledgeArray.findIndex(k => k.id === knowledge.id);
    
    if (index >= 0 && index < capacity) {
      if (level === 'low') {
        CrossRealityKnowledge.lowLevelLastUsed[agent * capacity + index] = currentTime;
      } else if (level === 'mid') {
        CrossRealityKnowledge.midLevelLastUsed[agent * capacity + index] = currentTime;
      } else {
        CrossRealityKnowledge.highLevelLastUsed[agent * capacity + index] = currentTime;
      }
    }
  }

  /**
   * Sync knowledge to component
   */
  syncKnowledgeToComponent(agent) {
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return;
    
    // Update low-level knowledge
    const lowLevelEntries = Array.from(agentKnowledge.low.values());
    CrossRealityKnowledge.lowLevelCount[agent] = lowLevelEntries.length;
    
    for (let i = 0; i < CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY; i++) {
      if (i < lowLevelEntries.length) {
        CrossRealityKnowledge.lowLevelConfidence[agent * CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY + i] = lowLevelEntries[i].confidence;
        CrossRealityKnowledge.lowLevelLastUsed[agent * CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY + i] = lowLevelEntries[i].lastUsed;
      } else {
        CrossRealityKnowledge.lowLevelConfidence[agent * CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY + i] = 0;
        CrossRealityKnowledge.lowLevelLastUsed[agent * CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY + i] = 0;
      }
    }
    
    // Update mid-level knowledge
    const midLevelEntries = Array.from(agentKnowledge.mid.values());
    CrossRealityKnowledge.midLevelCount[agent] = midLevelEntries.length;
    
    for (let i = 0; i < CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY; i++) {
      if (i < midLevelEntries.length) {
        CrossRealityKnowledge.midLevelConfidence[agent * CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY + i] = midLevelEntries[i].confidence;
        CrossRealityKnowledge.midLevelLastUsed[agent * CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY + i] = midLevelEntries[i].lastUsed;
      } else {
        CrossRealityKnowledge.midLevelConfidence[agent * CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY + i] = 0;
        CrossRealityKnowledge.midLevelLastUsed[agent * CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY + i] = 0;
      }
    }
    
    // Update high-level knowledge
    const highLevelEntries = Array.from(agentKnowledge.high.values());
    CrossRealityKnowledge.highLevelCount[agent] = highLevelEntries.length;
    
    for (let i = 0; i < CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY; i++) {
      if (i < highLevelEntries.length) {
        CrossRealityKnowledge.highLevelConfidence[agent * CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY + i] = highLevelEntries[i].confidence;
        CrossRealityKnowledge.highLevelLastUsed[agent * CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY + i] = highLevelEntries[i].lastUsed;
      } else {
        CrossRealityKnowledge.highLevelConfidence[agent * CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY + i] = 0;
        CrossRealityKnowledge.highLevelLastUsed[agent * CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY + i] = 0;
      }
    }
  }

  /**
   * Get cross-reality knowledge report for an agent
   */
  getCrossRealityReport(agent) {
    if (!CrossRealityKnowledge[agent]) return null;
    
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return null;
    
    // Get environment data
    const currentEnvironmentId = CrossRealityKnowledge.currentEnvironmentId[agent];
    const currentEnvironment = this.environments.get(currentEnvironmentId);
    const lastEnvironmentId = CrossRealityKnowledge.lastEnvironmentId[agent];
    const lastEnvironment = this.environments.get(lastEnvironmentId);
    
    return {
      agent,
      currentEnvironment: currentEnvironment ? currentEnvironment.getSummary() : { id: currentEnvironmentId },
      previousEnvironment: lastEnvironment ? lastEnvironment.getSummary() : { id: lastEnvironmentId },
      environmentSimilarity: CrossRealityKnowledge.environmentSimilarity[agent],
      knowledgeCounts: {
        low: agentKnowledge.low.size,
        mid: agentKnowledge.mid.size,
        high: agentKnowledge.high.size
      },
      abstractionLevel: CrossRealityKnowledge.abstractionLevel[agent],
      adaptationRate: CrossRealityKnowledge.adaptationRate[agent],
      knowledgeTransferSuccess: CrossRealityKnowledge.knowledgeTransferSuccess[agent],
      patterns: {
        low: Array.from(agentKnowledge.low.values()).map(k => k.getSummary()),
        mid: Array.from(agentKnowledge.mid.values()).map(k => k.getSummary()),
        high: Array.from(agentKnowledge.high.values()).map(k => k.getSummary())
      }
    };
  }
}

// Helper function
function addComponent(world, component, entity) {
  component.addTo(world)(entity);
}

// Export the system creation function
export function createCrossRealitySystem(world, memoryManager) {
  console.log("Initializing Cross-Reality Knowledge System...");
  const crossRealityManager = new CrossRealitySystem(world, memoryManager);
  const crossRealitySystem = crossRealityManager.createSystem();
  
  return { crossRealityManager, crossRealitySystem };
}

// Integration with ArgOS
export function integrateCrossRealityWithArgOS(world, memoryManager, options = {}) {
  console.log("Integrating Cross-Reality Knowledge with ArgOS...");
  return createCrossRealitySystem(world, memoryManager);
}    // Update agent's adaptation rate based on transition
    const newAdaptationRate = CrossRealityKnowledge.adaptationRate[agent] * 0.8 + 
      adaptationFactor * 0.2;
    CrossRealityKnowledge.adaptationRate[agent] = newAdaptationRate;
    
    // Log transition
    console.log(`CrossRealitySystem: Agent ${agent} transitioning from environment ${previousEnvironmentId} to ${newEnvironmentId} (similarity: ${similarity.toFixed(2)})`);
  }

  /**
   * Update knowledge based on recent experiences
   */
  updateKnowledge(agent, currentTime) {
    // Get agent's knowledge structure
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return;
    
    // Get agent's recent experiences
    const experiences = this.getRecentExperiences(agent);
    
    // Current environment ID
    const environmentId = CrossRealityKnowledge.currentEnvironmentId[agent];
    
    // Extract knowledge from experiences
    for (const experience of experiences) {
      const knowledgePatterns = this.extractKnowledgePatterns(experience, environmentId);
      
      // Add patterns to low-level knowledge
      for (const pattern of knowledgePatterns) {
        this.addLowLevelKnowledge(agent, pattern, environmentId);
      }
    }
    
    // Apply decay to all knowledge
    this.applyKnowledgeDecay(agent, currentTime);
    
    // Sync knowledge to component
    this.syncKnowledgeToComponent(agent);
  }

  /**
   * Get recent experiences of an agent
   */
  getRecentExperiences(agent) {
    const experiences = [];
    
    // Get episodic memories
    const memoryId = EnhancedMemory.memoryId[agent];
    const memories = this.memoryManager.episodicQueue.get(memoryId) || [];
    
    // Filter recent memories with high importance
    const recentMemories = memories.filter(m => 
      m.importance > 0.5 && 
      this.world.time - m.timestamp < 100
    );
    
    // Convert to experience format
    for (const memory of recentMemories) {
      experiences.push({
        type: memory.entityType,
        timestamp: memory.timestamp,
        position: memory.position,
        context: memory.context || {},
        outcome: this.inferOutcome(memory)
      });
    }
    
    return experiences;
  }

  /**
   * Infer outcome from a memory
   */
  inferOutcome(memory) {
    const context = memory.context || {};
    
    // Check for explicit success/failure in context
    if (context.success !== undefined) {
      return context.success ? 'success' : 'failure';
    }
    
    // Infer from emotional impact
    if (memory.emotionalImpact !== undefined) {
      return memory.emotionalImpact > 60 ? 'success' : 
             memory.emotionalImpact < 40 ? 'failure' : 'neutral';
    }
    
    // Infer from entity type
    switch (memory.entityType) {
      case 0: // Resource
        return 'success';
      case 2: // Hazard
        return context.avoided ? 'success' : 'failure';
      default:
        return 'neutral';
    }
  }

  /**
   * Extract knowledge patterns from an experience
   */
  extractKnowledgePatterns(experience, environmentId) {
    const patterns = [];
    
    // Extract patterns based on experience type
    switch (experience.type) {
      case 0: // Resource
        patterns.push(this.extractResourcePattern(experience, environmentId));
        break;
      case 1: // Obstacle
        patterns.push(this.extractObstaclePattern(experience, environmentId));
        break;
      case 2: // Hazard
        patterns.push(this.extractHazardPattern(experience, environmentId));
        break;
      case 3: // Agent
        patterns.push(this.extractAgentPattern(experience, environmentId));
        break;
    }
    
    // Add patterns related to combinations or context
    if (experience.context.realityShift) {
      patterns.push(this.extractRealityShiftPattern(experience, environmentId));
    }
    
    return patterns.filter(p => p !== null);
  }

  /**
   * Extract a resource-related knowledge pattern
   */
  extractResourcePattern(experience, environmentId) {
    return {
      type: 'resource_location',
      description: 'Resource distribution pattern',
      level: 'low',
      conditions: [
        {
          property: 'quadrant',
          operator: 'equals',
          value: this.getQuadrant(experience.position)
        }
      ],
      outcome: {
        resourceProbability: 0.7,
        expectedValue: 1
      },
      environmentId
    };
  }

  /**
   * Extract an obstacle-related knowledge pattern
   */
  extractObstaclePattern(experience, environmentId) {
    return {
      type: 'obstacle_properties',
      description: 'Obstacle characteristics',
      level: 'low',
      conditions: [
        {
          property: 'position',
          operator: 'near',
          value: experience.position,
          threshold: 15
        }
      ],
      outcome: {
        pathBlocked: true,
        requiresNavigation: true
      },
      environmentId
    };
  }

  /**
   * Extract a hazard-related knowledge pattern
   */
  extractHazardPattern(experience, environmentId) {
    return {
      type: 'hazard_behavior',
      description: 'Hazard behavior pattern',
      level: 'low',
      conditions: [
        {
          property: 'realityFluxActive',
          operator: 'equals',
          value: experience.context.realityShift || false
        }
      ],
      outcome: {
        dangerLevel: 0.8,
        avoidanceDistance: 20
      },
      environmentId
    };
  }

  /**
   * Extract an agent-related knowledge pattern
   */
  extractAgentPattern(experience, environmentId) {
    return {
      type: 'agent_interaction',
      description: 'Agent interaction pattern',
      level: 'low',
      conditions: [
        {
          property: 'entityType',
          operator: 'equals',
          value: 3 // Agent
        }
      ],
      outcome: {
        cooperationValue: 0.6,
        informationExchange: true
      },
      environmentId
    };
  }

  /**
   * Extract a reality-shift-related knowledge pattern
   */
  extractRealityShiftPattern(experience, environmentId) {
    return {
      type: 'reality_flux_effect',
      description: 'Reality flux effect pattern',
      level: 'low',
      conditions: [
        {
          property: 'realityFluxActive',
          operator: 'equals',
          value: true
        }
      ],
      outcome: {
        environmentStability: 0.3,
        patternReliability: 0.4,
        adaptationRequired: true
      },
      environmentId
    };
  }

  /**
   * Get quadrant from position
   */
  getQuadrant(position) {
    const quadrantX = position.x < 50 ? 0 : 1;
    const quadrantY = position.y < 50 ? 0 : 1;
    return quadrantX + (quadrantY * 2);
  }

  /**
   * Add low-level knowledge to agent's knowledge structure
   */
  addLowLevelKnowledge(agent, pattern, environmentId) {
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return null;
    
    // Check if this pattern already exists in low-level knowledge
    let existingEntry = null;
    for (const [id, entry] of agentKnowledge.low.entries()) {
      if (this.patternsMatch(entry.pattern, pattern)) {
        existingEntry = entry;
        break;
      }
    }
    
    if (existingEntry) {
      // Add instance to existing knowledge
      existingEntry.addInstance(pattern, environmentId);
      return existingEntry;
    } else {
      // Create new knowledge entry
      const newEntry = new KnowledgeEntry(pattern, 'low', environmentId);
      
      // Check if we have capacity
      if (agentKnowledge.low.size >= CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY) {
        // Remove weakest entry
        const weakestEntry = Array.from(agentKnowledge.low.entries())
          .sort((a, b) => a[1].confidence - b[1].confidence)[0];
        
        if (weakestEntry) {
          agentKnowledge.low.delete(weakestEntry[0]);
        }
      }
      
      // Add new entry
      agentKnowledge.low.set(newEntry.id, newEntry);
      return newEntry;
    }
  }

  /**
   * Check if two patterns match (for deduplication)
   */
  patternsMatch(pattern1, pattern2) {
    if (pattern1.type !== pattern2.type) return false;
    
    // Compare conditions
    const conditions1 = pattern1.conditions || [];
    const conditions2 = pattern2.conditions || [];
    
    // Different number of conditions means different patterns
    if (conditions1.length !== conditions2.length) return false;
    
    // Check each condition
    for (const condition1 of conditions1) {
      const matchingCondition = conditions2.find(c => 
        c.property === condition1.property && 
        c.operator === condition1.operator
      );
      
      if (!matchingCondition) return false;
    }
    
    return true;
  }

  /**
   * Apply decay to all knowledge entries
   */
  applyKnowledgeDecay(agent, currentTime) {
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return;
    
    // Apply decay to each level
    for (const [id, entry] of agentKnowledge.low.entries()) {
      entry.applyDecay(currentTime);
      
      // Remove if below threshold
      if (entry.confidence < CROSS_REALITY_CONFIG.MINIMUM_KNOWLEDGE_CONFIDENCE) {
        agentKnowledge.low.delete(id);
      }
    }
    
    for (const [id, entry] of agentKnowledge.mid.entries()) {
      entry.applyDecay(currentTime);
      
      if (entry.confidence < CROSS_REALITY_CONFIG.MINIMUM_KNOWLEDGE_CONFIDENCE) {
        agentKnowledge.mid.delete(id);
      }
    }
    
    for (const [id, entry] of agentKnowledge.high.entries()) {
      entry.applyDecay(currentTime);
      
      if (entry.confidence < CROSS_REALITY_CONFIG.MINIMUM_KNOWLEDGE_CONFIDENCE) {
        agentKnowledge.high.delete(id);
      }
    }
  }

  /**
   * Generalize knowledge from lower to higher levels
   */
  generalizeKnowledge(agent, currentTime) {
    // Check if it's time to generalize
    const timeSinceLastGeneralization = currentTime - CrossRealityKnowledge.lastGeneralizationTime[agent];
    if (timeSinceLastGeneralization < CROSS_REALITY_CONFIG.GENERALIZATION_INTERVAL) return;
    
    CrossRealityKnowledge.lastGeneralizationTime[agent] = currentTime;
    
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return;
    
    // Try to generalize from low to mid level
    this.generalizeLowToMid(agent, agentKnowledge);
    
    // Try to generalize from mid to high level
    this.generalizeMidToHigh(agent, agentKnowledge);
    
    // Sync knowledge to component
    this.syncKnowledgeToComponent(agent);
    
    // Update abstraction level
    this.updateAbstractionLevel(agent, agentKnowledge);
  }

  /**
   * Generalize knowledge from low to mid level
   */
  generalizeLowToMid(agent, agentKnowledge) {
    // Group low-level knowledge by type
    const knowledgeByType = new Map();
    
    for (const [id, entry] of agentKnowledge.low.entries()) {
      if (!knowledgeByType.has(entry.pattern.type)) {
        knowledgeByType.set(entry.pattern.type, []);
      }
      knowledgeByType.get(entry.pattern.type).push(entry);
    }
    
    // For each type, try to find commonalities
    for (const [type, entries] of knowledgeByType.entries()) {
      // Need multiple entries of the same type to generalize
      if (entries.length < CROSS_REALITY_CONFIG.ABSTRACTION_INSTANCE_THRESHOLD) continue;
      
      // Filter to confident entries
      const confidentEntries = entries.filter(entry => 
        entry.confidence >= CROSS_REALITY_CONFIG.ABSTRACTION_CONFIDENCE_THRESHOLD
      );
      
      if (confidentEntries.length < 3) continue;
      
      // Find common conditions across environments
      const commonConditions = this.findCommonConditions(confidentEntries);
      if (commonConditions.length === 0) continue;
      
      // Create mid-level pattern
      const midLevelPattern = {
        type,
        description: `Generalized ${type} pattern`,
        level: 'mid',
        conditions: commonConditions,
        outcome: this.aggregateOutcomes(confidentEntries)
      };
      
      // Add to mid-level knowledge
      this.addMidLevelKnowledge(agent, midLevelPattern, confidentEntries);
    }
  }

  /**
   * Find common conditions across knowledge entries
   */
  findCommonConditions(entries) {
    if (entries.length === 0) return [];
    
    // Collect all conditions from the first entry
    const firstEntryConditions = entries[0].pattern.conditions || [];
    const candidateConditions = [...firstEntryConditions];
    
    // Check which conditions appear in all entries
    const commonConditions = candidateConditions.filter(condition => {
      return entries.every(entry => {
        const entryConditions = entry.pattern.conditions || [];
        return entryConditions.some(c => 
          c.property === condition.property && 
          c.operator === condition.operator
        );
      });
    });
    
    // For common property/operator combinations, find generalized values
    return commonConditions.map(condition => {
      const values = entries.map(entry => {
        const matchingCondition = entry.pattern.conditions?.find(c => 
          c.property === condition.property && 
          c.operator === condition.operator
        );
        return matchingCondition?.value;
      }).filter(v => v !== undefined);
      
      // For numeric values, use range
      if (typeof values[0] === 'number') {
        const min = Math.min(...values);
        const max = Math.max(...values);
        return {
          property: condition.property,
          operator: condition.operator,
          valueRange: { min, max },
          generalized: true
        };
      }
      
      // For boolean values, use most common
      if (typeof values[0] === 'boolean') {
        const trueCount = values.filter(v => v === true).length;
        return {
          property: condition.property,
          operator: condition.operator,
          value: trueCount > values.length / 2,
          generalized: true
        };
      }
      
      // For other values, if they're all the same, use that; otherwise null
      const firstValue = values[0];
      const allSame = values.every(v => v === firstValue);
      return {
        property: condition.property,
        operator: condition.operator,
        value: allSame ? firstValue : null,
        generalized: true
      };
    });
  }

  /**
   * Aggregate outcomes from multiple knowledge entries
   */
  aggregateOutcomes(entries) {
    const outcome = {};
    
    // Collect all outcome properties
    const allProperties = new Set();
    entries.forEach(entry => {
      if (entry.pattern.outcome) {
        Object.keys(entry.pattern.outcome).forEach(key => allProperties.add(key));
      }
    });
    
    // Aggregate each property
    allProperties.forEach(property => {
      const values = entries
        .filter(entry => entry.pattern.outcome && entry.pattern.outcome[property] !== undefined)
        .map(entry => entry.pattern.outcome[property]);
      
      if (values.length === 0) return;
      
      // Handle different types of values
      if (typeof values[0] === 'number') {
        // Average for numeric values
        outcome[property] = values.reduce((sum, val) => sum + val, 0) / values.length;
      } else if (typeof values[0] === 'boolean') {
        // Majority for boolean values
        const trueCount = values.filter(v => v === true).length;
        outcome[property] = trueCount > values.length / 2;
      } else {
        // Most common for other values
        const counts = {};
        values.forEach(val => {
          counts[val] = (counts[val] || 0) + 1;
        });
        
        let maxCount = 0;
        let mostCommon = values[0];
        Object.entries(counts).forEach(([val, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostCommon = val;
          }
        });
        
        outcome[property] = mostCommon;
      }
    });
    
    return outcome;
  }

  /**
   * Add mid-level knowledge to agent's knowledge structure
   */
  addMidLevelKnowledge(agent, pattern, sourceEntries) {
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return null;
    
    // Check if this pattern already exists in mid-level knowledge
    let existingEntry = null;
    for (const [id, entry] of agentKnowledge.mid.entries()) {
      if (this.patternsMatch(entry.pattern, pattern)) {
        existingEntry = entry;
        break;
      }
    }
    
    // Get environment IDs from source entries
    const environmentIds = [...new Set(
      sourceEntries.flatMap(entry => entry.environmentIds)
    )];
    
    if (existingEntry) {
      // Add instance to existing knowledge
      existingEntry.addInstance(pattern);
      
      // Update environment IDs
      environmentIds.forEach(envId => {
        if (!existingEntry.environmentIds.includes(envId)) {
          existingEntry.environmentIds.push(envId);
        }
      });
      
      return existingEntry;
    } else {
      // Create new knowledge entry
      const newEntry = new KnowledgeEntry(pattern, 'mid');
      
      // Add environment IDs
      environmentIds.forEach(envId => {
        if (!newEntry.environmentIds.includes(envId)) {
          newEntry.environmentIds.push(envId);
        }
      });
      
      // Add instance based on source entries
      newEntry.addInstance(pattern);
      
      // Check if we have capacity
      if (agentKnowledge.mid.size >= CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY) {
        // Remove weakest entry
        const weakestEntry = Array.from(agentKnowledge.mid.entries())
          .sort((a, b) => a[1].confidence - b[1].confidence)[0];
        
        if (weakestEntry) {
          agentKnowledge.mid.delete(weakestEntry[0]);
        }
      }
      
      // Add new entry
      agentKnowledge.mid.set(newEntry.id, newEntry);
      return newEntry;
    }
  }

  /**
   * Generalize knowledge from mid to high level
   */
  generalizeMidToHigh(agent, agentKnowledge) {
    // Need enough mid-level knowledge to generalize
    if (agentKnowledge.mid.size < CROSS_REALITY_CONFIG.ABSTRACTION_INSTANCE_THRESHOLD) return;
    
    // Group mid-level knowledge by type
    const knowledgeByType = new Map();
    
    for (const [id, entry] of agentKnowledge.mid.entries()) {
      if (!knowledgeByType.has(entry.pattern.type)) {
        knowledgeByType.set(entry.pattern.type, []);
      }
      knowledgeByType.get(entry.pattern.type).push(entry);
    }
    
    // For each type, try to find universal principles
    for (const [type, entries] of knowledgeByType.entries()) {
      // Need multiple entries of the same type to generalize
      if (entries.length < 3) continue;
      
      // Filter to confident entries
      const confidentEntries = entries.filter(entry => 
        entry.confidence >= CROSS_REALITY_CONFIG.ABSTRACTION_CONFIDENCE_THRESHOLD
      );
      
      if (confidentEntries.length < 2) continue;
      
      // Check if entries cover multiple environments
      const environments = new Set(
        confidentEntries.flatMap(entry => entry.environmentIds)
      );
      
      if (environments.size < 2) continue;
      
      // Find universal conditions (very minimal)
      const universalConditions = this.findUniversalConditions(confidentEntries);
      
      // Create high-level pattern (principle)
      const highLevelPattern = {
        type,
        description: `Universal ${type} principle`,
        level: 'high',
        conditions: universalConditions,
        outcome: this.aggregateOutcomes(confidentEntries),
        universalPrinciple: true
      };
      
      // Add to high-level knowledge
      this.addHighLevelKnowledge(agent, highLevelPattern, confidentEntries);
    }
  }

  /**
   * Find universal conditions (very minimal and abstract)
   */
  findUniversalConditions(entries) {
    // For high-level, we want very few, very general conditions
    const propertyFrequency = new Map();
    
    // Count how many entries have each property
    entries.forEach(entry => {
      const conditions = entry.pattern.conditions || [];
      conditions.forEach(condition => {
        const key = `${condition.property}:${condition.operator}`;
        propertyFrequency.set(key, (propertyFrequency.get(key) || 0) + 1);
      });
    });
    
    // Find properties that appear in most entries
    const commonProperties = Array.from(propertyFrequency.entries())
      .filter(([_, count]) => count >= entries.length * 0.7)
      .map(([key, _]) => {
        const [property, operator] = key.split(':');
        return { property, operator };
      });
    
    // Create universal conditions (very abstract)
    return commonProperties.map(({ property, operator }) => ({
      property,
      operator,
      value: null, // No specific value, applies universally
      universal: true
    }));
  }

  /**
   * Add high-level knowledge to agent's knowledge structure
   */
  addHighLevelKnowledge(agent, pattern, sourceEntries) {
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return null;
    
    // Check if this pattern already exists in high-level knowledge
    let existingEntry = null;
    for (const [id, entry] of agentKnowledge.high.entries()) {
      if (entry.pattern.type === pattern.type && entry.pattern.universalPrinciple) {
        existingEntry = entry;
        break;
      }
    }
    
    // Get all environment IDs (high-level knowledge applies everywhere)
    const environments = this.environments.keys();
    
    if (existingEntry) {
      // Add instance to existing knowledge
      existingEntry.addInstance(pattern);
      
      // Update environment IDs (all environments)
      for (const envId of environments) {
        if (!existingEntry.environmentIds.includes(envId)) {
          existingEntry.environmentIds.push(envId);
        }
      }
      
      return existingEntry;
    } else {
      // Create new knowledge entry
      const newEntry = new KnowledgeEntry(pattern, 'high');
      
      // High-level knowledge applies to all environments
      for (const envId of environments) {
        if (!newEntry.environmentIds.includes(envId)) {
          newEntry.environmentIds.push(envId);
        }
      }
      
      // Add instance based on source entries
      newEntry.addInstance(pattern);
      
      // Check if we have capacity
      if (agentKnowledge.high.size >= CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY) {
        // Remove weakest entry
        const weakestEntry = Array.from(agentKnowledge.high.entries())
          .sort((a, b) => a[1].confidence - b[1].confidence)[0];
        
        if (weakestEntry) {
          agentKnowledge.high.delete(weakestEntry[0]);
        }
      }
      
      // Add new entry
      agentKnowledge.high.set(newEntry.id, newEntry);
      return newEntry;
    }
  }

  /**
   * Update abstraction level based on knowledge distribution
   */
  updateAbstractionLevel(agent, agentKnowledge) {
    const lowCount = agentKnowledge.low.size;
    const midCount = agentKnowledge.mid.size;
    const highCount = agentKnowledge.high.size;
    
    const totalKnowledge = lowCount + midCount + highCount;
    if (totalKnowledge === 0) return;
    
    // Calculate abstraction level (0-1)
    // Higher values mean more abstract thinking
    const abstractionLevel = (midCount * 0.5 + highCount * 1.0) / totalKnowledge;
    
    // Update component
    CrossRealityKnowledge.abstractionLevel[agent] = abstractionLevel;
  }

  /**
   * Apply knowledge to agent's decision making
   */
  applyKnowledgeToDecisions(agent, currentTime) {
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return;
    
    // Get current decision context
    const context = this.getDecisionContext(agent);
    
    // Find applicable knowledge at each level
    let appliedKnowledge = null;
    let appliedLevel = null;
    
    // Try high-level knowledge first
    let highLevelMatches = this.findApplicableKnowledge(agentKnowledge.high, context);
    if (highLevelMatches.length > 0) {
      appliedKnowledge = highLevelMatches[0];
      appliedLevel = 'high';
    } else {
      // Try mid-level knowledge
      let midLevelMatches = this.findApplicableKnowledge(agentKnowledge.mid, context);
      if (midLevelMatches.length > 0) {
        appliedKnowledge = midLevelMatches[0];
        appliedLevel = 'mid';
      } else {
        // Fall back to low-level knowledge
        let lowLevelMatches = this.findApplicableKnowledge(agentKnowledge.low, context);
        if (lowLevelMatches.length > 0) {
          appliedKnowledge = lowLevelMatches[0];
          appliedLevel = 'low';
        }
      }
    }
    
    // Apply the knowledge to decision making
    if (appliedKnowledge) {
      const decision = this.makeDecisionFromKnowledge(agent, appliedKnowledge, context);
      this.applyDecisionToAgent(agent, decision, appliedKnowledge);
      
      // Record knowledge application
      const environmentId = CrossRealityKnowledge.currentEnvironmentId[agent];
      const success = this.evaluateDecisionSuccess(agent, decision);
      appliedKnowledge.recordApplication(success, environmentId);
      
      // Update knowledge transfer success rate
      if (appliedLevel === 'mid' || appliedLevel === 'high') {
        const currentSuccessRate = CrossRealityKnowledge.knowledgeTransferSuccess[agent];
        const newSuccessRate = currentSuccessRate * 0.9 + (success ? 0.1 : 0);
        CrossRealityKnowledge.knowledgeTransferSuccess[agent] = newSuccessRate;
      }
      
      // Update last used time in component
      this.updateKnowledgeUsage(agent, appliedKnowledge, appliedLevel, currentTime);
    }
  }

  /**
   * Get current decision context for an agent
   */
  getDecisionContext(agent) {
    // Collect relevant data for decision making
    return {
      position: {
        x: Position.x[agent],
        y: Position.y[agent]
      },
      quadrant: this.getQuadrant({ x: Position.x[agent], y: Position.y[agent] }),
      goalType: Goals.primaryType[agent],
      emotionalState: CognitiveState.emotionalState[agent],
      adaptability: CognitiveState.adaptability[agent],
      realityFluxActive: RealityFlux[agent]?.effectType > 0,
      environmentId: CrossRealityKnowledge.currentEnvironmentId[agent],
      detectedEntities: this.getDetectedEntityTypes(agent)
    };
  }

  /**
   * Get detected entity types
   */
  getDetectedEntityTypes(agent) {
    const entityTypes = [];
    
    for (let i = 0; i < 10; i++) {
      const entityId = SensoryData.entitiesDetected[agent * 10 + i];
      if (entityId === 0) continue;
      
      if (Environmental[entityId]) {
        entityTypes.push(Environmental.type[entityId]);
      } else if (SensoryData[entityId]) {
        entityTypes.push(3); // Agent
      }
    }
    
    return entityTypes;
  }

  /**
   * Find applicable knowledge for a context
   */
  findApplicableKnowledge(knowledgeMap, context) {
    const matches = [];
    
    // Check each knowledge entry
    for (const [id, entry] of knowledgeMap.entries()) {
      // Skip low-confidence knowledge
      if (entry.confidence < CROSS_REALITY_CONFIG.MINIMUM_KNOWLEDGE_CONFIDENCE) continue;
      
      // Check if knowledge is applicable to current environment
      if (!entry.isApplicableInEnvironment(context.environmentId)) continue;
      
      // Calculate match confidence
      const matchConfidence = entry.calculateMatchConfidence(context);
      if (matchConfidence >= CROSS_REALITY_CONFIG.VALIDATION_THRESHOLD) {
        matches.push({
          entry,
          confidence: matchConfidence
        });
      }
    }
    
    // Sort by confidence
    return matches
      .sort((a, b) => b.confidence - a.confidence)
      .map(m => m.entry);
  }

  /**
   * Make a decision based on knowledge
   */
  make/**
 * CrossRealityKnowledge System
 * 
 * A system that enables knowledge transfer across different environments (realities) for agents
 * in the ArgOS HESMS framework. This includes:
 * - Hierarchical Knowledge Structure: Low (environment-specific), Mid (cross-environment), High (universal)
 * - Knowledge Abstraction: Generalizing concrete experiences into abstract principles
 * - Adaptation Mechanisms: Adjusting knowledge when transitioning between environments
 * - Context-Aware Decision Making: Applying the right level of knowledge based on circumstances
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
  RealityFlux,
  Environmental
} from './argos-framework.js';
import { 
  EnhancedMemory, 
  MemoryManager 
} from './argos-memory-extension.js';
import { 
  ConsciousnessState
} from './argos-consciousness-extension.js';

// Configuration constants
const CROSS_REALITY_CONFIG = {
  LOW_LEVEL_CAPACITY: 20,          // Max low-level knowledge entries
  MID_LEVEL_CAPACITY: 15,          // Max mid-level knowledge entries
  HIGH_LEVEL_CAPACITY: 10,         // Max high-level knowledge entries
  ABSTRACTION_CONFIDENCE_THRESHOLD: 0.6,  // Min confidence to abstract to higher level
  ABSTRACTION_INSTANCE_THRESHOLD: 5,      // Min instances to consider for abstraction
  KNOWLEDGE_DECAY_RATE: 0.05,      // How quickly knowledge decays without reinforcement
  ADAPTATION_LEARNING_RATE: 0.2,   // How quickly adaptation occurs in new environments
  MINIMUM_KNOWLEDGE_CONFIDENCE: 0.2, // Threshold below which knowledge is forgotten
  GENERALIZATION_INTERVAL: 50,     // Cycles between generalization attempts
  VALIDATION_THRESHOLD: 0.7,       // Threshold for validating knowledge in new environment
  ENVIRONMENT_TRANSITION_THRESHOLD: 0.6, // How different environments must be to trigger adaptation
  MAX_ENVIRONMENT_CACHE: 5         // Maximum number of environments to remember
};

/**
 * CrossRealityKnowledge Component
 * Stores the agent's hierarchical knowledge structure and environment information
 */
export const CrossRealityKnowledge = defineComponent({
  // Environment tracking
  currentEnvironmentId: Types.ui32,       // ID of current environment
  lastEnvironmentId: Types.ui32,          // ID of previous environment
  environmentTransitionTime: Types.ui32,  // When the last transition occurred
  environmentSimilarity: Types.f32,       // Similarity between current and previous (0-1)
  
  // Knowledge counts by level
  lowLevelCount: Types.ui8,               // Number of low-level knowledge entries
  midLevelCount: Types.ui8,               // Number of mid-level knowledge entries
  highLevelCount: Types.ui8,              // Number of high-level knowledge entries
  
  // Knowledge strength by index (confidence values)
  lowLevelConfidence: [Types.f32, 20],    // Confidence in each low-level entry
  midLevelConfidence: [Types.f32, 15],    // Confidence in each mid-level entry
  highLevelConfidence: [Types.f32, 10],   // Confidence in each high-level entry
  
  // Knowledge usage tracking
  lowLevelLastUsed: [Types.ui32, 20],     // Last time each entry was used
  midLevelLastUsed: [Types.ui32, 15],     // Last time each entry was used
  highLevelLastUsed: [Types.ui32, 10],    // Last time each entry was used
  
  // Generalization tracking
  lastGeneralizationTime: Types.ui32,     // Last time knowledge was generalized
  
  // Cross-reality metrics
  adaptationRate: Types.f32,              // How quickly agent adapts to new environments
  abstractionLevel: Types.f32,            // Tendency to think in abstract vs concrete terms
  knowledgeTransferSuccess: Types.f32     // Success rate of knowledge transfer
});

/**
 * Environment Profile Class
 * Represents the characteristics of an environment
 */
class EnvironmentProfile {
  constructor(id) {
    this.id = id;
    this.features = new Map();             // Key features of this environment
    this.entityDistribution = new Map();   // Distribution of entity types
    this.spatialCharacteristics = new Map(); // Spatial characteristics
    this.temporalCharacteristics = new Map(); // Temporal characteristics
    this.stabilityMetrics = new Map();     // Stability measures
    this.lastUpdated = Date.now();
    this.visitCount = 1;
  }

  /**
   * Update the environment profile with new observations
   */
  update(observations) {
    this.visitCount++;
    this.lastUpdated = Date.now();
    
    // Update entity distribution
    if (observations.entityCounts) {
      for (const [type, count] of Object.entries(observations.entityCounts)) {
        this.entityDistribution.set(
          type, 
          (this.entityDistribution.get(type) || 0) * 0.8 + count * 0.2
        );
      }
    }
    
    // Update spatial characteristics
    if (observations.spatialData) {
      for (const [feature, value] of Object.entries(observations.spatialData)) {
        this.spatialCharacteristics.set(
          feature,
          (this.spatialCharacteristics.get(feature) || 0) * 0.8 + value * 0.2
        );
      }
    }
    
    // Update stability metrics
    if (observations.stabilityData) {
      for (const [metric, value] of Object.entries(observations.stabilityData)) {
        this.stabilityMetrics.set(
          metric,
          (this.stabilityMetrics.get(metric) || 0) * 0.8 + value * 0.2
        );
      }
    }
    
    return this;
  }

  /**
   * Calculate similarity with another environment profile
   */
  calculateSimilarity(otherProfile) {
    if (!otherProfile) return 0;
    
    let similarityScore = 0;
    let comparisonCount = 0;
    
    // Compare entity distributions
    const allEntityTypes = new Set([
      ...this.entityDistribution.keys(),
      ...otherProfile.entityDistribution.keys()
    ]);
    
    for (const type of allEntityTypes) {
      const thisValue = this.entityDistribution.get(type) || 0;
      const otherValue = otherProfile.entityDistribution.get(type) || 0;
      
      // Calculate normalized difference
      const maxValue = Math.max(thisValue, otherValue);
      if (maxValue > 0) {
        const difference = Math.abs(thisValue - otherValue) / maxValue;
        similarityScore += (1 - difference);
        comparisonCount++;
      }
    }
    
    // Compare spatial characteristics
    const allSpatialFeatures = new Set([
      ...this.spatialCharacteristics.keys(),
      ...otherProfile.spatialCharacteristics.keys()
    ]);
    
    for (const feature of allSpatialFeatures) {
      const thisValue = this.spatialCharacteristics.get(feature) || 0;
      const otherValue = otherProfile.spatialCharacteristics.get(feature) || 0;
      
      const maxValue = Math.max(thisValue, otherValue);
      if (maxValue > 0) {
        const difference = Math.abs(thisValue - otherValue) / maxValue;
        similarityScore += (1 - difference);
        comparisonCount++;
      }
    }
    
    // Compare stability metrics
    const allStabilityMetrics = new Set([
      ...this.stabilityMetrics.keys(),
      ...otherProfile.stabilityMetrics.keys()
    ]);
    
    for (const metric of allStabilityMetrics) {
      const thisValue = this.stabilityMetrics.get(metric) || 0;
      const otherValue = otherProfile.stabilityMetrics.get(metric) || 0;
      
      const maxValue = Math.max(thisValue, otherValue);
      if (maxValue > 0) {
        const difference = Math.abs(thisValue - otherValue) / maxValue;
        similarityScore += (1 - difference);
        comparisonCount++;
      }
    }
    
    // Calculate final similarity score
    return comparisonCount > 0 ? similarityScore / comparisonCount : 0;
  }

  /**
   * Get a summary of key environment features
   */
  getSummary() {
    const entitySummary = {};
    this.entityDistribution.forEach((count, type) => {
      entitySummary[type] = count;
    });
    
    const spatialSummary = {};
    this.spatialCharacteristics.forEach((value, feature) => {
      spatialSummary[feature] = value;
    });
    
    const stabilitySummary = {};
    this.stabilityMetrics.forEach((value, metric) => {
      stabilitySummary[metric] = value;
    });
    
    return {
      id: this.id,
      visits: this.visitCount,
      lastVisit: this.lastUpdated,
      entities: entitySummary,
      spatial: spatialSummary,
      stability: stabilitySummary
    };
  }
}

/**
 * Knowledge Entry Class
 * Represents a piece of knowledge at any level of abstraction
 */
class KnowledgeEntry {
  constructor(pattern, level = 'low', environmentId = null) {
    this.id = `knowledge-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.pattern = pattern;                // The actual knowledge pattern
    this.level = level;                    // 'low', 'mid', or 'high'
    this.confidence = 0.5;                 // Confidence in this knowledge (0-1)
    this.instances = [];                   // Evidence instances supporting this knowledge
    this.environmentIds = environmentId ? [environmentId] : []; // Environments where this applies
    this.created = Date.now();
    this.lastConfirmed = Date.now();
    this.lastUsed = Date.now();
    this.applicationCount = 0;             // How many times this has been applied
    this.successCount = 0;                 // How many times application was successful
    this.transferSuccess = new Map();      // Success rate by environment ID
  }

  /**
   * Add a new instance of this knowledge pattern
   */
  addInstance(instance, environmentId = null) {
    this.instances.push({
      data: instance,
      timestamp: Date.now(),
      environmentId
    });
    
    // Update environment list
    if (environmentId && !this.environmentIds.includes(environmentId)) {
      this.environmentIds.push(environmentId);
    }
    
    // Update confidence based on instances
    this.updateConfidence();
    
    this.lastConfirmed = Date.now();
    return this;
  }

  /**
   * Record application of this knowledge
   */
  recordApplication(success, environmentId = null) {
    this.applicationCount++;
    this.lastUsed = Date.now();
    
    if (success) {
      this.successCount++;
    }
    
    // Track success by environment
    if (environmentId) {
      const current = this.transferSuccess.get(environmentId) || { success: 0, total: 0 };
      current.total += 1;
      if (success) current.success += 1;
      this.transferSuccess.set(environmentId, current);
    }
    
    // Update confidence based on application results
    this.updateConfidence();
    
    return this;
  }

  /**
   * Update confidence based on instances and application results
   */
  updateConfidence() {
    // Base confidence on number of instances
    const instanceFactor = Math.min(1, this.instances.length / CROSS_REALITY_CONFIG.ABSTRACTION_INSTANCE_THRESHOLD);
    
    // Application success rate factor
    const applicationFactor = this.applicationCount > 0 ? 
      this.successCount / this.applicationCount : 0.5;
    
    // Environment breadth factor - more environments means more general knowledge
    const environmentFactor = Math.min(1, this.environmentIds.length / 3);
    
    // Weight factors based on knowledge level
    let instanceWeight = 0.6;
    let applicationWeight = 0.3;
    let environmentWeight = 0.1;
    
    if (this.level === 'mid') {
      instanceWeight = 0.4;
      applicationWeight = 0.4;
      environmentWeight = 0.2;
    } else if (this.level === 'high') {
      instanceWeight = 0.2;
      applicationWeight = 0.5;
      environmentWeight = 0.3;
    }
    
    // Calculate new confidence
    this.confidence = 
      instanceWeight * instanceFactor + 
      applicationWeight * applicationFactor + 
      environmentWeight * environmentFactor;
    
    return this.confidence;
  }

  /**
   * Apply decay to knowledge confidence
   */
  applyDecay(currentTime) {
    const timeSinceLastUse = currentTime - this.lastUsed;
    const decayFactor = CROSS_REALITY_CONFIG.KNOWLEDGE_DECAY_RATE * (timeSinceLastUse / 1000);
    
    // More decay for low-level, less for high-level knowledge
    const levelMultiplier = this.level === 'low' ? 1.2 : 
                           (this.level === 'mid' ? 1.0 : 0.8);
    
    this.confidence = Math.max(
      CROSS_REALITY_CONFIG.MINIMUM_KNOWLEDGE_CONFIDENCE,
      this.confidence - (decayFactor * levelMultiplier)
    );
    
    return this.confidence;
  }

  /**
   * Check if this knowledge is applicable in a given environment
   */
  isApplicableInEnvironment(environmentId) {
    // High-level knowledge applies everywhere
    if (this.level === 'high') return true;
    
    // If knowledge is from this specific environment, it applies
    if (this.environmentIds.includes(environmentId)) return true;
    
    // Mid-level knowledge might apply if it has been successful in similar environments
    if (this.level === 'mid') {
      const transferRates = Array.from(this.transferSuccess.values());
      if (transferRates.length === 0) return true; // Assume applicable if untested
      
      const averageSuccessRate = transferRates.reduce(
        (sum, { success, total }) => sum + (success / total), 0
      ) / transferRates.length;
      
      return averageSuccessRate >= CROSS_REALITY_CONFIG.VALIDATION_THRESHOLD;
    }
    
    // Low-level knowledge only applies in environments it was learned in
    return false;
  }

  /**
   * Calculate the match confidence for a specific context
   */
  calculateMatchConfidence(context) {
    // Base match on general confidence
    let matchConfidence = this.confidence;
    
    // Adjust based on context match specifics
    if (this.pattern.conditions && context) {
      let conditionMatches = 0;
      let totalConditions = 0;
      
      for (const condition of this.pattern.conditions) {
        totalConditions++;
        if (this.checkCondition(condition, context)) {
          conditionMatches++;
        }
      }
      
      // Factor in condition matching
      if (totalConditions > 0) {
        const conditionFactor = conditionMatches / totalConditions;
        matchConfidence *= conditionFactor;
      }
    }
    
    return matchConfidence;
  }

  /**
   * Check if a specific condition matches the context
   */
  checkCondition(condition, context) {
    if (!condition || !condition.property || !context) return false;
    
    const value = context[condition.property];
    if (value === undefined) return false;
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'notEquals':
        return value !== condition.value;
      case 'greaterThan':
        return value > condition.value;
      case 'lessThan':
        return value < condition.value;
      case 'contains':
        return Array.isArray(value) && value.includes(condition.value);
      case 'near':
        if (typeof value === 'object' && value.x !== undefined && value.y !== undefined) {
          const conditionPos = condition.value;
          const distance = Math.hypot(conditionPos.x - value.x, conditionPos.y - value.y);
          return distance <= (condition.threshold || 10);
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Get a summary of this knowledge entry
   */
  getSummary() {
    return {
      id: this.id,
      level: this.level,
      type: this.pattern.type,
      description: this.pattern.description,
      confidence: this.confidence,
      instances: this.instances.length,
      environments: this.environmentIds.length,
      successRate: this.applicationCount > 0 ? 
        (this.successCount / this.applicationCount) : null
    };
  }
}

/**
 * CrossRealitySystem Class
 * Manages knowledge transfer across environments
 */
export class CrossRealitySystem {
  constructor(world, memoryManager) {
    this.world = world;
    this.memoryManager = memoryManager;
    this.environments = new Map(); // environmentId -> EnvironmentProfile
    this.agentKnowledge = new Map(); // agentId -> { low, mid, high } Maps of knowledge entries
    this.initialized = false;
  }

  /**
   * Initialize the system
   */
  async initialize() {
    if (this.initialized) return;
    
    // Find all eligible agents (must have enhanced memory)
    const agentEntities = this.memoryManager.findAgentEntities();
    
    // Initialize cross-reality knowledge for each agent
    await Promise.all(agentEntities.map(agent => 
      this.initializeAgentCrossRealityKnowledge(agent)
    ));
    
    this.initialized = true;
    console.log(`CrossRealitySystem: Initialized for ${agentEntities.length} agents`);
    return this;
  }

  /**
   * Initialize cross-reality knowledge for an agent
   */
  async initializeAgentCrossRealityKnowledge(agent) {
    // Skip if agent already has cross-reality knowledge
    if (CrossRealityKnowledge[agent]) return;
    
    // Add the component
    addComponent(this.world, CrossRealityKnowledge, agent);
    
    // Initialize component values
    CrossRealityKnowledge.currentEnvironmentId[agent] = 0;
    CrossRealityKnowledge.lastEnvironmentId[agent] = 0;
    CrossRealityKnowledge.environmentTransitionTime[agent] = 0;
    CrossRealityKnowledge.environmentSimilarity[agent] = 1.0;
    CrossRealityKnowledge.lowLevelCount[agent] = 0;
    CrossRealityKnowledge.midLevelCount[agent] = 0;
    CrossRealityKnowledge.highLevelCount[agent] = 0;
    CrossRealityKnowledge.lastGeneralizationTime[agent] = this.world.time;
    CrossRealityKnowledge.adaptationRate[agent] = 0.5;
    CrossRealityKnowledge.abstractionLevel[agent] = 0.3;
    CrossRealityKnowledge.knowledgeTransferSuccess[agent] = 0.5;
    
    // Initialize confidence arrays
    for (let i = 0; i < CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY; i++) {
      CrossRealityKnowledge.lowLevelConfidence[agent * CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY + i] = 0;
      CrossRealityKnowledge.lowLevelLastUsed[agent * CROSS_REALITY_CONFIG.LOW_LEVEL_CAPACITY + i] = 0;
    }
    
    for (let i = 0; i < CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY; i++) {
      CrossRealityKnowledge.midLevelConfidence[agent * CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY + i] = 0;
      CrossRealityKnowledge.midLevelLastUsed[agent * CROSS_REALITY_CONFIG.MID_LEVEL_CAPACITY + i] = 0;
    }
    
    for (let i = 0; i < CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY; i++) {
      CrossRealityKnowledge.highLevelConfidence[agent * CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY + i] = 0;
      CrossRealityKnowledge.highLevelLastUsed[agent * CROSS_REALITY_CONFIG.HIGH_LEVEL_CAPACITY + i] = 0;
    }
    
    // Initialize agent's knowledge structure
    this.agentKnowledge.set(agent, {
      low: new Map(),  // id -> KnowledgeEntry
      mid: new Map(),  // id -> KnowledgeEntry
      high: new Map()  // id -> KnowledgeEntry
    });
    
    return agent;
  }

  /**
   * Create a system using this manager
   */
  createSystem() {
    // Define query for agents with cross-reality knowledge
    const crQuery = defineQuery([CrossRealityKnowledge, EnhancedMemory, CognitiveState]);
    const crossRealityManager = this;
    
    // Define and return the system
    return defineSystem(async (world) => {
      if (!crossRealityManager.initialized) {
        await crossRealityManager.initialize();
      }
      
      const agents = crQuery(world);
      const currentTime = world.time;
      
      for (const agent of agents) {
        // Process agent's cross-reality knowledge components
        crossRealityManager.updateEnvironment(agent, currentTime);
        crossRealityManager.updateKnowledge(agent, currentTime);
        crossRealityManager.generalizeKnowledge(agent, currentTime);
        
        // Apply knowledge to decision making
        crossRealityManager.applyKnowledgeToDecisions(agent, currentTime);
      }
      
      return world;
    });
  }

  /**
   * Update environment context for an agent
   */
  updateEnvironment(agent, currentTime) {
    // Determine current environment ID
    const newEnvironmentId = this.detectEnvironmentId(agent);
    const currentEnvironmentId = CrossRealityKnowledge.currentEnvironmentId[agent];
    
    // Check for environment transition
    if (newEnvironmentId !== currentEnvironmentId) {
      // Store the current environment as the previous one
      CrossRealityKnowledge.lastEnvironmentId[agent] = currentEnvironmentId;
      CrossRealityKnowledge.currentEnvironmentId[agent] = newEnvironmentId;
      CrossRealityKnowledge.environmentTransitionTime[agent] = currentTime;
      
      // Calculate similarity between environments
      const similarity = this.calculateEnvironmentSimilarity(newEnvironmentId, currentEnvironmentId);
      CrossRealityKnowledge.environmentSimilarity[agent] = similarity;
      
      // Trigger knowledge adaptation if environments are sufficiently different
      if (similarity < CROSS_REALITY_CONFIG.ENVIRONMENT_TRANSITION_THRESHOLD) {
        this.adaptKnowledge(agent, newEnvironmentId, currentEnvironmentId, similarity);
      }
    }
    
    // Update environment profile with current observations
    this.updateEnvironmentProfile(agent, newEnvironmentId);
  }

  /**
   * Detect the current environment ID for an agent
   */
  detectEnvironmentId(agent) {
    // Check for explicit environment ID in the world state
    if (this.world.currentEnvironmentId) {
      return this.world.currentEnvironmentId;
    }
    
    // Check for reality flux as environment indicator
    const realityEffect = RealityFlux[agent]?.effectType || 0;
    if (realityEffect > 0) {
      return 1000 + realityEffect; // Special environment IDs for reality flux states
    }
    
    // Default environment ID based on quadrant of the world
    const x = Position.x[agent];
    const y = Position.y[agent];
    const quadrantX = x < 50 ? 0 : 1;
    const quadrantY = y < 50 ? 0 : 1;
    return quadrantX + (quadrantY * 2) + 1; // Environment IDs 1-4 for quadrants
  }

  /**
   * Calculate similarity between two environments
   */
  calculateEnvironmentSimilarity(envId1, envId2) {
    if (envId1 === envId2) return 1.0;
    if (envId1 === 0 || envId2 === 0) return 0.0;
    
    // Get environment profiles
    const env1 = this.environments.get(envId1);
    const env2 = this.environments.get(envId2);
    
    // If we don't have profiles, guess based on IDs
    if (!env1 || !env2) {
      // Reality flux environments are very different from normal ones
      if (envId1 >= 1000 || envId2 >= 1000) {
        return 0.2;
      }
      
      // Adjacent quadrants are somewhat similar
      if (Math.abs(envId1 - envId2) === 1 || Math.abs(envId1 - envId2) === 2) {
        return 0.6;
      }
      
      // Diagonal quadrants are less similar
      return 0.4;
    }
    
    // Use profile similarity calculation
    return env1.calculateSimilarity(env2);
  }

  /**
   * Update environment profile with current observations
   */
  updateEnvironmentProfile(agent, environmentId) {
    if (environmentId === 0) return;
    
    // Get or create environment profile
    let profile = this.environments.get(environmentId);
    if (!profile) {
      profile = new EnvironmentProfile(environmentId);
      this.environments.set(environmentId, profile);
      
      // Maintain environment cache size
      if (this.environments.size > CROSS_REALITY_CONFIG.MAX_ENVIRONMENT_CACHE) {
        // Find and remove oldest environment
        const oldest = Array.from(this.environments.entries())
          .sort((a, b) => a[1].lastUpdated - b[1].lastUpdated)[0];
        if (oldest) {
          this.environments.delete(oldest[0]);
        }
      }
    }
    
    // Collect observations from the agent's perspective
    const observations = this.collectEnvironmentObservations(agent);
    
    // Update profile with new observations
    profile.update(observations);
  }

  /**
   * Collect observations about the environment from agent's perspective
   */
  collectEnvironmentObservations(agent) {
    const observations = {
      entityCounts: {},
      spatialData: {},
      stabilityData: {}
    };
    
    // Count entities by type in sensory range
    const entityCounts = { 0: 0, 1: 0, 2: 0, 3: 0 }; // Resource, Obstacle, Hazard, Agent
    for (let i = 0; i < 10; i++) {
      const entityId = SensoryData.entitiesDetected[agent * 10 + i];
      if (entityId === 0) continue;
      
      if (Environmental[entityId]) {
        const type = Environmental.type[entityId];
        entityCounts[type] = (entityCounts[type] || 0) + 1;
      } else if (SensoryData[entityId]) {
        entityCounts[3] = (entityCounts[3] || 0) + 1; // Agent
      }
    }
    observations.entityCounts = entityCounts;
    
    // Calculate spatial characteristics
    // Entity density
    const totalEntities = Object.values(entityCounts).reduce((sum, count) => sum + count, 0);
    observations.spatialData.entityDensity = totalEntities / 10;
    
    // Resource to obstacle ratio
    const resourceCount = entityCounts[0] || 0;
    const obstacleCount = entityCounts[1] || 0;
    observations.spatialData.resourceObstacleRatio = obstacleCount > 0 ? 
      resourceCount / obstacleCount : resourceCount > 0 ? 2 : 1;
    
    // Hazard prevalence
    observations.spatialData.hazardPrevalence = entityCounts[2] ? entityCounts[2] / totalEntities : 0;
    
    // Calculate stability metrics
    observations.stabilityData.realityFluxIntensity = RealityFlux[agent]?.effectType || 0;
    
    // If world has reality wave, include its activity
    if (this.world.realityWave) {
      observations.stabilityData.realityWaveActive = this.world.realityWave.active ? 1 : 0;
    }
    
    return observations;
  }

  /**
   * Adapt agent's knowledge when transitioning between environments
   */
  adaptKnowledge(agent, newEnvironmentId, previousEnvironmentId, similarity) {
    const agentKnowledge = this.agentKnowledge.get(agent);
    if (!agentKnowledge) return;
    
    // Higher adaptation for less similar environments
    const adaptationFactor = Math.max(0.1, 1 - similarity);
    
    // Adjust confidence of knowledge based on applicability in new environment
    // Low-level knowledge is most affected, high-level least affected
    
    // Adjust low-level knowledge
    for (const [id, knowledge] of agentKnowledge.low.entries()) {
      // Check if knowledge is applicable in new environment
      if (!knowledge.isApplicableInEnvironment(newEnvironmentId)) {
        // Reduce confidence significantly
        knowledge.confidence *= (1 - adaptationFactor * 0.7);
      }
    }
    
    // Adjust mid-level knowledge
    for (const [id, knowledge] of agentKnowledge.mid.entries()) {
      if (!knowledge.isApplicableInEnvironment(newEnvironmentId)) {
        // Reduce confidence moderately
        knowledge.confidence *= (1 - adaptationFactor * 0.4);
      }
    }
    
    // Adjust high-level knowledge
    for (const [id, knowledge] of agentKnowledge.high.entries()) {
      // High-level knowledge is more resilient
      knowledge.confidence *= (1 - adaptationFactor * 0.1);
    }
    
    // Update component data
    this.syncKnowledgeToComponent(agent);
    
    // Update agent's adaptation rate based on transition
    const newAdaptationRate =
