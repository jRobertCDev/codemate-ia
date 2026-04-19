import { createClient } from '@supabase/supabase-js'
import { runCodeAnalysisAgent } from '@/lib/agent'

export async function POST(req: Request) {
  const { message, fileContent, conversationId } = await req.json()

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser(token!)

  if (!user) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Guardar mensaje del usuario
  await supabase.from('codemate_messages').insert({
    role: 'user',
    content: message,
    user_id: user.id,
    conversation_id: conversationId,
  })

  // Ejecutar el agente
  const result = await runCodeAnalysisAgent(message, fileContent ?? '')

  // Construir la respuesta formateada
  const formattedResponse = `## Análisis completado en ${result.stepsExecuted} pasos

${result.analysis}

${result.improvements.length > 0 ? `## Mejoras sugeridas\n${result.improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}` : ''}

${result.summary ? `## Resumen\n${result.summary}` : ''}`

  // Guardar respuesta del agente
  await supabase.from('codemate_messages').insert({
    role: 'assistant',
    content: formattedResponse,
    user_id: user.id,
    conversation_id: conversationId,
  })

  return Response.json({ text: formattedResponse, steps: result.stepsExecuted })
}
