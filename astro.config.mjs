// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://wsafight.github.io",
  base: "eloquentjavascript-fourth_zh",
  integrations: [
    starlight({
      title: "JavaScript 编程精解",
      social: {
        github: "https://github.com/wsafight/eloquentjavascript-forth_zh",
      },
      sidebar: [
        {
          label: "介绍",
          slug: "00_intro/readme",
        },
        {
          label: "第一部分：语言",
          items: [
            {
              label: "1.值、类型和运算符",
              slug: "01_values/readme",
            },
          ],
        },
        {
          label: "第二部分：浏览器",
          items: [
            {
              label: "13.JavaScript 和浏览器",
              slug: "13_browser/readme",
            },
          ],
        },
        {
          label: "第三部分：Node",
          autogenerate: { directory: "reference" },
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
  compressHTML: true,
});
