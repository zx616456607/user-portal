/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * v0.1 - 2016/11/04
 * @author mengyuan
 */

const ANNOTATION_SVC_DOMAIN = "tenxcloud.com/tenxDomain"

export default function parseDomain (item) {
  let domain = ""
  if (item && item.metadata && item.metadata.annotations && item.metadata.annotations[ANNOTATION_SVC_DOMAIN]) {
    domain = item.metadata.annotations[ANNOTATION_SVC_DOMAIN]
  }
  return domain
}