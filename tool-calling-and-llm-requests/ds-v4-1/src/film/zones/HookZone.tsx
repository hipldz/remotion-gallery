import React from "react";
import {ZONE, zoneAlpha} from "../zones";
import {C, FONT, alpha} from "../theme";
import {clamp01, easeInOut, outBack, outCubic, prog} from "../motion";
import {Caps, Chip, Dot, Icon, Mono, Panel} from "../ui";
import {EXAMPLE} from "../data";

/* ------------------------------- 时间表 -------------------------------- */

const T = {
  rowsFrom: 0.4,
  rowStep: 0.62,
  dupFlash: 6.4,
  codexAt: 9.2,
  boxDraw: 9.9,
  expand: 13.0,
  solid: 15.4,
  chatIn: 17.4,
  strike: 20.2,
  regroup: 163.9,
  groupsIn: 165.0,
  plates: 172.2,
};

type FeedRow = {kind: "command" | "thinking"; icon: "terminal" | "search" | "file"; text: string; dur: string};

const FEED: FeedRow[] = [
  {kind: "command", icon: "file", text: "read_file src/app.ts", dur: "0.42s"},
  {kind: "command", icon: "file", text: "read_file src/router.ts", dur: "0.38s"},
  {kind: "thinking", icon: "search", text: "thinking… 找到入口文件", dur: "1.9s"},
  {kind: "command", icon: "search", text: 'grep "useEffect" src/', dur: "0.51s"},
  {kind: "command", icon: "file", text: "read_file src/app.ts", dur: "0.40s"},
  {kind: "command", icon: "file", text: "read_file src/store.ts", dur: "0.44s"},
  {kind: "command", icon: "terminal", text: "run_command npm test", dur: "3.10s"},
  {kind: "thinking", icon: "search", text: "thinking… 测试为什么失败", dur: "2.4s"},
  {kind: "command", icon: "file", text: "read_file src/router.ts", dur: "0.36s"},
  {kind: "command", icon: "search", text: 'grep "generation_id" src/', dur: "0.33s"},
  {kind: "command", icon: "file", text: "read_file src/app.ts", dur: "0.41s"},
  {kind: "command", icon: "terminal", text: "run_command npm run build", dur: "2.70s"},
  {kind: "thinking", icon: "search", text: "thinking… 整理数据边界", dur: "1.7s"},
];

const ROW_H = 74;
const FEED_TOP = 158;
const FEED_BOTTOM = 700;
const FEED_H = FEED_BOTTOM - FEED_TOP;

const rowAppear = (i: number) => T.rowsFrom + i * T.rowStep;

/* ------------------------------- WebUI lite ----------------------------- */

const WebUI: React.FC<{t: number}> = ({t}) => {
  const count = FEED.filter((_, i) => t >= rowAppear(i)).length;
  // 平滑滚动：每一行出现时，整列往上顶 74px
  let smooth = 0;
  for (let i = 0; i < FEED.length; i++) {
    smooth += easeInOut(clamp01((t - rowAppear(i)) / 0.32));
  }
  const dup = t >= T.dupFlash ? 1 - clamp01((t - T.dupFlash - 1.6) / 0.8) : 0;
  const groupP = prog(t, T.regroup, 1.4);
  const groupFade = 1 - groupP;

  return (
    <Panel x={48} y={72} w={1000} h={812} color={C.line} radius={18} style={{overflow: "hidden"}}>
      {/* 标题栏 */}
      <div
        style={{
          height: 54,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          borderBottom: `1px solid ${C.line}`,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {["#FF6B6B", "#F4B45E", "#46D6A5"].map((c) => (
          <span key={c} style={{width: 10, height: 10, borderRadius: 5, background: alpha(c, 0.55)}} />
        ))}
        <Mono size={12.5} color={C.soft} style={{marginLeft: 10}}>
          codex-webui-lite
        </Mono>
        <Mono size={11} color={C.faint} style={{marginLeft: "auto"}}>
          session 7f3a · local
        </Mono>
      </div>

      {/* 会话头 */}
      <div style={{padding: "18px 24px 4px", opacity: groupFade}}>
        <Caps size={10} color={C.faint}>CONVERSATION</Caps>
        <div style={{fontFamily: FONT.sans, fontSize: 19, color: C.ink, marginTop: 6, fontWeight: 600}}>
          分析一下这个项目
        </div>
      </div>

      {/* 活动流 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 14,
          top: FEED_TOP,
          height: FEED_BOTTOM - FEED_TOP,
          overflow: "hidden",
          opacity: groupFade,
        }}
      >
        {FEED.map((row, i) => {
          const appear = rowAppear(i);
          if (t < appear - 0.05) return null;
          const p = outCubic(clamp01((t - appear) / 0.4));
          const y = FEED_BOTTOM - ROW_H - FEED_TOP + (i + 1 - smooth) * ROW_H + (1 - p) * 26;
          const isDup = dup > 0.02;
          const thinkingFade = row.kind === "thinking" ? 1 - prog(t, 162.8, 1.4) : 1;
          const tagP = outCubic(prog(t, 160.4 + i * 0.12, 0.5));
          const gen = i < 4 ? "gen_01" : i < 8 ? "gen_02" : "gen_03";
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 18,
                right: 26,
                top: y,
                height: ROW_H - 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 14px",
                borderRadius: 10,
                background: isDup
                  ? `rgba(255,112,112,${0.06 + 0.06 * dup})`
                  : "rgba(255,255,255,0.022)",
                border: `1px solid ${isDup ? alpha(C.red, 0.45 * dup + 0.12) : "rgba(255,255,255,0.05)"}`,
                opacity: p * thinkingFade * (0.55 + 0.45 * Math.min(1, i / 5)),
              }}
            >
              <Icon name={row.icon} size={16} color={row.kind === "thinking" ? C.violet : C.green} />
              <div style={{minWidth: 0, flex: 1}}>
                <Caps size={9} color={row.kind === "thinking" ? C.violet : C.faint}>
                  {row.kind === "thinking" ? "THINKING" : "COMMAND"}
                </Caps>
                <Mono
                  size={13.5}
                  color={row.kind === "thinking" ? C.soft : C.ink}
                  style={{display: "block", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}
                >
                  {row.text}
                </Mono>
              </div>
              <div style={{width: 104, height: 22, position: "relative"}}>
                <div style={{position: "absolute", right: 0, top: 3, opacity: 1 - tagP, display: "flex", alignItems: "center", gap: 8}}>
                  <Mono size={11} color={C.faint}>{row.dur}</Mono>
                  <Icon name="check" size={14} color={alpha(C.green, 0.7)} />
                </div>
                <div style={{position: "absolute", right: 0, top: -3, opacity: tagP}}>
                  <Chip color={C.blue} size={9.5}>{gen}</Chip>
                </div>
              </div>
            </div>
          );
        })}

        {/* 重复提示：同一批命令被标红 */}
        {dup > 0.02 && (
          <div
            style={{
              position: "absolute",
              left: 30,
              top: 6,
              opacity: dup,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: alpha(C.red, 0.14),
              border: `1px solid ${alpha(C.red, 0.45)}`,
            }}
          >
            <Dot color={C.red} size={6} glow />
            <Mono size={11.5} color={alpha(C.red, 0.95)}>
              {count} 条记录 · 同样的 read_file 占了 4 条
            </Mono>
          </div>
        )}
      </div>

      {/* 滚动条：记录越多，滑块越短 */}
      <div style={{position: "absolute", right: 6, top: 166, width: 4, height: FEED_H, borderRadius: 2, background: "rgba(255,255,255,0.04)"}}>
        <div
          style={{
            position: "absolute",
            top: `${(FEED_H - Math.max(70, (FEED_H * FEED_H) / (FEED.length * ROW_H))) * clamp01(smooth / (FEED.length - 1))}px`,
            width: 4,
            height: Math.max(70, (FEED_H * FEED_H) / (FEED.length * ROW_H)),
            borderRadius: 2,
            background: alpha(C.soft, 0.35),
          }}
        />
      </div>

      {/* 输入框 */}
      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 14,
          height: 56,
          borderRadius: 12,
          border: `1px solid ${C.line}`,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
        }}
      >
        <Mono size={13} color={C.faint}>和 Codex 说点什么…</Mono>
        <div style={{marginLeft: "auto", display: "flex", gap: 8, alignItems: "center"}}>
          <Mono size={10.5} color={C.faint}>⏎</Mono>
          <div style={{width: 26, height: 26, borderRadius: 7, background: alpha(C.ink, 0.08), display: "grid", placeItems: "center"}}>
            <Icon name="arrow" size={13} color={C.soft} />
          </div>
        </div>
      </div>

      {/* S9：按 generation_id 收成三组 */}
      {t >= T.groupsIn && (
        <div style={{position: "absolute", left: 18, right: 18, top: 104}}>
          {[
            {gen: "gen_01", resp: "resp_123", calls: EXAMPLE.responses[0].calls, at: T.groupsIn},
            {gen: "gen_02", resp: "resp_456", calls: EXAMPLE.responses[1].calls, at: T.groupsIn + 0.7},
            {gen: "gen_03", resp: "resp_789", calls: [], at: T.groupsIn + 1.4},
          ].map((g, gi) => {
            const p = outCubic(clamp01((t - g.at) / 0.55));
            return (
              <div
                key={g.gen}
                style={{
                  position: "absolute",
                  top: gi * 186,
                  left: 0,
                  right: 0,
                  height: 172,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 18}px)`,
                  borderRadius: 12,
                  border: `1px solid ${alpha(C.blue, 0.28)}`,
                  background: `linear-gradient(180deg, ${alpha(C.blue, 0.07)}, rgba(255,255,255,0.015))`,
                  padding: "12px 16px",
                }}
              >
                <div style={{display: "flex", alignItems: "center", gap: 9}}>
                  <Icon name="chevron" size={13} color={C.blue} />
                  <Chip color={C.blue} size={10}>{g.gen}</Chip>
                  <Mono size={11} color={C.faint}>{g.resp}</Mono>
                  <div style={{marginLeft: "auto"}}>
                    <Caps size={9} color={C.muted}>
                      {g.calls.length > 0 ? `${g.calls.length} 个 Tool Call` : "最终回答"}
                    </Caps>
                  </div>
                </div>
                <div style={{marginTop: 8, display: "flex", flexDirection: "column", gap: 5}}>
                  {(g.calls.length > 0 ? g.calls.map((c) => c.callId) : ["message"]).map((label, k) => (
                    <div
                      key={k}
                      style={{
                        height: 32,
                        borderRadius: 7,
                        background: "rgba(0,0,0,0.22)",
                        border: "1px solid rgba(255,255,255,0.04)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "0 10px",
                      }}
                    >
                      <Icon name={g.calls.length > 0 ? "fn" : "spark"} size={12} color={g.calls.length > 0 ? C.green : C.blue} />
                      <Mono size={11} color={C.soft}>
                        {g.calls.length > 0
                          ? `${label} · read_file`
                          : "message · 最终回答"}
                      </Mono>
                      <div style={{marginLeft: "auto"}}>
                        <Mono size={9.5} color={C.faint}>{g.gen}</Mono>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* S9 底部名牌 */}
      {t >= T.plates && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 88,
            display: "flex",
            justifyContent: "center",
            opacity: outCubic(prog(t, T.plates, 0.7)),
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 10}}>
            <Chip color={C.blue} size={10.5}>执行数据模型</Chip>
            <Mono size={11.5} color={C.muted}>每条 Tool Call 属于哪个 Generation</Mono>
          </div>
        </div>
      )}
    </Panel>
  );
};

/* ------------------------------ Codex 原生 ------------------------------ */

const CodexPanel: React.FC<{t: number}> = ({t}) => {
  const boxP = outCubic(prog(t, T.boxDraw, 0.75));
  const solid = prog(t, T.solid, 0.6);
  const strike = outCubic(prog(t, T.strike, 0.7));
  const drawerP = outCubic(prog(t, T.expand, 0.7)) * (1 - prog(t, 159.2, 1.1));

  return (
    <Panel x={1160} y={120} w={1020} h={690} color={C.line} radius={18} style={{overflow: "hidden"}}>
      <div
        style={{
          height: 54,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          borderBottom: `1px solid ${C.line}`,
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {["#FF6B6B", "#F4B45E", "#46D6A5"].map((c) => (
          <span key={c} style={{width: 10, height: 10, borderRadius: 5, background: alpha(c, 0.55)}} />
        ))}
        <Mono size={12.5} color={C.soft} style={{marginLeft: 10}}>Codex</Mono>
        <Mono size={11} color={C.faint} style={{marginLeft: 12}}>~/project</Mono>
        <div style={{marginLeft: "auto", display: "flex", gap: 6}}>
          {["Chat", "Diff"].map((x, i) => (
            <span
              key={x}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontFamily: FONT.sans,
                fontSize: 11.5,
                color: i === 0 ? C.ink : C.faint,
                background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent",
              }}
            >
              {x}
            </span>
          ))}
        </div>
      </div>

      <div style={{padding: "20px 22px"}}>
        <div style={{display: "flex", gap: 10, alignItems: "flex-start"}}>
          <div style={{width: 26, height: 26, borderRadius: 7, background: alpha(C.violet, 0.16), display: "grid", placeItems: "center"}}>
            <Icon name="agent" size={14} color={C.violet} />
          </div>
          <div style={{fontFamily: FONT.sans, fontSize: 14.5, color: C.soft, lineHeight: 1.6}}>
            分析一下这个项目，看看数据边界。
          </div>
        </div>

        {/* 折叠摘要行：全片第一次出现"折叠" */}
        <div
          style={{
            position: "relative",
            marginTop: 26,
            marginLeft: 36,
            height: 74,
            borderRadius: 12,
            background: "rgba(255,255,255,0.035)",
            border: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 16px",
          }}
        >
          <Icon name="chevron" size={14} color={C.muted} />
          <Icon name="terminal" size={15} color={C.green} />
          <div>
            <div style={{fontFamily: FONT.sans, fontSize: 14.5, color: C.ink}}>Read files, ran commands</div>
            <div style={{fontFamily: FONT.sans, fontSize: 11.5, color: C.faint, marginTop: 3}}>
              4 files · 2 commands · 12.4s
            </div>
          </div>
          <div style={{marginLeft: "auto"}}>
            <Mono size={10.5} color={C.faint}>done</Mono>
          </div>

          {/* 红框：手画的标注框，不是 UI 组件 */}
          {boxP > 0 && (
            <div
              style={{
                position: "absolute",
                left: -8,
                top: -8,
                right: -8,
                bottom: -8,
                borderRadius: 15,
                border: `2px solid ${alpha(C.red, 0.9)}`,
                opacity: boxP,
                transform: `rotate(${(1 - boxP) * -1.2}deg) scale(${0.97 + 0.03 * boxP})`,
                boxShadow: `0 0 18px ${alpha(C.red, 0.18)}`,
              }}
            />
          )}
        </div>

        <div style={{opacity: 1 - drawerP}}>
          <div style={{marginTop: 20, marginLeft: 36, fontFamily: FONT.sans, fontSize: 21, color: C.ink, fontWeight: 600}}>
            这个项目用 Remotion 做视频，
          </div>
          <div style={{marginLeft: 36, fontFamily: FONT.sans, fontSize: 21, color: C.ink, fontWeight: 600, marginTop: 6}}>
            核心是三条数据边界。
          </div>
        </div>
      </div>

      {/* 红框旁的标注 */}
      {boxP > 0 && (
        <div
          style={{
            position: "absolute",
            right: 26,
            top: 246,
            opacity: boxP,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Mono size={11} color={alpha(C.red, 0.9)}>原生界面把它折叠成一行</Mono>
        </div>
      )}

      {/* 展开的抽屉：9 条记录（在窗口外，不被裁切） */}

      {/* S9 底部名牌 */}
      {t >= T.plates && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 22,
            display: "flex",
            justifyContent: "center",
            opacity: outCubic(prog(t, T.plates, 0.7)),
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 10}}>
            <Chip color={C.muted} size={10.5}>UI 展示策略</Chip>
            <Mono size={11.5} color={C.muted}>一次折叠摘要，跟 Request 无关</Mono>
          </div>
        </div>
      )}
      <ExpandedDrawer t={t} solid={solid} strike={strike} />

      {/* 抽屉下方的提醒：别把"放在一起"当成"同属一次请求" */}
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          top: 452,
          opacity: drawerP * (1 - 0.35 * strike),
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Dot color={C.amber} size={5} />
        <Mono size={10.5} color={C.faint}>折叠只是把它们放在一起，没说是同一次 Request</Mono>
      </div>
    </Panel>
  );
};

const DRAWER_RECORDS = [
  "read_file src/app.ts",
  "read_file src/router.ts",
  "read_file src/store.ts",
  "grep “useEffect” src/",
  "run_command npm test",
  "read_file src/app.ts",
  "grep “generation_id” src/",
  "run_command npm run build",
  "thinking… 整理数据边界",
];

const ExpandedDrawer: React.FC<{t: number; solid: number; strike: number}> = ({t, solid, strike}) => {
  const p = outCubic(prog(t, T.expand, 0.7));
  const labelIn = outCubic(prog(t, T.expand + 0.35, 0.5));
  const leave = 1 - prog(t, 159.2, 1.1);
  if (t < T.expand - 0.05 || leave <= 0) return null;
  const borderColor = strike > 0.2 ? alpha(C.amber, 0.22) : alpha(C.amber, 0.32 + 0.4 * solid);
  return (
    <div
      style={{
        position: "absolute",
        left: 20,
        top: 212,
        width: 980,
        height: 220,
        borderRadius: 12,
        border: `1.5px ${solid > 0.5 ? "solid" : "dashed"} ${borderColor}`,
        background: "rgba(8,10,16,0.94)",
        boxShadow: solid > 0.5 ? `0 0 ${26 * solid}px ${alpha(C.amber, 0.16)}` : undefined,
        opacity: p * (1 - 0.4 * strike) * leave,
        transform: `translateY(${(1 - p) * -14}px) scaleY(${0.55 + 0.45 * p})`,
        transformOrigin: "top center",
        padding: "12px 16px",
        overflow: "hidden",
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 10, height: 24, marginBottom: 8, opacity: labelIn}}>
        <Icon name="list" size={13} color={C.amber} />
        <Mono size={10.5} color={alpha(C.amber, 0.9)}>9 条记录</Mono>
        <div style={{flex: 1, height: 1, background: alpha(C.amber, 0.22)}} />
        <div style={{position: "relative"}}>
          <Chip color={C.amber} size={11} filled={solid > 0.5}>
            = 1 次 Request ?
          </Chip>
          {strike > 0.02 && (
            <svg
              width={170}
              height={30}
              style={{position: "absolute", left: -14, top: -6, overflow: "visible", opacity: strike}}
            >
              <path
                d="M2 22 L162 8"
                stroke={C.red}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="180"
                strokeDashoffset={180 * (1 - strike)}
              />
            </svg>
          )}
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "7px 10px"}}>
        {DRAWER_RECORDS.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 48,
              padding: "0 10px",
              borderRadius: 7,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.04)",
              opacity: clamp01((p - i * 0.02) * 2),
            }}
          >
            <Icon name={i === 8 ? "search" : i > 5 ? "terminal" : "file"} size={12} color={i === 8 ? C.violet : C.green} />
            <Mono size={10.5} color={C.soft} style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
              {r}
            </Mono>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------- 对线 ---------------------------------- */

const Chat: React.FC<{t: number}> = ({t}) => {
  const p = outCubic(prog(t, T.chatIn, 0.8));
  const bubbles = [
    {at: T.chatIn + 0.4, me: true, text: "Codex 是按一次 Request 分组的吧？"},
    {at: T.chatIn + 1.5, me: false, text: "不能这么理解。"},
    {at: T.chatIn + 2.4, me: true, text: "？？"},
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 2270,
        top: 150,
        width: 580,
        height: 800,
        opacity: p,
        transform: `translateX(${(1 - p) * 28}px)`,
      }}
    >
      <Panel x={0} y={0} w={580} h={800} color={C.line} radius={18} style={{overflow: "hidden", background: "rgba(10,13,20,0.9)"}}>
        <div style={{height: 52, borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 8, padding: "0 16px"}}>
          <Icon name="spark" size={14} color={C.violet} />
          <Mono size={12} color={C.soft}>GPT</Mono>
          <Chip color={C.violet} size={9.5} style={{marginLeft: "auto"}}>对线中</Chip>
        </div>
        <div style={{padding: 16, display: "flex", flexDirection: "column", gap: 18}}>
          {bubbles.map((b, i) => {
            const bp = outBack(clamp01((t - b.at) / 0.5), 1.2);
            if (t < b.at - 0.05) return null;
            return (
              <div
                key={i}
                style={{
                  alignSelf: b.me ? "flex-end" : "flex-start",
                  maxWidth: 430,
                  opacity: clamp01(bp),
                  transform: `translateY(${(1 - clamp01(bp)) * 10}px) scale(${0.96 + 0.04 * clamp01(bp)})`,
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 14,
                    borderTopRightRadius: b.me ? 4 : 14,
                    borderTopLeftRadius: b.me ? 14 : 4,
                    background: b.me ? alpha(C.violet, 0.16) : "rgba(255,255,255,0.055)",
                    border: `1px solid ${b.me ? alpha(C.violet, 0.28) : C.line}`,
                    fontFamily: FONT.sans,
                    fontSize: 16,
                    lineHeight: 1.55,
                    color: C.ink,
                  }}
                >
                  {b.text}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            height: 46,
            borderRadius: 10,
            border: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            opacity: 0.7,
          }}
        >
          <Mono size={12} color={C.faint}>继续问…</Mono>
        </div>
      </Panel>

      {/* 结论：折叠 ≠ 执行边界 */}
      {t >= T.strike + 0.8 && (
        <div
          style={{
            position: "absolute",
            left: 24,
            bottom: -8,
            opacity: outCubic(prog(t, T.strike + 0.8, 0.7)),
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="cross" size={14} color={C.red} />
          <Mono size={11.5} color={alpha(C.red, 0.9)}>折叠是展示策略，不是执行边界</Mono>
        </div>
      )}
    </div>
  );
};

export const HookZone: React.FC<{t: number}> = ({t}) => {
  // 镜头移到 Codex 时，把左边的 WebUI 压暗，让"旧界面"退到背景里。
  const away = prog(t, 9.6, 1.0) * (1 - prog(t, 21.2, 1.0));
  return (
    <div
      style={{
        position: "absolute",
        left: ZONE.hook.x,
        top: ZONE.hook.y,
        width: ZONE.hook.w,
        height: ZONE.hook.h,
        opacity: zoneAlpha("hook", t),
      }}
    >
      <div style={{opacity: 1 - 0.62 * away}}>
        <WebUI t={t} />
      </div>
      <CodexPanel t={t} />
      <Chat t={t} />
    </div>
  );
};
