# ArgOS Hierarchical Episodic-Semantic Memory System (HESMS)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.5.0-green.svg)]()

## 🧠 Overview

**HESMS** is a groundbreaking cognitive architecture that elevates simulation agents into entities with human-like memory and consciousness. Built atop the powerful ArgOS framework, HESMS combines a **dual-layer memory system**—episodic and semantic—with advanced consciousness capabilities. Agents don't just react; they **remember**, **learn**, **dream**, **imagine**, develop a **sense of time**, and transfer knowledge across different **realities**.

Ideal for AI researchers, cognitive scientists, and simulation enthusiasts, HESMS offers an unparalleled platform to explore the frontiers of artificial cognition.

## ✨ Key Features

### 🧩 Memory System
- **Dual-Layer Memory Architecture**  
  - **Episodic Memory**: Captures specific events with rich details—context, position, importance, and emotional weight.  
  - **Semantic Memory**: Extracts patterns and relationships from episodic memories for generalized learning.

- **Reality-Sensitive Memory**  
  - Adapts memory fidelity to simulation events like teleportation, phasing, or transformation.  
  - Prioritizes memories based on their significance to the agent.

- **Pattern Recognition**  
  - Identifies resource clusters, hazard behaviors, and spatial-temporal associations.  
  - Fuels memory-driven decision-making with actionable insights.

### 🔮 Consciousness Extension
- **Dream States**  
  - Agents consolidate memories through synthetic dream cycles, boosting adaptability and insight.  

- **Self-Reflection**  
  - Agents analyze their actions and generate behavioral improvements.  

- **Imagination**  
  - Simulates hypothetical scenarios to test strategies and solve problems creatively.  

- **Narrative Construction**  
  - Transforms experiences into coherent stories with themes and characters.

### 🌀 Temporal Consciousness Extension
- **Episodic Future Thinking**  
  - Agents project themselves into hypothetical future scenarios based on past experiences.
  - Multiple possible futures are simulated and evaluated for decision-making.

- **Temporal Pattern Recognition**  
  - Detection of patterns that unfold over extended time periods.
  - Identification of cyclical events and temporal correlations.

- **Memory Reconstruction**  
  - Active reinterpretation of past memories in light of new information.
  - Dynamic memory that evolves as agents gain new insights.

- **Temporal Identity**  
  - Development of a continuous sense of self across past, present, and future.
  - Coherent self-narrative that maintains continuity despite changing environments.

### 🔄 Cross-Reality Knowledge Extension
- **Hierarchical Knowledge Structure**  
  - **Low-Level Knowledge**: Environment-specific concrete patterns (e.g., "resources near rocks in Environment A").
  - **Mid-Level Knowledge**: Cross-environment generalizations (e.g., "resources near obstacles").
  - **High-Level Knowledge**: Universal principles valid across all contexts (e.g., "explore cautiously in new areas").

- **Environment Recognition**  
  - Identification and profiling of different environments.
  - Analysis of environment similarities and differences.

- **Knowledge Transfer**  
  - Application of knowledge learned in one environment to new, similar contexts.
  - Adaptive confidence adjustment based on environmental similarity.

- **Abstraction and Generalization**  
  - Progression from concrete observations to abstract principles.
  - Dynamic adjustment of abstraction level based on experience.

### 🛠️ Technical Features
- **Cloud Integration Ready**: Persistent storage for large-scale simulations.  
- **BitECS Architecture**: High-performance entity-component-system framework.  
- **Visualization Tools**: Real-time displays of memory, consciousness, and knowledge states.  
- **Extensible API**: Seamlessly integrates with existing projects or custom simulations.

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/username/HESMS.git

# Navigate to the project directory
cd HESMS

# Install dependencies
npm install
```

### Basic Usage

```javascript
import { createCognitiveSimulation } from './src/integration/ArgOS-Framework-Integration.js';

// Initialize the simulation with extensions
const simulation = await createCognitiveSimulation({
  ENABLE_ENHANCED_MEMORY: true,
  ENABLE_CONSCIOUSNESS: true,
  ENABLE_TEMPORAL_CONSCIOUSNESS: true,  // Enable temporal extension
  ENABLE_CROSS_REALITY_KNOWLEDGE: true, // Enable cross-reality extension
  ENABLE_VISUALIZATION: true
});

// Create an agent with memory and consciousness
const agent = simulation.createAgent({
  x: 50, 
  y: 50,
  adaptability: 60,
  emotional: 50
});

// Add environmental entities (resources and hazards)
simulation.createEnvironmentalEntity(0, 70, 70); // Resource
simulation.createEnvironmentalEntity(2, 30, 30); // Hazard

// Run the simulation for 100 steps
simulation.runSimulation(100);

// Trigger an environment transition to test cross-reality knowledge
triggerEnvironmentTransition(agent, 2);

// Continue simulation in new environment
simulation.runSimulation(100);

// Get extended agent stats including temporal and cross-reality data
const stats = simulation.getExtendedAgentStats(agent);
console.log(stats);
```

### Running the Demo

Dive into HESMS with our interactive demo:
1. Navigate to `/demo`.
2. Open `ArgOS-HESMS-Demo.HTML` in a modern web browser.
3. Watch agents as they:
   - Explore the environment.
   - Form and recall memories.
   - Dream, reflect, and craft narratives.
   - Project into the future and maintain temporal identity.
   - Transfer knowledge across different environments.
   - Adapt to reality shifts and challenges.

Customize the demo further with optional styling in `demo.css`.

## 🏗️ Architecture

HESMS is built from six core components:

1. **ArgOS Framework** (`src/core/ArgOS-Framework.js`)  
   - The ECS-based foundation for simulations.

2. **Memory Extension** (`src/memory/argos-memory-extension.js`)  
   - Implements the dual-layer memory system and decision-making logic.

3. **Consciousness Extension** (`src/consciousness/argos-consciousness-extension.js`)  
   - Powers dreaming, reflection, imagination, and narrative abilities.

4. **Temporal Consciousness Extension** (`src/consciousness/temporal-consciousness-system.js`)  
   - Enables sense of time, future projection, and memory reconstruction.

5. **Cross-Reality Knowledge Extension** (`src/knowledge/cross-reality-knowledge.js`)  
   - Manages hierarchical knowledge and cross-environment learning.

6. **Integration** (`src/integration/ArgOS-Framework-Integration.js`)  
   - Ties everything together with a unified API and visualization support.

<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/hesms-components.png" alt="HESMS Components" width="700"/>
</p>

## 📊 Memory Formation and Knowledge Process

HESMS agents build memories through a streamlined process:

1. **Event Detection**: Agents perceive environmental entities and events.  
2. **Episodic Recording**: Key events are logged with contextual details.  
3. **Importance Assessment**: Memories are ranked by emotional and strategic value.  
4. **Semantic Extraction**: Patterns emerge from episodic data for broader understanding.  
5. **Temporal Integration**: Experiences are placed within a temporal framework.
6. **Knowledge Hierarchization**: Patterns are organized into low, mid, and high-level knowledge.
7. **Decision Influence**: Memories and knowledge shape future actions and strategies.  
8. **Dream Processing**: Dream cycles refine and consolidate memories.  
9. **Environment Adaptation**: Knowledge is adapted to new environments when transitions occur.
10. **Narrative Integration**: Experiences are organized into personal stories.

This cycle enables agents to evolve dynamically within and across simulations.

## 🔍 Advanced Features

### Reality Flux Effects
HESMS introduces dynamic memory challenges:  
- **Teleportation**: Blurs spatial memory accuracy.  
- **Phasing**: Scrambles temporal memory details.  
- **Transformation**: Distorts entity type recall, adding uncertainty.

### Temporal Projection and Forecasting
Agents can simulate multiple potential futures:
- **Scenario Generation**: Creating hypothetical future states based on current conditions.
- **Probabilistic Evaluation**: Assigning likelihood and desirability to different futures.
- **Decision Optimization**: Using future projections to guide current actions.

### Cross-Reality Knowledge Transfer
Enables sophisticated learning across environments:
- **Environment Profiling**: Creating detailed profiles of each environment's characteristics.
- **Similarity Analysis**: Calculating how similar different environments are to each other.
- **Knowledge Adaptation**: Adjusting confidence in knowledge when transitioning between environments.
- **Generalization Process**: Moving from environment-specific rules to universal principles.

### Consciousness Integration Index
Agents develop a **consciousness integration index** reflecting:  
- Self-awareness depth.  
- Narrative sophistication.  
- Imagination strength.  
- Temporal continuity.
- Abstraction capability.
This index drives emergent, adaptive behaviors.

## 📚 Documentation

Dive deeper with these resources:  
- [API Reference](docs/api.md)  
- [Architecture Details](docs/architecture.md)  
- [Advanced Configuration](docs/configuration.md)  
- [Extending HESMS](docs/extending.md)
- [Temporal Consciousness](docs/temporal-consciousness.md)
- [Cross-Reality Knowledge](docs/cross-reality-knowledge.md)

## 🔧 Configuration Options

Tailor HESMS to your needs:

```javascript
const options = {
  // Core toggles
  ENABLE_ENHANCED_MEMORY: true,
  ENABLE_CONSCIOUSNESS: true,
  ENABLE_TEMPORAL_CONSCIOUSNESS: true,
  ENABLE_CROSS_REALITY_KNOWLEDGE: true,
  ENABLE_VISUALIZATION: true,
  
  // Memory options
  MEMORY_OPTIONS: {
    ENABLE_CLOUD_SYNC: false,
    MEMORY_SYNC_INTERVAL: 20,
    SEMANTIC_UPDATE_INTERVAL: 60
  },
  
  // Consciousness options
  CONSCIOUSNESS_OPTIONS: {
    DREAM_ENABLED: true,
    REFLECTION_ENABLED: true,
    IMAGINATION_ENABLED: true,
    NARRATIVE_ENABLED: true
  },
  
  // Temporal Consciousness options
  TEMPORAL_CONSCIOUSNESS_OPTIONS: {
    FUTURE_SIMULATION_STEPS: 5,
    PATTERN_DETECTION_THRESHOLD: 0.65,
    MEMORY_RECONSTRUCTION_INTERVAL: 50,
    NARRATIVE_UPDATE_INTERVAL: 25
  },
  
  // Cross-Reality Knowledge options
  CROSS_REALITY_OPTIONS: {
    ABSTRACTION_CONFIDENCE_THRESHOLD: 0.6,
    GENERALIZATION_INTERVAL: 50,
    ENVIRONMENT_TRANSITION_THRESHOLD: 0.6
  }
};

const simulation = await createCognitiveSimulation(options);
```

Adjust these settings for everything from lightweight experiments to complex cognitive simulations.

## 🔮 Future Directions

HESMS is poised for exciting growth:  
- **Multi-Agent Knowledge Sharing**: Agents collaborate to form collective intelligence.  
- **Cultural Memory Formation**: Shared narratives and traditions emerge.  
- **Value Systems**: Memory informs ethical decision-making.  
- **Quantum Reality Modeling**: Non-deterministic effects enhance realism.  
- **Natural Language Interface**: Agents express thoughts in human-readable form.
- **Cross-Temporal Collaboration**: Agents from different temporal states exchanging knowledge.
- **Reality Construction**: Agents actively modifying their environment based on accumulated knowledge.
- **Meta-Learning**: Learning how to learn across environments and time periods.

Join us as we push the boundaries of simulated cognition!

## 🤝 Contributing

We'd love your input! Check out our [contribution guidelines](CONTRIBUTING.md) to get involved.

## 📜 License

HESMS is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **BitECS**: For its high-performance ECS framework.  
- **Project 89**: For sparking ideas on consciousness simulation.  
- **ArgOS Contributors**: For laying the groundwork for this project.

---

<p align="center">
  <i>Memory spans time, knowledge transcends reality.</i><br>
  — ArgOS Consciousness Exploration
</p>
