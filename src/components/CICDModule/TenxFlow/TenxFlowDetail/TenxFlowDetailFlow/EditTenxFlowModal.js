/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * EditTenxFlowModal component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox, Icon, Select } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import './style/EditTenxFlowModal.less'
import { browserHistory } from 'react-router';

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

const menusText = defineMessages({
  titleEdit: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.titleEdit',
    defaultMessage: '编辑项目卡片',
  },
  titleAdd: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.titleAdd',
    defaultMessage: '创建项目卡片',
  },
  unitCheck: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.unitCheck',
    defaultMessage: '单元测试',
  },
  containCheck: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.containCheck',
    defaultMessage: '集成测试',
  },
  podToPodCheck: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.podToPodCheck',
    defaultMessage: '端对端测试',
  },
  runningCode: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.runningCode',
    defaultMessage: '代码编译',
  },
  buildImage: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.buildImage',
    defaultMessage: '镜像构建',
  },
  other: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.other',
    defaultMessage: '自定义',
  },
  flowType: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.flowType',
    defaultMessage: '项目类型',
  },
  flowCode: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.flowCode',
    defaultMessage: '项目代码',
  },
  flowName: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.flowName',
    defaultMessage: '项目名称',
  },
  selectCode: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.selectCode',
    defaultMessage: '选择代码库',
  },
  imageName: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.imageName',
    defaultMessage: '基础镜像',
  },
  defineEnv: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.defineEnv',
    defaultMessage: '自定义环境变量',
  },
  servicesTitle: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.servicesTitle',
    defaultMessage: '常用服务',
  },
  addServices: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.addServices',
    defaultMessage: '继续添加',
  },
  shellCode: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.shellCode',
    defaultMessage: '脚本命令',
  },
  submit: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.submit',
    defaultMessage: '确定',
  },
  cancel: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.cancel',
    defaultMessage: '取消',
  },
})

let uuid = 0;
let shellUid = 0;
let EditTenxFlowModal = React.createClass({
  getInitialState: function() {
    return {
      otherFlowType: 'buildImage',
      currentType: 'view',
      emailAlert: false,
      otherEmail: false,
      currentTenxFlow: null
    }
  },
  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
  },
  flowNameExists(rule, value, callback) {
    //this function for check the new tenxflow name is exist or not
    if (!value) {
      callback();
    } else {
      setTimeout(() => {
        if (value === 'tenxflow') {
          callback([new Error('抱歉，该名称已存在。')]);
        } else {
          callback();
        }
      }, 800);
    }
  },
  imageNameExists(rule, value, callback) {
    //this function for check the image name is exist or not
    if (!value) {
      callback();
    } else {
      setTimeout(() => {
        if (value === 'tenxflow') {
          callback([new Error('抱歉，该名称不存在。')]);
        } else {
          callback();
        }
      }, 800);
    }
  },
  flowTypeChange(e) {
    //this function for user change the tenxflow type
    if(e != 'other'){
      this.props.form.resetFields(['otherFlowType']);    
    }
    this.setState({
      otherFlowType: e
    });
  },
  removeService (k) {
    const { form } = this.props;
    // can use data-binding to get
    if(this.state.editing){
      let keys = form.getFieldValue('services');
      keys = keys.filter((key) => {
        return key !== k;
      });
      // can use data-binding to set
      form.setFieldsValue({
        keys,
      });
    }  
  },
  addService () {
    uuid++;
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('services');
    keys = keys.concat(uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
  },
  removeShellCode (k) {
    const { form } = this.props;
    // can use data-binding to get
    if(this.state.editing) {
      let keys = form.getFieldValue('shellCodes');
      keys = keys.filter((key) => {
        return key !== k;
      });
      // can use data-binding to set
      form.setFieldsValue({
        keys,
      });
    }else {
      let keys = form.getFieldValue('shellCodes');
      console.log(keys)
//    keys = keys.filter((key) => {
//      return key !== k;
//    });
//    // can use data-binding to set
//    form.setFieldsValue({
//      keys,
//    });
    }
  },
  addShellCode (index) {
    if(index == shellUid) {
      shellUid++;
      const { form } = this.props;
      // can use data-binding to get
      let keys = form.getFieldValue('services');
      keys = keys.concat(shellUid);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        keys,
      });
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
      EditTenxFlowModalModal: false
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
        EditTenxFlowModalModal: false
      });
      scopeHistory.push({ pathname: '/ci_cd/tenx_flow/tenx_flow_build', state: { config: values } });
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    getFieldProps('services', {
      initialValue: [0],
    });
    getFieldProps('shellCodes', {
      initialValue: [0],
    });
    const serviceItems = getFieldValue('services').map((k) => {
      const serviceSelect = getFieldProps('serviceSelect' + k, {
        rules: [
          { required: true, message: '请选择' },
        ],
      });
      return (
        <div className='serviceDetail'>
          <Form.Item key={'serviceName' + k} className='commonItem'>
            <Select {...serviceSelect} style={{ width: '100px' }} >
              <Option value='MySQL'>MySQL</Option>
              <Option value='Postgre'>Postgre</Option>
            </Select>
            <span className='defineEnvBtn'><FormattedMessage {...menusText.defineEnv} /></span>
            <i className='fa fa-trash' />
          </Form.Item>
        </div>
      )
    });
    const shellCodeItems = getFieldValue('shellCodes').map((k) => {
      const shellCodeProps = getFieldProps('shellCode' + k, {
        rules: [
          { message: '请输入脚本命令' },
        ],
        onFocus: this.addShellCode(k),
        onBlur: this.removeShellCode(k)
      });
      return (
        <div className='serviceDetail'>
          <FormItem className='serviceForm'>
            <Input {...shellCodeProps} type='text' size='large' />
          </FormItem>
          <i className='fa fa-trash' onClick={this.removeShellCode(k)}/>
          <div style={{ clera:'both' }}></div>
        </div>
      )
    });
    const flowTypeProps = getFieldProps('flowType', {
      rules: [
        { required: true, message: '请选择项目类型' },
      ],
      onChange: this.flowTypeChange,
    });
    const otherFlowTypeProps = getFieldProps('otherFlowType', {
      rules: [
        { message: '输入自定义项目类型' },
      ],
    });
    const flowProps = getFieldProps('yaml', {
      rules: [
        { validator: this.yamlInputCheck },
      ],
    });
    const imageNameProps = getFieldProps('imageName', {
      rules: [
        { required: true, message: '请输入基础镜像名称' },
        { validator: this.imageNameExists },
      ],
    });
    const flowNameProps = getFieldProps('flowName', {
      rules: [
        { required: true, message: '请输入项目名称' },
        { validator: this.flowNameExists },
      ],
    });
    return (
      <div id='EditTenxFlowModal' key='EditTenxFlowModal'>
      <div className='titleBox'>
        <span>{ scope.state.currentModalType == 'create' ? [<FormattedMessage {...menusText.titleAdd} />] : [<FormattedMessage {...menusText.titleEdit} />] }</span>
        <Icon type='cross' />
      </div>
      <Form horizontal form={this.props.form}>
        <div className='commonBox'>
          <div className='title'>
            <span><FormattedMessage {...menusText.flowType} /></span>
          </div>
          <div className='input flowType'>
            <FormItem className='flowTypeForm'>
              <Select {...flowTypeProps} style={{ width: 120 }}>
                <Option value='unitCheck'><FormattedMessage {...menusText.unitCheck} /></Option>
                <Option value='containCheck'><FormattedMessage {...menusText.containCheck} /></Option>
                <Option value='podToPodCheck'><FormattedMessage {...menusText.podToPodCheck} /></Option>
                <Option value='runningCode'><FormattedMessage {...menusText.runningCode} /></Option>
                <Option value='buildImage'><FormattedMessage {...menusText.buildImage} /></Option>
                <Option value='other'><FormattedMessage {...menusText.other} /></Option>
              </Select>
            </FormItem>
            {
              this.state.otherFlowType == 'other' ? [
                <QueueAnim className='otherFlowTypeInput'>
                  <div key='otherFlowTypeInput'>
                    <FormItem>
                      <Input {...otherFlowTypeProps} size='large' />
                    </FormItem>
                  </div>
                </QueueAnim>
              ] : null
            }
              
          </div>
          <div style={{ clear:'both' }} />
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span><FormattedMessage {...menusText.flowCode} /></span>
          </div>
          <div className='input'>
            <Button className='selectCodeBtn' size='large' type='ghost'>
              <i className='fa fa-file-code-o' />
              <FormattedMessage {...menusText.selectCode} />
            </Button>
          </div>
          <div style={{ clear:'both' }} />
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span><FormattedMessage {...menusText.flowName} /></span>
          </div>
          <div className='input'>
            <FormItem 
              hasFeedback
              help={isFieldValidating('flowName') ? '校验中...' : (getFieldError('flowName') || []).join(', ')}
              style={{ width:'220px' }}
            >
              <Input {...flowNameProps} type='text' size='large' />
            </FormItem>
          </div>
          <div style={{ clear:'both' }} />
        </div>
        <div className='line'></div>
        <div className='commonBox'>
          <div className='title'>
            <span><FormattedMessage {...menusText.imageName} /></span>
          </div>
          <div className='input'>
            <FormItem 
              hasFeedback
              help={isFieldValidating('imageName') ? '校验中...' : (getFieldError('imageName') || []).join(', ')}
              style={{ width:'220px' }}
            >
              <Input {...imageNameProps} type='text' size='large' />
            </FormItem>
          </div>
          <div style={{ clear:'both' }} />
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span><FormattedMessage {...menusText.servicesTitle} /></span>
          </div>
          <div className='input services'>
            {serviceItems}
            <div className='addServicesBtn'>
              <Icon type="plus-circle-o" />
              <FormattedMessage {...menusText.addServices} />
            </div>
           </div>
          <div style={{ clear:'both' }} />
        </div>
        <div className='commonBox'>
          <div className='title'>
            <span><FormattedMessage {...menusText.shellCode} /></span>
          </div>
          <div className='input shellCode'>
            {shellCodeItems}
           </div>
          <div style={{ clear:'both' }} />
        </div>
        <div className='line'></div>
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

EditTenxFlowModal = createForm()(EditTenxFlowModal);

EditTenxFlowModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(EditTenxFlowModal, {
  withRef: true,
}));

