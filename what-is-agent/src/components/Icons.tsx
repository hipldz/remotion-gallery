import type { CSSProperties, ReactNode } from "react";

export type IconName =
  | "model"
  | "tools"
  | "instructions"
  | "target"
  | "check"
  | "pause"
  | "branch"
  | "loop"
  | "arrow"
  | "spark"
  | "doc"
  | "shield";

export const Icon = ({
  name,
  size = 56,
  color = "#202124",
  strokeWidth = 2.4,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}) => {
  const paths: Record<IconName, ReactNode> = {
    model: (
      <>
        <circle cx="14" cy="18" r="5" />
        <circle cx="50" cy="18" r="5" />
        <circle cx="32" cy="47" r="7" />
        <path d="M19 20.5 27 39M45 20.5 37 39M19 18H45" />
      </>
    ),
    tools: (
      <>
        <path d="M39 8a15 15 0 0 0-17 20L8 42a8 8 0 0 0 11 11l14-14A15 15 0 0 0 53 22l-9 9-7-7Z" />
        <path d="M14 46l5 5" />
      </>
    ),
    instructions: (
      <>
        <path d="M17 11v42M33 11v42M49 11v42" />
        <circle cx="17" cy="25" r="4.5" fill="#fff" />
        <circle cx="33" cy="40" r="4.5" fill="#fff" />
        <circle cx="49" cy="20" r="4.5" fill="#fff" />
      </>
    ),
    target: (
      <>
        <circle cx="32" cy="32" r="23" />
        <circle cx="32" cy="32" r="13" />
        <circle cx="32" cy="32" r="3.2" fill="currentColor" stroke="none" />
      </>
    ),
    check: <path d="M11 33 26 48 54 16" />,
    pause: (
      <>
        <path d="M22 13v38M42 13v38" />
        <path d="M15 55h34" opacity=".5" />
      </>
    ),
    branch: (
      <>
        <circle cx="16" cy="12" r="4.5" />
        <circle cx="48" cy="20" r="4.5" />
        <circle cx="16" cy="52" r="4.5" />
        <path d="M16 17v30M48 25v8c0 6-4 9-10 9H16" />
      </>
    ),
    loop: (
      <>
        <path d="M51 21A22 22 0 0 0 12 25M12 25V10M12 25h15M13 43a22 22 0 0 0 39-4M51 39v15M51 39H36" />
      </>
    ),
    arrow: (
      <>
        <path d="M10 32h42" />
        <path d="M41 20l12 12-12 12" />
      </>
    ),
    spark: <path d="M32 7c2 16 9 23 25 25-16 2-23 9-25 25-2-16-9-23-25-25 16-2 23-9 25-25Z" />,
    doc: (
      <>
        <path d="M16 7h23l11 11v39H16Z" />
        <path d="M38 7v12h12M23 29h20M23 38h20M23 47h13" />
      </>
    ),
    shield: (
      <>
        <path d="M32 7 53 15v14c0 14-8 23-21 28C19 52 11 43 11 29V15Z" />
        <path d="M22 32l7 7 14-15" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {paths[name]}
    </svg>
  );
};
