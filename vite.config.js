import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	kit: {
        // Cấu hình để bao gồm các tệp trong thư mục static
        static: {
            directory: 'static'
        }
    }
});
