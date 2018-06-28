/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * index.tsx page
 *
 * @author zhangtao
 * @date Tuesday June 12th 2018
 */
import * as React from 'react'
// import { connect } from 'react-redux'
import { Button, Icon, Pagination, Card, Table } from 'antd'
// import { Link } from 'react-router'
import './style/ApplyLimit.less'
import _ from 'lodash'
// import Notification from '../../../../src/components/Notification'
import Title from '../../../../src/components/Title'
import CommonSearchInput from '../../../../src/components/CommonSearchInput'
import QueueAnim from 'rc-queue-anim'
import '@tenx-ui/page/assets/index.css'
import TenxPage from '@tenx-ui/page'
import './style/ApplyLimit.less'
import Operation from './Operation'
import ApplyForm from './ApplyForm'
import { checkApplyRecord } from '../../../actions/applyLimit'
import { ListProjects } from '../../../../src/actions/project'
import { connect } from 'react-redux'
// 表格头定义
const columns = ({ filteredInfo, reloadApplyRecord }) => {
  const columns = [{
    title: '申请项目',
    dataIndex: 'item',
    key: 'item',
    filters: [
      { text: '个人项目', value: '个人项目' },
      { text: '共享项目', value: '共享项目' },
    ],
    onFilter: (value, record) => {
      return (String(record.itemProp) === String(value))// 针对哪个字段进行筛选
    },
  }, {
    title: '申请时间',
    key: 'time',
    dataIndex: 'time',
  }, {
    title: '审批状态',
    dataIndex: 'condition',
    key: 'condition',
    filters: [
      { text: '全部同意', value: 1 }, // '全部同意'
      { text: '部分同意', value: 3 }, // '全部拒绝'
      { text: '全部拒绝', value: 2 }, // 部分同意
      { text: '待审批', value: 0 }, // 审批中
    ],
    filteredValue: filteredInfo.condition,
    onFilter: (value, record) => {
      return (String(record.condition) === String(value))
    }, // 针对哪个字段进行筛选
    render: (text, record) => {
      const iconText = { iconName: '', iconText: '' }
      switch (record.condition) {
        case 0: {
          iconText.iconName = 'iconWaitApproval'
          iconText.iconText = '待审批'
          break
        }
        case 1: { // 全部同意
          iconText.iconName = 'iconallAgree'
          iconText.iconText = '全部同意'
          break
        }
        case 2: {
          iconText.iconName = 'iconallRefuse'
          iconText.iconText = '全部拒绝'
          break
        }
        case 3: { // 部分同意
          iconText.iconName = 'iconPartAgree'
          iconText.iconText = '部分同意'
          break
        }
        default:
          break
      }
      return (<div>
        <span className={iconText.iconName}>
          <span className="iconText">{iconText.iconText}</span>
          <span className="icon" ></span>
        </span>
      </div>)
    },
  }, {
    title: '操作',
    key: 'operation',
    dataIndex: 'operation',
    width: 250,
    render: (text, record) => {
      const { condition } = record
      let newCondition = ''
      newCondition = condition === 0 ? 'notCondition' : 'condition'
      return (
        <Operation condition={newCondition} record={record} reloadApplyRecord={reloadApplyRecord}/>
      )
    },
  }]
  return columns
}

const getdataSource = ({ dataSource, namespace }) => {
  const datas = []
  if (_.isArray(dataSource) && !_.isEmpty(dataSource)) {
    dataSource.forEach((o, index) => {
      datas.push({
        key: index,
        item: o.displayName,
        time: o.createTime,
        condition: o.status,
        itemProp: o.namespace === namespace ? '个人项目' : '共享项目',
        id: o.id,
      })
    })
  }
  return datas
}
class ApplyLimit extends React.Component {
  state = {
    filteredInfo: null,
    applayVisable: false, // 申请配额弹窗标志位
    currentPage: 1,
    searchValue: null, // 当前搜索的关键字
  }
  handleChange = (p, filters) => {
    this.setState({
      filteredInfo: filters,
    })
  }
  componentDidMount = () => {
    const { checkApplyRecord } = this.props
    const query = { from: 0, size: 10 } // 刷新页面时 默认请求第一页
    checkApplyRecord(query)
  }
  setApplayVisable = status => { // 当status的值为success时 会重新liading一下数据
    const { ListProjects, checkApplyRecord } = this.props
    const { currentPage: n } = this.state
    const { applayVisable } = this.state
    this.setState({ applayVisable: !applayVisable })
    ListProjects() // 获取项目名称
    if (status === 'success') {
      const query = { from: (n - 1) * 10, size: 10 } // 刷新页面时 默认请求第一页
      checkApplyRecord(query)
    }
  }
  reloadApplyRecord = () => {
    const { currentPage: n } = this.state
    const { checkApplyRecord } = this.props
    const query = { from: (n - 1) * 10, size: 10 } // 刷新页面时 默认请求第一页
    checkApplyRecord(query)
  }
  onSearch = value => {
    const { checkApplyRecord } = this.props
    this.setState({ searchValue: value })
    if (!_.isEmpty(value)) {
      const query = { from: 0, size: 10, filter: `display_name,${value}` } // 搜索关键词的时候 默认请求第一页
      checkApplyRecord(query)
    }
  }
  render() {
    let { filteredInfo, applayVisable, searchValue } = this.state
    filteredInfo = filteredInfo || {}
    const { isFetching, data, total } = this.props.resourcequoteRecord
    const { checkApplyRecord, namespace } = this.props
    const { currentPage } = this.state
    const reloadApplyRecord = this.reloadApplyRecord
    // 页脚设置
    const pageOption = {
      simple: true,
      total: !_.isEmpty(data) && total || 0,
      defaultPageSize: 10,
      defaultCurrent: 1,
      onChange: n => {
        this.setState({ currentPage: n })
        const query = { from: (n - 1) * 10, size: 10 }
        if (!_.isEmpty(searchValue)) {
          query.filter = `display_name,${searchValue}`
        }
        checkApplyRecord(query)
      },
      current: currentPage,
    }
    return (
      <TenxPage inner className="ApplyLimitPage">
        <QueueAnim>
          <Title title="配额申请" />
          <div className="layout-content-btns" key="top">
            <Button type="primary" onClick={this.setApplayVisable}>
              <Icon type="file-text" />申请配额
            </Button>
            <CommonSearchInput placeholder="按项目名称搜索" size="large" onSearch={this.onSearch}/>
            <Pagination {...pageOption}/>
          </div>
          <div className="content" key="content">
            <Card>
              <Table
                loading={isFetching}
                pagination={false}
                columns={columns({ filteredInfo, reloadApplyRecord })}
                dataSource={getdataSource({ dataSource: data, namespace })}
                onChange={this.handleChange}
              />
            </Card>
          </div>
        </QueueAnim>
        <ApplyForm applayVisable={applayVisable} setApplayVisable={this.setApplayVisable}/>
      </TenxPage>
    )
  }
}

const mapStateToProps = state => {
  const resourcequoteRecord = state.applyLimit.resourcequoteRecord
  // const namespace = state.entities.loginUser.info.namespace
  return {
    resourcequoteRecord,
  }
}

export default connect(mapStateToProps, {
  checkApplyRecord,
  ListProjects,
})(ApplyLimit)
