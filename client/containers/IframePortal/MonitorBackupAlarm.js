/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * AppStack Iframe Portal
 *
 * v1.0 - 2019-02-26
 * @author songsz
 */
import React from 'react'
import IframePortal from './'

const iframe = {
  id: 'MonitorBackupAlarm',
  title: '工作负载',
  src: '/monitor/index.html',
}

const MonitorBackupAlarm = props => <IframePortal iframe={iframe} {...props} />

export default MonitorBackupAlarm
