// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'OutSystems Astro Islands',
			customCss: [
        		'./src/styles/custom.css',
      		],
			favicon: '/favicon.ico',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/hs2323/create-outsystems-astro' }],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Getting Started', slug: 'guides/getting-started' },
						{ label: 'Client',
							items: [
								{ label: 'Astro', slug: 'guides/astro' },
							],
						},
						{
							label: 'OutSystems',
							items: [
								{ label: 'O11', slug: 'guides/outsystems/o11' },
								{ label: 'ODC', slug: 'guides/outsystems/odc' },
							],
						},
					],
				},
			],
		}),
	],
});
