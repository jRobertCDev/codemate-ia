import { openai } from "@ai-sdk/openai";
import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const formData = await req.formData();
  const messages = JSON.parse(formData.get("messages") as string);
  const conversationId = formData.get("conversationId") as string;
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

  // Leer archivo si existe
  let fileContent = "";
  let imageBase64 = "";
  let imageMimeType = "";

  if (file) {
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const buffer = await file.arrayBuffer();
      imageBase64 = Buffer.from(buffer).toString("base64");
      imageMimeType = file.type;
    } else {
      fileContent = await file.text();
    }
  }

  // Guardar mensaje del usuario
  const lastUserMessage = messages[messages.length - 1];
  await supabase.from("codemate_messages").insert({
    role: lastUserMessage.role,
    content: lastUserMessage.content,
    user_id: user.id,
    conversation_id: conversationId,
  });

  // Actualizar updated_at de la conversación
  await supabase
    .from("codemate_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  const systemPrompt = fileContent
    ? `Sos CodeMate, un asistente experto en programación.
    Respondés siempre en español con formato markdown.
    Usás bloques de código con el lenguaje correcto cuando mostrás código.
    
    El usuario subió este archivo:
    \`\`\`
    ${fileContent}
    \`\`\``
    : `Sos CodeMate, un asistente experto en programación.
    Respondés siempre en español con formato markdown.
    Usás bloques de código con el lenguaje correcto cuando mostrás código.
    Sos directo, claro y preciso.`;

  // Si hay imagen, la agregamos al último mensaje del usuario
  const messagesWithImage = imageBase64
    ? messages.map((m: { role: string; content: string }, index: number) => {
        if (index === messages.length - 1 && m.role === "user") {
          return {
            role: "user",
            content: [
              { type: "text", text: m.content },
              {
                type: "image",
                image: `data:${imageMimeType};base64,${imageBase64}`,
              },
            ],
          };
        }
        return m;
      })
    : messages;

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages: messagesWithImage,
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
        conversation_id: conversationId,
      });

      if (messages.length === 1) {
        const title = lastUserMessage.content.slice(0, 50);
        await supabase
          .from("codemate_conversations")
          .update({ title })
          .eq("id", conversationId);
      }
    },
  });

  return result.toTextStreamResponse();
}
