# CodeMate — Reglas para agentes de IA

## Contexto
Estás trabajando en CodeMate, un asistente de programación con IA.
Antes de escribir cualquier código, leé `CLAUDE.md` para entender el proyecto completo.

## Stack — versiones exactas
- Next.js 15 con App Router (NO Pages Router)
- AI SDK v6 — usa `inputSchema` en tools (NO `parameters`)
- AI SDK v6 — usa `stopWhen: stepCountIs(n)` (NO `maxSteps`)
- AI SDK v6 — usa `streamText` + `toTextStreamResponse()` en el backend
- Supabase JS v2 con `@supabase/ssr` para browser client
- Vitest v4 para tests (NO Jest)

## Lo que SIEMPRE debés hacer
- Leer los archivos relevantes antes de modificarlos
- Agregar tests en `__tests__/` cuando creás funciones nuevas
- Validar el token JWT al inicio de cada Route Handler
- Usar TypeScript estricto — nunca usar `any` sin justificación
- Seguir el patrón existente de manejo de errores

## Lo que NUNCA debés hacer
- Usar Pages Router (`pages/` directory)
- Hardcodear secrets o API keys
- Modificar `.env.local` directamente
- Borrar tests existentes
- Usar `maxSteps` o `parameters` en AI SDK v6
- Hacer queries SQL directas — usar siempre el cliente de Supabase

## Flujo para agregar una feature nueva
1. Leer el código existente relacionado
2. Escribir el código de la feature
3. Agregar tests que cubran los casos principales
4. Verificar que todos los tests pasen con `npm run test:run`
5. Commitear en `development` con un mensaje descriptivo

## Estructura de un Route Handler
```ts
export async function POST(req: Request) {
  // 1. Parsear el body
  // 2. Obtener el token de Authorization header
  // 3. Validar el usuario con supabase.auth.getUser(token)
  // 4. Verificar rate limit
  // 5. Validar inputs
  // 6. Lógica principal
  // 7. Retornar respuesta
}
```

## Cuando algo no funciona
- Revisar la versión exacta del SDK antes de buscar soluciones
- La documentación de AI SDK v6 está en https://ai-sdk.dev/docs
- La documentación de Supabase está en https://supabase.com/docs
