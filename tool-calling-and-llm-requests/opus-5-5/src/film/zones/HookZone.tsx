// S1 开场 + S9 结尾，都在这块画布上发生。
// 左：我的 WebUI lite（工具调用又长又重复 → 结尾按 generation_id 分组）
// 右：Codex 原生 WebUI（“Read files, ran commands” 折叠摘要）
import React from "react";
import {ZONE, zoneOpacity} from "../timeline";
import {C, FONT, alpha} from "../theme";
import {clamp01, ease, lerp, out, outBack, prog, pulse, spring} from "../ease";
import {
  Box,
  Caps,
  DrawPath,
  IconBook,
  IconBubble,
  IconCheck,
  IconChevron,
  IconSpark,
  IconTerminal,
  Mono,
  Spinner,
  Tag,
  solidPanel,
} from "../ui/primitives";

const A = {x: 140, y: 120, w: 760, h: 740}; // 我的 WebUI lite
const B = {x: 1020, y: 120, w: 760, h: 740}; // Codex 原生
const LIST_TOP = 100;
const LIST_H = A.h - LIST_TOP;
const ROW_H = 70;

// ── S1：又长又重复的工具调用列表（重建自原文截图） ──
// 原截图里的 Windows 路径（JSON 转义后的双反斜杠），运行时拼接
const SEP = String.fromCharCode(92, 92);
const PWSH = `"${["C" + ":", "Users", "R7000", "AppData", "Local", "Microsoft", "WindowsApps", "Microsoft.PowerShell_8wekyb3d8bbwe", "pwsh.exe"].join(SEP)}" -Command "Get-Content src/index.ts"`;
const PATTERN: Array<"cmd" | "think"> = ["cmd", "cmd", "think", "cmd", "think", "think", "think", "cmd", "think"];
const HOOK_ROWS = Array.from({length: 26}, (_, i) => PATTERN[i % PATTERN.length]);
const rowAt = (i: number) => 0.9 + i * 0.34;

// ── S9：同一个 Turn 的工具记录（就是 S3 的例子） ──
type PRow = {kind: "think" | "tool" | "msg"; text: string; gen: 0 | 1 | 2 | 3};
const PAYOFF_ROWS: PRow[] = [
  {kind: "think", text: "Reasoning", gen: 0},
  {kind: "tool", text: 'read_file("a.ts")', gen: 1},
  {kind: "tool", text: 'read_file("b.ts")', gen: 1},
  {kind: "tool", text: 'read_file("c.ts")', gen: 1},
  {kind: "think", text: "Reasoning", gen: 0},
  {kind: "tool", text: 'grep("AgentRunState")', gen: 2},
  {kind: "tool", text: 'grep("version")', gen: 2},
  {kind: "think", text: "Reasoning", gen: 0},
  {kind: "msg", text: "项目结构分析完成……", gen: 3},
];
const GROUPS = [
  {gen: 1, label: "3 个 Tool Calls", n: 3, right: "read_file × 3"},
  {gen: 2, label: "2 个 Tool Calls", n: 2, right: "grep × 2"},
  {gen: 3, label: "最终回答", n: 0, right: "message"},
];

const CODEX_ROWS: Array<{verb: "Read" | "Ran"; obj: string}> = [
  {verb: "Read", obj: "MainWindow.axaml.cs"},
  {verb: "Read", obj: "index.ts"},
  {verb: "Ran", obj: "rg --files -g AGENTS.md -g '!node…"},
  {verb: "Ran", obj: "Get-Location; git status --short"},
  {verb: "Read", obj: "cloudResourceHelper.ts"},
  {verb: "Read", obj: "index.ts"},
  {verb: "Read", obj: "AGENTS.md"},
  {verb: "Ran", obj: "rg -n 'AgentRunState|ProjectState…"},
  {verb: "Read", obj: "versionUtils.ts"},
];

const T = {
  panelA: 0.3,
  dupFlash: 6.8,
  panelB: 8.4,
  redBox: 10.9,
  unfold: 12.4,
  bracket: 13.9,
  bracketSolid: 15.3,
  guessTag: 14.4,
  bubbles: [17.2, 18.0, 18.7],
  strike: 19.3,
  guessFade: 19.8,
  hookOut: 22.0,
  payoffIn: 160.6,
  genTags: 163.8,
  group: 166.8,
  groupNote: 168.6,
  codexFold: 171.4,
  roles: 172.4,
};

const RowShell: React.FC<{y: number; opacity: number; flash?: number; children: React.ReactNode}> = ({y, opacity, flash = 0, children}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: y,
      width: A.w,
      height: ROW_H,
      opacity,
      borderBottom: `1px solid ${C.line}`,
      background: flash > 0 ? alpha(C.red, 0.12 * flash) : "transparent",
      boxShadow: flash > 0 ? `inset 3px 0 0 ${alpha(C.red, flash)}` : "none",
    }}
  >
    {children}
  </div>
);

const HookList: React.FC<{t: number}> = ({t}) => {
  // 平滑的已出现行数 → 列表持续往上滚
  let shown = 0;
  for (let i = 0; i < HOOK_ROWS.length; i++) shown += out(prog(t, rowAt(i), 0.3));
  const content = shown * ROW_H;
  const scroll = Math.max(0, content - LIST_H);
  const flash = pulse(t, T.dupFlash, 1.3);
  const thumbH = content > LIST_H ? Math.max(48, (LIST_H * LIST_H) / content) : 0;
  const thumbY = content > LIST_H ? (scroll / content) * LIST_H : 0;
  return (
    <>
      {HOOK_ROWS.map((kind, i) => {
        const p = out(prog(t, rowAt(i), 0.3));
        if (p <= 0) return null;
        const y = i * ROW_H - scroll + (1 - p) * 18;
        if (y > LIST_H + 10 || y < -ROW_H - 10) return null;
        return (
          <RowShell key={i} y={y} opacity={p} flash={kind === "cmd" ? flash : 0}>
            <Box x={24} y={23}>
              {kind === "cmd" ? <IconTerminal size={24} color={C.green} /> : <IconSpark size={24} color={C.text3} />}
            </Box>
            <Box x={64} y={13}>
              <Caps size={12} color={kind === "cmd" ? alpha(C.green, 0.85) : C.text3}>
                {kind === "cmd" ? "Command" : "Thinking"}
              </Caps>
            </Box>
            <Box x={64} y={35} w={610} style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
              <Mono size={15} color={kind === "cmd" ? C.text2 : C.text3}>
                {kind === "cmd" ? PWSH : "Reasoning"}
              </Mono>
            </Box>
            <Box x={712} y={23}>
              <IconCheck size={24} color={alpha(C.green, 0.8)} />
            </Box>
          </RowShell>
        );
      })}
      {thumbH > 0 && (
        <div style={{position: "absolute", right: 6, top: thumbY, width: 4, height: thumbH, borderRadius: 2, background: alpha(C.text, 0.22)}} />
      )}
    </>
  );
};

const PayoffList: React.FC<{t: number}> = ({t}) => {
  const g = ease(t, T.group, 1.6);
  const headerY = (gen: number) => 16 + (gen - 1) * 88;
  return (
    <>
      {PAYOFF_ROWS.map((r, i) => {
        const pin = out(prog(t, T.payoffIn + 0.4 + i * 0.07, 0.4));
        if (pin <= 0) return null;
        const baseY = i * ROW_H;
        const targetY = r.gen > 0 ? headerY(r.gen) : baseY;
        const y = lerp(baseY, targetY, g) + (1 - pin) * 16;
        const fadeOut = r.kind === "think" ? 1 - ease(t, T.group - 0.4, 0.6) : 1 - clamp01((g - 0.55) / 0.35);
        const tagP = r.gen > 0 ? outBack(prog(t, T.genTags + i * 0.12, 0.35)) : 0;
        const color = r.kind === "tool" ? C.green : r.kind === "msg" ? C.blue : C.text3;
        return (
          <RowShell key={i} y={y} opacity={pin * fadeOut}>
            <Box x={24} y={23}>
              {r.kind === "tool" ? (
                <IconTerminal size={24} color={C.green} />
              ) : r.kind === "msg" ? (
                <IconBubble size={24} color={C.blue} />
              ) : (
                <IconSpark size={24} color={C.text3} />
              )}
            </Box>
            <Box x={64} y={13}>
              <Caps size={12} color={alpha(color, 0.9)}>
                {r.kind === "tool" ? "Tool Call" : r.kind === "msg" ? "Message" : "Thinking"}
              </Caps>
            </Box>
            <Box x={64} y={35}>
              <span style={{fontFamily: r.kind === "msg" ? FONT.sans : FONT.mono, fontSize: r.kind === "msg" ? 17 : 16, color: r.kind === "think" ? C.text3 : C.text}}>
                {r.text}
              </span>
            </Box>
            {r.gen > 0 && (
              <Box x={600} y={22} style={{opacity: clamp01(tagP), transform: `scale(${0.6 + 0.4 * tagP})`, transformOrigin: "left center"}}>
                <Tag color={C.blue} size={14}>{`gen_${r.gen}`}</Tag>
              </Box>
            )}
            <Box x={712} y={23}>
              <IconCheck size={24} color={alpha(C.green, 0.8)} />
            </Box>
          </RowShell>
        );
      })}
      {GROUPS.map((gr, k) => {
        const p = clamp01((g - 0.45) / 0.45) * out(prog(t, T.group + 0.7 + k * 0.12, 0.5));
        if (p <= 0) return null;
        const accent = gr.gen === 3 ? C.blue : C.green;
        return (
          <div
            key={gr.gen}
            style={{
              position: "absolute",
              left: 16,
              top: headerY(gr.gen),
              width: A.w - 32,
              height: 72,
              opacity: p,
              transform: `translateY(${(1 - p) * 10}px)`,
              borderRadius: 14,
              background: alpha(C.blue, 0.07),
              border: `1px solid ${alpha(C.blue, 0.35)}`,
            }}
          >
            <Box x={16} y={25}>
              <IconChevron dir="right" size={22} color={C.text2} />
            </Box>
            <Box x={48} y={21}>
              <Tag color={C.blue} size={16}>{`gen_${gr.gen}`}</Tag>
            </Box>
            <Box x={150} y={22}>
              <span style={{fontFamily: FONT.sans, fontSize: 21, fontWeight: 650, color: C.text}}>{gr.label}</span>
            </Box>
            <Box x={330} y={27} style={{display: "flex", gap: 6}}>
              {Array.from({length: Math.max(1, gr.n)}, (_, j) => (
                <span key={j} style={{width: 18, height: 18, borderRadius: 5, background: alpha(accent, 0.85), display: "inline-block"}} />
              ))}
            </Box>
            <Box x={560} y={25} w={150} style={{textAlign: "right"}}>
              <Mono size={15} color={C.text3}>{gr.right}</Mono>
            </Box>
          </div>
        );
      })}
      <Box x={24} y={16 + 3 * 88 + 14} w={A.w - 48} style={{opacity: out(prog(t, T.groupNote, 0.6))}}>
        <span style={{fontFamily: FONT.sans, fontSize: 18, color: C.text2}}>
          ↑ 一组 = 一次模型响应（同一个 <span style={{color: C.blue, fontFamily: FONT.mono}}>generation_id</span>）
        </span>
      </Box>
    </>
  );
};

export const HookZone: React.FC<{t: number}> = ({t}) => {
  const zo = zoneOpacity("hook", t);
  const pa = out(prog(t, T.panelA, 0.8));
  const pb = out(prog(t, T.panelB, 0.8));
  const payoff = t >= T.payoffIn - 0.2;
  const hookListOp = 1 - ease(t, T.payoffIn - 0.2, 0.6);

  // Codex 折叠：S1 展开，S9 收回
  const unfold = ease(t, T.unfold, 1.2) * (1 - ease(t, T.codexFold, 0.8));
  const redBox = ease(t, T.redBox, 0.8, out) * (1 - ease(t, 20.2, 0.6));

  // 猜想框：虚线 → 实线（很笃定）→ 被划掉 → 泄气
  const brIn = ease(t, T.bracket, 0.8, out);
  const brSolid = ease(t, T.bracketSolid, 0.6);
  const brOut = 1 - ease(t, T.guessFade, 0.8);
  const tagIn = outBack(prog(t, T.guessTag, 0.5));
  const strike = ease(t, T.strike, 0.4, out);
  const bubblesOut = 1 - ease(t, T.hookOut, 0.8);

  const roles = out(prog(t, T.roles, 0.6));

  return (
    <div style={{position: "absolute", left: ZONE.hook.x, top: ZONE.hook.y, width: 2400, height: 1080, opacity: zo}}>
      {/* 面板名牌 */}
      <Box x={A.x} y={72} style={{opacity: pa, display: "flex", gap: 10}}>
        <Tag color={C.violet} size={16}>我的 WebUI lite</Tag>
        <span style={{opacity: roles, transform: `translateX(${(1 - roles) * -10}px)`, display: "inline-block"}}>
          <Tag color={C.blue} size={16}>→ 执行数据模型：按 generation_id 分组</Tag>
        </span>
      </Box>
      <Box x={B.x} y={72} style={{opacity: pb, display: "flex", gap: 10}}>
        <Tag color={C.text2} size={16}>Codex 原生 WebUI</Tag>
        <span style={{opacity: roles, transform: `translateX(${(1 - roles) * -10}px)`, display: "inline-block"}}>
          <Tag color={C.text2} size={16}>→ 产品 UI 的展示策略</Tag>
        </span>
      </Box>

      {/* ── 我的 WebUI lite ── */}
      <Box x={A.x} y={A.y + (1 - pa) * 30} w={A.w} h={A.h} style={{...solidPanel(), opacity: pa, overflow: "hidden"}}>
        <Box x={28} y={34}>
          {payoff ? <IconCheck size={28} color={C.green} /> : <Spinner t={t} size={28} />}
        </Box>
        <Box x={72} y={20}>
          <span style={{fontFamily: FONT.sans, fontSize: 24, fontWeight: 700, color: C.text}}>{payoff ? "Done · 1 个 Turn" : "Working"}</span>
        </Box>
        <Box x={72} y={56}>
          <span style={{fontFamily: FONT.sans, fontSize: 16, color: C.text2}}>
            {payoff ? (
              "3 次模型响应 · 5 个 Tool Calls"
            ) : (
              <>
                <span style={{color: C.red}}>2 failed</span> · Codex is reasoning and using tools
              </>
            )}
          </span>
        </Box>
        <Box x={A.w - 130} y={36} w={100} style={{textAlign: "right"}}>
          <Mono size={17} color={C.text3}>{payoff ? "" : "8m 31s"}</Mono>
        </Box>
        <div style={{position: "absolute", left: 0, top: LIST_TOP - 4, width: A.w, height: 1, background: C.line}} />
        <div style={{position: "absolute", left: 0, top: LIST_TOP, width: A.w, height: LIST_H, overflow: "hidden"}}>
          {hookListOp > 0 && (
            <div style={{position: "absolute", inset: 0, opacity: hookListOp}}>
              <HookList t={Math.min(t, 21)} />
            </div>
          )}
          {payoff && <PayoffList t={t} />}
        </div>
      </Box>

      {/* ── Codex 原生 WebUI ── */}
      <Box x={B.x} y={B.y + (1 - pb) * 30} w={B.w} h={B.h} style={{...solidPanel(), opacity: pb, overflow: "hidden"}}>
        <Box x={32} y={24} style={{display: "flex", alignItems: "center", gap: 8}}>
          <span style={{fontFamily: FONT.sans, fontSize: 20, color: C.text2}}>Worked for 5m 14s</span>
          <IconChevron size={18} color={C.text3} />
        </Box>
        <div style={{position: "absolute", left: 32, top: 72, width: B.w - 64, height: 1, background: C.line}} />
        <Box x={32} y={92} w={B.w - 64}>
          <div style={{fontFamily: FONT.sans, fontSize: 21, lineHeight: "33px", color: C.text}}>
            I'll trace the Agent button handler and shell–web bridge, then add a version check before the panel opens. I'll leave builds and tests for you to run, as requested.
          </div>
        </Box>
        <Box x={32} y={258} style={{display: "flex", alignItems: "center", gap: 10}}>
          <IconBook size={22} color={C.text2} />
          <span style={{fontFamily: FONT.sans, fontSize: 21, color: C.text2}}>Read files, ran commands</span>
          <span style={{transform: `rotate(${unfold > 0.5 ? 0 : -90}deg)`, display: "inline-block"}}>
            <IconChevron size={18} color={C.text2} />
          </span>
        </Box>
        {CODEX_ROWS.map((r, i) => {
          const p = clamp01(unfold * CODEX_ROWS.length - i);
          if (p <= 0) return null;
          return (
            <Box key={i} x={32} y={316 + i * 44 - (1 - p) * 10} style={{opacity: p, display: "flex", alignItems: "center", gap: 10}}>
              {r.verb === "Read" ? <IconBook size={20} color={C.text3} /> : <IconTerminal size={20} color={C.text3} />}
              <span style={{fontFamily: FONT.sans, fontSize: 19, color: C.text2}}>{r.verb}</span>
              {r.verb === "Read" ? (
                <span style={{fontFamily: FONT.sans, fontSize: 19, color: C.text3, textDecoration: "underline", textUnderlineOffset: 4}}>{r.obj}</span>
              ) : (
                <Mono size={16} color={C.text3}>{r.obj}</Mono>
              )}
            </Box>
          );
        })}
        {/* 原文截图里的那个红框 */}
        <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible"}} width={B.w} height={B.h}>
          <DrawPath
            d="M20,246 C120,241 260,243 392,247 C395,265 394,285 391,302 C280,306 130,305 22,301 C18,283 18,263 21,244"
            p={redBox}
            color={C.red}
            width={3.5}
            opacity={redBox > 0 ? 1 : 0}
          />
        </svg>
      </Box>

      {/* 猜想：= 1 次 Request ? */}
      {brIn > 0 && brOut > 0 && (
        <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible", opacity: brOut}} width={2400} height={1080}>
          <rect
            x={1030}
            y={356}
            width={740}
            height={496}
            rx={18}
            fill={alpha(C.amber, 0.05 * brSolid)}
            stroke={C.amber}
            strokeWidth={3}
            strokeDasharray={brSolid > 0.5 ? undefined : "12 10"}
            opacity={brIn}
            style={{filter: brSolid > 0 ? `drop-shadow(0 0 ${14 * brSolid}px ${alpha(C.amber, 0.6)})` : undefined}}
          />
        </svg>
      )}
      {tagIn > 0 && brOut > 0 && (
        <Box
          x={1600}
          y={330}
          style={{
            opacity: clamp01(tagIn) * brOut * (1 - 0.4 * strike),
            transform: `scale(${0.7 + 0.3 * tagIn}) rotate(${-4 * strike}deg) translateY(${8 * strike}px)`,
            transformOrigin: "left center",
          }}
        >
          <div
            style={{
              position: "relative",
              padding: "8px 16px",
              borderRadius: 10,
              background: C.panel2,
              border: `2px solid ${C.amber}`,
              fontFamily: FONT.sans,
              fontSize: 22,
              fontWeight: 700,
              color: C.amber,
              whiteSpace: "nowrap",
            }}
          >
            = 1 次 Request ?
            <div
              style={{
                position: "absolute",
                left: -6,
                top: "50%",
                height: 4,
                width: `${strike * 104}%`,
                background: C.red,
                borderRadius: 2,
                transform: "rotate(-6deg)",
              }}
            />
          </div>
        </Box>
      )}

      {/* 和 GPT 对线 */}
      {T.bubbles.map((at, i) => {
        const p = spring(prog(t, at, 0.55));
        if (p <= 0 || bubblesOut <= 0) return null;
        const mine = i !== 1;
        const text = i === 0 ? "是按 Request 分组的吧？" : i === 1 ? "不能这么理解。" : "？？";
        return (
          <Box
            key={i}
            x={1840}
            y={410 + i * 78}
            w={500}
            style={{
              display: "flex",
              justifyContent: mine ? "flex-end" : "flex-start",
              alignItems: "center",
              gap: 12,
              opacity: clamp01(p * 2) * bubblesOut,
              transform: `scale(${0.6 + 0.4 * p})`,
              transformOrigin: mine ? "right center" : "left center",
            }}
          >
            {!mine && (
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: alpha(C.text, 0.1),
                  border: `1px solid ${C.line2}`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT.mono,
                  fontSize: 14,
                  color: C.text2,
                }}
              >
                GPT
              </span>
            )}
            <span
              style={{
                padding: "12px 20px",
                borderRadius: 18,
                fontFamily: FONT.sans,
                fontSize: 22,
                color: C.text,
                background: mine ? alpha(C.violet, 0.22) : alpha(C.text, 0.07),
                border: `1px solid ${mine ? alpha(C.violet, 0.5) : C.line2}`,
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </span>
          </Box>
        );
      })}

    </div>
  );
};
