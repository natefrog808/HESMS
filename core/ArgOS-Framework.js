/**
 * ArgOS Framework - Core Components
 * 
 * A lightweight entity component system for agent-based simulations.
 * Provides the foundation for the HESMS and Consciousness Extensions.
 */

import { defineComponent, defineQuery, defineSystem, createWorld as createECSWorld, Types, addEntity as addECSEntity } from 'bitecs';

// Basic Components
export const Position = defineComponent({
  x: Types.f32,
  y: Types.f32
});

export const SensoryData = defineComponent({
  visionRange: Types.f32,
  entitiesDetected: [Types.eid, 10],
  entitiesDistance: [Types.f32, 10]
});

export const Actions = defineComponent({
  currentAction: Types.ui8,
  targetEntity: Types.eid,
  successRate: Types.f32,
  energyCost: Types.f32,
  cooldown: Types.ui16
});

export const Goals = defineComponent({
  primaryType: Types.ui8,  // 0: Explore, 1: Resource, 2: Avoid Hazard, 3: Social
  priority: Types.ui8,
  targetEntity: Types.eid,
  targetX: Types.f32,
  targetY: Types.f32,
  completionPercentage: Types.f32
});

export const CognitiveState = defineComponent({
  emotionalState: Types.f32, // 0-100 scale (0: negative, 100: positive)
  adaptability: Types.f32,   // 0-100 scale (how quickly agent adapts to changes)
  curiosity: Types.f32,      // 0-100 scale (likelihood to explore)
  socialAffinity: Types.f32  // 0-100 scale (preference for social interaction)
});

export const RealityFlux = defineComponent({
  effectType: Types.ui8, // 0: None, 1: Teleport, 2: Phase, 3: Transform
  intensity: Types.f32,
  duration: Types.ui16,
  affectedArea: Types.f32
});

export const Environmental = defineComponent({
  type: Types.ui8,  // 0: Resource, 1: Obstacle, 2: Hazard
  value: Types.f32,
  depletion: Types.f32,
  respawnTime: Types.ui16
});

// Basic Systems
export const createMovementSystem = () => {
  const query = defineQuery([Position, Goals]);
  
  return (world) => {
    const entities = query(world);
    const deltaTime = world.time - (world.lastTime || 0);
    const moveSpeed = 0.05;
    
    entities.forEach(entity => {
      const targetX = Goals.targetX[entity];
      const targetY = Goals.targetY[entity];
      
      if (targetX === 0 && targetY === 0) return;
      
      const dx = targetX - Position.x[entity];
      const dy = targetY - Position.y[entity];
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 1) {
        Position.x[entity] += (dx / distance) * moveSpeed * deltaTime;
        Position.y[entity] += (dy / distance) * moveSpeed * deltaTime;
      } else {
        // If close enough to target, mark goal as complete
        Goals.completionPercentage[entity] = 100;
      }
    });
    
    return world;
  };
};

export const createSensorSystem = () => {
  const query = defineQuery([Position, SensoryData]);
  
  return (world) => {
    const entities = query(world);
    
    entities.forEach(entity => {
      const x = Position.x[entity];
      const y = Position.y[entity];
      const range = SensoryData.visionRange[entity] || 30;
      
      // Reset detected entities
      for (let i = 0; i < 10; i++) {
        SensoryData.entitiesDetected[entity * 10 + i] = 0;
        SensoryData.entitiesDistance[entity * 10 + i] = 999;
      }
      
      // Find entities in range
      let detectedCount = 0;
      for (let i = 0; i < world.entities.length; i++) {
        if (i === entity || !Position[i]) continue;
        
        const otherX = Position.x[i];
        const otherY = Position.y[i];
        const dx = otherX - x;
        const dy = otherY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= range && detectedCount < 10) {
          SensoryData.entitiesDetected[entity * 10 + detectedCount] = i;
          SensoryData.entitiesDistance[entity * 10 + detectedCount] = distance;
          detectedCount++;
        }
      }
      
      // Sort detected entities by distance
      for (let i = 0; i < detectedCount - 1; i++) {
        for (let j = i + 1; j < detectedCount; j++) {
          const idxI = entity * 10 + i;
          const idxJ = entity * 10 + j;
          if (SensoryData.entitiesDistance[idxI] > SensoryData.entitiesDistance[idxJ]) {
            // Swap distance
            const tempDist = SensoryData.entitiesDistance[idxI];
            SensoryData.entitiesDistance[idxI] = SensoryData.entitiesDistance[idxJ];
            SensoryData.entitiesDistance[idxJ] = tempDist;
            
            // Swap entity
            const tempEnt = SensoryData.entitiesDetected[idxI];
            SensoryData.entitiesDetected[idxI] = SensoryData.entitiesDetected[idxJ];
            SensoryData.entitiesDetected[idxJ] = tempEnt;
          }
        }
      }
    });
    
    return world;
  };
};

export const createDecisionSystem = () => {
  const query = defineQuery([Goals, SensoryData, CognitiveState]);
  
  return (world) => {
    const entities = query(world);
    
    entities.forEach(entity => {
      // Only make a new decision if the current goal is complete or no goal
      if (Goals.completionPercentage[entity] < 95) return;
      
      const emotionalState = CognitiveState.emotionalState[entity];
      const adaptability = CognitiveState.adaptability[entity];
      const curiosity = CognitiveState.curiosity[entity];
      
      // Default to exploration
      let goalType = 0;
      let targetX = Position.x[entity] + (Math.random() * 40 - 20);
      let targetY = Position.y[entity] + (Math.random() * 40 - 20);
      let targetEntity = 0;
      let priority = 20;
      
      // Check for resources or hazards in sensory range
      for (let i = 0; i < 10; i++) {
        const detectedEntity = SensoryData.entitiesDetected[entity * 10 + i];
        if (detectedEntity === 0) continue;
        
        if (Environmental[detectedEntity]) {
          const type = Environmental.type[detectedEntity];
          
          if (type === 0) { // Resource
            goalType = 1;
            targetX = Position.x[detectedEntity];
            targetY = Position.y[detectedEntity];
            targetEntity = detectedEntity;
            priority = 50;
            break;
          } else if (type === 2) { // Hazard
            goalType = 2;
            // Move away from hazard
            const dx = Position.x[entity] - Position.x[detectedEntity];
            const dy = Position.y[entity] - Position.y[detectedEntity];
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
              targetX = Position.x[entity] + (dx / dist) * 20;
              targetY = Position.y[entity] + (dy / dist) * 20;
              priority = 80;
              break;
            }
          }
        } else if (SensoryData[detectedEntity] && Math.random() < 0.2) {
          // Sometimes interact with other agents
          goalType = 3;
          targetX = Position.x[detectedEntity];
          targetY = Position.y[detectedEntity];
          targetEntity = detectedEntity;
          priority = 30;
          break;
        }
      }
      
      // Random exploration based on curiosity
      if (goalType === 0 && Math.random() * 100 < curiosity) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 20;
        targetX = Position.x[entity] + Math.cos(angle) * distance;
        targetY = Position.y[entity] + Math.sin(angle) * distance;
      }
      
      // Set the new goal
      Goals.primaryType[entity] = goalType;
      Goals.targetEntity[entity] = targetEntity;
      Goals.targetX[entity] = targetX;
      Goals.targetY[entity] = targetY;
      Goals.priority[entity] = priority;
      Goals.completionPercentage[entity] = 0;
    });
    
    return world;
  };
};

export const createActionSystem = () => {
  const query = defineQuery([Actions, Goals]);
  
  return (world) => {
    const entities = query(world);
    
    entities.forEach(entity => {
      if (Actions.cooldown[entity] > 0) {
        Actions.cooldown[entity]--;
        return;
      }
      
      const goalType = Goals.primaryType[entity];
      const targetEntity = Goals.targetEntity[entity];
      
      // Convert goal to action
      Actions.currentAction[entity] = goalType;
      Actions.targetEntity[entity] = targetEntity;
      
      // Set success rate based on complexity of goal
      switch (goalType) {
        case 0: // Explore
          Actions.successRate[entity] = 0.9;
          Actions.energyCost[entity] = 1;
          break;
        case 1: // Get resource
          Actions.successRate[entity] = 0.7;
          Actions.energyCost[entity] = 3;
          break;
        case 2: // Avoid hazard
          Actions.successRate[entity] = 0.8;
          Actions.energyCost[entity] = 5;
          break;
        case 3: // Social
          Actions.successRate[entity] = 0.6;
          Actions.energyCost[entity] = 2;
          break;
      }
      
      // Random success check (we don't actually use this for anything right now)
      if (Math.random() > Actions.successRate[entity]) {
        // Action failed
        Actions.cooldown[entity] = 20; // Longer cooldown for failures
      } else {
        // Action succeeded
        Actions.cooldown[entity] = 5;
      }
    });
    
    return world;
  };
};

export const createRealityFluxSystem = () => {
  const query = defineQuery([RealityFlux]);
  
  return (world) => {
    // Global reality shifts
    if (world.realityWave) {
      world.realityWave.timer--;
      
      if (world.realityWave.timer <= 0) {
        world.realityWave.active = !world.realityWave.active;
        world.realityWave.timer = world.realityWave.active ? 100 : 500; // Active for 100 ticks, inactive for 500
        
        console.log(`Reality wave ${world.realityWave.active ? 'active' : 'inactive'}`);
      }
    } else {
      world.realityWave = { active: false, timer: 500 };
    }
    
    // Apply reality effects to entities
    const entities = query(world);
    
    entities.forEach(entity => {
      if (RealityFlux.effectType[entity] > 0) {
        if (RealityFlux.duration[entity] > 0) {
          RealityFlux.duration[entity]--;
        } else {
          RealityFlux.effectType[entity] = 0;
        }
        
        // Apply reality flux effects based on type
        if (Position[entity]) {
          switch (RealityFlux.effectType[entity]) {
            case 1: // Teleport
              if (Math.random() < 0.1) {
                Position.x[entity] += (Math.random() * 10 - 5);
                Position.y[entity] += (Math.random() * 10 - 5);
              }
              break;
            case 2: // Phase
              // No visible effect in basic framework
              break;
            case 3: // Transform
              // No visible effect in basic framework
              break;
          }
        }
      } else if (world.realityWave?.active && Math.random() < 0.01) {
        // Random reality flux during a reality wave
        RealityFlux.effectType[entity] = Math.floor(Math.random() * 3) + 1;
        RealityFlux.intensity[entity] = 0.5 + Math.random() * 0.5;
        RealityFlux.duration[entity] = 10 + Math.floor(Math.random() * 20);
      }
    });
    
    return world;
  };
};

export const createRenderSystem = () => {
  return (world, canvas) => {
    if (!canvas) return world;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate scale factor
    const pixelsPerUnit = 5;
    
    // Draw reality wave effect
    if (world.realityWave?.active) {
      const intensity = (Math.sin(world.time * 0.05) + 1) * 0.1;
      ctx.fillStyle = `rgba(188, 74, 232, ${intensity})`;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Draw entities
    for (let i = 0; i < world.entities.length; i++) {
      if (!Position[i]) continue;
      
      const x = Position.x[i] * pixelsPerUnit;
      const y = Position.y[i] * pixelsPerUnit;
      
      // Draw entity based on its components
      if (Environmental[i]) {
        const type = Environmental.type[i];
        
        switch (type) {
          case 0: // Resource
            ctx.fillStyle = '#f1c40f'; // Yellow
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 1: // Obstacle
            ctx.fillStyle = '#7f8c8d'; // Gray
            ctx.fillRect(x - 5, y - 5, 10, 10);
            break;
          case 2: // Hazard
            ctx.fillStyle = '#e74c3c'; // Red
            ctx.beginPath();
            const spikes = 5;
            for (let j = 0; j < spikes * 2; j++) {
              const radius = j % 2 === 0 ? 6 : 3;
              const angle = (j / (spikes * 2)) * Math.PI * 2;
              const px = x + Math.cos(angle) * radius;
              const py = y + Math.sin(angle) * radius;
              if (j === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            break;
        }
      } else if (SensoryData[i]) {
        // Agent
        ctx.fillStyle = '#2ecc71'; // Green
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw goal direction
        if (Goals[i]) {
          const targetX = Goals.targetX[i] * pixelsPerUnit;
          const targetY = Goals.targetY[i] * pixelsPerUnit;
          
          ctx.strokeStyle = '#2ecc71';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          
          // Calculate direction vector
          const dx = targetX - x;
          const dy = targetY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 0) {
            // Draw a shorter line in the direction
            const lineLength = Math.min(dist, 15);
            ctx.lineTo(
              x + (dx / dist) * lineLength,
              y + (dy / dist) * lineLength
            );
          }
          
          ctx.stroke();
        }
        
        // Draw sensory range (faintly)
        if (SensoryData.visionRange[i]) {
          const range = SensoryData.visionRange[i] * pixelsPerUnit;
          ctx.strokeStyle = 'rgba(46, 204, 113, 0.1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, range, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Draw reality flux effect
        if (RealityFlux[i] && RealityFlux.effectType[i] > 0) {
          const effectType = RealityFlux.effectType[i];
          const intensity = RealityFlux.intensity[i] || 0.5;
          
          switch (effectType) {
            case 1: // Teleport
              ctx.strokeStyle = `rgba(41, 128, 185, ${0.5 * intensity})`;
              ctx.lineWidth = 2;
              
              for (let j = 0; j < 3; j++) {
                const radius = 8 + j * 3;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.stroke();
              }
              break;
            case 2: // Phase
              ctx.strokeStyle = `rgba(142, 68, 173, ${0.5 * intensity})`;
              ctx.lineWidth = 2;
              
              const phaseAngle = world.time * 0.1;
              ctx.beginPath();
              ctx.arc(
                x + Math.cos(phaseAngle) * 3, 
                y + Math.sin(phaseAngle) * 3, 
                7, 0, Math.PI * 2
              );
              ctx.stroke();
              break;
            case 3: // Transform
              ctx.strokeStyle = `rgba(230, 126, 34, ${0.5 * intensity})`;
              ctx.lineWidth = 2;
              
              ctx.beginPath();
              ctx.moveTo(x - 6, y - 6);
              ctx.lineTo(x + 6, y + 6);
              ctx.moveTo(x + 6, y - 6);
              ctx.lineTo(x - 6, y + 6);
              ctx.stroke();
              break;
          }
        }
      }
    }
    
    return world;
  };
};

// World creation and entity management
export const createWorld = () => {
  const world = createECSWorld();
  world.time = 0;
  world.entities = [];
  world.components = {
    Position,
    SensoryData,
    Actions,
    Goals,
    CognitiveState,
    RealityFlux,
    Environmental
  };
  world.systems = [];
  
  return world;
};

export const addEntity = (world) => {
  const entity = addECSEntity(world);
  world.entities.push(entity);
  return entity;
};

export const createDefaultSystems = () => [
  // Update world time
  (world) => {
    world.lastTime = world.time;
    world.time++;
    return world;
  },
  createSensorSystem(),
  createDecisionSystem(),
  createActionSystem(),
  createMovementSystem(),
  createRealityFluxSystem()
];

// Run world simulation for a number of steps
export const runSimulation = (world, steps = 1) => {
  for (let i = 0; i < steps; i++) {
    for (const system of world.systems) {
      system(world);
    }
  }
  return world;
};

// Export all components and systems
export default {
  createWorld,
  addEntity,
  runSimulation,
  createDefaultSystems,
  Position,
  SensoryData,
  Actions,
  Goals,
  CognitiveState,
  RealityFlux,
  Environmental
};
