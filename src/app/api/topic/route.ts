import { NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai/client";
import { TOPIC_SYSTEM, TOPIC_USER } from "@/lib/openai/prompts";
import { TopicSchema } from "@/lib/openai/schemas";
import { FALLBACK_TOPICS } from "@/lib/fallback-topics";
import { pickRandom } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 10;
export const dynamic = "force-dynamic";

export async function POST() {
  const client = getOpenAI();
  if (!client) {
    return NextResponse.json({
      ...pickRandom(FALLBACK_TOPICS),
      source: "fallback",
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 1.1,
      messages: [
        { role: "system", content: TOPIC_SYSTEM },
        { role: "user", content: TOPIC_USER },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = TopicSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new Error("topic schema invalid");
    return NextResponse.json({ ...parsed.data, source: "ai" });
  } catch (err) {
    console.error("[/api/topic] fallback:", err);
    return NextResponse.json({
      ...pickRandom(FALLBACK_TOPICS),
      source: "fallback",
    });
  }
}
