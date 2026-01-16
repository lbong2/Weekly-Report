FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend ./apps/backend

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/backend
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN pnpm prisma:generate
RUN pnpm build

EXPOSE 4000
CMD ["pnpm", "start:prod"]
