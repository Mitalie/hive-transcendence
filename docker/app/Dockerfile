FROM node:22-alpine

# libc6-compat is required for the Prisma binary engine on Alpine Linux
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

# Ensures database tables exist before the app starts serving
CMD ["sh", "-c", "npx prisma db push && npm start"]
