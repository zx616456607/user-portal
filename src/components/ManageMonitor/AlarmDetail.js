/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Alarm Detail component
 *
 * v0.1 - 2017-3-20
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Row, Col, Card ,Radio, Button, Table, Modal, Spin } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { formatDate } from '../../common/tools'
import './style/AlarmDetail.less'
import { getAlertSetting, getSettingList } from '../../actions/alert'
const RadioGroup = Radio.Group

class AlarmDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      sendEmail: 2, // no send eamil
      delBtn: true,
      selectCheckbox: [] // default table selected item
    }
  }
  componentWillMount() {
    document.title = '告警设置 | 时速云 '
    const id = this.props.params.id
    const { getAlertSetting, cluster, getSettingList } = this.props
    getAlertSetting(cluster.clusterID, {
      strategy: id
    })
    getSettingList(cluster.clusterID, {
      strategyName: id
    })
  }
  formatStatus(text){
    if (text ==1) {
      return <span className="running"><i className="fa fa-circle" /> 启用</span>
    }
    if (text ==2) {
      return <span className="stop"><i className="fa fa-circle" /> 停用</span>
    }
    if (text ==3) {
      return <span className="stop"><i className="fa fa-circle" /> 忽略</span>
    }
    return <span className="unknown"><i className="fa fa-circle" /> 告警</span>
  }
  rowClick(ins) {
    let selectCheckbox = this.state.selectCheckbox
    if (selectCheckbox.indexOf(ins+1) > -1) {
      selectCheckbox.splice(selectCheckbox.indexOf(ins+1), 1)
    } else {
      selectCheckbox.push(ins+1)
    }
    selectCheckbox.sort()
    let delBtn = true
    if (selectCheckbox.length > 0) {
      delBtn = false
    }
    this.setState({selectCheckbox,delBtn})
  }
  calcuTime(time) {
    let sym = '分钟'
    time = time / 60
    if(time / 60 > 1) {
      sym = '小时'
      time = time / 60
    }
    return time + sym
  }
  deleteRecords() {
  }
  render() {
    const { isFetching } = this.props.setting
    if(isFetching) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    let settingData = this.props.setting
    let { leftSetting } = this.props
    if(leftSetting.isEmptyObject) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    const columns = [
      {
        title: '监控项',
        dataIndex: 'type',
        key:'type'
      }, {
        title: '条件',
        dataIndex: 'operation',
        key:'operation',
      },
      {
        title: '阈值',
        dataIndex: 'threshold',
        key:'threshold',
      },
      {
        title: '启用时间',
        dataIndex: 'createTime',
        key:'createTime',
        sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
      },
      {
        title: '触发次数',
        dataIndex: 'recordCount',
        key:'recordCount',
      },
    ];
    const strategyName = this.props.params.id

    const _this = this
    const rowSelection = {
      selectedRowKeys: this.state.selectCheckbox,
      onChange(selectedRowKeys, selectedRows) {
        let btnDisabled = true
        if (selectedRowKeys.length > 0) {
          btnDisabled = false
        }
        _this.setState({
          delBtn: btnDisabled,
          selectedRows,
          selectCheckbox: selectedRowKeys
        })
      },
      // onSelectAll(selected, selectedRows, changeRows) {
      //   console.log(selected, selectedRows, changeRows);
      // },
    };
    return (
      <div id="AlarmDetail">
        <QueueAnim type="right" className="AlarmDetail">
          <div className="ant-row" key="AlarmDetail" style={{marginBottom: 10, height: 50, paddingTop: 10}}>
            <Link className="back" to="/manange_monitor/alarm_setting"><span className="backjia"></span><span className="btn-back">返回</span></Link>
            <span className="titleName">{strategyName}</span>
          </div>
          <Row gutter={16} className="details">
            <Col span="6">
              <Card style={{paddingBottom:'20px'}}>
                <div className="title">基本属性</div>
                <div className="baseAttr"><span className="keys">策略名称：</span>{leftSetting.strategyName}</div>
                <div className="baseAttr"><span className="keys">类型：</span>{leftSetting.targetType == '1' ? '节点' : '服务'}</div>
                <div className="baseAttr"><span className="keys">告警对象：</span>{leftSetting.targetName}</div>
                <div className="baseAttr"><span className="keys">状态：</span>{this.formatStatus(leftSetting.enable)}</div>
               <div className="baseAttr"><span className="keys">监控周期：</span>{this.calcuTime(leftSetting.repeatInterval)}</div>
                <div className="baseAttr">
                  <span className="keys">是否发送：</span>
                  <RadioGroup defaultValue={leftSetting.enable} onChange={(e)=> this.setState({sendEmail: e.target.value}) }>
                    <Radio key="a" value={1}>是</Radio>
                    <Radio key="b" value={2}>否</Radio>
                  </RadioGroup>
                </div>
                <div className="baseAttr"><span className="keys">最后修改人：</span>{leftSetting.updater}</div>
        <div className="baseAttr"><span className="keys">通知列表：</span>{"等待更改"}</div>
                <div className="baseAttr"><span className="keys">创建时间：</span>{formatDate(leftSetting.createTime)}</div>
              </Card>
              <Card style={{marginTop:'15px',paddingBottom:'50px'}}>
                <div className="title">租赁信息</div>
                <div className="baseAttr" style={{color: '#2DB7F5'}}>本服务暂不收费！</div>
              </Card>
            </Col>
            <Col span="18">
              <Card style={{paddingBottom: 50}}>
                <div className="title">规则</div>
                <div style={{margin: '20px 30px'}}>
                  <div className="alertRow">提示：当任意规则满足条件时，该策略属于触发状态！</div>
                </div>
                <div style={{margin: '20px 30px'}}>
                  <Button icon="reload" type="primary" size="large">刷新</Button>
                  <Button icon="delete" size="large" style={{marginLeft: 8}} disabled={this.state.delBtn} onClick={()=> this.setState({deleteModal: true})} type="ghost">删除</Button>
                </div>
                <Table className="strategyTable" rowSelection={rowSelection} columns={columns}
                onRowClick={(record, index)=> this.rowClick(index)}
                dataSource={settingData} pagination={false} style={{padding:'0 30px'}}/>
              </Card>
            </Col>
          </Row>
          <Modal title="删除策略" visible={this.state.deleteModal}
            onCancel={()=> this.setState({deleteModal: false})}
            onOk={()=> this.deleteRecords()}
          >
            <div className="confirmText"><i className="anticon anticon-question-circle-o" style={{marginRight: 10}}></i>策略删除后将不再发送邮件告警，是否确定删除？</div>
          </Modal>
        </QueueAnim>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultSettingDetail = {
    isFetching: false,
    result: {
      data:[]
    }
  }
  let isFetching = false
  let { getSetting, settingList } = state.alert
  if(!getSetting || !getSetting.result) {
    getSetting = defaultSettingDetail
  }
  isFetching = getSetting.isFetching
  if(getSetting.result && getSetting.result.data.length > 0){
    getSetting.result.data.forEach(item => {
      item.createTime = formatDate(item.createTime)
    })
  }
  const defaultSetting = {
    isFetching: false,
    result: {
      data: {
        strategys: []
      },
      total: 0
    }
  }
  let leftSetting = {
    isEmptyObject: true
  }
  if(!settingList) {
     settingList = defaultSetting
  }
  if(settingList.isFetching) {
    isFetching = settingList.isFetching
  } else {
    if(settingList.result && settingList.result.data.total > 1) {
      settingList.result.data.strategys.some(item => {
        if(item.strategyName == props.params.id) {
          leftSetting = item
          return true
        }
      })
    } else {
      leftSetting = settingList.result.data.strategys[0] || {}
    }
  }
  return {
    cluster,
    setting: getSetting.result.data,
    isFetching,
    leftSetting
  }
}

export default connect(mapStateToProps, {
  getAlertSetting,
  getSettingList
})(AlarmDetail)
