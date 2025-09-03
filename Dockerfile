# Dockerfile para servir a aplicação estática do jogo
# Usa imagem leve com Node para servir via 'serve' (poderia usar nginx também)
FROM node:20-alpine AS build

# Definir diretório de trabalho
WORKDIR /app

# Copia somente o que é necessário (sem node_modules local)
COPY package.json package-lock.json* ./
# Instala apenas dependências necessárias para servir (devDependencies não necessárias em produção)
RUN npm install --production=false

# Copia código fonte
COPY raiz ./raiz

# Build step não é necessário (ES Modules direto). Mantemos dependências de teste fora da imagem final.

FROM node:20-alpine AS runtime
WORKDIR /app
# Instala somente a lib 'serve' globalmente para servir conteúdo estático
RUN npm install -g serve

# Copia apenas a pasta raiz do jogo do estágio anterior
COPY --from=build /app/raiz ./raiz

# Porta configurável (default 8080)
ENV PORT=8080
EXPOSE 8080

# Comando: servir diretório raiz/ como site estático
CMD ["serve", "-s", "raiz", "-l", "8080"]
