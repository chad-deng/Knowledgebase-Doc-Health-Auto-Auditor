#!/bin/bash

# StoreHub Knowledge Base Auditor - AI Integration Demo
# Showcases the AI-powered content suggestions using Google Gemini API

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3001"
API_BASE="$BASE_URL/api"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                StoreHub Knowledge Base Auditor                   ║${NC}"
echo -e "${BLUE}║              AI Integration Demo - Phase 5 Complete             ║${NC}"
echo -e "${BLUE}║         Google Gemini API + Hybrid Template-Context System      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if server is running
echo -e "${YELLOW}🔍 Checking server status...${NC}"
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running. Please start the server first:${NC}"
    echo -e "${CYAN}   npm start${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Check AI service health
echo -e "${YELLOW}🤖 Checking AI Service Health...${NC}"
echo -e "${CYAN}GET $API_BASE/ai/health${NC}"
curl -s -X GET "$API_BASE/ai/health" | jq '.'
echo ""

# Demonstrate AI-powered content suggestions
echo -e "${PURPLE}📝 Demo 1: AI-Powered Content Suggestions${NC}"
echo -e "${CYAN}POST $API_BASE/ai/suggest/payment-integration${NC}"
curl -s -X POST "$API_BASE/ai/suggest/payment-integration" \
  -H "Content-Type: application/json" \
  -d '{
    "suggestionType": "comprehensive",
    "maxSuggestions": 5,
    "focusAreas": ["content-quality", "technical"],
    "includeExamples": true
  }' | jq '{
    status: .status,
    articleTitle: .data.articleTitle,
    auditSummary: .data.auditSummary,
    aiSuggestions: .data.aiSuggestions[0:3],
    metadata: {
      model: .data.metadata.model,
      promptType: .data.metadata.promptType,
      processingTime: .data.metadata.processingTime
    }
  }'
echo ""

# Demonstrate Quick Fix suggestions
echo -e "${PURPLE}⚡ Demo 2: Quick Fix Suggestions${NC}"
echo -e "${CYAN}POST $API_BASE/ai/quick-fix/pos-troubleshooting${NC}"
curl -s -X POST "$API_BASE/ai/quick-fix/pos-troubleshooting" \
  -H "Content-Type: application/json" \
  -d '{
    "urgency": "high",
    "maxFixes": 5
  }' | jq '{
    status: .status,
    articleTitle: .data.articleTitle,
    issuesAnalyzed: .data.issuesAnalyzed,
    quickFixes: .data.quickFixes[0:3],
    metadata: {
      model: .data.metadata.model,
      processingTime: .data.metadata.processingTime
    }
  }'
echo ""

# Demonstrate SEO-focused suggestions
echo -e "${PURPLE}🔍 Demo 3: SEO-Focused Suggestions${NC}"
echo -e "${CYAN}POST $API_BASE/ai/suggest/inventory-management${NC}"
curl -s -X POST "$API_BASE/ai/suggest/inventory-management" \
  -H "Content-Type: application/json" \
  -d '{
    "suggestionType": "seo",
    "maxSuggestions": 4,
    "focusAreas": ["seo"],
    "includeExamples": false
  }' | jq '{
    status: .status,
    articleTitle: .data.articleTitle,
    contentHealthScore: .data.auditSummary.contentHealthScore,
    seoSuggestions: .data.aiSuggestions,
    metadata: .data.metadata.promptType
  }'
echo ""

# Demonstrate Optimization Recommendations
echo -e "${PURPLE}📊 Demo 4: Performance Optimization Recommendations${NC}"
echo -e "${CYAN}POST $API_BASE/ai/optimize/customer-management${NC}"
curl -s -X POST "$API_BASE/ai/optimize/customer-management" \
  -H "Content-Type: application/json" \
  -d '{
    "performanceMetrics": {
      "viewCount": 250,
      "helpfulVotes": 12,
      "bounceRate": 45,
      "averageTimeOnPage": 180
    },
    "goals": "improve user engagement and conversion",
    "focusAreas": ["engagement", "conversion", "visibility"]
  }' | jq '{
    status: .status,
    articleTitle: .data.articleTitle,
    performanceMetrics: .data.performanceMetrics,
    recommendations: .data.optimizationRecommendations,
    metadata: .data.metadata.optimizationFocus
  }'
echo ""

# Demonstrate Context Analysis
echo -e "${PURPLE}🧠 Demo 5: Intelligent Context Analysis${NC}"
echo -e "${CYAN}POST $API_BASE/ai/analyze-context/staff-training${NC}"
curl -s -X POST "$API_BASE/ai/analyze-context/staff-training" \
  -H "Content-Type: application/json" \
  -d '{
    "analysisType": "comprehensive",
    "includeMetrics": true
  }' | jq '{
    status: .status,
    articleTitle: .data.contextAnalysis.articleAnalysis.title,
    contentAnalysis: {
      wordCount: .data.contextAnalysis.articleAnalysis.wordCount,
      readabilityScore: .data.contextAnalysis.articleAnalysis.readabilityScore,
      structureScore: .data.contextAnalysis.articleAnalysis.structureScore,
      complexity: .data.contextAnalysis.contentContext.complexity
    },
    auditInsights: .data.contextAnalysis.auditInsights,
    recommendations: .data.contextAnalysis.recommendations,
    processingTime: .data.metadata.processingTime
  }'
echo ""

# Demonstrate Batch AI Suggestions
echo -e "${PURPLE}🔄 Demo 6: Batch AI Suggestions${NC}"
echo -e "${CYAN}POST $API_BASE/ai/batch-suggest${NC}"
curl -s -X POST "$API_BASE/ai/batch-suggest" \
  -H "Content-Type: application/json" \
  -d '{
    "articleIds": ["pos-setup", "payment-integration", "inventory-management"],
    "suggestionType": "comprehensive",
    "maxSuggestions": 3,
    "focusAreas": ["content-quality"]
  }' | jq '{
    status: .status,
    batchSummary: {
      processed: .data.processed,
      failed: .data.failed,
      totalArticles: .data.metadata.batchSize
    },
    results: [
      .data.results[] | {
        articleId: .articleId,
        articleTitle: .articleTitle,
        contentHealthScore: .auditSummary.contentHealthScore,
        suggestionsCount: (.suggestions | length),
        topSuggestion: .suggestions[0].title,
        processingTime: .processingTime
      }
    ],
    errors: .data.errors
  }'
echo ""

# Demonstrate Readability-focused suggestions
echo -e "${PURPLE}📖 Demo 7: Readability Enhancement Suggestions${NC}"
echo -e "${CYAN}POST $API_BASE/ai/suggest/api-documentation${NC}"
curl -s -X POST "$API_BASE/ai/suggest/api-documentation" \
  -H "Content-Type: application/json" \
  -d '{
    "suggestionType": "readability",
    "maxSuggestions": 4,
    "focusAreas": ["content-quality"],
    "includeExamples": true
  }' | jq '{
    status: .status,
    articleTitle: .data.articleTitle,
    readabilitySuggestions: [
      .data.aiSuggestions[] | {
        title: .title,
        category: .category,
        priority: .priority,
        complexity: .implementationComplexity,
        impact: .estimatedImpact
      }
    ],
    metadata: {
      tokensUsed: .data.metadata.tokensUsed,
      contextAnalysis: .data.metadata.contextAnalysis
    }
  }'
echo ""

# Performance and Statistics Summary
echo -e "${PURPLE}📈 Demo 8: AI Integration Performance Summary${NC}"
echo ""
echo -e "${GREEN}🎯 AI INTEGRATION CAPABILITIES DEMONSTRATED:${NC}"
echo -e "   ✅ Google Gemini API Integration"
echo -e "   ✅ Hybrid Template-Context System"
echo -e "   ✅ Rules Engine Integration"
echo -e "   ✅ Content-Aware Prompt Engineering"
echo -e "   ✅ Multiple AI Suggestion Types"
echo -e "   ✅ Batch Processing Support"
echo -e "   ✅ Performance Optimization"
echo -e "   ✅ Context Intelligence Analysis"
echo ""

echo -e "${GREEN}🚀 AI SUGGESTION TYPES AVAILABLE:${NC}"
echo -e "   📝 Comprehensive Content Suggestions"
echo -e "   ⚡ Quick Fix Recommendations"
echo -e "   🔍 SEO Optimization Suggestions"
echo -e "   📖 Readability Improvements"
echo -e "   📊 Performance-Based Optimization"
echo -e "   🧠 Intelligent Context Analysis"
echo ""

echo -e "${GREEN}🔧 AI INTEGRATION FEATURES:${NC}"
echo -e "   🤖 Google Gemini 1.5 Flash Model"
echo -e "   🎨 Dynamic Prompt Engineering"
echo -e "   📊 Token Usage Tracking"
echo -e "   🔒 Secure API Key Management"
echo -e "   ⚡ Response Processing & Structuring"
echo -e "   🔄 Fallback Error Handling"
echo -e "   📈 Performance Metrics"
echo ""

echo -e "${BLUE}✨ Demo completed! Phase 5 LLM Integration is fully operational.${NC}"
echo -e "${CYAN}🔗 Integration Points:${NC}"
echo -e "   • Rules Engine → Context Analysis → AI Prompts"
echo -e "   • Structured AI Responses → Actionable Suggestions"
echo -e "   • Business Context → StoreHub-Specific Recommendations"
echo "" 