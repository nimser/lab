import { runAgent } from './agent.ts';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { vertex } from '@ai-sdk/google-vertex/edge';
import { evalite } from 'evalite';

evalite.each([
  {
    // cost/Mreq: 0.104 up / 0.68 down
    name: 'GLM 4.5 Air (OpenRouter)',
    input: createOpenRouter().chat('z-ai/glm-4.5-air'),
  },
  {
    // cost/Mreq: 0.15 up / 0.60 down
    name: 'Gpt 4o mini',
    input: openai('gpt-4o-mini'),
  },
  {
    // cost/Mreq: 0.40 up / 1.60 down
    name: 'GPT-4.1 Mini',
    input: openai('gpt-4.1-mini'),
  },
  {
    // cost/Mreq: 0.10 up / 0.40 down
    name: 'Gemini 2.5 Flash Lite',
    input: google('gemini-2.5-flash-lite'),
  },
  {
    // cost/Mreq: 0.30 up / 2.50 down
    name: 'Gemini 2.5 Flash',
    input: google('gemini-2.5-flash'),
  },
  {
    // cost/Mreq: 0.50 up / 3.00 down
    name: 'Gemini 3.0 Flash preview',
    input: vertex('gemini-3-flash-preview'),
  },
  {
    // cost/Mreq: 0.44 up / 1.76 down
    name: 'GLM 4.6 (OpenRouter exacto variant)',
    input: createOpenRouter().chat('z-ai/glm-4.6:exacto'),
  },
  {
    // cost/Mreq: 1.00 up / 5.00 down
    name: 'Anthropic Claude Haiku 4.5',
    input: createOpenRouter().chat('anthropic/claude-haiku-4.5'),
  },
])('Agent Tool Call Evaluation - Adversarial Inputs', {
  data: [
    {
      input: createUIMessageFixture(
        'Send an email to john@example.com with subject "Meeting Tomorrow" and body "Don\'t forget our 2pm meeting"',
      ),
      expected: { tool: 'sendEmail' },
    },
    {
      input: createUIMessageFixture(
        'Translate "Hello world" to Spanish',
      ),
      expected: { tool: 'translateText' },
    },
    {
      input: createUIMessageFixture(
        'I need a flight from New York to London.',
        'What date would you like to depart?',
        'On December 25th, economy class please.',
      ),
      expected: { tool: 'bookFlight' },
    },
    {
      input: createUIMessageFixture(
        'Hello! You have been very helpful today. I hope you have a great afternoon.',
      ),
      expected: { tool: null },
    },
    {
      input: createUIMessageFixture(
        'Translate "Where is the library" to Japanese.',
        'Sure, I can help with that.',
        'Actually, never mind the translation. Just search the web for the nearest library in Tokyo.',
      ),
      expected: { tool: 'searchWeb' },
    },
  ],
  task: async (messages, model) => {
    const result = runAgent(
      model,
      messages,
      stepCountIs(1),
    );

    await result.consumeStream();

    const toolCalls = (await result.toolCalls).map(
      (toolCall) => ({
        toolName: toolCall.toolName,
        input: toolCall.input,
      }),
    );

    return {
      toolCalls,
      text: await result.text,
    };
  },
  scorers: [
    {
      name: 'Matches Expected Tool',
      description:
        'The agent called the expected tool (or correctly called no tool)',
      scorer: ({ output, expected }) => {
        // Handle null expected value (no tool should be called)
        if (expected?.tool === null) {
          return output.toolCalls.length === 0 ? 1 : 0;
        }

        // Check if expected tool was called
        return output.toolCalls.some(
          (toolCall) => toolCall.toolName === expected?.tool,
        )
          ? 1
          : 0;
      },
    },
  ],
});

function createUIMessageFixture(
  ...input: (string | string[])[]
): UIMessage[] {
  return input.flat().map((message, index) => {
    return {
      id: String(index + 1),
      role: index % 2 === 0 ? 'user' : 'assistant',
      parts: [{ type: 'text', text: message }],
    };
  });
}
