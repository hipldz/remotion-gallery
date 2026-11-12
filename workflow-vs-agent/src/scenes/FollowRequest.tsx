import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Heading } from "../components/Stage";
import animation from "../data/follow-gif.json";
import { C } from "../data/theme";
import { ease } from "../lib/motion";

export function FollowRequest({
  time,
  duration,
}: {
  time: number;
  duration: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const loopMs = ((frame * 1000) / fps) % animation.durationMs;
  const activeFrame = animation.frames.findIndex(
    (item) => loopMs >= item.startMs && loopMs < item.endMs,
  );
  const opacity = ease(time, 0, 0.35) * (1 - ease(time, duration - 0.35, 0.35));

  return (
    <div
      data-follow-request
      data-gif-frame={activeFrame}
      style={{ position: "absolute", inset: 0, opacity }}
    >
      <Heading
        eyebrow="正式开始前，拜托大家一件事"
        title="求个关注，帮我升到 LV2"
        accent="#fb7299"
      />
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 340,
          width: 840,
          height: (840 * animation.height) / animation.width,
          overflow: "hidden",
          borderRadius: 28,
          boxShadow: "0 18px 50px #26344912",
          transform: `translateY(${(1 - ease(time, 0.05, 0.5)) * 24}px)`,
        }}
      >
        {animation.frames.map((item, index) => (
          <Img
            key={item.src}
            src={staticFile(item.src)}
            alt={
              index === 0 ? "求 B 站关注，帮助从 LV1 升到 LV2 的卡通动画" : ""
            }
            aria-hidden={index !== activeFrame}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              opacity: index === activeFrame ? 1 : 0,
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 1100,
          top: 390,
          right: 150,
          opacity: ease(time, 0.15, 0.5),
        }}
      >
        <div style={{ color: C.gray, fontSize: 32, letterSpacing: 3 }}>
          求个 B 站关注
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 600,
            color: "#fb7299",
            lineHeight: 1.2,
            marginTop: 22,
          }}
        >
          LV1 <span style={{ color: C.gray, fontSize: 68 }}>→</span> LV2
        </div>
        <div
          style={{
            marginTop: 34,
            fontSize: 64,
            fontWeight: 500,
            opacity: ease(time, 3, 0.5),
          }}
        >
          多谢多谢！
        </div>
      </div>
    </div>
  );
}
