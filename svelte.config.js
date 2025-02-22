import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const prNumber = process.env.PR_NUMBER;
const basePath = process.env.NODE_ENV === 'production' 
	? (prNumber ? `/gf-label-generator/pr-${prNumber}` : '/gf-label-generator')
	: '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		appDir: 'app',
		adapter: adapter({
			fallback: 'index.html'
		}),
		paths: {
			base: basePath
		},
		prerender: {
			handleHttpError: 'warn'
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;
