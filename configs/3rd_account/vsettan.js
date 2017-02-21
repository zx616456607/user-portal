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
  client_id: env.CLIENT_ID,
  client_secret: env.CLIENT_SECRET,
  redirect_url: env.REDIRECT_URL,
  base_url: env.BASE_URL
}

module.exports = config
