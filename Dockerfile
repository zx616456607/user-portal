FROM 192.168.1.113/zhangpc/user-portal:base-4.4.7
MAINTAINER zhangpc<zhangpc@tenxcloud.com>

ENV NODE_ENV production
ENV MODE standard

ADD . /usr/src/app/

# package files
RUN chmod +x /usr/src/app/build.sh
RUN /usr/src/app/build.sh
RUN rm -rf /usr/src/app/src

EXPOSE 8003

CMD ["node", "app.js"]
