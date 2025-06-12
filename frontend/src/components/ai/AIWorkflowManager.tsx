'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BoltIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'analysis' | 'generation' | 'review' | 'approval' | 'notification';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  result?: any;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'content-creation' | 'quality-assurance' | 'optimization' | 'collaboration';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  steps: WorkflowStep[];
  progress: number;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
  isAutomated: boolean;
}

interface AIWorkflowManagerProps {
  workflows: Workflow[];
  onWorkflowUpdate: (workflows: Workflow[]) => void;
  onWorkflowComplete: (workflow: Workflow) => void;
}

export function AIWorkflowManager({ workflows, onWorkflowUpdate, onWorkflowComplete }: AIWorkflowManagerProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowCategory, setNewWorkflowCategory] = useState<Workflow['category']>('content-creation');

  // Mock workflows for demonstration
  const mockWorkflows: Workflow[] = [
    {
      id: 'wf-1',
      name: 'Content Quality Assurance',
      description: 'Automated workflow for comprehensive content quality checks',
      category: 'quality-assurance',
      status: 'active',
      progress: 75,
      createdAt: '2024-12-01',
      lastRun: '2024-12-05 14:30',
      nextRun: '2024-12-06 09:00',
      isAutomated: true,
      steps: [
        {
          id: 'step-1',
          name: 'Content Analysis',
          description: 'Analyze content for clarity, structure, and readability',
          type: 'analysis',
          status: 'completed',
          duration: 45
        },
        {
          id: 'step-2',
          name: 'SEO Optimization Check',
          description: 'Verify SEO best practices and optimization',
          type: 'analysis',
          status: 'completed',
          duration: 30
        },
        {
          id: 'step-3',
          name: 'Generate Improvement Suggestions',
          description: 'AI-powered suggestions for content enhancement',
          type: 'generation',
          status: 'running',
          duration: 60
        },
        {
          id: 'step-4',
          name: 'Review and Approval',
          description: 'Human review of AI suggestions',
          type: 'review',
          status: 'pending'
        }
      ]
    },
    {
      id: 'wf-2',
      name: 'New Article Creation',
      description: 'End-to-end workflow for creating new knowledge base articles',
      category: 'content-creation',
      status: 'draft',
      progress: 0,
      createdAt: '2024-12-05',
      isAutomated: false,
      steps: [
        {
          id: 'step-1',
          name: 'Topic Research',
          description: 'Research and validate article topic',
          type: 'analysis',
          status: 'pending'
        },
        {
          id: 'step-2',
          name: 'Content Generation',
          description: 'Generate initial article content using AI',
          type: 'generation',
          status: 'pending'
        },
        {
          id: 'step-3',
          name: 'Content Review',
          description: 'Review and refine generated content',
          type: 'review',
          status: 'pending'
        },
        {
          id: 'step-4',
          name: 'Final Approval',
          description: 'Final approval and publication',
          type: 'approval',
          status: 'pending'
        }
      ]
    },
    {
      id: 'wf-3',
      name: 'Performance Optimization',
      description: 'Optimize existing content based on performance metrics',
      category: 'optimization',
      status: 'completed',
      progress: 100,
      createdAt: '2024-11-28',
      lastRun: '2024-12-04 16:45',
      isAutomated: true,
      steps: [
        {
          id: 'step-1',
          name: 'Performance Analysis',
          description: 'Analyze content performance metrics',
          type: 'analysis',
          status: 'completed',
          duration: 25
        },
        {
          id: 'step-2',
          name: 'Optimization Recommendations',
          description: 'Generate optimization recommendations',
          type: 'generation',
          status: 'completed',
          duration: 40
        },
        {
          id: 'step-3',
          name: 'Apply Optimizations',
          description: 'Implement approved optimizations',
          type: 'review',
          status: 'completed',
          duration: 35
        }
      ]
    }
  ];

  React.useEffect(() => {
    if (workflows.length === 0) {
      onWorkflowUpdate(mockWorkflows);
    }
  }, [workflows.length, onWorkflowUpdate]);

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'running':
        return <ClockIcon className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRunWorkflow = (workflow: Workflow) => {
    const updatedWorkflow = { ...workflow, status: 'active' as const };
    const updatedWorkflows = workflows.map(w => w.id === workflow.id ? updatedWorkflow : w);
    onWorkflowUpdate(updatedWorkflows);

    // Simulate workflow execution
    setTimeout(() => {
      const completedWorkflow = { ...updatedWorkflow, status: 'completed' as const, progress: 100 };
      const finalWorkflows = workflows.map(w => w.id === workflow.id ? completedWorkflow : w);
      onWorkflowUpdate(finalWorkflows);
      onWorkflowComplete(completedWorkflow);
    }, 3000);
  };

  const handleCreateWorkflow = () => {
    if (!newWorkflowName.trim()) return;

    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: newWorkflowName,
      description: `Custom workflow for ${newWorkflowCategory}`,
      category: newWorkflowCategory,
      status: 'draft',
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isAutomated: false,
      steps: [
        {
          id: 'step-1',
          name: 'Initial Analysis',
          description: 'Analyze current state and requirements',
          type: 'analysis',
          status: 'pending'
        },
        {
          id: 'step-2',
          name: 'Process Execution',
          description: 'Execute main workflow process',
          type: 'generation',
          status: 'pending'
        },
        {
          id: 'step-3',
          name: 'Review and Finalize',
          description: 'Review results and finalize',
          type: 'review',
          status: 'pending'
        }
      ]
    };

    onWorkflowUpdate([...workflows, newWorkflow]);
    setNewWorkflowName('');
    setIsCreatingWorkflow(false);
  };

  return (
    <div className="space-y-6">
      {/* Workflow Manager Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BoltIcon className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Workflow Manager</h3>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreatingWorkflow(true)}
              className="flex items-center space-x-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Create Workflow</span>
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Automate and optimize your content workflows with AI-powered processes
          </p>
        </CardHeader>
        <CardContent>
          {/* Workflow Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {workflows.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Workflows</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {workflows.filter(w => w.status === 'active').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {workflows.filter(w => w.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {workflows.filter(w => w.isAutomated).length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Automated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Workflow Modal */}
      {isCreatingWorkflow && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Workflow</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Enter workflow name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newWorkflowCategory}
                  onChange={(e) => setNewWorkflowCategory(e.target.value as Workflow['category'])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="content-creation">Content Creation</option>
                  <option value="quality-assurance">Quality Assurance</option>
                  <option value="optimization">Optimization</option>
                  <option value="collaboration">Collaboration</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateWorkflow} disabled={!newWorkflowName.trim()}>
                  Create Workflow
                </Button>
                <Button variant="outline" onClick={() => setIsCreatingWorkflow(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflows List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{workflow.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                  {workflow.isAutomated && (
                    <Cog6ToothIcon className="h-4 w-4 text-blue-500" title="Automated" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-gray-900 dark:text-white">{workflow.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${workflow.progress}%` }}
                  />
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-2 mb-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white">Steps</h5>
                {workflow.steps.slice(0, 3).map((step) => (
                  <div key={step.id} className="flex items-center space-x-2 text-sm">
                    {getStatusIcon(step.status)}
                    <span className="text-gray-700 dark:text-gray-300">{step.name}</span>
                    {step.duration && (
                      <span className="text-xs text-gray-500">({step.duration}s)</span>
                    )}
                  </div>
                ))}
                {workflow.steps.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{workflow.steps.length - 3} more steps
                  </div>
                )}
              </div>

              {/* Workflow Actions */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {workflow.lastRun && `Last run: ${workflow.lastRun}`}
                  {workflow.nextRun && ` • Next: ${workflow.nextRun}`}
                </div>
                <div className="flex space-x-2">
                  {workflow.status === 'draft' || workflow.status === 'paused' ? (
                    <Button
                      size="sm"
                      onClick={() => handleRunWorkflow(workflow)}
                      className="flex items-center space-x-1"
                    >
                      <PlayIcon className="h-3 w-3" />
                      <span>Run</span>
                    </Button>
                  ) : workflow.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      <PauseIcon className="h-3 w-3" />
                      <span>Pause</span>
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedWorkflow.name} - Details
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedWorkflow(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedWorkflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {index + 1}. {step.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    {step.duration && (
                      <p className="text-xs text-gray-500 mt-1">Duration: {step.duration} seconds</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
