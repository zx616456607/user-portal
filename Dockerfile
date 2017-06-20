FROM 192.168.1.113/zhangpc/user-portal:base-6-alpine
MAINTAINER zhangpc<zhangpc@tenxcloud.com>

ENV NODE_ENV production
ENV RUNNING_MODE enterprise

ADD . /usr/src/app/

# package files
RUN chmod +x /usr/src/app/build.sh
RUN /usr/src/app/build.sh --build=all --clean=all
RUN rm -rf /usr/src/app/src

EXPOSE 8003

CMD ["node", "app.js"]
