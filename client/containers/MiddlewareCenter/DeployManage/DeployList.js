/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * DeployList.js page
 *
 * @author zhangtao
 * @date Monday September 10th 2018
 */
import React from 'react'
import { Table, Card, Dropdown, Menu, Icon, Tooltip } from 'antd'
import { Link } from 'react-router'
import { browserHistory } from 'react-router'
import './styles/DeployList.less'
import TenxStatus from '../../../../src/components/TenxStatus'
// import TipSvcDomain from '../../../../src/components/TipSvcDomain'
import { calcuDate } from '../../../../src/common/tools'
import TimeHover from '@tenx-ui/time-hover/lib'

const statusText = [ 'Running', 'Pending', 'Stopping', 'Stopped' ]
const styleAddress = {
  width: '200px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
}
function formateColums(self) {
  return [{
    title: '集群名称',
    dataIndex: 'cluserName',
    render: text => {
      return (
        <Link to={`/middleware_center/deploy/detail/${text}`}>{text}</Link>
      )
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    render: text => {
      if (!statusText.includes(text)) {
        return <span>{`非法数据${text}`}</span>
      }
      return (
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <TenxStatus
            phase={text}
            smart={true} />
        </div>)
    },
  }, {
    title: '描述',
    dataIndex: 'describe',
  }, {
    title: '应用名称',
    dataIndex: 'AppName',
  }, {
    title: '应用版本',
    dataIndex: 'appVersion',
  }, {
    title: '访问地址',
    dataIndex: 'visiterAddress',
    render: text => {
      // return <TipSvcDomain/>
      return <div>
        <Tooltip title={`${text}/portal/console/`}>
          <div style={styleAddress}>
            <a href={`http://${text}/portal/console/`} target="_blank">{`${text}/portal/console/`}</a>
          </div>
        </Tooltip>
        <Tooltip title={`${text}/portal/`}>
          <div style={styleAddress}>
            <a href={`http://${text}/portal/`} target="_blank">{`${text}/portal/`}</a>
          </div>
        </Tooltip>
      </div>
    },
  }, {
    title: '创建时间',
    dataIndex: 'createTime',
    render: text => <TimeHover time={text} />,
  }, {
    title: '操作',
    dataIndex: 'operation',
    render: (text, record) => {
      const dropdown = (
        <Menu className="Moreoperations">
          <Menu.Item key="0" disabled={!(record.status === 'Stopped')}>
            <span onClick={() => self.onOperationHandle('RestarServiceModal', record.id)}><i className="fa fa-refresh" /> 启动</span>
          </Menu.Item>
          <Menu.Item key="1" disabled={!(record.status === 'Running')}>
            <span onClick={() => self.onOperationHandle('StopServiceModal', record.id)}><i className="fa fa-trash-o" /> 停止</span>
          </Menu.Item>
          <Menu.Item key="2" disabled={false}>
            <span onClick={() => self.onOperationHandle('DeleteServiceModal', record.id)}><i className="fa fa-undo" /> 删除</span>
          </Menu.Item>
          <Menu.Item key="3" disabled={false}>
            <span onClick={() => self.onOperationHandle('QuickRestarServiceModal', record.id)}><i className="fa fa-undo" /> 重新部署</span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className="actionBox commonData">
          <Dropdown.Button
            overlay={dropdown} type="ghost"
            onClick={ () => browserHistory.push(`/middleware_center/deploy/detail/${record.cluserName}`)}>
            <Icon type="eye-o" />查看
          </Dropdown.Button>
        </div>
      )
    },
  }];
}

// 将后台传来的数据整理成符合表单的样式
function formateData(data = []) {
  return data.map((item, index) => {
    return {
      id: index,
      cluserName: item.clusterName,
      status: item.status,
      describe: item.comment,
      AppName: item.appName,
      appVersion: item.version,
      visiterAddress: item.address,
      createTime: calcuDate(item.createTime),
    }
  })
}

export default class DeployList extends React.Component {
  state = {
    selectedRowKeys: [],
  }
  onSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
    this.props.choiceItem(selectedRowKeys)
  }
  onOperationHandle = (visibleType, index) => {
    const { parentSelf } = this.props
    this.setState({
      selectedRowKeys: [ index ],
    })
    parentSelf.setState({ [visibleType]: true })
    this.props.choiceItem([ index ])
  }
  render() {
    const { selectedRowKeys } = this.state
    const { list = {} } = this.props
    const { isFetching = false, data: { items = [] } = {} } = list
    const self = this
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <Card className="DeployList">
        <Table rowSelection={rowSelection} columns={formateColums(self)}
          dataSource={formateData(items)}
          pagination={false} loading={isFetching}/>
      </Card>
    )
  }
}
