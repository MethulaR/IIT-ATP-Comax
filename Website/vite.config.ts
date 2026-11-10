import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Writes robots.txt and sitemap.xml at build time from VITE_SITE_URL. */
function seoFiles(siteUrl: string): Plugin {
  const origin = siteUrl.replace(/\/$/, '')
  return {
    name: 'comax-seo-files',
    apply: 'build',
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
      })
      const urls = ['/', '/privacy']
        .map((p) => `  <url><loc>${origin}${p}</loc><lastmod>${today}</lastmod></url>`)
        .join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    plugins: [react(), seoFiles(env.VITE_SITE_URL || 'https://comax.lk')],
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      assetsInlineLimit: 2048,
    },
    server: { port: 5173, host: '127.0.0.1' },
    preview: { port: 4173, host: '127.0.0.1' },
  }
})
