import { z } from "zod";

export const HumanProfileSchema = z.object({
  name:     z.string().describe("氏名 (漢字 4-10字)。対象にふさわしい響きの日本人名。"),
  furigana: z.string().describe("氏名のふりがな (ひらがな、姓と名の間に半角スペース)"),
  age:      z.number().int().min(0).max(120).describe("年齢(整数)。対象を人間の一生に例えた時、現時点で何歳か。対象の寿命ステージに忠実に。"),
  gender:   z.string().describe("性別。『男性』『女性』『どちらでもない』など"),
  location: z.string().describe("出身地と現住所を一行で。例: 『青森県出身、現在は東京都杉並区』『岐阜県土岐市に3代』"),
  current:  z.string().describe("現在の肩書き・所属を具体的に一行で。例: 『大田区の町工場の二代目社長』『無職、実家暮らし』『保育園年中組』"),
  education: z.string().describe("学歴を1-2文で簡潔に。大学進学した場合のみ大学名・学部を具体的に。例: 『都立青山高校普通科卒』『中卒、そのまま父の鍛冶屋へ』『早稲田大学商学部を4年で中退、起業』"),
  career:    z.string().describe("職歴を2-3文で端的に。転職・挫折・現職まで時系列の要点。例: 『新卒で大手電機メーカーに入社するも3年で退職、地方で小さな工場の立ち上げに参加。40代で独立し町工場の二代目として現在に至る』"),
  family:   z.string().describe("家族構成を一行で。例: 『妻と子供2人、実家は札幌』『独身、猫1匹』『天涯孤独』"),
  hobbies:  z.string().describe("趣味・特技を一行で。具体的に。例: 『囲碁、山菜採り、古地図収集』"),
  self_pr:  z.string().describe("自己PR (3-5文、一人称)。本人の口調を固定 (関西弁/ぶっきらぼう/異常に丁寧/体育会系/文学少女風 など)。性格・強み・いま考えていることを飾らず。"),
  motto:    z.string().describe("座右の銘・口癖。鉤括弧なしで短く。本人が言いそうな一言。"),
});

export type HumanProfile = z.infer<typeof HumanProfileSchema>;

// 互換
export const AnalogyResultSchema = HumanProfileSchema;
export type AnalogyResult = HumanProfile;
