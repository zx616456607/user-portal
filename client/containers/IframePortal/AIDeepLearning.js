/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */
/**
 * AIDeepLearning Iframe Portal
 *
 * v1.0 - 2019-02-26
 * @author lvjunfeng
 */
import React from 'react'
import IframePortal from '.'

const iframe = {
  id: 'AIDeepLearning',
  title: 'Ai 深度学习',
  src: '/ai/index.html',
}

const AIDeepLearning = props => <IframePortal iframe={iframe} {...props} />

export default AIDeepLearning
