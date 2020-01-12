# gjør det mulig å bytte base-image slik at vi får bygd både innenfor og utenfor NAV
ARG BASE_IMAGE_PREFIX="docker.adeo.no:5000/pus/"
FROM ${BASE_IMAGE_PREFIX}node as builder

ADD / /source
ENV CI=true
WORKDIR /source
RUN npm ci
ENV NODE_ENV=production
RUN npm run build

ENV NODE_ENV=development
WORKDIR /source/v2
RUN npm ci
ENV NODE_ENV=production
RUN npm run build

ENV NODE_ENV=development
WORKDIR /source/v2.1
RUN npm ci
ENV NODE_ENV=production
RUN npm run build

FROM ${BASE_IMAGE_PREFIX}nginx
COPY --from=builder /source/build /usr/share/nginx/html/internarbeidsflatedecorator
COPY --from=builder /source/v2/build /usr/share/nginx/html/internarbeidsflatedecorator/v2
COPY --from=builder /source/v2.1/build /usr/share/nginx/html/internarbeidsflatedecorator/v2.1