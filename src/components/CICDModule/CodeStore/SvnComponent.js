/**
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2016 TenxCloud. All Rights Reserved.
*
* codeRepo component
*
* v0.1 - 2016-10-31
* @author BaiYu
*/
import React, { Component, PropTypes } from 'react'
import { Alert, Icon, Menu, Button, Card, Input, Tabs, Tooltip, message, Dropdown, Form, Modal, Spin, Switch } from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { addSvnManaged, getUserInfo  } from '../../../actions/cicd_flow'

const TabPane = Tabs.TabPane
const FormItem = Form.Item;
const menusText = defineMessages({
  search: {
    id: 'CICD.TenxStorm.search',
    defaultMessage: '搜索',
  },
  publicKey: {
    id: 'CICD.TenxStorm.publicKey',
    defaultMessage: '公钥授权',
  },
  back: {
    id: 'CICD.TenxStorm.back',
    defaultMessage: '返回',
  },
  creageCodeStore: {
    id: 'CICD.TenxStorm.creageCodeStore',
    defaultMessage: '创建代码仓库',
  },
  logout: {
    id: 'CICD.TenxStorm.logout',
    defaultMessage: '注销',
  },
  clickCopy: {
    id: 'CICD.TenxStorm.clickCopy',
    defaultMessage: '点击复制',
  },
  copyBtn: {
    id: 'CICD.TenxStorm.copyBtn',
    defaultMessage: '复制',
  },
  copySuccess: {
    id: 'CICD.TenxStorm.copySuccess',
    defaultMessage: '复制成功',
  },
  pubilicType: {
    id: 'CICD.TenxStorm.publicType',
    defaultMessage: '公有'
  },
  privateType: {
    id: 'CICD.TenxStorm.privateType',
    defaultMessage: '私有'
  }
})

let SvnComponent = React.createClass({
  getInitialState() {
    return {
      authorizeModal: false,
      privateType: true,
      submiting: false
    }
  },
  setModalStaus(status) {
    const scope = this.props.form
    if(status) {
      scope.resetFields()
    }
    this.setState({authorizeModal: status})
  },
  handleSubmit(e) {
    e.preventDefault();
    const self = this
    const parentScope = this.props.scope.state
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      self.setState({submiting: true})
      const config = {
        "name": values.name,
        "repo_type": parentScope.repokey,
        "address": values.address,
        "is_private": values.type ? 0 : 1
        // "username": "wanglei2016",
        // "password": "zaq11qaz"
      }
      if (!values.type) {
        config.username = values.username
        config.password = values.password
      }
      self.props.addSvnManaged (config, {
        success: {
          func: (res) => {
            self.setState({
              authorizeModal: false,
              submiting: false,
              privateType: true // default switch on switch private or public 
            })
            self.props.form.resetFields()
            Modal.confirm({
              title: '添加成功!',
              content: (<h3>是否去查看所添加的项目！</h3>),
              cancelText: '取消',
              okText: '确定',
              onOk() {
                browserHistory.push('/ci_cd')
              },
              onCancel() {
              }
            });
          }
        },
        failed: {
          func: (res) => {
            self.setState({submiting: false})
            Modal.warning({
              title: '添加失败!',
              content: (<h3>{res.message}</h3>),
            });
          }
        }
      })
    })
  },
  render () {
    const { config, scope, formatMessage } = this.props
    const { getFieldProps, getFieldValue } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 }, wrapperCol: { span: 14 }
    };
    const forName = getFieldProps('name', {
      rules: [
        { required: true, message: "输入名称" }
      ],
      initialValue: ''
    });
    const forUrl = getFieldProps('address', {
      rules: [
        { required: true, message: "输入地址" }
      ],
      initialValue: ''
    });
    const forType = getFieldProps('type', {
      initialValue: true
    });
    const forUsername = getFieldProps('username', {
      initialValue: ''
    });
    const forPassword = getFieldProps('password', {
      initialValue: ''
    });
    return (
      <div style={{ lineHeight: '150px', paddingLeft: '250px' }}>
        <Button type="primary" size="large" onClick={() => this.setModalStaus(true)}>添加代码源</Button>
        <Modal title="添加代码源" wrapClassName="svnModal" visible={this.state.authorizeModal}
          onCancel={() => this.setModalStaus(false)}
          footer={null}
          >
          <div style={{ padding: "25px 0" }}>
            <Form horizontal onSubmit={this.handleSubmit}>
              <FormItem  {...formItemLayout} label="名称：">
                <Input placeholder="输入名称" size="large" {...forName} />
              </FormItem>

              <FormItem {...formItemLayout} label="地址：" >
                <Input placeholder="" size="large" {...forUrl} />
              </FormItem>

              <FormItem {...formItemLayout} label="类型：">
                <Switch defaultChecked={true} {...forType } onChange={(e)=> {this.setState({privateType: e})}} checkedChildren={formatMessage(menusText.pubilicType)} unCheckedChildren={formatMessage(menusText.privateType)} />
              </FormItem>

              { !this.state.privateType ?
              [<QueueAnim type='right' key='svnModal-type'>
                <FormItem {...formItemLayout} label="用户名: ">
                  <Input placeholder="输入用户名称" size="large" {...forUsername } />
                </FormItem>

                <FormItem {...formItemLayout} label="密码: ">
                  <Input type="password" placeholder="请输入密码" {...forPassword} />
                </FormItem>
              </QueueAnim>]
              : null
              }
              <FormItem wrapperCol={{ span: 16, offset: 6 }} style={{ marginTop: 24 }}>
                <Button type="primary" htmlType="submit" loading={this.state.submiting}>确定</Button>
              </FormItem>
            </Form>

          </div>

        </Modal>
      </div>
    )
  }
});

SvnComponent = Form.create()(SvnComponent)

SvnComponent.propTypes = {
  addSvnManaged: PropTypes.func.isRequired,
}

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  addSvnManaged
})(SvnComponent)