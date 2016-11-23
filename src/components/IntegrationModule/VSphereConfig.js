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
import { Button, Input, Modal, notification, Form } from 'antd'
import './style/VSphereConfig.less'

const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  name: {
    id: 'Integration.VSphereConfig.name',
    defaultMessage: 'VSphere名称',
  },
  address: {
    id: 'Integration.VSphereConfig.address',
    defaultMessage: 'VSphere地址',
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
    
  },
  editConfig() {
    //this function for user start edit the config
    this.setState({
      edittingFlag: true
    })
  },
  deleteConfig() {
    //this function for user unzip the app
    Modal.confirm({
      title: '卸载应用？',
      content: '确定要卸载该应用？',
      onOk() {
        notification['success']({
          message: '卸载应用',
          description: '卸载应用成功~',
        });
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
    const _this = this;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        e.preventDefault();
        return;
      }
      console.log(values)
      _this.setState({
        edittingFlag: false
      })
    })
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const configNameProps = getFieldProps('configName', {
      rules: [
        { required: true, message: '请输入VSphere名称' },
      ],
      initialValue: 'gaojian'
    });
    const configAddressProps = getFieldProps('configAddress', {
      rules: [
        { required: true, message: '请输入VSphere地址' },
      ],
      initialValue: 'www.tenxcloud.com'
    });
    const usernameProps = getFieldProps('username', {
      rules: [
        { required: true, message: '请输入用户名' },
      ],
      initialValue: 'gaojian'
    });
    const passwordProps = getFieldProps('password', {
      rules: [
        { required: true, message: '请输入密码' },
      ],
      initialValue: 'gaojian'
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
              <i className='fa fa-eye' onClick={this.onChangePwdType}/>
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
  const defaultAppList = {
  }
  const {isFetching, appList} = defaultAppList
  return {
  }
}

VSphereConfig = createForm()(VSphereConfig);

VSphereConfig.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(VSphereConfig, {
  withRef: true,
}));

