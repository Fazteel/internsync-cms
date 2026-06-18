import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

declare const process: any;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  const targetApi = env.VITE_API_URL || 'https://api-internsync.smkpgritelagasari.sch.id';
  const frontendUrl = env.VITE_FRONTEND_URL || 'https://internsync.smkpgritelagasari.sch.id';

  const proxyConfig = {
    target: targetApi,
    changeOrigin: true,
    cookieDomainRewrite: 'localhost',
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => {
        // Masquerade origin to match the stateful domains
        proxyReq.setHeader('Origin', frontendUrl);
        proxyReq.setHeader('Referer', frontendUrl + '/');
      });
      proxy.on('proxyRes', (proxyRes: any) => {
        const cookies = proxyRes.headers['set-cookie'];
        if (cookies) {
          proxyRes.headers['set-cookie'] = cookies.map((cookie: string) =>
            cookie
              .replace(/;\s*Secure/i, '') // Remove Secure flag so HTTP localhost accepts it
              .replace(/domain=[^;]+/i, 'domain=localhost') // Rewrite domain to localhost
          );
        }
      });
    },
  };

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
    ],
    server: {
      proxy: {
        '/api': proxyConfig,
        '/sanctum': proxyConfig,
      },
    },
  };
});
