/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateTenxFlow component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../constants'
import './style/CreateTenxFlow.less'
import { browserHistory } from 'react-router';

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  name: {
    id: 'CICD.Tenxflow.CreateTenxFlow.name',
    defaultMessage: 'TenxFlow名称',
  },
  create: {
    id: 'CICD.Tenxflow.CreateTenxFlow.create',
    defaultMessage: '创建Flow方式',
  },
  viewDefine: {
    id: 'CICD.Tenxflow.CreateTenxFlow.viewDefine',
    defaultMessage: '可视化流程定义',
  },
  yamlDefine: {
    id: 'CICD.Tenxflow.CreateTenxFlow.yamlDefine',
    defaultMessage: 'TenxFlow yaml方式定义',
  },
  email: {
    id: 'CICD.Tenxflow.CreateTenxFlow.email',
    defaultMessage: '邮件通知',
  },
  otherEmail: {
    id: 'CICD.Tenxflow.CreateTenxFlow.otherEmail',
    defaultMessage: '使用其它邮箱',
  },
  alert: {
    id: 'CICD.Tenxflow.CreateTenxFlow.alert',
    defaultMessage: '通知场景',
  },
  alertFirst: {
    id: 'CICD.Tenxflow.CreateTenxFlow.alertFirst',
    defaultMessage: '每一个项目执行成功时，通知我',
  },
  alertSecond: {
    id: 'CICD.Tenxflow.CreateTenxFlow.alertSecond',
    defaultMessage: '每一个项目执行失败时，通知我',
  },
  alertThird: {
    id: 'CICD.Tenxflow.CreateTenxFlow.alertThird',
    defaultMessage: '自动部署成功',
  },
  alertForth: {
    id: 'CICD.Tenxflow.CreateTenxFlow.alertForth',
    defaultMessage: '自动部署失败',
  },
  cancel: {
    id: 'CICD.Tenxflow.CreateTenxFlow.cancel',
    defaultMessage: '取消',
  },
  submit: {
    id: 'CICD.Tenxflow.CreateTenxFlow.submit',
    defaultMessage: '立即创建并配置流程定义',
  },
})

let CreateTenxFlow = React.createClass({
  getInitialState: function() {
    return {
      currentType: 'view',
      emailAlert: false,
      otherEmail: false,
      currentTenxFlow: null
    }
  },
  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
  },
  nameExists(rule, value, callback) {
    //this function for check the new tenxflow name is exist or not
    if (!value) {
      callback();
    } else {
      setTimeout(() => {
        if (value === 'tenxflow') {
          callback([new Error('抱歉，该名称已被占用。')]);
        } else {
          callback();
        }
      }, 800);
    }
  },
  onChangeFlowType(e) {
    //this function for user change the tenxflow type
    this.props.form.resetFields(['yaml']);
    this.setState({
      currentType: e.target.value
    });
  },
  yamlInputCheck(rule, value, callback){
    if(this.state.currentType == 'yaml' && !!!value){
      callback([new Error('请填写yaml文件')]);       
    }else{  
      callback();
    }
  },
  onChangeEmailAlert(e) {
    //this function for user select email alert or now
    this.props.form.resetFields(['radioEmail']);
    this.props.form.resetFields(['inputEmail']);
    this.setState({
      emailAlert: e
    });
  },
  radioEmailCheck(rule, value, callback){
    if(this.state.emailAlert && !!!value){
       callback([new Error('请选择邮件通知地址')]);
    }else{
      callback();
    }
  },
  onChangeAlertEmail(e) {
    //this function for user select alert email
    this.props.form.resetFields(['inputEmail']);
    if( e.target.value == 'others' ) {
      //it's mean user input the email by himself
      this.setState({
        otherEmail: true
      });
    }else{
      this.setState({
        otherEmail: false
      });
    }
  },
  emailInputCheck(rule, value, callback){
    if(this.state.otherEmail && !!!value){
       callback([new Error('请输入邮件通知地址')]);
    }else{
      callback();
    }
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    this.setState({
      currentType: 'view',
      emailAlert: false,
      otherEmail: false
    });
    scope.setState({
      createTenxFlowModal: false
    });    
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope } = this.props;
    const _this = this;
    let scopeHistory = scope.props.history;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('Errors in form!!!');
        e.preventDefault();
        return;
      }
      _this.setState({
        currentTenxFlow: values
      });
      scope.setState({       
        createTenxFlowModal: false
      });
      scopeHistory.push({ pathname: '/ci_cd/tenx_flow/tenx_flow_build', state: { config: values } });
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请输入TenxFlow名称' },
        { validator: this.nameExists },
      ],
    });
    const radioFlowTypeProps = getFieldProps('radioFlow', {
      rules: [
        { required: true, message: '请选择创建Flow方式' },
      ],
      onChange: this.onChangeFlowType,
      initialValue: 'view'
    });
    const flowProps = getFieldProps('yaml', {
      rules: [
        { validator: this.yamlInputCheck },
      ],
    });
    const radioEmailProps = getFieldProps('radioEmail', {
      rules: [
        { validator: this.radioEmailCheck },
      ],
      onChange: this.onChangeAlertEmail
    });
    const checkEmailProps = getFieldProps('inputEmail', {
      rules: [
        { validator: this.emailInputCheck },
      ],
    });
    return (
      <div id='CreateTenxFlow' key='CreateTenxFlow'>
      <Form horizontal form={this.props.form}>
        <div className='commonBox'>
          <div className='title'>
            <span><FormattedMessage {...menusText.name} /></span>
          </div>
          <div className='input'>
            <FormItem 
              hasFeedback
              help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
              style={{ width:'220px' }}
            >
              <Input {...nameProps} type='text' size='large' />
            </FormItem>  
          </div>
          <div style={{ clear:'both' }} />
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span><FormattedMessage {...menusText.create} /></span>
          </div>
          <div className='input'>
            <FormItem className='flowTypeForm'>
              <RadioGroup {...radioFlowTypeProps} >
                <Radio key='a' value={'view'}><FormattedMessage {...menusText.viewDefine} /></Radio>
                <Radio key='b' value={'yaml'}><FormattedMessage {...menusText.yamlDefine} /></Radio>
              </RadioGroup>
            </FormItem>
            <FormItem>
              <Input {...flowProps} disabled={ this.state.currentType == 'yaml' ? false : true } type='textarea' autosize={{ minRows: 10, maxRows: 30 }} />
            </FormItem>
            <div style={{ clear:'both' }} />
          </div>
          <div style={{ clear:'both' }} />
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span><FormattedMessage {...menusText.email} /></span>
          </div>
          <div className='input'>
            <Switch onChange={this.onChangeEmailAlert} checked={this.state.emailAlert} />
            { this.state.emailAlert ? [
              <QueueAnim type='right' key='selectedEmailAnimate'>
                <div className='selectedEmail' key='selectedEmail'>
                  <FormItem>                  
                    <RadioGroup {...radioEmailProps} >
                      <Radio key='a' value={'gaojian@tenxcloud.com'}>gaojian@tenxcloud.com</Radio><br />
                      <Radio key='b' value={'others'}><FormattedMessage {...menusText.otherEmail} /></Radio><br />
                    </RadioGroup>
                  </FormItem>
                  <FormItem className='emailInputForm'>
                    <Input {...checkEmailProps} type='text' size='large' disabled={ !this.state.otherEmail } /> 
                  </FormItem>
                </div>
              </QueueAnim>
            ]:null }
          </div>
          <div style={{ clear:'both' }} />
        </div>
        { this.state.emailAlert ? [
          <QueueAnim type='right' key='checkedEmailAnimate'>
            <div className='commonBox' key='checkedEmail'>
              <div className='title'>
                <span><FormattedMessage {...menusText.alert} /></span>
              </div>
              <div className='input alert'>
                <FormItem className='checkBox'>
                  <Checkbox {...getFieldProps('checkFirst', {valuePropName: 'checked', initialValue: false})} >
                    <FormattedMessage {...menusText.alertFirst} />
                  </Checkbox><br />
                  <Checkbox {...getFieldProps('checkSecond', {valuePropName: 'checked', initialValue: false})} >
                    <FormattedMessage {...menusText.alertSecond} />
                  </Checkbox><br />
                  <Checkbox {...getFieldProps('checkThird', {valuePropName: 'checked', initialValue: false})} >
                    <FormattedMessage {...menusText.alertThird} />
                  </Checkbox><br />
                  <Checkbox {...getFieldProps('checkForth', {valuePropName: 'checked', initialValue: false})} >
                    <FormattedMessage {...menusText.alertForth} />
                  </Checkbox>
                </FormItem>
              </div>
              <div style={{ clear:'both' }} />
            </div>
          </QueueAnim>
        ]:null }
        <div className='btnBox'>
          <Button size='large' onClick={this.handleReset}>
            <FormattedMessage {...menusText.cancel} />
          </Button>
          <Button size='large' type='primary' onClick={this.handleSubmit}>
            <i className='fa fa-cog' />&nbsp;
            <FormattedMessage {...menusText.submit} />
          </Button>
        </div>
      </Form>
      </div>
    )
  }
});

function mapStateToProps(state, props) {
  
  return {
    
  }
}

CreateTenxFlow = createForm()(CreateTenxFlow);

CreateTenxFlow.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(CreateTenxFlow, {
  withRef: true,
}));

