import React, { useState, useEffect, useRef } from 'react';
import { X, Network, RotateCw, Play, Pause, ExternalLink, Sparkles, Filter, Search, Tag, Eye } from 'lucide-react';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import { api } from '../services/api';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  details?: any;
  x?: number;
  y?: number;
  z?: number;
}

interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
}

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTag?: (tag: string) => void;
}

export const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  isOpen,
  onClose,
  onSelectTag,
}) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const graphContainerRef = useRef<HTMLDivElement>(null);
  const graphInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchGraphData();
    } else {
      if (graphInstanceRef.current) {
        graphInstanceRef.current._destructor?.();
        graphInstanceRef.current = null;
      }
    }
  }, [isOpen]);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const res = await api.getKnowledgeGraph();
      if (res.nodes) {
        setNodes(res.nodes || []);
        setEdges(res.edges || []);
      }
    } catch (err: any) {
      console.warn('Failed to load knowledge graph:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Color mapping helper
  const getNodeColorHex = (type: string) => {
    switch (type) {
      case 'youtube': return '#f43f5e';  // Vibrant Rose
      case 'twitter': return '#38bdf8';  // Sky Blue
      case 'document': return '#fbbf24'; // Amber Gold
      case 'link': return '#34d399';     // Emerald Green
      case 'tag': return '#c084fc';      // Neon Purple
      default: return '#818cf8';         // Indigo
    }
  };

  // Initialize and update 3D Force Graph
  useEffect(() => {
    if (!isOpen || loading || !graphContainerRef.current) return;

    // Filter nodes and edges
    const q = searchQuery.toLowerCase().trim();
    const filteredNodes = nodes.filter((n) => {
      if (filterType !== 'all' && n.type !== filterType) return false;
      if (q && !n.label.toLowerCase().includes(q)) return false;
      return true;
    });

    const nodeSet = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = edges.filter((e) => {
      const srcId = typeof e.source === 'object' ? (e.source as any).id : e.source;
      const tgtId = typeof e.target === 'object' ? (e.target as any).id : e.target;
      return nodeSet.has(srcId) && nodeSet.has(tgtId);
    });

    const graphData = {
      nodes: JSON.parse(JSON.stringify(filteredNodes)),
      links: JSON.parse(JSON.stringify(filteredEdges)),
    };

    if (!graphInstanceRef.current) {
      const container = graphContainerRef.current;
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 550;

      const graph = (ForceGraph3D as any)({ controlType: 'orbit' })(container)
        .width(width)
        .height(height)
        .backgroundColor('#020617') // Slate 950 deep space background
        .showNavInfo(false)
        .nodeRelSize(7)
        .nodeVal((node: any) => (node.type === 'tag' ? 5 : 8))
        .nodeColor((node: any) => getNodeColorHex(node.type))
        .nodeThreeObject((node: any) => {
          // Custom 3D Glowing Sphere with 3D Canvas Label
          const group = new THREE.Group();

          // 3D Sphere geometry
          const colorHex = getNodeColorHex(node.type);
          const size = node.type === 'tag' ? 6 : 9;

          const sphereGeo = new THREE.SphereGeometry(size, 24, 24);
          const sphereMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colorHex),
            emissive: new THREE.Color(colorHex),
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.8,
          });
          const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
          group.add(sphereMesh);

          // Glowing Outer Halo Sprite
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, colorHex);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);
          }
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
          });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.scale.set(size * 3.5, size * 3.5, 1);
          group.add(sprite);

          // Floating 3D Text Label
          const textCanvas = document.createElement('canvas');
          textCanvas.width = 256;
          textCanvas.height = 64;
          const textCtx = textCanvas.getContext('2d');
          if (textCtx) {
            textCtx.fillStyle = '#ffffff';
            textCtx.font = 'Bold 22px Inter, sans-serif';
            textCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            textCtx.shadowBlur = 6;
            textCtx.textAlign = 'center';
            const displayLabel = node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label;
            textCtx.fillText(displayLabel, 128, 40);
          }
          const textTexture = new THREE.CanvasTexture(textCanvas);
          const textSpriteMat = new THREE.SpriteMaterial({
            map: textTexture,
            transparent: true,
          });
          const textSprite = new THREE.Sprite(textSpriteMat);
          textSprite.scale.set(40, 10, 1);
          textSprite.position.set(0, -size - 8, 0);
          group.add(textSprite);

          return group;
        })
        .linkWidth(1.5)
        .linkColor(() => 'rgba(148, 163, 184, 0.35)') // Slate 400 link translucent
        .linkDirectionalParticles(3)
        .linkDirectionalParticleWidth(2.5)
        .linkDirectionalParticleSpeed(0.006)
        .linkDirectionalParticleColor((link: any) => {
          const targetNode = typeof link.target === 'object' ? link.target : null;
          return targetNode ? getNodeColorHex(targetNode.type) : '#c084fc';
        })
        .onNodeClick((node: any) => {
          setSelectedNode(node);

          // Smooth 3D Camera Focus
          const distance = 120;
          const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
          graph.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
            node, // lookAt
            1200  // transition duration ms
          );
        });

      // Ambient & Directional Lighting for 3D Shading
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      const directionalLight = new THREE.DirectionalLight(0xa855f7, 1.2);
      directionalLight.position.set(100, 100, 100);
      graph.scene().add(ambientLight);
      graph.scene().add(directionalLight);

      graphInstanceRef.current = graph;
    }

    // Update Graph Data
    graphInstanceRef.current.graphData(graphData);

    // Auto-rotation control
    let angle = 0;
    const interval = setInterval(() => {
      if (isAutoRotating && graphInstanceRef.current && !selectedNode) {
        angle += 0.003;
        const distance = 300;
        graphInstanceRef.current.cameraPosition({
          x: distance * Math.sin(angle),
          z: distance * Math.cos(angle),
        });
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isOpen, loading, nodes, edges, filterType, searchQuery, isAutoRotating, selectedNode]);

  // Handle Container Auto-Resize
  useEffect(() => {
    if (!isOpen || loading) return;

    const handleResize = () => {
      if (graphInstanceRef.current && graphContainerRef.current) {
        const w = graphContainerRef.current.clientWidth || 800;
        const h = graphContainerRef.current.clientHeight || 550;
        if (w > 0 && h > 0) {
          graphInstanceRef.current.width(w);
          graphInstanceRef.current.height(h);
        }
      }
    };

    // Immediate and delayed resize check to ensure parent container dimensions are populated
    handleResize();
    const timer = setTimeout(handleResize, 150);

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-[88vh] bg-slate-900 border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Network className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>3D Knowledge Graph Mind Map</span>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60">
                  {nodes.length} Nodes &bull; {edges.length} Links
                </span>
              </h2>
              <p className="text-xs text-slate-400">Interactive 3D WebGL network visualization with particle flows</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (graphInstanceRef.current) {
                  graphInstanceRef.current.cameraPosition({ x: 0, y: 0, z: 300 }, { x: 0, y: 0, z: 0 }, 1000);
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              title="Reset 3D Camera View"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 text-xs shrink-0">
          {/* Search Node Bar */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 3D nodes..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Filter Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['all', 'document', 'youtube', 'twitter', 'link', 'tag'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* 3D Auto-Rotate Toggle */}
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium border text-xs transition-all ${
              isAutoRotating
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-purple-400" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoRotating ? '3D Auto-Rotate: ON' : '3D Auto-Rotate: OFF'}</span>
          </button>
        </div>

        {/* Graph Canvas & Side Inspector Split */}
        <div className="flex-1 relative flex overflow-hidden">
          {/* WebGL 3D Canvas Container */}
          <div 
            ref={graphContainerRef}
            className="flex-1 bg-slate-950 relative overflow-hidden"
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 text-slate-400 gap-3">
                <Sparkles className="w-8 h-8 animate-spin text-purple-400" />
                <span className="text-sm font-semibold">Initializing 3D WebGL Graph Environment...</span>
              </div>
            )}

            {!loading && nodes.length === 0 && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-slate-500">
                <Network className="w-12 h-12 mb-3 opacity-30 text-purple-400" />
                <p className="text-sm font-semibold text-slate-300">No knowledge nodes found</p>
                <p className="text-xs text-slate-500 mt-1">Save cards or tags to build your 3D knowledge universe.</p>
              </div>
            )}
          </div>

          {/* Side Inspector Panel */}
          {selectedNode && (
            <div className="w-80 bg-slate-900/95 border-l border-slate-800 p-5 overflow-y-auto flex flex-col justify-between backdrop-blur-md animate-slide-in shrink-0">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                    <Eye className="w-3 h-3 text-purple-400" />
                    {selectedNode.type} Node
                  </span>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-2 break-words leading-snug">
                  {selectedNode.label}
                </h3>

                {selectedNode.details?.textSnippet && (
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Content Snippet
                    </span>
                    <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 leading-relaxed font-sans">
                      &quot;{selectedNode.details.textSnippet}...&quot;
                    </p>
                  </div>
                )}

                {selectedNode.details?.link && (
                  <a
                    href={selectedNode.details.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium mb-4 hover:underline"
                  >
                    <span>Open Web Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {selectedNode.details?.tags && selectedNode.details.tags.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Connected Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.details.tags.map((t: string) => (
                        <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedNode.type === 'tag' && onSelectTag && (
                <button
                  onClick={() => {
                    onSelectTag(selectedNode.label.replace(/^#/, ''));
                    onClose();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                >
                  Filter Dashboard by #{selectedNode.label.replace(/^#/, '')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-2 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-4">
            <span>🖱️ Left-click & Drag: Rotate 3D Space</span>
            <span>Right-click & Drag: Pan</span>
            <span>Scroll: Zoom In/Out</span>
          </div>
          <div>Second Brain 3D WebGL Engine</div>
        </div>
      </div>
    </div>
  );
};
