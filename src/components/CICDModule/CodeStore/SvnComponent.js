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
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { addSvnManaged, getUserInfo } from '../../../actions/cicd_flow'
import { appNameCheck } from '../../../common/naming_validation'
import NotificationHandler from '../../../common/notification_handler'

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
    defaultMessage: '关联代码仓库',
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
    const parentScope = this.props.scope
    const typeList = parentScope.state.typeList
    if (!typeList.includes('svn')) {
      parentScope.setState({typeVisible: true})
      return
    }
    const scope = this.props.form
    setTimeout(function() {
      document.getElementById('name').focus()
    }, 0);
    if (status) {
      scope.resetFields()
    }
    this.setState({ authorizeModal: status })
  },
  svnNameCheck(rule, value, callback) {
    //this function for format svn name
    if (!value) {
      callback()
      return
    }
    let errorMsg = appNameCheck(value, '名称');
    if(errorMsg == 'success') {
      callback();
    } else {
      callback([new Error(errorMsg)]);
    }
  },
  handleSubmit(e) {
    e.preventDefault();
    const self = this
    const parentScope = this.props.scope.state
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      const config = {
        "name": values.name,
        "repo_type": parentScope.repokey,
        "address": values.address,
        "is_private": values.type ? 0 : 1
      }
      if (!values.type) {
        config.username = values.username
        config.password = values.password
      }
      if (config.address.indexOf('http') == -1) {
        Modal.warning({
          title: '地址输入有误',
          content: '地址以http:// 或者 https:// 开头'
        });
        return
      }
      self.setState({ submiting: true })
      self.props.addSvnManaged(config, {
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
            let notification = new NotificationHandler()
            self.setState({ submiting: false })
            notification.error('添加失败!')
          }
        }
      })
    })
  },
  render() {
    const { config, scope, formatMessage } = this.props
    const { getFieldProps, getFieldValue } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 }, wrapperCol: { span: 18 }
    };
    const forName = getFieldProps('name', {
      rules: [
        { required: true, message: "请输入名称" },
        { validator: this.svnNameCheck }
      ],
    });
    const forUrl = getFieldProps('address', {
      rules: [
        { required: true, message: "请输入地址" }
      ],
    });
    const forType = getFieldProps('type', {
      initialValue: true
    });
    const forUsername = getFieldProps('username', {
    });
    const forPassword = getFieldProps('password', {
    });
    return (
      <div style={{ lineHeight: '100px', paddingLeft: '150px', paddingBottom: '16px' }}>
        <Button type="primary" size="large" onClick={() => this.setModalStaus(true)}>添加 SVN 代码仓库</Button>
        <Modal title="添加 SVN 代码源" wrapClassName="svnModal" visible={this.state.authorizeModal}
          onCancel={() => this.setModalStaus(false)} maskClosable={false}
          footer={[<Button type="ghost" size="large" onClick={()=>this.setState({authorizeModal: false})}>取消</Button>,
          <Button type="primary" size="large" htmlType="submit" loading={this.state.submiting} style={{marginLeft:'8px'}}>确定</Button>]}
          >
          <div style={{ paddingTop: "20px" }}>
            <Form horizontal onSubmit={this.handleSubmit}>
              <FormItem  {...formItemLayout} hasFeedback label="名称 ：">
                <Input placeholder="输入名称" id="name" size="large" {...forName} />
              </FormItem>

              <FormItem {...formItemLayout} hasFeedback label="地址 ：" >
                <Input placeholder="http://*** | https://***" size="large" {...forUrl} />
              </FormItem>

              <FormItem {...formItemLayout} label="类型 ：">
                <Switch defaultChecked={true} {...forType } onChange={(e) => { this.setState({ privateType: e }) } } checkedChildren={formatMessage(menusText.pubilicType)} unCheckedChildren={formatMessage(menusText.privateType)} />
              </FormItem>

              {!this.state.privateType ?
                [<QueueAnim type='right' key='svnModal-type'>
                  <FormItem {...formItemLayout} label="用户名 : ">
                    <Input placeholder="输入用户名称" size="large" {...forUsername } />
                  </FormItem>

                  <FormItem {...formItemLayout} label="密码 : ">
                    <Input type="password" placeholder="请输入密码" {...forPassword} />
                  </FormItem>
                </QueueAnim>]
                : null
              }

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