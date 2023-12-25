FROM node:18.16.0 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18.16.0
WORKDIR /app
COPY --from=builder /app .
CMD ["npm", "run", "start"]
