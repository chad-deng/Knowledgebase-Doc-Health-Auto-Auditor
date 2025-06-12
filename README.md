# 📚 Knowledge Base Document Health Auto-Auditor

> An intelligent, AI-powered system for automatically auditing, analyzing, and optimizing knowledge base content quality and health.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-blue.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

## 🎯 Overview

The **Knowledge Base Document Health Auto-Auditor** is a comprehensive solution designed to automatically monitor, analyze, and improve the quality of documentation in knowledge bases. Built specifically for **StoreHub Care** and other knowledge management platforms, this system provides real-time content auditing, AI-powered suggestions, and automated health scoring.

### 🌟 Key Features

- **🤖 AI-Powered Content Analysis** - Advanced natural language processing for content quality assessment
- **📊 Real-Time Health Scoring** - Automated scoring system for article quality and relevance
- **🔍 Duplicate Content Detection** - Intelligent identification of redundant or overlapping content
- **📈 Content Structure Analysis** - Evaluation of article organization, readability, and formatting
- **🌐 Multi-Source Integration** - Support for various knowledge base platforms (Confluence, Notion, GitBook)
- **🕷️ Web Scraping Capabilities** - Real-time content synchronization from external sources
- **💬 Interactive AI Assistant** - Chat-based interface for content optimization guidance
- **📱 Modern Web Interface** - Responsive dashboard with dark mode support
- **🔄 Automated Auditing** - Scheduled content health checks and reporting

## 🏗️ Architecture

### Frontend (Next.js 14 + TypeScript)
```
frontend/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── articles/          # Article management
│   │   ├── ai/                # AI assistant interface
│   │   ├── data-sources/      # External data source management
│   │   └── api/               # API routes
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base UI components
│   │   └── ai/                # AI-specific components
│   └── lib/                   # Utilities and helpers
```

### Backend (Node.js + Express)
```
src/
├── services/                  # Core business logic
│   ├── StoreHubCareScraper.js # Real web scraping
│   ├── ExternalDataProvider.js # Data source management
│   ├── articlesService.js     # Article operations
│   └── aiService.js           # AI analysis engine
├── routes/                    # API endpoints
├── database/                  # Database schemas and migrations
└── config/                    # Configuration files
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chad-deng/Knowledgebase-Doc-Health-Auto-Auditor.git
   cd Knowledgebase-Doc-Health-Auto-Auditor
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development servers**

   **Backend Server:**
   ```bash
   npm run dev
   # or
   node src/server-minimal.js
   ```

   **Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - **Frontend Dashboard**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **Health Check**: http://localhost:3001/health

## 📖 Core Features

### 🔍 Article Analysis Engine

The system provides comprehensive analysis of knowledge base articles:

- **Content Quality Scoring** - Evaluates readability, completeness, and accuracy
- **Structure Assessment** - Analyzes heading hierarchy, formatting, and organization
- **SEO Optimization** - Checks meta descriptions, keywords, and search optimization
- **Accessibility Compliance** - Ensures content meets accessibility standards
- **Link Validation** - Verifies internal and external link integrity

### 🤖 AI-Powered Assistant

Interactive chat interface for content optimization:

```typescript
// Example AI analysis request
{
  "articleId": "article-001",
  "analysisType": "comprehensive",
  "includeRecommendations": true
}
```

**Capabilities:**
- Content clarity analysis
- Duplicate content detection
- Structure optimization suggestions
- SEO improvement recommendations
- Writing style enhancement

### 🌐 Multi-Source Data Integration

**Supported Platforms:**
- **StoreHub Care** (https://care.storehub.com/en) - Real-time web scraping
- **Confluence** - API integration for enterprise wikis
- **Notion** - Database synchronization
- **GitBook** - Documentation platform integration
- **Generic Web Sources** - Custom crawling capabilities

**Real-Time Scraping Example:**
```javascript
// StoreHub Care scraping
const scraper = new StoreHubCareScraper();
const articles = await scraper.scrapeAllArticles(4); // 4 articles per category

// Results include:
// - POS System guides
// - BackOffice documentation
// - Getting Started tutorials
// - Troubleshooting articles
```

### 📊 Health Scoring System

**Scoring Metrics:**
- **Content Quality** (0-100): Readability, accuracy, completeness
- **Structure Score** (0-100): Organization, formatting, hierarchy
- **SEO Score** (0-100): Search optimization, meta data, keywords
- **Freshness Score** (0-100): Last updated, relevance, currency
- **Engagement Score** (0-100): Views, helpful votes, user feedback

**Overall Health Calculation:**
```
Overall Health = (Content × 0.3) + (Structure × 0.2) + (SEO × 0.2) + (Freshness × 0.15) + (Engagement × 0.15)
```

## 🛠️ API Reference

### Articles API

**Get All Articles**
```http
GET /api/articles
```

**Get Article by ID**
```http
GET /api/articles/{id}
```

**Audit Article**
```http
POST /api/articles/{id}/audit
Content-Type: application/json

{
  "includeRecommendations": true,
  "analysisDepth": "comprehensive"
}
```

### AI Analysis API

**Analyze Content**
```http
POST /api/ai/analyze
Content-Type: application/json

{
  "content": "Article content to analyze",
  "type": "clarity|structure|seo|duplicate"
}
```

### Data Sources API

**Get Source Status**
```http
GET /api/ai/data-sources/status
```

**Trigger Real Scraping**
```http
POST /api/scrape/storehub-care
Content-Type: application/json

{
  "maxArticlesPerCategory": 4,
  "forceRefresh": true
}
```

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **Icons**: Heroicons
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **Web Scraping**: Puppeteer + Cheerio
- **HTTP Client**: Axios
- **Text Processing**: Natural, Compromise
- **Utilities**: UUID, Winston (logging)

### Development Tools
- **Package Manager**: npm
- **Process Manager**: Nodemon
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git

## 🌍 Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# External APIs (Optional)
CONFLUENCE_API_TOKEN=your_confluence_token
NOTION_API_TOKEN=your_notion_token
GITBOOK_API_TOKEN=your_gitbook_token

# AI Services (Future)
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

## 📱 User Interface

### Dashboard Features
- **📊 Analytics Dashboard** - Overview of content health metrics
- **📝 Article Management** - Browse, search, and manage articles
- **🤖 AI Assistant** - Interactive chat for content optimization
- **🔗 Data Sources** - Manage external integrations
- **⚙️ Settings** - Configure auditing rules and preferences

### Key UI Components
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Automatic theme switching
- **Real-time Updates** - Live data synchronization
- **Interactive Charts** - Visual health score representations
- **Accessibility** - WCAG 2.1 compliant interface

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start production servers**
   ```bash
   # Backend
   npm start

   # Frontend (in separate terminal)
   cd frontend
   npm start
   ```

### Docker Deployment (Coming Soon)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🗺️ Roadmap

### ✅ Completed Features
- [x] Basic article management system
- [x] AI-powered content analysis
- [x] Real-time StoreHub Care scraping
- [x] Interactive chat assistant
- [x] Health scoring algorithm
- [x] Multi-source data integration
- [x] Responsive web interface
- [x] Dark mode support

### 🚧 In Progress
- [ ] Advanced duplicate detection algorithms
- [ ] Machine learning model training
- [ ] Performance optimization
- [ ] Enhanced SEO analysis

### 🔮 Future Enhancements
- [ ] **Advanced AI Integration**
  - GPT-4 integration for content generation
  - Custom ML models for domain-specific analysis
  - Automated content improvement suggestions

- [ ] **Enterprise Features**
  - Multi-tenant support
  - Advanced user management
  - Custom branding options
  - API rate limiting and quotas

- [ ] **Analytics & Reporting**
  - Advanced analytics dashboard
  - Custom report generation
  - Email notifications and alerts
  - Historical trend analysis

- [ ] **Integration Expansions**
  - Slack/Teams notifications
  - Jira ticket integration
  - GitHub documentation sync
  - WordPress plugin

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests** (when available)
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- **Code Style**: Follow existing code patterns and use ESLint
- **Documentation**: Update README and add inline comments
- **Testing**: Add tests for new features (when test framework is available)
- **Commits**: Use clear, descriptive commit messages
- **Issues**: Check existing issues before creating new ones

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Chad Deng** - Project Lead & Full-Stack Developer
- **StoreHub Team** - Domain Expertise & Requirements

## 🙏 Acknowledgments

- **StoreHub Care** - Primary data source and use case
- **Open Source Community** - Various libraries and tools
- **AI Research Community** - Natural language processing techniques

## 📞 Support

For support, questions, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/chad-deng/Knowledgebase-Doc-Health-Auto-Auditor/issues)
- **Email**: chad.deng@storehub.com
- **Documentation**: Check this README and inline code comments

## 🔗 Related Projects

- [StoreHub Care Center](https://care.storehub.com/en) - Primary knowledge base
- [StoreHub Platform](https://storehub.com) - Main product platform

---

**Built with ❤️ for better knowledge management**

*Last updated: December 2024*