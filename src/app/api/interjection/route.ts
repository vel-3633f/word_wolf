import { NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai/client";
import {
  INTERJECTION_USER,
  interjectionSystem,
} from "@/lib/openai/prompts";
import { InterjectionSchema } from "@/lib/openai/schemas";
import { pickRandom } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 10;
export const dynamic = "force-dynamic";

const FALLBACK_VILLAGER = [
  "そういえば、これって意外と身近にあるよね。",
  "ぱっと思いつくのは家でよく見るやつかな。",
  "うーん、これ好きな人多いと思うんだよね。",
];
const FALLBACK_WOLF = [
  "うーん…まあ、どっちとも言えるかな。",
  "なんとなくで言うとよくあるやつだよね。",
  "うん、普通だと思う！特に変なところはない。",
];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    aiIsWolf?: boolean;
    aiWord?: string;
    topicTheme?: string;
    recentTalkLog?: string[];
  };

  const aiIsWolf = !!body.aiIsWolf;
  const aiWord = body.aiWord ?? "";
  const topicTheme = body.topicTheme ?? "";

  const client = getOpenAI();
  if (!client) {
    return NextResponse.json({
      utterance: pickRandom(aiIsWolf ? FALLBACK_WOLF : FALLBACK_VILLAGER),
      source: "fallback",
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content: interjectionSystem({ aiIsWolf, aiWord, topicTheme }),
        },
        {
          role: "user",
          content:
            (body.recentTalkLog && body.recentTalkLog.length > 0
              ? `これまでの議論の流れ:\n${body.recentTalkLog.join("\n")}\n\n`
              : "") + INTERJECTION_USER,
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = InterjectionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new Error("interjection schema invalid");
    return NextResponse.json({ ...parsed.data, source: "ai" });
  } catch (err) {
    console.error("[/api/interjection] fallback:", err);
    return NextResponse.json({
      utterance: pickRandom(aiIsWolf ? FALLBACK_WOLF : FALLBACK_VILLAGER),
      source: "fallback",
    });
  }
}
