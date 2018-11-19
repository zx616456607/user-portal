/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * my order
 *
 * v0.1 - 2018-11-05
 * @author rensiwei
 */
import React from 'react'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import moment from 'moment'
import { Table, Pagination, Button, Select, Input, Row, Col, Icon } from 'antd'
import * as workOrderActions from '../../../actions/work_order'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN } from '../../../../constants'
import Ellipsis from '@tenx-ui/ellipsis/lib/index'
import '@tenx-ui/ellipsis/assets/index.css'
import './style/index.less'
import DelModal from './DelModal'
import opts from '../classify'
import { UPDATE_INTERVAL } from '../../../../src/constants'

let timer
const arr = [].concat([
  { key: 'all', name: '所有分类' },
], opts)

class MyOrder extends React.Component {
  state = {
    pageSize: 10,
    currentPage: 1,
    selectValue: 'all',
    searchValue: '',
    tableLoading: false,
    listData: [],
    total: 0,
    isShowDeleteModal: false,
    current: {},
  }
  componentDidMount() {
    this.loadData()
  }
  onRowClick = id => {
    const { location } = this.props
    const pathname = location.pathname
    browserHistory.push({
      pathname: pathname + '/' + id,
    })
  }
  onRemoveOk = () => {
    this.lodaData()
  }
  loadData = () => {
    this.setState({
      tableLoading: true,
    }, () => {
      const { searchValue, selectValue, currentPage, pageSize } = this.state
      const { getMyOrderList } = this.props
      const query = {
        from: (currentPage - 1) * pageSize,
        size: pageSize,
      }
      if (selectValue && selectValue !== 'all') {
        query.filter = 'classify_id,' + selectValue
      }
      if (searchValue) {
        const searchFilter = 'workorder_name,' + encodeURIComponent(searchValue)
        query.filter = query.filter ? query.filter + ',' + searchFilter : searchFilter
      }
      getMyOrderList(query, {
        success: {
          func: res => {
            if (res.statusCode === 200) {
              this.setState({
                listData: res.data.items,
                total: res.data.total,
              })
              timer && clearTimeout(timer)
              timer = setTimeout(() => {
                this.loadData()
              }, UPDATE_INTERVAL)
            }
          },
        },
        finally: {
          func: () => {
            this.setState({
              tableLoading: false,
              listData: [],
              total: 0,
            })
          },
        },
      })
    })
  }
  renderItem = record => {
    // const { user } = this.props
    // const isUser = user.role !== ROLE_USER
    // status 0 未解决   1 已解决
    const isAuthor = this.props.user.userName === record.creatorName
    const isResoved = record.status === 1
    return <div className={'orderItem' + (isResoved ? ' isResoved' : '')}>
      <Row className="common">
        <Col span={1} className="left isOpacity">
          {
            isResoved && <Icon type="check-circle" />
          }
        </Col>
        <Col span={19} className="right isOpacity">
          <Row>
            <Col span={10}>回复人: {record.replierName || '-'}</Col>
            <Col span={10}>
              <Ellipsis tooltip={false} lines={1}>
                工单名称: {record.workorderName}
              </Ellipsis>
            </Col>
            <Col className="textRight" span={3}>{moment.duration(moment() - moment(record.createTime)).humanize()}前</Col>
            <Col span={1}></Col>
          </Row>
          <Row className="line2">
            <Col span={20}>
              <Ellipsis tooltip={false} lines={1}>
                {record.replierContents || record.contents || '-'}
              </Ellipsis>
            </Col>
            <Col className="textRight" span={3} ><span className="replayCount">{record.replierTotal || 0}</span></Col>
            <Col span={1}></Col>
          </Row>
        </Col>
        <Col span={2} className="iconRight">
          {
            isAuthor && isResoved && <a onClick={e => {
              e.stopPropagation()
              this.setState({
                isShowDeleteModal: true,
                current: record,
              })
            }}><Icon type="delete" /> 删除</a>
          }
        </Col>
        <Col span={2} className="iconRight isOpacity">
          <Icon type="right" />
        </Col>
      </Row>
    </div>
  }
  onSubmitQuesClick = () => {
    browserHistory.push({
      pathname: '/work-order/create',
    })
  }
  onSelChange = value => {
    this.setState({ selectValue: value }, () => {
      this.loadData()
    })
  }
  changePage = currentPage => {
    this.setState({
      currentPage,
    }, () => {
      this.loadData()
    })
  }
  render() {
    const columns = [{
      title: 'my-order',
      render: (text, record) => this.renderItem(record),
    }]
    const { user } = this.props
    const { listData, total, selectValue, pageSize, current,
      currentPage, tableLoading, isShowDeleteModal } = this.state
    const isAdmin = user.role === ROLE_SYS_ADMIN ||
      user.role === ROLE_PLATFORM_ADMIN ||
      user.role === ROLE_BASE_ADMIN
    const data = listData
    const opstions = arr.map(item => <Select.Option key={item.key}>{item.name}</Select.Option>)
    return (
      <div className="myOrderContainer">
        <div className="queryRow">
          {
            !isAdmin && <Button className="btnStyle" type="primary" size="large" onClick={this.onSubmitQuesClick}>提交工单</Button>
          }
          <Button className="btnStyle reflesh" type={ !isAdmin ? 'ghost' : 'primary' } size="large" onClick={this.loadData}>刷新</Button>
          <Select allowClear={true} size="large" className="selStyle" placeholder="请选择工单类型"
            value={selectValue}
            onChange={this.onSelChange}>
            {opstions}
          </Select>
          <div className="rightBox">
            <div className="littleLeft" onClick={this.searchApps}>
              <i onClick={this.loadData} className="fa fa-search" />
            </div>
            <div className="littleRight">
              <Input style={{ paddingRight: 25 }} size="large" onChange={e => { this.setState({ searchValue: e.target.value }) }} placeholder="请输入名称搜索"
                onPressEnter={this.loadData} />
            </div>
          </div>
          { total !== 0 && <div className="pageBox">
            <span className="totalPage">共 { total } 条</span>
            <div className="paginationBox">
              <Pagination
                simple
                className="inlineBlock"
                total={total}
                pageSize={pageSize}
                current={currentPage}
                onChange={this.changePage}
                // onShowSizeChange={this.onShowSizeChange}
              />
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>}
        </div>
        <div className="myOrderWrapper">
          <Table
            onRowClick={record => this.onRowClick(record.id)}
            showHeader={false}
            dataSource={data}
            columns={columns}
            pagination={false}
            loading={tableLoading}
          />
        </div>
        {
          isShowDeleteModal ?
            <DelModal
              visible={isShowDeleteModal}
              current={current}
              onOk={() => {
                this.loadData()
                this.setState({
                  isShowDeleteModal: false,
                  current: {},
                })
              }}
              onCancel={() => this.setState({
                isShowDeleteModal: false,
                current: {},
              })}
            />

            :
            null
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { loginUser = {} } = state.entities
  return {
    user: loginUser.info,
  }
}

export default connect(mapStateToProps, {
  getMyOrderList: workOrderActions.getMyOrderList,
})(MyOrder)
