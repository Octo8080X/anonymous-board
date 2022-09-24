FROM denoland/deno:1.25.4

RUN apt-get update && apt-get install
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
