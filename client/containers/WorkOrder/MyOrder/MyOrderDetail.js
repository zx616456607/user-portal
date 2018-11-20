/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * my order detail
 *
 * v0.1 - 2018-11-06
 * @author rensiwei
 */
import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { formatDate } from '../../../../src/common/tools';
import { Card, Icon, Button, Spin, Row, Col, Input, Dropdown, Menu } from 'antd'
import * as workOrderActions from '../../../actions/work_order'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN } from '../../../../constants'
import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'
import './style/MyOrderDetail.less'
import TenxIcon from '@tenx-ui/icon/es/_old'
import NotificationHandler from '../../../../src/components/Notification'
import opts from '../classify'
import DelModal from './DelModal'

const notify = new NotificationHandler()
let i = 0
let timer

class MyOrderDetail extends React.Component {
  state = {
    id: this.props.location.pathname.split('/').pop(),
    loading: false,
    details: {},
    messages: [],
    relpayValue: '',
    msgLoading: false,
    wrongMsgs: [],
    isShowDelModal: false,
  }
  componentDidMount() {
    this.loadWorkOrder()
    const func = () => {
      const _height = window.innerHeight
      document.querySelector('.messageContainer').style.maxHeight = (_height - 405) + 'px'
    }
    window.onresize = func
    func()
    this.clear()
    timer = setInterval(() => {
      this.loadMessages()
    }, 30 * 1000)
  }
  componentWillUnMount = () => {
    this.clear()
  }
  clear = () => {
    timer && clearInterval(timer)
  }
  scrollBottom = () => {
    setTimeout(() => {
      document.querySelector('.messageContainer').scrollTo(0, 99999)
    }, 100)
  }
  loadWorkOrder = () => {
    this.setState({
      loading: true,
    }, async () => {
      const { getMyOrderDetails } = this.props
      const { id } = this.state
      const query = { id }
      await getMyOrderDetails(query, {
        success: {
          func: res => {
            if (res.statusCode === 200) {
              this.setState({
                details: res.data,
              })
            }
          },
          isAsync: true,
        },
      })
      await this.loadMessages()
      this.setState({ loading: false })
    })
  }
  loadMessages = async () => {
    const { getMyOrderMessages } = this.props
    const { id } = this.state
    const query = { id }
    await getMyOrderMessages(query, {
      success: {
        func: res => {
          if (res.statusCode === 200) {
            this.setState({
              messages: res.data.items.reverse(),
            }, this.scrollBottom)
          }
        },
        isAsync: true,
      },
    })
  }
  onResoveClick = status => {
    const { changeMyOrderStatus } = this.props
    const { id } = this.state
    changeMyOrderStatus(id, {
      status,
    }, {
      success: {
        func: () => {
          notify.success(status === 1 ? '工单已解决' : '工单已被重新打开')
          this.loadWorkOrder()
        },
        isAsync: true,
      },
    })
  }
  returnBack = () => {
    browserHistory.push({
      pathname: '/work-order/my-order',
    })
    // browserHistory.goBack(-1)
  }
  getClassify = key => {
    return filter(opts, { key })[0].name || '-'
  }
  onReplayInputChange = e => {
    this.setState({
      relpayValue: e.target.value,
    })
  }
  onSendMessage = () => {
    const { relpayValue, id, details, msgLoading } = this.state
    if (details.status === 1 || !relpayValue || msgLoading) return // 已解决 为空 sendloading
    const { addMyOrderMessages, user } = this.props
    const { messages } = this.state
    const tempMessages = cloneDeep(messages)
    const tempId = 'new' + i++
    tempMessages.push({
      id: tempId,
      workorderID: details.id,
      creatorName: user.userName,
      contents: relpayValue,
      createTime: formatDate(new Date()),
    })
    this.setState({
      msgLoading: true,
      messages: tempMessages,
      relpayValue: '',
    }, () => {
      this.scrollBottom()
      addMyOrderMessages(id, {
        creatorName: user.userName,
        Contents: relpayValue,
      }, {
        success: {
          func: res => {
            if (res.statusCode === 200) {
              const temp = {
                msgLoading: false,
              }
              this.setState(temp)
              this.loadMessages()
            }
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            const { wrongMsgs } = this.state
            const temp = {}
            const tempArr = cloneDeep(wrongMsgs)

            tempArr.push(tempId)
            temp.wrongMsgs = tempArr
            temp.msgLoading = false
            this.setState(temp)
          },
          isAsync: true,
        },
      })
    })
  }
  showTimeLine = (pre, curr) => {
    if (!pre) return true
    const preTime = new Date(pre.createTime)
    const currTime = new Date(curr.createTime)
    return currTime.getTime() - preTime.getTime() > 60 * 1000
  }
  renderMessages = () => {
    const { user } = this.props
    const userName = user.userName
    const { messages, msgLoading, wrongMsgs } = this.state
    const length = messages.length
    let preItem
    return messages.map((item, index) => {
      const ele = <div>
        {
          this.showTimeLine(preItem, item) &&
            <Row className="time">{formatDate(item.createTime)}</Row>
        }
        <Row className={item.creatorName === userName ? 'right' : 'left'}>
          <Col span={2} className="user">
            <div className="logAvatar">
              {item.creatorName.split('').shift().toLocaleUpperCase()}
            </div>
            <div className="userName">{item.creatorName}</div>
            <div style={{ clear: 'both' }}></div>
          </Col>
          <Col span={22} className="msgContents">
            <div className="messageContent">{item.contents}</div>
            {
              index === length - 1 && msgLoading ?
                <Icon type="loading" />
                :
                null
            }
            {
              wrongMsgs.indexOf(item.id) > -1 ?
                <Icon className="wrongIcon" type="exclamation-circle" />
                :
                null
            }
          </Col>
        </Row>
        <div style={{ clear: 'both' }}></div>
      </div>
      preItem = item
      return ele
    })
  }
  deleteOrder = () => {
    const { deleteWorkOrder } = this.props
    const { id } = this.state
    deleteWorkOrder(id, {
      success: {
        func: res => {
          if (res.result.statusCode === 200) {
            notify.success('工单删除成功')
            browserHistory.push({
              pathname: '/work-order/my-order',
            })
          }
        },
        isAsync: true,
      },
    })
  }
  render() {
    const { loading, details, messages, relpayValue, isShowDelModal } = this.state
    const { user } = this.props
    const isAdmin = user.role === ROLE_SYS_ADMIN ||
      user.role === ROLE_PLATFORM_ADMIN ||
      user.role === ROLE_BASE_ADMIN
    const isAuthor = user.userName === details.creatorName
    const returnEle = <div className="title">
      <div className="box2"></div>
      <Button type="ghost" size="large" onClick={this.returnBack}><Icon type="left" /> 返回</Button>
      <div className="statusBox">
        {details && JSON.stringify(details) !== '{}' && <div>{
          details.status === 0 ?
            !isAdmin && isAuthor && <div>
              <Button type="ghost" size="large" onClick={() => this.onResoveClick(1)}>标记解决</Button>
            </div>
            :
            <div>
              <span className="resoved">已解决</span>
              {!isAdmin && isAuthor &&

                <Dropdown.Button type="ghost" size="large" onClick={() => this.onResoveClick(0)} overlay={
                  <Menu onClick={() => {
                    this.setState({
                      isShowDelModal: true,
                    })
                  }}>
                    <Menu.Item key="1">删除</Menu.Item>
                  </Menu>
                }>
                  重新打开
                </Dropdown.Button>}
            </div>
        }</div>}
      </div>
    </div>

    return (
      <Spin className="" spinning={loading}>
        <div className="workOrderDetailsWrapper">
          <Card title={returnEle} key="systemDetail">
            {
              JSON.stringify(details) !== '{}'
                ?
                <div className="orderContainer">
                  <Row>
                    <Col span={3}>创建者: {details.creatorName}</Col>
                    <Col span={3}>工单类型: {this.getClassify(details.classifyID)}</Col>
                    <Col span={5}>工单 ID: {details.id}</Col>
                    <Col span={5}>创建时间: {formatDate(details.createTime)}</Col>
                  </Row>
                  <div className="order">
                    <Row className="title">
                      {details.workorderName}
                    </Row>
                    <Row className="content">
                      {details.contents}
                    </Row>
                    <Row className="comments">
                      相关资源: {details.comments}
                    </Row>
                  </div>
                </div>
                :
                null
            }
            {
              messages.length > 0 ?
                <div className="messageContainer">
                  {this.renderMessages()}
                </div>
                :
                <div className="messageContainer noMessages">暂无回复</div>
            }
            <div className="replayContainer">
              <Row>
                <Col className="other" span={2}>回复</Col>
                <Col className="textarea" span={20}>
                  <Input
                    autosize={{ minRows: 1, maxRows: 6 }}
                    disabled={details.status === 1} rows={1} type="textarea" value={relpayValue} onChange={this.onReplayInputChange} />
                </Col>
                <Col className="replay" span={2}>
                  <div onClick={this.onSendMessage}>
                    <TenxIcon className="send-icon" type="send-colors" />
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </div>
        {
          isShowDelModal ?
            <DelModal
              visible={isShowDelModal}
              current={details}
              onOk={() => {
                this.setState({
                  isShowDelModal: false,
                })
                this.returnBack()
              }}
              onCancel={() => this.setState({
                isShowDelModal: false,
              })}
            />
            :
            null
        }
      </Spin>
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
  getMyOrderDetails: workOrderActions.getMyOrderDetails,
  getMyOrderMessages: workOrderActions.getMyOrderMessages,
  addMyOrderMessages: workOrderActions.addMyOrderMessages,
  changeMyOrderStatus: workOrderActions.changeMyOrderStatus,
  deleteWorkOrder: workOrderActions.deleteWorkOrder,
})(MyOrderDetail)
