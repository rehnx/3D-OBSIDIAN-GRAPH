// Configuration
const NUM_NODES = 2500;
const GROUPS = 5;
// Colors matching the user's provided spherical image
const groupColors = [
    '#ff1a1a', // 0: Deep Red
    '#39ff14', // 1: Neon Green
    '#add8e6', // 2: Light Blue / Cyan
    '#ffb6c1', // 3: Pink
    '#6b7280'  // 4: Dim gray/slate
];
const clusterNames = [
    "Alpha Centauri",
    "Beta Sirius",
    "Gamma Orionis",
    "Delta Lyrae",
    "Epsilon Cassiopeiae"
];
// Lorem Ipsum Generator
function generateLoremIpsum() {
    const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
    Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?`;
    // Randomize length slightly for variety
    const paragraphs = text.split('\n\n');
    const numParagraphs = Math.floor(Math.random() * 3) + 1;
    return paragraphs.slice(0, numParagraphs).join('\n\n');
}
// Generate Data
function generateGraphData() {
    const nodes = [];
    const links = [];
    // Create Nodes
    for (let i = 0; i < NUM_NODES; i++) {
        let group;
        let rand = Math.random();
        // Distribution of colors roughly matching the image
        if (rand < 0.2) group = 0; // Red
        else if (rand < 0.4) group = 1; // Green
        else if (rand < 0.6) group = 2; // Blue
        else if (rand < 0.7) group = 3; // Pink
        else group = 4; // Grey

        // 25% of nodes form the sparse "outer spherical shell"
        const isOuter = Math.random() < 0.25;
        const isHub = !isOuter && Math.random() < 0.02; // Hubs are only in the inner core

        let val = 0.2 + Math.random() * 0.3; // Base size
        if (isOuter) val = 0.15; // Tiny outer stars
        else if (isHub) val = 1.5 + Math.random() * 1.5; // Large hubs

        nodes.push({
            id: `node_${i}`,
            name: `Data Node ${i + 1}`,
            group: group,
            color: groupColors[group],
            clusterName: clusterNames[group],
            description: generateLoremIpsum(),
            val: val,
            isHub: isHub,
            isOuter: isOuter
        });
    }
    // Create Links (Edges)
    nodes.forEach((node) => {
        // Outer nodes have very few links to keep them floating around the edges
        const numLinks = node.isOuter ? (Math.random() < 0.8 ? 0 : 1) :
            node.isHub ? Math.floor(Math.random() * 10) + 5 :
                (Math.random() < 0.7 ? 1 : 2);

        for (let j = 0; j < numLinks; j++) {
            let targetNode;
            // 85% chance to connect to a node of the SAME color to form distinct color clusters
            if (!node.isOuter && Math.random() < 0.85) {
                const sameGroupNodes = nodes.filter(n => n.group === node.group && !n.isOuter);
                targetNode = sameGroupNodes[Math.floor(Math.random() * sameGroupNodes.length)];
            } else {
                targetNode = nodes[Math.floor(Math.random() * nodes.length)];
            }

            if (targetNode && targetNode.id !== node.id) {
                links.push({
                    source: node.id,
                    target: targetNode.id
                });
            }
        }
    });
    return { nodes, links };
}
// Application State
let highlightedNode = null;
let highlightedLinks = new Set();
let hoverNode = null;
let Graph;

// Initialize Graph
function initGraph() {
    const data = generateGraphData();
    const elem = document.getElementById('graph-container');
    Graph = ForceGraph3D()(elem)
        .graphData(data)
        .nodeColor('color')
        .nodeVal('val')
        .nodeLabel('name')
        .nodeOpacity(1)
        .linkColor(() => 'rgba(255,255,255,0.06)')
        .linkWidth(link => highlightedLinks.has(link) ? 1.5 : 0.15)
        .linkDirectionalParticles(link => highlightedLinks.has(link) ? 3 : 0)
        .linkDirectionalParticleWidth(2)
        .onNodeHover(node => {
            // Update hover state
            hoverNode = node;
            // Optional: Show connections on hover
            if ((!node && !highlightedLinks.size) || (node && hoverNode === node)) return;
            highlightedLinks.clear();
            if (node) {
                // Find all links connected to this node
                data.links.forEach(link => {
                    if (link.source.id === node.id || link.target.id === node.id) {
                        highlightedLinks.add(link);
                    }
                });
            }
            // Trigger update
            Graph.linkWidth(Graph.linkWidth())
                .linkDirectionalParticles(Graph.linkDirectionalParticles());
        })
        .onNodeClick(node => {
            openDetailsPanel(node);
            // Aim at node from outside it
            const distance = 100;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
            Graph.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
        })
        .onBackgroundClick(() => {
            closeDetailsPanel();
        });

    // Custom Physics to create Outer Shell and Inner Clusters
    Graph.d3Force('charge').strength(node => node.isOuter ? -1 : -8); // Core nodes repel slightly more to form structure
    Graph.d3Force('link').distance(node => node.isOuter ? 100 : 15); // Core clusters pull tight together

    // Custom tick function to gently enforce a spherical outer shell over time
    Graph.onEngineTick(() => {
        const nodes = Graph.graphData().nodes;
        nodes.forEach(node => {
            if (node.isOuter) {
                const targetRadius = 400; // The radius of the outer spherical halo
                // Calculate current distance from center (0,0,0)
                const dist = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z) || 1;
                // Gently push the node towards the target radius
                const force = (targetRadius - dist) * 0.02;
                node.vx += (node.x / dist) * force;
                node.vy += (node.y / dist) * force;
                node.vz += (node.z / dist) * force;
            } else {
                // Keep inner core slightly bounded so it doesn't fly out of the sphere
                const dist = Math.sqrt(node.x * node.x + node.y * node.y + node.z * node.z);
                if (dist > 300) {
                    node.vx -= (node.x / dist) * 0.5;
                    node.vy -= (node.y / dist) * 0.5;
                    node.vz -= (node.z / dist) * 0.5;
                }
            }
        });
    });
    // Handle Window Resize
    window.addEventListener('resize', () => {
        Graph.width(window.innerWidth);
        Graph.height(window.innerHeight);
    });
    // Hide Loading Overlay after init
    setTimeout(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
    }, 1500); // Artificial delay to ensure canvas is ready and add drama
}
// UI Panel Logic
const detailsPanel = document.getElementById('details-panel');
const closeBtn = document.getElementById('close-panel');
const titleEl = document.getElementById('node-title');
const metaEl = document.getElementById('node-meta');
const descEl = document.getElementById('node-description');
const colorIndicator = document.getElementById('node-color-indicator');
function openDetailsPanel(node) {
    if (!node) return;
    highlightedNode = node;
    // Populate Data
    titleEl.textContent = node.name;
    metaEl.textContent = `Cluster: ${node.clusterName} | Connections: ${getLinkCount(node.id)}`;
    // Format Lorem Ipsum (replace newlines with <br><br>)
    descEl.innerHTML = node.description.replace(/\n\n/g, '<br><br>');
    // Update color indicator
    colorIndicator.style.backgroundColor = node.color;
    colorIndicator.style.boxShadow = `0 0 10px ${node.color}`;
    // Show Panel
    detailsPanel.classList.remove('hidden');
}
function closeDetailsPanel() {
    highlightedNode = null;
    detailsPanel.classList.add('hidden');
}
function getLinkCount(nodeId) {
    if (!Graph) return 0;
    const { links } = Graph.graphData();
    return links.filter(l => l.source.id === nodeId || l.target.id === nodeId).length;
}
closeBtn.addEventListener('click', closeDetailsPanel);
// Initialize after DOM is fully loaded
window.addEventListener('scroll', (e) => e.preventDefault(), { passive: false });

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGraph);
} else {
    initGraph();
}
