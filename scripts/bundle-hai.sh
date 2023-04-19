# 出错后立即退出
set -e exit


PWD=`pwd`

pnpm install
pnpm run build:pkgs

echo '==> bundle hai studio'
cd apps/studio/ && pnpm run build && cd ../..

echo '==> mv hai studio'
mv apps/studio/dist/hai_studio.html apps/studio/dist/index.html
mkdir -p servers/ailab-server/public
rm -rf servers/ailab-server/public/* && cp -rf apps/studio/dist/* servers/ailab-server/public

echo '==> bundle hai monitor'
cd apps/monitor/ && pnpm run build && cd ../..

echo '==> mv hai monitor'
mv apps/monitor/dist/hai_monitor.html apps/monitor/dist/index.html
mkdir -p servers/ailab-server/public/monitor
rm -rf servers/ailab-server/public/monitor/* && cp -rf apps/monitor/dist/* servers/ailab-server/public/monitor

echo '==> build ailab-server'
cd servers/ailab-server && pnpm run build && cd ../..

echo '==> deploy ailab-server'
pnpm run deploy:ailab-server

echo '==> pkg ailab-server binary'
cd ailab-server-dist/public/assets && rm -rf *.js.map && cd ../..
pnpm run pkg && cd ..

