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
import { Row, Col, Card ,Radio, Button, Table } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { formatDate } from '../../common/tools'
import './style/AlarmDetail.less'
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
  }
  handDelete() {
    console.log('click delBtn')
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
    console.log('ins', ins)
    let selectCheckbox = this.state.selectCheckbox
    if (selectCheckbox.indexOf(ins+1) > -1) {
      selectCheckbox.splice(selectCheckbox.indexOf(ins+1), 1)
    } else {
      selectCheckbox.push(ins+1)
    }
    selectCheckbox.sort()
    console.log('selectCheckbox',selectCheckbox)
    // let newArray = []
    // newArray.push(ins+1)
    // selectCheckbox = selectCheckbox.concat(newArray)
    this.setState({selectCheckbox})
  }
  render() {
    const columns = [
      {
        title: '监控项',
        dataIndex: 'type',
        key:'type'
      }, {
        title: '条件',
        dataIndex: 'bindObject',
        key:'bindObject',
      },
      {
        title: '阈值',
        dataIndex: 'value',
        key:'value',
      },
      {
        title: '启用时间',
        dataIndex: 'createTime',
        key:'createTime',
        sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
      },
      {
        title: '触发次数',
        dataIndex: 'target',
        key:'target',
      },
    ];

    const data = [
      {
        key:1,
        type:'内存',
        bindObject: '>',
        value: '80%',
        createTime: '2017-03-00 15:35:21',
        target:'5',
        assign:'harper'
      }, {
        key:2,
        type:'CPU',
        bindObject: '>',
        value: '90%',
        createTime: '2017-05-00 15:35:21',
        target:'5',
        assign: 'messon'
      }, {
        key:3,
        type:'上传流量',
        bindObject: '>',
        value: '500KB',
        createTime: '2017-01-10 15:35:21',
        target:'5',
        assign:'k8s'
      },
      {
        key: 4,
        type:'下载流量',
        bindObject: '>',
        value: '800KB',
        createTime: '2017-06-10 15:35:21',
        target:'5',
        assign:'k8s'
      }
    ];
    const _this = this
    const rowSelection = {
      selectedRowKeys: this.state.selectCheckbox,
      onChange(selectedRowKeys, selectedRows) {
        console.log('selectedRows', selectedRowKeys, selectedRows)
        let btnDisabled = true
        if (selectedRowKeys.length > 0) {
          btnDisabled = false
        }
        _this.setState({
          delBtn: btnDisabled,
          selectedRows
        })
      },
      // onSelect(record, selected, selectedRows) {
      //   console.log(record, selected, selectedRows);
      // },
      // onSelectAll(selected, selectedRows, changeRows) {
      //   console.log(selected, selectedRows, changeRows);
      // },
    };
    return (
      <div id="AlarmDetail">
        <QueueAnim type="right" className="AlarmDetail">
          <div className="ant-row" key="AlarmDetail" style={{marginBottom: 10, height: 50, paddingTop: 10}}>
            <Link className="back" to="/manange_monitor/alarm_setting"><span className="backjia"></span><span className="btn-back">返回</span></Link>
            <span className="titleName">大事业部</span>
          </div>
          <Row gutter={16} className="details">
            <Col span="6">
              <Card style={{paddingBottom:'20px'}}>
                <div className="title">基本属性</div>
                <div className="baseAttr"><span className="keys">策略名称：</span>celue1</div>
                <div className="baseAttr"><span className="keys">类型：</span>服务</div>
                <div className="baseAttr"><span className="keys">告警对象：</span>服务名称</div>
                <div className="baseAttr"><span className="keys">状态：</span>{this.formatStatus(1)}</div>
                <div className="baseAttr"><span className="keys">监控周期：</span>5分钟</div>
                <div className="baseAttr">
                  <span className="keys">是否发送：</span>
                  <RadioGroup onChange={(e)=> this.setState({sendEmail: e.target.value}) } value={this.state.sendEmail}>
                    <Radio key="a" value={1}>是</Radio>
                    <Radio key="b" value={2}>否</Radio>
                  </RadioGroup>
                </div>
                <div className="baseAttr"><span className="keys">最后修改人：</span>admin</div>
                <div className="baseAttr"><span className="keys">通知列表：</span>admin</div>
                <div className="baseAttr"><span className="keys">创建时间：</span>{formatDate()}</div>
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
                  <Button icon="delete" size="large" style={{marginLeft: 8}} disabled={this.state.delBtn} onClick={()=> this.handDelete()} type="ghost">删除</Button>
                </div>
                <Table className="strategyTable" rowSelection={rowSelection} columns={columns}
                onRowClick={(record, index)=> this.rowClick(index)}
                dataSource={data} pagination={false} style={{padding:'0 30px'}}/>
              </Card>
            </Col>
          </Row>
        </QueueAnim>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {})(AlarmDetail)