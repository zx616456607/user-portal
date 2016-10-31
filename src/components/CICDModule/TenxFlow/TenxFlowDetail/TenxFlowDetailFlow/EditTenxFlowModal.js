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
import { Button, Input, Form, Switch, Radio, Checkbox, Icon, Select, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import './style/EditTenxFlowModal.less'
import EnvComponent from './EnvComponent.js'

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
  dockerFileCreate: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.dockerFileCreate',
    defaultMessage: '使用代码仓库的docker file',
  },
  selectDockerFile: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.selectDockerFile',
    defaultMessage: '选择已有',
  },
  createNewDockerFile: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.createNewDockerFile',
    defaultMessage: '云端创建Dockerfile',
  },
  imageRealName: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.imageRealName',
    defaultMessage: '镜像名称',
  },
  imageStore: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.imageStore',
    defaultMessage: '镜像仓库',
  },
  otherImage: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.otherImage',
    defaultMessage: '自定义仓库',
  },
  ImageTag: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.ImageTag',
    defaultMessage: '镜像版本',
  },
  ImageTagByBranch: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.ImageTagByBranch',
    defaultMessage: '以代码分支名为tag',
  },
  ImageTagByTime: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.ImageTagByTime',
    defaultMessage: '时间戳为tag',
  },
  ImageTagByOther: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.ImageTagByOther',
    defaultMessage: '自定义tag',
  },
  buildCache: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.buildCache',
    defaultMessage: '构建缓存',
  },
  envTitle: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.envTitle',
    defaultMessage: '自定义环境变量',
  }
});

let uuid = 0;
let shellUid = 0;
let EditTenxFlowModal = React.createClass({
  getInitialState: function() {
    return {
      otherFlowType: 'buildImage',
      currentType: 'view',
      emailAlert: false,
      otherEmail: false,
      currentTenxFlow: null,
      useDockerfile: false,
      otherTag: false,
      envModalShow: null
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
    if(e != 'other') {
      this.props.form.resetFields(['otherFlowType']);
    }
    if(e != 'bulidImage') {
      this.props.form.resetFields(['imageRealName']);
    }
    this.setState({
      otherFlowType: e
    });
  },
  removeService (k) {
    //the function for user remove the service select box
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('services');
    if(keys.length == 1) {
      return ;
    }
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      'services':keys
    });
  },
  addService () {
    //this function for user add an new box of service select
    uuid++;
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('services');
    keys = keys.concat(uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      'services':keys
    });
  },
  openEnvSettingModal (index) {
    //this function for user open the modal of setting the service env
    this.setState({
      envModalShow: index
    });
  },
  closeEnvSettingModal () {
    //this function for user close the modal of setting the service env
    this.setState({
      envModalShow: null
    });
  },
  removeShellCode (k) {
    //the function for user remove the shell code box
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('shellCodes');
    if(keys.length == 1) {
      return ;
    }
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      'shellCodes': keys
    });
  },
  addShellCode (index) {
    //this function for user add an new box of shell code
    //there are no button for user click
    //when user input words, after user key up would triger the function
    const { form } = this.props;
    let inputValue = form.getFieldValue('shellCode' + index);
    if(index == shellUid) {
      if(!!inputValue) {
        shellUid++;
        // can use data-binding to get
        let keys = form.getFieldValue('shellCodes');
        keys = keys.concat(shellUid);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
          'shellCodes': keys
        });
      }
    }
  },
  changeUseDockerFile (e) {
    //this function for user change using the docker file or not
    if(e.target.checked) {
      this.setState({
        useDockerfile: true
      });
    }else {
      this.setState({
        useDockerfile: false
      });
    }
  },
  changeImageTagType (e) {
    //this function for user change image tag type
    if( e.target.value == 'other' ) {
      this.setState({
        otherTag: true
      });
    } else {
      this.setState({
        otherTag: false
      });
    }
  },
  cancelChange(e) {
    //this function for reset the form and close the edit card
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    this.setState({
      currentType: 'view',
      emailAlert: false,
      otherEmail: false
    });
    scope.cancelEditCard();
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope } = this.props;
    const _this = this;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        e.preventDefault();
        return;
      }
      _this.setState({
        currentTenxFlow: values
      });
      scope.cancelEditCard();
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { config, editType, form } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const scopeThis = this;
    getFieldProps('services', {
      initialValue: [0],
    });
    getFieldProps('shellCodes', {
      initialValue: [0],
    });
    const serviceItems = getFieldValue('services').map((k) => {
      const serviceSelect = getFieldProps(`serviceSelect${k}`, {
        rules: [
          { required: true, message: '请选择' },
        ],
      });
      return (
      <QueueAnim key={'serviceName' + k + 'Animate'}>
        <div className='serviceDetail' key={'serviceName' + k}>
          <Form.Item className='commonItem'>
            <Select {...serviceSelect} style={{ width: '100px' }} >
              <Option value='MySQL'>MySQL</Option>
              <Option value='Postgre'>Postgre</Option>
            </Select>
            <span className='defineEnvBtn' onClick={() => this.openEnvSettingModal(k)}><FormattedMessage {...menusText.defineEnv} /></span>
            <i className='fa fa-trash' onClick={() => this.removeService(k)}/>
          </Form.Item>
          <Modal className='tenxFlowServiceEnvModal'
            title={<FormattedMessage {...menusText.envTitle} />}
            visible={this.state.envModalShow == k ? true : false}
            onOk={this.closeEnvSettingModal}
          >
            <EnvComponent scope={scopeThis} index={k} form={form} />
          </Modal>
        </div>
      </QueueAnim>
      )
    });
    const shellCodeItems = getFieldValue('shellCodes').map((i) => {
      const shellCodeProps = getFieldProps(`shellCode${i}`, {
        rules: [
          { message: '请输入脚本命令' },
        ],
      });
      return (
      <QueueAnim key={'shellCode' + i + 'Animate'}>
        <div className='serviceDetail' key={'shellCode' + i}>
          <FormItem className='serviceForm'>
            <Input onKeyUp={() => this.addShellCode(i) } {...shellCodeProps} type='text' size='large' />
            <i className='fa fa-trash' onClick={() => this.removeShellCode(i)} />
          </FormItem>
          <div style={{ clera:'both' }}></div>
        </div>
      </QueueAnim>
      )
    });
    const flowTypeProps = getFieldProps('flowType', {
      rules: [
        { required: true, message: '请选择项目类型' },
      ],
      onChange: this.flowTypeChange,
      initialValue: config.type,
    });
    const otherFlowTypeProps = getFieldProps('otherFlowType', {
      rules: [
        { message: '输入自定义项目类型' },
      ],
    });
    const imageRealNameProps = getFieldProps('imageRealName', {
      rules: [
        { required: true, message: '请输入镜像名称' },
      ],
    });
    const imageNameProps = getFieldProps('imageName', {
      rules: [
        { required: true, message: '请输入基础镜像' },
        { validator: this.imageNameExists },
      ],
    });
    const flowNameProps = getFieldProps('flowName', {
      rules: [
        { required: true, message: '请输入项目名称' },
        { validator: this.flowNameExists },
      ],
      initialValue: config.name,
    });
    const otherImageTagProps = getFieldProps('otherTag', {
      rules: [
        { message: '请输入镜像版本' },
      ],
    });
    return (
      <div id='EditTenxFlowModal' key='EditTenxFlowModal'>
      <div className='titleBox'>
        <span>{ editType == 'create' ? [<FormattedMessage {...menusText.titleAdd} />] : [<FormattedMessage {...menusText.titleEdit} />] }</span>
        <Icon type='cross' onClick={this.cancelChange} />
      </div>
      <Form horizontal>
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
            <div className='addServicesBtn' onClick={this.addService}>
              <Icon type='plus-circle-o' />
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
        {
          config.type == 'buildImage' ? [
            <QueueAnim className='buildImageForm'>
              <div className='line'></div>
              <div className='commonBox' key='buildImageFormAnimate'>
                <div className='title'>
                  <span>docker File</span>
                </div>
                <div className='input '>
                  <Checkbox onChange={this.changeUseDockerFile}></Checkbox><span><FormattedMessage {...menusText.dockerFileCreate} /></span>
                  {
                    this.state.useDockerfile ? [
                      <QueueAnim>
                        <div key='useDockerFileAnimateSecond'>
                          <span>this is docker file url</span>
                        </div>
                      </QueueAnim>
                    ] : [
                      <QueueAnim>
                        <div key='useDockerFileAnimateSecond'>
                          <Button type='ghost' size='large' style={{ marginRight:'20px' }}>
                            <FormattedMessage {...menusText.selectDockerFile} />
                          </Button>
                          <Button type='ghost' size='large'>
                            <FormattedMessage {...menusText.createNewDockerFile} />
                          </Button>
                        </div>
                      </QueueAnim>
                    ]
                  }
                </div>
                <div style={{ clear:'both' }} />
              </div>
              <div className='commonBox'>
                <div className='title'>
                  <span><FormattedMessage {...menusText.imageRealName} /></span>
                </div>
                <div className='input imageType'>
                  <FormItem style={{ width:'220px',float:'left',marginRight:'20px' }}>
                    <Input {...imageRealNameProps} type='text' size='large' />
                  </FormItem>
                  <FormItem style={{ float:'left' }}>
                    <RadioGroup {...getFieldProps('imageType', { initialValue: 'imageStore' })}>
                      <Radio key='imageStore' value={'imageStore'}><FormattedMessage {...menusText.imageStore} /></Radio>
                      <Radio key='DockerHub' value={'DockerHub'}>Docker Hub</Radio>
                      <Radio key='otherImage' value={'otherImage'}><FormattedMessage {...menusText.otherImage} /></Radio>
                    </RadioGroup>
                  </FormItem>
                  <div style={{ clear:'both' }} />
                </div>
                <div style={{ clear:'both' }} />
              </div>
              <div className='commonBox'>
                <div className='title'>
                  <span><FormattedMessage {...menusText.imageRealName} /></span>
                </div>
                <div className='input'>
                  <FormItem style={{ float:'left' }}>
                    <RadioGroup {...getFieldProps('imageTag', { initialValue: 'imageStore',onChange: this.changeImageTagType })}>
                      <Radio key='branch' value={'branch'}><FormattedMessage {...menusText.ImageTagByBranch} /></Radio>
                      <Radio key='time' value={'time'}><FormattedMessage {...menusText.ImageTagByTime} /></Radio>
                      <Radio key='other' value={'other'}><FormattedMessage {...menusText.otherImage} /></Radio>
                    </RadioGroup>
                  </FormItem>
                  {
                    this.state.otherTag ? [
                      <QueueAnim>
                        <div key='otherTagAnimate'>
                          <FormItem style={{ width:'220px',float:'left' }}>
                            <Input {...otherImageTagProps} type='text' size='large' />
                          </FormItem>
                        </div>
                      </QueueAnim>
                    ] : null
                  }
                  <div style={{ clear:'both' }} />
                </div>
                <div style={{ clear:'both' }} />
              </div>
              <div className='commonBox'>
                <div className='title'>
                  <span><FormattedMessage {...menusText.buildCache} /></span>
                </div>
                <div className='input imageType'>
                  <FormItem>
                    <Switch {...getFieldProps('buildCache')} />
                  </FormItem>
                </div>
                <div style={{ clear:'both' }} />
              </div>
            </QueueAnim>
          ] : null
        }
      </Form>
      <div className='modalBtnBox'>
        <Button size='large' onClick={this.cancelChange}>
          <FormattedMessage {...menusText.cancel} />
        </Button>
        <Button size='large' type='primary' onClick={this.handleSubmit}>
          <FormattedMessage {...menusText.submit} />
        </Button>
      </div>
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

