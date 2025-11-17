import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const safeMessages = Array.isArray(messages) ? messages : [];

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const reply = await callOpenAI(apiKey, safeMessages);
      return NextResponse.json({ reply });
    }

    const reply = mockReply(safeMessages);
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ reply: 'Sorry, I could not process that.' }, { status: 200 });
  }
}

async function callOpenAI(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.5,
      max_tokens: 400
    })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error: ${txt}`);
  }
  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  return content || 'I have no response right now.';
}

function mockReply(messages: { role: string; content: string }[]): string {
  const last = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  if (!last) return 'How can I help you today? Try asking me to summarize a note or create a to-do plan.';
  if (/todo|task/i.test(last)) return 'Here is a concise task plan: 1) Define goal, 2) Break into 3-5 tasks, 3) Set deadlines, 4) Track progress.';
  if (/note|summar/i.test(last)) return 'Summary: Key points, action items, and follow-ups. Would you like me to extract tasks?';
  if (/remind/i.test(last)) return 'Set a reminder with title and time on the Reminders tab. I suggest a realistic deadline.';
  return `Got it. ${last.length > 120 ? 'I summarized your long message.' : 'Here is a quick suggestion:'} Focus on outcomes, list next 3 steps, and time-box.`;
}
