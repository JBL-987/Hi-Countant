FROM node:23.7.0 AS node-deps
WORKDIR /app
RUN npm i -g https://github.com/dfinity/mops/releases/latest
COPY package.json package-lock.json ./
RUN npm install
COPY . .

FROM ubuntu:22.04
WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg lsb-release build-essential pkg-config libssl-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y curl

RUN sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
RUN dfx --version

COPY --from=node-deps /app /app

CMD dfx start --background && dfx deploy