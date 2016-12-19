/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App require common modules
 *
 * v0.1 - 2016-12-19
 * @author YangYuBiao
 */
import NotificationHandler from './notification_handler.js'
export default function uploadFile(file, options) {
  const defaultOptions = {
    fileType: ['gif', 'jpg', 'jpeg', 'png', 'bmp'],
    defaultSize: 3 * 1024 * 1024//'byte'
  }
  options = Object.assign(defaultOptions, options)
  const filename = file.name
  let start = filename.lastIndexOf('.')
  const fileType = filename.substring(start + 1, filename.length)
  if(options.fileType.indexOf(fileType) < 0 ) {
    return {
      error: 'file type must be gif, jpg, jpeg, png, bmp'
    }
  }
  const size = file.size
  if(size > options.size) {
    return {
      error: `file size must less than ${(file.size / 1024 /1024).foFixed(0)}`
    }
  }
  const notification = new NotificationHandler()
  notification.spin('文件上传中')
  console.log(options.url)
  fetch(options.url, {
    headers: options.headers,
    method: 'POST',
    body: options.body
  }).then(response => {
    notification.close()
    notification.success('文件上传成功')
    return response.json
  }).catch(err => {
    return err
  })
}
