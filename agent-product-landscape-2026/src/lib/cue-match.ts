const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]/g, '');
const similarity = (a: string, b: string) => {
  const one = normalize(a),
    two = normalize(b);
  if (one === two) return 1;
  const pairs = (text: string) => new Set(Array.from({ length: Math.max(0, text.length - 1) }, (_, i) => text.slice(i, i + 2)));
  const first = pairs(one),
    second = pairs(two);
  const shared = [...first].filter((pair) => second.has(pair)).length;
  return first.size + second.size ? (2 * shared) / (first.size + second.size) : 0;
};

/** Keep semantic motion anchors when words are edited or sentences are inserted/deleted. */
export function matchScriptCues(authored: readonly { text: string }[], edited: readonly { text: string }[]) {
  let previous = 0;
  return edited.map((cue, index) => {
    let best = previous,
      score = 0;
    for (let at = previous; at < authored.length; at++) {
      const candidate = similarity(cue.text, authored[at].text);
      if (candidate > score) {
        score = candidate;
        best = at;
      }
    }
    const position = edited.length === authored.length ? Math.min(index, authored.length - 1) : previous;
    const selected = score >= 0.3 ? best : Math.max(previous, position);
    previous = Math.max(previous, selected);
    return selected;
  });
}
