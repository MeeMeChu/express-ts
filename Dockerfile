FROM node:lts-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
COPY tsconfig.json .babelrc config ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:lts-alpine
WORKDIR /app

ENV NODE_ENV=production
RUN yarn global add pm2

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/.babelrc ./.babelrc
COPY --from=builder /app/process.yml ./process.yml
COPY --from=builder /app/.env.prod ./.env

RUN yarn install --production --frozen-lockfile && yarn cache clean

EXPOSE 8000
CMD ["pm2-runtime", "process.yml"]