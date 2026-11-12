import {Config} from '@remotion/cli/config';

// 纯 HTML/CSS/SVG 动画，不需要 WebGL。
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
