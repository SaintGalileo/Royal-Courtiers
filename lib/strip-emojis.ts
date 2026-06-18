/**
 * Remove emoji characters from text while preserving letters, numbers, and
 * ordinary punctuation. Collapses extra whitespace left behind.
 */
export function stripEmojis(value: string): string {
  return value
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function nicknameHasEmoji(value: string): boolean {
  return /\p{Extended_Pictographic}/u.test(value);
}

export function stripNicknameForExport(
  nickName: string,
  fallback?: string | null,
): string {
  const stripped = stripEmojis(nickName);
  if (stripped) return stripped;
  if (fallback) {
    const fallbackStripped = stripEmojis(fallback);
    if (fallbackStripped) return fallbackStripped;
    return fallback.trim();
  }
  return nickName.trim();
}

export function rosterRowNeedsEmojiStrip(row: {
  nick_name: string;
}): boolean {
  return nicknameHasEmoji(row.nick_name);
}

export function stripEmojisFromRosterRows<
  T extends { nick_name: string; defaultNickName?: string },
>(rows: T[]): { rows: T[]; updatedCount: number } {
  let updatedCount = 0;
  const next = rows.map((row) => {
    if (!rosterRowNeedsEmojiStrip(row)) return row;
    const cleaned = stripNicknameForExport(row.nick_name, row.defaultNickName);
    if (cleaned === row.nick_name) return row;
    updatedCount++;
    return { ...row, nick_name: cleaned };
  });
  return { rows: next, updatedCount };
}

export type NicknameCleanup = {
  id: string;
  before: string;
  after: string;
  usedFirstNameFallback: boolean;
};

export function cleanNickname(
  nickName: string,
  firstName: string,
): { after: string; usedFirstNameFallback: boolean } {
  const stripped = stripEmojis(nickName);
  if (stripped) {
    return { after: stripped, usedFirstNameFallback: false };
  }
  return {
    after: firstName.trim(),
    usedFirstNameFallback: true,
  };
}

export function listNicknameEmojiCleanups<
  T extends { id: string; nick_name: string; first_name: string },
>(members: T[]): Array<NicknameCleanup & { member: T }> {
  return members
    .filter((member) => nicknameHasEmoji(member.nick_name))
    .map((member) => {
      const { after, usedFirstNameFallback } = cleanNickname(
        member.nick_name,
        member.first_name,
      );
      return {
        member,
        id: member.id,
        before: member.nick_name,
        after,
        usedFirstNameFallback,
      };
    })
    .filter((change) => change.before !== change.after);
}
