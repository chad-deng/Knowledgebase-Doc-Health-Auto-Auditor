'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { 
  PlayIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function SystemFlowPage() {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const flowDemos = [
    {
      id: 'onboarding',
      title: 'System Onboarding Tutorial',
      description: 'Complete walkthrough of the Knowledge Base Auditor platform',
      totalDuration: 300,
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to Knowledge Base Auditor',
          description: 'Overview of the platform and its capabilities',
          action: 'View main dashboard and key metrics',
          duration: 30
        },
        {
          id: 'navigation',
          title: 'Platform Navigation',
          description: 'Learn how to navigate between different sections',
          action: 'Explore navigation menu and page structure',
          duration: 20
        }
      ]
    },
    {
      id: 'audit-workflow',
      title: 'Complete Audit Workflow',
      description: 'End-to-end process of auditing knowledge base content',
      totalDuration: 180,
      steps: [
        {
          id: 'preparation',
          title: 'Audit Preparation',
          description: 'Setting up for an effective audit session',
          action: 'Review audit rules and select target content',
          duration: 30
        }
      ]
    }
  ];

  const currentDemo = selectedDemo ? flowDemos.find(d => d.id === selectedDemo) : null;

  if (!selectedDemo) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <EyeIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">System Flow Demonstrations</h1>
            </div>
            <p className="text-gray-600">
              Interactive tutorials and walkthroughs to help you master the Knowledge Base Auditor platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flowDemos.map((demo) => (
              <Card key={demo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <h3 className="text-xl font-semibold text-gray-900">{demo.title}</h3>
                  <p className="text-gray-600 text-sm">{demo.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                      {demo.steps.length} steps • {Math.floor(demo.totalDuration / 60)}:{(demo.totalDuration % 60).toString().padStart(2, '0')}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => setSelectedDemo(demo.id)}
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">How to Use System Flow Demos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <PlayIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">Choose Your Path</h3>
                <p className="text-sm text-gray-600">Select a demo that matches your learning goals.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <EyeIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Follow Along</h3>
                <p className="text-sm text-gray-600">Watch the interactive demonstration.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Practice & Master</h3>
                <p className="text-sm text-gray-600">Apply what you've learned.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedDemo(null)}
            className="mb-4"
          >
            ← Back to Demos
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentDemo?.title}</h1>
          <p className="text-gray-600">{currentDemo?.description}</p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Interactive Demo Player</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">Demo Player</h4>
              <p className="text-gray-500">Interactive walkthrough coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 