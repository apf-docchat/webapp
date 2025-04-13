# Stage 1: Build
FROM node:22 AS builder

WORKDIR /tmp/app

# Copy dependency lock files (for better layer caching)
COPY ./package.json ./yarn.lock ./

# Install dependencies
RUN yarn --frozen-lockfile install

# Copy source code
COPY ./ /tmp/app/

# Build
RUN yarn run build


# Stage 2: Serve

FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=builder /tmp/app/dist/pw-webapp/browser /usr/share/nginx/html
