FROM node:20 AS builder
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
