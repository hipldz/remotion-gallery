import { Config } from "@remotion/cli/config";

Config.setPublicDir("../what-is-agent/public/fonts");

Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      ...(config.module?.rules ?? []),
      { test: /\.png$/i, type: "asset/resource" },
      { test: /storyboard\.md$/, type: "asset/source" },
    ],
  },
}));
