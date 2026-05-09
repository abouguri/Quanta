import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.GROK_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROK_API_KEY not set in environment' },
      { status: 400 }
    )
  }

  try {
    // Simple test call to Grok API
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-2',
        messages: [{ role: 'user', content: 'Say hello' }],
        stream: false,
      }),
    })

    const data = await response.json() as Record<string, unknown>

    if (!response.ok) {
      return NextResponse.json(
        {
          status: response.status,
          statusText: response.statusText,
          error: data,
          message: 'API key test failed',
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      status: 'success',
      message: 'API key is valid!',
      response: data,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: message, message: 'Test request failed' },
      { status: 500 }
    )
  }
}
