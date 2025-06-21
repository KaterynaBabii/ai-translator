FROM node:18-alpine as build

WORKDIR /app

ARG REACT_APP_GCP_PROJECT_ID
ARG REACT_APP_API_URL
ARG REACT_APP_ENVIRONMENT=production

ENV REACT_APP_GCP_PROJECT_ID=$REACT_APP_GCP_PROJECT_ID
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT

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