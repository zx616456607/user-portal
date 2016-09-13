FROM 192.168.1.113/zhangpc/tenxcloud_2.0:base
MAINTAINER zhangpc<zhangpc@tenxcloud.com>

ENV NODE_ENV production

ADD . /usr/src/app/

EXPOSE 8003

CMD ["node", "app.js"]
