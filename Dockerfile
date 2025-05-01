FROM ubuntu:22.04
WORKDIR /app

COPY package.json package-lock.json ./

RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg lsb-release build-essential pkg-config libssl-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

ENV DFX_VERSION=0.25.0
RUN curl -fsSL https://internetcomputer.org/install.sh | bash -s -- --non-interactive

RUN npm install -g mops
RUN npm install
RUN node -v
RUN npm -v
RUN dfx --version

COPY . .

RUN dfx start --clean --background && \
    dfx stop

CMD ["sh", "-c", "dfx start --background && dfx deploy"]