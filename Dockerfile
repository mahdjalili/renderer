FROM oven/bun:1.1.38

WORKDIR /app

COPY . .

RUN bun i

EXPOSE 3000

CMD [ "bash","-c","/usr/local/bin/bun","start" ]