FROM node:8.9.3

RUN mkdir -p /project/node-test-server

WORKDIR /project/node-test-server

ENV NODE_ENV=development
ENV PORT=3000
ENV DEBUG_PORT=9229

ENV REDIS_URI=redis://redis:6379
ENV MONGO_URI=mongodb://localhost:27017

ENV CACHE_TTL_IN_SECS=3600

EXPOSE ${PORT} ${DEBUG_PORT}
