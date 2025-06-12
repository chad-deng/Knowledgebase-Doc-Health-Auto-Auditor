const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ExternalAPIError } = require('../middleware/errorHandling/errors');

/**
 * Advanced Prompting Service for Task 4.2: Comprehensive AI Prompting Enhancement
 * Provides sophisticated LLM prompts for clarity analysis, content structure assessment,
 * advanced rewrite suggestions, and duplicate article merging capabilities
 */
class AdvancedPromptingService {
  constructor() {
    this.initializeGeminiAPI();
    this.clarityAnalyzer = new ClarityAnalyzer();
    this.structureAnalyzer = new StructureAnalyzer();
    this.rewriteEngine = new RewriteEngine();
    this.mergingEngine = new DuplicateMergingEngine();
  }

  initializeGeminiAPI() {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }

      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 4096,
        },
      });
    } catch (error) {
      throw new ExternalAPIError(
        'Advanced AI prompting service initialization failed',
        'ADVANCED_AI_INIT_ERROR',
        error.message
      );
    }
  }

  /**
   * Perform comprehensive clarity analysis of content
   */
  async analyzeClarityComprehensive(article, options = {}) {
    try {
      const clarityPrompt = this.clarityAnalyzer.buildClarityAnalysisPrompt(article, options);
      
      const result = await this.model.generateContent(clarityPrompt);
      const response = await result.response;
      const generatedText = response.text();

      return this.clarityAnalyzer.processClarityResponse(generatedText, article);
    } catch (error) {
      throw new ExternalAPIError(
        'Failed to analyze content clarity',
        'CLARITY_ANALYSIS_ERROR',
        error.message
      );
    }
  }

  /**
   * Perform advanced content structure assessment
   */
  async assessContentStructure(article, options = {}) {
    try {
      const structurePrompt = this.structureAnalyzer.buildStructurePrompt(article, options);
      
      const result = await this.model.generateContent(structurePrompt);
      const response = await result.response;
      const generatedText = response.text();

      return this.structureAnalyzer.processStructureResponse(generatedText, article);
    } catch (error) {
      throw new ExternalAPIError(
        'Failed to assess content structure',
        'STRUCTURE_ASSESSMENT_ERROR',
        error.message
      );
    }
  }

  /**
   * Generate advanced rewrite suggestions with style and tone analysis
   */
  async generateAdvancedRewriteSuggestions(article, options = {}) {
    try {
      const rewritePrompt = this.rewriteEngine.buildRewritePrompt(article, options);
      
      const result = await this.model.generateContent(rewritePrompt);
      const response = await result.response;
      const generatedText = response.text();

      return this.rewriteEngine.processRewriteResponse(generatedText, article, options);
    } catch (error) {
      throw new ExternalAPIError(
        'Failed to generate rewrite suggestions',
        'REWRITE_SUGGESTIONS_ERROR',
        error.message
      );
    }
  }

  /**
   * Generate duplicate article merging proposals
   */
  async generateMergingProposal(duplicateArticles, options = {}) {
    try {
      const mergingPrompt = this.mergingEngine.buildMergingPrompt(duplicateArticles, options);
      
      const result = await this.model.generateContent(mergingPrompt);
      const response = await result.response;
      const generatedText = response.text();

      return this.mergingEngine.processMergingResponse(generatedText, duplicateArticles);
    } catch (error) {
      throw new ExternalAPIError(
        'Failed to generate merging proposal',
        'MERGING_PROPOSAL_ERROR',
        error.message
      );
    }
  }

  /**
   * Context-aware prompt generation based on content type and complexity
   */
  async generateContextAwarePrompt(article, analysisType, contextFactors = {}) {
    try {
      const contextAnalysis = this.analyzeContentContext(article, contextFactors);
      const adaptivePrompt = this.buildAdaptivePrompt(analysisType, contextAnalysis);
      
      const result = await this.model.generateContent(adaptivePrompt);
      const response = await result.response;
      const generatedText = response.text();

      return {
        analysis: generatedText,
        contextFactors: contextAnalysis,
        adaptiveStrategy: this.getAdaptiveStrategy(contextAnalysis),
        metadata: {
          contentType: contextAnalysis.contentType,
          complexity: contextAnalysis.complexity,
          targetAudience: contextAnalysis.targetAudience
        }
      };
    } catch (error) {
      throw new ExternalAPIError(
        'Failed to generate context-aware analysis',
        'CONTEXT_AWARE_ERROR',
        error.message
      );
    }
  }

  /**
   * Analyze content context for adaptive prompting
   */
  analyzeContentContext(article, contextFactors) {
    const wordCount = article.content ? article.content.split(/\s+/).length : 0;
    const hasCodeBlocks = /```/.test(article.content || '');
    const hasStepByStep = /step\s*\d+/i.test(article.content || '');
    const hasTechnicalTerms = this.detectTechnicalTerms(article.content || '');

    return {
      contentType: this.determineContentType(article),
      complexity: this.assessComplexity(wordCount, hasTechnicalTerms, hasCodeBlocks),
      targetAudience: this.identifyTargetAudience(article),
      structure: {
        hasCodeBlocks,
        hasStepByStep,
        wordCount,
        sections: this.countSections(article.content || '')
      },
      businessContext: {
        category: article.category,
        industryRelevance: this.assessIndustryRelevance(article)
      },
      userFactors: contextFactors
    };
  }

  detectTechnicalTerms(content) {
    const technicalTerms = ['API', 'POS', 'inventory', 'integration', 'database', 'endpoint', 'configuration'];
    return technicalTerms.some(term => content.includes(term));
  }

  determineContentType(article) {
    if (article.category?.includes('troubleshooting')) return 'troubleshooting';
    if (article.category?.includes('setup')) return 'setup-guide';
    if (article.category?.includes('API')) return 'technical-documentation';
    if (article.title?.includes('How to')) return 'how-to-guide';
    return 'general-knowledge';
  }

  assessComplexity(wordCount, hasTechnicalTerms, hasCodeBlocks) {
    if (hasCodeBlocks || (hasTechnicalTerms && wordCount > 1000)) return 'high';
    if (hasTechnicalTerms || wordCount > 500) return 'medium';
    return 'low';
  }

  identifyTargetAudience(article) {
    if (article.content?.includes('business owner')) return 'business-owners';
    if (article.content?.includes('developer') || article.category?.includes('API')) return 'developers';
    if (article.content?.includes('staff') || article.content?.includes('employee')) return 'staff-users';
    return 'general-users';
  }

  countSections(content) {
    return (content.match(/^#+\s/gm) || []).length;
  }

  assessIndustryRelevance(article) {
    const retailTerms = ['retail', 'sale', 'customer', 'payment', 'inventory'];
    const relevantTerms = retailTerms.filter(term => 
      article.content?.toLowerCase().includes(term) || 
      article.title?.toLowerCase().includes(term)
    );
    return relevantTerms.length / retailTerms.length;
  }

  buildAdaptivePrompt(analysisType, contextAnalysis) {
    const basePrompts = {
      clarity: this.clarityAnalyzer.getAdaptiveClarityPrompt(contextAnalysis),
      structure: this.structureAnalyzer.getAdaptiveStructurePrompt(contextAnalysis),
      rewrite: this.rewriteEngine.getAdaptiveRewritePrompt(contextAnalysis)
    };

    return basePrompts[analysisType] || basePrompts.clarity;
  }

  getAdaptiveStrategy(contextAnalysis) {
    const strategies = [];
    
    if (contextAnalysis.complexity === 'high') {
      strategies.push('technical-depth-focus');
    }
    
    if (contextAnalysis.targetAudience === 'business-owners') {
      strategies.push('business-outcome-focus');
    }
    
    if (contextAnalysis.structure.hasStepByStep) {
      strategies.push('procedural-clarity-focus');
    }

    return strategies;
  }
}

/**
 * Clarity Analyzer - Advanced content clarity analysis
 */
class ClarityAnalyzer {
  buildClarityAnalysisPrompt(article, options = {}) {
    const template = this.getClarityTemplate();
    
    return template
      .replace('{{ARTICLE_TITLE}}', article.title || 'Untitled')
      .replace('{{ARTICLE_CONTENT}}', this.sanitizeContent(article.content))
      .replace('{{ANALYSIS_DEPTH}}', options.depth || 'comprehensive')
      .replace('{{FOCUS_AREAS}}', this.formatFocusAreas(options.focusAreas))
      .replace('{{TARGET_AUDIENCE}}', options.targetAudience || 'general business users');
  }

  getClarityTemplate() {
    return `You are an expert content clarity specialist for StoreHub POS and business management platform. Perform a comprehensive clarity analysis of this knowledge base article.

**ARTICLE TO ANALYZE:**
Title: "{{ARTICLE_TITLE}}"
Content: {{ARTICLE_CONTENT}}

**ANALYSIS REQUIREMENTS:**
- Depth: {{ANALYSIS_DEPTH}}
- Focus Areas: {{FOCUS_AREAS}}
- Target Audience: {{TARGET_AUDIENCE}}

**CLARITY ANALYSIS FRAMEWORK:**

1. **LANGUAGE CLARITY**
   - Jargon and technical term usage appropriateness
   - Sentence structure and complexity assessment
   - Vocabulary accessibility for target audience
   - Ambiguous phrasing identification

2. **CONCEPTUAL CLARITY**
   - Logical flow of ideas and concepts
   - Assumption validation (what readers need to know first)
   - Missing context or prerequisite information
   - Concept introduction and explanation adequacy

3. **INSTRUCTIONAL CLARITY**
   - Step-by-step process clarity
   - Action verb precision and specificity
   - Expected outcome communication
   - Error prevention and troubleshooting guidance

4. **COGNITIVE LOAD ASSESSMENT**
   - Information density per section
   - Mental effort required to process content
   - Working memory demands
   - Attention management and focus

**OUTPUT FORMAT:**
Provide a structured analysis with:

**CLARITY SCORE:** [0-100] with breakdown by category

**LANGUAGE ISSUES:**
- [Specific issues with exact quotes and line references]
- [Suggested improvements with rationale]

**CONCEPTUAL GAPS:**
- [Missing prerequisite knowledge]
- [Logical flow problems]
- [Assumption validation issues]

**INSTRUCTIONAL IMPROVEMENTS:**
- [Step clarity enhancements]
- [Action specification improvements]
- [Outcome clarification needs]

**COGNITIVE OPTIMIZATION:**
- [Information chunking suggestions]
- [Complexity reduction opportunities]
- [Focus improvement recommendations]

**PRIORITY ACTIONS:**
1. [Highest impact clarity improvement]
2. [Second priority improvement]
3. [Third priority improvement]

Focus on actionable, specific improvements that enhance user comprehension and task completion success for StoreHub platform users.`;
  }

  getAdaptiveClarityPrompt(contextAnalysis) {
    let adaptivePrompt = this.getClarityTemplate();
    
    // Adapt based on complexity
    if (contextAnalysis.complexity === 'high') {
      adaptivePrompt += `\n\n**TECHNICAL CONTENT CONSIDERATIONS:**
- Technical terminology appropriateness for audience
- Code example clarity and completeness
- Integration complexity communication`;
    }
    
    // Adapt based on audience
    if (contextAnalysis.targetAudience === 'business-owners') {
      adaptivePrompt += `\n\n**BUSINESS OWNER FOCUS:**
- Business impact clarity
- ROI and value proposition communication
- Implementation timeline and resource requirements`;
    }
    
    return adaptivePrompt;
  }

  processClarityResponse(generatedText, article) {
    const parser = new ClarityResponseParser();
    return parser.parse(generatedText, article);
  }

  sanitizeContent(content) {
    if (!content) return 'No content provided';
    return content.substring(0, 3000) + (content.length > 3000 ? '...' : '');
  }

  formatFocusAreas(focusAreas) {
    if (!focusAreas || focusAreas.length === 0) {
      return 'General clarity analysis';
    }
    return focusAreas.join(', ');
  }
}

/**
 * Structure Analyzer - Advanced content structure assessment
 */
class StructureAnalyzer {
  buildStructurePrompt(article, options = {}) {
    const template = this.getStructureTemplate();
    
    return template
      .replace('{{ARTICLE_TITLE}}', article.title || 'Untitled')
      .replace('{{ARTICLE_CONTENT}}', this.sanitizeContent(article.content))
      .replace('{{STRUCTURE_TYPE}}', options.structureType || 'knowledge-base')
      .replace('{{ANALYSIS_FOCUS}}', options.analysisFocus || 'comprehensive');
  }

  getStructureTemplate() {
    return `You are an expert content structure analyst for StoreHub business platform. Perform a comprehensive structural assessment of this knowledge base article.

**ARTICLE TO ANALYZE:**
Title: "{{ARTICLE_TITLE}}"
Content: {{ARTICLE_CONTENT}}

**STRUCTURE ANALYSIS PARAMETERS:**
- Content Type: {{STRUCTURE_TYPE}}
- Analysis Focus: {{ANALYSIS_FOCUS}}

**STRUCTURAL ASSESSMENT FRAMEWORK:**

1. **INFORMATION ARCHITECTURE**
   - Heading hierarchy effectiveness and logic
   - Section organization and flow
   - Information categorization and grouping
   - Content depth distribution

2. **NAVIGATION STRUCTURE**
   - Table of contents potential and need
   - Cross-reference opportunities
   - Related content linking
   - User journey flow optimization

3. **CONTENT ORGANIZATION**
   - Logical progression assessment
   - Information layering (overview → details)
   - Procedural step organization
   - Supporting information placement

4. **READABILITY STRUCTURE**
   - Paragraph length and density
   - List usage effectiveness
   - Visual break optimization
   - Scanability enhancement opportunities

5. **FUNCTIONAL STRUCTURE**
   - Call-to-action placement and clarity
   - Example integration and positioning
   - Warning and note placement
   - Next-step guidance

**OUTPUT FORMAT:**

**STRUCTURE SCORE:** [0-100] with category breakdown

**HIERARCHY ANALYSIS:**
- [Heading structure assessment]
- [Logical flow evaluation]
- [Depth balance analysis]

**ORGANIZATION RECOMMENDATIONS:**
- [Section restructuring suggestions]
- [Content regrouping opportunities]
- [Flow improvement recommendations]

**NAVIGATION ENHANCEMENTS:**
- [Internal linking opportunities]
- [Cross-reference suggestions]
- [User path optimization]

**READABILITY IMPROVEMENTS:**
- [Paragraph restructuring needs]
- [List formatting optimization]
- [Visual element suggestions]

**FUNCTIONAL OPTIMIZATION:**
- [Action placement improvements]
- [Example positioning suggestions]
- [Support element optimization]

**RESTRUCTURE PROPOSAL:**
Provide a recommended structure outline with rationale for changes.

Focus on creating optimal user experience for StoreHub platform users seeking efficient task completion.`;
  }

  getAdaptiveStructurePrompt(contextAnalysis) {
    let adaptivePrompt = this.getStructureTemplate();
    
    if (contextAnalysis.contentType === 'troubleshooting') {
      adaptivePrompt += `\n\n**TROUBLESHOOTING STRUCTURE FOCUS:**
- Problem identification flow
- Diagnostic step organization
- Solution hierarchy (quick fixes → complex solutions)
- Prevention information placement`;
    }
    
    return adaptivePrompt;
  }

  processStructureResponse(generatedText, article) {
    const parser = new StructureResponseParser();
    return parser.parse(generatedText, article);
  }

  sanitizeContent(content) {
    if (!content) return 'No content provided';
    return content.substring(0, 3500) + (content.length > 3500 ? '...' : '');
  }
}

/**
 * Rewrite Engine - Advanced rewrite suggestions with style and tone analysis
 */
class RewriteEngine {
  buildRewritePrompt(article, options = {}) {
    const template = this.getRewriteTemplate();
    
    return template
      .replace('{{ARTICLE_TITLE}}', article.title || 'Untitled')
      .replace('{{CURRENT_CONTENT}}', this.sanitizeContent(article.content))
      .replace('{{REWRITE_OBJECTIVES}}', this.formatObjectives(options.objectives))
      .replace('{{STYLE_PREFERENCES}}', options.style || 'professional yet accessible')
      .replace('{{TONE_TARGET}}', options.tone || 'helpful and confident');
  }

  getRewriteTemplate() {
    return `You are an expert content rewrite specialist for StoreHub business platform. Provide comprehensive rewrite suggestions with style and tone analysis.

**CONTENT TO ANALYZE:**
Title: "{{ARTICLE_TITLE}}"
Current Content: {{CURRENT_CONTENT}}

**REWRITE PARAMETERS:**
- Objectives: {{REWRITE_OBJECTIVES}}
- Style Preference: {{STYLE_PREFERENCES}}
- Tone Target: {{TONE_TARGET}}

**REWRITE ANALYSIS FRAMEWORK:**

1. **STYLE ANALYSIS**
   - Current writing style assessment
   - Brand voice alignment evaluation
   - Consistency analysis across sections
   - Professional tone maintenance

2. **TONE OPTIMIZATION**
   - Emotional impact assessment
   - User empathy integration
   - Confidence level calibration
   - Accessibility and approachability

3. **LANGUAGE ENHANCEMENT**
   - Word choice optimization
   - Sentence structure variety
   - Active vs passive voice balance
   - Clarity and conciseness improvements

4. **ENGAGEMENT OPTIMIZATION**
   - Reader engagement techniques
   - Motivational language integration
   - Personal connection opportunities
   - Action-oriented language usage

**REWRITE SUGGESTIONS:**

**STYLE ASSESSMENT:**
- Current style characteristics
- Brand alignment score [0-100]
- Consistency issues identified
- Style improvement opportunities

**TONE ANALYSIS:**
- Current tone evaluation
- Emotional impact rating
- User empathy level
- Confidence projection assessment

**SECTION-BY-SECTION REWRITES:**
For each major section, provide:
- **Original:** [Quote from original]
- **Rewritten:** [Improved version]
- **Rationale:** [Why this change improves the content]
- **Impact:** [Expected improvement in user experience]

**ALTERNATIVE PHRASINGS:**
Provide 3 alternative ways to express key concepts:
1. [Technical audience version]
2. [Business owner version]  
3. [New user version]

**TONE VARIATIONS:**
Show how the same information can be conveyed with different tones:
- **Formal:** [Professional, authoritative]
- **Conversational:** [Friendly, approachable]
- **Instructional:** [Clear, step-by-step]

**IMPLEMENTATION PRIORITY:**
1. [Highest impact rewrite suggestion]
2. [Medium impact improvement]
3. [Polish and refinement suggestion]

Focus on maintaining StoreHub's helpful, professional brand voice while maximizing user comprehension and task completion success.`;
  }

  getAdaptiveRewritePrompt(contextAnalysis) {
    let adaptivePrompt = this.getRewriteTemplate();
    
    if (contextAnalysis.targetAudience === 'developers') {
      adaptivePrompt += `\n\n**DEVELOPER-FOCUSED REWRITING:**
- Technical precision requirements
- Code example integration
- API documentation style considerations
- Developer workflow optimization`;
    }
    
    return adaptivePrompt;
  }

  processRewriteResponse(generatedText, article, options) {
    const parser = new RewriteResponseParser();
    return parser.parse(generatedText, article, options);
  }

  formatObjectives(objectives) {
    if (!objectives || objectives.length === 0) {
      return 'Improve clarity, engagement, and user task completion';
    }
    return Array.isArray(objectives) ? objectives.join(', ') : objectives;
  }

  sanitizeContent(content) {
    if (!content) return 'No content provided';
    return content.substring(0, 3000) + (content.length > 3000 ? '...' : '');
  }
}

/**
 * Duplicate Merging Engine - Intelligent article consolidation
 */
class DuplicateMergingEngine {
  buildMergingPrompt(duplicateArticles, options = {}) {
    const template = this.getMergingTemplate();
    
    return template
      .replace('{{ARTICLE_COUNT}}', duplicateArticles.length)
      .replace('{{ARTICLES_CONTENT}}', this.formatDuplicateArticles(duplicateArticles))
      .replace('{{MERGING_STRATEGY}}', options.strategy || 'comprehensive-consolidation')
      .replace('{{PRIORITY_CONTENT}}', options.priorityContent || 'most_recent');
  }

  getMergingTemplate() {
    return `You are an expert content consolidation specialist for StoreHub platform. Analyze {{ARTICLE_COUNT}} duplicate/similar articles and create an intelligent merging proposal.

**ARTICLES TO MERGE:**
{{ARTICLES_CONTENT}}

**MERGING PARAMETERS:**
- Strategy: {{MERGING_STRATEGY}}
- Priority Content: {{PRIORITY_CONTENT}}

**DUPLICATE MERGING FRAMEWORK:**

1. **CONTENT OVERLAP ANALYSIS**
   - Common information identification
   - Unique value propositions in each article
   - Conflicting information detection
   - Complementary content opportunities

2. **QUALITY ASSESSMENT**
   - Content accuracy comparison
   - Completeness evaluation
   - Clarity and readability assessment
   - User engagement metrics consideration

3. **INFORMATION SYNTHESIS**
   - Best practices extraction from all sources
   - Comprehensive coverage development
   - Conflict resolution strategies
   - Enhanced user value creation

**MERGING PROPOSAL:**

**OVERLAP ANALYSIS:**
- Percentage of shared content: [X%]
- Unique content distribution
- Conflict areas identified
- Synthesis opportunities

**RECOMMENDED STRUCTURE:**
Provide a detailed outline for the merged article:
1. [Section name] - [Source articles and rationale]
2. [Section name] - [Content synthesis approach]
3. [Section name] - [New value-added content]

**CONTENT INTEGRATION PLAN:**
For each section:
- **Primary Source:** [Which article provides the best base]
- **Supplementary Content:** [What to add from other articles]
- **Enhancements:** [New content to bridge gaps]
- **Conflicts Resolution:** [How to handle contradictions]

**MERGED ARTICLE DRAFT:**
Create a complete draft of the merged article that:
- Eliminates redundancy
- Incorporates best content from all sources
- Resolves conflicts intelligently
- Adds transitional content for flow
- Enhances overall user value

**DEPRECATION PLAN:**
- Which original articles to retire
- Redirect strategy for existing links
- User communication approach
- SEO preservation methods

**QUALITY IMPROVEMENTS:**
Show how the merged article improves upon originals:
- Completeness enhancement
- Clarity improvements
- User experience optimization
- Maintenance efficiency gains

Focus on creating a superior consolidated resource that serves StoreHub users better than any individual original article.`;
  }

  processMergingResponse(generatedText, duplicateArticles) {
    const parser = new MergingResponseParser();
    return parser.parse(generatedText, duplicateArticles);
  }

  formatDuplicateArticles(articles) {
    return articles.map((article, index) => 
      `**ARTICLE ${index + 1}:**
Title: "${article.title}"
Category: ${article.category || 'Uncategorized'}
Word Count: ${this.countWords(article.content)}
Content Preview: ${this.sanitizeContent(article.content)}
---`
    ).join('\n\n');
  }

  countWords(content) {
    if (!content) return 0;
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  sanitizeContent(content) {
    if (!content) return 'No content provided';
    return content.substring(0, 500) + (content.length > 500 ? '...' : '');
  }
}

// Response Parsers
class ClarityResponseParser {
  parse(generatedText, article) {
    return {
      clarityScore: this.extractScore(generatedText),
      languageIssues: this.extractSection(generatedText, 'LANGUAGE ISSUES'),
      conceptualGaps: this.extractSection(generatedText, 'CONCEPTUAL GAPS'),
      instructionalImprovements: this.extractSection(generatedText, 'INSTRUCTIONAL IMPROVEMENTS'),
      cognitiveOptimization: this.extractSection(generatedText, 'COGNITIVE OPTIMIZATION'),
      priorityActions: this.extractPriorityActions(generatedText),
      originalArticle: { id: article.id, title: article.title }
    };
  }

  extractScore(text) {
    const scoreMatch = text.match(/CLARITY SCORE.*?(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 75;
  }

  extractSection(text, sectionName) {
    const pattern = new RegExp(`\\*\\*${sectionName}:\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = text.match(pattern);
    return match ? match[1].trim() : `${sectionName} analysis not available`;
  }

  extractPriorityActions(text) {
    const actionsMatch = text.match(/\*\*PRIORITY ACTIONS:\*\*([\s\S]*?)(?=\*\*[A-Z]|$)/i);
    if (!actionsMatch) return [];
    
    const actions = actionsMatch[1].match(/\d+\.\s*(.+)/g) || [];
    return actions.map(action => action.replace(/^\d+\.\s*/, '').trim());
  }
}

class StructureResponseParser {
  parse(generatedText, article) {
    return {
      structureScore: this.extractScore(generatedText),
      hierarchyAnalysis: this.extractSection(generatedText, 'HIERARCHY ANALYSIS'),
      organizationRecommendations: this.extractSection(generatedText, 'ORGANIZATION RECOMMENDATIONS'),
      navigationEnhancements: this.extractSection(generatedText, 'NAVIGATION ENHANCEMENTS'),
      readabilityImprovements: this.extractSection(generatedText, 'READABILITY IMPROVEMENTS'),
      functionalOptimization: this.extractSection(generatedText, 'FUNCTIONAL OPTIMIZATION'),
      restructureProposal: this.extractSection(generatedText, 'RESTRUCTURE PROPOSAL'),
      originalArticle: { id: article.id, title: article.title }
    };
  }

  extractScore(text) {
    const scoreMatch = text.match(/STRUCTURE SCORE.*?(\d+)/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 75;
  }

  extractSection(text, sectionName) {
    const pattern = new RegExp(`\\*\\*${sectionName}:\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = text.match(pattern);
    return match ? match[1].trim() : `${sectionName} analysis not available`;
  }
}

class RewriteResponseParser {
  parse(generatedText, article, options) {
    return {
      styleAssessment: this.extractSection(generatedText, 'STYLE ASSESSMENT'),
      toneAnalysis: this.extractSection(generatedText, 'TONE ANALYSIS'),
      sectionRewrites: this.extractSectionRewrites(generatedText),
      alternativePhrasings: this.extractAlternatives(generatedText),
      toneVariations: this.extractToneVariations(generatedText),
      implementationPriority: this.extractPriorityActions(generatedText),
      originalArticle: { id: article.id, title: article.title },
      rewriteOptions: options
    };
  }

  extractSection(text, sectionName) {
    const pattern = new RegExp(`\\*\\*${sectionName}:\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = text.match(pattern);
    return match ? match[1].trim() : `${sectionName} analysis not available`;
  }

  extractSectionRewrites(text) {
    const rewritesSection = this.extractSection(text, 'SECTION-BY-SECTION REWRITES');
    const rewrites = [];
    
    const rewritePattern = /\*\*Original:\*\*(.*?)\*\*Rewritten:\*\*(.*?)\*\*Rationale:\*\*(.*?)\*\*Impact:\*\*(.*?)(?=\*\*Original|\*\*[A-Z]|$)/gs;
    let match;
    
    while ((match = rewritePattern.exec(rewritesSection)) !== null) {
      rewrites.push({
        original: match[1].trim(),
        rewritten: match[2].trim(),
        rationale: match[3].trim(),
        impact: match[4].trim()
      });
    }
    
    return rewrites;
  }

  extractAlternatives(text) {
    const alternativesSection = this.extractSection(text, 'ALTERNATIVE PHRASINGS');
    const alternatives = alternativesSection.match(/\d+\.\s*\[.*?\]\s*(.*)/g) || [];
    return alternatives.map(alt => alt.replace(/^\d+\.\s*\[.*?\]\s*/, '').trim());
  }

  extractToneVariations(text) {
    const variationsSection = this.extractSection(text, 'TONE VARIATIONS');
    return {
      formal: this.extractToneVariation(variationsSection, 'Formal'),
      conversational: this.extractToneVariation(variationsSection, 'Conversational'),
      instructional: this.extractToneVariation(variationsSection, 'Instructional')
    };
  }

  extractToneVariation(text, toneName) {
    const pattern = new RegExp(`\\*\\*${toneName}:\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  }

  extractPriorityActions(text) {
    const prioritySection = this.extractSection(text, 'IMPLEMENTATION PRIORITY');
    const actions = prioritySection.match(/\d+\.\s*(.+)/g) || [];
    return actions.map(action => action.replace(/^\d+\.\s*/, '').trim());
  }
}

class MergingResponseParser {
  parse(generatedText, duplicateArticles) {
    return {
      overlapAnalysis: this.extractSection(generatedText, 'OVERLAP ANALYSIS'),
      recommendedStructure: this.extractSection(generatedText, 'RECOMMENDED STRUCTURE'),
      contentIntegrationPlan: this.extractSection(generatedText, 'CONTENT INTEGRATION PLAN'),
      mergedArticleDraft: this.extractSection(generatedText, 'MERGED ARTICLE DRAFT'),
      deprecationPlan: this.extractSection(generatedText, 'DEPRECATION PLAN'),
      qualityImprovements: this.extractSection(generatedText, 'QUALITY IMPROVEMENTS'),
      originalArticles: duplicateArticles.map(article => ({ id: article.id, title: article.title })),
      mergingMetadata: {
        articleCount: duplicateArticles.length,
        estimatedImprovement: this.extractImprovementMetrics(generatedText)
      }
    };
  }

  extractSection(text, sectionName) {
    const pattern = new RegExp(`\\*\\*${sectionName}:\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
    const match = text.match(pattern);
    return match ? match[1].trim() : `${sectionName} analysis not available`;
  }

  extractImprovementMetrics(text) {
    const overlapMatch = text.match(/(\d+)%.*?shared content/i);
    return {
      contentOverlap: overlapMatch ? parseInt(overlapMatch[1]) : 50,
      estimatedQualityGain: 25 // Default estimate
    };
  }
}

module.exports = AdvancedPromptingService; 