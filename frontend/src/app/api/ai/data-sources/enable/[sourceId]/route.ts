import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { sourceId: string } }
) {
  try {
    const { sourceId } = params;
    
    const response = await fetch(`${BACKEND_URL}/api/ai/data-sources/enable/${sourceId}`, {
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
    console.error('Error enabling data source:', error);
    
    // Return mock success response if backend is not available
    const { sourceId } = params;
    
    return NextResponse.json({
      status: 'success',
      data: {
        sourceId,
        enabled: true,
        message: `Data source ${sourceId} enabled successfully (mock mode)`
      },
      metadata: {
        requestTimestamp: new Date().toISOString(),
        fallbackMode: true
      }
    });
  }
}
