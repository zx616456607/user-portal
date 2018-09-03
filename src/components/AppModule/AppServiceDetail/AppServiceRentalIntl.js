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

import { defineIntlMessages } from "../../../common/tools"
import React from "react";

export const mapData = {
  prefix: 'AppModule.AppServiceDetail.AppServiceRental',
  data: {
    allShare: '共享',
    rentInfo: '租赁信息',
    allPrice: '合计价格',
    hour: '小时',
    aboutPrice: '约：{ price }/月',
    name: '名称',
    computeCpuMemory: '计算（CPU/内存）',
    number:'数量',
    perPrice: '单价',
    rmbYuan: '元',
    none: '无',
  }
}

export default defineIntlMessages(mapData)
