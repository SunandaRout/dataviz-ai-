import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not configured on the server.' },
        { status: 500 },
      );
    }

    const body = await request.json();
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const context = typeof body?.context === 'string' ? body.context : '';

    if (!question) {
      return NextResponse.json({ error: 'Please enter a question.' }, { status: 400 });
    }

    const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
    const system = `You are DataViz AI, a careful senior data analyst. Answer only from the supplied dataset context and calculated results. Never invent numbers. If the context is insufficient, say you cannot determine it from the uploaded dataset. Be concise but useful. Return a direct answer first, then key numbers and insight when available. Dataset context:\n${context}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dataviz-ai.vercel.app',
        'X-Title': 'DataViz AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || 'OpenRouter request failed.' },
        { status: response.status },
      );
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) {
      return NextResponse.json({ error: 'The AI returned an empty response.' }, { status: 502 });
    }

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: 'Unable to process the AI request.' }, { status: 500 });
  }
}
