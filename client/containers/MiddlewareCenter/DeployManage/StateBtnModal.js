/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * StateBtnModal.js page
 *
 * @author zhangtao
 * @date Wednesday September 12th 2018
 */
import React from 'react'
import { Alert } from 'antd'

/*
AppClusterListInterface = Array<InnerInterface> // 目前只支持传递一个元素
InnerInterface = {
  name: string
}
enum operation {
start = "start",
stop = "stop",
delete = "delete",
restart = "restart",
}
*/
export default class StateBtnModal extends React.Component {
  render() {
    const { operation, choiceItem } = this.props
    let operationText = 'illegal input'
    switch (operation) {
      case 'start': {
        operationText = '启动'
        break;
      }
      case 'stop': {
        operationText = '停止'
        break;
      }
      case 'delete': {
        operationText = '删除'
        break;
      }
      case 'restart': {
        operationText = '重新部署'
        break
      }
      default: break;
    }
    return (
      <Alert message={
        <span>{
          `您是否要${operationText}这${choiceItem.length}个集群`
        }</span>
      } type="warning" showIcon />
    )
  }
}
