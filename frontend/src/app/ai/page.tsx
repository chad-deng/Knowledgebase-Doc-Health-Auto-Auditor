'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import DynamicAISuggestions from '@/components/ai/DynamicAISuggestions';
import { AIContentGenerator } from '@/components/ai/AIContentGenerator';
import { AIAnalyticsDashboard } from '@/components/ai/AIAnalyticsDashboard';
import { AIWorkflowManager } from '@/components/ai/AIWorkflowManager';
import { AICollaborationHub } from '@/components/ai/AICollaborationHub';
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  PencilSquareIcon,
  BoltIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  attachments?: MessageAttachment[];
  metadata?: MessageMetadata;
}

interface MessageAttachment {
  id: string;
  type: 'analysis' | 'report' | 'suggestion' | 'workflow';
  title: string;
  data: any;
  preview?: string;
}

interface MessageMetadata {
  analysisType?: string;
  confidence?: number;
  processingTime?: number;
  tokens?: number;
}

interface ContentRecommendation {
  id: string;
  title: string;
  type: 'article' | 'rule' | 'template' | 'workflow' | 'optimization';
  score: number;
  reason: string;
  preview: string;
  impact?: 'low' | 'medium' | 'high';
  effort?: 'low' | 'medium' | 'high';
  category?: string;
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'analysis' | 'generation' | 'optimization' | 'collaboration';
  enabled: boolean;
  usage: number;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant for knowledge base management. I can help you with content analysis, finding duplicates, improving structure, and optimizing your articles. What would you like to work on today?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(),
      suggestions: [
        'Analyze content quality',
        'Find duplicate articles',
        'Check article structure',
        'Optimize for SEO'
      ]
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'suggestions' | 'recommendations' | 'generator' | 'analytics' | 'workflows' | 'collaboration'>('chat');
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>('article-001');
  const [aiCapabilities, setAiCapabilities] = useState<AICapability[]>([]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
  const [collaborationData, setCollaborationData] = useState<any>({});
  const [analyticsData, setAnalyticsData] = useState<any>({});

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock recommendations data (keeping existing functionality)
  const mockRecommendations: ContentRecommendation[] = [
    {
      id: '1',
      title: 'How to Set Up Payment Processing',
      type: 'article',
      score: 95,
      reason: 'High user search volume, low content coverage',
      preview: 'Create a comprehensive guide for payment setup...'
    },
    {
      id: '2',
      title: 'API Rate Limiting Rule',
      type: 'rule',
      score: 88,
      reason: 'Frequently triggered issue in audits',
      preview: 'Add validation for API rate limiting best practices...'
    },
    {
      id: '3',
      title: 'Troubleshooting Template',
      type: 'template',
      score: 82,
      reason: 'Standardize issue resolution process',
      preview: 'Template for systematic problem diagnosis...'
    }
  ];

  useEffect(() => {
    setRecommendations(mockRecommendations);
    initializeAICapabilities();
    initializeAnalyticsData();

    // Enhanced AI greeting with capabilities overview
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your enhanced AI Knowledge Base Assistant with advanced capabilities. I can analyze content, generate new articles, optimize workflows, facilitate collaboration, and provide deep analytics. What would you like to explore today?',
      timestamp: new Date(),
      suggestions: [
        'Show me AI capabilities overview',
        'Generate a new article draft',
        'Analyze content performance trends',
        'Start a content optimization workflow',
        'Review collaboration insights'
      ],
      metadata: {
        confidence: 1.0,
        processingTime: 0
      }
    }]);
  }, []);

  // Initialize AI capabilities
  const initializeAICapabilities = () => {
    const capabilities: AICapability[] = [
      {
        id: 'content-analysis',
        name: 'Advanced Content Analysis',
        description: 'Deep semantic analysis with sentiment, readability, and structure assessment',
        icon: BeakerIcon,
        category: 'analysis',
        enabled: true,
        usage: 87
      },
      {
        id: 'content-generation',
        name: 'AI Content Generation',
        description: 'Generate articles, templates, and documentation using advanced AI',
        icon: PencilSquareIcon,
        category: 'generation',
        enabled: true,
        usage: 64
      },
      {
        id: 'workflow-optimization',
        name: 'Workflow Optimization',
        description: 'Automate and optimize content creation and review workflows',
        icon: BoltIcon,
        category: 'optimization',
        enabled: true,
        usage: 52
      },
      {
        id: 'collaboration-hub',
        name: 'Collaboration Hub',
        description: 'Real-time collaboration with AI-powered insights and suggestions',
        icon: UserGroupIcon,
        category: 'collaboration',
        enabled: true,
        usage: 73
      }
    ];
    setAiCapabilities(capabilities);
  };

  // Initialize analytics data
  const initializeAnalyticsData = () => {
    const analytics = {
      totalAnalyses: 1247,
      contentGenerated: 89,
      workflowsOptimized: 34,
      collaborationSessions: 156,
      averageImprovementScore: 78,
      trendsData: [
        { date: '2024-12-01', analyses: 45, generations: 8, optimizations: 3 },
        { date: '2024-12-02', analyses: 52, generations: 12, optimizations: 5 },
        { date: '2024-12-03', analyses: 38, generations: 6, optimizations: 2 },
        { date: '2024-12-04', analyses: 61, generations: 15, optimizations: 7 },
        { date: '2024-12-05', analyses: 48, generations: 9, optimizations: 4 }
      ]
    };
    setAnalyticsData(analytics);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAnalysisComplete = (analysis: any) => {
    // Add AI message with analysis results
    const analysisMessage = {
      id: Date.now().toString(),
      type: 'ai' as const,
      content: `Analysis complete! I've finished processing the request and found some insights for you.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, analysisMessage]);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    // Enhanced AI responses with advanced capabilities
    setTimeout(() => {
      let aiContent = 'I understand your request. Let me help you with that.';
      let suggestions: string[] = [];
      let attachments: MessageAttachment[] = [];
      let metadata: MessageMetadata = {
        confidence: 0.85,
        processingTime: Math.random() * 1000 + 500
      };

      const message = messageContent.toLowerCase();

      if (message.includes('capabilities') || message.includes('overview')) {
        aiContent = 'Here\'s an overview of my enhanced AI capabilities. I can perform advanced content analysis, generate new content, optimize workflows, and facilitate collaboration. Each capability is designed to improve your knowledge base quality and efficiency.';
        suggestions = ['Show detailed analytics', 'Start content generation', 'Create optimization workflow', 'Open collaboration hub'];
        attachments = [{
          id: 'capabilities-overview',
          type: 'analysis',
          title: 'AI Capabilities Overview',
          data: aiCapabilities,
          preview: `${aiCapabilities.length} advanced capabilities available`
        }];
      } else if (message.includes('generate') || message.includes('create')) {
        aiContent = 'I can help you generate high-quality content using advanced AI. I can create articles, templates, documentation, and more based on your requirements and existing content patterns.';
        suggestions = ['Generate article draft', 'Create template', 'Write documentation', 'Suggest content ideas'];
        metadata.analysisType = 'content-generation';
      } else if (message.includes('analytics') || message.includes('performance')) {
        aiContent = 'Let me show you comprehensive analytics about your content performance, AI usage patterns, and optimization opportunities. This data helps identify trends and improvement areas.';
        suggestions = ['View detailed analytics', 'Export performance report', 'Set up monitoring alerts', 'Compare time periods'];
        attachments = [{
          id: 'analytics-summary',
          type: 'report',
          title: 'Content Analytics Summary',
          data: analyticsData,
          preview: `${analyticsData.totalAnalyses} total analyses performed`
        }];
      } else if (message.includes('workflow') || message.includes('optimize')) {
        aiContent = 'I can help you create and optimize content workflows. This includes automated review processes, content approval chains, and quality assurance procedures tailored to your team\'s needs.';
        suggestions = ['Create new workflow', 'Optimize existing process', 'Set up automation', 'Review workflow performance'];
        metadata.analysisType = 'workflow-optimization';
      } else if (message.includes('collaboration') || message.includes('team')) {
        aiContent = 'The collaboration hub enables real-time teamwork with AI-powered insights. I can facilitate discussions, provide contextual suggestions, and help coordinate content creation efforts across your team.';
        suggestions = ['Open collaboration hub', 'Start team session', 'Review collaboration insights', 'Set up notifications'];
        metadata.analysisType = 'collaboration';
      } else if (message.includes('clarity')) {
        aiContent = 'I can perform advanced clarity analysis using semantic understanding, readability metrics, and user comprehension modeling. This goes beyond basic readability to assess true content effectiveness.';
        suggestions = ['Run advanced clarity analysis', 'Compare clarity across articles', 'Generate clarity report', 'Set clarity benchmarks'];
        metadata.analysisType = 'clarity-analysis';
      } else if (message.includes('duplicate')) {
        aiContent = 'My duplicate detection uses semantic similarity analysis to find not just exact matches, but conceptually similar content that might confuse users or create redundancy.';
        suggestions = ['Find semantic duplicates', 'Analyze content overlap', 'Suggest content consolidation', 'Create deduplication plan'];
        metadata.analysisType = 'duplicate-detection';
      } else if (message.includes('structure')) {
        aiContent = 'I can assess content structure using advanced algorithms that analyze information hierarchy, logical flow, and user navigation patterns to optimize content organization.';
        suggestions = ['Analyze content structure', 'Optimize information hierarchy', 'Improve navigation flow', 'Create structure templates'];
        metadata.analysisType = 'structure-analysis';
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiContent,
        timestamp: new Date(),
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        metadata
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, Math.random() * 1500 + 1000); // Variable response time for realism
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  // Test function to add multiple messages for scrolling demo
  const addTestMessages = () => {
    const testMessages: Message[] = [
      {
        id: Date.now().toString() + '1',
        type: 'user',
        content: 'Can you analyze the content quality of our articles?',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: Date.now().toString() + '2',
        type: 'assistant',
        content: 'I\'ve analyzed your content quality. Here are the key findings: 1) Most articles have good readability scores, 2) Some articles need better structure with more headings, 3) Several articles could benefit from more examples and visuals.',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: Date.now().toString() + '3',
        type: 'user',
        content: 'What about duplicate content?',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: Date.now().toString() + '4',
        type: 'assistant',
        content: 'I found 3 potential duplicate articles that cover similar topics. Would you like me to show you the specific articles and suggest how to merge or differentiate them?',
        timestamp: new Date().toLocaleTimeString(),
        suggestions: [
          'Show duplicate articles',
          'Suggest merge strategy',
          'Help differentiate content'
        ]
      }
    ];

    setMessages(prev => [...prev, ...testMessages]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <CpuChipIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Your intelligent knowledge base companion with advanced content analysis</p>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Capabilities</h2>
              <Button
                size="sm"
                variant={isAdvancedMode ? "default" : "outline"}
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                className="flex items-center space-x-2"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                <span>{isAdvancedMode ? 'Advanced' : 'Basic'} Mode</span>
              </Button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {aiCapabilities.filter(c => c.enabled).length} of {aiCapabilities.length} capabilities active
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {[
                { id: 'chat', name: 'Chat Assistant', icon: ChatBubbleLeftIcon },
                { id: 'suggestions', name: 'AI Suggestions', icon: SparklesIcon },
                { id: 'generator', name: 'Content Generator', icon: PencilSquareIcon },
                { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
                { id: 'workflows', name: 'Workflows', icon: BoltIcon },
                { id: 'collaboration', name: 'Collaboration', icon: UserGroupIcon },
                { id: 'recommendations', name: 'Recommendations', icon: LightBulbIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'chat' && (
              <Card className="h-[600px] max-h-[80vh] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ChatBubbleLeftIcon className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">AI Chat Assistant</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addTestMessages}
                      className="text-xs"
                    >
                      Add Test Messages
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                  {/* Enhanced Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 chat-messages">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-lg px-4 py-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.type === 'system'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <p className="flex-1">{message.content}</p>
                            {message.metadata?.confidence && (
                              <div className="ml-2 text-xs opacity-75">
                                {Math.round(message.metadata.confidence * 100)}%
                              </div>
                            )}
                          </div>

                          {/* Message Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="p-2 bg-white bg-opacity-20 rounded border border-white border-opacity-30"
                                >
                                  <div className="flex items-center space-x-2 mb-1">
                                    <DocumentTextIcon className="h-4 w-4" />
                                    <span className="text-xs font-medium">{attachment.title}</span>
                                  </div>
                                  {attachment.preview && (
                                    <p className="text-xs opacity-75">{attachment.preview}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Suggestions */}
                          {message.suggestions && (
                            <div className="mt-3 space-y-1">
                              <p className="text-xs opacity-75 font-medium">Quick Actions:</p>
                              <div className="grid grid-cols-1 gap-1">
                                {message.suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-left text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-colors border border-white border-opacity-20"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Metadata */}
                          {message.metadata && isAdvancedMode && (
                            <div className="mt-2 pt-2 border-t border-white border-opacity-20 text-xs opacity-75">
                              <div className="flex items-center justify-between">
                                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                                {message.metadata.processingTime && (
                                  <span>{Math.round(message.metadata.processingTime)}ms</span>
                                )}
                              </div>
                              {message.metadata.analysisType && (
                                <div className="mt-1">
                                  Analysis: {message.metadata.analysisType}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex space-x-2 flex-shrink-0">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me about content analysis, duplicates, structure..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                    <Button onClick={handleSendMessage} disabled={!currentMessage.trim() || isLoading}>
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'suggestions' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold">Dynamic AI Suggestions</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Article ID:</label>
                      <select 
                        value={selectedArticleId || ''} 
                        onChange={(e) => setSelectedArticleId(e.target.value || undefined)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">General Analysis</option>
                        <option value="article-001">article-001</option>
                        <option value="article-002">article-002</option>
                        <option value="article-003">article-003</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Live AI-powered suggestions that integrate with advanced backend analysis
                  </p>
                </CardHeader>
                <CardContent>
                  <DynamicAISuggestions 
                    selectedArticleId={selectedArticleId}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                </CardContent>
              </Card>
            )}

            {activeTab === 'generator' && (
              <AIContentGenerator
                onContentGenerated={(content) => {
                  const systemMessage: Message = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `Generated new content: ${content.title}`,
                    timestamp: new Date(),
                    attachments: [{
                      id: 'generated-content',
                      type: 'suggestion',
                      title: content.title,
                      data: content,
                      preview: content.preview
                    }]
                  };
                  setMessages(prev => [...prev, systemMessage]);
                }}
              />
            )}

            {activeTab === 'analytics' && (
              <AIAnalyticsDashboard
                data={analyticsData}
                capabilities={aiCapabilities}
                onInsightGenerated={(insight) => {
                  const systemMessage: Message = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `Analytics insight: ${insight.title}`,
                    timestamp: new Date(),
                    attachments: [{
                      id: 'analytics-insight',
                      type: 'analysis',
                      title: insight.title,
                      data: insight,
                      preview: insight.summary
                    }]
                  };
                  setMessages(prev => [...prev, systemMessage]);
                }}
              />
            )}

            {activeTab === 'workflows' && (
              <AIWorkflowManager
                workflows={activeWorkflows}
                onWorkflowUpdate={setActiveWorkflows}
                onWorkflowComplete={(workflow) => {
                  const systemMessage: Message = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `Workflow completed: ${workflow.name}`,
                    timestamp: new Date(),
                    attachments: [{
                      id: 'workflow-result',
                      type: 'workflow',
                      title: workflow.name,
                      data: workflow,
                      preview: `${workflow.steps.length} steps completed`
                    }]
                  };
                  setMessages(prev => [...prev, systemMessage]);
                }}
              />
            )}

            {activeTab === 'collaboration' && (
              <AICollaborationHub
                data={collaborationData}
                onCollaborationUpdate={setCollaborationData}
                onInsightShared={(insight) => {
                  const systemMessage: Message = {
                    id: Date.now().toString(),
                    type: 'system',
                    content: `Collaboration insight shared: ${insight.title}`,
                    timestamp: new Date(),
                    attachments: [{
                      id: 'collaboration-insight',
                      type: 'suggestion',
                      title: insight.title,
                      data: insight,
                      preview: insight.description
                    }]
                  };
                  setMessages(prev => [...prev, systemMessage]);
                }}
              />
            )}

            {activeTab === 'recommendations' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <LightBulbIcon className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Content Recommendations</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{rec.title}</h4>
                            <p className="text-sm text-gray-600">{rec.reason}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {rec.score}% match
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {rec.type}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{rec.preview}</p>
                        <Button size="sm" className="mt-2">
                          Create {rec.type}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* AI Capabilities Overview */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Capabilities</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiCapabilities.map((capability) => (
                    <div key={capability.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <capability.icon className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{capability.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${capability.usage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{capability.usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Enhanced AI Stats</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Analyses</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.totalAnalyses?.toLocaleString() || '1,247'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Content Generated</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.contentGenerated || '89'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Workflows Active</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{activeWorkflows.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Collaboration Sessions</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.collaborationSessions || '156'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Improvement</span>
                    <span className="text-sm font-medium text-green-600">{analyticsData.averageImprovementScore || '78'}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent AI Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <PencilSquareIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">Content generated: "API Integration Guide"</p>
                      <p className="text-gray-500 dark:text-gray-400">1 minute ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <BoltIcon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">Workflow "Content QA" completed</p>
                      <p className="text-gray-500 dark:text-gray-400">3 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">Collaboration session started</p>
                      <p className="text-gray-500 dark:text-gray-400">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">Analytics insight generated</p>
                      <p className="text-gray-500 dark:text-gray-400">8 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">Advanced clarity analysis completed</p>
                      <p className="text-gray-500 dark:text-gray-400">12 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Performance Metrics */}
            {isAdvancedMode && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                      <span className="text-sm font-medium text-green-600">1.2s avg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy Score</span>
                      <span className="text-sm font-medium text-blue-600">94.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">User Satisfaction</span>
                      <span className="text-sm font-medium text-purple-600">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">API Uptime</span>
                      <span className="text-sm font-medium text-green-600">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 