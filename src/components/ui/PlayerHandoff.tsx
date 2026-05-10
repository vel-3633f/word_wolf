"use client";

import { Button } from "./Button";
import { Card } from "./Card";

export function PlayerHandoff({
  playerName,
  onConfirm,
  description,
}: {
  playerName: string;
  onConfirm: () => void;
  description?: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-6 text-center">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        次のプレイヤーに端末を渡してください
      </div>
      <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        {playerName} さんの番です
      </div>
      {description && (
        <p className="text-zinc-600 dark:text-zinc-300 text-sm">
          {description}
        </p>
      )}
      <Button onClick={onConfirm} fullWidth>
        私は {playerName} です
      </Button>
    </Card>
  );
}
