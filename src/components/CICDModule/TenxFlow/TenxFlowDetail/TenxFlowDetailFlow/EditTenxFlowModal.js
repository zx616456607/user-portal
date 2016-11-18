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
import { updateTenxFlowState, getDockerfiles, setDockerfile } from '../../../../../actions/cicd_flow'
import './style/EditTenxFlowModal.less'
import EnvComponent from './CreateEnvComponent.js'
import CodeStoreListModal from './CodeStoreListModal.js'

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
    defaultMessage: '更新代码库',
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
    defaultMessage: '使用代码仓库中的 Dockerfile',
  },
  selectDockerFile: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.selectDockerFile',
    defaultMessage: '选择已有',
  },
  createNewDockerFile: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.createNewDockerFile',
    defaultMessage: '云端创建 Dockerfile',
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
  ImageStoreType: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageStoreType',
    defaultMessage: '仓库类型',
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
  },
  codeStore: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.codeStore',
    defaultMessage: '代码仓库',
  },
  branch: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.branch',
    defaultMessage: '分支：',
  },
  dockerFileTitle: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.dockerFileTitle',
    defaultMessage: '创建 Dockerfile',
  },
  noDockerFileInput: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.noDockerFileInput',
    defaultMessage: 'Dockerfile 不能为空',
  }
});

function fetchCodeStoreName(id, codeList) {
  //this function for fetcht code store name 
  let codeName = null;
  codeList.map((item) => {
    if(item.id == id) {
      codeName = item.name;
    }
  });
  return codeName;
}

let uuid = 0;
let shellUid = 0;
let EditTenxFlowModal = React.createClass({
  getInitialState: function() {
    return {
      otherFlowType: '3',
      useDockerfile: false,
      otherTag: false,
      envModalShow: null,
      ImageStoreType: false,
      currentCodeStore: null,
      currentCodeStoreName: null,
      currentCodeStoreBranch: null,
      dockerFileModalShow: false,
      dockerFileTextarea: null,
      noDockerfileInput: false
    }
  },
  componentDidMount() {
    uuid = 0;
    shellUid = 0;
    const _this = this;
    const { config, form, getDockerfiles, codeList, flowId, stageId } = this.props;
    let otherFlowType = config.metadata.type + '';
    let codeStoreName = fetchCodeStoreName(config.spec.project.id, codeList)
    if (config.spec.build && config.spec.build.dockerfileFrom == 2) {    
      let tempBody = {
        flowId: flowId,
        stageId: stageId
      }
      getDockerfiles(tempBody, {
        success: {
          func: (res) => {
            _this.setState({
              dockerFileTextarea: res.data.message.content
            })
          },
          isAsync: true
        }
      })
    }
    if(otherFlowType != '3') {
      this.setState({
        otherFlowType: false,
        useDockerfile: false,
        ImageStoreType: false,
        otherTag: false,
        currentCodeStore: config.spec.project.id,
        currentCodeStoreName: codeStoreName,
        currentCodeStoreBranch: config.spec.project.branch
      });
    } else {     
      let useDockerfile = (config.spec.build && config.spec.build.dockerfileFrom == 1) ? true : false;
      let ImageStoreType = (config.spec.build && config.spec.build.registryType == 3) ? true : false;
      let otherTag = (config.spec.build && config.spec.build.imageTagType == 3) ? true : false;
      this.setState({
        otherFlowType: otherFlowType,
        useDockerfile: useDockerfile,
        ImageStoreType: ImageStoreType,
        otherTag: otherTag,
        currentCodeStore: config.spec.project.id,
        currentCodeStoreName: codeStoreName,
        currentCodeStoreBranch: config.spec.project.branch
      });
    }
    let shellList = Boolean(config.spec.container.args) ? config.spec.container.args : [];
    if (shellList) {
        shellList.map((item, index) => {
        shellUid++;
        let keys = form.getFieldValue('shellCodes');
        keys = keys.concat(shellUid);
        form.setFieldsValue({
          'shellCodes': keys
        });
      });
    }
    let serviceList = Boolean(config.spec.container.dependencies) ? config.spec.container.dependencies : [];
    if (serviceList) {
      serviceList.map((item, index) => {
        uuid++;
        let keys = form.getFieldValue('services');
        keys = keys.concat(uuid);
        form.setFieldsValue({
          'services': keys
        });
      });
    }
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
  otherStoreUrlInput(rule, value, callback) {
    //this function for user selected other store and should be input the image store url
    if (this.state.ImageStoreType && !!!value) {
      callback([new Error('请输入自定义仓库地址')]);
    } else {
      callback();
    }
  },
  otherTagInput(rule, value, callback) {
    //this function for user selected customer the image tag and should be input the image tag
    if (this.state.otherTag && !!!value) {
      callback([new Error('请输入自定义镜像版本')]);
    } else {
      callback();
    }
  },
  flowTypeChange(e) {
    //this function for user change the tenxflow type
    if(e != '5') {
      this.props.form.resetFields(['otherFlowType']);
    }
    if(e != '3') {
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
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      'services':keys
    });
    if(keys.length == 0) {
      this.addService ()
    }
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
      'services': keys
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
  realImageInput (rule, value, callback) {
    //this function for user selected build image type
    //and when user submit the form, the function will check the real image input or not 
    if (this.state.otherFlowType == '3' && !!!value) {
      callback([new Error('请输入镜像名称')]);
    } else {
      callback();
    }
  },
  changeUseDockerFile (e) {
    //this function for user change using the Dockerfile or not
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
  changeImageStoreType (e) {
    //this function for user change image store type
    if( e.target.value == '3' ) {
      this.setState({
        ImageStoreType: true
      });
    } else {
      this.setState({
        ImageStoreType: false
      });
    }
  },
  changeImageTagType (e) {
    //this function for user change image tag type
    if( e.target.value == '3' ) {
      this.setState({
        otherTag: true
      });
    } else {
      this.setState({
        otherTag: false
      });
    }
  },
  openCodeStoreModal() {
    //this function for user select code store and user must be select code modal
    this.setState({
      codeStoreModalShow: true
    });
  },
  closeCodeStoreModal() {
    //this function for user select code store and user must be select code modal
    this.setState({
      codeStoreModalShow: false
    });
  },
  openDockerFileModal() {
    this.setState({
      dockerFileModalShow: true
    });
  },
  closeDockerFileModal() {
    this.setState({
      dockerFileModalShow: false
    });
  },
  onChangeDockerFileTextarea(e) {
    this.setState({
      dockerFileTextarea: e.target.value
    });
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
    const { scope, config, updateTenxFlowState, flowId, stageId, rootScope } = this.props;
    const { getTenxFlowStateList } = rootScope.props;
    const _this = this;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        e.preventDefault();
        return;
      }
      //get shell code
      let shellLength = values.shellCodes;
      let shellList = [];
      shellLength.map((item, index) => {
        if((index + 1) != shellLength.length) {
          if(!!values['shellCode' + item]) {            
            shellList.push(values['shellCode' + item]);
          }
        }
      });
      //get service code
      let serviceLength = values.services;
      let serviceList = [];
      serviceLength.map((item) => {
        let temp = {
          'service': values['serviceSelect' + item]
        }
        if(!!values['serviceSelect' + item]) {
          let tempLength = values['service' + item + 'inputs'];
          let tempList = [];
          if(tempLength == undefined) {
            tempList = config.spec.container.dependencies[item].env;            
          } else {            
            tempLength.map((littleItem, littleIndex) => {
              if((littleIndex + 1) != tempLength.length) {
                tempList.push(values['service' + item +'input' + littleItem]);
              }
            });
          }
          temp.env = tempList;
          serviceList.push(temp);
        }
      });
      let body = {
        'metadata': {
          'name': values.flowName,
          'type': parseInt(values.flowType), 
        },
        'spec': {
          'container': {
            'image': values.imageName,
            'args': shellList,
            'dependencies': serviceList
          },
          'project': {
            'id': _this.state.currentCodeStore,
            'branch': _this.state.currentCodeStoreBranch
        },
        }
      }
      //if user select the customer type (5), ths customType must be input
      if(values.flowType == '5') {
        body.metadata.customType = values.otherFlowType;
      }
      //if user select the image build type (3),the body will be add new body
      if(values.flowType == '3') {
        let dockerFileFrom = _this.state.useDockerfile ? 1 : 2;
        let imageBuildBody = {
          'DockerfileFrom': dockerFileFrom,
          'registryType': parseInt(values.imageType),
          'imageTagType': parseInt(values.imageTag),
          'noCache': values.buildCache,
          'image': values.imageRealName
        }
        if(this.state.otherTag) {
          imageBuildBody.customTag = values.otherTag;
        }
        if(this.state.ImageStoreType) {          
          imageBuildBody.customRegistry = values.otherStoreUrl;
        }
        if(this.state.useDockerfile) {
          let tmpDockerFileUrl = null;
          if(!!!values.dockerFileUrl) {
            tmpDockerFileUrl = '';
          } else {
            tmpDockerFileUrl = values.dockerFileUrl;
          }
          imageBuildBody.DockerfilePath = '/' + tmpDockerFileUrl;
        }
        body.spec.build = imageBuildBody;
      }
      updateTenxFlowState(flowId, stageId, body, {
        success: {
          func: () => {
            if(!_this.state.useDockerfile) {
              let dockerfilebody = {
                content: _this.state.dockerFileTextarea,
                flowId: flowId,
                stageId: stageId
              }
              setDockerfile(dockerfilebody, {
                success: {
                  func: () => {
                    getTenxFlowStateList(flowId)
                  },
                  isAsync: true
                }
              })
            }else{
              getTenxFlowStateList(flowId)              
            }
            rootScope.setState({
              currentFlowEdit: null
            });
            },
          isAsync: true
        }
      })
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { config, form, codeList } = this.props;
    const shellList = config.spec.container.args;
    const servicesList = config.spec.container.dependencies;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const scopeThis = this;
    getFieldProps('services', {
      initialValue: [0],
    });
    getFieldProps('shellCodes', {
      initialValue: [0],
    });
    const serviceItems = getFieldValue('services').map((k) => {
      let serviceDefault = !!servicesList[k] ? servicesList[k].service : null;
      let envDefault = !!servicesList[k] ? servicesList[k].env : [];
      const serviceSelect = getFieldProps(`serviceSelect${k}`, {
        rules: [
          { message: '请选择' },
        ],
        initialValue: serviceDefault,
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
            onCancel={this.closeEnvSettingModal}
          >
            <EnvComponent scope={scopeThis} config={envDefault} index={k} form={form} />
          </Modal>
        </div>
      </QueueAnim>
      )
    });
    const shellCodeItems = getFieldValue('shellCodes').map((i) => {
      let shellDefault = !!shellList[i] ? shellList[i] : ''
      const shellCodeProps = getFieldProps(`shellCode${i}`, {
        rules: [
          { message: '请输入脚本命令' },
        ],
        initialValue: shellDefault,
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
      initialValue: config.metadata.type + '',
    });
    const otherFlowTypeProps = getFieldProps('otherFlowType', {
      rules: [
        { message: '输入自定义项目类型' },
      ],
    });
    const imageRealNameProps = getFieldProps('imageRealName', {
      rules: [
        { message: '请输入镜像名称' },
        { validator: this.realImageInput },
      ],
      initialValue: (!!config.spec.build ? config.spec.build.image : null)
    });
    const imageNameProps = getFieldProps('imageName', {
      rules: [
        { required: true, message: '请输入基础镜像' },
        { validator: this.imageNameExists },       
      ],
      initialValue: config.spec.container.image
    });
    const flowNameProps = getFieldProps('flowName', {
      rules: [
        { required: true, message: '请输入项目名称' },
        { validator: this.flowNameExists },
      ],
      initialValue: config.metadata.name,
    });
    const dockerFileUrlProps = getFieldProps('dockerFileUrl', {
      rules: [
        { message: '请输入 Dockerfile 地址' },
      ],
      initialValue: (!!config.spec.build ? (config.spec.build.dockerfilePath == 1 ? config.spec.build.dockerfilePath.replace('/','') : null) : null)
    });
    const otherImageStoreTypeProps = getFieldProps('otherStoreUrl', {
      rules: [
        { message: '请输入自定义仓库地址' },
        { validator: this.otherStoreUrlInput },
      ],
      initialValue: (!!config.spec.build ? config.spec.build.customRegistry : null)
    });
    const otherImageTagProps = getFieldProps('otherTag', {
      rules: [
        { message: '请输入镜像版本' },
        { validator: this.otherTagInput },
      ],
      initialValue: (!!config.spec.build ? config.spec.build.customTag : null)
    });
    return (
      <div id='EditTenxFlowModal' key='EditTenxFlowModal'>
      <div className='titleBox'>
        <span><FormattedMessage {...menusText.titleEdit} /></span>
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
                <Option value='1'><FormattedMessage {...menusText.unitCheck} /></Option>
                <Option value='2'><FormattedMessage {...menusText.runningCode} /></Option>
                <Option value='3'><FormattedMessage {...menusText.buildImage} selected/></Option>
                <Option value='4'><FormattedMessage {...menusText.containCheck} /></Option>
                <Option value='5'><FormattedMessage {...menusText.other} /></Option>
              </Select>
            </FormItem>
            {
              this.state.otherFlowType == '5' ? [
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
            <span style={{ marginRight:'15px' }}>{this.state.currentCodeStoreName + '  ' + formatMessage(menusText.branch) + this.state.currentCodeStoreBranch}</span>
            <Button className='selectCodeBtn' size='large' type='ghost' onClick={this.openCodeStoreModal}>
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
          this.state.otherFlowType == '3' ? [
            <QueueAnim className='buildImageForm'>
              <div className='line'></div>
              <div className='commonBox' key='buildImageFormAnimate'>
                <div className='title'>
                  <span>Dockerfile</span>
                </div>
                <div className='input' style={{ height: '100px' }}>
                  <Checkbox onChange={this.changeUseDockerFile} checked={this.state.useDockerfile}></Checkbox>
                  <span><FormattedMessage {...menusText.dockerFileCreate} /></span>
                  {
                    this.state.useDockerfile ? [
                      <QueueAnim className='dockerFileInputAnimate' key='dockerFileInputAnimate'>
                        <div key='useDockerFileAnimateSecond'>
                          <Input className='dockerFileInput' {...dockerFileUrlProps} addonBefore='/' size='large' />
                        </div>
                      </QueueAnim>
                    ] : null
                  }
                  {
                    !this.state.useDockerfile ? [
                      <QueueAnim key='useDockerFileAnimate'>
                        <div key='useDockerFileAnimateSecond'>
                          {/*<Button type='ghost' size='large' style={{ marginRight:'20px' }}>
                            <FormattedMessage {...menusText.selectDockerFile} />
                          </Button>*/}
                          <Button className={ this.state.noDockerfileInput ? 'noCodeStoreButton' : null } type='ghost' size='large'
                            onClick={this.openDockerFileModal}>
                            <FormattedMessage {...menusText.createNewDockerFile} />
                          </Button>
                          <span className={ this.state.noDockerfileInput ? 'noCodeStoreSpan CodeStoreSpan' : 'CodeStoreSpan' }><FormattedMessage {...menusText.noDockerFileInput} /></span>
                        </div>
                      </QueueAnim>
                    ] : null
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
                  <div style={{ clear:'both' }} />
                </div>
                <div style={{ clear:'both' }} />
              </div>
              <div className='commonBox'>
                <div className='title'>
                  <span><FormattedMessage {...menusText.ImageStoreType} /></span>
                </div>
                <div className='input imageType'>
                  <FormItem style={{ float:'left' }}>
                    <RadioGroup {...getFieldProps('imageType', { initialValue: (!!config.spec.build ? (config.spec.build.registryType + '') : null), onChange: this.changeImageStoreType })}>
                      <Radio key='imageStore' value={'1'}><FormattedMessage {...menusText.imageStore} /></Radio>
                      <Radio key='DockerHub' value={'2'}>Docker Hub</Radio>
                      <Radio key='otherImage' value={'3'}><FormattedMessage {...menusText.otherImage} /></Radio>
                    </RadioGroup>
                  </FormItem>
                  {
                    this.state.ImageStoreType ? [
                      <QueueAnim key='otherImageStoreTypeAnimate'>
                        <div key='otherImageStoreType'>
                          <FormItem style={{ width:'220px',float:'left' }}>
                            <Input {...otherImageStoreTypeProps} type='text' size='large' />
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
                  <span><FormattedMessage {...menusText.imageRealName} /></span>
                </div>
                <div className='input'>
                  <FormItem style={{ float:'left' }}>
                    <RadioGroup {...getFieldProps('imageTag', { initialValue: (!!config.spec.build ? (config.spec.build.imageTagType + '') : null), onChange: this.changeImageTagType })}>
                      <Radio key='branch' value={'1'}><FormattedMessage {...menusText.ImageTagByBranch} /></Radio>
                      <Radio key='time' value={'2'}><FormattedMessage {...menusText.ImageTagByTime} /></Radio>
                      <Radio key='other' value={'3'}><FormattedMessage {...menusText.ImageTagByOther} /></Radio>
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
                    <Switch {...getFieldProps('buildCache')} defaultChecked={!!config.spec.build ? config.spec.build.noCache : false} />
                  </FormItem>
                </div>
                <div style={{ clear:'both' }} />
              </div>
            </QueueAnim>
          ] : null
        }
        <Modal className='tenxFlowDockerFileModal'
          title={<FormattedMessage {...menusText.dockerFileTitle} />}
          visible={this.state.dockerFileModalShow}
          onOk={this.closeDockerFileModal}
          onCancel={this.closeDockerFileModal}
        > 
          <Input type='textarea' value={this.state.dockerFileTextarea} onChange={this.onChangeDockerFileTextarea} autosize={{ minRows: 10, maxRows: 10 }} />
        </Modal>
      </Form>
      <div className='modalBtnBox'>
        <Button size='large' onClick={this.cancelChange}>
          <FormattedMessage {...menusText.cancel} />
        </Button>
        <Button size='large' type='primary' onClick={this.handleSubmit}>
          <FormattedMessage {...menusText.submit} />
        </Button>
      </div>
      <Modal className='tenxFlowCodeStoreModal'
        title={<FormattedMessage {...menusText.codeStore} />}
        visible={this.state.codeStoreModalShow}
        onOk={this.closeCodeStoreModal}
        onCancel={this.closeCodeStoreModal}
      >
        <CodeStoreListModal scope={scopeThis} config={codeList} hadSelected={this.state.currentCodeStore} />
      </Modal>
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
  updateTenxFlowState,
  getDockerfiles,
  setDockerfile
})(injectIntl(EditTenxFlowModal, {
  withRef: true,
}));

