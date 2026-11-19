import type { CSSProperties, ReactNode } from "react";
import { Img, staticFile } from "remotion";

export const ScreenshotCrop = ({
  src,
  width,
  height,
  imageWidth,
  offsetX = 0,
  offsetY = 0,
  style,
  children,
}: {
  src: string;
  width: number;
  height: number;
  imageWidth: number;
  offsetX?: number;
  offsetY?: number;
  style?: CSSProperties;
  children?: ReactNode;
}) => (
  <div
    className="screenshot-window"
    style={{
      width,
      height,
      borderRadius: 13,
      ...style,
    }}
  >
    <Img
      src={staticFile(src)}
      style={{
        width: imageWidth,
        left: offsetX,
        top: offsetY,
      }}
    />
    {children}
  </div>
);

export const ScreenshotSourceTab = ({
  children,
  color = "#202124",
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) => (
  <div
    style={{
      position: "absolute",
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 12px",
      borderRadius: 7,
      background: "rgba(255,255,255,0.94)",
      border: "1px solid rgba(224,228,234,0.95)",
      boxShadow: "0 6px 18px rgba(30,42,57,.07)",
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 11,
      letterSpacing: 1.3,
      color,
      textTransform: "uppercase",
      ...style,
    }}
  >
    <span style={{ width: 5, height: 5, borderRadius: 3, background: color }} />
    {children}
  </div>
);
