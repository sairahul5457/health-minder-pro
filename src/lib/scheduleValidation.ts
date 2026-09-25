export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const sortTimes = (times: string[]) =>
  [...times].sort((a, b) => toMinutes(a) - toMinutes(b));

export interface GapViolation {
  from: string;
  to: string;
  gapHours: number;
}

/** Sort times chronologically and check every consecutive interval. */
export const findGapViolations = (times: string[], minHours: number): GapViolation[] => {
  const sorted = sortTimes(times);
  const out: GapViolation[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = (toMinutes(sorted[i]) - toMinutes(sorted[i - 1])) / 60;
    if (gap < minHours) out.push({ from: sorted[i - 1], to: sorted[i], gapHours: gap });
  }
  return out;
};

export const formatTime12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

export const formatHours = (h: number) => {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins ? `${hrs}h ${mins}m` : `${hrs} hour${hrs === 1 ? "" : "s"}`;
};
