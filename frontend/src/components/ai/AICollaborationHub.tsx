'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ShareIcon,
  BellIcon,
  EyeIcon,
  HandRaisedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface CollaborationSession {
  id: string;
  title: string;
  participants: string[];
  status: 'active' | 'scheduled' | 'completed';
  startTime: string;
  duration: number;
  topic: string;
  insights: CollaborationInsight[];
}

interface CollaborationInsight {
  id: string;
  title: string;
  description: string;
  author: string;
  type: 'suggestion' | 'question' | 'decision' | 'action-item';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  votes: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  expertise: string[];
}

interface AICollaborationHubProps {
  data: any;
  onCollaborationUpdate: (data: any) => void;
  onInsightShared: (insight: CollaborationInsight) => void;
}

export function AICollaborationHub({ data, onCollaborationUpdate, onInsightShared }: AICollaborationHubProps) {
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [newInsightTitle, setNewInsightTitle] = useState('');
  const [newInsightDescription, setNewInsightDescription] = useState('');
  const [newInsightType, setNewInsightType] = useState<CollaborationInsight['type']>('suggestion');
  const [isCreatingInsight, setIsCreatingInsight] = useState(false);

  // Mock data for demonstration
  const mockTeamMembers: TeamMember[] = [
    {
      id: 'user-1',
      name: 'Sarah Chen',
      role: 'Content Manager',
      avatar: '👩‍💼',
      status: 'online',
      expertise: ['Content Strategy', 'SEO', 'User Experience']
    },
    {
      id: 'user-2',
      name: 'Mike Rodriguez',
      role: 'Technical Writer',
      avatar: '👨‍💻',
      status: 'online',
      expertise: ['Technical Documentation', 'API Docs', 'Developer Tools']
    },
    {
      id: 'user-3',
      name: 'Emma Thompson',
      role: 'UX Designer',
      avatar: '👩‍🎨',
      status: 'away',
      expertise: ['User Research', 'Information Architecture', 'Design Systems']
    },
    {
      id: 'user-4',
      name: 'David Kim',
      role: 'Product Manager',
      avatar: '👨‍💼',
      status: 'online',
      expertise: ['Product Strategy', 'Analytics', 'User Feedback']
    }
  ];

  const mockSessions: CollaborationSession[] = [
    {
      id: 'session-1',
      title: 'Q4 Content Strategy Review',
      participants: ['Sarah Chen', 'Mike Rodriguez', 'Emma Thompson'],
      status: 'active',
      startTime: '2024-12-05 14:00',
      duration: 60,
      topic: 'Content Strategy',
      insights: [
        {
          id: 'insight-1',
          title: 'Improve Mobile Documentation',
          description: 'Our mobile app documentation needs better visual guides and step-by-step screenshots.',
          author: 'Emma Thompson',
          type: 'suggestion',
          priority: 'high',
          status: 'open',
          createdAt: '2024-12-05 14:15',
          votes: 8
        },
        {
          id: 'insight-2',
          title: 'API Rate Limiting Clarification',
          description: 'Developers are confused about rate limiting. We need clearer examples and error handling.',
          author: 'Mike Rodriguez',
          type: 'action-item',
          priority: 'medium',
          status: 'in-progress',
          createdAt: '2024-12-05 14:22',
          votes: 5
        }
      ]
    },
    {
      id: 'session-2',
      title: 'User Feedback Integration',
      participants: ['David Kim', 'Sarah Chen'],
      status: 'scheduled',
      startTime: '2024-12-06 10:00',
      duration: 45,
      topic: 'User Experience',
      insights: []
    }
  ];

  const [sessions, setSessions] = useState<CollaborationSession[]>(mockSessions);
  const [teamMembers] = useState<TeamMember[]>(mockTeamMembers);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: CollaborationInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: CollaborationInsight['type']) => {
    switch (type) {
      case 'suggestion':
        return <LightBulbIcon className="h-4 w-4" />;
      case 'question':
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
      case 'decision':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'action-item':
        return <HandRaisedIcon className="h-4 w-4" />;
      default:
        return <LightBulbIcon className="h-4 w-4" />;
    }
  };

  const handleCreateInsight = () => {
    if (!newInsightTitle.trim() || !newInsightDescription.trim()) return;

    const newInsight: CollaborationInsight = {
      id: `insight-${Date.now()}`,
      title: newInsightTitle,
      description: newInsightDescription,
      author: 'You',
      type: newInsightType,
      priority: 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
      votes: 0
    };

    if (activeSession) {
      const updatedSession = {
        ...activeSession,
        insights: [...activeSession.insights, newInsight]
      };
      setActiveSession(updatedSession);
      setSessions(sessions.map(s => s.id === activeSession.id ? updatedSession : s));
    }

    onInsightShared(newInsight);
    setNewInsightTitle('');
    setNewInsightDescription('');
    setIsCreatingInsight(false);
  };

  const handleVoteInsight = (insightId: string) => {
    if (activeSession) {
      const updatedSession = {
        ...activeSession,
        insights: activeSession.insights.map(insight =>
          insight.id === insightId ? { ...insight, votes: insight.votes + 1 } : insight
        )
      };
      setActiveSession(updatedSession);
      setSessions(sessions.map(s => s.id === activeSession.id ? updatedSession : s));
    }
  };

  return (
    <div className="space-y-6">
      {/* Collaboration Hub Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Collaboration Hub</h3>
            </div>
            <div className="flex items-center space-x-2">
              <BellIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {teamMembers.filter(m => m.status === 'online').length} online
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time collaboration with AI-powered insights and team coordination
          </p>
        </CardHeader>
        <CardContent>
          {/* Team Members */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Team Members</h4>
            <div className="flex flex-wrap gap-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="relative">
                    <span className="text-lg">{member.avatar}</span>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Sessions */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Collaboration Sessions</h4>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeSession?.id === session.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveSession(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white">{session.title}</h5>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'active'
                          ? 'text-green-600 bg-green-100'
                          : session.status === 'scheduled'
                          ? 'text-blue-600 bg-blue-100'
                          : 'text-gray-600 bg-gray-100'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{session.participants.length} participants</span>
                    <span>{session.insights.length} insights</span>
                    <span>{session.startTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Session Details */}
      {activeSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeSession.title}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => setIsCreatingInsight(true)}
                  className="flex items-center space-x-1"
                >
                  <LightBulbIcon className="h-4 w-4" />
                  <span>Share Insight</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <ShareIcon className="h-4 w-4" />
                  <span>Share Session</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Topic: {activeSession.topic}</span>
              <span>Duration: {activeSession.duration} min</span>
              <span>Participants: {activeSession.participants.join(', ')}</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Create Insight Form */}
            {isCreatingInsight && (
              <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Share New Insight</h4>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={newInsightTitle}
                      onChange={(e) => setNewInsightTitle(e.target.value)}
                      placeholder="Insight title..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <textarea
                      value={newInsightDescription}
                      onChange={(e) => setNewInsightDescription(e.target.value)}
                      placeholder="Describe your insight..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      value={newInsightType}
                      onChange={(e) => setNewInsightType(e.target.value as CollaborationInsight['type'])}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="suggestion">Suggestion</option>
                      <option value="question">Question</option>
                      <option value="decision">Decision</option>
                      <option value="action-item">Action Item</option>
                    </select>
                    <Button onClick={handleCreateInsight} disabled={!newInsightTitle.trim()}>
                      Share Insight
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatingInsight(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Session Insights */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Session Insights</h4>
              {activeSession.insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No insights shared yet. Be the first to contribute!
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSession.insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(insight.type)}
                          <h5 className="font-medium text-gray-900 dark:text-white">{insight.title}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                            {insight.priority}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleVoteInsight(insight.id)}
                            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600"
                          >
                            <HandRaisedIcon className="h-4 w-4" />
                            <span>{insight.votes}</span>
                          </button>
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>By {insight.author}</span>
                        <span>{new Date(insight.createdAt).toLocaleString()}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          insight.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                          insight.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaboration Statistics */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Collaboration Statistics</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {sessions.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Sessions</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {sessions.reduce((acc, s) => acc + s.insights.length, 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Insights Shared</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {teamMembers.filter(m => m.status === 'online').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active Members</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {sessions.filter(s => s.status === 'active').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Live Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
