/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * funcs for sysService
 *
 * @author Songsz
 * @date 2019-03-06
 *
*/
import { getContainerStatus } from '../../../src/common/status_identify'

export const sysServiceRunningStatus = ({ pods = [] }) => pods.map(pod => getContainerStatus(pod).phase).every(i => i === 'Running')
