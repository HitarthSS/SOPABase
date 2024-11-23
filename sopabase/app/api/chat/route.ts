// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '', // defaults to process.env["ANTHROPIC_API_KEY"]
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: message }],
    });

    // The response structure has changed - accessing the content directly from the response
    return NextResponse.json({ 
      response: response.content[0].text 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}