# Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências e configuração
COPY package*.json ./
COPY tsup.config.ts ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./

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

# Instalar todas as dependências (incluindo devDependencies para db:studio)
RUN npm ci

# Copiar build do estágio anterior
COPY --from=builder /app/dist ./dist

# Copiar arquivos necessários para db:studio (drizzle-kit precisa executar TypeScript)
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src ./src

# Copiar script de inicialização
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Expor portas da aplicação (3333 para o servidor, 4983 para db:studio)
EXPOSE 3333 4983

# Comando para iniciar a aplicação
CMD ["./start.sh"]

