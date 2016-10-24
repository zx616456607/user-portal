/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailAlert component
 *
 * v0.1 - 2016-10-21
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox, Card } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import './style/TenxFlowDetailAlert.less'
import { browserHistory } from 'react-router';

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  email: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.email',
    defaultMessage: '邮件通知',
  },
  otherEmail: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.otherEmail',
    defaultMessage: '使用其它邮箱',
  },
  alert: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alert',
    defaultMessage: '通知场景',
  },
  alertFirst: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alertFirst',
    defaultMessage: '每一个项目执行成功时，通知我',
  },
  alertSecond: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alertSecond',
    defaultMessage: '每一个项目执行失败时，通知我',
  },
  alertThird: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alertThird',
    defaultMessage: '自动部署成功',
  },
  alertForth: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.alertForth',
    defaultMessage: '自动部署失败',
  },
  cancel: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.cancel',
    defaultMessage: '取消',
  },
  submit: {
    id: 'CICD.Tenxflow.TenxFlowDetailAlert.submit',
    defaultMessage: '确定',
  },
})

let TenxFlowDetailAlert = React.createClass({
  getInitialState: function() {
    return {
      emailAlert: false,
      otherEmail: false,
    }
  },
  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
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
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
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
    <Card id='TenxFlowDetailAlert' key='TenxFlowDetailAlert'>
      <Form horizontal form={this.props.form}>
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
          <Button size='large' type='ghost' onClick={this.handleReset}>
            <FormattedMessage {...menusText.cancel} />
          </Button>
          <Button size='large' type='primary' onClick={this.handleSubmit}>
            <FormattedMessage {...menusText.submit} />
          </Button>
        </div>
      </Form>
    </Card>
    )
  }
});

function mapStateToProps(state, props) {
  
  return {
    
  }
}

TenxFlowDetailAlert = createForm()(TenxFlowDetailAlert);

TenxFlowDetailAlert.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(TenxFlowDetailAlert, {
  withRef: true,
}));

