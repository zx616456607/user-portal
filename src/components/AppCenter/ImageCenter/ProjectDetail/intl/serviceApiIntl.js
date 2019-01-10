/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 *
 * intl for src/components/AppCenter/ImageCenter/ProjectDetail/ServiceAPI.js
 *
 * @author zhouhaitao
 *
 */
import { defineIntlMessages } from "../../../../../common/tools"

export const mapData = {
  prefix: 'AppCenter.ImageCenter.ServiceApi',
  data: {
    variableName: '变量名',
    defaultValue: '默认值',
    noDataTxt: '没有加载到该版本的配置信息',
    servicePort: '服务端口',
    storage: '存储卷',
    portUndefined: '该镜像无端口定义',
    storageUndefined: '该镜像无存储卷定义',
    runCommandsAndParameters: '运行命令及参数',
    size: '大小',
    unknown: '未知',
    definitionOfEnv: '环境变量定义',
    toScan: '点击扫描'
  }
}

export default defineIntlMessages(mapData)
