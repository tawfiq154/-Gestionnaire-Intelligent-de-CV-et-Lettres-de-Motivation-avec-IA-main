# 1. Image Node.js LTS (Alpine version for security and size)
FROM node:20-alpine

# 2. Update system and install Prisma dependencies (OpenSSL and libc6-compat are required on Alpine)
RUN apk update && apk upgrade && \
    apk add --no-cache openssl libc6-compat

# 3. Work directory
WORKDIR /usr/src/app

# 4. Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# 5. Install dependencies
RUN npm install

# 6. Copy source code
COPY . .

# 7. Generate Prisma Client
RUN npx prisma generate

# 8. Expose port
EXPOSE 3000

# 9. Start application
CMD ["npm", "start"]

