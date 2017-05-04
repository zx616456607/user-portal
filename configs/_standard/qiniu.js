/*
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2016 TenX Cloud. All Rights Reserved.
*/

/*
 * Access and secret keys for Qiniu store
 * v0.1 - 2016-12-16
 * @author Lei
*/
var config = require('./index');

var qiniuStoreConfig = {
  qn_access_upload: {
    origin: 'https://dn-tenxcloud.qbox.me',
    accessKey: 'du5TBv_AbwQ_0zkFdnWsqAOOoL6IDsyV_j5HO6kI',
    secretKey: 'm8gfhEudOdjvSLFnGvCKNIolQP8BG2K-0g79Xczz',
    bucket: 'tenxcloud-upload'
  },
  qn_access_icon: {
    origin: 'https://dn-tenxstore.qbox.me',
    accessKey: 'du5TBv_AbwQ_0zkFdnWsqAOOoL6IDsyV_j5HO6kI',
    secretKey: 'm8gfhEudOdjvSLFnGvCKNIolQP8BG2K-0g79Xczz',
    bucket: 'tenxcloud-icon'
  },
  qn_access_avatar: {
    origin: 'https://dn-tenx-avatars.qbox.me',
    accessKey: 'du5TBv_AbwQ_0zkFdnWsqAOOoL6IDsyV_j5HO6kI',
    secretKey: 'm8gfhEudOdjvSLFnGvCKNIolQP8BG2K-0g79Xczz',
    bucket: 'avatars'
  },
  qn_access_public:{
    origin: 'https://dn-tenxcloud-public.qbox.me',
    accessKey: 'du5TBv_AbwQ_0zkFdnWsqAOOoL6IDsyV_j5HO6kI',
    secretKey: 'm8gfhEudOdjvSLFnGvCKNIolQP8BG2K-0g79Xczz',
    bucket: 'tenxcloud-public'
  },
  qn_volume_private:{
    origin: 'http://storage.tenxcloud.com',
    accessKey: 'du5TBv_AbwQ_0zkFdnWsqAOOoL6IDsyV_j5HO6kI',
    secretKey: 'm8gfhEudOdjvSLFnGvCKNIolQP8BG2K-0g79Xczz',
    bucket: 'tenx-volume'
  },
  qn_certification:{
    origin: 'https://oaid27iy3.qnssl.com',
    accessKey: 'du5TBv_AbwQ_0zkFdnWsqAOOoL6IDsyV_j5HO6kI',
    secretKey: 'm8gfhEudOdjvSLFnGvCKNIolQP8BG2K-0g79Xczz',
    bucket: 'tenx-enterprise-certification'
  }
}

module.exports = qiniuStoreConfig
