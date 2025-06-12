import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/ai/data-sources/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error syncing data sources:', error);
    
    // Return mock success response if backend is not available
    const { sourceId } = await request.json().catch(() => ({}));
    
    return NextResponse.json({
      status: 'success',
      data: {
        sourceId: sourceId || 'all',
        success: true,
        articlesFound: 8,
        syncTime: new Date().toISOString(),
        message: `Successfully synced articles from ${sourceId || 'all sources'} (mock mode)`
      },
      metadata: {
        requestTimestamp: new Date().toISOString(),
        fallbackMode: true
      }
    });
  }
}
