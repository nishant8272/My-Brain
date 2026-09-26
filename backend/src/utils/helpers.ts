export function random(len: number = 10): string {
  const options = "qwertyuiopasdfghjklzxcvbnm1234567890";
  let ans = "";
  for (let i = 0; i < len; i++) {
    ans += options[Math.floor(Math.random() * options.length)];
  }
  return ans;
}

export function chunkText(text: string, maxTokens: number = Number(process.env.MAX_CHUNK_TOKENS) || 500): string[] {
  const maxChars = maxTokens * 4;
  const parts = text.replace(/\r\n/g, '\n').split(/\n\n+/);
  const chunks: string[] = [];

  for (const para of parts) {
    if (para.length <= maxChars) {
      chunks.push(para);
    } else {
      const sentences = para.split(/(?<=[.!?])\s+/);
      let buf = '';
      for (const s of sentences) {
        if ((buf + ' ' + s).trim().length > maxChars) {
          if (buf) chunks.push(buf.trim());
          buf = s;
        } else {
          buf = (buf ? buf + ' ' : '') + s;
        }
      }
      if (buf) chunks.push(buf.trim());
    }
  }

  return chunks.flatMap(ch => {
    if (ch.length <= maxChars) return [ch];
    const out: string[] = [];
    for (let i = 0; i < ch.length; i += maxChars) out.push(ch.slice(i, i + maxChars));
    return out;
  }).filter(Boolean);
}

export function toPineconeId(mongoId: string, userId: string, n: number = 0): string {
  return `${userId}::${mongoId}::${n}`;
}

export function parsePineconeId(id: string): { userId: string; mongoId: string; n: number } {
  const [userId, mongoId, n] = id.split('::');
  return { userId, mongoId, n: Number(n) };
}
