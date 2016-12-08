/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  VSphereConfig index module
 *
 * v2.0 - 2016-11-22
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Input, Modal, notification, Form, Spin } from 'antd'
import { deleteIntegration, getIntegrationConfig, updateIntegrationConfig } from '../../actions/integration'
import './style/VSphereConfig.less'

const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  name: {
    id: 'Integration.VSphereConfig.name',
    defaultMessage: 'vSphere名称',
  },
  address: {
    id: 'Integration.VSphereConfig.address',
    defaultMessage: 'vSphere地址',
  },
  user: {
    id: 'Integration.VSphereConfig.user',
    defaultMessage: '用户名',
  },
  pwd: {
    id: 'Integration.VSphereConfig.pwd',
    defaultMessage: '密码',
  },
  resetBtn: {
    id: 'Integration.VSphereConfig.resetBtn',
    defaultMessage: '重置应用',
  },
  deleteBtn: {
    id: 'Integration.VSphereConfig.deleteBtn',
    defaultMessage: '卸载应用',
  },
  finishBtn: {
    id: 'Integration.VSphereConfig.finishBtn',
    defaultMessage: '配置完成',
  },
  cancelBtn: {
    id: 'Integration.VSphereConfig.cancelBtn',
    defaultMessage: '取消',
  },
})

let VSphereConfig = React.createClass({
  getInitialState: function() {
    return {
      checkPwdType: 'pwd',
      edittingFlag: false
    }
  },
  componentWillMount() {
    const { getIntegrationConfig, integrationId } = this.props;
    getIntegrationConfig(integrationId)
  },
  editConfig() {
    //this function for user start edit the config
    this.setState({
      edittingFlag: true
    })
  },
  deleteConfig() {
    //this function for user unzip the app
    const { deleteIntegration, integrationId, rootScope } = this.props;
    const { getAllIntegration } = rootScope.props;
    Modal.confirm({
      title: '卸载应用？',
      content: '确定要卸载该应用？',
      onOk() {
        deleteIntegration(integrationId, {
          success: {
            func: () => {
              notification['success']({
                message: '卸载应用',
                description: '卸载应用成功~',
              });
              rootScope.setState({
                showType: 'list'
              });
              getAllIntegration();
            },
            isAsync: true
          }
        })
      },
      onCancel() {},
    });
  },
  onChangePwdType() {
    //this function for user change the pwd type to 'password' or 'text'
    if(this.state.checkPwdType == 'pwd') {
      this.setState({
        checkPwdType: 'text'
      })
    } else {
      this.setState({
        checkPwdType: 'pwd'
      })
    }
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    this.setState({
      edittingFlag: false
    })
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { updateIntegrationConfig, integrationId, getIntegrationConfig } = this.props;
    const _this = this;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        e.preventDefault();
        return;
      }
      updateIntegrationConfig(integrationId, values, {
        success: {
          func: () => {
            getIntegrationConfig(integrationId, {
              success: {
                func: () => {
                  _this.setState({
                    edittingFlag: false
                  })
                },
                isAsync: true
              }
            })
          },
          isAsync: true
        }
      })
      
    })
  },
  render() {
    const { isFetching, config } = this.props;
    if(isFetching || !Boolean(config)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const configNameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请输入vSphere名称' },
      ],
      initialValue: config.name
    });
    const configAddressProps = getFieldProps('url', {
      rules: [
        { required: true, message: '请输入vSphere地址' },
      ],
      initialValue: config.url
    });
    const usernameProps = getFieldProps('username', {
      rules: [
        { required: true, message: '请输入用户名' },
      ],
      initialValue: config.username
    });
    const passwordProps = getFieldProps('password', {
      rules: [
        { required: true, message: '请输入密码' },
      ],
      initialValue: config.password
    });
    return (
      <div id='VSphereConfig'>
      <Form horizontal>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.name} /></span>
          </div>
          <div className='inputBox'>
            <FormItem style={{ width:'220px' }} >
              <Input {...configNameProps} disabled={!this.state.edittingFlag} type='text' size='large' />
            </FormItem>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.address} /></span>
          </div>
          <div className='inputBox'>
            <FormItem style={{ width:'220px' }} >
              <Input {...configAddressProps} disabled={!this.state.edittingFlag} type='text' size='large' />
            </FormItem>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.user} /></span>
          </div>
          <div className='inputBox'>
            <FormItem style={{ width:'220px' }} >
              <Input {...usernameProps} disabled={!this.state.edittingFlag} type='text' size='large' />
            </FormItem>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='commonBox'>
          <div className='titleBox'>
            <span><FormattedMessage {...menusText.pwd} /></span>
          </div>
          <div className='inputBox'>
            <FormItem style={{ width:'220px' }} >
              <Input {...passwordProps} disabled={!this.state.edittingFlag} type={this.state.checkPwdType == 'pwd' ? 'password' : 'text' } size='large' />
            </FormItem>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='bottomBox'>
          {
            this.state.edittingFlag ? [
              <div>
                <Button size='large' type='primary' onClick={this.handleSubmit}>
                  <FormattedMessage {...menusText.finishBtn} />
                </Button>
                <Button size='large' onClick={this.handleReset}>
                  <FormattedMessage {...menusText.cancelBtn} />
                </Button>
              </div>
            ] : [
              <div>
                <Button size='large' type='primary' onClick={this.editConfig}>
                  <FormattedMessage {...menusText.resetBtn} />
                </Button>
                <Button size='large' onClick={this.deleteConfig}>
                  <FormattedMessage {...menusText.deleteBtn} />
                </Button>
              </div>
            ]
          }
        </div>
      </Form>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const defaultConfig = {
    isFetcing: false,
    config: {}
  }
  const { getIntegrationConfig } = state.integration
  const {isFetching, config} = getIntegrationConfig || defaultConfig
  return {
    isFetching,
    config
  }
}

VSphereConfig = createForm()(VSphereConfig);

VSphereConfig.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  deleteIntegration,
  updateIntegrationConfig,
  getIntegrationConfig
})(injectIntl(VSphereConfig, {
  withRef: true,
}));

