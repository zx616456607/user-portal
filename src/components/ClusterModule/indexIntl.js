/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 * define Intl Msg for ClusterModule
 *
 * @author Songsz
 * @date 2018-08-23
 *
*/

import { defineMessages } from 'react-intl'
import { formatIntlMsg } from "../../common/tools"

const mapData = {
  addClusterHelp: '基础设施，在这里您可以完成容器云平台的计算资源池管理：集群的添加、删除，以及集群内主机的添加、删除，并管理主机内的容器实例、查看主机维度的监控等。',
  addCluster: '添加集群',
  addClusterTip: '当前许可证最多支持 {maxClusters} 个集群（目前已添加 {clusterSum} 个）',
}

export default defineMessages(formatIntlMsg(mapData, 'ClusterModule'))
