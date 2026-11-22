#!/usr/bin/env node
/* 玄圭 · 裁决筛选：候选条目逐条过闸，只放行经裁决的内容。
 * 四道闸：完整性（最小长度）→ 敏感词（硬拒）→ 来源（白名单）→ 去重（指纹重复驳回）。
 * 输入 JSONL：{id, source, fingerprint, text}；输出 JSONL：{id, verdict, reasons}。 */
const fs = require("fs"), crypto = require("crypto");
function adjudicate(candidates, rules) {
  const seen = new Set(), out = [];
  for (const c of candidates) {
    const reasons = [];
    if (!c.text || c.text.length < (rules.minLength ?? 1)) reasons.push("incomplete");
    const hitWord = (rules.blockedWords || []).find(w => c.text && c.text.includes(w));
    if (hitWord) reasons.push(`blocked-word:${hitWord}`);
    if (rules.sourceWhitelist && !rules.sourceWhitelist.includes(c.source)) reasons.push("source-not-allowed");
    const fp = c.fingerprint || crypto.createHash("sha256").update(c.text || "").digest("hex").slice(0, 16);
    if (seen.has(fp)) reasons.push("duplicate");
    seen.add(fp);
    out.push({ id: c.id, verdict: reasons.length ? "reject" : "pass", reasons });
  }
  return out;
}
module.exports = { adjudicate };
if (require.main === module) {
  const [inFile, rulesFile] = [process.argv[2], process.argv[3] || `${__dirname}/rules.json`];
  if (!inFile) { console.error("用法: node verdict.js <候选JSONL> [规则JSON]"); process.exit(1); }
  const candidates = fs.readFileSync(inFile, "utf8").split("\n").filter(Boolean).map(JSON.parse);
  const out = adjudicate(candidates, JSON.parse(fs.readFileSync(rulesFile, "utf8")));
  out.forEach(r => console.log(`${r.id}: ${r.verdict}${r.reasons.length ? " (" + r.reasons.join(", ") + ")" : ""}`));
}
