'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  PencilSquareIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'template' | 'documentation' | 'faq';
  preview: string;
  metadata: {
    wordCount: number;
    readabilityScore: number;
    seoScore: number;
    generatedAt: string;
  };
}

interface AIContentGeneratorProps {
  onContentGenerated: (content: GeneratedContent) => void;
}

export function AIContentGenerator({ onContentGenerated }: AIContentGeneratorProps) {
  const [contentType, setContentType] = useState<'article' | 'template' | 'documentation' | 'faq'>('article');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('general');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    
    // Simulate AI content generation
    setTimeout(() => {
      const content = generateMockContent(contentType, topic, audience, tone, length);
      setGeneratedContent(content);
      onContentGenerated(content);
      setIsGenerating(false);
    }, 2000 + Math.random() * 2000);
  };

  const generateMockContent = (
    type: string, 
    topic: string, 
    audience: string, 
    tone: string, 
    length: string
  ): GeneratedContent => {
    const templates = {
      article: {
        title: `Complete Guide to ${topic}`,
        content: `# Complete Guide to ${topic}\n\n## Introduction\n\nThis comprehensive guide covers everything you need to know about ${topic}. Whether you're a beginner or looking to enhance your knowledge, this article provides practical insights and actionable steps.\n\n## Key Concepts\n\n### Understanding ${topic}\n\n${topic} is an essential aspect of modern business operations. It involves several key components that work together to deliver optimal results.\n\n### Benefits of ${topic}\n\n- Improved efficiency and productivity\n- Enhanced user experience\n- Better decision-making capabilities\n- Streamlined processes\n\n## Implementation Steps\n\n1. **Assessment**: Evaluate your current situation\n2. **Planning**: Develop a comprehensive strategy\n3. **Execution**: Implement the planned changes\n4. **Monitoring**: Track progress and adjust as needed\n\n## Best Practices\n\n- Regular review and updates\n- User feedback integration\n- Continuous improvement\n- Documentation maintenance\n\n## Conclusion\n\nImplementing ${topic} effectively requires careful planning and execution. By following the guidelines outlined in this article, you can achieve successful results and maximize the benefits for your organization.`
      },
      template: {
        title: `${topic} Template`,
        content: `# ${topic} Template\n\n## Purpose\nThis template provides a standardized format for ${topic}-related documentation.\n\n## Structure\n\n### Section 1: Overview\n[Provide a brief overview of the topic]\n\n### Section 2: Details\n[Include specific details and requirements]\n\n### Section 3: Implementation\n[Outline implementation steps]\n\n### Section 4: Review\n[Include review criteria and checkpoints]\n\n## Usage Instructions\n1. Copy this template\n2. Replace placeholder text with actual content\n3. Customize sections as needed\n4. Review and validate content\n\n## Notes\n- Ensure all sections are completed\n- Follow organizational guidelines\n- Update template as needed`
      },
      documentation: {
        title: `${topic} Documentation`,
        content: `# ${topic} Documentation\n\n## Table of Contents\n1. Overview\n2. Requirements\n3. Setup Instructions\n4. Configuration\n5. Usage Examples\n6. Troubleshooting\n7. FAQ\n\n## Overview\n\nThis documentation provides comprehensive information about ${topic}, including setup, configuration, and usage guidelines.\n\n## Requirements\n\n### System Requirements\n- Minimum system specifications\n- Software dependencies\n- Network requirements\n\n### Prerequisites\n- Required knowledge\n- Preparation steps\n\n## Setup Instructions\n\n### Step 1: Initial Setup\nDetailed instructions for initial setup...\n\n### Step 2: Configuration\nConfiguration parameters and options...\n\n## Usage Examples\n\n### Basic Usage\nExample code and explanations...\n\n### Advanced Features\nAdvanced usage scenarios...\n\n## Troubleshooting\n\nCommon issues and solutions...\n\n## FAQ\n\nFrequently asked questions and answers...`
      },
      faq: {
        title: `${topic} FAQ`,
        content: `# Frequently Asked Questions: ${topic}\n\n## General Questions\n\n### What is ${topic}?\n${topic} is a comprehensive solution that helps organizations improve their processes and achieve better results.\n\n### Who can benefit from ${topic}?\n${topic} is suitable for businesses of all sizes looking to enhance their operations and user experience.\n\n### How long does implementation take?\nImplementation time varies depending on the scope and complexity, typically ranging from a few weeks to several months.\n\n## Technical Questions\n\n### What are the system requirements?\nThe system requirements include modern web browsers, adequate server resources, and network connectivity.\n\n### Is training required?\nYes, we recommend training for all users to ensure optimal utilization of ${topic} features.\n\n### What support is available?\nWe provide comprehensive support including documentation, tutorials, and direct assistance.\n\n## Implementation Questions\n\n### How do we get started?\nContact our team to schedule an initial consultation and assessment of your needs.\n\n### Can it integrate with existing systems?\nYes, ${topic} is designed to integrate with most common business systems and platforms.\n\n### What is the cost?\nPricing varies based on features and usage requirements. Contact us for a customized quote.`
      }
    };

    const template = templates[type as keyof typeof templates];
    const wordCount = template.content.split(' ').length;
    
    return {
      id: `generated-${Date.now()}`,
      title: template.title,
      content: template.content,
      type,
      preview: template.content.substring(0, 200) + '...',
      metadata: {
        wordCount,
        readabilityScore: Math.floor(Math.random() * 30) + 70,
        seoScore: Math.floor(Math.random() * 25) + 75,
        generatedAt: new Date().toISOString()
      }
    };
  };

  const handleCopy = async () => {
    if (generatedContent) {
      await navigator.clipboard.writeText(generatedContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    setGeneratedContent(null);
    handleGenerate();
  };

  return (
    <div className="space-y-6">
      {/* Content Generation Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <PencilSquareIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Content Generator</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate high-quality content using advanced AI models
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="article">Article</option>
                <option value="template">Template</option>
                <option value="documentation">Documentation</option>
                <option value="faq">FAQ</option>
              </select>
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="general">General Users</option>
                <option value="technical">Technical Users</option>
                <option value="business">Business Users</option>
                <option value="beginners">Beginners</option>
                <option value="advanced">Advanced Users</option>
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="short">Short (300-500 words)</option>
                <option value="medium">Medium (500-1000 words)</option>
                <option value="long">Long (1000+ words)</option>
              </select>
            </div>
          </div>

          {/* Topic Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Topic or Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the topic you want to generate content about..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Generating Content...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                <span>Generate Content</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Content
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerate}
                  className="flex items-center space-x-1"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Regenerate</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center space-x-1"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Content Metadata */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {generatedContent.metadata.wordCount}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Words</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {generatedContent.metadata.readabilityScore}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Readability</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {generatedContent.metadata.seoScore}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">SEO Score</div>
              </div>
            </div>

            {/* Content Preview */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {generatedContent.title}
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                  {generatedContent.content}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
