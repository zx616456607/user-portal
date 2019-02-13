/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * AlarmSettingLog.js page
 *
 * @author zhangtao
 * @date Friday June 8th 2018
 */
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Alarm Setting component
 *
 * v0.1 - 2017-3-16
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Link, browserHistory } from 'react-router'
import { camelize } from 'humps'
import {
  Card, Input, Modal, InputNumber, Checkbox, Progress, Icon, Spin, Table, Select,
  Dropdown, DatePicker, Menu, Button, Pagination, Row, Col
} from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import NotificationHandler from '../../components/Notification'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../constants'
import { getAlertSetting, deleteRecords, getSettingList, deleteRegularSetting, batchEnable, batchDisable, batchToggleRegular, ignoreSetting, getSettingInstant } from '../../actions/alert'
import { loadServiceDetail } from '../../actions/services'
import { getHostInfo } from '../../actions/cluster'
import CreateAlarm from '../AppModule/AlarmModalLog'
import CreateGroup from '../AppModule/AlarmModalLog/CreateGroup'
//import no_alarm from '../../assets/img/no_data/no_alarm.png'
import { formatDate } from '../../common/tools.js'
import './style/AlarmRecord.less'
import cloneDeep from 'lodash/cloneDeep'
import Title from '../Title'
import classNames from 'classnames'
import TenxTab from './component/TenxTab'
import { getSettingRegularList, getLogAlertPluginStatus } from '../../actions/alert'
import TimeHover from '@tenx-ui/time-hover/lib'

const Option = Select.Option

let MyComponent = React.createClass({
  getInitialState() {
    return {
      lookModel: false,
      isFirstData: true,
      data: this.props.data,
      ignoreTime: 1,
      ignoreSymbol: 'm',
      clearStraregy: {},
      search: '',
      preItem: {},
    }
  },
  componentDidMount() {
    const { getLogAlertPluginStatus, clusterID } = this.props
    const notify = new NotificationHandler()
    getLogAlertPluginStatus(clusterID, {
      failed: {
        func: (err) => {
          const { statusCode } = err
          if (statusCode === 404) {
            notify.warn('日志告警组件未安装', '请联系管理员检查组件相关服务')
          } else {
            notify.warn('获取日志告警组件安装状态失败')
          }
        }
      }
    })
  },
  componentWillReceiveProps(nextProps) {
    const nextData = nextProps.data
    if(this.state.data && !nextProps.needUpdate) {
      this.state.data.forEach(item => {
        nextData.some(data => {
          if(data.strategyID == item.strategyID) {
            data.checked = item.checked
            data.active = item.active
            return true
          }
          return false
        })
      })
    }
    if(nextProps.needUpdate) {
      this.setState({
        checkAll: false
      })
    }
    this.setState({
      data: nextData
    })
  },
  handDelete(key,record) {
    // Dropdown delete action
    const { scope, history } = this.props
    // console.log('key', key)
    // console.log('record', record)
    // return
    this.setState({record})
    switch(key) {
      case 'delete': {
        scope.setState({deleteModal: true, selectStrategy: record})
        return
      }
      case 'edit': {
        scope.setState({
          editModal: record,
          alarmModal: true,
          isEdit: true
        })
        return
      }
      case 'start': {
        scope.setState({
          selectStrategy: record,
          showStart: true
        })
        return
      }
      case 'stop': {
        scope.setState({
          selectStrategy: record,
          showStop: true
        })
        return
      }
      case 'list': {
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
      default: return
    }
  },
  clearRecords() {
    const { deleteRecords, clusterID, getSettingList } = this.props
    const notify = new NotificationHandler()
    if(!this.state.clearStraregy.strategyID) {
      return notify.error('请选择要清除记录的策略')
    }
    notify.spin('策略告警记录清除中')
    const { strategyID, strategyName } = this.state.clearStraregy
    const query = {
      strategyID,
      strategyName
    }
    deleteRecords(clusterID, query, {
      success: {
        func: () => {
          notify.close()
          notify.success('策略告警记录清除成功')
          setTimeout(() => getSettingList(clusterID, {
            targetType: 0,
            from: DEFAULT_PAGE - 1,
            size: DEFAULT_PAGE_SIZE
          }))
          this.setState({
            clearStraregy: {},
            clearModal: false
          })
        }
      },
      failed: {
        func: () => {
          notify.close()
          notify.error('策略告警记录删除失败')
          this.setState({
            clearStraregy: {},
            clearModal: false
          })
        }
      }
    })
  },
  switchType(type) {
    switch(type) {
      case 0: return '服务'
      case 1: return '节点'
      default: return '节点'
    }
  },
  dropdowns (record){
    // Dropdown delete btn
    return(
      <Menu onClick={(e)=> this.handDelete(e.key, record)}
          style={{ width: '80px' }}
      >
      {/* <Menu.Item key="delete">
        <span>删除</span>
      </Menu.Item> */}
      <Menu.Item key="edit">
        <span>修改</span>
      </Menu.Item>
      <Menu.Item key="stop" disabled={(record.isEnabled === false)}>
        <span>停用</span>
      </Menu.Item>
      <Menu.Item key="start" disabled={(record.isEnabled === true)}>
        <span>启用</span>
      </Menu.Item>
    </Menu>

    )
  },
  formatStatus(text){
    if (text == true) {
      return <span className="running"><i className="fa fa-circle" /> 启用</span>
    }
    if (text == false) {
      return <span className="stop"><i className="fa fa-circle" /> 停用</span>
    }
  },
  handOverlook() {
    const { currentStrategy, ignoreTime, ignoreSymbol } = this.state
    const { scope } = this.props
    scope.ignoreSetting.call(scope, currentStrategy, ignoreTime + ignoreSymbol)
    this.setState({
      lookModel: false,
      currentStrategy: null
    })
  },
  sorterData(sorter) {
    const newData = this.state.data.sort((a, b) => {
      if (sorter == 'up') {
        return Date.parse(b.createTime) - Date.parse(a.createTime)
      }
      return Date.parse(a.createTime) - Date.parse(b.createTime)
    })
    this.setState({
      data: newData,
      sorter,
    })
  },
  changeAll(e) {
    const oldData = cloneDeep(this.state.data)
    const newData = oldData.map((item, index)=> {
      item.checked = e.target.checked
      return item
    })
    let canStart = false
    let canStop = false
    const checkedData = newData.filter(item => {
      return item.checked
    })
    if(checkedData.length > 0) {
      canStop = newData.every(item => {
        return item.statusCode != 0
      })
      canStart = newData.every(item => {
        return item.statusCode == 0
      })
    }
    const { scope } = this.props
    setTimeout(() => scope.setState({isDelete: !e.target.checked, data: newData, canStart, canStop}), 0)
    this.setState({
      data: newData,
      checkAll: e.target.checked
    })
  },
  changeChecked(e, ins) {
    const oldData = cloneDeep(this.state.data)
    let isDelete = true
    const newData = oldData.map((item, index)=> {
      if (index == ins) {
        item.checked = !item.checked
        return item
      }
      return item
    })
    let canStart = false
    let canStop = false
    const checkedData = newData.filter(item => {
      return item.checked
    })
    if(checkedData.length > 0) {
      canStart = checkedData.every(item => {
        return item.isEnabled === false
      })
      canStop = checkedData.every(item => {
        return item.isEnabled === true
      })
    }
    if(!e.target.checked) {
      this.setState({
        checkAll: false
      })
    } else {
      const isAllCheck = newData.every(item => {
        return item.checked
      })
      this.setState({
        checkAll: isAllCheck
      })
    }
    newData.forEach((list)=> {
      if (list.checked) {
        isDelete= false;
      }
    })
    const { scope } = this.props
    setTimeout(() => scope.setState({
      isDelete,
      data: newData,
      canStop,
      canStart
    }), 0)
    this.setState({
      data: newData
    })
  },
  tableListMore(list, e) {
    if(e && e.target && e.target.nodeName == 'A') return
    const oldData = cloneDeep(this.state.data)
    const preItem = cloneDeep(this.state.preItem)
    const currentItem = oldData[list]
    let data
    const newData = oldData.map((item, index)=> {
      if (index == list) {
        data = item
        item.active = !item.active
        return item
      }
      item.active = false
      return item
    })
    this.setState({
      data: newData,
      preItem: data,
    })
    if(data && data.active) {
      const { scope, getSettingInstant, settingInstant } = this.props
      // 策略名称且策略类型不改变，不请求新数据
      if(preItem.strategyName === currentItem.strategyName && preItem.targetType === currentItem.targetType){
        return
      }
      let type = 'node'
      if(data.targetType == 0) {
        type = 'service'
      }
      setTimeout(() => getSettingInstant(scope.props.clusterID, type, data.strategyName, {
        name: data.targetName
      }), 0)
    }
  },
  childerList(list) {
    const { settingInstant } = this.props
    const targetType = list.targetType
    if(!settingInstant.result) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    const data = settingInstant.result[camelize(list.strategyName)]
    if(settingInstant.isFetching && !data) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    if(!data) { return <div>无数据</div>}
    const leftNameStyle = classNames({
      'leftName': true,
      'leftName3': data.disk ? false : true,
      'leftName4': data.disk ? true : false,
    })
    const memoryListsStyle = classNames({
      'memoryList3': data.disk ? false : true,
      'memoryList3After': data.disk ? false : true,
      'memoryList4': data.disk ? true : false,
      'memoryList4After': data.disk ? true : false
    })
    const diskListsStyle = classNames({
      'lastLists': true,
      'disklists': data.disk ? false : true,
    })
    const rateListsStyle = classNames({
      'lastLists': true,
      'ratelists': data.disk ? false : true,
    })
    const connectNum = classNames({
      'lastLists': true,
      'connectList': data.disk ? true: false
    })
    return (
      <div className="wrapChild">
        <div className={leftNameStyle}>
          { list.targetName }
        </div>
        <div className="rightList">
          <div className="lists">
            <span className="keys">CPU</span>
            <Progress percent={parseFloat(data.cpus).toFixed(2)} strokeWidth={8} format={ percent => percent + '%'} status={parseFloat(data.cpus) > 80 ? 'exception' : ''}  className="progress" />
          </div>
          <div className={memoryListsStyle}>
            <span className="keys">内存</span>
            <Progress percent={ data.memory[2] * 100 } strokeWidth={8} format={ () =>  parseInt(data.memory[0]/(1024*1024)) + 'MB'}   status={ data.memory[2]*100 > 80 ? 'exception' : ''} className="progress"/>
          </div>
          <div className={rateListsStyle}>
            <span className="keys">流量</span>
            <span className="keys">
              <Icon type="arrow-up" />
              { (data.txRate / 1024).toFixed(2) + 'Kb/s' }
            </span>
            <span className="keys">
              <Icon type="arrow-down" />
              { (data.rxRate / 1024).toFixed(2) + 'Kb/s' }
            </span>
          </div>
          { targetType ? <div className={diskListsStyle}>
            <span className="keys">磁盘</span>
            <Progress
              className="progress"
              percent={parseFloat(data.disk).toFixed(2)}
              strokeWidth={8}
              format={ percent => percent + '%'}
              status={ data.disk > 80 ? 'exception' : ''}
            />
          </div> : null }
          {
            targetType ?
            <div className={connectNum}>
              <span className="keys">TCP 连接数</span>
              <span className="keys">
                listen {parseInt(data.tcpListen)} 个
              </span>
              <span className="keys">
                established {parseInt(data.tcpEst)} 个
              </span>
              <span className="keys">
                close_wait {parseInt(data.tcpClose)} 个
              </span>
              <span className="keys">
                time_wait {parseInt(data.tcpTime)} 个
              </span>
            </div> : null
          }
        </div>
      </div>
    )
  },
  calcuTime(time) {
    let sym = '分钟'
    time = time / 60
    if(time / 60 > 1) {
      sym = '小时'
      time = time / 60
    }
    return time + sym
  },
  getIgnoreTime(e) {
    const notify = new NotificationHandler()
    if(e <= 0) {
      notify.error('请填入大于0的数字')
      return
    }
    this.setState({
      ignoreTime: e
    })
  },
  setIgnore(list) {
    return () => {
      this.setState({lookModel: true, currentStrategy: list})
    }
  },
  toProjectDetail(list) {
    const { cluster, loadServiceDetail,getHostInfo } = this.props;
    const notify = new NotificationHandler()
    if (!list.targetType) {
      loadServiceDetail(cluster.clusterID,list.targetName,{
        success: {
          func: ()=> {
            let targetName = `/app_manage/service?serName=${list.targetName}`
            browserHistory.push(targetName)
          },
          isAsync: true
        },
        failed: {
          func: (err)=> {
            if (err.statusCode === 404) {
              notify.info('关联服务不存在或者已经被删除')
            }
          },
          isAsync: true
        }
      })
    }else {
      const body = {
        clusterID:cluster.clusterID,
        clusterName: list.targetName
      }
      getHostInfo(body,{
        success: {
          func: ()=>{
            browserHistory.push(`/cluster/${cluster.clusterID}/${list.targetName}`)
          },
          isAsync:true
        },
        failed: {
          func: ()=>{
            notify.info('关联节点不存在或者已被删除')
          },
          isAsync:true
        }
      })
    }

  },
  createAlarm() {
    const { scope } = this.props;
    scope.setState({alarmModal: true},()=>{
      document.getElementById('name').focus()
    })
  },
  render() {
    const { data } = this.state
    // console.log('map',data)
    let lists
    if(!data || data.length <= 0){
      lists = <tr className='nodata'>
        <td colSpan={9}>
          <Icon type="frown" />
          暂无数据
        </td>
      </tr>
    } else {
      lists = data.map((list, index) => {
      let alertName = list.filter[0].query.queryString.query.split(':').pop().trim()
      return (
        <tr key={`list${index}`}>
            <td> {`${list.name}`}</td>
            <td >服务日志</td>
            <td ><Link to={`/app_manage/service?serName=${alertName}`}>{alertName}</Link></td>
            <td >{this.formatStatus(list.isEnabled)}</td>
            <td >{`${list.timeframe.minutes} 分钟`}</td>
            <td ><TimeHover time={list.description} /></td>
            <td >{list.owner}</td>
            <td className='dropdownTd'>
              <Dropdown.Button
                type="ghost"
                overlay={ this.dropdowns(list) }
                onClick={ this.handDelete.bind(null, 'delete', list)}
              >
              删 除
              </Dropdown.Button>
            </td>
          </tr>
        )
      })
    }
    const strategyTablePadding = classNames({
      'ant-table-table': true,
      'strategyTable': true,
      'nodataPadding': data.length == 0 ? true : false,
      'dataPadding': data.length !== 0 ? true : false,
    })
    return (
      <Card className="ant-table" style={{clear: 'both'}}>
        <table className={strategyTablePadding}>
          <thead className="ant-table-thead">
            <tr>
              <th style={{width:'15%'}}>策略名称</th>
              <th style={{width:'5%'}}>类型</th>
              <th style={{width:'10%'}}>告警对象</th>
              <th style={{width:'10%'}}>状态</th>
              <th style={{width:'10%'}}>监控周期</th>
              <th style={{width:'15%'}}>创建时间
                <div className="ant-table-column-sorter">
                <span className={this.state.sorter =='up' ? "ant-table-column-sorter-up on": 'ant-table-column-sorter-up off'} title="↑" onClick={()=> this.sorterData('up')}><i className="anticon anticon-caret-up"></i></span>
                <span className={this.state.sorter =='down' ? "ant-table-column-sorter-down on" : 'ant-table-column-sorter-down off'} title="↓" onClick={()=> this.sorterData('down')}><i className="anticon anticon-caret-down"></i></span>
                </div>
              </th>
              <th style={{width:'10%'}}>最后修改人</th>
              <th style={{width:'15%'}}>操作</th>
            </tr>
          </thead>
          <tbody className="ant-table-tbody">
          { lists }
          </tbody>
        </table>
        <Modal
          title="忽略"
          visible={this.state.lookModel}
          onOk={()=> this.handOverlook()}
          onCancel={()=> this.setState({lookModel: false, currentStrategy: null})}
          footer={[
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={()=> this.setState({lookModel: false, currentStrategy: null})}
            >
            返 回
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={()=> this.handOverlook()}
              disabled={this.state.currentStrategy && this.state.currentStrategy.statusCode == 0}
            >
              提 交
            </Button>,
          ]}
        >
          {
            this.state.currentStrategy && this.state.currentStrategy.statusCode == 0
            ? <Row className="alertRow warningRow">
              <Col span={2} className="alertRowIcon">
                <i className="fa fa-exclamation-triangle" />
              </Col>
              <Col span={22} className="alertRowDesc">
              当前告警策略已停用，请先启用该策略
              </Col>
            </Row>
            : <div className="alertRow">
            注意：在忽略时间内我们将不会发送告警邮件通知！
            </div>
          }
          <div className="modalParams">
            <span className="keys">忽略时长</span>
        <InputNumber size="large" min={1} style={{margin:'0 10px'}} defaultValue={100} value={this.state.ignoreTime} onChange={(e) => this.getIgnoreTime(e)}/>
            <Select style={{width: 80}} size="large" defaultValue={'m'} onChange={(e) => this.setState({ignoreSymbol: e})}>
              <Option value="h">小时</Option>
              <Option value="m">分钟</Option>
              <Option value="s">秒</Option>
            </Select>
          </div>
        </Modal>
        <Modal title="清除策略告警记录" visible={this.state.clearModal}
          onCancel={()=> this.setState({clearModal: false, clearStrategy: {}})}
          onOk={()=> this.clearRecords()}
        >
        <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>您的操作将会清空 {this.state.clearStraregy.name} 策略所有告警记录，并且重置告警次数，是否清空？</div>
        </Modal>
      </Card>
    )
  }
})

function myComponentMapStateToProp(state) {
  const defaultInstant = {
    isFetching: false
  }
  let { settingInstant }  = state.alert
  const { cluster } = state.entities.current;
  if(!settingInstant) {
    settingInstant = defaultInstant
  }
  return{
    settingInstant,
    cluster,
  }
}

MyComponent = connect(myComponentMapStateToProp, {
  getSettingInstant,
  deleteRecords,
  loadServiceDetail,
  getHostInfo,
  getSettingList,
})(MyComponent)



class AlarmSetting extends Component {
  constructor(props) {
    super(props);
    this.nextStep = this.nextStep.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.state = {
      createGroup: false,
      step: 1, // first step create AlarmModal
      deleteModal: false, // delete alarm modal
      isDelete: true, // disabled delte btn
      currentPage: DEFAULT_PAGE,
      data: [],
      canStart: false,
      canStop: false,
      needUpdate: false
    }
  }
  componentWillMount() {
    const { getSettingRegularList, clusterID } = this.props
    getSettingRegularList(clusterID)
  }
  componentWillReceiveProps(nextProps) {
    const { getSettingList } = this.props
    let preSpaceName = this.props.space.spaceName;
    let nextSpaceName = nextProps.space.spaceName;
    let preClusterID = this.props.clusterID;
    let nextClusterID = nextProps.clusterID;

    if(preSpaceName !== nextSpaceName || preClusterID !== nextClusterID){
      getSettingList(nextClusterID, {
        from: DEFAULT_PAGE - 1,
        size: DEFAULT_PAGE_SIZE
      })
    }
    if(this.state.needUpdate) {
      this.setState({
        data: nextProps.setting
      })
      setTimeout(() => {
        this.setState({
          needUpdate: false
        })
      })
    }
  }
  handSearch(e) {
    // search data
    const { search } = this.state
    const { getSettingList, clusterID, teamID } = this.props
    this.setState({
      currentPage: 1
    })
    if(search) {
      getSettingList(clusterID, {
        from: 0,
        size: DEFAULT_PAGE_SIZE,
        search: true,
        strategyName: search
      })
    } else {
      getSettingList(clusterID, {
        from: 0,
        size: DEFAULT_PAGE_SIZE
      })
    }
  }
  description(rule) {
    // Dropdown more info
    return (
      <div>cpu is</div>
    )
  }
  cancelModal() {
    // cancel create Alarm modal
    this.setState({
      alarmModal: false,
      step:1
    })
  }
  nextStep(step) {
    this.setState({
      step: step
    })
  }
  onPageChange(page) {
    if (page == this.state.currentPage) return
    this.setState({
      currentPage: page
    })
    const { getSettingList, clusterID } = this.props
    const search = document.getElementById('alarmSearch').value
    if (search) {
      getSettingList(clusterID, {
        from: 0,
        size: DEFAULT_PAGE_SIZE,
        search: true,
        strategyName: search
      })
    } else {
      getSettingList(clusterID, {
        from: (page - 1) * DEFAULT_PAGE_SIZE,
        size: DEFAULT_PAGE_SIZE
      })
    }
  }
  deleteRecords() {
    const data = this.state.data
    const strategyID = []
    const strategyName =[]
    const selectStrategy = this.state.selectStrategy
    if(selectStrategy) {
      strategyID.push(selectStrategy.strategyID)
      strategyName.push(selectStrategy.strategyName)
    } else {
      data.forEach(item => {
        if(item.checked) {
          strategyID.push(item.strategyID)
          strategyName.push(item.strategyName)
        }
      })
    }
    const notify = new NotificationHandler()
    const { clusterID, deleteSetting, getSettingList } = this.props
    notify.spin('删除中')
    strategyID.length > 0 && deleteSetting(clusterID, strategyID,selectStrategy.name, {
      success: {
        func: () => {
          this.setState({
            deleteModal: false,
            canStart: false,
            canStop: false,
            needUpdate: true,
            selectStrategy: null
          })
          notify.close()
          notify.success('策略删除成功')
          getSettingList(clusterID, {
            from: (this.state.currentPage - 1) * DEFAULT_PAGE_SIZE,
            size: DEFAULT_PAGE_SIZE
          })
          this.disableButton()
        },
        isAsync: true
      },
      failed: {
        func:(res) => {
          notify.close()
          let message = '策略删除失败'
          if(res.message) {
            message = res.message
          }
          if(res.message.message) {
            message = res.message.message
          }
          notify.error(message)
          this.setState({
            deleteModal: false,
            selectStrategy: null
          })
        }
      }
    })
  }
  ignoreSetting(special, time) {
    const strategy = []
    const notifi = new NotificationHandler()
    strategy.push({
      strategyID: special.strategyID,
      interval: time,
      strategyName:special.strategyName
    })
    if(strategy.length == 0 ) {
      notifi.error('请选择要设置忽略时间的策略')
      return
    }
    notifi.spin('设置中')
    const { clusterID, ignoreSetting, getSettingList } = this.props
    ignoreSetting(clusterID, {
      strategies: strategy
    }, {
      success: {
        func: () => {
          notifi.close()
          notifi.success('设置策略忽略时间成功')
          getSettingList(clusterID, {
            from: (this.state.currentPage - 1) * DEFAULT_PAGE_SIZE,
            size: DEFAULT_PAGE_SIZE
          })
          this.setState({
            needUpdate: true
          })
          this.disableButton()
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notifi.close()
          notifi.error('设置策略忽略时间失败')
        }
      }
    })
  }
  refreshPage() {
    const { clusterID, getSettingList } = this.props
    getSettingList(clusterID, {
      from: (this.state.currentPage - 1) * DEFAULT_PAGE_SIZE,
      size: DEFAULT_PAGE_SIZE
    })
    this.setState({
      needUpdate: true
    })
    this.disableButton()
  }
  getCheckecSettingName() {
    const checkedName = []
    if(this.state.selectStrategy) {
      return this.state.selectStrategy.strategyName
    }
    this.state.data.forEach(item => {
      if(item.checked) {
        checkedName.push(item.strategyName)
      }
    })
    return checkedName.join(',')
  }
  showStart() {
    const data = this.state.data
    const strategy = []
    const notifi = new NotificationHandler()
    data.forEach(item => {
      if(item.checked) {
        strategy.push({
          strategyID: item.strategyID,
          enable: 0
        })
      }
    })
    if(strategy.length == 0 ) {
      notifi.error('请选择要启用的策略')
      return
    }
    this.setState({
      showStart: true
    })
  }
  showStop() {
    const data = this.state.data
    const selectStrategy = this.state.selectStrategy
    const strategy = []
    const notifi = new NotificationHandler()
    if(selectStrategy) {
      strategy.push({
        strategyID: selectStrategy.strategyID,
        strategyName:selectStrategy.strategyName,
        enable: 0
      })
    } else {
      data.forEach(item => {
        if(item.checked) {
          strategy.push({
            strategyID: item.strategyID,
            enable: 0
          })
        }
      })
    }
    if(strategy.length == 0 ) {
      notifi.error('请选择要停用的策略')
      return
    }
    this.setState({
      showStop: true
    })
  }

  startSetting() {
    const data = this.state.data
    const selectStrategy = this.state.selectStrategy
    const ruleName = this.state.selectStrategy.name;
    const strategy = []
    const notifi = new NotificationHandler()
    if(selectStrategy) {
      if(selectStrategy.enable == 1) {
        notifi.error('该策略已启用')
        return
      }
      strategy.push({strategyID:selectStrategy.strategyID,strategyName:selectStrategy.strategyName})
    } else {
      data.forEach(item => {
        if(item.checked) {
          strategy.push({strategyID:item.strategyID,strategyName:item.strategyName})
        }
      })
    }
    if(strategy.length == 0 ) {
      notifi.error('请选择要启用的策略')
      return
    }
    notifi.spin('启用中')
     this.setState({
      showStart: false,
    })
    const { clusterID, batchEnable, getSettingList } = this.props
    batchEnable(clusterID, ruleName, {
      success: {
        func: () => {
          notifi.close()
          notifi.success('策略启用成功')
          getSettingList(clusterID)

          this.disableButton()
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notifi.close()
          notifi.error('策略启用失败，请重试')
        }
      }
    })
  }

  stopSetting() {
    const data = this.state.data
    const ruleName = this.state.selectStrategy.name;
    const strategy = []
    const notifi = new NotificationHandler()
    const selectStrategy = this.state.selectStrategy
    if(selectStrategy) {
      if(selectStrategy.enable == 0) {
        notifi.error('该策略已停用')
        return
      }
      strategy.push({strategyID:selectStrategy.strategyID,strategyName:selectStrategy.strategyName})
    } else {
      data.forEach(item => {
        if(item.checked) {
          strategy.push({strategyID:item.strategyID,strategyName:item.strategyName})
        }
      })
    }

    if(strategy.length == 0 ) {
      notifi.error('请选择要停用的策略')
      return
    }
    notifi.spin('停用中')
    this.setState({
      showStop: false,
    })
    const { clusterID, batchDisable, getSettingList } = this.props
    batchDisable(clusterID, ruleName, {
      success: {
        func: () => {
          notifi.close()
          notifi.success('策略停用成功')
          getSettingList(clusterID)
          this.disableButton()
        },
        isAsync: true
      },

      failed: {
        func: () => {
          notifi.close()
          notifi.error('策略停用失败，请重试')
        }
      }
    })
  }
  disableButton() {
    this.setState({
      canStart: false,
      canStop: false,
      isDelete: true,
      needUpdate: true,
      selectStrategy: null
    })
  }
  editSetting() {
    this.setState({
      alarmModal: true,
      isEdit: true
    })
  }
  createStrategy() {
    this.setState({alarmModal: true, isEdit: false})
    setTimeout(() => {
      document.getElementById('name').focus()
    }, 100)
  }
  handCelcan() {
    this.setState({
      showStop:false,
      showStart:false,
    })
    setTimeout(()=> {
      this.setState({selectStrategy:null})
    },500)
  }
  handAction() {
    if (this.state.showStop) {
      return this.stopSetting()
    }
    return this.startSetting()
  }
  render() {
    // const rowSelection = {
    //   // checkbox select callback
    // }
    const { clusterID } = this.props
    const _this = this
    const modalFunc=  {
      scope : this,
      cancelModal: this.cancelModal,
      nextStep: this.nextStep
    }
    let canEdit = true
    let editStrategy = {}
    let checkedNum = 0
    this.state.data.forEach(item => {
      if(item.checked) {
        editStrategy = item
        checkedNum++
      }
    })
    if(this.state.editModal){
      let middleEditStrategy = this.state.editModal
      // console.log('middleEditStrategy', middleEditStrategy)
      // 这里做了一个桥接, 桥接以前的数据的结构
      // console.log('middleEditStrategy', middleEditStrategy)
      editStrategy = {
        active : undefined,
        appName : middleEditStrategy.app, // 这个不对
        checked : undefined,
        clusterID : clusterID,
        createTime : middleEditStrategy.description,
        creator : middleEditStrategy.owner,
        description : "",
        // disableNotifyEndTime : "2018-07-11T1:5:41+0:00",
        enable : middleEditStrategy.IsEnabled === true ? 1 : 0,
        modityTime : middleEditStrategy.description,
        namespace : middleEditStrategy.filter[1].query.queryString.query.split(':').pop().trim(),
        // namespaceType : 0,
        nodeName : "",
        receivers : middleEditStrategy.alertGroup ? middleEditStrategy.alertGroup : '', // 有告警通知组的概念
        receiversGroup : middleEditStrategy.staticPayload && middleEditStrategy.staticPayload.receiversgroup,
        repeatInterval: middleEditStrategy.timeframe.minutes * 60,
        sendEmail : middleEditStrategy.alertGroup ? 1 : 0, // 有告警组就发送告警
        statusCode : 1,
        strategyID : middleEditStrategy.owner + middleEditStrategy.name,
        strategyName : middleEditStrategy.name,
        targetName : middleEditStrategy.filter[0].query.queryString.query.split(':').pop().trim(),
        targetType : 0,
        updater : middleEditStrategy.owner,
        numEvents: middleEditStrategy.numEvents,
        regex: middleEditStrategy.regex,
      }
      // console.log('logeditStrategy', editStrategy)
    }
    if(checkedNum != 1){
      canEdit = false
    }
    return (
      <QueueAnim type="right" >
        <div id="AlarmRecord" key="AlarmRecord" >
          <Title title="告警设置" />
          <div className="topRow" style={{marginBottom: '20px'}}>
            <Button size="large" type="primary" onClick={()=> this.createStrategy()}>
              <i className="fa fa-plus" style={{marginRight:'5px'}}/>
              创建
            </Button>
            <Button size="large" type="ghost" onClick={() => this.refreshPage()}><i className="fa fa-refresh" />  刷 新</Button>
            {/* <Button icon="edit" type="ghost" disabled={!canEdit} size="large" onClick={() => this.editSetting()} > 修改</Button> */}
            {/* <div className="inputGrop">
              <Input size="large" id="alarmSearch" placeholder="按策略名称搜索" onChange={(e)=> this.setState({search:e.target.value.trim()})} onPressEnter={()=> this.handSearch()}/>
              <i className="fa fa-search" onClick={()=> this.handSearch()}/>
            </div> */}
            {/* {this.props.setting.length > 0 ? // 目前不支持分页查找
            <div className="rightPage pageBox">
              <span className='totalPage'>共计 {this.props.total} 条</span>
              <Pagination
                simple
                className='inlineBlock'
                onChange={(page)=> this.onPageChange(page)}
                current={this.state.currentPage}
                pageSize={DEFAULT_PAGE_SIZE}
                total={ this.props.total } />
            </div>
            :null
          } */}
          </div>
          <MyComponent
            data={this.props.setting}
            scope={this}
            funcs={{ deleteRecords: this.props.deleteRecords }}
            needUpdate={this.state.needUpdate}
            clusterID={this.props.clusterID}
            getLogAlertPluginStatus={this.props.getLogAlertPluginStatus}
          />
          <Modal title={this.state.isEdit? "修改告警策略": "创建告警策略" } visible={this.state.alarmModal} width={580}
            className="alarmModal"
            onCancel={() => this.setState({ alarmModal: false, step: 1 })}
            maskClosable={false}
            footer={null}
          >
            <CreateAlarm funcs={modalFunc} strategy={editStrategy} isEdit={this.state.isEdit} isShow={this.state.alarmModal}
              getSettingList={() => this.refreshPage()} />
          </Modal>
          {/* 通知组 */}
          <Modal title="创建新通知组" visible={this.state.createGroup}
            width={560}
            maskClosable={false}
            wrapClassName="AlarmModal"
            className="alarmContent"
            footer={null}
          >
            <CreateGroup funcs={modalFunc} shouldLoadGroup={true} />
          </Modal>
          <Modal title="删除策略" visible={this.state.deleteModal}
            onCancel={() => this.setState({ deleteModal: false, selectStrategy: null })}
            onOk={() => this.deleteRecords()}
          >
            <div className="deleteRow">
              <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              策略删除后将不再触发告警，确认删除策略 {this.getCheckecSettingName()} ？
            </div>
          </Modal>
          <Modal title={this.state.showStop ? '停用策略':'启用策略'} visible={this.state.showStop || this.state.showStart}
            onCancel={()=> this.handCelcan()}
            onOk={() => this.handAction()}
          >
            <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{ marginRight: 10 }}></i>确定要{this.state.showStop ? '停用':'启用'}策略 {this.getCheckecSettingName()} ？</div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  let recordsData = {
    total: 0,
    records: []
  }
  const defaultSettingList = {
    result: {
      data: []
    }
  }
  const { entities } = state
  const cluster = entities.current.cluster
  const team = entities.current.team
  const space = entities.current.space
  let setting = state.alert.settingRegularList || defaultSettingList // 告警日志正则
  // let setting = state.alert.settingList || defaultSettingList // 告警日志正则
  if(!setting.result || !setting.result.data) {
    setting = defaultSettingList
  }

  let total = setting.result.data.total || 0
  // setting = setting.result.data.strategys || []
  setting = setting.result.data || []
  if ( JSON.stringify(setting) === '[]' ) {
    setting.filter = [ {
      query: {
        queryString:{
          query: ''
        }
      }
    } ]
  }
  return {
    recordsData,
    clusterID: cluster.clusterID,
    teamID: team.teamID,
    setting,
    total,
    space
  }
}

export default connect(mapStateToProps, {
  getAlertSetting,
  deleteRecords,
  getSettingList: getSettingRegularList,
  deleteSetting: deleteRegularSetting,
  batchEnable: batchToggleRegular,
  batchDisable: batchToggleRegular,
  ignoreSetting,
  getSettingRegularList,
  getLogAlertPluginStatus,
})(AlarmSetting)
