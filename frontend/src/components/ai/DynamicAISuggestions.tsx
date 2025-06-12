'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  EyeIcon,
  ChartBarIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface AISuggestion {
  id: string;
  type: 'clarity' | 'structure' | 'duplicate';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  articleId?: string;
  action: string;
  isProcessing?: boolean;
  result?: any;
}

interface DynamicAISuggestionsProps {
  selectedArticleId?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export default function DynamicAISuggestions({ 
  selectedArticleId, 
  onAnalysisComplete 
}: DynamicAISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = 'http://localhost:3001/api/ai';

  useEffect(() => {
    if (selectedArticleId) {
      generateSuggestionsForArticle(selectedArticleId);
    } else {
      generateGeneralSuggestions();
    }
  }, [selectedArticleId]);

  const generateSuggestionsForArticle = (articleId: string) => {
    const articleSuggestions: AISuggestion[] = [
      {
        id: 'clarity-' + articleId,
        type: 'clarity',
        title: 'Analyze Content Clarity',
        description: 'Run comprehensive clarity analysis with language assessment',
        priority: 'high',
        articleId,
        action: 'clarity-analysis'
      },
      {
        id: 'structure-' + articleId,
        type: 'structure', 
        title: 'Assess Content Structure',
        description: 'Evaluate content organization and hierarchy',
        priority: 'medium',
        articleId,
        action: 'structure-assessment'
      }
    ];
    setSuggestions(articleSuggestions);
  };

  const generateGeneralSuggestions = () => {
    const generalSuggestions: AISuggestion[] = [
      {
        id: 'duplicate-analysis',
        type: 'duplicate',
        title: 'Find Duplicate Content',
        description: 'Identify and merge duplicate articles',
        priority: 'high',
        action: 'merge-duplicates'
      }
    ];
    setSuggestions(generalSuggestions);
  };

  const executeAnalysis = async (suggestion: AISuggestion) => {
    setIsLoading(true);
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, isProcessing: true } : s
    ));

    try {
      let result;
      
      if (suggestion.action === 'clarity-analysis') {
        result = await performClarityAnalysis(suggestion.articleId!);
      } else if (suggestion.action === 'structure-assessment') {
        result = await performStructureAnalysis(suggestion.articleId!);
      } else if (suggestion.action === 'merge-duplicates') {
        result = await performDuplicateAnalysis();
      }

      setSuggestions(prev => prev.map(s => 
        s.id === suggestion.id 
          ? { ...s, isProcessing: false, result } 
          : s
      ));

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      setSuggestions(prev => prev.map(s => 
        s.id === suggestion.id ? { ...s, isProcessing: false } : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const performClarityAnalysis = async (articleId: string) => {
    const response = await fetch(`${API_BASE}/clarity-analysis/${articleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisDepth: 'comprehensive' })
    });
    
    if (!response.ok) throw new Error('Clarity analysis failed');
    return await response.json();
  };

  const performStructureAnalysis = async (articleId: string) => {
    const response = await fetch(`${API_BASE}/structure-assessment/${articleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentType: 'comprehensive' })
    });
    
    if (!response.ok) throw new Error('Structure analysis failed');
    return await response.json();
  };

  const performDuplicateAnalysis = async () => {
    const response = await fetch(`${API_BASE}/merge-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        similarityThreshold: 0.8,
        includeProposals: true 
      })
    });
    
    if (!response.ok) throw new Error('Duplicate analysis failed');
    return await response.json();
  };

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div 
          key={suggestion.id} 
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="text-purple-600">
                {suggestion.type === 'clarity' && <EyeIcon className="h-5 w-5" />}
                {suggestion.type === 'structure' && <ChartBarIcon className="h-5 w-5" />}
                {suggestion.type === 'duplicate' && <DocumentDuplicateIcon className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                <p className="text-sm text-gray-600">{suggestion.description}</p>
              </div>
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={() => executeAnalysis(suggestion)}
            disabled={suggestion.isProcessing || isLoading}
            className="flex items-center space-x-2"
          >
            {suggestion.isProcessing ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                <span>Run Analysis</span>
              </>
            )}
          </Button>
          
          {suggestion.result && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div className="font-medium text-blue-900 flex items-center space-x-1">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Analysis Complete</span>
              </div>
              <div className="text-blue-800 mt-1">
                {suggestion.type === 'clarity' && (
                  <div>Clarity Score: {suggestion.result?.data?.clarityAnalysis?.clarityScore || 'N/A'}</div>
                )}
                {suggestion.type === 'structure' && (
                  <div>Structure Score: {suggestion.result?.data?.structureScore || 'N/A'}</div>
                )}
                {suggestion.type === 'duplicate' && (
                  <div>Found {suggestion.result?.data?.duplicatePairs?.length || 0} potential duplicates</div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 