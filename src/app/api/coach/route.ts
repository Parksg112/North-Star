import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, systemContext } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      // Demo mode — return a helpful message without API key
      return NextResponse.json({
        content: `I'd love to help you with your goals! To enable full AI coaching, please add your ANTHROPIC_API_KEY to the environment variables.\n\nIn the meantime, here's some general advice:\n\n1. **Review your progress daily** — even 5 minutes of reflection makes a big difference\n2. **Focus on systems, not just goals** — build habits that make success automatic\n3. **Use your Gallup strengths** — set up your profile in Settings so I can give personalized advice\n4. **Track consistently** — log progress in the Dashboard every day to build momentum\n\nOnce you add your API key, I can give you personalized insights based on your specific goals and progress!`,
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemContext || 'You are a helpful AI accountability coach. Be encouraging, specific, and actionable.',
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return NextResponse.json({ content: content.text });
  } catch (error) {
    console.error('Coach API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
