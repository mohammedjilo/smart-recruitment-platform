import { describe, expect, it } from "vitest"
import { getMatchScoreColor, matchScoreColors } from "@/theme/tokens"

describe("shared match score colors", () => {
   it("uses the shared color for high scores at and above 80", () => {
      expect(getMatchScoreColor(80)).toBe(matchScoreColors.high)
      expect(getMatchScoreColor(100)).toBe(matchScoreColors.high)
   })

   it("uses the shared color for medium scores from 60 to 79", () => {
      expect(getMatchScoreColor(60)).toBe(matchScoreColors.medium)
      expect(getMatchScoreColor(79)).toBe(matchScoreColors.medium)
   })

   it("uses the shared color for low scores below 60", () => {
      expect(getMatchScoreColor(59)).toBe(matchScoreColors.low)
      expect(getMatchScoreColor(0)).toBe(matchScoreColors.low)
   })
})
