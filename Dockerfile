FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm ci

# Copia el código fuente y variables de entorno
COPY . .

# Variables de entorno de build (puedes sobreescribir con --build-arg)
ARG VITE_BACKEND_URL
ARG VITE_BACKEND_TOKEN
ARG VITE_FILES_URL
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_APP_CLUSTER
ARG VITE_PUSHER_HOST
ARG VITE_PUSHER_PORT
ARG VITE_PUSHER_SCHEME
ARG VITE_EVENT_BASE_URL

ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_BACKEND_TOKEN=${VITE_BACKEND_TOKEN}
ENV VITE_FILES_URL=${VITE_FILES_URL}
ENV VITE_PUSHER_APP_KEY=${VITE_PUSHER_APP_KEY}
ENV VITE_PUSHER_APP_CLUSTER=${VITE_PUSHER_APP_CLUSTER}
ENV VITE_PUSHER_HOST=${VITE_PUSHER_HOST}
ENV VITE_PUSHER_PORT=${VITE_PUSHER_PORT}
ENV VITE_PUSHER_SCHEME=${VITE_PUSHER_SCHEME}
ENV VITE_EVENT_BASE_URL=${VITE_EVENT_BASE_URL}

# Construye assets sin paso de deploy externo
RUN npm run build:docker

# Imagen final con nginx sirviendo los estáticos
FROM nginx:alpine AS runner

COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
