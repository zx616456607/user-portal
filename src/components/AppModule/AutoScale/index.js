/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AutoScaleList
 *
 * v0.1 - 2017-09-19
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Button, Table, Menu, Dropdown, Icon } from 'antd'
import { loadAutoScaleList } from '../../../actions/services'
import './style/index.less'
import CommonSearchInput from '../../CommonSearchInput'
import AutoScaleModal from './AutoScaleModal'
import classNames from 'classnames'

class AutoScale extends React.Component {
  constructor() {
    super()
    this.state = {
      scaleModal: false,
      scaleList: []
    }
  }
  componentWillMount() {
    this.loadData(1)
  }
  loadData = (page, name) => {
    const { loadAutoScaleList, clusterID } = this.props
    let query = { 
      page: page,
      size: 10
    }
    if (name) {
      query = Object.assign(query, { serviceName: name })
    }
    loadAutoScaleList(clusterID, query, {
      success: {
        func: res => {
          let scaleList = res.data
          scaleList = Object.values(scaleList)
          scaleList.forEach(item => item = Object.assign(item, { key: item.metadata.name }))
          this.setState({
            scaleList
          })
        },
        isAsync: true
      }
    })
  }
  handleButtonClick = e => {
    
  }
  handleMenuClick = e => {
    
  }
  emailSendType = type => {
    switch (type) {
      case 'SendEmailWhenScale':
        return '伸缩时发送邮件'
      break
      case 'SendEmailWhenScaleUp':
        return '扩展时发送邮件'
      break
      case 'SendEmailWHenScaleDown':
        return '收缩时发送邮件'
      case 'SendNoEmail':
        return '不发送邮件'
      break
    }
  }
  formatMetrics = record => {
    let str = ''
    record && record.length && record.forEach(item => {
      if (item.resource.name === 'memory') {
        str += `内存 ${item.resource.targetAverageUtilization}%;`
      } else if (item.resource.name === 'cpu') {
        str += `CPU ${item.resource.targetAverageUtilization}%`
      }
    })
    return str
  }
  scaleStatus = text => {
    return <div className={classNames('status',{'successStatus': text === 'RUN', 'errorStatus': text === 'STOP'})}><i/>{text === 'RUN' ? '开启' : '关闭'}</div>
  }
  render() {
    const { 
      scaleModal,
      scaleList
    } = this.state
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="1"><i className='fa fa-play' /> 启用</Menu.Item>
        <Menu.Item key="2"><i className='fa fa-stop' /> 停用</Menu.Item>
        <Menu.Item key="3"><Icon type="file-text" /> 修改</Menu.Item>
        <Menu.Item key="4"><i className='fa fa-trash-o' /> 删除</Menu.Item>
      </Menu>
    );
    const columns = [{
      title: '策略名称',
      dataIndex: 'metadata.name',
      width: '10%',
      render: text => <Link>{text}</Link>,
    }, {
      title: '服务名称',
      dataIndex: 'metadata.labels.serviceName',
      width: '10%',
    }, {
      title: '开启状态',
      dataIndex: 'metadata.annotations.status',
      width: '10%',
      render: text => <div>{this.scaleStatus(text)}</div>
    }, {
      title: '阈值',
      dataIndex: 'spec.metrics',
      width: '15%',
      render: (text) => <div>{this.formatMetrics(text)}</div>
    }, {
      title: '最小实例数',
      dataIndex: 'spec.minReplicas',
      width: '10%',
    }, {
      title: '最大实例数',
      dataIndex: 'spec.maxReplicas',
      width: '10%',
    }, {
      title: '发送邮件',
      dataIndex: 'metadata.annotations.alertStrategy',
      width: '10%',
      render: text => <div>{this.emailSendType(text)}</div>
    }, {
      title: '告警通知组',
      dataIndex: 'metadata.annotations.alertgroupName',
      width: '10%',
    }, {
      title: '操作',
      width: '10%',
      render: () => {
        return(
          <Dropdown.Button onClick={this.handleButtonClick} overlay={menu} type="ghost">
            <Icon type="copy" /> 复用
          </Dropdown.Button>
        )
      }
    }];
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    };
    return(
      <div className="AutoScale">
        <div className="alertRow">
          伸缩策略规定了自动伸缩触发条件，任意指标超过阈值都会触发扩展，所有指标都满足n-1个实例平均值低于阈值才会触发收缩，数据与k8s共通，可以在本平台或k8s管理伸缩策略
        </div>
        <div className="btnGroup">
          <Button type="primary" size="large" onClick={() => this.setState({scaleModal: true})}><i className="fa fa-plus" /> 创建自动伸缩策略</Button>
          <Button size="large"><i className='fa fa-refresh' /> 刷新</Button>
          <Button size="large"><i className='fa fa-play' /> 启用</Button>
          <Button size="large"><i className='fa fa-stop' /> 停用</Button>
          <Button size="large"><i className='fa fa-trash-o' /> 删除</Button>
          <CommonSearchInput placeholder="请输入策略名或服务名搜索" size="large" style={{width: '200px'}}/>
          <span className="pull-right totalCount">共计 4 条</span>
        </div>
        <Table
          className="autoScaleTable"
          rowSelection={rowSelection} 
          columns={columns} 
          dataSource={scaleList} />
        <AutoScaleModal
          visible={scaleModal}
          scope={this}/>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const { clusterID } = cluster
  
  return {
    clusterID
  }
}

export default AutoScale = connect(mapStateToProps, {
  loadAutoScaleList
})(AutoScale)
