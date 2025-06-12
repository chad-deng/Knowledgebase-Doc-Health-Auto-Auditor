import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/data-sources/status`, {
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
    console.error('Error fetching data source status:', error);
    
    // Return mock data if backend is not available
    return NextResponse.json({
      status: 'success',
      data: {
        isInitialized: true,
        totalSources: 1,
        enabledSources: 1,
        sources: [
          {
            id: 'storehub-care',
            name: 'StoreHub Care Center',
            platform: 'generic',
            baseUrl: 'https://care.storehub.com/en',
            enabled: true,
            status: 'success',
            lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            syncCount: 5,
            errorCount: 0,
            articlesCount: 8
          }
        ]
      },
      metadata: {
        requestTimestamp: new Date().toISOString(),
        fallbackMode: true
      }
    });
  }
}
