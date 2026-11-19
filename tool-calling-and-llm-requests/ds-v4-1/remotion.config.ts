import {Config} from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// 无 WebGL、无网络字体：任何一台机器都能直接渲染。
Config.setChromiumOpenGlRenderer("angle");
