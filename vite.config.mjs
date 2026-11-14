import 'dotenv/config';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

let cachedDbPool = null;

function getDbPool() {
  if (!cachedDbPool) {
    cachedDbPool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'apwg2321',
      database: process.env.MYSQL_DATABASE || 'xfive',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return cachedDbPool;
}

function getPublicOrigin(req) {
  const forwardedHost = req.headers['x-forwarded-host'];
  const hostHeader = req.headers.host || '';
  const proto = req.headers['x-forwarded-proto'] || 'https';

  const rawHost = (forwardedHost || hostHeader).split(',')[0].trim();

  // If host is a public domain (like *.trycloudflare.com or custom domain)
  if (rawHost && !rawHost.includes('localhost') && !rawHost.includes('127.0.0.1')) {
    return `${proto}://${rawHost}`;
  }

  // If accessed directly on localhost, check if an explicit tunnel is provided in .env or fallback to production
  return process.env.VITE_TUNNEL_URL || 'https://www.xfivephoto.com';
}

function articleOpenGraphPlugin() {
  return {
    name: 'article-og-plugin',
    configureServer(server) {
      // 0. Ensure crawlers and scrapers (WhatsApp, Facebook, Google) are allowed
      server.middlewares.use((req, res, next) => {
        res.setHeader('X-Robots-Tag', 'all, index, follow');
        next();
      });

      // 1. Direct Static Fallback for /uploads (guarantees WhatsApp crawler gets banner image even if port 3000 is offline)
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '';
        if (rawUrl.startsWith('/uploads/')) {
          const cleanPath = rawUrl.split('?')[0];
          const localFile = path.resolve(process.cwd(), '../xfiveapi/public', cleanPath.replace(/^\//, ''));
          if (fs.existsSync(localFile) && fs.statSync(localFile).isFile()) {
            const ext = path.extname(localFile).toLowerCase();
            const mime =
              ext === '.webp'
                ? 'image/webp'
                : ext === '.png'
                ? 'image/png'
                : ext === '.gif'
                ? 'image/gif'
                : 'image/jpeg';
            res.statusCode = 200;
            res.setHeader('Content-Type', mime);
            res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
            fs.createReadStream(localFile).pipe(res);
            return;
          }
        }
        next();
      });

      // 2. Open Graph injection for /article/:slug
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const match = rawUrl.match(/^\/article\/([^/?#]+)/);
        if (match && !rawUrl.includes('.')) {
          const slug = decodeURIComponent(match[1]);
          try {
            const pool = getDbPool();
            const [rows] = await pool.query(
              'SELECT title, excerpt, content, cover_image, category, author_name, published_at FROM articles WHERE slug = ? OR id = ?',
              [slug, /^\d+$/.test(slug) ? parseInt(slug, 10) : -1]
            );

            if (rows && rows.length > 0) {
              const art = rows[0];
              const baseUrl = getPublicOrigin(req);
              const fullUrl = `${baseUrl}/article/${slug}`;

              const title = art.title ? `${art.title} | XFIVE AyoDance Community` : 'XFIVE Article';
              const rawText = (art.excerpt || art.content || '')
                .replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/\[(.*?)\]\(.*?\)/g, '$1')
                .replace(/[#*`>!\-_]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              const sneakPeak = rawText.length > 200 ? `${rawText.slice(0, 200)}...` : rawText;

              let coverImg = art.cover_image || 'https://www.xfivephoto.com/img/xfive-team2.webp';
              if (coverImg.startsWith('/')) {
                coverImg = `${baseUrl}${coverImg}`;
              }

              const ext = path.extname(coverImg.split('?')[0]).toLowerCase();
              const imageType = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';

              const indexPath = path.resolve(process.cwd(), 'index.html');
              let html = fs.readFileSync(indexPath, 'utf-8');
              html = await server.transformIndexHtml(rawUrl, html);

              // Flexible replacement regex matching both self-closing /> and HTML5 >
              html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
              html = html.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${sneakPeak}" />`);
              html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${art.title}" />`);
              html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${sneakPeak}" />`);
              html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${coverImg}" />`);
              html = html.replace(/<meta\s+property=["']og:image:secure_url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image:secure_url" content="${coverImg}" />`);
              html = html.replace(/<meta\s+property=["']og:image:type["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image:type" content="${imageType}" />`);
              html = html.replace(/<meta\s+property=["']og:image:alt["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image:alt" content="${art.title}" />`);
              html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${fullUrl}" />`);
              html = html.replace(/<meta\s+property=["']og:type["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:type" content="article" />`);
              html = html.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:title" content="${art.title}" />`);
              html = html.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:description" content="${sneakPeak}" />`);
              html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:image" content="${coverImg}" />`);
              html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${fullUrl}" />`);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.setHeader('X-Robots-Tag', 'all, index, follow');
              res.end(html);
              return;
            }
          } catch (err) {
            console.error('Error injecting article OG tags in Vite:', err);
          }
        }
        next();
      });

      // 3. Dynamic host alignment for Home and general routes
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        // Skip assets, API, node_modules, and files with extension
        if (
          rawUrl.startsWith('/api') ||
          rawUrl.startsWith('/uploads') ||
          rawUrl.startsWith('/@') ||
          rawUrl.startsWith('/src') ||
          rawUrl.startsWith('/article/') ||
          rawUrl.includes('.')
        ) {
          return next();
        }

        try {
          const publicOrigin = getPublicOrigin(req);
          const currentUrl = `${publicOrigin}${rawUrl}`;

          const indexPath = path.resolve(process.cwd(), 'index.html');
          let html = fs.readFileSync(indexPath, 'utf-8');
          html = await server.transformIndexHtml(rawUrl, html);

          // Update canonical & og:url to the public tunnel/production URL
          html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${currentUrl}" />`);
          html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${currentUrl}" />`);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('X-Robots-Tag', 'all, index, follow');
          res.end(html);
          return;
        } catch (err) {
          console.error('Error injecting dynamic host in Vite:', err);
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [vue(), articleOpenGraphPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    watch: {
      ignored: ['**/backend/**', '**/xfiveapi/**', '**/.next/**'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/sitemap-articles.xml': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/.netlify/functions': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => {
          if (path.includes('get-members')) return path.replace('/.netlify/functions/get-members', '/api/v1/members');
          if (path.endsWith('/login') || path.includes('/login?')) return path.replace('/.netlify/functions/login', '/api/v1/auth/login');
          if (path.endsWith('/logout') || path.includes('/logout?')) return path.replace('/.netlify/functions/logout', '/api/v1/auth/logout');
          if (path.endsWith('/verify') || path.includes('/verify?')) return path.replace('/.netlify/functions/verify', '/api/v1/auth/verify');
          if (path.includes('upload-biometric')) return path.replace('/.netlify/functions/upload-biometric', '/api/v1/biometric/upload');
          if (path.includes('verify-biometric')) return path.replace('/.netlify/functions/verify-biometric', '/api/v1/biometric/verify');
          if (path.includes('get-captcha')) return path.replace('/.netlify/functions/get-captcha', '/api/v1/captcha');
          if (path.includes('verify-captcha')) return path.replace('/.netlify/functions/verify-captcha', '/api/v1/captcha/verify');
          if (path.includes('verify-social')) return path.replace('/.netlify/functions/verify-social', '/api/v1/social/verify');
          if (path.includes('submit-registration')) return path.replace('/.netlify/functions/submit-registration', '/api/v1/registrations');
          if (path.includes('get-blacklist')) return path.replace('/.netlify/functions/get-blacklist', '/api/v1/blacklist');
          if (path.includes('get-faq')) return path.replace('/.netlify/functions/get-faq', '/api/v1/faqs');
          if (path.includes('get-motm')) return path.replace('/.netlify/functions/get-motm', '/api/v1/motm');
          return path;
        },
      },
    },
  },
});
