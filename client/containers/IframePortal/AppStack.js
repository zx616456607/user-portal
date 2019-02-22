/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * AppStack Iframe Portal
 *
 * v1.0 - 2019-02-21
 * @author zhangpc
 */
import React from 'react'
import IframePortal from './'

const iframe = {
  id: 'AppStack',
  title: '工作负载',
  src: '/app-stack/index.html',
}

const AppStack = props => <IframePortal iframe={iframe} {...props} />

export default AppStack
