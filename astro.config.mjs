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
            {
              label: "2.程序结构",
              slug: "02_program_structure/readme",
            },
            {
              label: "3.函数",
              slug: "03_functions/readme",
            },
            {
              label: "4.数据结构：对象和数组",
              slug: "04_data/readme",
            },
            {
              label: "5.高阶函数",
              slug: "05_higher_order/readme",
            },
            {
              label: "6.对象的秘密生活",
              slug: "06_object/readme",
            },
            {
              label: "7.项目：机器人",
              slug: "07_robot/readme",
            },
            {
              label: "8.bug 与错误",
              slug: "08_error/readme",
            },
            {
              label: "9.正则表达式",
              slug: "09_regexp/readme",
            },
            {
              label: "10.模块",
              slug: "10_modules/readme",
            },
            {
              label: "11.异步编程",
              slug: "11_async/readme",
            },
            {
              label: "12.项目：一种编程语言",
              slug: "12_language/readme",
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
            {
              label: "14.文档对象模型",
              slug: "14_dom/readme",
            },
            {
              label: "15.处理事件",
              slug: "15_event/readme",
            },
            {
              label: "16.项目：平台游戏",
              slug: "16_game/readme",
            },
			{
				label: "17.在 Canvas 上绘图",
				slug: "17_canvas/readme",
			  },
          ],
        },
        {
          label: "第三部分：Node.js",
          items: [
            {
              label: "20.Node.js",
              slug: "20_node/readme",
            },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
  compressHTML: true,
});
