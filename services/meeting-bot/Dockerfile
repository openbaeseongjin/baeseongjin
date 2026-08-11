FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    LOCAL_WHISPER_PYTHON=/opt/venv/bin/python
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m venv /opt/venv
COPY requirements-local.txt ./
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements-local.txt
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist/src ./dist/src
COPY scripts ./scripts
RUN mkdir -p /app/.data && chown -R node:node /app
USER node

CMD ["node", "dist/src/index.js"]
