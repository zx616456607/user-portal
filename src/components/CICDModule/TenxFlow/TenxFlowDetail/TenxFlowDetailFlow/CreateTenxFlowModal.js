/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateTenxFlowModal component
 *
 * v0.1 - 2016-11-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Switch, Radio, Checkbox, Icon, Select, Modal } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { createTenxFlowState, createDockerfile } from '../../../../../actions/cicd_flow'
import './style/CreateTenxFlowModal.less'
import EnvComponent from './EnvComponent.js'
import CreateImageEnvComponent from './CreateImageEnvComponent.js'
import CodeStoreListModal from './CodeStoreListModal.js'

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

const menusText = defineMessages({
  titleEdit: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.titleEdit',
    defaultMessage: '编辑项目卡片',
  },
  titleAdd: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.titleAdd',
    defaultMessage: '创建项目卡片',
  },
  unitCheck: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.unitCheck',
    defaultMessage: '单元测试',
  },
  containCheck: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.containCheck',
    defaultMessage: '集成测试',
  },
  podToPodCheck: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.podToPodCheck',
    defaultMessage: '端对端测试',
  },
  runningCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.runningCode',
    defaultMessage: '代码编译',
  },
  buildImage: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.buildImage',
    defaultMessage: '镜像构建',
  },
  other: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.other',
    defaultMessage: '自定义',
  },
  flowType: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.flowType',
    defaultMessage: '项目类型',
  },
  flowCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.flowCode',
    defaultMessage: '项目代码',
  },
  flowName: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.flowName',
    defaultMessage: '项目名称',
  },
  selectCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.selectCode',
    defaultMessage: '选择代码库',
  },
  imageName: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.imageName',
    defaultMessage: '基础镜像',
  },
  defineEnv: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.defineEnv',
    defaultMessage: '自定义环境变量',
  },
  servicesTitle: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.servicesTitle',
    defaultMessage: '常用服务',
  },
  addServices: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.addServices',
    defaultMessage: '继续添加',
  },
  shellCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.shellCode',
    defaultMessage: '脚本命令',
  },
  submit: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.submit',
    defaultMessage: '确定',
  },
  cancel: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.cancel',
    defaultMessage: '取消',
  },
  dockerFileCreate: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.dockerFileCreate',
    defaultMessage: '',
  },
  selectDockerFile: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.selectDockerFile',
    defaultMessage: '选择已有',
  },
  createNewDockerFile: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.createNewDockerFile',
    defaultMessage: '云端创建Dockerfile',
  },
  imageRealName: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.imageRealName',
    defaultMessage: '镜像名称',
  },
  imageStore: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.imageStore',
    defaultMessage: '镜像仓库',
  },
  otherImage: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.otherImage',
    defaultMessage: '自定义仓库',
  },
  ImageTag: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageTag',
    defaultMessage: '镜像版本',
  },
  ImageStoreType: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageStoreType',
    defaultMessage: '仓库类型',
  },
  ImageTagByBranch: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageTagByBranch',
    defaultMessage: '以代码分支名为tag',
  },
  ImageTagByTime: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageTagByTime',
    defaultMessage: '时间戳为tag',
  },
  ImageTagByOther: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.ImageTagByOther',
    defaultMessage: '自定义tag',
  },
  buildCache: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.buildCache',
    defaultMessage: '构建缓存',
  },
  envTitle: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.envTitle',
    defaultMessage: '自定义环境变量',
  },
  codeStore: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.codeStore',
    defaultMessage: '代码仓库',
  },
  noCodeStore: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.noCodeStore',
    defaultMessage: '请选择代码仓库',
  },
  branch: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.branch',
    defaultMessage: '分支：',
  },
  dockerFileTitle: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.dockerFileTitle',
    defaultMessage: '创建 Dockerfile',
  },
  noDockerFileInput: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.noDockerFileInput',
    defaultMessage: 'Dockerfile 不能为空',
  },
  deleteCode: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.deleteCode',
    defaultMessage: '清空',
  }
});

let uuid = 0;
let shellUid = 0;
let CreateTenxFlowModal = React.createClass({
  getInitialState: function() {
    return {
      otherFlowType: '3',
      useDockerfile: false,
      otherTag: false,
      envModalShow: null,
      ImageStoreType: false,
      codeStoreModalShow: false,
      currentCodeStore: null,
      currentCodeStoreName: null,
      noSelectedCodeStore: false,
      currentCodeStoreBranch: null,
      dockerFileModalShow: false,
      dockerFileTextarea: null,
      noDockerfileInput: false,
      ImageEnvModal: false,
      emptyImageEnv: false
    }
  },
  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
  },
  flowNameExists(rule, value, callback) {
    //this function for check the new tenxflow name is exist or not
    const { stageList } = this.props;
    if(stageList.length > 0) {      
      let flag = false;
      if (!value) {
        callback();
      } else {
        stageList.map((item) => {
          if(item.metadata.name == value) {
            flag = true;
            callback([new Error('项目名称已经存在了哦')]);
          }
        });
      }
      if(!flag) {
        callback();
      }
    } else {
      callback();
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
      this.props.form.resetFields(['imageRealName', 'dockerFileUrl', 'otherStoreUrl', 'otherTag', 'imageType', 'imageTag', 'buildCache']);
      this.setState({
        useDockerfile: false,
        otherTag: false,
        ImageStoreType: false
      });
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
    //this function for user change using the dockerfile or not
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
  deleteCodeStore() {
    //this function for user delete the code store
    this.setState({
      currentCodeStore: null,
      currentCodeStoreBranch: '',
      currentCodeStoreName: ''
    })
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
  openImageEnvModal() {
    this.setState({
      ImageEnvModal: true
    });
  },
  closeImageEnvModal() {
    this.setState({
      ImageEnvModal: false
    });
  },
  cancelChange(e) {
    //this function for reset the form and close the edit card
    e.preventDefault();
    e.stopPropagation();
    this.props.form.resetFields();
    const { scope } = this.props;
    this.setState({
      useDockerfile: false,
      otherTag: false,
      ImageStoreType: false
    });
    scope.closeCreateNewFlow();
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope, createTenxFlowState, flowId, stageInfo, createDockerfile } = this.props;
    const { getTenxFlowStateList } = scope.props;
    const _this = this;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        e.preventDefault();
        if (!Boolean(_this.state.dockerFileTextarea && !this.state.useDockerfile)) {
          _this.setState({
            noDockerfileInput: true
          });
        }
        return;
        //check image env list
        let imageEnvLength = values.imageEnvInputs;
        imageEnvLength.map((item, index) => {
          if(values['imageEnvName' + item] != '') {
            if(values['imageEnvValue' + item] == '') {
              _this.setState({
                emptyImageEnv: true
              });
            }
          }
        });
        return;
      }
      if (!Boolean(_this.state.dockerFileTextarea) && !this.state.useDockerfile) {
        _this.setState({
          noDockerfileInput: true
        });
        return;
      }
      //check image env list
      let imageEnvLength = values.imageEnvInputs;
      let imageEnvList = [];
      imageEnvLength.map((item, index) => {
        if(values['imageEnvName' + item] != '') {
          if(values['imageEnvValue' + item] == '') {
            _this.setState({
              emptyImageEnv: true
            });
          } else {
            let name = `${values['imageEnvName' + item]}`
            let tempEnv[name] = values['imageEnvValue' + item];
            console.log(tempEnv)
//          imageEnvList.push({tempEnv})
          }
        }
      });
      if(_this.state.emptyImageEnv) {
        return;
      }
      console.log(imageEnvList)
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
          tempLength.map((littleItem, littleIndex) => {
            if((littleIndex + 1) != tempLength.length) {
              tempList.push(values['service' + item +'input' + littleItem]);
            }
          });
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
            'id': this.state.currentCodeStore,
            'branch': this.state.currentCodeStoreBranch
        },
        }
      }
      //if user select the customer type (6), ths customType must be input
      if(values.flowType == '5') {
        body.metadata.customType = values.otherFlowType;
      }
      //if user select the image build type (5),the body will be add new body
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
      console.log(values)
      /*createTenxFlowState(flowId, body, {
        success: {
          func: (res) => {
            if(!_this.state.useDockerfile) {             
              let dockerfilebody = {
                content: _this.state.dockerFileTextarea,
                flowId: flowId,
                stageId: res.data.results.stageId
              }
              createDockerfile(dockerfilebody, {
                success: {
                  func: () => {
                    scope.closeCreateNewFlow();
                    getTenxFlowStateList(flowId)
                  },
                  isAsync: true
                }
              })
            }else{
              scope.closeCreateNewFlow();
              getTenxFlowStateList(flowId)
            }
          },
          isAsync: true
        }
      });*/
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { form, codeList, stageList, supportedDependencies } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const scopeThis = this;
    let serviceSelectList = supportedDependencies.map((item, index) => {
      return (
        <Option value={item} key={item + index}>{item}</Option>
      )
    });
    getFieldProps('services', {
      initialValue: [0],
    });
    getFieldProps('shellCodes', {
      initialValue: [0],
    });
    const serviceItems = getFieldValue('services').map((k) => {
      const serviceSelect = getFieldProps(`serviceSelect${k}`, {
        rules: [
          { message: '请选择' },
        ],
      });
      return (
      <QueueAnim key={'serviceName' + k + 'Animate'}>
        <div className='serviceDetail' key={'serviceName' + k}>
          <Form.Item className='commonItem'>
            <Select {...serviceSelect} style={{ width: '100px' }} >
              {serviceSelectList}
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
            <Input disabled={ scopeThis.state.otherFlowType == '3' ? true : false } onKeyUp={() => this.addShellCode(i) } {...shellCodeProps} type='text' size='large' />
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
      initialValue: '3',
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
    });
    const dockerFileUrlProps = getFieldProps('dockerFileUrl', {
      rules: [
        { message: '请输入 Dockerfile 地址' },
      ],
    });
    const otherImageStoreTypeProps = getFieldProps('otherStoreUrl', {
      rules: [
        { message: '请输入自定义仓库地址' },
        { validator: this.otherStoreUrlInput },
      ],
    });
    const otherImageTagProps = getFieldProps('otherTag', {
      rules: [
        { message: '请输入镜像版本' },
        { validator: this.otherTagInput },
      ],
    });
    return (
      <div id='CreateTenxFlowModal' key='CreateTenxFlowModal'>
      <div className='titleBox'>
        <span><FormattedMessage {...menusText.titleAdd} /></span>
        <Icon type='cross' onClick={this.cancelChange} />
      </div>
      <Form horizontal>
        <div className='commonBox' key='bigForm'>
          <div className='title'>
            <span><FormattedMessage {...menusText.flowType} /></span>
          </div>
          <div className='input flowType'>
            <FormItem className='flowTypeForm'>
              <Select {...flowTypeProps} style={{ width: 120 }}>
                <Option value='1'><FormattedMessage {...menusText.unitCheck} /></Option>
                <Option value='2'><FormattedMessage {...menusText.containCheck} /></Option>
                <Option value='3'><FormattedMessage {...menusText.buildImage} /></Option>
                <Option value='4'><FormattedMessage {...menusText.runningCode} /></Option>
                <Option value='5'><FormattedMessage {...menusText.other} /></Option>
              </Select>
            </FormItem>
            {
              this.state.otherFlowType == '5' ? [
                <QueueAnim key='otherFlowTypeInput' className='otherFlowTypeInput'>
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
            { !!this.state.currentCodeStoreName ? [
                <span style={{ marginRight:'15px' }}>{this.state.currentCodeStoreName + '  ' + formatMessage(menusText.branch) + this.state.currentCodeStoreBranch}</span>
                ] : null }
            <Button className={ this.state.noSelectedCodeStore ? 'noCodeStoreButton selectCodeBtn' : 'selectCodeBtn'} size='large' type='ghost' onClick={this.openCodeStoreModal}>
              <i className='fa fa-file-code-o' />
              <FormattedMessage {...menusText.selectCode} />
            </Button>
            <Button type='ghost' size='large' style={{ marginLeft: '15px' }} onClick={this.deleteCodeStore}>
              <i className='fa fa-trash' />&nbsp;
              <FormattedMessage {...menusText.deleteCode} />
            </Button>
            <span className={ this.state.noSelectedCodeStore ? 'noCodeStoreSpan CodeStoreSpan' : 'CodeStoreSpan' }><FormattedMessage {...menusText.noCodeStore} /></span>
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
          <div className='imageName input'>
            <FormItem
              hasFeedback
              help={isFieldValidating('imageName') ? '校验中...' : (getFieldError('imageName') || []).join(', ')}
              style={{ width:'220px', float: 'left' }}
            >
              <Input {...imageNameProps} type='text' size='large' />
            </FormItem>
            <span className={ this.state.emptyImageEnv ? 'emptyImageEnv defineEnvBtn' : 'defineEnvBtn'} onClick={this.openImageEnvModal}><FormattedMessage {...menusText.defineEnv} /></span>
            <div style={{ clear:'both' }} />
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
            <QueueAnim className='buildImageForm' key='buildImageForm'>
              <div className='line'></div>
              <div className='commonBox' key='buildImageFormAnimate'>
                <div className='title'>
                  <span>Dockerfile</span>
                </div>
                <div className='input' style={{ height: '100px' }}>
                  <div className='operaBox' style={{ float: 'left', width: '500px' }}>
                    <Checkbox onChange={this.changeUseDockerFile}></Checkbox>
                    <span><FormattedMessage {...menusText.dockerFileCreate} /></span>
                  </div>
                  <QueueAnim className='dockerFileInputAnimate' key='dockerFileInputAnimate'>
                    <div key='useDockerFileAnimateFirst'>
                      <Input className='dockerFileInput' {...dockerFileUrlProps} addonBefore='/' size='large' />
                    </div>
                  </QueueAnim>
                  {
                    !this.state.useDockerfile ? [
                      <QueueAnim key='useDockerFileAnimate' style={{ float: 'left' }}>
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
                    <RadioGroup {...getFieldProps('imageType', { initialValue: '1', onChange: this.changeImageStoreType })}>
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
                  <span><FormattedMessage {...menusText.ImageTag} /></span>
                </div>
                <div className='input'>
                  <FormItem style={{ float:'left' }}>
                    <RadioGroup {...getFieldProps('imageTag', { initialValue: '1', onChange: this.changeImageTagType })}>
                      <Radio key='branch' value={'1'}><FormattedMessage {...menusText.ImageTagByBranch} /></Radio>
                      <Radio key='time' value={'2'}><FormattedMessage {...menusText.ImageTagByTime} /></Radio>
                      <Radio key='other' value={'3'}><FormattedMessage {...menusText.ImageTagByOther} /></Radio>
                    </RadioGroup>
                  </FormItem>
                  {
                    this.state.otherTag ? [
                      <QueueAnim key='otherTagAnimateBox'>
                        <div key='otherTagAnimate'>
                          <FormItem style={{ width:'200px',float:'left' }}>
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
                    <Switch {...getFieldProps('buildCache', { initialValue: false })} />
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
        <Modal className='tenxFlowImageEnvModal'
          title={<FormattedMessage {...menusText.envTitle} />}
          visible={this.state.ImageEnvModal}
          onOk={this.closeImageEnvModal}
          onCancel={this.closeImageEnvModal}
        >
          <CreateImageEnvComponent scope={scopeThis} form={form} />
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

CreateTenxFlowModal = createForm()(CreateTenxFlowModal);

CreateTenxFlowModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  createTenxFlowState,
  createDockerfile
})(injectIntl(CreateTenxFlowModal, {
  withRef: true,
}));

