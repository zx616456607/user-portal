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
// import { formatDate } from '../../../src/common/tools'
import QueueAnim from 'rc-queue-anim'
import { Button, Table, Menu, Dropdown, Card, Pagination, Icon, Modal } from 'antd'
import Title from '../../../src/components/Title'
import './style/index.less'
import * as securityActions from '../../actions/securityGroup'
import Notification from '../../../src/components/Notification'
import * as networkpolicy from '../../../src/actions/app_manage'
import ResourceBanner from '../../../src/components/TenantManage/ResourceBanner/index'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import TimeHover from '@tenx-ui/time-hover/lib'
import * as cluserActions from '../../../src/actions/cluster_node'

const notification = new Notification()

class SecurityGroup extends React.Component {

  state = {
    isolationStatus: true, // true=>隔离
    search: '',
    currentPage: 1,
    deleteVisible: false,
    statusVisible: false,
    enterLoading: false,
    currentRecord: {},
  }

  componentDidMount() {
    const { getNetworkIsolationStatus, cluster, getNetworkSolutions } = this.props
    this.loadData()
    getNetworkSolutions(cluster)
    getNetworkIsolationStatus(cluster, {
      success: {
        func: res => {
          this.setState({
            isolationStatus: res.defaultDeny,
          })
        },
      },
    })
  }

  loadData = () => {
    const { getSecurityGroupList, cluster } = this.props
    getSecurityGroupList(cluster, {
      failed: {
        func: error => {
          const { message, statusCode } = error
          notification.close()
          if (statusCode !== 403) {
            notification.warn('获取列表数据出错', message.message)
          }
        },
      },
    })
  }

  handlePager = value => {
    this.setState({ currentPage: value })
  }

  operatorDns = (key, record) => {
    switch (key) {
      case 'editItem':
        return browserHistory.push(`/app_manage/security_group/edit/${record.metaName}`)
      case 'deleteItem':
        return this.toggleVisible('deleteVisible', record)
      case 'start':
      case 'stop':
        return this.toggleVisible('statusVisible', record)
      default:
        return null
    }
  }

  toggleVisible = (visible, record = {}) => {
    this.setState({
      [visible]: !this.state[visible],
      currentRecord: record,
    })
  }

  confirmDelete = () => {
    const { currentRecord } = this.state
    const { deleteSecurityGroup, cluster } = this.props
    this.toggleEnterLoading()
    deleteSecurityGroup(cluster, currentRecord.key, {
      success: {
        func: () => {
          notification.close()
          notification.success(`删除安全组 ${currentRecord.name} 成功`)
          this.toggleEnterLoading()
          this.toggleVisible('deleteVisible')
          this.loadData()
        },
        isAsync: true,
      },
      failed: {
        func: error => {
          const { message, statusCode } = error
          this.toggleEnterLoading()
          notification.close()
          if (statusCode !== 403) {
            notification.warn(`删除安全组 ${currentRecord.name} 失败`, message.message)
          }
        },
      },
    })
  }

  confirmToggleStatus = () => {
    const { currentRecord } = this.state
    const { updateSecurityGroup, cluster, allData } = this.props
    const target = allData.filter(item => item.metadata.name === currentRecord.metaName)[0]
    let text = '启用'
    if (currentRecord.isStoped) {
      delete target.metadata.annotations['system/disabled']
    } else {
      Object.assign(target.metadata.annotations, {
        'system/disabled': 'true',
      })
      text = '停用'
    }
    this.toggleEnterLoading()
    notification.spin('修改中...')
    updateSecurityGroup(cluster, target, {
      success: {
        func: () => {
          notification.close()
          notification.success(`${text}安全组 ${currentRecord.name} 成功`)
          this.toggleEnterLoading()
          this.loadData()
          this.toggleVisible('statusVisible')
        },
        isAsync: true,
      },
      failed: {
        func: error => {
          const { message, statusCode } = error
          notification.close()
          if (statusCode !== 403) {
            notification.warn(`${text}安全组 ${currentRecord.name} 失败`, message.message)
          }
          this.toggleEnterLoading()
        },
      },
    })
  }

  toggleEnterLoading = () => {
    this.setState({
      enterLoading: !this.state.enterLoading,
    })
  }

  renderTarget = data => {
    if (!data) return '--'
    return data && data.map((item, k) => {
      return <p key={k}>{item}</p>
    })
  }

  changeInp = search => {
    this.setState({
      search,
    })
  }

  render() {
    const { isolationStatus, search, currentPage, deleteVisible,
      statusVisible, enterLoading, currentRecord } = this.state
    const { listData, isFetching, isMacvlan } = this.props
    const isStoped = currentRecord && currentRecord.isStoped
    let list = !search ? listData : listData.filter(item => (
      item.name.toUpperCase().indexOf(search.toUpperCase()) > -1
    ))
    const total = list.length
    const pagination = {
      simple: true,
      total,
      current: currentPage,
      pageSize: 10,
      onChange: this.handlePager,
    }
    list = list.length < 10 ?
      list
      : list.slice((currentPage - 1) * 10, currentPage * 10)
    const columns = [
      {
        title: '安全组名称',
        key: 'name',
        dataIndex: 'name',
        width: '20%',
        render: (text, record) => <Link to={`/app_manage/security_group/${record.key}`}>{text || '未知'}</Link>,
      }, {
        title: '状态',
        key: 'isStoped',
        dataIndex: 'isStoped',
        width: '10%',
        render: text => <span className={text ? 'error' : 'success'}>
          <i className="fa fa-circle" /> {text ? '停用' : '启用'}
        </span>,
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
        render: text => <TimeHover time={text} />,
      }, {
        title: '操 作',
        key: 'opearater',
        dataIndex: 'opearater',
        width: '20%',
        render: (key, record) => {
          const menu = <Menu
            onClick={ k => this.operatorDns(k.key, record)}
            style={{ width: 80 }}>
            <Menu.Item key="deleteItem">删 除</Menu.Item>
            <Menu.Item key="start" disabled={!record.isStoped}>启 用</Menu.Item>
            <Menu.Item key="stop" disabled={record.isStoped}>停 用</Menu.Item>
          </Menu>
          return <div>
            <Dropdown.Button
              overlay={menu}
              trigger={[ 'click', 'hover' ]}
              onClick={() => this.operatorDns('editItem', record)}
              type="ghost">
              修 改
            </Dropdown.Button>
          </div>
        },
      }]
    return <QueueAnim className="securityGroup">
      <div className="securityGroupPage" key="security">
        <Title title="安全组" />
        <Modal
          title="删除操作"
          visible={deleteVisible}
          onOk={this.confirmDelete}
          onCancel={() => this.toggleVisible('deleteVisible')}
          confirmLoading={enterLoading}
          okText={'确认删除'}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            <div>
              <p>删除安全组导致隔离不再生效，且不可恢复，请谨慎操作</p>
              <p>确认删除安全组 {currentRecord.name} ？</p>
            </div>
          </div>
        </Modal>
        <Modal
          title={isStoped ? '启用安全组' : '停用安全组' }
          visible={statusVisible}
          onOk={this.confirmToggleStatus}
          onCancel={() => this.toggleVisible('statusVisible')}
          confirmLoading={enterLoading}
          okText={isStoped ? '确认启用' : '确认停用'}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            <div>
              <p>该操作将{ isStoped ? '启用' : '停用'} {currentRecord.name} 安全组，安全组内的隔离对象，及其对应的 ingress/egress 放通白名单{isStoped ? '均' : '不再'}生效</p>
              <p>确认{ isStoped ? '启用' : '停用'}该安全组？</p>
            </div>
          </div>
        </Modal>
        <div className="layout-content-btns">
          <ResourceBanner resourceType="securityGroup" />
          <Button
            type="primary"
            size="large"
            disabled={isMacvlan}
            onClick={() => browserHistory.push('/app_manage/security_group/create')}
          >
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
            style={{ width: 200, marginLeft: 0 }}
            onChange={this.changeInp}
            onSearch={this.searchService}
          />
          {
            total ?
              <div className="page-box">
                <span className="total">共计 {total} 条</span>
                <Pagination {...pagination}/>
              </div>
              : null
          }
        </div>
        <span className="showTit">
          当前项目
          {
            isolationStatus ?
              <span className="proEach"><Icon type="arrow-left" />/<Icon type="arrow-right" /></span> :
              <span className="proEach"><Icon type="arrow-left" /><Icon type="arrow-right" /></span>
          }
          其他项目
          {
            isolationStatus ?
              <span className="proOpen">禁止其他项目访问</span> :
              <span className="proClose">放通其他项目访问</span>
          }
          {!isMacvlan &&
          <span className="titEdit" onClick={() => browserHistory.push('/app_manage/security_group/network_isolation')}>
            <Icon type="edit"/>修改
          </span>}
          {
            isolationStatus ?
              <span className="proClose">
                （若仍有通过其他项目『应用负载均衡』访问的服务，需要在 Ingress 放通对应 IP）
              </span>
              : null
          }
        </span>
        <Card className="discoverTabTable">
          <Table
            className="reset_antd_table_header"
            columns={columns}
            dataSource={list}
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
  cluster_nodes: { networksolutions },
}) => {
  const listData = []
  data && data.forEach(item => {
    const name = getDeepValue(item, [ 'metadata', 'annotations', 'policy-name' ]) || ''
    const isStoped = getDeepValue(item, [ 'metadata', 'annotations', 'system/disabled' ])
      && getDeepValue(item, [ 'metadata', 'annotations', 'system/disabled' ]) === 'true'
      || false
    if (name !== 'system_bypass_inter_namespace') {
      listData.push({
        name,
        metaName: item.metadata.name,
        target: item.spec.podSelector.matchExpressions
          && item.spec.podSelector.matchExpressions[0].values,
        time: item.metadata.creationTimestamp,
        key: item.metadata.name,
        isStoped,
      })
    }
  })
  const isMacvlan = getDeepValue(networksolutions, [ current.cluster.clusterID, 'current' ]) === 'macvlan'
  return {
    cluster: current.cluster.clusterID,
    listData,
    isFetching,
    allData: data,
    isMacvlan,
  }
}

export default connect(mapStateToProps, {
  getSecurityGroupList: securityActions.getSecurityGroupList,
  deleteSecurityGroup: securityActions.deleteSecurityGroup,
  getNetworkIsolationStatus: networkpolicy.getNetworkIsolationStatus,
  updateSecurityGroup: securityActions.updateSecurityGroup,
  getNetworkSolutions: cluserActions.getNetworkSolutions,
})(SecurityGroup)
