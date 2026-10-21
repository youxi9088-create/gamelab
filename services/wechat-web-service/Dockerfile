FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server.py pipeline.cjs openapi.json docs.html ./
COPY templates ./templates
COPY profiles ./profiles
COPY vendor ./vendor
RUN mkdir /data && chown node:node /data
USER node
ENV CONVERTER_HOST=0.0.0.0 CONVERTER_DATA=/data PORT=8770
EXPOSE 8770
CMD ["python3", "server.py"]
