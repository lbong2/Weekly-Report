/**
 * 마크다운 텍스트를 PPT bullet 포인트로 변환하는 유틸리티
 */

const INDENT_SPACES = 2;

export interface BulletPoint {
  text: string;
  level: number; // 0, 1, 2 (depth)
}

/**
 * 마크다운 리스트를 파싱하여 bullet 포인트 배열로 변환
 *
 * 예시 입력:
 * ```
 * - 1depth 항목
 *   - 2depth 항목
 *     - 3depth 항목
 * ```
 *
 * 출력: [
 *   { text: '1depth 항목', level: 0 },
 *   { text: '2depth 항목', level: 1 },
 *   { text: '3depth 항목', level: 2 }
 * ]
 */
export function parseMarkdownToBullets(markdown: string | null | undefined): BulletPoint[] {
  if (!markdown) {
    return [];
  }

  const lines = markdown.split('\n');
  const bullets: BulletPoint[] = [];

  for (const line of lines) {
    // 빈 줄은 스킵
    if (!line.trim()) {
      continue;
    }

    // 들여쓰기 레벨 계산 (공백 2개 = 1레벨)
    const leadingSpaces = line.match(/^ */)?.[0].length || 0;
    const level = Math.floor(leadingSpaces / INDENT_SPACES);

    // '- ' 또는 '* ' 제거하고 텍스트 추출
    const text = line.trim().replace(/^[-*]\s+/, '');

    if (text) {
      bullets.push({
        text,
        level: Math.min(level, 2), // 최대 3레벨까지만
      });
    }
  }

  return bullets;
}

/**
 * bullet 포인트를 pptxgenjs 포맷으로 변환
 */
export function bulletsToTextOptions(bullets: BulletPoint[]): any[] {
  return bullets.map(bullet => ({
    text: bullet.text,
    options: {
      bullet: true,
      indentLevel: bullet.level,
      fontSize: 14,
      color: '000000',
    },
  }));
}
