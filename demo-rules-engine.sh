#!/bin/bash

# StoreHub Knowledge Base Auditor - Rules Engine Demo
# Demonstrates comprehensive content auditing capabilities

echo "🔍 StoreHub Knowledge Base Auditor - Rules Engine Demo"
echo "======================================================"
echo ""

BASE_URL="http://localhost:3001"

# Check if server is running
echo "🌐 Checking server health..."
if curl -s $BASE_URL/health > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start with: node src/server.js"
    exit 1
fi

echo ""

# 1. Show available rules
echo "📋 Available Content Audit Rules:"
echo "--------------------------------"
curl -s $BASE_URL/api/audit/rules | jq -r '.data.rules[] | "• \(.name) (\(.category)) - \(.severity) severity"'
echo ""

# 2. Show rules by category
echo "📂 Rules Organized by Category:"
echo "------------------------------"
curl -s $BASE_URL/api/audit/rules | jq -r '.data.categories | to_entries[] | "📁 \(.key | ascii_upcase):\n\(.value[] | "  • \(.name) - \(.description)")\n"'

# 3. Show system statistics
echo "📊 Rules Engine System Statistics:"
echo "----------------------------------"
curl -s $BASE_URL/api/audit/stats | jq '.data' | grep -E '"(totalRules|enabledRules|ruleCategories|configurableRules|articlesChecked|issuesFound|averageIssuesPerArticle|healthScore)"' | sed 's/^[ ]*/  /' | sed 's/,$//'
echo ""

# 4. Audit a specific article
echo "🔍 Single Article Audit (article-001):"
echo "--------------------------------------"
AUDIT_RESULT=$(curl -s -X POST $BASE_URL/api/audit/article/article-001 -H "Content-Type: application/json" -d '{}')

echo "$AUDIT_RESULT" | jq -r '"Article: \(.data.article.title)"'
echo "$AUDIT_RESULT" | jq -r '"Issues Found: \(.data.audit.issuesFound)"'
echo ""

echo "Issues Detected:"
echo "$AUDIT_RESULT" | jq -r '.data.audit.issues[] | "  🚨 \(.severity | ascii_upcase): \(.issue) (\(.ruleName))"'
echo ""

echo "Suggestions (first 3):"
echo "$AUDIT_RESULT" | jq -r '.data.audit.issues[0].suggestions[:3][] | "  💡 \(.)"'
echo ""

# 5. Batch audit multiple articles
echo "📊 Batch Audit Summary (3 articles):"
echo "------------------------------------"
BATCH_RESULT=$(curl -s -X POST $BASE_URL/api/audit/articles -H "Content-Type: application/json" -d '{"limit": 3}')

echo "$BATCH_RESULT" | jq -r '"Total Articles: \(.data.audit.totalArticles)"'
echo "$BATCH_RESULT" | jq -r '"Total Issues: \(.data.audit.totalIssues)"'
echo "$BATCH_RESULT" | jq -r '"Articles with Issues: \(.data.summary.articlesWithIssues)"'
echo "$BATCH_RESULT" | jq -r '"Average Issues per Article: \(.data.summary.averageIssuesPerArticle)"'
echo ""

echo "Issue Severity Breakdown:"
echo "$BATCH_RESULT" | jq -r '.data.summary.severityBreakdown | to_entries[] | "  \(.key | ascii_upcase): \(.value)"'
echo ""

echo "Issue Category Breakdown:"
echo "$BATCH_RESULT" | jq -r '.data.summary.categoryBreakdown | to_entries[] | "  \(.key): \(.value) issues"'
echo ""

echo "Most Common Issues:"
echo "$BATCH_RESULT" | jq -r '.data.summary.mostCommonIssues[] | "  📍 \(.issue) (\(.count)x)"'
echo ""

# 6. Audit with severity filter
echo "🔥 High Severity Issues Only:"
echo "-----------------------------"
HIGH_SEVERITY=$(curl -s -X POST $BASE_URL/api/audit/article/article-001 -H "Content-Type: application/json" -d '{"minSeverity": "high"}')

echo "$HIGH_SEVERITY" | jq -r '"Critical Issues Found: \(.data.audit.issuesFound)"'
if [ "$(echo "$HIGH_SEVERITY" | jq '.data.audit.issuesFound')" -gt 0 ]; then
    echo "$HIGH_SEVERITY" | jq -r '.data.audit.issues[] | "  ⚠️  \(.severity | ascii_upcase): \(.issue)"'
else
    echo "  ✅ No high severity issues found"
fi
echo ""

# 7. Test specific rule configuration
echo "⚙️  Rules Configuration Example:"
echo "--------------------------------"
curl -s $BASE_URL/api/audit/rules/outdated-content | jq -r '"Rule: \(.data.rule.name)"'
curl -s $BASE_URL/api/audit/rules/outdated-content | jq -r '"Configurable: \(.data.rule.configurable)"'
curl -s $BASE_URL/api/audit/rules/outdated-content | jq -r '"Current Config: \(.data.rule.config | keys | join(", "))"'
echo ""

# 8. API Information
echo "🔗 Available API Endpoints:"
echo "---------------------------"
curl -s $BASE_URL/api | jq -r '.endpoints | to_entries[] | "  \(.key): \(.value)"'
echo ""

echo "✨ Rules Engine Demo Complete!"
echo ""
echo "🎯 Key Features Demonstrated:"
echo "  • 5 Built-in content audit rules across 3 categories"
echo "  • Individual and batch article auditing"
echo "  • Severity-based filtering and categorization"
echo "  • Configurable rule parameters"
echo "  • Comprehensive issue detection and suggestions"
echo "  • Real-time content health scoring"
echo ""

echo "🚀 Ready for production content auditing!" 