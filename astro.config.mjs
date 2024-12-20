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
			slug: "00_intro/readme"
		},
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
	  customCss: [
        './src/styles/custom.css',
      ],
    }),
  ],
  compressHTML: true,
});
