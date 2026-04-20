import { z } from "zod";

export const CompareResultSchema = z.object({
  theme: z.string().describe("一言で捉えた2対象の関係性。"),
  similarities: z.array(z.string()).min(2).max(5).describe("似ている点を2-5個。各項目は具体的な観察で、「〜であるところ」「〜を共有している」「〜が近い」のように結ぶ."),
  differences: z.array(z.string()).min(2).max(5).describe("違う点を2-5個。12軸の差・スケールの差・役割の差などから取り上げる."),
  surprising_insight: z.string().describe("意外な発見・非自明な共通点や対比。表面では気づかない、深い一致や鋭い違いを一つ指摘する."),
  overall: z.string().describe("全体の印象を2-3文。カジュアルで温かい語り口で、両者への敬意を込めて."),
});

export type CompareResult = z.infer<typeof CompareResultSchema>;
