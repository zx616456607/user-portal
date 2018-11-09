/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * system notice detail
 *
 * v0.1 - 2018-11-06
 * @author rensiwei
 */
import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Card, Button, Icon, Form, Input, Row } from 'antd'
import * as workOrderActions from '../../../actions/work_order'
import './style/SystemNoticeDetail.less'
import RemoveModal from './RemoveModal'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN } from '../../../../constants'
import NotificationHandler from '../../../../src/components/Notification'
import { formatDate } from '../../../../src/common/tools';

const notify = new NotificationHandler()

const FormItem = Form.Item

class SystemNoticeDetail extends React.Component {
  state = {
    detail: {},
    isShowModal: false,
    id: location.pathname.split('/').pop(),
    btnLoading: false,
  }
  componentDidMount() {
    const { id } = this.state
    if (id !== 'create') {
      this.loadData()
    }
  }
  loadData = () => {
    const { getSystemNotice } = this.props
    const { id } = this.state
    getSystemNotice({
      id,
    }, {
      success: {
        func: res => {
          const detail = res.data
          this.setState({
            detail,
          })
        },
        isAsync: true,
      },
    })
  }
  returnBack = () => {
    browserHistory.goBack(-1)
  }
  onClick = () => {
    this.setState({
      isShowModal: true,
    })
  }
  checkName = (rule, value, callback) => {
    if (!value) return callback(new Error('请输入公告名称'))
    callback()
  }
  checkContent = (rule, value, callback) => {
    if (!value) return callback(new Error('请输入公告内容'))
    callback()
  }
  onOk = () => {
    const { form } = this.props
    const { validateFields } = form
    validateFields((err, values) => {
      if (err) return
      this.setState({
        btnLoading: true,
      }, () => {
        const { createSystemNotice } = this.props
        createSystemNotice(values, {
          success: {
            func: res => {
              if (res.statusCode === 200) {
                notify.success('公告发布成功')
                this.returnBack()
              }
            },
          },
          failed: {
            func: () => {
              notify.warn('公告发布失败')
            },
          },
          finally: {
            func: () => {
              this.setState({
                btnLoading: false,
              })
            },
          },
        })
      })
    })
  }
  render() {
    const returnEle = <Button type="ghost" size="large" onClick={this.returnBack}><Icon type="left" /> 返回</Button>
    const { id, detail, isShowModal, btnLoading } = this.state
    const { form, user } = this.props
    const { getFieldProps } = form
    const isCreate = id === 'create'
    const isAdmin = user.role === ROLE_SYS_ADMIN ||
      user.role === ROLE_PLATFORM_ADMIN ||
      user.role === ROLE_BASE_ADMIN
    getFieldProps('creatorName', { initialValue: user.userName })
    return (
      <div>
        {
          isCreate ?
            <Card>
              <Form>
                <FormItem
                  label="公告名称"
                >
                  <Input size="large" {...getFieldProps('announcementName', { initialValue: '',
                    validate: [{
                      rules: [
                        { validator: this.checkName },
                      ],
                    }],
                  })} placeholder="请输入公告名称" />
                </FormItem>
                <FormItem
                  label="公告内容"
                >
                  <Input size="large" rows={6} type="textarea" {...getFieldProps('contents', { initialValue: '',
                    validate: [{
                      rules: [
                        { validator: this.checkContent },
                      ],
                    }],
                  })} placeholder="请输入公告内容" />
                </FormItem>
                <FormItem>
                  <Button type="ghost" onClick={this.returnBack}>取消</Button>
                  <Button loading={btnLoading} style={{ marginLeft: 20 }} type="primary" onClick={this.onOk}>确定</Button>
                </FormItem>
              </Form>
            </Card>
            :
            <Card title={returnEle} key="systemDetail">
              {
                JSON.stringify(detail) !== '{}' ?
                  <div className="systemNoticeDetail">
                    <div className="line1">
                      <div className="left">发布者: {detail.creatorName}</div>
                      <div className="left">公告 ID: {detail.id}</div>
                      <div className="left">创建时间: {formatDate(detail.createTime)}</div>
                      <div style={{ clear: 'both' }}></div>
                    </div>
                    <div className="notice">
                      <Row className="title">
                        {detail.announcementName}
                      </Row>
                      <Row className="content">
                        {detail.contents}
                      </Row>
                    </div>
                    {
                      isAdmin && <div className="removeBtn">
                        <Button size="large" type="primary" onClick={this.onClick}>撤销并删除</Button>
                      </div>
                    }
                  </div>
                  :
                  <div>暂无详情</div>
              }
              {
                isShowModal ?
                  <RemoveModal
                    current={detail}
                    visible={isShowModal}
                    onCancel={() => this.setState({ isShowModal: false })}
                  />
                  :
                  null
              }
            </Card>
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
  getSystemNotice: workOrderActions.getSystemNotice,
  createSystemNotice: workOrderActions.createSystemNotice,
})(Form.create()(SystemNoticeDetail))
