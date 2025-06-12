'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, ServerIcon, ComputerDesktopIcon, CpuChipIcon, CloudIcon, CircleStackIcon, LinkIcon } from '@heroicons/react/24/outline';

interface ComponentStatus {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  lastChecked: string;
  connections: string[];
}

interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'service' | 'external' | 'database';
  description: string;
  position: { x: number; y: number };
  status: ComponentStatus;
  icon: 'server' | 'desktop' | 'cpu' | 'cloud' | 'database' | 'link';
}

const mockComponents: ArchitectureComponent[] = [
  {
    id: 'frontend',
    name: 'Next.js Frontend',
    type: 'frontend',
    description: 'React-based frontend with TypeScript and Tailwind CSS',
    position: { x: 100, y: 100 },
    status: {
      id: 'frontend',
      name: 'Next.js Frontend',
      status: 'healthy',
      uptime: '99.9%',
      lastChecked: new Date().toLocaleTimeString(),
      connections: ['backend-api']
    },
    icon: 'desktop'
  },
  {
    id: 'backend-api',
    name: 'Express.js API',
    type: 'backend',
    description: 'Node.js backend API with Express framework',
    position: { x: 400, y: 100 },
    status: {
      id: 'backend-api',
      name: 'Express.js API',
      status: 'healthy',
      uptime: '99.8%',
      lastChecked: new Date().toLocaleTimeString(),
      connections: ['rules-engine', 'ai-service']
    },
    icon: 'server'
  },
  {
    id: 'rules-engine',
    name: 'Rules Engine',
    type: 'service',
    description: 'Content auditing and rules execution service',
    position: { x: 700, y: 50 },
    status: {
      id: 'rules-engine',
      name: 'Rules Engine',
      status: 'healthy',
      uptime: '99.7%',
      lastChecked: new Date().toLocaleTimeString(),
      connections: ['ai-service']
    },
    icon: 'cpu'
  },
  {
    id: 'ai-service',
    name: 'AI Service',
    type: 'service',
    description: 'Google Gemini AI integration for content suggestions',
    position: { x: 700, y: 150 },
    status: {
      id: 'ai-service',
      name: 'AI Service',
      status: 'warning',
      uptime: '98.5%',
      lastChecked: new Date().toLocaleTimeString(),
      connections: ['gemini-api']
    },
    icon: 'cpu'
  },
  {
    id: 'articles-db',
    name: 'Articles Store',
    type: 'database',
    description: 'Knowledge base articles storage',
    position: { x: 400, y: 250 },
    status: {
      id: 'articles-db',
      name: 'Articles Store',
      status: 'healthy',
      uptime: '100%',
      lastChecked: new Date().toLocaleTimeString(),
      connections: []
    },
    icon: 'database'
  },
  {
    id: 'gemini-api',
    name: 'Google Gemini',
    type: 'external',
    description: 'External AI API for content analysis',
    position: { x: 1000, y: 150 },
    status: {
      id: 'gemini-api',
      name: 'Google Gemini',
      status: 'healthy',
      uptime: '99.9%',
      lastChecked: new Date().toLocaleTimeString(),
      connections: []
    },
    icon: 'cloud'
  }
];

const iconMap = {
  server: ServerIcon,
  desktop: ComputerDesktopIcon,
  cpu: CpuChipIcon,
  cloud: CloudIcon,
  database: CircleStackIcon,
  link: LinkIcon
};

const statusColors = {
  healthy: 'text-green-500 bg-green-50 border-green-200',
  warning: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  error: 'text-red-500 bg-red-50 border-red-200'
};

const statusIcons = {
  healthy: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: ExclamationTriangleIcon
};

export default function ArchitectureDiagram() {
  const [components, setComponents] = useState<ArchitectureComponent[]>(mockComponents);
  const [selectedComponent, setSelectedComponent] = useState<ArchitectureComponent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setComponents(prev => prev.map(comp => ({
        ...comp,
        status: {
          ...comp.status,
          lastChecked: new Date().toLocaleTimeString(),
          // Randomly change AI service status to simulate real-time updates
          ...(comp.id === 'ai-service' && Math.random() > 0.7 ? {
            status: Math.random() > 0.5 ? 'healthy' : 'warning' as 'healthy' | 'warning'
          } : {})
        }
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleComponentClick = (component: ArchitectureComponent) => {
    setSelectedComponent(component);
    setShowDetails(true);
  };

  const getConnections = (componentId: string) => {
    const component = components.find(c => c.id === componentId);
    return component?.status.connections || [];
  };

  const renderConnection = (fromId: string, toId: string) => {
    const from = components.find(c => c.id === fromId);
    const to = components.find(c => c.id === toId);
    
    if (!from || !to) return null;

    const isHighlighted = hoveredComponent === fromId || hoveredComponent === toId;
    
    return (
      <line
        key={`${fromId}-${toId}`}
        x1={from.position.x + 50}
        y1={from.position.y + 50}
        x2={to.position.x + 50}
        y2={to.position.y + 50}
        stroke={isHighlighted ? '#3B82F6' : '#E5E7EB'}
        strokeWidth={isHighlighted ? 3 : 2}
        strokeDasharray={isHighlighted ? '0' : '5,5'}
        className="transition-all duration-300"
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Architecture</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Healthy</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Error</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <svg 
          width="1200" 
          height="400" 
          className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
          viewBox="0 0 1200 400"
        >
          {/* Render connections */}
          {components.map(component => 
            component.status.connections.map(connectionId =>
              renderConnection(component.id, connectionId)
            )
          )}
          
          {/* Render components */}
          {components.map((component) => {
            const IconComponent = iconMap[component.icon];
            const StatusIcon = statusIcons[component.status.status];
            
            return (
              <g key={component.id}>
                <rect
                  x={component.position.x}
                  y={component.position.y}
                  width="100"
                  height="100"
                  rx="8"
                  className={`cursor-pointer transition-all duration-300 ${
                    statusColors[component.status.status]
                  } ${hoveredComponent === component.id ? 'shadow-lg scale-105' : 'hover:shadow-md'}`}
                  style={{
                    filter: hoveredComponent === component.id ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' : 'none'
                  }}
                  onClick={() => handleComponentClick(component)}
                  onMouseEnter={() => setHoveredComponent(component.id)}
                  onMouseLeave={() => setHoveredComponent(null)}
                />
                
                {/* Component Icon */}
                <foreignObject
                  x={component.position.x + 30}
                  y={component.position.y + 20}
                  width="40"
                  height="40"
                >
                  <IconComponent className={`w-10 h-10 ${statusColors[component.status.status].split(' ')[0]}`} />
                </foreignObject>
                
                {/* Status Icon */}
                <foreignObject
                  x={component.position.x + 75}
                  y={component.position.y + 5}
                  width="20"
                  height="20"
                >
                  <StatusIcon className={`w-5 h-5 ${statusColors[component.status.status].split(' ')[0]}`} />
                </foreignObject>
                
                {/* Component Name */}
                <text
                  x={component.position.x + 50}
                  y={component.position.y + 85}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {component.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Component Details Modal */}
      {showDetails && selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedComponent.name}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-600">{selectedComponent.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedComponent.status.status]}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    selectedComponent.status.status === 'healthy' ? 'bg-green-500' :
                    selectedComponent.status.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  {selectedComponent.status.status.charAt(0).toUpperCase() + selectedComponent.status.status.slice(1)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Uptime</label>
                <p className="text-sm text-gray-600">{selectedComponent.status.uptime}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Checked</label>
                <p className="text-sm text-gray-600">{selectedComponent.status.lastChecked}</p>
              </div>
              
              {selectedComponent.status.connections.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Connected To</label>
                  <div className="space-y-1">
                    {selectedComponent.status.connections.map(connectionId => {
                      const connectedComponent = components.find(c => c.id === connectionId);
                      return (
                        <div key={connectionId} className="text-sm text-blue-600">
                          {connectedComponent?.name || connectionId}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}