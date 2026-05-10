import { NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai/client";
import { GM_SYSTEM, gmUser } from "@/lib/openai/prompts";
import { GmSchema } from "@/lib/openai/schemas";

export const runtime = "nodejs";
export const maxDuration = 10;
export const dynamic = "force-dynamic";

const FALLBACK: Record<string, string> = {
  opening:
    "ようこそ、ワードウルフへ！今日は誰がウルフになるかな？それじゃあ始めるよ！",
  reveal_intro:
    "これからお題を確認します。他の人に絶対見せないでね、こっそり見るんだよ！",
  discussion_start:
    "議論スタート！自分のワードを直接言わずに探り合ってね。",
  vote_start: "投票タイム！誰がウルフだと思う？よく考えて選んでね。",
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { scene?: string };
  const scene = body.scene ?? "opening";

  const client = getOpenAI();
  if (!client) {
    return NextResponse.json({
      message: FALLBACK[scene] ?? FALLBACK.opening,
      source: "fallback",
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.9,
      messages: [
        { role: "system", content: GM_SYSTEM },
        { role: "user", content: gmUser(scene) },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = GmSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new Error("gm schema invalid");
    return NextResponse.json({ ...parsed.data, source: "ai" });
  } catch (err) {
    console.error("[/api/gm] fallback:", err);
    return NextResponse.json({
      message: FALLBACK[scene] ?? FALLBACK.opening,
      source: "fallback",
    });
  }
}
