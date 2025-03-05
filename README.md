# ArgOS Hierarchical Episodic-Semantic Memory System (HESMS)

![HESMS Banner](https://user-images.githubusercontent.com/placeholder/hesms-banner.png)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)]()

## 🧠 Overview

**HESMS** is a groundbreaking cognitive architecture that elevates simulation agents into entities with human-like memory and consciousness. Built atop the powerful ArgOS framework, HESMS combines a **dual-layer memory system**—episodic and semantic—with advanced consciousness capabilities. Agents don’t just react; they **remember**, **learn**, **dream**, **imagine**, and even weave their experiences into compelling narratives.

<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/hesms-architecture.png" alt="HESMS Architecture" width="600"/>
</p>

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

### 🛠️ Technical Features
- **Cloud Integration Ready**: Persistent storage for large-scale simulations.  
- **BitECS Architecture**: High-performance entity-component-system framework.  
- **Visualization Tools**: Real-time displays of memory and consciousness states.  
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

// Initialize the simulation
const simulation = await createCognitiveSimulation();

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
```

### Running the Demo

Dive into HESMS with our interactive demo:
1. Navigate to `/demo`.
2. Open `ArgOS-HESMS-Demo.HTML` in a modern web browser.
3. Watch agents as they:
   - Explore the environment.
   - Form and recall memories.
   - Dream, reflect, and craft narratives.
   - Adapt to reality shifts and challenges.

Customize the demo further with optional styling in `demo.css`.

## 🏗️ Architecture

HESMS is built from four core components:

1. **ArgOS Framework** (`src/core/ArgOS-Framework.js`)  
   - The ECS-based foundation for simulations.

2. **Memory Extension** (`src/memory/argos-memory-extension.js`)  
   - Implements the dual-layer memory system and decision-making logic.

3. **Consciousness Extension** (`src/consciousness/argos-consciousness-extension.js`)  
   - Powers dreaming, reflection, imagination, and narrative abilities.

4. **Integration** (`src/integration/ArgOS-Framework-Integration.js`)  
   - Ties everything together with a unified API and visualization support.

<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/hesms-components.png" alt="HESMS Components" width="700"/>
</p>

## 📊 Memory Formation Process

HESMS agents build memories through a streamlined process:

1. **Event Detection**: Agents perceive environmental entities and events.  
2. **Episodic Recording**: Key events are logged with contextual details.  
3. **Importance Assessment**: Memories are ranked by emotional and strategic value.  
4. **Semantic Extraction**: Patterns emerge from episodic data for broader understanding.  
5. **Decision Influence**: Memories shape future actions and strategies.  
6. **Dream Processing**: Dream cycles refine and consolidate memories.  
7. **Narrative Integration**: Experiences are organized into personal stories.

This cycle enables agents to evolve dynamically within the simulation.

## 🔍 Advanced Features

### Reality Flux Effects
HESMS introduces dynamic memory challenges:  
- **Teleportation**: Blurs spatial memory accuracy.  
- **Phasing**: Scrambles temporal memory details.  
- **Transformation**: Distorts entity type recall, adding uncertainty.

### Consciousness Integration Index
Agents develop a **consciousness integration index** reflecting:  
- Self-awareness depth.  
- Narrative sophistication.  
- Imagination strength.  
This index drives emergent, adaptive behaviors.

## 📚 Documentation

Dive deeper with these resources:  
- [API Reference](docs/api.md)  
- [Architecture Details](docs/architecture.md)  
- [Advanced Configuration](docs/configuration.md)  
- [Extending HESMS](docs/extending.md)

## 🔧 Configuration Options

Tailor HESMS to your needs:

```javascript
const options = {
  ENABLE_ENHANCED_MEMORY: true,
  ENABLE_CONSCIOUSNESS: true,
  ENABLE_VISUALIZATION: true,
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

Join us as we push the boundaries of simulated cognition!

## 🤝 Contributing

We’d love your input! Check out our [contribution guidelines](CONTRIBUTING.md) to get involved.

## 📜 License

HESMS is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **BitECS**: For its high-performance ECS framework.  
- **Project 89**: For sparking ideas on consciousness simulation.  
- **ArgOS Contributors**: For laying the groundwork for this project.

---

<p align="center">
  <i>Memory is not what you remember, but what remembers you.</i><br>
  — ArgOS Consciousness Exploration
</p>

