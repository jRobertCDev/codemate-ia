import { openai } from '@ai-sdk/openai'
import { generateText, tool, stepCountIs } from 'ai'
import { z } from 'zod'

export interface AgentResult {
  analysis: string
  improvements: string[]
  summary: string
  stepsExecuted: number
}

export async function runCodeAnalysisAgent(
  userMessage: string,
  fileContent: string
): Promise<AgentResult> {
  const result: AgentResult = {
    analysis: '',
    improvements: [],
    summary: '',
    stepsExecuted: 0,
  }

  const { steps } = await generateText({
    model: openai('gpt-4o'),
    system: `Sos un agente experto en análisis de código.
    Tu objetivo es analizar código, identificar problemas y sugerir mejoras concretas.
    Usás las herramientas disponibles en orden lógico para completar el análisis.
    Respondés siempre en español.
    Cuando tengas toda la información necesaria, generás un resumen final.`,
    messages: [
      {
        role: 'user',
        content: fileContent
          ? `${userMessage}\n\nCódigo a analizar:\n\`\`\`\n${fileContent}\n\`\`\``
          : userMessage,
      },
    ],
    tools: {
      analyzeCode: tool({
        description: 'Analiza el código en busca de problemas, bugs, y malas prácticas',
        inputSchema: z.object({
          code: z.string().describe('El código a analizar'),
          language: z.string().describe('El lenguaje de programación'),
        }),
        execute: async ({ code, language }) => {
          // El modelo usa esta tool para estructurar su análisis
          return {
            language,
            linesOfCode: code.split('\n').length,
            analysis: `Análisis de ${language} completado`,
          }
        },
      }),
      suggestImprovements: tool({
        description: 'Genera sugerencias de mejora específicas para el código analizado',
        inputSchema: z.object({
          improvements: z.array(z.string()).describe('Lista de mejoras sugeridas'),
          priority: z.enum(['alta', 'media', 'baja']).describe('Prioridad general'),
        }),
        execute: async ({ improvements, priority }) => {
          result.improvements = improvements
          return {
            improvements,
            priority,
            count: improvements.length,
          }
        },
      }),
      generateSummary: tool({
        description: 'Genera un resumen final del análisis con conclusiones',
        inputSchema: z.object({
          summary: z.string().describe('Resumen ejecutivo del análisis'),
          score: z.number().min(1).max(10).describe('Puntuación de calidad del código del 1 al 10'),
        }),
        execute: async ({ summary, score }) => {
          result.summary = summary
          return { summary, score }
        },
      }),
    },
    stopWhen: stepCountIs(5),
  })

  result.stepsExecuted = steps.length
  result.analysis = steps
    .map(step => step.text)
    .filter(Boolean)
    .join('\n')

  return result
}
