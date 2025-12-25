#!/bin/sh

# Executar db:studio em background com host 0.0.0.0 para aceitar conexões externas
npx drizzle-kit studio --host=0.0.0.0 --port=4983 &

# Aguardar um pouco para o db:studio iniciar
sleep 2

# Executar servidor em foreground (para manter o container rodando)
node dist/infra/http/server.js

