import { defineConfig, loadEnv, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from '@svgr/rollup'

export default ({ mode }: UserConfig) => {
  // import.meta.env.SECRET available here with: process.env.SECRET
  process.env = {...process.env, ...loadEnv(mode as  string, process.cwd())};
  const base = process.env.DEPLOYMENT_REPO;

  // https://vitejs.dev/config/
  return defineConfig({
    base: base ? `/${base}/` : '/',
    plugins: [
      react(),
      svgr({
        icon: true,
        memo: true,
      }),
    ],
  });
}