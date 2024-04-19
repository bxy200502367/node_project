FROM node:20-alpine
# 设置时区
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build
VOLUME ["/mnt/clustre/users/sanger-dev/wpm2/workspace/submit_system_log/log", \
        "/mnt/clustre/users/sanger-dev/wpm2/workspace", \
        "/mnt/dlustre/users/sanger/wpm2/workspace", \
        "/mnt/upload/novaseq/LH00278", \
        "/mnt/upload/novaseq/LH00272", \
        "/mnt/upload/nextseq/VH01349", \
        "/mnt/upload/nextseq/VH01218", \
        "/mnt/clustre/upload", \
        "/mnt/dlustre/upload"]
CMD ["node", "./dist/main.cjs"]