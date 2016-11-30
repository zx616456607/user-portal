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

export default class StopModal extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render () {
    const { appList } = this.props
    const checkedAppList = appList.filter((app) => app.checked)
    let stoppedApps = []
    
    checkedAppList.map((app, index) => {
      if (app.status.phase === 'Stopped') {
        stoppedApps.push(app)
      }
    })
    let item = stoppedApps.map((app, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{app.name}</td>
          <td style={{ color: '#f85958' }}>应用为已停止状态</td>
        </tr>
      )
    })
    return (
      <div id="StartModal">
        {
          stoppedApps.length !== 0 ?
            <div>
              <Alert message={
                <span>你选择的{checkedAppList.length}个应用中, 有
                  <span className="modalDot" style={{ backgroundColor: '#f85958' }}>{stoppedApps.length}个</span>
                  已经是已停止状态, 不需再停止
                </span>
              } type="warning" showIcon />
              <div style={{ height: 26 }}>Tip: 已停止状态的应用不需再次停止</div>
              <div className="tableWarp">
                <table className="modalList">
                  <tbody>
                  {item}
                  </tbody>
                </table>
              </div>
            
            </div> :
            <div></div>
        }
        <div className="confirm">
          <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
          您是否确定停止这{(checkedAppList.length - stoppedApps.length)}个运行中的应用 ?
        </div>
      </div>
    )
  }
}