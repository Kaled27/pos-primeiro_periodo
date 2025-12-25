# Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsup.config.ts ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS production

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar build do estágio anterior
COPY --from=builder /app/dist ./dist

# Expor porta da aplicação
EXPOSE 3333

# Comando para iniciar a aplicação
CMD ["node", "dist/infra/http/server.js"]

