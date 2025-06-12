import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/audit/rules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching audit rules:', error);
    
    // Return mock audit rules if backend is not available
    return NextResponse.json({
      success: true,
      data: {
        totalRules: 5,
        rules: [
          {
            id: 'content-quality-001',
            name: 'Content Quality Check',
            description: 'Checks for content quality and readability',
            category: 'content-quality',
            severity: 'medium',
            enabled: true
          },
          {
            id: 'seo-optimization-001', 
            name: 'SEO Optimization',
            description: 'Checks for SEO best practices',
            category: 'seo',
            severity: 'low',
            enabled: true
          },
          {
            id: 'accessibility-001',
            name: 'Accessibility Check',
            description: 'Ensures content is accessible',
            category: 'accessibility', 
            severity: 'high',
            enabled: true
          },
          {
            id: 'freshness-001',
            name: 'Content Freshness',
            description: 'Checks if content is up to date',
            category: 'freshness',
            severity: 'medium', 
            enabled: true
          },
          {
            id: 'structure-001',
            name: 'Document Structure',
            description: 'Validates document structure and formatting',
            category: 'structure',
            severity: 'low',
            enabled: true
          }
        ],
        categories: {
          'content-quality': 1,
          'seo': 1, 
          'accessibility': 1,
          'freshness': 1,
          'structure': 1
        }
      },
      meta: {
        requestedAt: new Date().toISOString(),
        fallbackMode: true
      }
    });
  }
}
