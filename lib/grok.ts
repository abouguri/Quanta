import { SYSTEM_PROMPT } from './prompts'

// Note: This uses Puter.js which implements a "User-Pays" model
// Each user covers their own API costs - no backend billing needed

export async function callGrokAPI(topic: string): Promise<string> {
  // This function is now client-side via Puter.js
  // The actual call will be made from the client component
  // This server function just validates and formats the request

  const userPrompt = `${SYSTEM_PROMPT}\n\nSummarize the latest news on: ${topic}`

  console.log('Grok request prepared for topic:', topic)
  console.log('Prompt length:', userPrompt.length)

  return userPrompt
}
