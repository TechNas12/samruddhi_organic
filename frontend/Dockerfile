FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies using yarn frozen-lockfile for consistent installs
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Pass build arg so React knows the backend endpoint at build time
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN yarn build

# Production server using NGINX
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# Replace default NGINX config with one that handles React Router history fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
