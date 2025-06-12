'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import DynamicAISuggestions from '@/components/ai/DynamicAISuggestions';
import { 
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CpuChipIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ContentRecommendation {
  id: string;
  title: string;
  type: 'article' | 'rule' | 'template';
  score: number;
  reason: string;
  preview: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'suggestions' | 'recommendations'>('chat');
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>('article-001');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    // Initial AI greeting
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Knowledge Base Assistant. I can analyze content clarity, assess structure, find duplicates, and more. How can I help you today?',
      timestamp: new Date(),
      suggestions: [
        'Analyze article clarity for article-001',
        'Find duplicate content across the knowledge base',
        'Assess the structure of my documentation',
        'Run a comprehensive content audit'
      ]
    }]);
  }, []);

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

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    
    // Enhanced AI responses based on message content
    setTimeout(() => {
      let aiContent = 'I understand your request. Let me help you with that.';
      let suggestions: string[] = [];
      
      if (currentMessage.toLowerCase().includes('clarity')) {
        aiContent = 'I can analyze content clarity for you. Would you like me to run a comprehensive clarity analysis?';
        suggestions = ['Run clarity analysis on article-001', 'Analyze all articles for clarity issues'];
      } else if (currentMessage.toLowerCase().includes('duplicate')) {
        aiContent = 'I can help identify duplicate content. Let me search for similar articles in your knowledge base.';
        suggestions = ['Find duplicate articles', 'Merge similar content'];
      } else if (currentMessage.toLowerCase().includes('structure')) {
        aiContent = 'I can assess your content structure and organization. This will help improve readability and navigation.';
        suggestions = ['Assess article structure', 'Optimize content hierarchy'];
      }
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: aiContent,
        timestamp: new Date(),
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <CpuChipIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          </div>
          <p className="text-gray-600">Your intelligent knowledge base companion with advanced content analysis</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'chat'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>Chat Assistant</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'suggestions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Dynamic AI Suggestions</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'recommendations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <LightBulbIcon className="h-4 w-4" />
                  <span>Content Recommendations</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'chat' && (
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">AI Chat Assistant</h3>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p>{message.content}</p>
                          {message.suggestions && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs opacity-75">Suggestions:</p>
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="block w-full text-left text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span>AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me about content analysis, duplicates, structure..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">AI Analysis Stats</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Clarity Analyses</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Structure Assessments</span>
                    <span className="text-sm font-medium">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duplicates Found</span>
                    <span className="text-sm font-medium">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Content Optimized</span>
                    <span className="text-sm font-medium">31</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Recent AI Activity</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900">Clarity analysis completed</p>
                      <p className="text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900">Structure assessment</p>
                      <p className="text-gray-500">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900">Duplicate content detected</p>
                      <p className="text-gray-500">10 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 