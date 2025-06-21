FROM node:18-alpine as build

WORKDIR /app

ARG REACT_APP_GEMINI_API_KEY

ENV REACT_APP_GEMINI_API_KEY=$REACT_APP_GEMINI_API_KEY

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"] 
