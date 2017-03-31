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
import { Button, Input, Form, Switch, Radio, Checkbox, Icon, Select, Modal, Tooltip } from 'antd'
import { Link, browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { appNameCheck } from '../../../../../common/naming_validation'
import DockerFileEditor from '../../../../Editor/DockerFile'
import { updateTenxFlowState, getDockerfiles, setDockerfile, getAvailableImage } from '../../../../../actions/cicd_flow'
import './style/EditTenxFlowModal.less'
import findIndex from 'lodash/findIndex'
import EnvComponent from './CreateEnvComponent.js'
import ImageEnvComponent from './ImageEnvComponent.js'
import CodeStoreListModal from './CodeStoreListModal.js'
import NotificationHandler from '../../../../../common/notification_handler'

const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;
let index = 0
const defaultOptions = {
  readOnly: false
}

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
    defaultMessage: '依赖服务',
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
    defaultMessage: '使用云端 Dockerfile',
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
  },
  deleteCode: {
    id: 'CICD.Tenxflow.EditTenxFlowModal.deleteCode',
    defaultMessage: '清空',
  },
  emptyImageEnv: {
    id: 'CICD.Tenxflow.CreateTenxFlowModal.emptyImageEnv',
    defaultMessage: '环境变量值不能为空',
  }
});

function fetchCodeStoreName(project, codeList) {
  //this function for fetcht code store name
  let codeName = null;
  if (!project) {
    return
  }
  codeList.map((item) => {
    if (item.id == project.id) {
      codeName = item.name;
    }
  });
  return codeName;
}

function fetchDockerFilePath(spec) {
  if (!!spec.build) {
    let dPath = spec.build.dockerfilePath
    // Hide 1st / letter
    if (dPath.indexOf('/') == 0) {
      dPath = dPath.substring(1)
    }
    return dPath + spec.build.dockerfileName;
  }
  return null;
}

function fetchDockerFileName(spec) {
  if (!!spec.build) {
    return spec.build.dockerfileName;
  }
  return null;
}


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
let EditTenxFlowModal = React.createClass({
  getInitialState: function () {
    return {
      otherFlowType: 3,
      useDockerfile: true,
      otherTag: false,
      envModalShow: null,
      ImageStoreType: false,
      currentCodeStore: null,
      currentCodeStoreName: null,
      currentCodeStoreBranch: null,
      dockerFileModalShow: false,
      dockerFileTextarea: '',
      noDockerfileInput: false,
      ImageEnvModal: false,
      emptyImageEnv: false,
      emptyServiceEnv: [],
      baseImage: []
    }
  },
  componentWillMount() {
    // const {getAvailableImage} = this.props
    // getAvailableImage()
  },
  componentDidMount() {
    uuid = 0;
    shellUid = 0;
    const _this = this;
    const { config, form, getDockerfiles, codeList, flowId, stageId } = this.props;
    if (!config.spec.project) {
      config.spec.project = {
        id: null,
        branch: ''
      }
    }
    let otherFlowType = config.metadata.type + '';
    let codeStoreName = fetchCodeStoreName(config.spec.project, codeList)
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
    if (otherFlowType != 3) {
      this.setState({
        otherFlowType: otherFlowType,
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
        if (keys) {
          keys = keys.concat(shellUid);
          form.setFieldsValue({
            'shellCodes': keys
          });
        }
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
  componentWillReceiveProps(nextProps){
    if(this.state.isOnece) {
      return
    }
    index++
    if(index >=2) {
      index = 0
      return
    }
    this.setState({
      isOnece: true
    })
    const config = nextProps.config
    if(nextProps.otherImage.length <= 0 && config.spec.build && config.spec.build.customRegistry) {
       this.setState({
         addOtherImage: true,
         showOtherImage: false
       })
    }
    if(config && config.spec.build) {
      let otherImageValue = config.spec.build.customRegistry
      if(otherImageValue) {
        this.setState({
          showOtherImage: true
        })
      } else {
        this.setState({
          showOtherImage: false
        })
      }

    }
  },
  flowNameExists(rule, value, callback) {
    //this function for check the new tenxflow name is exist or not
    const { stageList } = this.props.rootScope.props;
    let errorMsg = appNameCheck(value, '项目名称')
    const self = this
    if(errorMsg == 'success') {
      let flag = false;
      if (stageList.length > 0) {
        stageList.map((item) => {
          if (item.metadata.name == value && self.props.stageId !== item.metadata.id) {
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
    this.props.config.spec.container.args = {}
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
    //this function for user change using the Dockerfile or not
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
    this.props.form.resetFields();
    const { scope } = this.props;
    this.setState({
      currentType: 'view',
      emailAlert: false,
      otherEmail: false,
      isOnece: false
    });
    scope.cancelEditCard();
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope, config, updateTenxFlowState, flowId, stageId, rootScope, setDockerfile } = this.props;
    const enabled = config.spec.ci.enabled || 0
    const { getTenxFlowStateList } = rootScope.props;
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
        if (!!values['imageEnvName' + item]) {
          if (values['imageEnvValue' + item] == '') {
            _this.setState({
              emptyImageEnv: true
            });
            errorFlag = true;
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
            'id': _this.state.currentCodeStore,
            'branch': _this.state.currentCodeStoreBranch
          },
          ci: config.spec.ci
        }
      }
      //if user select the customer type (5), ths customType must be input
      if (this.state.otherFlowType == 5) {
        body.metadata.customType = values.otherFlowType;
      }
      //if user select the image build type (3),the body will be add new body
      if (this.state.otherFlowType == 3) {
        let dockerFileFrom = _this.state.useDockerfile ? 1 : 2;
        let imageBuildBody = {
          'DockerfileFrom': dockerFileFrom,
          'registryType': parseInt(values.imageType),
          'imageTagType': parseInt(values.imageTag),
          'noCache': values.buildCache,
          'image': values.imageRealName
        }
        if (this.state.otherTag) {
          imageBuildBody.customTag = values.otherTag;
        }
        if(imageBuildBody.registryType == 3) {
          imageBuildBody.customRegistry = values.otherImage
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
        if (tmpDockerFileUrl.indexOf('/') != 0) {
          tmpDockerFileUrl = '/' + tmpDockerFileUrl
        }
        // It's a directory
        if (tmpDockerFileUrl.endsWith('/')) {
          imageBuildBody.DockerfilePath = tmpDockerFileUrl
          imageBuildBody.DockerfileName = ''
        } else {
          imageBuildBody.DockerfilePath = tmpDockerFileUrl.substring(0, tmpDockerFileUrl.lastIndexOf('/') + 1)
          imageBuildBody.DockerfileName = tmpDockerFileUrl.substring(tmpDockerFileUrl.lastIndexOf('/') + 1)
        }
        body.spec.build = imageBuildBody;
      }
      this.setState({
        isOnece: false
      })
      let notification = new NotificationHandler()
      updateTenxFlowState(flowId, stageId, body, {
        success: {
          func: () => {
            if (!_this.state.useDockerfile && this.state.otherFlowType == 3) {
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
            } else {
              getTenxFlowStateList(flowId)
            }
            rootScope.setState({
              currentFlowEdit: null
            });
            notification.success('持续集成', '编辑成功');
          },
          isAsync: true
        }
      })
    });
  },
  getOtherImage() {
    if(!this.props.otherImage ||  this.props.otherImage.length <= 0){
      return []
    }
    return this.props.otherImage.map(item => {
      return <Option key={item.id} value={item.id}>{item.title}</Option>
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
      addOtherImage: false,
      showOtherImage: false
    })
  },
  validOtherImage(rule, value, callback){
    if(!this.state.showOtherImage) return callback()
    if(!value) {
      return callback(new Error('请选择镜像仓库'))
    }
    return callback()
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { config, form, codeList, supportedDependencies, imageList} = this.props;
    const shellList = config.spec.container.args ? config.spec.container.args : [];
    const servicesList = config.spec.container.dependencies ? config.spec.container.dependencies : [];
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
    if (intFlowTypeIndex > buildImages.length - 1) {
      intFlowTypeIndex = buildImages.length - 1
    }
    this.state.baseImage = buildImages[intFlowTypeIndex].imageList
    const baseImage = this.state.baseImage.map(list => {
      return (
        <Option key={list.imageName}>{list.imageName}</Option>
      )
    })
    let validOtherImage
    let otherImageValue = ''
    if(config && config.spec.build) {
      otherImageValue = config.spec.build.customRegistry
      const index = findIndex(this.props.otherImage, item => {
        return item.id == otherImageValue
      })
      if(index < 0) otherImageValue = ''
    }
    if (this.state.showOtherImage) {
      validOtherImage = getFieldProps('otherImage', {
        rules: [
          { message: '请选择镜像仓库' },
          { validator: this.validOtherImage },
        ],
        initialValue: otherImageValue
      });
    } else {
      validOtherImage = getFieldProps('otherImage', { rules: [], initialValue: otherImageValue})
    }
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
              <EnvComponent scope={scopeThis} config={envDefault} index={k} form={form} />
            </Modal>
          </div>
        </QueueAnim>
      )
    });
    const scodes = getFieldValue('shellCodes')
    const shellCodeItems = scodes.map((i) => {
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
    if (this.state.otherFlowType == 3 && shellCodeItems.length > 1) {
      shellCodeItems.pop()
    }
    const flowTypeProps = getFieldProps('flowType', {
      rules: [
        { required: true, message: '请选择项目类型' },
      ],
      onChange: this.flowTypeChange,
      initialValue: imageList[config.metadata.type - 1].title,
    });
    const otherFlowTypeProps = getFieldProps('otherFlowType', {
      rules: [
        { message: '输入自定义项目类型' },
      ],
      initialValue: config.metadata.customType,
    });
    const imageRealNameProps = getFieldProps('imageRealName', {
      rules: [
        { message: '请输入镜像名称' },
        { validator: this.realImageInput },
      ],
      initialValue: (!!config.spec.build ? config.spec.build.image : null)
    });
    const configBaseConfig = config.spec.container.image
    const imageNameProps = getFieldProps('imageName', {
      rules: [
        { required: true, message: '请选择基础镜像' }
      ],
      initialValue: configBaseConfig || buildImages[intFlowTypeIndex].imageList[0].imageName
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
      initialValue: fetchDockerFilePath(config.spec)
    });
    const dockerFileNameProps = getFieldProps('dockerFileName', {
      rules: [
        { message: '请输入 Dockerfile 名称' },
      ],
      initialValue: fetchDockerFileName(config.spec),
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
                  {selectImage}
                </Select>
              </FormItem>
              {
                this.state.otherFlowType == '5' ? [
                  <QueueAnim className='otherFlowTypeInput' key='otherFlowTypeInput'>
                    <div key='otherFlowTypeInput'>
                      <FormItem>
                        <Input {...otherFlowTypeProps} size='large' />
                      </FormItem>
                    </div>
                  </QueueAnim>
                ] : null
              }
            </div>
            <div style={{ clear: 'both' }} />
          </div>
          <div className='commonBox'>
            <div className='title'>
              <span><FormattedMessage {...menusText.flowCode} /></span>
            </div>
            <div className='input'>
              {this.state.currentCodeStore ? [
                <span style={{ marginRight: '15px' }}>{this.state.currentCodeStoreName + '  ' + (this.state.currentCodeStoreBranch ? formatMessage(menusText.branch) + this.state.currentCodeStoreBranch : '')}</span>
              ] : null}
              <Button className='selectCodeBtn' size='large' type='ghost' onClick={this.openCodeStoreModal}>
                <svg className='codeSvg'>
                  <use xlinkHref='#cicdreflash' />
                </svg>
                {this.state.currentCodeStore ? [<FormattedMessage {...menusText.selectCode} />] : [<span>选择代码库</span>]}
              </Button>
              {this.state.currentCodeStore ? [
                <Button key='deleteCodeBtn' type='ghost' size='large' style={{ marginLeft: '15px' }} onClick={this.deleteCodeStore}>
                  <Icon type='delete' style={{ marginRight: '7px' }} />
                  <FormattedMessage {...menusText.deleteCode} />
                </Button>
              ] : null}
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
                <Input {...flowNameProps} />
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
                      ] : [<QueueAnim className='dockerFileInputAnimate' key='dockerFileInputAnimate'>
                      <div key='useDockerFileAnimateSecond'>
                        <Input className='dockerFileInput' {...dockerFileUrlProps} addonBefore='/' size='large' />
                      </div>
                    </QueueAnim>]
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
                      <RadioGroup {...getFieldProps('imageType', { initialValue: (!!config.spec.build ? (config.spec.build.registryType + '') : '1'), onChange: this.changeImageStoreType }) }>
                        <Radio key='imageStore' value={'1'}><FormattedMessage {...menusText.imageStore} /></Radio>
                        <Radio key='DockerHub' value={'2'} disabled>Docker Hub</Radio>
                        <Radio key='otherImage' value={'3'}><FormattedMessage {...menusText.otherImage} /></Radio>
                      </RadioGroup>
                    </FormItem>
                    <FormItem style={{ float: 'left', width:'120px' }}>
                      <Select {...validOtherImage} style={{display: getFieldProps('imageType').value == '3' ? 'inline-block' : 'none'}}>
                        {this.getOtherImage()}
                      </Select>
                    </FormItem>
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
                      <RadioGroup {...getFieldProps('imageTag', { initialValue: (!!config.spec.build ? (config.spec.build.imageTagType + '') : '1'), onChange: this.changeImageTagType }) }>
                        <Radio key='branch' value={'1'}><FormattedMessage {...menusText.ImageTagByBranch} /></Radio>
                        <Radio key='time' value={'2'}><FormattedMessage {...menusText.ImageTagByTime} /></Radio>
                        <Radio key='other' value={'3'}><FormattedMessage {...menusText.ImageTagByOther} /></Radio>
                      </RadioGroup>
                    </FormItem>
                    {
                      this.state.otherTag ? [
                        <QueueAnim>
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
                      <Switch {...getFieldProps('buildCache') } defaultChecked={!!config.spec.build ? config.spec.build.noCache : true} />
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
            <ImageEnvComponent scope={scopeThis} form={form} config={config.spec.container.env} />
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
  // const defaultState = {
  //   imageList: []
  // }
  // const { availableImage } = state.cicd_flow
  // const { imageList } = availableImage || defaultState
  return {
    // imageList
  }
}

EditTenxFlowModal = createForm()(EditTenxFlowModal);

EditTenxFlowModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  updateTenxFlowState,
  getDockerfiles,
  setDockerfile,
  getAvailableImage
})(injectIntl(EditTenxFlowModal, {
  withRef: true,
}));

