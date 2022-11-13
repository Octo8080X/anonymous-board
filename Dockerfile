FROM denoland/deno:1.27.1

RUN apt-get update && apt-get install
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
