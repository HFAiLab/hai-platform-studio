FROM node:18.12.1

RUN mkdir -p /dist/ailab-server

WORKDIR /dist/ailab-server
COPY . /dist/ailab-server

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone

RUN adduser -u 5678 --disabled-password --gecos "" serveruser && chown -R serveruser /dist
USER serveruser

EXPOSE 9700

CMD ["node","/dist/ailab-server/lib/app.js","--log-dir", "/dist/log"]
