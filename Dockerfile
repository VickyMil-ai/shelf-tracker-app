FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY shelf-frontend/package*.json ./
RUN npm ci

COPY shelf-frontend/ .
RUN npm run build

FROM python:3.12-slim

WORKDIR /app/shelf-backend

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor \
    && rm -rf /var/lib/apt/lists/*

COPY shelf-backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY shelf-backend/ ./
COPY --from=frontend-build /frontend/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/sites-enabled/default
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
