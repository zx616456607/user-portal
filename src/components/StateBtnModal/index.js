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
import { Alert, Icon, Spin, Table, Checkbox } from 'antd'
import ServiceCommonIntl, { AppServiceDetailIntl, AllServiceListIntl } from '../AppModule/ServiceIntl'
import { injectIntl  } from 'react-intl'
import './style/StateBtnModal.less'

class StateBtnModal extends Component{
  constructor(props){
    super(props)
    this.handlecallback = this.handlecallback.bind(this)
    this.handleWarningTemplate = this.handleWarningTemplate.bind(this)
    this.state = {
      checkedvalue: true,
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.settingList !== this.props.settingList){
      this.setState({
        checkedvalue: true
      })
    }
  }
  getDeleteMessage() {
    const { formatMessage }= this.props.intl
    const { state, appList, cdRule, serviceList } = this.props
    if(state != 'Delete') return ''
    let rule = []
    const appRule = {}
    if(appList) {
      rule = cdRule.result.results
      rule.forEach(item => {
        if(appRule[item.appname]) appRule[item.appname].push(item.service.bindingDeploymentName)
        else {
          appRule[item.appname] = []
          appRule[item.appname].push(item.service.bindingDeploymentName)
        }
      })
      const checkList = appList.filter(item => item.checked)
      const keys = Object.getOwnPropertyNames(appRule)
      if (checkList.length == 0 || keys.length <= 0) return ''
      const dataSource = []
      checkList.forEach((app, index) => {
        if(app.services) {
          app.services.forEach((service, i) => {
            const obj = {
              key: index.toString() + i.toString(),
              appname: app.name,
              servicename: service.metadata.name
            }
            const ruleService = appRule[app.name]
            if(!ruleService) {
              obj.cdrule = 0
              dataSource.push(obj)
              return
            }
            if(ruleService.indexOf(service.metadata.name) >= 0) {
              obj.cdrule = 1
              dataSource.push(obj)
              return
            }
            obj.cdrule = 0
            dataSource.push(obj)
            return
          })
        }
      })

      const columns = [{
        title: formatMessage(AppServiceDetailIntl.appName),
        dataIndex: 'appname',
        key: 'appname',
      }, {
        title: formatMessage(AppServiceDetailIntl.serviceName),
        dataIndex: 'servicename',
        key: 'servicename',
      }, {
        title: formatMessage(AppServiceDetailIntl.autoDeploy),
        dataIndex: 'cdrule',
        key: 'cdrule',
        render: (text, record, index) => {
          if(text == '1') return <Icon style={{color: 'green', fontSize: '15px'}} type="check-circle" />
          return formatMessage(AppServiceDetailIntl.NotSet)
        }
      }];

      return <div className="confirm"><Table pagination={false}  style={{marginBottom: '20px'}} dataSource={dataSource} columns={columns} />
           <span style={{color: 'red' }}>{formatMessage(AppServiceDetailIntl.deleteServiceInfo)}</span></div>
      const messages = keys.map(key => {
        return <div>{formatMessage(AppServiceDetailIntl.AppSetAutoDeploy, {key,appRule:appRule[key].join(',')})}</div>
      })
      if(messages.length > 0) {
        messages.push(<div>{formatMessage(AppServiceDetailIntl.deleteAppInfo)}</div>)
      }
      return messages
    } else {
      const checkList = serviceList.filter(item => item.checked)
      rule = cdRule.result.results.map(item => {
        return item.bindingDeploymentName
      })
      if(checkList.length <=0 || rule.length <= 0) return ''
      const dataSource =[]
      checkList.forEach(service => {
        const serviceName = service.metadata.name
        var obj = {
          key: serviceName,
          servicename: serviceName,
          cdrule: 0
        }
        if(rule.indexOf(serviceName) >= 0) {
          obj.cdrule = 1
        }
        dataSource.push(obj)
      })
      const columns = [{
        title: formatMessage(AppServiceDetailIntl.servicename),
        dataIndex: 'servicename',
        key: 'servicename',
      }, {
        title: formatMessage(AppServiceDetailIntl.autoDeploy),
        dataIndex: 'cdrule',
        key: 'cdrule',
        render: (text, record, index) => {
          if(text == '1') return <Icon style={{color: 'green', fontSize: '15px'}} type="check-circle" />
            return formatMessage(AppServiceDetailIntl.NotSet)
        }
      }];
      return <div className="confirm"><Table pagination={false}  style={{marginBottom: '20px'}} dataSource={dataSource} columns={columns} />
        <span style={{color: 'red' }}>{formatMessage(AppServiceDetailIntl.deleteServiceInfo)}</span></div>
    }
  }
  handlecallback(){
    const { callback } = this.props
    this.setState({
      checkedvalue: !this.state.checkedvalue
    })
    let body = {
      checkedvalue: !this.state.checkedvalue
    }
    callback(body)
  }
  handleWarningTemplate(){
    const { settingList } = this.props
    if(settingList && settingList.result && settingList.result.length){
      return <div className='checkBox'><Checkbox checked={this.state.checkedvalue} onChange={this.handlecallback}>同时删除关联的告警策略?</Checkbox></div>
    }
    return <span></span>
  }
  render(){
    const { state, appList, serviceList, scope, cdRule } = this.props
    const { formatMessage }= this.props.intl
    let rule = []
    const appRule = {}
    if(state == 'Delete') {
      if(cdRule.isFetching) {
        return <div className="loadingBox"><Spin size="large"></Spin></div>
      }
    }
    let alertText = ''
    let tip = ''
    let tbInf = ''
    let opt = ''
    let stateText = ''
    switch (state) {
      case 'Running' :
        alertText = formatMessage(AppServiceDetailIntl.runingNotstart)
        tip = formatMessage(AppServiceDetailIntl.runingNotstartTip)
        tbInf = formatMessage(AppServiceDetailIntl.runningStatus)
        opt = formatMessage(ServiceCommonIntl.start)
        stateText = formatMessage(AppServiceDetailIntl.stoped)
        break
      case 'Stopped' :
        alertText = formatMessage(AppServiceDetailIntl.stoppedText)
        tip = formatMessage(AppServiceDetailIntl.stoppedtip)
        tbInf = formatMessage(AppServiceDetailIntl.stoppedtbInf)
        opt = formatMessage(ServiceCommonIntl.stop)
        stateText = formatMessage(AppServiceDetailIntl.runing)
        break
      case 'Restart' :
        alertText = formatMessage(AppServiceDetailIntl.RestartalertText)
        tip = formatMessage(AppServiceDetailIntl.Restarttip)
        tbInf = formatMessage(AppServiceDetailIntl.RestarttbInf)
        opt = formatMessage(AppServiceDetailIntl.redeploy)
        stateText = formatMessage(AppServiceDetailIntl.RestartstateText)
        break
      case 'QuickRestar' :
        alertText = formatMessage(AppServiceDetailIntl.QuickRestaralertText)
        tip = formatMessage(AppServiceDetailIntl.QuickRestartip)
        tbInf = formatMessage(AppServiceDetailIntl.QuickRestartbInf)
        opt = formatMessage(AppServiceDetailIntl.QuickRestaropt)
        stateText = formatMessage(AppServiceDetailIntl.QuickRestarstateText)
        break
      case 'Delete' :
        opt = formatMessage(ServiceCommonIntl.delete)
        stateText = formatMessage(AppServiceDetailIntl.sureDelete)
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
      default:
        checkedState = state
        break;
    }
    if (scope) {
      if (scope.state.currentShowInstance && !scope.state.donotUserCurrentShowInstance) {
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
          <td style={{ color: '#f85958' }}>{appList?formatMessage(AppServiceDetailIntl.app):formatMessage(AppServiceDetailIntl.service)}{ tbInf }</td>
        </tr>
      )
    })
    const appOrService =  appList ? formatMessage(AppServiceDetailIntl.app):formatMessage(AppServiceDetailIntl.service)

    return (
      <div id="StateBtnModal">
        {
          disableArr.length !== 0 ?
            <div>
              <Alert message={
                <span>{
                  formatMessage(AppServiceDetailIntl.youChoiceinfo,
                     {
                      checkedList: checkedList.length,
                      appOrService,
                      disableArr: <span className="modalDot" style={{ backgroundColor: '#f85958' }}>{disableArr.length}</span>,
                      alertText,
                     })
                }</span>
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
      {this.getDeleteMessage()}
        <div className="deleteRow">
          <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          {(() => {
            if(state != 'Delete') {
              return
            }
            if (appList) {
              return formatMessage(AppServiceDetailIntl.deleteAppinfo)
            }
            return formatMessage(AppServiceDetailIntl.deleteAppstrategyinfo)
          })()}
          {formatMessage(AppServiceDetailIntl.youconfirmApp, { opt, length: (checkedList.length - disableArr.length),
          stateText, appOrService })}
        </div>
        <div>{this.handleWarningTemplate()}</div>
        {/*<div className="confirm">
          <Icon type="question-circle-o" style={{ marginRight: '10px' }} />
          {(() => {
            if(state != 'Delete') {
              return
            }
            if (appList) {
              return '删除应用，该应用下所有服务的自动弹性伸缩策略也会被删除，'
            }
            return '删除服务，该服务下的自动弹性伸缩策略也会被删除，'
          })()}
          您是否确定{opt}这{(checkedList.length - disableArr.length)}个{stateText}的{appList?'应用':'服务'} ?
          <div>{this.handleWarningTemplate()}</div>
        </div>*/}
      </div>
    )
  }
}

export default injectIntl(StateBtnModal, {  withRef: true, })