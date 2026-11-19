import { createRoot } from "react-dom/client";
import { Presentation } from "../../remotion-presentation/src/index.js";
import {
  WhatIsAgent,
  filmInputProps,
  fontsReady,
  presentationDefinition,
} from "./adapter";

const container = document.getElementById("root");
if (!container) throw new Error("找不到演示页面容器");
const root = createRoot(container);

const messageStyle = {
  margin: "auto",
  padding: "32px",
  maxWidth: "640px",
  color: "#e5e7eb",
  fontFamily: "sans-serif",
  lineHeight: 1.7,
};

root.render(
  <p style={messageStyle} role="status">
    正在载入演示字体…
  </p>,
);

void fontsReady.then(
  () => {
    root.render(
      <Presentation
        component={WhatIsAgent}
        inputProps={filmInputProps}
        definition={presentationDefinition}
      />,
    );
  },
  (error: unknown) => {
    root.render(
      <div style={messageStyle} role="alert">
        <h1>演示字体载入失败</h1>
        <p>请确认本工程 public/fonts 下的字体文件可以访问，然后刷新页面。</p>
        <p>{error instanceof Error ? error.message : String(error)}</p>
      </div>,
    );
  },
);
