/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/29
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Alert, Icon } from 'antd'
import './style/StateBtnModal.less'

export default class StateBtnModal extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    const { state, appList, serviceList, scope } = this.props
    let alertText = ''
    let tip = ''
    let tbInf = ''
    let opt = ''
    let stateText = ''
    switch (state) {
      case 'Running' :
        alertText = '已经是运行中状态, 不需再启动'
        tip = '运行中状态的应用不需再次启动'
        tbInf = '为运行中状态'
        opt = '启动'
        stateText = '已停止'
        break
      case 'Stopped' :
        alertText = '已经是已停止状态, 不需再停止'
        tip = '已停止状态的应用不需再次停止'
        tbInf = '为已停止状态'
        opt = '停止'
        stateText = '运行中'
        break
      case 'Restart' :
        alertText = '是已停止状态, 不能做重新部署'
        tip = '运行状态时应用才可以重新部署'
        tbInf = '为已停止状态'
        opt = '重新部署'
        stateText = '可以重新部署'
        break
      case 'QuickRestar' :
        alertText = '是已停止状态, 不能快速重启'
        tip = '运行状态时服务才可以快速重启'
        tbInf = '为已停止状态'
        opt = '快速重启'
        stateText = '可以快速重启'
        break
      default :
        alertText = ''
        tip = ''
        tbInf = ''
        opt = ''
        stateText = ''
        break
    }
    let checkedList = appList?appList.filter((app) => app.checked):serviceList.filter((service) => service.checked)
    let disableArr = []
    let checkedState
    switch (state) {
      case 'Running':
        checkedState = state
        break;
      case 'Restart':
        checkedState = 'Stopped'
        break;
      case 'QuickRestar':
        checkedState = 'Stopped'
        break;
      case 'Stopped':
        checkedState = 'Stopped'
        break;
      /*case 'Starting':
        checkedState = 'Stopped'
        break;
      case 'Pending':
        checkedState = 'Stopped'
        break;
      case 'Deploying':
        checkedState = 'Stopped'
        break;*/
      default:
        checkedState = state
        break;
    }
    if (scope) {
      if (scope.state.currentShowInstance) {
        checkedList = [scope.state.currentShowInstance]
      }
    }
    checkedList.map((item, index) => {
      if (item.status.phase === checkedState) {
        disableArr.push(item)
      }
    })
    let disableItem = disableArr.map((item, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{appList?item.name:item.metadata.name}</td>
          <td style={{ color: '#f85958' }}>{appList?'应用':'服务'}{ tbInf }</td>
        </tr>
      )
    })
    return (
      <div id="StateBtnModal">
        {
          disableArr.length !== 0 ?
            <div>
              <Alert message={
                <span>你选择的{checkedList.length}个{appList?'应用':'服务'}中, 有
                  <span className="modalDot" style={{ backgroundColor: '#f85958' }}>{disableArr.length}个</span>
                  { alertText }
                </span>
              } type="warning" showIcon />
              <div style={{ height: 26 }}>Tip: { tip }</div>
              <div className="tableWarp">
                <table className="modalList">
                  <tbody>
                  {disableItem}
                  </tbody>
                </table>
              </div>
            </div> :
            <div></div>
        }
        <div className="confirm">
          <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
          您是否确定{opt}这{(checkedList.length - disableArr.length)}个{stateText}的{appList?'应用':'服务'} ?
        </div>
      </div>
    )
  }
}