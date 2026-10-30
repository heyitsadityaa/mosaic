FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/db/package.json packages/db/package.json
COPY tsconfig.base.json ./

RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages/auth packages/auth
COPY packages/db packages/db

RUN pnpm --filter @mosaic/api... run build

RUN pnpm deploy --filter @mosaic/api --prod /app/pruned


FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/pruned ./

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]