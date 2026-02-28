🌌 Celestial Void – 3D Obsidian-Style Knowledge Graph

Celestial Void is an interactive 3D knowledge graph inspired by Obsidian’s graph view, but rendered in real-time 3D space.
It visualizes thousands of interconnected nodes as clusters floating inside a spherical universe.
Think of it as a living constellation of ideas 

 Features
 2500+ dynamic nodes with realistic clustering
 Color coded knowledge clusters
 Outer halo + dense inner core structure
 Hover to highlight connections

🖱️ Click any node to:
Focus the camera
Open a detailed side panel

🧊 Glassmorphism UI with dark-mode aesthetics
⚡ Runs fully in the browser (no backend)
🛠️ Tech Stack / What I Used
HTML5 – App structure
CSS3 – Dark UI, glass panels, animations
JavaScript (Vanilla)  Logic & interactions
3d-force-graph  WebGL-based 3D force directed graph
Three.js (under the hood) GPU-accelerated rendering
No frameworks. No build tools. Just clean web tech.

📁 Project Structure
/
├── index.html   → Main HTML entry
├── style.css    → UI styling & animations
└── main.js      → Graph logic, physics & interactions
⚙️ How It Works (Simple Explanation)

1️⃣ Graph Data Generation
Nodes are generated programmatically (2500 total)
Each node has:
id, name
group (cluster)
color
description
size (val)
Nodes are classified as:
Inner core nodes
Outer shell nodes
Hub nodes (highly connected)

2️⃣ Cluster Logic
Nodes mostly connect to others within the same color group
This naturally forms distinct knowledge clusters
Hub nodes create dense local networks

3️⃣ 3D Physics Simulation
Inner nodes are pulled closer together
Outer nodes are gently pushed to a fixed spherical radius
Custom forces keep:
The core compact
The halo floating evenly
This creates the “obsidian-style galaxy” effect

4️⃣ Interaction System
Hover → Highlights connected links
click node →
Camera smoothly zooms in
Side panel opens with node details
Click background → Closes the panel

5️⃣ UI & Experience
Title overlay stays non-interactive
Glassmorphic details panel slides in/out
Loading screen adds cinematic feel
Fully responsive (mobile supported)

▶️ How to Run
Just open index.html in your browser.
That’s it.
No install. No server. No setup.

💡 Inspiration
Inspired by:
Obsidian’s graph view
Knowledge mapping
Neural networks
Space & cosmic visualization
Built as an experiment to explore how ideas can live in 3D space.

🧪 Possible Future Improvements
Real Obsidian .md file import
Search & filter nodes
Pin / lock nodes
Save camera states
VR / WebXR support 👀
