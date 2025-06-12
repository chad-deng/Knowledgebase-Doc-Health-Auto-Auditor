# Contributing to Knowledge Base Document Health Auto-Auditor

Thank you for your interest in contributing to the KB Health Auditor! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue template** when available
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js version, browser)
   - Screenshots or error logs if applicable

### Suggesting Features

We welcome feature suggestions! Please:

1. **Check the roadmap** in README.md first
2. **Open a feature request issue** with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach
   - Any relevant examples or mockups

### Code Contributions

#### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/Knowledgebase-Doc-Health-Auto-Auditor.git
   cd Knowledgebase-Doc-Health-Auto-Auditor
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

#### Code Style Guidelines

**JavaScript/TypeScript:**
- Use **ES6+** features
- Follow **camelCase** for variables and functions
- Use **PascalCase** for components and classes
- Add **JSDoc comments** for functions
- Use **async/await** instead of promises when possible

**React/Next.js:**
- Use **functional components** with hooks
- Follow **component composition** patterns
- Use **TypeScript interfaces** for props
- Implement **proper error boundaries**

**CSS/Styling:**
- Use **Tailwind CSS** classes
- Follow **mobile-first** responsive design
- Support **dark mode** with appropriate classes
- Use **semantic HTML** elements

#### Commit Guidelines

Follow the **Conventional Commits** specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(ai): add content clarity analysis
fix(scraper): handle timeout errors gracefully
docs(readme): update installation instructions
style(ui): improve button hover states
```

#### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow the style guidelines
   - Add tests if applicable

3. **Test your changes**
   ```bash
   # Run any available tests
   npm test
   
   # Test both frontend and backend
   # Verify functionality in browser
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your descriptive message"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then create a Pull Request on GitHub with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - Testing instructions

#### Code Review Process

- **All PRs require review** before merging
- **Address feedback promptly** and professionally
- **Keep PRs focused** - one feature/fix per PR
- **Update documentation** if needed
- **Ensure CI passes** (when available)

## 🏗️ Project Structure

Understanding the codebase structure helps with contributions:

```
├── README.md                 # Project documentation
├── package.json             # Backend dependencies
├── src/                     # Backend source code
│   ├── services/           # Business logic
│   ├── routes/             # API endpoints
│   ├── config/             # Configuration
│   └── server-minimal.js   # Main server file
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   └── package.json       # Frontend dependencies
└── docs/                   # Additional documentation
```

## 🧪 Testing Guidelines

Currently, the project is in active development. When contributing:

1. **Manual testing** is required for all changes
2. **Test in multiple browsers** for frontend changes
3. **Verify API endpoints** with tools like Postman
4. **Check responsive design** on different screen sizes
5. **Test dark mode** functionality

Future testing framework integration is planned.

## 📝 Documentation

When contributing, please:

- **Update README.md** for new features
- **Add inline comments** for complex logic
- **Document API changes** in the API section
- **Update environment variables** in .env.example
- **Add JSDoc comments** for new functions

## 🐛 Debugging Tips

**Backend Issues:**
- Check server logs in terminal
- Verify environment variables
- Test API endpoints directly
- Check database connections (when applicable)

**Frontend Issues:**
- Use browser developer tools
- Check console for errors
- Verify API calls in Network tab
- Test component state with React DevTools

**Scraping Issues:**
- Check network connectivity
- Verify target website structure
- Test with different user agents
- Monitor rate limiting

## 🚀 Release Process

1. **Version bumping** follows semantic versioning
2. **Changelog** is maintained for releases
3. **Testing** on staging environment
4. **Documentation** updates
5. **Deployment** to production

## 📞 Getting Help

If you need help:

1. **Check existing documentation** first
2. **Search closed issues** for similar problems
3. **Ask in GitHub Discussions** (when available)
4. **Contact maintainers** via email

## 🙏 Recognition

Contributors will be:
- **Listed in README.md** acknowledgments
- **Credited in release notes** for significant contributions
- **Invited to join** the core team for ongoing contributors

Thank you for contributing to making knowledge base management better! 🎉
