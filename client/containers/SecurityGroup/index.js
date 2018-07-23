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
import SearchInput from '../../components/SearchInput'
import { browserHistory } from 'react-router'
import { formatDate } from '../../../src/common/tools'
import QueueAnim from 'rc-queue-anim'
import { Button, Table, Menu, Dropdown, Card, Pagination, Icon } from 'antd'
import Title from '../../../src/components/Title'
import './style/index.less'
// import * as dnsRecordActions from '../../actions/dnsRecord'
// import Notification from '../../../src/components/Notification'

// const notification = new Notification()

class SecurityGroup extends React.Component {
  state = {
    proStatus: true,
    search: '',
    currentPage: 1,
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

  // editItem = record => {
  //   console.log( '***', record )
  // }

  // deleteItem = record => {
  //   console.log( '***', "record" , record )
  // }

  render() {
    const { proStatus, search, currentPage } = this.state
    const total = 10
    const pagination = {
      simple: true,
      total,
      current: currentPage,
      pageSize: 10,
      onChange: this.handlePager,
    }
    const listData = [
      {
        name: '0.0',
        target: '^.^',
        time: '2018-07-23T03:42:33Z',
        key: '15245sa',
      },
    ]
    const columns = [
      {
        title: '安全组名称',
        key: 'name',
        dataIndex: 'name',
        width: '30%',
      }, {
        title: '隔离对象',
        key: 'target',
        dataIndex: 'target',
        width: '30%',
        render: text => <div>**{ text }*</div>,
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
        <Title title="创建安全组" />
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
            <span className="titEdit"><Icon type="edit" />修改</span>
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
            // loading={ isFetching }
          />
        </Card>
      </div>
    </QueueAnim>
  }
}

export default SecurityGroup
