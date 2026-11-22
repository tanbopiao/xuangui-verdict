# xuangui-verdict 玄圭 · 裁决筛选引擎

> 只放行经裁决的内容。

候选条目逐条过四道闸：完整性（最小长度）→ 敏感词（硬拒）→ 来源（白名单）→ 去重（指纹重复驳回）。规则外置 JSON，闸门可增删。

```bash
node verdict.js demo.jsonl
```

输入 JSONL（id / source / fingerprint / text），输出逐条裁决（pass / reject + 理由）。

License: Apache-2.0
