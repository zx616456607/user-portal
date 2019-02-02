/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * alerm strategy component
 *
 * v0.1 - 2017-3-3
 * @author BaiYu
 */

import React, { Component } from 'react'
import { getSettingList, deleteSetting, batchEnable, batchDisable, ignoreSetting, deleteRecords } from '../../actions/alert'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { calcuTime, formatDate } from '../../common/tools'
import CreateAlarm from '../AppModule/AlarmModal'
import CreateGroup from '../AppModule/AlarmModal/CreateGroup'
import TimeHover from '@tenx-ui/time-hover'

import {
  Icon, Button, Input, InputNumber, Select, Table, Dropdown,
  Modal, Menu, Pagination, Row, Col,
} from 'antd'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import './style/AlarmStrategy.less'
import NotificationHandler from '../../components/Notification'
import cloneDeep from 'lodash/cloneDeep'
import { injectIntl, FormattedMessage } from 'react-intl'
import intlMsg from './AlarmStrategyIntl'

const Option = Select.Option

function loadStrategy(scope) {
  // this func is load strategy data
  scope.setState({ deleteModal: false, btnAll: true, strategyID:[],selectedRowKeys:[] })
  const { getSettingList, nodeName, cluster, appName, serviceName, intl: { formatMessage } } = scope.props
  let body = {
    targetType: 0,
    targetName: serviceName,
    from: (scope.state.currentPage -1) * DEFAULT_PAGE_SIZE,
    size: DEFAULT_PAGE_SIZE
  }
  if (appName) {
    body = {
      appName
    }
  }
  if (nodeName) {
    body.targetType = 1
    body.targetName= nodeName
  }
  getSettingList(cluster,body, {
    failed: {
      func: ()=> {
        new NotificationHandler().error(formatMessage(intlMsg.getStgFail))
      }
    }
  })
}

class AlarmStrategy extends Component {
  constructor(props) {
    super(props)
    this.state = {
      deleteModal: false,
      createGroup: false,
      currentPage: DEFAULT_PAGE,
      size:DEFAULT_PAGE_SIZE,
      selectedRowKeys: [],
      ignoreUnit:'m',
      time: 1,// ignore time
      step: 1,
      clearStraregy: {},
      clearModal: false
    }
  }
  componentWillMount() {
    loadStrategy(this)
  }
  componentWillReceiveProps(nextProps){
    let { isCurrentTab }= nextProps
    if (!this.props.isCurrentTab && isCurrentTab) {
      loadStrategy(this)
    }
  }
  onPageChange(page) {
    if(page == this.state.currentPage) return
    this.setState({
      currentPage: page
    }, () => loadStrategy(this))

  }
  moreDropdown(e, record) {
    switch(e.key) {
      case 'delete': {
        this.setState({deleteModal: true, strategyID: [record.strategyID],strategyName: [record.strategyName]})
        return
      }
      case 'stop':{
        this.setState({enable: 'stop',strategyID: [record.strategyID],strategyName: [record.strategyName]})
        return
      }
      case 'start':{
        this.setState({enable: 'start',strategyID: [record.strategyID],strategyName: [record.strategyName]})
        return
      }
      case 'edit': {
        if (this.props.withNode) {
          browserHistory.push(
            `/cluster/alarmSetting?redirect=${encodeURIComponent(
              `/alarmSetting?createShow=edit&createType=1&createClusterID=${record.clusterID}&createObj=${record.targetName}&createStrategyID=${record.strategyID}&createStrategyName=${record.strategyName}&_divider=0`
            )}`
          )
          return
        }
        this.setState({
          editStrategy: record,
          isEdit: true,
          alarmModal: true
        })
        return
      }
      case 'list': {
        if (this.props.withNode) {
          browserHistory.push(
            `/cluster/alarmRecord?redirect=${encodeURIComponent(
              `/alarmRecord?clusterID=${record.clusterID}&strategyID=${record.strategyID}&strategyName=${record.strategyName}&_divider=0`
            )}`
          )
          return
        }
        browserHistory.push({
          pathname: '/manange_monitor/alarm_record',
          query: {
            strategyName: record.strategyName,
            targetType: record.targetType,
            targetName: record.targetName
          }
        })
      return
    }
      case 'clear': {
        this.setState({clearModal: true, clearStraregy: record})
        return
      }
      default: return false
    }
  }
  dropdowns(record) {
    // Dropdown delete btn
    return (
      <Menu onClick={(key) => this.moreDropdown(key, record)}
        style={{ width: '80px' }}
      >
        <Menu.Item key="delete">
          <span><FormattedMessage {...intlMsg.delete}/></span>
        </Menu.Item>
        <Menu.Item key="edit">
          <span><FormattedMessage {...intlMsg.modify}/></span>
        </Menu.Item>
        <Menu.Item disabled={(record.enable ==0)} key="stop">
          <span><FormattedMessage {...intlMsg.stopUse}/></span>
        </Menu.Item>
        <Menu.Item disabled={(record.enable ==1)} key="start">
          <span><FormattedMessage {...intlMsg.startUse}/></span>
        </Menu.Item>
        <Menu.Item key="list">
          <span><FormattedMessage {...intlMsg.checkLog}/></span>
        </Menu.Item>
        <Menu.Item key="clear">
          <span><FormattedMessage {...intlMsg.clearLog}/></span>
        </Menu.Item>
      </Menu>

    )
  }
  handDelete() {
    const { strategyID , strategyName } = this.state
    const { intl: { formatMessage } } = this.props
    const notifcation = new NotificationHandler()
    if (strategyID.length == 0) {
      notifcation.info(formatMessage(intlMsg.slcDeleteStg))
      return
    }
    const _this = this
    this.props.deleteSetting(this.props.cluster, strategyID, strategyName,{
      success: {
        func:()=> {
          notifcation.success(formatMessage(intlMsg.deleteStgScs))
          loadStrategy(_this)
        },
        isAsync: true
      },
      failed:{
        func: ()=>　{
          notifcation.success(formatMessage(intlMsg.deleteStgFail))
        }
      }
    })
  }
  handEnable() {
    const { strategyID, strategyName, enable } = this.state
    const { intl: { formatMessage } } = this.props
    const _this = this
    let enables = enable == 'start' ? 1: 0
    const noticeText = enable== 'start' ? formatMessage(intlMsg.stgStarting):formatMessage(intlMsg.stgInStop)
    const body = {
      strategies:[{
        strategyID: strategyID.toString(),
        strategyName: strategyName.join(',')
      }]
    }
    const notifcation = new NotificationHandler()
    notifcation.spin(noticeText)
    if (enables) {
      this.props.batchEnable(this.props.cluster, body, {
        success: {
          func: ()=> {
            notifcation.close()
            loadStrategy(_this)
          },
          isAsync: true
        },
        failed: {
          func: ()=> {
            notifcation.close()
            notifcation.error(formatMessage(intlMsg.stgEditFail))
          }
        }
      })
    }else{
      this.props.batchDisable(this.props.cluster, body, {
        success: {
          func: ()=> {
            notifcation.close()
            loadStrategy(_this)
          },
          isAsync: true
        },
        failed: {
          func: ()=> {
            notifcation.close()
            notifcation.error(formatMessage(intlMsg.stgEditFail))
          }
        }
      })
    }
    _this.setState({enable: false})
  }
  handignoreSetting() {
    const { intl: { formatMessage } } = this.props
    const strategy = []
    const _this = this
    const { record, time ,ignoreUnit } = this.state
    const times = time + ignoreUnit
    const notifi = new NotificationHandler()
      strategy.push({
        strategyID: record.strategyID,
        strategyName: record.strategyName,
        interval: times
      })
    if(strategy.length == 0 ) {
      notifi.error(formatMessage(intlMsg.slcIgnoreTimeStg))
      return
    }
    notifi.spin(formatMessage(intlMsg.setting))
    setTimeout(()=>{
      this.setState({lookModel: false})
    },100)
    this.props.ignoreSetting(record.clusterID, {
      strategies: strategy
    }, {
      success: {
        func: () => {
          notifi.close()
          notifi.success(formatMessage(intlMsg.setStgTimeScs))
          loadStrategy(_this)
        },
        isAsync: true
      }
    })
  }
  handClickRow(e) {
    // this func is click table row then checkbox checked or false
    const { strategys } = this.props
    const { selectedRowKeys, strategyID } = this.state
    let selectedRows = cloneDeep(selectedRowKeys)
    let strategie = cloneDeep(strategyID)
    strategys.map((list, index) => {
      if (list.strategyID == e.strategyID) {
        if (selectedRowKeys.indexOf(index) > -1) {
          selectedRows.splice(selectedRowKeys.indexOf(index),1)
          strategie.splice(strategyID.indexOf(e.strategyID), 1)
          return
        }
        strategie.push(e.strategyID)
        return selectedRows.push(index)
      }
    })
    this.setState({
      selectedRowKeys: selectedRows,
      strategyID: strategie,
    })
  }
  cancelModal() {
    // cancel create Alarm modal
    this.setState({
      alarmModal: false,
      step: 1
    })
  }
  nextStep(step) {
    this.setState({
      step: step
    })
  }
  showAlert() {
    const { withNode, cluster, nodeName, currentApp, intl: { formatMessage } } = this.props
    if (withNode) {
      browserHistory.push(
        `/cluster/alarmSetting?redirect=${encodeURIComponent(`/alarmSetting?createShow=create&createType=1&createClusterID=${cluster}&createObj=${nodeName}&_divider=0`)}`
      )
      return
    }
    if(currentApp && currentApp.services && !currentApp.services.length){
      Modal.info({
        title: formatMessage(intlMsg.tip),
        content: <div style={{color:'#2db7f5'}}><FormattedMessage {...intlMsg.noServerAlarm}/></div>,
        onOk() {},
      });
      return
    }
    this.setState({alarmModal: true,isEdit: false})
    setTimeout(()=> {
      document.getElementById('name').focus()
    },500)
  }
  clearRecords() {
    const { deleteRecords, clusterID, intl: { formatMessage } } = this.props
    const notify = new NotificationHandler()
    if(!this.state.clearStraregy.strategyID) {
      return notify.error(formatMessage(intlMsg.slcClearStg))
    }
    const { strategyID, strategyName } = this.state.clearStraregy
    const query = {
      strategyID,
      strategyName
    }
    notify.spin(formatMessage(intlMsg.stgAlarmInClear))
    deleteRecords(clusterID, query, {
      success: {
        func: () => {
          notify.close()
          notify.success(formatMessage(intlMsg.stgAlarmClearScs))
          this.setState({
            clearStraregy: {},
            clearModal: false
          })
        }
      },
      failed: {
        func: () => {
          notify.close()
          notify.error(formatMessage(intlMsg.stgAlarmDeleteFail))
          this.setState({
            clearStraregy: {},
            clearModal: false
          })
        }
      }
    })
  }
  render() {
    const { intl: { formatMessage }, withNode } = this.props
    const columns = [
      {
        title: formatMessage(intlMsg.name),
        dataIndex: 'strategyName',
        key: 'strategyName',
        width:'13%',
        render: (text,row) => {
          let url = !withNode ? `/manange_monitor/alarm_setting/${row.strategyID}?name=${row.strategyName}&&clusterID=${row.clusterID}`
            : `/cluster/alarmSetting?redirect=${encodeURIComponent(`/alarmSetting/${row.strategyID}?name=${row.strategyName}&goback=host&_divider=0`)}`
          return (
            <Link to={url}>{text}</Link>
          )
        },
      },
      {
        title: formatMessage(intlMsg.status),
        dataIndex: 'statusCode',
        key: 'statusCode',
        width:'12%',
        render: text => {
          if (text == 1) {
            return <div style={{ color: '#33b867' }}><i className="fa fa-circle" /> &nbsp;<FormattedMessage {...intlMsg.startUse}/></div>
          }
          if (text == 0) {
            return <div style={{ color: '#f23e3f' }}><i className="fa fa-circle" /> &nbsp;<FormattedMessage {...intlMsg.stopUse}/></div>
          }
          if (text == 2) {
            return <div style={{ color: '#FAB35B' }}><i className="fa fa-circle" /> &nbsp;<FormattedMessage {...intlMsg.alarm}/></div>
          }
          return <div style={{ color: '#f23e3f' }}><i className="fa fa-circle" /> &nbsp;<FormattedMessage {...intlMsg.ignore}/></div>
        }
      },
      {
        title: formatMessage(intlMsg.monitorCycle),
        width:'15%',
        dataIndex: 'repeatInterval',
        render: (text) => calcuTime(text)
      },
      {
        title: formatMessage(intlMsg.createTime),
        dataIndex: 'createTime',
        key: 'createTime',
        width:'20%',
        sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
        render: (text) => <TimeHover time={text} />
      },
      {
        title: formatMessage(intlMsg.lastEditPeople),
        dataIndex: 'updater',
        key: 'updater',
        width:'15%',
      },
      {
        title: formatMessage(intlMsg.operation),
        dataIndex: 'name',
        key: 'action',
        width:'20%',
        render: (text, record) => {
          return <Dropdown.Button
            type="ghost"
            onClick={()=> this.setState({lookModel: true, record})}
            overlay={this.dropdowns(record)}
          >
            <FormattedMessage {...intlMsg.ignore}/>
          </Dropdown.Button>
        }
      }
    ];
    const modalFunc=  {
      scope : this,
      cancelModal: this.cancelModal.bind(this),
      nextStep: this.nextStep.bind(this)
    }
    const _this = this
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys, // 控制checkbox是否选中
      onChange(selectedRowKeys, selectedRows) {
        const strategyName =[]
        const strategyID = selectedRows.map((list)=> {
          strategyName.push(list.strategyName)
          return list.strategyID
        })
        _this.setState({strategyID, strategyName, selectedRowKeys})
      }
    }
    const { total } = this.props.data || 0
    const { currentPage, size } = this.state
    return (
      <div className="alarmStrategy">
        <div className="topRow">
           <Button size="large" type="primary" onClick={()=> this.showAlert()}><i className="fa fa-plus" /> <FormattedMessage {...intlMsg.createAlarm}/></Button>
          <Button  className="refresh" size="large" onClick={()=>　loadStrategy(this)}><i className="fa fa-refresh" /> <FormattedMessage {...intlMsg.refresh}/></Button>
          <Button className="refresh" icon="delete" size="large" type="ghost" onClick={() => this.setState({ deleteModal: true })} disabled={(this.state.selectedRowKeys.length == 0)}><FormattedMessage {...intlMsg.delete}/></Button>
        </div>
        <div className='pageBox'>
          <span className='totalPage'><FormattedMessage {...intlMsg.totalItem} values={{ total }}/></span>
          <Pagination
            simple
            className='inlineBlock'
            onChange={(page)=> this.onPageChange(page)}
            current={currentPage}
            pageSize={size}
            total={total} />
        </div>
        <Table
          className="strategyTable"
          onRowClick={(e)=> this.handClickRow(e)}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={this.props.strategys}
          pagination={false}
        />
        <Modal title={formatMessage(intlMsg.deleteStg)} visible={this.state.deleteModal}
          onCancel={() => this.setState({ deleteModal: false })}
          onOk={() => this.handDelete()}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            <FormattedMessage {...intlMsg.confirmDeleteStg}/>
          </div>
        </Modal>
        <Modal
          title={<FormattedMessage {...intlMsg.ignore}/>}
          visible={this.state.lookModel}
          onOk={()=> this.handignoreSetting()}
          onCancel={()=> this.setState({lookModel: false})}
          footer={[
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={()=> this.setState({lookModel: false})}
            >
              <FormattedMessage {...intlMsg.back}/>
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={()=> this.handignoreSetting()}
              disabled={this.state.record && this.state.record.statusCode == 0}
            >
              <FormattedMessage {...intlMsg.submit}/>
            </Button>,
          ]}
        >
          {
            this.state.record && this.state.record.statusCode == 0
            ? <Row className="alertRow warningRow">
              <Col span={2} className="alertRowIcon">
                <i className="fa fa-exclamation-triangle" />
              </Col>
              <Col span={22} className="alertRowDesc">
                <FormattedMessage {...intlMsg.stgStopPlsStart}/>
              </Col>
            </Row>
            : <div className="alertRow">
                <FormattedMessage {...intlMsg.noteIgnoreNoMail}/>
            </div>
          }
          <div className="modalParams">
            <span className="keys"><FormattedMessage {...intlMsg.ignoreTime}/></span>
            <InputNumber size="large" value={this.state.time} min={1} style={{margin:'0 10px'}} onChange={(e)=> this.setState({time: e})}/>
            <Select style={{width: 80}} size="large" value={this.state.ignoreUnit} onChange={(e)=> this.setState({ignoreUnit: e})}>
              <Option value="h"><FormattedMessage {...intlMsg.hour}/></Option>
              <Option value="m"><FormattedMessage {...intlMsg.minute}/></Option>
              <Option value="s"><FormattedMessage {...intlMsg.second}/></Option>
            </Select>
          </div>
        </Modal>
        {/* start or stop modal  */}
        <Modal title={this.state.enable =='start' ? formatMessage(intlMsg.startStg): formatMessage(intlMsg.stopStg)} visible={this.state.enable ? true : false}
        onCancel={()=> this.setState({enable: false})}
        onOk={()=> this.handEnable()}
        >
          <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>
            { formatMessage(this.state.enable =='start' ? intlMsg.confirmStartStg : intlMsg.confirmStopStg) }
          </div>
        </Modal>
        <Modal title={this.state.isEdit? formatMessage(intlMsg.editAlarmStg): formatMessage(intlMsg.createAlarmStg) } visible={this.state.alarmModal} width={580}
          className="alarmModal"
          onCancel={() => this.setState({ alarmModal: false, step: 1 })}
          maskClosable={false}
          footer={null}
        >
          <CreateAlarm
            withNode={this.props.withNode}
            createBy={this.props.createBy}
            funcs={modalFunc}
            strategy={this.state.editStrategy}
            currentService={this.props.currentService}
            isEdit={this.state.isEdit}
            isShow={this.state.alarmModal}
            getSettingList={() => loadStrategy(this)}
            currentApp={this.props.currentApp}
          />
        </Modal>
        <Modal title={formatMessage(intlMsg.createNotiGroup)} visible={this.state.createGroup}
          width={560}
          maskClosable={false}
          wrapClassName="AlarmModal"
          className="alarmContent"
          footer={null}
        >
          <CreateGroup funcs={modalFunc} shouldLoadGroup={true} />
        </Modal>
        <Modal title={formatMessage(intlMsg.clearStgLog)} visible={this.state.clearModal}
               onCancel={()=> this.setState({clearModal: false, clearStrategy: {}})}
               onOk={()=> this.clearRecords()}
        >
          <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>
            <FormattedMessage {...intlMsg.deleteStgConfirm} values={{ name: this.state.clearStraregy.name }}/></div>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { settingList } = state.alert
  const { cluster } = state.entities.current
  const { clusterID } = cluster || { clusterID : ''}
  if (!settingList) {
    return props
  }
  let defaultData = {
    data: {
      total: 0,
      strategys: []
    }
  }
  const { data } = settingList.result || defaultData
  const { strategys } = data
  return {
    data,
    isFetching: settingList.isFetching || false,
    strategys,
    clusterID
  }
}

export default connect(mapStateToProps, {
  getSettingList,
  deleteSetting,
  batchEnable,
  batchDisable,
  ignoreSetting,
  deleteRecords
})(injectIntl(AlarmStrategy, {
  withRef: true,
}))
