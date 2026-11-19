import { readFileSync, writeFileSync } from 'node:fs';

// Source export names differ from the earlier storyboard asset table.
// These associations were checked against the article captions AND the actual images.
const mapping = {
  chatgpt: [14, 'https://www.japanpowered.com/writing/chatgpt-and-bloggings-future'],
  copilot: [23, 'https://code.visualstudio.com/docs/agents/agent-troubleshooting/faq'],
  cursor: [1, 'https://aidd.jp/blog/knowledge/cursor-ai-complete-guide/'],
  aider: [4, 'https://aider.chat/'],
  devin: [19, 'https://www.toksta.com/products/devin-ai'],
  windsurf: [6, 'https://www.datacamp.com/tutorial/windsurf-ai-agentic-code-editor'],
  cline: [9, 'https://cline.bot/'],
  n8n: [16, 'https://betazeta.dev/blog/automatization-n8n-nodes/'],
  dify: [13, 'https://dify.ai/zh/workflows'],
  coze: [0, 'https://blog.csdn.net/xianyu120/article/details/137353856'],
  trae: [
    25,
    'https://www.clubic.com/actualite-551492-bytedance-tiktok-lance-son-concurrent-a-vs-code-et-cursor-ai-et-il-est-totalement-gratuit-pour-l-instant.html',
  ],
  'claude-code': [5, 'https://anthropic.skilljar.com/claude-code-101'],
  'codex-web': [15, ''],
  manus: [11, 'https://workos.com/blog/introducing-manus-the-general-ai-agent'],
  cowork: [22, 'https://academy.claude.com/tutorials/get-started-in-claude-cowork-in-three-steps'],
  openclaw: [24, 'https://skywork.ai/skypage/en/openclaw-agent-framework-ai/2049089901959643136'],
  'codex-agents': [21, 'https://community.openai.com/t/hierarchical-multi-agent-workflow-visual-tree-based-agent-orchestration-in-codex-app/1401395'],
  workbuddy: [18, 'https://cloud.tencent.com/act/pro/workbuddy'],
  dumate: [20, 'https://qianfan.cloud.baidu.com/qianfandev/topic/687919'],
  qoderwork: [8, 'https://yunpan.plus/t/11911-1-1'],
  doubao: [2, 'https://www.cbinews.com/AI/g0qxu'],
  harness: [10, 'https://tenten.co/learning/deepseek-harness-desktop-app-walkthrough/'],
};
const url = new URL('../production/assets.json', import.meta.url);
const assets = JSON.parse(readFileSync(url, 'utf8'));
for (const asset of assets) {
  if (asset.originalPath) continue; // Collected assets already retain their original file and source links.
  if (!mapping[asset.id]) throw new Error('Missing source mapping: ' + asset.id);
  const [number, sourceUrl] = mapping[asset.id];
  asset.original = number ? `image ${number}.png` : 'image.png';
  asset.sourceUrl = sourceUrl;
  delete asset.ui;
}
writeFileSync(url, JSON.stringify(assets, null, 2) + '\n');
console.log('Mapped source article images; retained ' + assets.filter((a) => a.originalPath).length + ' collected originals.');
