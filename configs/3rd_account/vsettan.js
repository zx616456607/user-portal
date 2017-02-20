/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */
/**
 * vsettan - enterprise
 * v0.1 - 2017-02-17
 * @author yangyubiao
 */


const env = process.env

const config = {
  client_id: env.CLIENT_ID || 'XKpYBeSM87r11oC2ECUGy1W409j5YQqSqKgOTsvs',
  client_secret: env.CLIENT_SECRET || 'wZv7IO9D4uQeYP0p',
  redirect_url: env.REDIRECT_URL || 'https://www.baidu.com',
  base_url: env.BASE_URL || 'http://172.16.142.235:8001'
}

module.exports = config
