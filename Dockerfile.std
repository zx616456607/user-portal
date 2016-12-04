# Build image for standard verison
# this is a temp useage, as we can not define the Dockerfile name. put it under configs instead

FROM 192.168.1.113/zhangpc/user-portal:base-4.4.7
MAINTAINER zhangpc<zhangpc@tenxcloud.com>

ENV NODE_ENV production

ADD . /usr/src/app/

# package files
RUN chmod +x /usr/src/app/build.sh
RUN /usr/src/app/build.sh
RUN rm -rf /usr/src/app/src
RUN rm -rf /usr/src/app/configs/index.js
RUN mv /usr/src/app/configs/index.std.js  /usr/src/app/configs/index.js

EXPOSE 8003

CMD ["node", "app.js"]
