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
import { Button, Input, Form, Switch, Radio, Checkbox, Icon, Select, Modal, Tooltip } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { appNameCheck } from '../../../../../common/naming_validation'
import DockerFileEditor from '../../../../Editor/DockerFile'
import { createTenxFlowState, createDockerfile } from '../../../../../actions/cicd_flow'
import './style/CreateTenxFlowModal.less'
import EnvComponent from './EnvComponent.js'
import CreateImageEnvComponent from './CreateImageEnvComponent.js'
import CodeStoreListModal from './CodeStoreListModal.js'
import NotificationHandler from '../../../../../common/notification_handler'

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

const defaultOptions = {
  readOnly: false
}

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
    defaultMessage: '依赖服务',
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
    defaultMessage: '使用云端 Dockerfile',
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
  },
  emptyImageEnv: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.emptyImageEnv',
    defaultMessage: '环境变量值不能为空',
  }
});

function emptyServiceEnvCheck(errorList, item) {
  //this function for show which env list of services is error
  let errorFlag = false;
  errorList.map((errorDetail) => {
    if (errorDetail == item) {
      errorFlag = true;
    }
  });
  return errorFlag;
}

let uuid = 0;
let shellUid = 0;
let CreateTenxFlowModal = React.createClass({
  getInitialState: function () {
    return {
      otherFlowType: 3,
      useDockerfile: true,
      otherTag: false,
      envModalShow: null,
      ImageStoreType: false,
      codeStoreModalShow: false,
      currentCodeStore: null,
      currentCodeStoreName: null,
      noSelectedCodeStore: false,
      currentCodeStoreBranch: null,
      dockerFileModalShow: false,
      dockerFileTextarea: '',
      noDockerfileInput: false,
      ImageEnvModal: false,
      emptyImageEnv: false,
      emptyServiceEnv: [],
      baseImage: [],
      showOtherImage: false
    }
  },
  componentWillMount() {
    // const self = this
    // const {getAvailableImage} = this.props
    // getAvailableImage()
  },
  flowNameExists(rule, value, callback) {
    //this function for check the new tenxflow name is exist or not
    const { stageList } = this.props;
    let errorMsg = appNameCheck(value, '项目名称')
    if(errorMsg == 'success') {
      let flag = false;
      if (stageList.length > 0) {
        stageList.map((item) => {
          if (item.metadata.name == value) {
            flag = true;
            errorMsg = appNameCheck(value, '项目名称', true);
            callback([new Error(errorMsg)]);
          }
        });
      }
      if (!flag) {
        callback();
      }
    } else {
      callback([new Error(errorMsg)]);
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
    const ins = e.split('@')[1]
    this.props.form.resetFields(['otherFlowType', 'imageNameProps']);
    if (ins != 3) {
      this.props.form.resetFields(['imageRealName', 'dockerFileUrl', 'otherStoreUrl', 'otherTag', 'imageType', 'imageTag', 'buildCache']);
      this.setState({
        useDockerfile: false,
        otherTag: false,
        ImageStoreType: false
      });
    } else {
      this.setState({
        useDockerfile: true,
        otherTag: false,
        ImageStoreType: false
      });
    }
    // Clean the command entries
    this.props.form.setFieldsValue({ 'shellCodes': [0] });
    this.props.form.setFieldsValue({ 'shellCode0': '' });
    if (this.props.config && this.props.config.spec && this.props.config.spec.container) {
      this.props.config.spec.container.args = {}
    }
    this.setState({
      otherFlowType: ins
    })
  },
  removeService(k) {
    //the function for user remove the service select box
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('services');
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      'services': keys
    });
    if (keys.length == 0) {
      this.addService()
    }
  },
  addService() {
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
  openEnvSettingModal(index) {
    //this function for user open the modal of setting the service env
    this.setState({
      envModalShow: index
    });
  },
  closeEnvSettingModal() {
    //this function for user close the modal of setting the service env
    this.setState({
      envModalShow: null
    });
  },
  removeShellCode(k) {
    //the function for user remove the shell code box
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('shellCodes');
    if (keys.length == 1) {
      return;
    }
    keys = keys.filter((key) => {
      return key !== k;
    });
    // can use data-binding to set
    form.setFieldsValue({
      'shellCodes': keys
    });
  },
  addShellCode(index) {
    //this function for user add an new box of shell code
    //there are no button for user click
    //when user input words, after user key up would triger the function
    const { form } = this.props;
    let inputValue = form.getFieldValue('shellCode' + index);
    let changed = false
    let keys = form.getFieldValue('shellCodes');
    let max = keys[keys.length - 1]
    if (index == max && !!inputValue) {
      // shellUid++;
      changed = true
      // can use data-binding to get
      keys = keys.concat(max + 1);
      // can use data-binding to set
      // important! notify form to detect changes
    }
    if (index == max - 1 && !inputValue) {
      let nextInputValue = form.getFieldValue('shellCode' + index + 1);
      if (!nextInputValue) {
        // shellUid--;
        changed = true
        keys.pop()
      }
    }
    if (changed) {
      form.setFieldsValue({
        'shellCodes': keys
      });
    }
  },
  realImageInput(rule, value, callback) {
    //this function for user selected build image type
    //and when user submit the form, the function will check the real image input or not
    if (this.state.otherFlowType == 3) {
      let errorMsg = appNameCheck(value, '镜像名称')
      if(errorMsg == 'success') {
        callback()
      } else {
        callback([new Error(errorMsg)]);
      }
    } else {
      callback()
    }
  },
  changeUseDockerFile(e) {
    //this function for user change using the dockerfile or not
    if (e.target.value) {
      this.setState({
        useDockerfile: true
      });
    } else {
      this.setState({
        useDockerfile: false
      });
    }
  },
  changeImageStoreType(e) {
    //this function for user change image store type
    if (e.target.value == 3) {
      if(this.props.otherImage.length <= 0) {
        this.setState({
          addOtherImage: true
        })
        return
      }
      this.setState({
        ImageStoreType: true,
        showOtherImage: true
      });
    } else {
      const { form } = this.props
      const { resetFields } = form
      resetFields(['otherImage'])
      this.setState({
        ImageStoreType: false,
        showOtherImage: false
      });
    }
  },
  changeImageTagType(e) {
    //this function for user change image tag type
    if (e.target.value == 3) {
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
      dockerFileTextarea: e
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
        let invalidDockerfile = Boolean(!_this.state.dockerFileTextarea && !_this.state.useDockerfile && this.state.otherFlowType == 3);
        _this.setState({
          noDockerfileInput: invalidDockerfile
        });
        if (invalidDockerfile) {
          errorFlag = true;
        }
        //check image env list
        let imageEnvLength = values.imageEnvInputs || [];
        imageEnvLength.map((item, index) => {
          if (values['imageEnvName' + item] != '') {
            if (values['imageEnvValue' + item] == '') {
              _this.setState({
                emptyImageEnv: true
              });
            }
          }
        });
        //check service code
        let serviceLength = values.services;
        let emptyServiceEnv = _this.state.emptyServiceEnv;
        serviceLength.map((item) => {
          let temp = {
            'service': values['serviceSelect' + item]
          }
          if (!!values['serviceSelect' + item]) {
            let tempLength = values['service' + item + 'inputs'] || [];
            let tempList = [];
            //this flag for service detail env list check the value input or not
            let emptyFlag = false;
            tempLength.map((littleItem) => {
              if (values['service' + item + 'inputName' + littleItem] != '') {
                if (values['service' + item + 'inputValue' + littleItem] == '') {
                  //if user didn't input value but input the key name
                  //the error list will be add the services num
                  if (emptyServiceEnv.indexOf(item) == -1) {
                    emptyServiceEnv.push(item);
                  }
                }
              }
            });
          }
        });
        _this.setState({
          emptyServiceEnv: emptyServiceEnv
        })
        return;
      }
      //this flag for all form error flag
      let errorFlag = false;
      let invalidDockerfile = Boolean(!_this.state.dockerFileTextarea && !_this.state.useDockerfile && this.state.otherFlowType == 3);
      _this.setState({
        noDockerfileInput: invalidDockerfile
      });
      if (invalidDockerfile) {
        errorFlag = true;
      }
      //get service code
      let serviceLength = values.services;
      let serviceList = [];
      //due to the setState is not async
      //so in the function we get it for cache and do all change in this cache
      //and when the service check end, we setState change the state
      let emptyServiceEnv = _this.state.emptyServiceEnv;
      serviceLength.map((item) => {
        let temp = {
          'service': values['serviceSelect' + item]
        }
        if (!!values['serviceSelect' + item]) {
          let tempLength = values['service' + item + 'inputs'] || [];
          let tempList = [];
          //this flag for service detail env list check the value input or not
          let emptyFlag = false;
          tempLength.map((littleItem) => {
            if (values['service' + item + 'inputName' + littleItem] != '') {
              if (values['service' + item + 'inputValue' + littleItem] == '') {
                //if user didn't input value but input the key name
                //the error list will be add the services num
                if (emptyServiceEnv.indexOf(item) == -1) {
                  emptyServiceEnv.push(item);
                }
                errorFlag = true;
                emptyFlag = true;
              } else {
                let tempBody = {
                  name: values['service' + item + 'inputName' + littleItem],
                  value: values['service' + item + 'inputValue' + littleItem]
                }
                tempList.push(tempBody);
              }
            }
          });
          if (!emptyFlag) {
            emptyServiceEnv = emptyServiceEnv.filter((key) => {
              return key !== item;
            });
          }
          temp.env = tempList;
          serviceList.push(temp);
        }
      });
      _this.setState({
        emptyServiceEnv: emptyServiceEnv
      })
      //check image env list
      let imageEnvLength = values.imageEnvInputs || [];
      let imageEnvList = [];
      let imageEnvFlag = false;
      imageEnvLength.map((item, index) => {
        if (values['imageEnvName' + item] != '') {
          if (values['imageEnvValue' + item] == '') {
            _this.setState({
              emptyImageEnv: true
            });
            errorFlag = true;
            imageEnvFlag = true;
          } else {
            let tempBody = {
              name: values['imageEnvName' + item],
              value: values['imageEnvValue' + item]
            }
            imageEnvList.push(tempBody)
          }
        }
      });
      if (!imageEnvFlag) {
        _this.setState({
          emptyImageEnv: false
        });
      }
      if (errorFlag) {
        return;
      }
      //get shell code
      let shellLength = values.shellCodes;
      let shellList = [];
      shellLength.map((item, index) => {
        if (!!values['shellCode' + item]) {
          shellList.push(values['shellCode' + item]);
        }
      });
      let body = {
        'metadata': {
          'name': values.flowName,
          'type': parseInt(this.state.otherFlowType),
        },
        'spec': {
          'container': {
            'image': values.imageName,
            'args': shellList,
            'env': imageEnvList,
            'dependencies': serviceList
          },
          'project': {
            'id': this.state.currentCodeStore,
            'branch': this.state.currentCodeStoreBranch
          },
        }
      }
      //if user select the customer type (6), ths customType must be input
      if (this.state.otherFlowType == 5) {
        body.metadata.customType = values.otherFlowType;
      }
      //if user select the image build type (5),the body will be add new body
      if (this.state.otherFlowType == 3) {
        let dockerFileFrom = _this.state.useDockerfile ? 1 : 2;
        let imageBuildBody = {
          'DockerfileFrom': dockerFileFrom,
          'registryType': parseInt(values.imageType),
          'imageTagType': parseInt(values.imageTag),
          'noCache': values.buildCache,
          'image': values.imageRealName
        }
        if(imageBuildBody.registryType == 3) {
          imageBuildBody.customRegistry = values.otherImage
        }
        if (this.state.otherTag) {
          imageBuildBody.customTag = values.otherTag;
        }
        // if (this.state.ImageStoreType) {
        //   imageBuildBody.customRegistry = values.otherStoreUrl;
        // }
        let tmpDockerFileUrl = null;
        if (!!!values.dockerFileUrl) {
          tmpDockerFileUrl = '';
        } else {
          tmpDockerFileUrl = values.dockerFileUrl;
        }
        let tempDockerFileList = tmpDockerFileUrl.split('/');
        tmpDockerFileUrl = tempDockerFileList.slice(0, tempDockerFileList.length -1).join('/');
        imageBuildBody.DockerfileName = tempDockerFileList[tempDockerFileList.length -1].length > 0 ? tempDockerFileList[tempDockerFileList.length -1] : 'Dockerfile';
        if (tmpDockerFileUrl.indexOf('/') != 0) {
          imageBuildBody.DockerfilePath = '/' + tmpDockerFileUrl;
        } else {
          imageBuildBody.DockerfilePath = tmpDockerFileUrl;
        }
        body.spec.build = imageBuildBody;
      }
      let notification = new NotificationHandler()
      createTenxFlowState(flowId, body, {
        success: {
          func: (res) => {
            if (!_this.state.useDockerfile && _this.state.otherFlowType == 3) {
              let dockerfilebody = {
                content: _this.state.dockerFileTextarea,
                flowId: flowId,
                stageId: res.data.results.stageId
              }
              createDockerfile(dockerfilebody, {
                success: {
                  func: () => {
                    scope.closeCreateNewFlow();
                    getTenxFlowStateList(flowId, {
                      success: {
                        func: (results) => {
                           _this.handWebSocket(scope, results)
                        }
                      }
                    })
                  },
                  isAsync: true
                }
              })
            } else {
              scope.closeCreateNewFlow();
              getTenxFlowStateList(flowId, {
                success: {
                  func: (results) => {
                    _this.handWebSocket(scope, results)
                  }
                }
              })
            }
            notification.success('创建成功');
          },
          isAsync: true
        }
      });
    });
  },
  handWebSocket(scope, res){
    let buildingList = []
    res.data.results.map((item) => {
      let buildId = null;
      if (!Boolean(item.lastBuildStatus)) {
        buildId = null;
      } else {
        buildId = item.lastBuildStatus.buildId;
      }
      let buildItem = {
        buildId: buildId,
        stageId: item.metadata.id
      }
      if (item.lastBuildStatus) {
        buildItem.status = item.lastBuildStatus.status
      }
      buildingList.push(buildItem)
    })
    scope.onSetup(scope.state.socket, buildingList)
  },
  getOtherImage() {
    return this.props.otherImage.map(item => {
      return <Option value={item.id}>{item.title}</Option>
    })
  },
  addOtherImage(){
    this.setState({
      addOtherImage: false
    })
    browserHistory.push('/app_center')
  },
  cancelModal() {
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      imageType: '1'
    })
    this.setState({
      addOtherImage: false
    })
  },
  validOtherImage(rule, value, callback){
    console.log(value)
    if(!this.state.showOtherImage) return callback()
    if(!value) {
      return callback(new Error('请选择镜像仓库'))
    }
    return callback()
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { form, codeList, stageList, supportedDependencies, imageList} = this.props;
    const { getFieldProps, getFieldError, isFieldValidating, getFieldValue } = this.props.form;
    const scopeThis = this;
    if (imageList === undefined || imageList.length === 0) {
      return (<div></div>)
    }
    let intFlowTypeIndex = this.state.otherFlowType - 1
    let buildImages = []
    let dependenciesImages = []
    imageList.forEach(function (image) {
      if (image.imageList[0].categoryId > 100) {
        dependenciesImages.push(image)
      } else {
        buildImages.push(image)
      }
    })
    let serviceSelectList = dependenciesImages[0].imageList.map((item, index) => {
      return (
        <Option value={item.imageName} key={index}>{item.imageName}</Option>
      )
    });
    const selectImage = buildImages.map((list, index) => {
      return (
        <Option key={list.title} value={list.title + `@` + (index + 1)}>{list.title}</Option>
      )
    })
    this.state.baseImage = buildImages[intFlowTypeIndex].imageList
    const baseImage = this.state.baseImage.map(list => {
      return (
        <Option key={list.imageName}>{list.imageName}</Option>
      )
    })
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
              <Select {...serviceSelect} style={{ width: '220px' }} >
                {serviceSelectList}
              </Select>
              <span className={emptyServiceEnvCheck(scopeThis.state.emptyServiceEnv, k) ? 'emptyImageEnv defineEnvBtn' : 'defineEnvBtn'}
                onClick={() => this.openEnvSettingModal(k)}>
                <FormattedMessage {...menusText.defineEnv} />
              </span>
              {emptyServiceEnvCheck(scopeThis.state.emptyServiceEnv, k) ? [<span className='emptyImageEnvError'><FormattedMessage {...menusText.emptyImageEnv} /></span>] : null}
              <Icon type='delete' onClick={() => this.removeService(k)} />
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
    const scodes = getFieldValue('shellCodes')
    const shellCodeItems = scodes.map((i) => {
      const shellCodeProps = getFieldProps(`shellCode${i}`, {
        rules: [
          { message: '请输入脚本命令' },
        ],
      });
      return (
        <QueueAnim key={'shellCode' + i + 'Animate'}>
          <div className='serviceDetail' key={'shellCode' + i}>
            <FormItem className='serviceForm'>
              <Input disabled={scopeThis.state.otherFlowType == 3 ? true : false} onKeyUp={() => this.addShellCode(i)} {...shellCodeProps} type='text' size='large' />
              {scopeThis.state.otherFlowType == 3 || scodes.length == 1 ? null : [
                <Icon type='delete' onClick={() => this.removeShellCode(i)} />
              ]}
            </FormItem>
            <div style={{ clera: 'both' }}></div>
          </div>
        </QueueAnim>
      )
    });

    const flowTypeProps = getFieldProps('flowType', {
      rules: [
        { required: true, message: '请选择项目类型' },
      ],
      onChange: this.flowTypeChange,
      initialValue: buildImages[intFlowTypeIndex].title,
    });

    const imageRealNameProps = getFieldProps('imageRealName', {
      rules: [
        { message: '请输入镜像名称' },
        { validator: this.realImageInput },
      ],
    });
    const imageNameProps = getFieldProps('imageName', {
      rules: [
        { required: true, message: '请选择基础镜像' }
      ],
      initialValue: buildImages[intFlowTypeIndex].imageList[0].imageName
    });
    const flowNameProps = getFieldProps('flowName', {
      rules: [
        { message: '请输入项目名称' },
        { validator: this.flowNameExists },
      ],
    });
    const dockerFileUrlProps = getFieldProps('dockerFileUrl', {
      rules: [
        { message: '请输入 Dockerfile 地址' },
      ],
      initialValue: 'Dockerfile',
    });
    const dockerFileNameProps = getFieldProps('dockerFileName', {
      rules: [
        { message: '请输入 Dockerfile 名称' },
      ],
      initialValue: '',
    });
    let validOtherImage
    if (this.state.showOtherImage) {
      validOtherImage = getFieldProps('otherImage', {
        rules: [
          { message: '请选择镜像仓库' },
          { validator: this.validOtherImage },
        ],
      });
    } else {
      validOtherImage = getFieldProps('otherImage', { rules: []})
    }
    // const otherImageStoreTypeProps = getFieldProps('otherStoreUrl', {
    //   rules: [
    //     { message: '请输入自定义仓库地址' },
    //     { validator: this.otherStoreUrlInput },
    //   ],
    // });
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
                  {selectImage}
                </Select>
              </FormItem>
            </div>
            <div style={{ clear: 'both' }} />
          </div>
          <div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.flowCode} /></span>
            </div>
            <div className='input'>
              {!!this.state.currentCodeStoreName ? [
                <span style={{ marginRight: '15px' }}>{this.state.currentCodeStoreName + '  ' + (this.state.currentCodeStoreBranch ? formatMessage(menusText.branch) + this.state.currentCodeStoreBranch : '')}</span>
              ] : null}
              <Button className={this.state.noSelectedCodeStore ? 'noCodeStoreButton selectCodeBtn' : 'selectCodeBtn'} size='large' type='ghost' onClick={this.openCodeStoreModal}>
                <svg className='codeSvg'>
                  <use xlinkHref='#cicdreflash' />
                </svg>
                {!!this.state.currentCodeStoreName ? [<span>更新代码库</span>] : [<FormattedMessage {...menusText.selectCode} />]}
              </Button>
              {!!this.state.currentCodeStoreName ? [
                <Button key='deleteCodeBtn' type='ghost' size='large' style={{ marginLeft: '15px' }} onClick={this.deleteCodeStore}>
                  <Icon type='delete' style={{ marginRight: '7px' }} />
                  <FormattedMessage {...menusText.deleteCode} />
                </Button>
                ] : null}
              <span className={this.state.noSelectedCodeStore ? 'noCodeStoreSpan CodeStoreSpan' : 'CodeStoreSpan'}><FormattedMessage {...menusText.noCodeStore} /></span>
            </div>
            <div style={{ clear: 'both' }} />
          </div>
          <div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.flowName} /></span>
            </div>
            <div className='input'>
              <FormItem
                hasFeedback
                help={isFieldValidating('flowName') ? '校验中...' : (getFieldError('flowName') || []).join(', ')}
                style={{ width: '220px' }}
                >
                <Input {...flowNameProps} type='text' size='large' />
              </FormItem>
            </div>
            <div style={{ clear: 'both' }} />
          </div>
          <div className='line'></div>
          <div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.imageName} /></span>
            </div>
            <div className='imageName input'>
              <FormItem style={{ width: '220px', float: 'left' }}>
                <Select {...imageNameProps}>
                  {baseImage}
                </Select>
              </FormItem>
              <span className={this.state.emptyImageEnv ? 'emptyImageEnv defineEnvBtn' : 'defineEnvBtn'} onClick={this.openImageEnvModal}><FormattedMessage {...menusText.defineEnv} /></span>
              {this.state.emptyImageEnv ? [<span className='emptyImageEnvError'><FormattedMessage {...menusText.emptyImageEnv} /></span>] : null}
              <div style={{ clear: 'both' }} />
            </div>
            <div style={{ clear: 'both' }} />
          </div>
          <div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.servicesTitle} /></span>
            </div>
            <div className='input services'>
              {serviceItems}
              {/*<div className='addServicesBtn' onClick={this.addService}>
                <Icon type='plus-circle-o' />
                <FormattedMessage {...menusText.addServices} />
              </div>*/}
            </div>
            <div style={{ clear: 'both' }} />
          </div>
          <div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.shellCode} /></span>
            </div>
            <div className='input shellCode'>
              {shellCodeItems}
            </div>
            <div style={{ clear: 'both' }} />
          </div>
          {
            this.state.otherFlowType == 3 ? [
              <QueueAnim className='buildImageForm' key='buildImageForm'>
                <div className='line'></div>
                <div className='commonBox' key='buildImageFormAnimate'>
                  <div className='title'>
                    <span>Dockerfile</span>
                  </div>
                  <div className='input' style={{ height: '100px' }}>
                    <div className='operaBox' style={{ float: 'left', width: '500px' }}>
                      <RadioGroup onChange={this.changeUseDockerFile} value={this.state.useDockerfile}>
                        <Radio key='codeStore' value={true}>
                          <span>使用代码仓库中的 Dockerfile</span>
                          <Tooltip title='请输入Dockerfile在代码仓库内的路径，其中 / 代表代码仓库的当前路径'>
                            <Icon className='dockerIcon' type='question-circle-o' style={{ marginLeft: '10px', cursor: 'pointer' }} />
                          </Tooltip>
                        </Radio>
                        <Radio key='create' value={false}>使用云端创建 Dockerfile</Radio>
                      </RadioGroup>
                    </div>                   
                    {
                      !this.state.useDockerfile ? [
                        <QueueAnim key='useDockerFileAnimate' style={{ float: 'left' }}>
                          <div key='useDockerFileAnimateSecond'>
                            <Button className={this.state.noDockerfileInput ? 'noCodeStoreButton' : null} type={this.state.dockerFileTextarea.length > 0 ? 'primary' : 'ghost'} size='large'
                              onClick={this.openDockerFileModal}>
                              {this.state.dockerFileTextarea.length > 0 ? [<span>编辑云端 Dockerfile</span>] : [<FormattedMessage {...menusText.createNewDockerFile} />]}
                            </Button>
                            <span className={this.state.noDockerfileInput ? 'noCodeStoreSpan CodeStoreSpan' : 'CodeStoreSpan'}><FormattedMessage {...menusText.noDockerFileInput} /></span>
                          </div>
                        </QueueAnim>
                      ] : [
                      <QueueAnim className='dockerFileInputAnimate' key='dockerFileInputAnimate'>
                        <div key='useDockerFileAnimateFirst'>
                          <Input className='dockerFileInput' {...dockerFileUrlProps} addonBefore='/' size='large' />
                        </div>
                      </QueueAnim>
                      ]
                    }
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
                <div className='commonBox'>
                  <div className='title'>
                    <span><FormattedMessage {...menusText.imageRealName} /></span>
                  </div>
                  <div className='input imageType'>
                    <FormItem hasFeedback style={{ width: '220px', float: 'left', marginRight: '20px' }}>
                      <Input {...imageRealNameProps} type='text' size='large' />
                    </FormItem>
                    <div style={{ clear: 'both' }} />
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
                <div className='commonBox'>
                  <div className='title'>
                    <span><FormattedMessage {...menusText.ImageStoreType} /></span>
                  </div>
                  <div className='input imageType'>
                    <FormItem style={{ float: 'left' }}>
                      <RadioGroup {...getFieldProps('imageType', { initialValue: '1', onChange: this.changeImageStoreType }) }>
                        <Radio key='imageStore' value={'1'}><FormattedMessage {...menusText.imageStore} /></Radio>
                        <Radio key='DockerHub' value={'2'} disabled>Docker Hub</Radio>
                        <Radio key='otherImage' value={'3'}><FormattedMessage {...menusText.otherImage} /></Radio>
                      </RadioGroup>
                    </FormItem>
                    <FormItem style={{ float: 'left', width:'120px' }}>
                      <Select {...validOtherImage} style={{display: this.state.showOtherImage ? 'inline-block' : 'none'}}>
                        {this.getOtherImage()}
                      </Select>
                    </FormItem>
                    {/*
                      this.state.ImageStoreType ? [
                        <QueueAnim key='otherImageStoreTypeAnimate'>
                          <div key='otherImageStoreType'>
                            <FormItem style={{ width: '220px', float: 'left' }}>
                              <Input {...otherImageStoreTypeProps} type='text' size='large' />
                            </FormItem>
                          </div>
                        </QueueAnim>
                      ] : null
                    */}
                    <div style={{ clear: 'both' }} />
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
                <div className='commonBox'>
                  <div className='title'>
                    <span><FormattedMessage {...menusText.ImageTag} /></span>
                  </div>
                  <div className='input'>
                    <FormItem style={{ float: 'left' }}>
                      <RadioGroup {...getFieldProps('imageTag', { initialValue: '1', onChange: this.changeImageTagType }) }>
                        <Radio key='branch' value={'1'}><FormattedMessage {...menusText.ImageTagByBranch} /></Radio>
                        <Radio key='time' value={'2'}><FormattedMessage {...menusText.ImageTagByTime} /></Radio>
                        <Radio key='other' value={'3'}><FormattedMessage {...menusText.ImageTagByOther} /></Radio>
                      </RadioGroup>
                    </FormItem>
                    {
                      this.state.otherTag ? [
                        <QueueAnim key='otherTagAnimateBox'>
                          <div key='otherTagAnimate'>
                            <FormItem style={{ width: '200px', float: 'left' }}>
                              <Input {...otherImageTagProps} type='text' size='large' />
                            </FormItem>
                          </div>
                        </QueueAnim>
                      ] : null
                    }
                    <div style={{ clear: 'both' }} />
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
                <div className='commonBox'>
                  <div className='title'>
                    <span><FormattedMessage {...menusText.buildCache} /></span>
                  </div>
                  <div className='input imageType'>
                    <FormItem>
                      <Switch {...getFieldProps('buildCache', { initialValue: true }) } defaultChecked={true} />
                    </FormItem>
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
              </QueueAnim>
            ] : null
          }
          <Modal className='dockerFileEditModal'
            title={<FormattedMessage {...menusText.dockerFileTitle} />}
            visible={this.state.dockerFileModalShow}
            onOk={this.closeDockerFileModal}
            onCancel={this.closeDockerFileModal}
            >
            <DockerFileEditor value={this.state.dockerFileTextarea} callback={this.onChangeDockerFileTextarea} options={defaultOptions} />
            <div className='btnBox'>
              <Button size='large' type='primary' onClick={this.closeDockerFileModal}>
                <span>保存并使用</span>
              </Button>
            </div>
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
         <Modal title="添加第三方仓库" visible={this.state.addOtherImage}
          onOk={()=> this.addOtherImage()} onCancel={()=> this.cancelModal()}
          >
          <div className="modalColor" style={{lineHeight:'30px'}}><i className="anticon anticon-question-circle-o" style={{marginRight: '8px',marginLeft:'16px'}}></i>
            是否跳转添加第三方仓库
          </div>
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

