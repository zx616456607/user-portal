/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Operation Audit list
 *
 * v2.0 - 2016-11-01
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Card, Select, Button, DatePicker, Input, Cascader, Spin, Tooltip, Pagination } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getOperationLogList } from '../../actions/manage_monitor'
import {formatDate} from '../../common/tools.js'
import './style/OperationalAudit.less'

const Option = Select.Option;

const menusText = defineMessages({
  headTitle: {
    id: 'ManageMonitor.operationalAudit.headTitle',
    defaultMessage: '操作审计 | 时速云',
  },
  title: {
    id: 'ManageMonitor.operationalAudit.title',
    defaultMessage: '操作审计',
  },
  time: {
    id: 'ManageMonitor.operationalAudit.time',
    defaultMessage: '时间',
  },
  status: {
    id: 'ManageMonitor.operationalAudit.status',
    defaultMessage: '状态',
  },
  during: {
    id: 'ManageMonitor.operationalAudit.during',
    defaultMessage: '持续时间',
  },
  event: {
    id: 'ManageMonitor.operationalAudit.event',
    defaultMessage: '操作类型',
  },
  obj: {
    id: 'ManageMonitor.operationalAudit.obj',
    defaultMessage: '对象及类型',
  },
  env: {
    id: 'ManageMonitor.operationalAudit.env',
    defaultMessage: '环境',
  },
  cluster: {
    id: 'ManageMonitor.operationalAudit.cluster',
    defaultMessage: '集群',
  },
  user: {
    id: 'ManageMonitor.operationalAudit.user',
    defaultMessage: '发起者',
  },
  Create: {
    id: 'ManageMonitor.operationalAudit.Create',
    defaultMessage: '添加',
  },
  Get: {
    id: 'ManageMonitor.operationalAudit.Get',
    defaultMessage: '请求',
  },
  List: {
    id: 'ManageMonitor.operationalAudit.List',
    defaultMessage: '获取',
  },
  Update: {
    id: 'ManageMonitor.operationalAudit.Update',
    defaultMessage: '更新',
  },
  Delete: {
    id: 'ManageMonitor.operationalAudit.Delete',
    defaultMessage: '删除',
  },
  Start: {
    id: 'ManageMonitor.operationalAudit.Start',
    defaultMessage: '开始',
  },
  Stop: {
    id: 'ManageMonitor.operationalAudit.Stop',
    defaultMessage: '结束',
  },
  Restart: {
    id: 'ManageMonitor.operationalAudit.Restart',
    defaultMessage: '重启',
  },
  Pause: {
    id: 'ManageMonitor.operationalAudit.Pause',
    defaultMessage: '停止',
  },
  Resume: {
    id: 'ManageMonitor.operationalAudit.Resume',
    defaultMessage: '继续',
  },
  BatchDelete: {
    id: 'ManageMonitor.operationalAudit.BatchDelete',
    defaultMessage: '批量删除',
  },
  BatchStart: {
    id: 'ManageMonitor.operationalAudit.BatchStart',
    defaultMessage: '批量开始',
  },
  BatchStop: {
    id: 'ManageMonitor.operationalAudit.BatchStop',
    defaultMessage: '批量停止',
  },
  BatchRestart: {
    id: 'ManageMonitor.operationalAudit.BatchRestart',
    defaultMessage: '批量重启',
  },
  QuickRestart: {
    id: 'ManageMonitor.operationalAudit.QuickRestart',
    defaultMessage: '快速重启',
  },
  CheckExist: {
    id: 'ManageMonitor.operationalAudit.CheckExist',
    defaultMessage: '检测存在',
  },
  Format: {
    id: 'ManageMonitor.operationalAudit.Format',
    defaultMessage: '格式化',
  },
  Expand: {
    id: 'ManageMonitor.operationalAudit.Expand',
    defaultMessage: '扩张',
  },
  Unknown: {
    id: 'ManageMonitor.operationalAudit.Unknown',
    defaultMessage: '其它',
  },
  selectObject: {
    id: 'ManageMonitor.operationalAudit.selectObject',
    defaultMessage: '选择操作对象',
  },
  selectEvent: {
    id: 'ManageMonitor.operationalAudit.selectEvent',
    defaultMessage: '选择操作类型',
  },
  selectStatus: {
    id: 'ManageMonitor.operationalAudit.selectStatus',
    defaultMessage: '选择状态',
  },
  Instance: {
    id: 'ManageMonitor.operationalAudit.Instance',
    defaultMessage: '实例',
  },
  InstanceEvent: {
    id: 'ManageMonitor.operationalAudit.InstanceEvent',
    defaultMessage: '实例事件',
  },
  InstanceLog: {
    id: 'ManageMonitor.operationalAudit.InstanceLog',
    defaultMessage: '实例日志',
  },
  InstanceMetrics: {
    id: 'ManageMonitor.operationalAudit.InstanceMetrics',
    defaultMessage: '实例指标',
  },
  InstanceContainerMetrics: {
    id: 'ManageMonitor.operationalAudit.InstanceContainerMetrics',
    defaultMessage: '实例容器指标',
  },
  Service: {
    id: 'ManageMonitor.operationalAudit.Service',
    defaultMessage: '服务',
  },
  ServiceInstance: {
    id: 'ManageMonitor.operationalAudit.ServiceInstance',
    defaultMessage: '服务实例',
  },
  ServiceEvent: {
    id: 'ManageMonitor.operationalAudit.ServiceEvent',
    defaultMessage: '服务事件',
  },
  ServiceLog: {
    id: 'ManageMonitor.operationalAudit.ServiceLog',
    defaultMessage: '服务日志',
  },
  ServiceK8sService: {
    id: 'ManageMonitor.operationalAudit.ServiceK8sService',
    defaultMessage: 'k8s服务',
  },
  ServiceRollingUpgrade: {
    id: 'ManageMonitor.operationalAudit.ServiceRollingUpgrade',
    defaultMessage: '服务弹性伸缩',
  },
  ServiceManualScale: {
    id: 'ManageMonitor.operationalAudit.ServiceManualScale',
    defaultMessage: '服务手动伸缩',
  },
  ServiceAutoScale: {
    id: 'ManageMonitor.operationalAudit.ServiceAutoScale',
    defaultMessage: '服务自动伸缩',
  },
  ServiceQuota: {
    id: 'ManageMonitor.operationalAudit.ServiceQuota',
    defaultMessage: '服务Quota',
  },
  ServiceHaOption: {
    id: 'ManageMonitor.operationalAudit.ServiceHaOption',
    defaultMessage: '服务HaOption',
  },
  ServiceDomain: {
    id: 'ManageMonitor.operationalAudit.ServiceDomain',
    defaultMessage: '服务域名',
  },
  App: {
    id: 'ManageMonitor.operationalAudit.App',
    defaultMessage: '应用',
  },
  AppService: {
    id: 'ManageMonitor.operationalAudit.AppService',
    defaultMessage: '应用服务',
  },
  AppOperationLog: {
    id: 'ManageMonitor.operationalAudit.AppOperationLog',
    defaultMessage: '应用操作日志',
  },
  AppExtraInfo: {
    id: 'ManageMonitor.operationalAudit.AppExtraInfo',
    defaultMessage: '应用外部信息',
  },
  AppTopology: {
    id: 'ManageMonitor.operationalAudit.AppTopology',
    defaultMessage: '应用拓补',
  },
  Config: {
    id: 'ManageMonitor.operationalAudit.Config',
    defaultMessage: '配置',
  },
  ConfigGroup: {
    id: 'ManageMonitor.operationalAudit.ConfigGroup',
    defaultMessage: '配置组',
  },
  Node: {
    id: 'ManageMonitor.operationalAudit.Node',
    defaultMessage: '主机',
  },
  NodeMetrics: {
    id: 'ManageMonitor.operationalAudit.NodeMetrics',
    defaultMessage: '主机指标',
  },
  ThirdPartyRegistry: {
    id: 'ManageMonitor.operationalAudit.ThirdPartyRegistry',
    defaultMessage: '第三方容器',
  },
  Volume: {
    id: 'ManageMonitor.operationalAudit.Volume',
    defaultMessage: '存储',
  },
  VolumeConsumption: {
    id: 'ManageMonitor.operationalAudit.VolumeConsumption',
    defaultMessage: '存储使用',
  },
  allstatus: {
    id: 'ManageMonitor.operationalAudit.allstatus',
    defaultMessage: '所有状态',
  },
  running: {
    id: 'ManageMonitor.operationalAudit.running',
    defaultMessage: '运行中',
  },
  success: {
    id: 'ManageMonitor.operationalAudit.success',
    defaultMessage: '完成',
  },
  failed: {
    id: 'ManageMonitor.operationalAudit.failed',
    defaultMessage: '失败',
  },
  search: {
    id: 'ManageMonitor.operationalAudit.search',
    defaultMessage: '立即查询',
  },
  microsecond: {
    id: 'ManageMonitor.operationalAudit.microsecond',
    defaultMessage: '微秒',
  },
  millisecond: {
    id: 'ManageMonitor.operationalAudit.millisecond',
    defaultMessage: '毫秒',
  },
  second: {
    id: 'ManageMonitor.operationalAudit.second',
    defaultMessage: '秒',
  },
  minute: {
    id: 'ManageMonitor.operationalAudit.minute',
    defaultMessage: '分',
  },
  hour: {
    id: 'ManageMonitor.operationalAudit.hour',
    defaultMessage: '时',
  },
  objType: {
    id: 'ManageMonitor.operationalAudit.objType',
    defaultMessage: '类型：',
  },
  objName: {
    id: 'ManageMonitor.operationalAudit.objName',
    defaultMessage: '对象：',
  },
  allResource: {
    id: 'ManageMonitor.operationalAudit.allResource',
    defaultMessage: '所有对象',
  },
  CICDResources: {
    id: 'ManageMonitor.operationalAudit.CICDResources',
    defaultMessage: 'CI/CD',
  },
  Repo: {
    id: 'ManageMonitor.operationalAudit.Repo',
    defaultMessage: '代码仓库',
  },
  Project: {
    id: 'ManageMonitor.operationalAudit.Project',
    defaultMessage: '已激活代码库',
  },
  Flow: {
    id: 'ManageMonitor.operationalAudit.Flow',
    defaultMessage: 'TenxFlow',
  },
  Stage: {
    id: 'ManageMonitor.operationalAudit.Stage',
    defaultMessage: 'TenxFlow执行过程',
  },
  Link: {
    id: 'ManageMonitor.operationalAudit.Link',
    defaultMessage: 'TenxFlow共享目录',
  },
  Build: {
    id: 'ManageMonitor.operationalAudit.Build',
    defaultMessage: 'TenxFlow构建',
  },
  CIRule: {
    id: 'ManageMonitor.operationalAudit.CIRule',
    defaultMessage: 'CI规则',
  },
  CDRule: {
    id: 'ManageMonitor.operationalAudit.CDRule',
    defaultMessage: 'CD规则',
  },
  Dockerfile: {
    id: 'ManageMonitor.operationalAudit.Dockerfile',
    defaultMessage: '云端Dockerfile',
  },
  CINotification: {
    id: 'ManageMonitor.operationalAudit.CINotification',
    defaultMessage: 'CI',
  },
  CDNotification: {
    id: 'ManageMonitor.operationalAudit.CDNotification',
    defaultMessage: 'CD',
  },
});

function returnOperationList(scope) {
  const { formatMessage } = scope.props.intl;
  const operationalList = [
      {
        value: '1',
        label: formatMessage(menusText.Create)
      },/*{
        value: '2',
        label: formatMessage(menusText.Get)
      },{
        value: '3',
        label: formatMessage(menusText.List)
      },*/{
        value: '4',
        label: formatMessage(menusText.Update)
      },{
        value: '5',
        label: formatMessage(menusText.Delete)
      },{
        value: '6',
        label: formatMessage(menusText.Start)
      },{
        value: '7',
        label: formatMessage(menusText.Stop)
      },{
        value: '8',
        label: formatMessage(menusText.Restart)
      },{
        value: '9',
        label: formatMessage(menusText.Pause)
      },{
        value: '10',
        label: formatMessage(menusText.Resume)
      },{
        value: '11',
        label: formatMessage(menusText.BatchDelete)
      },{
        value: '12',
        label: formatMessage(menusText.BatchStart)
      },{
        value: '13',
        label: formatMessage(menusText.BatchStop)
      },{
        value: '14',
        label: formatMessage(menusText.BatchRestart)
      },{
        value: '15',
        label: formatMessage(menusText.QuickRestart)
      },{
        value: '16',
        label: formatMessage(menusText.CheckExist)
      },{
        value: '17',
        label: formatMessage(menusText.Format)
      },{
        value: '18',
        label: formatMessage(menusText.Expand)
      },{
        value: '0',
        label: formatMessage(menusText.Unknown)
      },
    ];
  return operationalList;
}

function duringTimeFormat(time, scope) {
  //this function for format duringtime
  const { formatMessage } = scope.props.intl;
  time = time / 1000;
  time = time.toFixed(0);
  if(time > 1000) {
    time = time / 1000;
    time = time.toFixed(0);
    if(time > 1000){
      time = time / 60;
      time = time.toFixed(0);
      if(time > 60) {
        time = time / 60;
        time = time.toFixed(0);
        //hour
        return (time + ' ' + formatMessage(menusText.hour) )
      } else {
        //min
        return (time + ' ' + formatMessage(menusText.minute) )
      }
    } else {
      //s
      return (time + ' ' + formatMessage(menusText.second) )
    }
  } else {
    //ms
    return (time + ' ' + formatMessage(menusText.millisecond) )
  }
}

function resourceFormat(resourceType, scope) {
  //this function for format resource type to show user
  const { formatMessage } = scope.props.intl;
  switch(resourceType + '') {
    case '1':
      return formatMessage(menusText.Instance)
      break;
    case '2':
      return formatMessage(menusText.InstanceEvent)
      break;
    case '3':
      return formatMessage(menusText.InstanceLog)
      break;
    case '4':
      return formatMessage(menusText.InstanceMetrics)
      break;
    case '5':
      return formatMessage(menusText.InstanceContainerMetrics)
      break;
    case '6':
      return formatMessage(menusText.Service)
      break;
    case '7':
      return formatMessage(menusText.ServiceInstance)
      break;
    case '8':
      return formatMessage(menusText.ServiceEvent)
      break;
    case '9':
      return formatMessage(menusText.ServiceLog)
      break;
    case '10':
      return formatMessage(menusText.ServiceK8sService)
      break;
    case '11':
      return formatMessage(menusText.ServiceRollingUpgrade)
      break;
    case '12':
      return formatMessage(menusText.ServiceManualScale)
      break;
    case '13':
      return formatMessage(menusText.ServiceAutoScale)
      break;
    case '14':
      return formatMessage(menusText.ServiceQuota)
      break;
    case '15':
      return formatMessage(menusText.ServiceHaOption)
      break;
    case '16':
      return formatMessage(menusText.ServiceDomain)
      break;
    case '17':
      return formatMessage(menusText.App)
      break;
    case '18':
      return formatMessage(menusText.AppService)
      break;
    case '19':
      return formatMessage(menusText.AppOperationLog)
      break;
    case '20':
      return formatMessage(menusText.AppExtraInfo)
      break;
    case '21':
      return formatMessage(menusText.AppTopology)
      break;
    case '22':
      return formatMessage(menusText.ConfigGroup)
      break;
    case '23':
      return formatMessage(menusText.Config)
      break;
    case '24':
      return formatMessage(menusText.Node)
      break;
    case '25':
      return formatMessage(menusText.NodeMetrics)
      break;
    case '26':
      return formatMessage(menusText.ThirdPartyRegistry)
      break;
    case '27':
      return formatMessage(menusText.Volume)
      break;
    case '28':
      return formatMessage(menusText.VolumeConsumption)
      break;
    case '36':
      return formatMessage(menusText.Repo)
      break;
    case '37':
      return formatMessage(menusText.Project)
      break;
    case '38':
      return formatMessage(menusText.Flow)
      break;
    case '39':
      return formatMessage(menusText.Stage)
      break;
    case '40':
      return formatMessage(menusText.Link)
      break;
    case '41':
      return formatMessage(menusText.Build)
      break;
    case '42':
      return formatMessage(menusText.CIRule)
      break;
    case '43':
      return formatMessage(menusText.CDRule)
      break;
    case '44':
      return formatMessage(menusText.Dockerfile)
      break;
    case '45':
      return formatMessage(menusText.CINotification)
      break;
    case '46':
      return formatMessage(menusText.CDNotification)
      break;
    case '0':
      return formatMessage(menusText.Unknown)
      break;
  }
}

function operationalFormat(operationalType, scope) {
  //this function for format operational type to show user
  const { formatMessage } = scope.props.intl;
  switch(operationalType + '') {
    case '1':
      return formatMessage(menusText.Create)
      break;
    case '2':
      return formatMessage(menusText.Get)
      break;
    case '3':
      return formatMessage(menusText.List)
      break;
    case '4':
      return formatMessage(menusText.Update)
      break;
    case '5':
      return formatMessage(menusText.Delete)
      break;
    case '6':
      return formatMessage(menusText.Start)
      break;
    case '7':
      return formatMessage(menusText.Stop)
      break;
    case '8':
      return formatMessage(menusText.Restart)
      break;
    case '9':
      return formatMessage(menusText.Pause)
      break;
    case '10':
      return formatMessage(menusText.Resume)
      break;
    case '11':
      return formatMessage(menusText.BatchDelete)
      break;
    case '12':
      return formatMessage(menusText.BatchStart)
      break;
    case '13':
      return formatMessage(menusText.BatchStop)
      break;
    case '14':
      return formatMessage(menusText.BatchRestart)
      break;
    case '15':
      return formatMessage(menusText.QuickRestart)
      break;
    case '16':
      return formatMessage(menusText.CheckExist)
      break;
    case '17':
      return formatMessage(menusText.Format)
      break;
    case '18':
      return formatMessage(menusText.Expand)
      break;
  }
}

function statusFormat(status, scope) {
  //this function for format status to show user
  switch(status) {
    case 200:
      return (
        <span className='success'>
          <i className='fa fa-check-circle-o' />
          <FormattedMessage {...menusText.success} />
        </span>
      )
    case 0:
      return (
        <span className='running'>
          <i className='fa fa-cog fa-spin fa-3x fa-fw' />
          <FormattedMessage {...menusText.running} />
        </span>
      )
    default :
      return (
        <span className='fail'>
          <i className='fa fa-times-circle-o' />
          <FormattedMessage {...menusText.failed} />
        </span>
      )
  }
}

function formatResourceName(resourceName) {
  //this function for format the resourceName
  if(resourceName.indexOf('{') > -1) {
    let newBody = JSON.parse(resourceName);
    //check services
    if(!!newBody.services) {
      let newName = newBody.services;
      if(newName.length == 0) {
        return '-';
      }
      newName = newName.join(',');
      return newName;
    }
    //check apps
    if(!!newBody.apps) {
      let newName = newBody.apps;
      if(newName.length == 0) {
        return '-';
      }
      newName = newName.join(',');
      return newName;
    }
  } else {
    return resourceName;
  }
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  render: function () {
    const { config, isFetching, scope } = this.props;
    if( isFetching ) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const logList = config.records;
    if( logList.length == 0 ) {
      return (
        <div className='loadingBox'>
          <span>暂无数据</span>
        </div>
      )
    }
    let items = logList.map((item, index) => {
      return (
        <div className='logDetail' key={ index }>
          <div className='time commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement="topLeft" title={formatDate(item.time)}>
                <span>{formatDate(item.time)}</span>
              </Tooltip>
            </span>
          </div>
          <div className='during commonTitle'>
            <span className='commonSpan'>{duringTimeFormat(item.duration, scope)}</span>
          </div>
          <div className='event commonTitle'>
            <span className='commonSpan'>{operationalFormat(item.operationType, scope)}</span>
          </div>
          <div className='obj commonTitle'>
            <span className='objSpan' style={{ top: '5px' }}><FormattedMessage {...menusText.objType} />{resourceFormat(item.resourceType, scope)}</span>
            <span className='objSpan' style={{ top: '-2px' }}>
              <Tooltip placement="topLeft" title={item.resourceName}>
                <span><FormattedMessage {...menusText.objName} />{formatResourceName(item.resourceName)}{item.resourceId ? " - " + item.resourceId: ''}</span>
              </Tooltip>
            </span>
          </div>
          <div className='env commonTitle'>
            <span className='commonSpan'>{item.namespace}</span>
          </div>
          <div className='cluster commonTitle'>
            <span className='commonSpan'>
              <Tooltip placement="topLeft" title={item.clusterId}>
                <span>{item.clusterId}</span>
              </Tooltip>
            </span>
          </div>
          <div className='status commonTitle'>
            <span className='commonSpan'>{statusFormat(item.status, scope)}</span>
          </div>
          <div className='user commonTitle'>
            <i className='fa fa-user-o' />
            <span className='commonSpan'>{item.namespace}</span>
            <div style={{ clear:'both' }}></div>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
      );
    });
    return (
      <div className='logBox'>
        {items}
      </div>
    );
  }
});

class OperationalAudit extends Component {
  constructor(props) {
    super(props)
    this.onChangeObject = this.onChangeObject.bind(this);
    this.onChangeResource = this.onChangeResource.bind(this);
    this.onShowResource = this.onShowResource.bind(this);
    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeStartTime = this.onChangeStartTime.bind(this);
    this.onChangeEndTime = this.onChangeEndTime.bind(this);
    this.onChangeNamespace = this.onChangeNamespace.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
    this.submitSearch = this.submitSearch.bind(this);
    this.state = {
      selectOperationalList: [],
      from: 1,
      size: 15,
      namespace: null,
      operation: null,
      resource: null,
      start_time: null,
      end_time: null,
      status: null,
      totalNum: 0
    }
  }

  componentWillMount() {
    const { getOperationLogList } = this.props;
    const { formatMessage } = this.props.intl;
    document.title = formatMessage(menusText.headTitle);
    const _this = this;
    let operationalList = returnOperationList(this)
    this.setState({
      selectOperationalList: operationalList
    });
    let body = {
          from: 0,
          size: 15,
          namespace: null,
          operation: null,
          resource: null,
          start_time: null,
          end_time: null
        }
    getOperationLogList(body, {
      success: {
        func: (res) => {
          _this.setState({
            totalNum: res.count
          });
        }
      }
    })
  }

  componentWillReceiveProps(nextPorps) {
    //this function for user select different image
    //the nextProps is mean new props, and the this.props didn't change
    //so that we should use the nextProps
    const { isFetching } = nextPorps;
    if(!isFetching) {
      this.setState({
        logs: nextPorps.logs,
        totalNum: nextPorps.logs.count
      });
    }
  }

  onChangeResource(e) {
    //this function for user change the resource
    //and then the operational list will be change
    const { formatMessage } = this.props.intl;
    if(e.length == 1 && (e != 26 || e != 29) ) {
    } else {
      let eventCode = e[e.length - 1];
      let showOperationalList = new Array();
      let operationalList = returnOperationList(this);
      switch(eventCode) {
        case '1':
//        showOperationalList.push(operationalList[2]);
//        showOperationalList.push(operationalList[3]);
          showOperationalList = [];
          break;
        case '2':
          showOperationalList = [];
//        showOperationalList.push(operationalList[3]);
          break;
        case '3':
          showOperationalList = [];
//        showOperationalList.push(operationalList[3]);
          break;
        case '4':
          showOperationalList = [];
//        showOperationalList.push(operationalList[2]);
          break;
        case '5':
          showOperationalList = [];
//        showOperationalList.push(operationalList[2]);
          break;
        case '6':
//        showOperationalList.push(operationalList[3]);
          showOperationalList.push(operationalList[11]);
          showOperationalList.push(operationalList[12]);
          showOperationalList.push(operationalList[13]);
          showOperationalList.push(operationalList[14]);
          showOperationalList.push(operationalList[15]);
          break;
        case '7':
          showOperationalList = [];
//        showOperationalList.push(operationalList[3]);
          break;
        case '8':
          showOperationalList = [];
//        showOperationalList.push(operationalList[3]);
          break;
        case '9':
          showOperationalList = [];
          break;
        case '10':
          showOperationalList = [];
//        showOperationalList.push(operationalList[2]);
          break;
        case '11':
          showOperationalList.push(operationalList[4]);
          showOperationalList.push(operationalList[9]);
          showOperationalList.push(operationalList[10]);
          break;
        case '12':
          showOperationalList.push(operationalList[4]);
          break;
        case '13':
//        showOperationalList.push(operationalList[2]);
          showOperationalList.push(operationalList[4]);
          showOperationalList.push(operationalList[5]);
          break;
        case '14':
          showOperationalList.push(operationalList[4]);
          break;
        case '15':
          showOperationalList.push(operationalList[4]);
          break;
        case '16':
          showOperationalList.push(operationalList[1]);
          showOperationalList.push(operationalList[5]);
          showOperationalList.push(operationalList[16]);
          break;
        case '17':
          showOperationalList.push(operationalList[1]);
//        showOperationalList.push(operationalList[2]);
//        showOperationalList.push(operationalList[3]);
          showOperationalList.push(operationalList[5]);
          showOperationalList.push(operationalList[12]);
          showOperationalList.push(operationalList[13]);
          showOperationalList.push(operationalList[14]);
          showOperationalList.push(operationalList[16]);
          break;
        case '18':
          showOperationalList.push(operationalList[1]);
//        showOperationalList.push(operationalList[3]);
          break;
        case '19':
          showOperationalList = [];
//        showOperationalList.push(operationalList[2]);
          break;
        case '20':
          showOperationalList = [];
//        showOperationalList.push(operationalList[2]);
          break;
        case '21':
//        showOperationalList.push(operationalList[2]);
          showOperationalList.push(operationalList[4]);
          break;
        case '22':
          showOperationalList.push(operationalList[1]);
//        showOperationalList.push(operationalList[2]);
          showOperationalList.push(operationalList[4]);
          showOperationalList.push(operationalList[11]);
          break;
        case '23':
          showOperationalList.push(operationalList[1]);
//        showOperationalList.push(operationalList[2]);
          showOperationalList.push(operationalList[4]);
          showOperationalList.push(operationalList[11]);
          break;
        case '24':
          showOperationalList = [];
          break;
        case '25':
          showOperationalList = [];
//        showOperationalList.push(operationalList[2]);
          break;
        case '26':
          showOperationalList.push(operationalList[1]);
//        showOperationalList.push(operationalList[3]);
          showOperationalList.push(operationalList[5]);
          break;
        case '27':
          showOperationalList.push(operationalList[1]);
//        showOperationalList.push(operationalList[3]);
          showOperationalList.push(operationalList[17]);
          showOperationalList.push(operationalList[18]);
          showOperationalList.push(operationalList[11]);
          break;
        case '28':
          showOperationalList = [];
//        showOperationalList.push(operationalList[2]);
          break;
        case '36':
        case '39':
        case '43':
        case '44':
          showOperationalList.push(operationalList[0]);
          showOperationalList.push(operationalList[1]);
          showOperationalList.push(operationalList[2]);
          break;
        case '37':
        case '38':
          showOperationalList.push(operationalList[0]);
          showOperationalList.push(operationalList[2]);
          break;
        case '40':
        case '42':
          showOperationalList.push(operationalList[1]);
          break;
        case '41':
          showOperationalList.push(operationalList[3]);
          showOperationalList.push(operationalList[4]);
          break;
        case '45':
        case '46':
          showOperationalList.push(operationalList[3]);
          break;
        case '0':
          showOperationalList = operationalList;
          break;
        default:
          showOperationalList = operationalList;
          break;
      }
      this.setState({
        selectOperationalList: showOperationalList,
        resource: parseInt(eventCode)
      });
    }
  }

  onShowResource(value, items) {
    //this function for show to the user selected resource
    return value[value.length - 1];
  }

  onChangeObject(e) {
    //this function for user change operational
    this.setState({
      operation: parseInt(e)
    });
  }

  onChangeStatus(e) {
    //this function for user change status
    this.setState({
      status: e
    });
  }

  onChangeStartTime(e, str) {
    //this function for user change status
    this.setState({
      start_time: str
    });
  }

  onChangeEndTime(e, str) {
    //this function for user change status
    this.setState({
      end_time: str
    });
  }

  onChangeNamespace(e) {
    //this function for user change status
    this.setState({
      namespace: e.target.value
    });
  }

  onPageChange(e) {
    //this function user input the page num and auto get the new page of log
    const { getOperationLogList } = this.props;
    let tmpFrom = e - 1;
    this.setState({
      from: e
    })
    let body = {
      from: (tmpFrom * this.state.size),
      size: this.state.size,
      namespace: this.state.namespace,
      operation: this.state.operation,
      resource: this.state.resource,
      start_time: this.state.start_time,
      end_time: this.state.end_time,
      status: this.state.status
    }
    getOperationLogList(body);
  }

  submitSearch() {
    //this functio for user submit search log
    const { getOperationLogList } = this.props;
    const _this = this;
    let body = {
      from: 0,
      size: this.state.size,
      namespace: this.state.namespace,
      operation: this.state.operation,
      resource: this.state.resource,
      start_time: this.state.start_time,
      end_time: this.state.end_time,
      status: this.state.status
    }
    getOperationLogList(body, {
      success: {
        func: (res) => {
          let totalNum = res.logs.count == 0 ? 1 : res.logs.count;
          _this.setState({
            from: 1,
            totalNum: totalNum
          });
        },
        isAsync: true
      }
    });
  }

  render() {
    const { isFetching, logs } = this.props;
    const { formatMessage } = this.props.intl;
    const scope = this;
    const resourceOption = [/*{
      value: '1',
      label: formatMessage(menusText.Instance),
      children: [{
        value: '1',
        label: formatMessage(menusText.Instance),
      },{
        value: '2',
        label: formatMessage(menusText.InstanceEvent),
      },{
        value: '3',
        label: formatMessage(menusText.InstanceLog),
      },{
        value: '4',
        label: formatMessage(menusText.InstanceMetrics),
      },{
        value: '5',
        label: formatMessage(menusText.InstanceContainerMetrics),
      }],
    }, */{
      value: '6',
      label: formatMessage(menusText.Service),
      children: [{
        value: '6',
        label: formatMessage(menusText.Service),
      },/*{
        value: '7',
        label: formatMessage(menusText.ServiceInstance),
      },{
        value: '8',
        label: formatMessage(menusText.ServiceEvent),
      },{
        value: '9',
        label: formatMessage(menusText.ServiceLog),
      },{
        value: '10',
        label: formatMessage(menusText.ServiceK8sService),
      },*/{
        value: '11',
        label: formatMessage(menusText.ServiceRollingUpgrade),
      },{
        value: '12',
        label: formatMessage(menusText.ServiceManualScale),
      },{
        value: '13',
        label: formatMessage(menusText.ServiceAutoScale),
      },{
        value: '14',
        label: formatMessage(menusText.ServiceQuota),
      },{
        value: '15',
        label: formatMessage(menusText.ServiceHaOption),
      },{
        value: '16',
        label: formatMessage(menusText.ServiceDomain),
      }],
    }, {
      value: '17',
      label: formatMessage(menusText.App),
      children: [{
        value: '17',
        label: formatMessage(menusText.App),
      },{
        value: '18',
        label: formatMessage(menusText.AppService),
      },/*{
        value: '19',
        label: formatMessage(menusText.AppOperationLog),
      },{
        value: '20',
        label: formatMessage(menusText.AppExtraInfo),
      },*/{
        value: '21',
        label: formatMessage(menusText.AppTopology),
      },],
    }, {
      value: '23',
      label: formatMessage(menusText.Config),
      children: [{
        value: '22',
        label: formatMessage(menusText.ConfigGroup),
      },{
        value: '23',
        label: formatMessage(menusText.Config),
      }],
    }, /*{
      value: '24',
      label: formatMessage(menusText.Node),
      children: [{
        value: '24',
        label: formatMessage(menusText.Node),
      },{
        value: '25',
        label: formatMessage(menusText.NodeMetrics),
      }],
    }, */{
      value: '26',
      label: formatMessage(menusText.ThirdPartyRegistry)
    }, {
      value: '27',
      label: formatMessage(menusText.Volume),
      children: [{
        value: '27',
        label: formatMessage(menusText.Volume),
      }/*,{
        value: '28',
        label: formatMessage(menusText.VolumeConsumption),
      }*/],
    }, {
      value: '36',
      label: formatMessage(menusText.CICDResources),
      children: [
        {
          value: '36',
          label: formatMessage(menusText.Repo),
        }, {
          value: '37',
          label: formatMessage(menusText.Project),
        }, {
          value: '38',
          label: formatMessage(menusText.Flow),
        }, {
          value: '39',
          label: formatMessage(menusText.Stage),
        }, {
          value: '40',
          label: formatMessage(menusText.Link),
        }, {
          value: '41',
          label: formatMessage(menusText.Build),
        }, {
          value: '42',
          label: formatMessage(menusText.CIRule),
        }, {
          value: '43',
          label: formatMessage(menusText.CDRule),
        }, {
          value: '44',
          label: formatMessage(menusText.Dockerfile),
        }, {
          value: '45',
          label: formatMessage(menusText.CINotification),
        }, {
          value: '46',
          label: formatMessage(menusText.CDNotification),
        }
      ]
    }, /*{
      value: '0',
      label: formatMessage(menusText.Unknown)
    }, */{
      value: null,
      label: formatMessage(menusText.allResource)
    }];
    const operationalSelectOptions = this.state.selectOperationalList.map((item) => {
      return (
        <Option key={item.value} value={item.value}>{item.label}</Option>
      )
    });
    return (
    <QueueAnim className='operationalAuditBox' type='right'>
      <div id='operationalAudit' key='operationalAudit'>
        <div className='bigTitle'>
          <span><FormattedMessage {...menusText.title} /></span>
        </div>
        <div className='operaBox'>
          <Cascader
            changeOnSelect
            options={resourceOption}
            allowClear={true}
            displayRender={this.onShowResource}
            onChange={this.onChangeResource}
            getPopupContainer={() => document.getElementById('operationalAudit')}
            expandTrigger='hover'
            size='large'
            className='resourceSelect'
            placeholder={formatMessage(menusText.selectObject)}
          />
          <Select showSearch className='eventSelect'
            placeholder={formatMessage(menusText.selectEvent)}
            onChange={this.onChangeObject} size='large' allowClear={true}
            getPopupContainer={() => document.getElementById('operationalAudit')}
          >
            {operationalSelectOptions}
          </Select>
          <Select showSearch className='statusSelect'
            onChange={this.onChangeStatus} size='large' allowClear={true}
            placeholder={formatMessage(menusText.selectStatus)}
            getPopupContainer={() => document.getElementById('operationalAudit')}
          >
            <Option value=''><FormattedMessage {...menusText.allstatus} /></Option>
            <Option value='running'><FormattedMessage {...menusText.running} /></Option>
            <Option value='success'><FormattedMessage {...menusText.success} /></Option>
            <Option value='failed'><FormattedMessage {...menusText.failed} /></Option>
          </Select>
          <DatePicker onChange={this.onChangeStartTime} style={{ marginRight: 20, marginTop: 10, float:'left' }} showTime format='yyyy-MM-dd HH:mm:ss' size='large' />
          <DatePicker onChange={this.onChangeEndTime} style={{ marginRight: 20, marginTop: 10, float:'left' }} showTime format='yyyy-MM-dd HH:mm:ss' size='large' />
          <Input onChange={this.onChangeNamespace} className='namespaceInput' type='text' size='large' />
          <Button className='searchBtn' size='large' type='primary' onClick={this.submitSearch}>
            <i className='fa fa-wpforms'></i> <FormattedMessage {...menusText.search} />
          </Button>
          <div style={{ clear:'both' }}></div>
        </div>
        <Card className='dataCard'>
          <div className='bottomBox'>
            <div className='pageBox'>
              <Pagination
                simple
                total={this.state.totalNum}
                pageSize={15}
                current={this.state.from}
                onChange={this.onPageChange}
                />
            </div>
            <span style={{ float:'right',lineHeight:'24px' }}>共计 {this.state.totalNum} 条</span>
          </div>
          <div className='titleBox'>
            <div className='time commonTitle'>
              <FormattedMessage {...menusText.time} />
            </div>
            <div className='during commonTitle'>
              <FormattedMessage {...menusText.during} />
            </div>
            <div className='event commonTitle'>
              <FormattedMessage {...menusText.event} />
            </div>
            <div className='obj commonTitle'>
              <FormattedMessage {...menusText.obj} />
            </div>
            <div className='env commonTitle'>
              <FormattedMessage {...menusText.env} />
            </div>
            <div className='cluster commonTitle'>
              <FormattedMessage {...menusText.cluster} />
            </div>
            <div className='status commonTitle'>
              <FormattedMessage {...menusText.status} />
            </div>
            <div className='user commonTitle'>
              <FormattedMessage {...menusText.user} />
            </div>
            <div style={{ clear:'both' }}></div>
          </div>
          <MyComponent scope={scope} config={logs} isFetching={isFetching} />
        </Card>
      </div>
    </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultLogs = {
      isFetching: false,
      logs: []
  }
  const { operationAuditLog } = state.manageMonitor
  const { logs, isFetching } = operationAuditLog.logs || defaultLogs
  return {
      isFetching,
      logs
  }
}

OperationalAudit.propTypes = {
  intl: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  getOperationLogList: PropTypes.func.isRequired,
}

OperationalAudit = injectIntl(OperationalAudit, {
  withRef: true,
})

export default connect(mapStateToProps, {
  getOperationLogList
})(OperationalAudit)