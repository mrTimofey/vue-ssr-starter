ARG NODE_VERSION=12.13.1

# Build step

FROM node:${NODE_VERSION} AS build

ENV APPDIR /opt/app
ENV NPM_CONFIG_LOGLEVEL error

WORKDIR ${APPDIR}

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential chrpath libssl-dev libxft-dev libfreetype6 libfreetype6-dev libfontconfig1 libfontconfig1-dev webp && \
    wget -q https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 && \
    tar -xjf phantomjs-2.1.1-linux-x86_64.tar.bz2 -C /usr/local/share/ && \
    rm -rf phantomjs-2.1.1-linux-x86_64.tar.bz2 /var/lib/apt/lists/* && \
    ln -sf /usr/local/share/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin

COPY ./package.json ./package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN rm -rf node_modules package.json package-lock.json build src babel.config.js .eslintrc.js

# Production dependencies installation step

FROM node:${NODE_VERSION}-alpine AS deps

ENV APPDIR /opt/app
ENV NPM_CONFIG_LOGLEVEL error

WORKDIR ${APPDIR}

COPY ./package.json ./package-lock.json ./
RUN npm ci --production
RUN rm package.json package-lock.json

# Ready to use application

FROM node:${NODE_VERSION}-alpine

ENV APPDIR /opt/app
ENV NODE_ENV production

WORKDIR ${APPDIR}
RUN chown node ${APPDIR}

COPY --from=deps --chown=node:node ${APPDIR} .
COPY --from=build --chown=node:node ${APPDIR} .

USER node
EXPOSE 8080
ENTRYPOINT ["node", "index.js"]
