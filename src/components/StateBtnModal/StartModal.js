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

export default class StartModal extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render () {
    const { appList } = this.props
    const checkedAppList = appList.filter((app) => app.checked)
    let runningApps = []

    checkedAppList.map((app, index) => {
      if (app.status.phase === 'Running') {
        runningApps.push(app)
      }
    })
    let item = runningApps.map((app, index) => {
      return (
        <tr>
          <td>{index + 1}</td>
          <td>{app.name}</td>
          <td style={{ color: '#4bbd74' }}></td>
        </tr>
      )
    })
    return (
      <div id="StartModal">
        {
          runningApps.length !== 0 ?
            <div>
              <Alert message={
                <span>你选择的{checkedAppList.length}个应用中, 有
                  <span className="modalDot" style={{ backgroundColor: '#4bbd74' }}>{runningApps.length}个</span>
                  
                </span>
              } type="warning" showIcon />
              <div style={{ height: 26 }}>Tip: </div>
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
          您是否确定启动这{(checkedAppList.length - runningApps.length)}个已停止的应用 ?
        </div>
      </div>
    )
  }
}