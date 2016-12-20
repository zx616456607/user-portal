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
export default function uploadFile(file, options, callback) {
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
  const formData = new FormData
  const body = options.body
  const keys = Object.getOwnPropertyNames(body)
  keys.forEach(key => {
    formData.append(key, body[key])
  })
  const notification = new NotificationHandler()
  notification.spin('文件上传中')
  return fetch(options.url, {
    headers: options.headers,
    method: options.method,
    body: formData
    //mode: 'no-cors'
  }).then(response => {
    notification.close()
    notification.success('文件上传成功')

    if(response.status != 200) {
  
      return response.status
    }
    if(callback) {
      return callback(response.json())
    }
    return response.json()
  }).catch(err => {
    if(callback) {
      return callback(err)
    }
    return err
  })
}
