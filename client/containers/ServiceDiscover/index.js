/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Dns List
 *
 * v0.1 - 2018-07-10
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import SearchInput from '../../components/SearchInput'
// import { formatDate } from '../../../src/common/tools'
import QueueAnim from 'rc-queue-anim'
import { Button, Table, Menu, Dropdown, Card, Pagination, Modal } from 'antd'
import Title from '../../../src/components/Title'
import DnsModal from './dnsModal'
import YamlModal from './yamlModal'
import './style/index.less'
import * as dnsRecordActions from '../../actions/dnsRecord'
import Notification from '../../../src/components/Notification'
import ResourceBanner from '../../../src/components/TenantManage/ResourceBanner/index'
import TimeHover from '@tenx-ui/time-hover/lib'
import Ellipsis from '@tenx-ui/ellipsis/lib'

const notification = new Notification()

class ServiceDiscover extends React.Component {
  state = {
    search: '',
    visible: false,
    showYaml: false,
    deleteVisible: false,
    targetName: '',
    currentPage: 1,
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const { getDnsList, cluster } = this.props
    getDnsList(cluster)
  }

  handleCreate = () => {
    this.setState({
      visible: !this.state.visible,
    })

  }

  changeInp = search => {
    this.setState({
      search,
    })
  }

  searchService = search => {
    this.setState({
      search,
    }, this.loadData)
  }

  editItem = record => {
    this.setState({
      showYaml: !this.state.showYaml,
      targetName: record && record.name || '',
    })
  }

  deleteItem = record => {
    this.setState({
      deleteVisible: !this.state.deleteVisible,
      targetName: record && record.name || '',
    })
  }

  confirmDelete = () => {
    const { deleteDnsItem, cluster } = this.props
    const { targetName } = this.state
    deleteDnsItem(cluster, targetName, {
      success: {
        func: () => {
          notification.close()
          notification.success('成功删除 DNS 记录')
          this.deleteItem()
          this.loadData()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { message } = err
          notification.close()
          notification.warn('删除 DNS 记录失败', message.message)
        },
      },
    })
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
  dealWith = (text, record) => {
    if (record.type === 'name') {
      return text
    }
    const targetArr = JSON.parse(text)
    return targetArr.map((item, index) => {
      return <p key={record.name + index}>{item}</p>
    })
  }
  handlePager = value => {
    this.setState({ currentPage: value })
  }
  render() {
    const { search, visible, showYaml, deleteVisible, targetName, currentPage } = this.state
    const { list, isFetching, cluster } = this.props
    let listData = !search ? list : list.filter(item => (
      item.name.toUpperCase().indexOf(search.toUpperCase()) > -1
    ))
    const total = listData.length
    const pagination = {
      simple: true,
      total,
      current: currentPage,
      pageSize: 10,
      onChange: this.handlePager,
    }
    listData = listData.length < 10 ?
      listData
      : listData.slice((currentPage - 1) * 10, currentPage * 10)
    const columnsDiscover = [
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        width: '15%',
      }, {
        title: '类型',
        key: 'type',
        dataIndex: 'type',
        width: '15%',
        render: text => <div>{ text === 'ip' ? '外部 IP 地址' : '外部主机名' }</div>,
      }, {
        title: '目标',
        key: 'target',
        dataIndex: 'target',
        width: '18%',
        render: (text, record) => <div>
          <Ellipsis
            tooltip={this.dealWith(text, record).length > 18 ?
              this.dealWith(text, record)
              : false }
          >
            {this.dealWith(text, record)}
          </Ellipsis>
        </div>,
      }, {
        title: '端口号',
        key: 'port',
        dataIndex: 'port',
        width: '12%',
      }, {
        title: '创建时间',
        key: 'time',
        dataIndex: 'time',
        width: '18%',
        render: text => <TimeHover time={text} />,
      }, {
        title: '操 作',
        key: 'opearater',
        dataIndex: 'opearater',
        width: '18%',
        render: (key, record) => {
          const menu = <Menu
            onClick={ k => this.operatorDns(k, record)}
            style={{ width: 110 }}>
            {/* <Menu.Item key="editItem">编辑 / 查看</Menu.Item> */}
            <Menu.Item key="deleteItem">删除</Menu.Item>
          </Menu>
          return <div>
            <Dropdown.Button
              // onClick={this.handleRollbackSnapback.bind(this, record.volumeStatus === "used", key)}
              overlay={menu}
              trigger={[ 'click', 'hover' ]}
              onClick={() => this.editItem(record)}
              type="ghost">
              编辑 / 查看
            </Dropdown.Button>
          </div>
        },
      }]
    return <QueueAnim className="serviceDiscover">
      <div className="discoverPage" key="discover">
        <Title title="DNS 记录" />
        {
          visible ?
            <DnsModal
              visible={visible}
              handleCreate={this.handleCreate}
              loadData={this.loadData}
              listData={listData}
            />
            : null
        }
        {
          showYaml ?
            <YamlModal
              visible={showYaml}
              editItem={this.editItem}
              targetName={targetName}
              cluster={cluster}
              loadData={this.loadData}
              key={targetName}
            />
            : null
        }
        <Modal
          title="删除操作"
          visible={deleteVisible}
          onOk={this.confirmDelete}
          onCancel={this.deleteItem}
          okText={'确认删除'}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            确认删除该 DNS 记录？
          </div>
        </Modal>
        <ResourceBanner resourceType="dns" />
        <div className="layout-content-btns">
          <Button type="primary" size="large" onClick={this.handleCreate}>
            <i className="fa fa-plus" style={{ marginRight: 8 }}/>
            DNS 记录
          </Button>
          <Button type="ghost" size="large" onClick={this.loadData}>
            <i className="fa fa-refresh" style={{ marginRight: 8 }}/>刷新
          </Button>
          <SearchInput
            size="large"
            id="serviceDiscoverInp"
            placeholder="请输入名称搜索"
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
        <Card className="discoverTabTable">
          <Table
            className="reset_antd_table_header"
            columns={columnsDiscover}
            dataSource={listData}
            pagination={false}
            loading={ isFetching }
          />
        </Card>
      </div>
    </QueueAnim>
  }
}
const mapStateToProps = ({ entities: { current }, dnsRecord: { getList } }) => {
  const list = getList.data && getList.data.data || []
  const arr = []
  list.map(item => {
    return arr.push({
      name: item.metadata.name,
      type: item.metadata.labels['system/endpoint-type'],
      target: item.metadata.annotations && item.metadata.annotations['system/endpoint-ips'] || item.spec.externalName,
      time: item.metadata.creationTimestamp,
      port: item.metadata.annotations && item.metadata.annotations['system/endpoint-ip-port'] || '-',
    })
  })
  return {
    cluster: current.cluster.clusterID,
    isFetching: getList.isFetching,
    list: arr,
  }
}

export default connect(mapStateToProps, {
  getDnsList: dnsRecordActions.getDnsList,
  deleteDnsItem: dnsRecordActions.deleteDnsItem,
})(ServiceDiscover)
