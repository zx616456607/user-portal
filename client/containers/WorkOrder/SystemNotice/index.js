/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * system notice
 *
 * v0.1 - 2018-11-05
 * @author rensiwei
 */
import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Table, Pagination, Input, Button, Icon, Row, Col } from 'antd'
import * as workOrderActions from '../../../actions/work_order'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN } from '../../../../constants'
import Ellipsis from '@tenx-ui/ellipsis/lib/index'
import '@tenx-ui/ellipsis/assets/index.css'
import RemoveModal from './RemoveModal'
import moment from 'moment'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { UPDATE_INTERVAL } from '../../../../src/constants'
import './style/index.less'

let timer
class SystemNotice extends React.Component {
  state = {
    pageSize: 10,
    currentPage: 1,
    isShowRemoveModal: false,
    currentRecord: {},
    searchValue: '',
    loading: true,
    listData: [],
    total: 0,
  }
  componentDidMount() {
    this.loadData()
  }
  loadData = () => {
    this.setState({
      loading: true,
    }, () => {
      const { getSystemNoticeList } = this.props
      const { searchValue, pageSize, currentPage } = this.state
      const query = {
        from: (currentPage - 1) * pageSize,
        size: pageSize,
      }
      if (searchValue) {
        query.filter = 'announcement_name,' + encodeURIComponent(searchValue)
      }
      getSystemNoticeList(query, {
        success: {
          func: res => {
            const temp = {}
            if (res.statusCode === 200 && res.data && res.data.items && res.data.items.length) {
              temp.listData = res.data.items
              temp.total = res.data.total
            } else {
              temp.listData = []
              temp.total = 0
            }
            this.setState(temp)
            timer && clearTimeout(timer)
            timer = setTimeout(() => {
              this.loadData()
            }, UPDATE_INTERVAL)
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            this.setState({
              listData: [],
              total: 0,
            })
          },
          isAsync: true,
        },
        finally: {
          func: () => {
            this.setState({
              loading: false,
            })
          },
        },
      })
    })
  }
  onRowClick = id => {
    const { location } = this.props
    const pathname = location.pathname
    browserHistory.push({
      pathname: pathname + '/' + id,
    })
  }
  onRemoveClick = record => {
    this.setState({
      isShowRemoveModal: true,
      currentRecord: record,
    })
  }
  onRemoveOk = () => {
    this.loadData()
  }
  renderItem = record => {
    const { user } = this.props
    const isAdmin = user.role === ROLE_SYS_ADMIN ||
      user.role === ROLE_PLATFORM_ADMIN ||
      user.role === ROLE_BASE_ADMIN
    return <Row className={'noticeItem ' + (isAdmin ? 'notUser' : 'user')}>
      <Col span={isAdmin ? 24 : 20} className="common">
        <Row className="line1">
          <Col span={20} className="noticeName">{record.announcementName}</Col>
          <Col span={4} className="createTime">{moment.duration(moment() - moment(record.createTime)).humanize()}前</Col>
        </Row>
        <Row className="line2">
          <Col span={20} className="content">
            <Ellipsis tooltip={false} lines={1}>
              {record.contents}
            </Ellipsis>
          </Col>
          <Col span={4} className="author">发布者: {record.creatorName}</Col>
        </Row>
      </Col>
      {
        !isAdmin ?
          <Col className="noticeControl" span={4}>
            <div className="right"><Icon type="right" /></div>
          </Col>
          :
          null
      }
      {
        isAdmin ?
          <div className="noticeControl">
            <div>
              <TenxIcon type="revert" className="controlIcon" />
              <a onClick={e => {
                e.stopPropagation()
                this.onRemoveClick(record)
              }} className="left">撤销并删除</a>
              <div className="right"><Icon type="right" /></div>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          :
          null
      }
      <div style={{ clear: 'both' }}></div>
    </Row>
  }
  onSearch = () => {
    this.loadData()
  }
  onReleaseClick = () => {
    browserHistory.push({
      pathname: '/work-order/system-notice/create',
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
    const { user } = this.props
    const isAdmin = user.role === ROLE_SYS_ADMIN ||
      user.role === ROLE_PLATFORM_ADMIN ||
      user.role === ROLE_BASE_ADMIN
    const columns = [{
      title: 'system-notice',
      render: (text, record) => this.renderItem(record),
    }]
    const { loading, pageSize, currentPage, listData,
      isShowRemoveModal, currentRecord, total } = this.state
    const data = listData
    return (
      <div className="systemNoticeContainer">
        <div className="queryRow">
          {
            isAdmin && <Button className="btnStyle" type="primary" size="large" onClick={this.onReleaseClick}>发布公告</Button>
          }
          <Button className="btnStyle reflesh" type={isAdmin ? 'ghost' : 'primary'} size="large" onClick={this.loadData}>刷新</Button>
          <div className="rightBox">
            <div className="littleLeft" onClick={this.searchApps}>
              <i onClick={this.onSearch} className="fa fa-search" />
            </div>
            <div className="littleRight">
              <Input style={{ paddingRight: 25 }} size="large" onChange={e => { this.setState({ searchValue: e.target.value }) }} placeholder="请输入名称搜索" onPressEnter={this.onSearch} />
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
        <div className="systemNoticeWrapper">
          <Table
            onRowClick={record => this.onRowClick(record.id)}
            showHeader={false}
            dataSource={data}
            columns={columns}
            pagination={false}
            loading={loading}
          />
        </div>
        {
          isShowRemoveModal ?
            <RemoveModal
              visible={isShowRemoveModal}
              current={currentRecord}
              onOk={this.onRemoveOk}
              onCancel={() => this.setState({
                isShowRemoveModal: false,
                currentRecord: {},
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
  getSystemNoticeList: workOrderActions.getSystemNoticeList,
})(SystemNotice)
