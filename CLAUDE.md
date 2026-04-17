@AGENTS.md

# CodeMate — Contexto del proyecto

## ¿Qué es este proyecto?
CodeMate es un asistente de programación con IA construido con Next.js 15, TypeScript y Supabase. Permite a los usuarios tener múltiples conversaciones, subir archivos de código e imágenes, y recibir respuestas con formato markdown.

## Stack
- **Framework:** Next.js 15 con App Router
- **IA:** OpenAI GPT-4o via Vercel AI SDK v6
- **Base de datos:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth con JWT
- **Estilos:** Tailwind CSS
- **Testing:** Vitest + Testing Library
- **Deploy:** Vercel con GitHub Actions CI/CD

## Estructura del proyecto
- `app/page.tsx` — Página principal del chat con sidebar
- `app/login/page.tsx` — Login y registro
- `app/api/chat/route.ts` — Backend que procesa mensajes y llama a OpenAI
- `lib/supabase.ts` — Cliente de Supabase para el browser
- `__tests__/` — Tests unitarios y de componentes

## Convenciones de código
- Todos los componentes con interacción llevan `'use client'` arriba
- Los colores del proyecto usan violet-600 como primario
- Los mensajes de error se muestran en el chat con el prefijo ⚠️
- Rate limiting: máximo 20 requests por minuto por usuario
- Límite de archivos: 4MB máximo

## Base de datos
- `codemate_conversations` — Conversaciones por usuario
- `codemate_messages` — Mensajes con conversation_id y user_id
- Row Level Security activo — cada usuario solo ve sus datos

## Reglas importantes
- NUNCA hardcodear API keys
- SIEMPRE validar el token JWT en los Route Handlers
- SIEMPRE agregar tests cuando se crea una función nueva
- Los archivos de más de 4MB deben rechazarse antes de procesarse
- Usar `generateText` para respuestas simples, `streamText` para el chat
