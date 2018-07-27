/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * SecurityGroup
 *
 * v0.1 - 2018-07-23
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import SearchInput from '../../components/SearchInput'
import { Link, browserHistory } from 'react-router'
import { formatDate } from '../../../src/common/tools'
import QueueAnim from 'rc-queue-anim'
import { Button, Table, Menu, Dropdown, Card, Pagination, Icon, Modal } from 'antd'
import Title from '../../../src/components/Title'
import './style/index.less'
import * as securityActions from '../../actions/securityGroup'
import Notification from '../../../src/components/Notification'

const notification = new Notification()

class SecurityGroup extends React.Component {

  state = {
    proStatus: true,
    search: '',
    currentPage: 1,
    deleteVisible: false,
    toDelete: {},
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const { getSecurityGroupList, cluster } = this.props
    getSecurityGroupList(cluster, {
      failed: {
        func: error => {
          const { message } = error
          notification.close()
          notification.warn('获取列表数据出错', message.message)
        },
      },
    })
  }

  handlePager = value => {
    this.setState({ currentPage: value })
  }

  operatorDns = (key, record) => {
    switch (key.key) {
      case 'editItem':
        this.editItem(record)
        break
      case 'deleteItem':
        this.deleteItem(record)
        break
      default:
        break
    }
  }

  editItem = record => {
    browserHistory.push(`/app_manage/security_group/edit/${record.name}`)
  }

  deleteItem = record => {
    this.setState({
      deleteVisible: !this.state.deleteVisible,
      toDelete: record || '',
    })
  }

  confirmDelete = () => {
    const { toDelete } = this.state
    const { deleteSecurityGroup, cluster } = this.props
    deleteSecurityGroup(cluster, toDelete.key, {
      success: {
        func: () => {
          notification.close()
          notification.success(`删除安全组 ${toDelete.name} 成功`)
          this.deleteItem()
          this.loadData()
        },
        isAsync: true,
      },
      failed: {
        func: error => {
          const { message } = error
          notification.close()
          notification.warn(`删除安全组 ${toDelete.name} 失败`, message.message)
          this.loadData()
        },
      },
    })
  }

  renderTarget = data => {
    return data.map((item, k) => {
      return <p key={k}>{item}</p>
    })
  }

  render() {
    const { proStatus, search, currentPage, deleteVisible, toDelete } = this.state
    const { listData, isFetching } = this.props
    const total = 10
    const pagination = {
      simple: true,
      total,
      current: currentPage,
      pageSize: 10,
      onChange: this.handlePager,
    }
    const columns = [
      {
        title: '安全组名称',
        key: 'name',
        dataIndex: 'name',
        width: '20%',
        render: (text, record) => <Link to={`/app_manage/security_group/${record.key}`}>{text || '未知'}</Link>,
      }, {
        title: '隔离对象',
        key: 'target',
        dataIndex: 'target',
        width: '20%',
        render: arr => <div>{ this.renderTarget(arr) }</div>,
      }, {
        title: '创建时间',
        key: 'time',
        dataIndex: 'time',
        width: '20%',
        render: text => <div>{formatDate(text)}</div>,
      }, {
        title: '操 作',
        key: 'opearater',
        dataIndex: 'opearater',
        width: '20%',
        render: (key, record) => {
          const menu = <Menu
            onClick={ k => this.operatorDns(k, record)}
            style={{ width: 80 }}>
            <Menu.Item key="editItem">修 改</Menu.Item>
            <Menu.Item key="deleteItem">删 除</Menu.Item>
          </Menu>
          return <div>
            <Dropdown.Button
              // onClick={this.handleRollbackSnapback.bind(this, record.volumeStatus === "used", key)}
              overlay={menu}
              trigger={[ 'click', 'hover' ]}
              onClick={() => this.editItem(record)}
              type="ghost">
              修 改
            </Dropdown.Button>
          </div>
        },
      }]
    return <QueueAnim className="securityGroup">
      <div className="securityPage" key="security">
        <Title title="安全组" />
        <Modal
          title="删除操作"
          visible={deleteVisible}
          onOk={this.confirmDelete}
          onCancel={this.deleteItem}
          okText={'确认删除'}
        >
          <div className="modalContent">
            <Icon
              className="modalIcon"
              type="exclamation-circle"/>
            <div>
              <p>删除安全组导致隔离不再生效，且不可恢复，请谨慎操作</p>
              <p>确认删除安全组 {toDelete.name} ？</p>
            </div>
          </div>
        </Modal>
        <div className="layout-content-btns">
          <Button type="primary" size="large" onClick={() => browserHistory.push('/app_manage/security_group/create')}>
            <i className="fa fa-plus" style={{ marginRight: 8 }}/>
            创建安全组
          </Button>
          <Button type="ghost" size="large" onClick={this.loadData}>
            <i className="fa fa-refresh" style={{ marginRight: 8 }}/>刷新
          </Button>
          <SearchInput
            size="large"
            id="serviceDiscoverInp"
            placeholder="请输入安全组名称搜索"
            value={search}
            style={{ width: 200 }}
            onChange={this.changeInp}
            onSearch={this.searchService}
          />
          <span className="showTit">
            当前项目 <Icon type="swap" /> 其他项目
            {
              proStatus ?
                <span className="proOpen">已开启隔离</span> :
                <span className="proClose">已关闭隔离</span>
            }
            <span className="titEdit" onClick={() => browserHistory.push('/app_manage/security_group/network_isolation')}>
              <Icon type="edit"/>修改
            </span>
          </span>
          {
            total ?
              <div className="page-box">
                <span className="total">共计 {total} 条</span>
                <Pagination {...pagination}/>
              </div>
              : null
          }
        </div>
        <Card className="discoverTabTable">
          <Table
            className="reset_antd_table_header"
            columns={columns}
            dataSource={listData}
            pagination={false}
            loading={ isFetching }
          />
        </Card>
      </div>
    </QueueAnim>
  }
}

const mapStateToProps = ({
  entities: { current },
  securityGroup: { getSecurityGroupList: { data, isFetching } },
}) => {
  const listData = []
  data && data.map(item => listData.push({
    name: item.metadata.annotations.policyName,
    target: item.spec.podSelector.matchExpressions[0].values,
    time: item.metadata.creationTimestamp,
    key: item.metadata.name,
  }))
  return {
    cluster: current.cluster.clusterID,
    listData,
    isFetching,
  }
}

export default connect(mapStateToProps, {
  getSecurityGroupList: securityActions.getSecurityGroupList,
  deleteSecurityGroup: securityActions.deleteSecurityGroup,
})(SecurityGroup)
