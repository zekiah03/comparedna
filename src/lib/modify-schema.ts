import { z } from "zod";
import { AnalyzeCoreSchema, EnvDNASchema } from "./analyze-schema";

export const ModifyCoreSchema = AnalyzeCoreSchema.extend({
  virtual_name: z.string().describe("仮想種の名前 (例: 「手足なし人間」「1cmの象」「カラス×猫」)"),
  modification_summary: z.string().describe("改造の効果を1-2文で要約。何が変わり、何が残ったか."),
});

export type ModifyCore = z.infer<typeof ModifyCoreSchema>;

// 再エクスポート (modify も envDNA を同じ形で生成)
export { EnvDNASchema };
export type { EnvDNAResult } from "./analyze-schema";
