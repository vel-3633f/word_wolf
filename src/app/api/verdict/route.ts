import { NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai/client";
import { VERDICT_SYSTEM } from "@/lib/openai/prompts";
import { VerdictSchema } from "@/lib/openai/schemas";

export const runtime = "nodejs";
export const maxDuration = 10;
export const dynamic = "force-dynamic";

type VerdictBody = {
  mode: "2p" | "3p";
  winner: "villagers" | "wolf" | "humans" | "fail";
  majorityWord: string;
  minorityWord: string;
  theme: string;
  wolfName?: string;
  votedName?: string;
  human1?: { name: string; word: string };
  human2?: { name: string; word: string };
  guesses?: { human1Correct: boolean; human2Correct: boolean };
};

function fallbackNarration(b: VerdictBody): string {
  if (b.mode === "3p") {
    if (b.winner === "villagers")
      return `多数派の勝利！ウルフは${b.wolfName ?? "謎の誰か"}でした。お題は「${b.majorityWord}」、ウルフは「${b.minorityWord}」。お見事です！`;
    return `ウルフ${b.wolfName ?? ""}の勝利！正解は「${b.majorityWord}」、ウルフは「${b.minorityWord}」でした。今回は欺き切りましたね。`;
  }
  if (b.winner === "humans")
    return `二人とも完璧に見抜きました！「${b.human1?.word}」と「${b.human2?.word}」、見事に推理成功です。`;
  return `今回は読み違いがありました。正解は「${b.human1?.name}=${b.human1?.word}」「${b.human2?.name}=${b.human2?.word}」。次は当てましょう！`;
}

export async function POST(req: Request) {
  const body = (await req.json()) as VerdictBody;
  const client = getOpenAI();

  if (!client) {
    return NextResponse.json({
      narration: fallbackNarration(body),
      source: "fallback",
    });
  }

  try {
    const userMsg =
      body.mode === "3p"
        ? `モード:3人プレイ\n勝者:${body.winner}\n多数派ワード:${body.majorityWord}\n少数派ワード:${body.minorityWord}\nテーマ:${body.theme}\n本物のウルフ:${body.wolfName}\n投票で選ばれた人:${body.votedName}`
        : `モード:2人プレイ\n勝者:${body.winner === "humans" ? "二人とも見抜けた" : "見抜けなかった"}\nテーマ:${body.theme}\n${body.human1?.name}のワード:${body.human1?.word}\n${body.human2?.name}のワード:${body.human2?.word}\n${body.human1?.name}は正解${body.guesses?.human1Correct ? "○" : "×"}、${body.human2?.name}は正解${body.guesses?.human2Correct ? "○" : "×"}`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.8,
      messages: [
        { role: "system", content: VERDICT_SYSTEM },
        { role: "user", content: userMsg },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = VerdictSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new Error("verdict schema invalid");
    return NextResponse.json({ ...parsed.data, source: "ai" });
  } catch (err) {
    console.error("[/api/verdict] fallback:", err);
    return NextResponse.json({
      narration: fallbackNarration(body),
      source: "fallback",
    });
  }
}
