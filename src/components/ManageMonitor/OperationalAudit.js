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
import { Card, Select, Button, DatePicker, Input, Cascader } from 'antd'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getOperationLogList } from '../../actions/manage_monitor'
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
    defaultMessage: '任务事件',
  },
  obj: {
    id: 'ManageMonitor.operationalAudit.obj',
    defaultMessage: '对象',
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
    defaultMessage: '选择任务事件',
  },
  selectStatus: {
    id: 'ManageMonitor.operationalAudit.selectEvent',
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
});

function returnOperationList(scope) {
  const { formatMessage } = scope.props.intl;
  const operationalList = [
      {
        value: '1',
        label: formatMessage(menusText.Create)
      },{
        value: '2',
        label: formatMessage(menusText.Get)
      },{
        value: '3',
        label: formatMessage(menusText.List)
      },{
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
        value: '19',
        label: formatMessage(menusText.Unknown)
      },
    ];
  return operationalList;
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array
  },
  showDetailModal: function(database){
    const { scope } = this.props;
    scope.setState({
      detailModal: true,
      currentDatabase: database
    })
  },
  render: function () {
    const { config, isFetching } = this.props;
    if( isFetching ) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if( config.length == 0 ) {
      return (
        <div className='loadingBox'>
          <span>暂无数据</span>
        </div>
      )
    }
    let items = config.map((item, index) => {
      return (
        <div className='logDetail' key={ index }>
          <div className='time commonTitle'>
            <span className='commonSpan'></span>
          </div>
          <div className='during commonTitle'>
            <span className='commonSpan'></span>
          </div>
          <div className='event commonTitle'>
            <span className='commonSpan'></span>
          </div>
          <div className='obj commonTitle'>
            <span className='commonSpan'></span>
          </div>
          <div className='env commonTitle'>
            <span className='commonSpan'></span>
          </div>
          <div className='cluster commonTitle'>
            <span className='commonSpan'></span>
          </div>
          <div className='status commonTitle'>
            <span className='commonSpan'></span>
          </div>
          <div className='user commonTitle'>
            <i className='fa fa-user-o' />
            <span className='commonSpan'></span>
          </div>
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
    this.state = {
      selectOperationalList: []
    }
  }
  
  componentWillMount() {
    const { getOperationLogList } = this.props;
    const { formatMessage } = this.props.intl;
    document.title = formatMessage(menusText.headTitle);
    let operationalList = returnOperationList(this)
    this.setState({
      selectOperationalList: operationalList
    });
    let body = {
          from: null,
          size: null,
          namespace: null,
          operation: null,
          resource: null,
          start_time: null,
          end_time: null
        }
    getOperationLogList(body)
  }
  
  onChangeResource(e) {
    //this function for user change the resource
    //and then the operational list will be change
    const { formatMessage } = this.props.intl;
    if(e.length == 1 && (e != 26 || e != 29) ) {
      
    }else {
      let eventCode = e[e.length - 1];
      let showOperationalList = new Array();
      let operationalList = returnOperationList(this);
      switch(eventCode) {
        case '1':
          showOperationalList.push(operationalList[2]);
          showOperationalList.push(operationalList[3]); 
          break;
        case '2':
          showOperationalList.push(operationalList[3]);
          break;
        case '3':
          showOperationalList.push(operationalList[3]);
          break;
        case '4':
          showOperationalList.push(operationalList[2]);
          break;
        case '5':
          showOperationalList.push(operationalList[2]);
          break;
        case '6':
          showOperationalList.push(operationalList[3]);
          showOperationalList.push(operationalList[11]);
          showOperationalList.push(operationalList[12]);
          showOperationalList.push(operationalList[13]);
          showOperationalList.push(operationalList[14]);
          showOperationalList.push(operationalList[15]);
          break;  
        case '7':
          showOperationalList.push(operationalList[3]);
          break;
        case '8':
          showOperationalList.push(operationalList[3]);
          break;
        case '9':
          showOperationalList = [];
          break;
        case '10':
          showOperationalList.push(operationalList[2]);
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
          showOperationalList.push(operationalList[2]);
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
          showOperationalList.push(operationalList[2]);
          showOperationalList.push(operationalList[3]);
          showOperationalList.push(operationalList[5]);
          showOperationalList.push(operationalList[12]);
          showOperationalList.push(operationalList[13]);
          showOperationalList.push(operationalList[14]);
          showOperationalList.push(operationalList[16]);
          break;
        case '18':
          showOperationalList.push(operationalList[1]);
          showOperationalList.push(operationalList[3]);
          break;
        case '19':
          showOperationalList.push(operationalList[2]);        
          break;
        case '20':
          showOperationalList.push(operationalList[2]);        
          break;
        case '21':
          showOperationalList.push(operationalList[2]);
          showOperationalList.push(operationalList[4]);
          break;
        case '22':
          showOperationalList.push(operationalList[1]);
          showOperationalList.push(operationalList[2]);
          showOperationalList.push(operationalList[4]);
          showOperationalList.push(operationalList[11]);       
          break;
        case '23':
          showOperationalList.push(operationalList[1]);
          showOperationalList.push(operationalList[2]);
          showOperationalList.push(operationalList[4]);
          showOperationalList.push(operationalList[11]);
          break;
        case '24':
          showOperationalList = [];
          break;
        case '25':
          showOperationalList.push(operationalList[2]);
          break;
        case '26':
          showOperationalList.push(operationalList[1]);
          showOperationalList.push(operationalList[3]);
          showOperationalList.push(operationalList[5]);       
          break;
        case '27':
          showOperationalList.push(operationalList[1]);
          showOperationalList.push(operationalList[3]);
          showOperationalList.push(operationalList[17]);
          showOperationalList.push(operationalList[18]);
          showOperationalList.push(operationalList[11]);        
          break;
        case '28':
          showOperationalList.push(operationalList[2]);       
          break;
        case '29':
          showOperationalList = operationalList;
          break;
      }
      this.setState({
        selectOperationalList: showOperationalList
      });
    }
  }
  
  onShowResource(value, items) {
    //this function for show to the user selected resource
    return value[value.length - 1];
  }
  
  onChangeObject() {
    //this function for user change operational
  }

  render() {
    const { isFetching, logs } = this.props;
    const { formatMessage } = this.props.intl;
    const resourceOption = [{
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
    }, {
      value: '6',
      label: formatMessage(menusText.Service),
      children: [{
        value: '6',
        label: formatMessage(menusText.Service),
      },{
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
      },{
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
      },{
        value: '19',
        label: formatMessage(menusText.AppOperationLog),
      },{
        value: '20',
        label: formatMessage(menusText.AppExtraInfo),
      },{
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
    }, {
      value: '24',
      label: formatMessage(menusText.Node),
      children: [{
        value: '24',
        label: formatMessage(menusText.Node),
      },{
        value: '25',
        label: formatMessage(menusText.NodeMetrics),
      }],
    }, {
      value: '26',
      label: formatMessage(menusText.ThirdPartyRegistry)
    }, {
      value: '27',
      label: formatMessage(menusText.Volume),
      children: [{
        value: '27',
        label: formatMessage(menusText.Volume),
      },{
        value: '28',
        label: formatMessage(menusText.VolumeConsumption),
      }],
    }, {
      value: '29',
      label: formatMessage(menusText.Unknown)
    },];
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
            allowClear={false} 
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
            onChange={this.onChangeObject} size='large'
            getPopupContainer={() => document.getElementById('operationalAudit')}
          >
            {operationalSelectOptions}
          </Select>
          <Select showSearch className='statusSelect'
            size='large'
            placeholder={formatMessage(menusText.selectStatus)}
            getPopupContainer={() => document.getElementById('operationalAudit')}
          >
            <Option value='running'><FormattedMessage {...menusText.running} /></Option>
            <Option value='success'><FormattedMessage {...menusText.success} /></Option>
            <Option value='failed'><FormattedMessage {...menusText.failed} /></Option>
          </Select>
          <DatePicker style={{ marginRight: 20, marginTop: 10, float:'left' }} showTime format="yyyy-MM-dd HH:mm:ss" size='large' />
          <DatePicker style={{ marginRight: 20, marginTop: 10, float:'left' }} showTime format="yyyy-MM-dd HH:mm:ss" size='large' />
          <Input className='namespaceInput' type='text' size='large' />
          <Button className='searchBtn' size='large' type='primary' onClick={this.submitSearch}>
            <i className='fa fa-wpforms'></i>
            <FormattedMessage {...menusText.search} />
          </Button>
          <div style={{ clear:'both' }}></div>
        </div>
        <Card className='dataCard'>
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
          <MyComponent scope={scope} config={config} isFetching={isFetching} />
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