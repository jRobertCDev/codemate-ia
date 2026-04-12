import { openai } from "@ai-sdk/openai";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const formData = await req.formData();
  const messages = JSON.parse(formData.get("messages") as string);
  const file = formData.get("file") as File | null;

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const {
    data: { user },
  } = await supabase.auth.getUser(token!);

  if (!user) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  // Leer el archivo si existe
  let fileContent = "";
  if (file) {
    fileContent = await file.text();
  }

  // Guardar mensaje del usuario
  const lastUserMessage = messages[messages.length - 1];
  await supabase.from("codemate_messages").insert({
    role: lastUserMessage.role,
    content: lastUserMessage.content,
    user_id: user.id,
  });

  // Si hay archivo, agregarlo al contexto del modelo
  const systemWithFile = fileContent
    ? `Sos CodeMate, un asistente experto en programación.
      Respondés siempre en español con formato markdown.
      Usás bloques de código con el lenguaje correcto cuando mostrás código.
      Sos directo, claro y preciso.
      
      El usuario subió este archivo:
      \`\`\`
      ${fileContent}
      \`\`\``
    : `Sos CodeMate, un asistente experto en programación.
      Respondés siempre en español con formato markdown.
      Usás bloques de código con el lenguaje correcto cuando mostrás código.
      Sos directo, claro y preciso.`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemWithFile,
    messages,
    tools: {
      getTime: tool({
        description: "Obtiene la fecha y hora actual",
        inputSchema: z.object({}),
        execute: async () => {
          const now = new Date();
          return {
            date: now.toLocaleDateString("es-AR"),
            time: now.toLocaleTimeString("es-AR"),
          };
        },
      }),
    },
    stopWhen: stepCountIs(3),
    onFinish: async ({ text }) => {
      await supabase.from("codemate_messages").insert({
        role: "assistant",
        content: text,
        user_id: user.id,
      });
    },
  });

  return result.toTextStreamResponse();
}
