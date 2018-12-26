/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-6
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Input, Icon, Table, Modal, Form, Row, Col,
  Checkbox, Select, Spin, Radio, Dropdown, Menu, TimePicker, Tooltip, notification } from 'antd'
import { connect } from 'react-redux'
import '../style/ImageUpdate.less'
import {
  loadImageUpdateList,
  imageUpdateSwitch,
  deleteImageUpdateRules,
  editImageUpdateRules,
  createTargetStore,
  iamgeUpdateAddNewRules,
  validationOldTargetStore,
  validationNewTargetStore,
  getTasklogs,
  getReplicationPolicies,
  getCurrentRuleTask,
  copyCurrentRule,
  updateCurrentTask,
  loadProjectList,
  loadProjectDetail,
  getTargets,
} from '../../../../actions/harbor'
import { formatDate, formatDuration } from  '../../../../common/tools'
import { ecma48SgrEscape } from '../../../../common/ecma48_sgr_escape'
import NotificationHandler from '../../../../components/Notification'
import light from '../../../../assets/img/light.svg'
import { DEFAULT_REGISTRY, URL_REG_EXP } from '../../../../constants'
import { Link } from 'react-router'
import Ellipsis from '@tenx-ui/ellipsis/lib'
import TimeHover from '@tenx-ui/time-hover/lib'

const Option = Select.Option
const DATE_REG = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,})?(Z|(\+\d{2}:\d{2}))\b/

let LogsTemplate = React.createClass({
  getInitialState() {
    return {

    }
  },
  formatLogDetails() {
    const { imageUpdateLogs } = this.props
    let { isFetching, logs } = imageUpdateLogs || {}
    if (isFetching) {
      return <div style={{textAlign:'center'}}><Spin /></div>
    }
    const logsArray = []
    logs = logs.split('\n')
    logs.map(log => {
      let logDateArray = log.match(DATE_REG)
      let logDate
      if (logDateArray && logDateArray[0]) {
        logDate = logDateArray[0]
        log = log.replace(logDate, '')
      }
      logsArray.push(
        <div>
          {logDate && <font color="orange">[{formatDate(logDate)}]</font>}
          <span>{log}</span>
        </div>
      )
    })
    return logsArray
    // return ecma48SgrEscape(logs)
  },
  handleExpand(){
    this.props.scope.setState({
      expand: !this.props.scope.state.expand
    })
  },
  render() {
    return (<div id="logsTemplate" className={this.props.scope.state.expand ? 'bigModal' : 'smallModal'}>
      <div className='title'>
        日志记录
        {
          this.props.scope.state.expand
          ? <i className="fa fa-compress" aria-hidden="true" onClick={this.handleExpand}></i>
          : <i className="fa fa-expand" aria-hidden="true" onClick={this.handleExpand}></i>
        }
      </div>
      <pre className='logsbody'>
        {this.formatLogDetails()}
      </pre>
    </div>)
  }
})

class ImageUpdate extends Component {
	constructor(props){
    super(props)
    this.handleAddRules = this.handleAddRules.bind(this)
    this.modalCancel = this.modalCancel.bind(this)
    this.modalConfirm = this.modalConfirm.bind(this)
    this.testStoreLink = this.testStoreLink.bind(this)
    this.testLinkResult = this.testLinkResult.bind(this)
    this.handleModalFooterDomNodes = this.handleModalFooterDomNodes.bind(this)
    this.handleSelectOption = this.handleSelectOption.bind(this)
    this.checkRulesNameProps = this.checkRulesNameProps.bind(this)
    this.handleConfirmSwitchRules = this.handleConfirmSwitchRules.bind(this)
    this.handleRulesModalText = this.handleRulesModalText.bind(this)
    this.handleImageUpdateSwitch = this.handleImageUpdateSwitch.bind(this)
    this.handleloadImageUpdateList = this.handleloadImageUpdateList.bind(this)
    this.handleDeleteImageUpdataRules = this.handleDeleteImageUpdataRules.bind(this)
    this.handleSelcetOnchange = this.handleSelcetOnchange.bind(this)
    this.handleRadioGroupChange = this.handleRadioGroupChange.bind(this)
    this.handleeditImageUpdateRules = this.handleeditImageUpdateRules.bind(this)
    this.createNewTargetStore = this.createNewTargetStore.bind(this)
    this.handelEidtImageRules = this.handelEidtImageRules.bind(this)
    this.createNewRules = this.createNewRules.bind(this)
    this.postCreateNewRules = this.postCreateNewRules.bind(this)
    this.validationTargetStore = this.validationTargetStore.bind(this)
    this.getLogs = this.getLogs.bind(this)
    this.startUseRules = this.startUseRules.bind(this)
    this.refreshData = this.refreshData.bind(this)
    this.handleNextStep = this.handleNextStep.bind(this)
    this.state = {
      inputValue: '',
      addRulesVisible: false,
      testLink: false,
      testLinkResult: false,
      eidtTargetStore: false,
      SwitchRulesVisible: false,
      switchTitle: '停用',
      currentKey: 0,
      editDisabled: false,
      logsVisible: false,
      expand: false,
      editUrlDisabled: false,
      edit: false,
      currentRules: {},
      currentRulesEnabled: false,
      disappear: true,
      editKey: undefined,
      currentRule: undefined,
      searchType: 'name',
      searchText: undefined,
      confirmLoading: false,
      testStoreLinkLoading: false,
      isShowStopModal: false,
    }
  }

  handleloadImageUpdateList(){
    const { detail, registry, loadImageUpdateList, harbor } = this.props
    let projectID = detail.data.projectId
    const body = {
      registry: registry,
      projectID,
    }
    return new Promise((resolve, reject) => {
      loadImageUpdateList(harbor, body, {
        success : {
          func: (res) => {
            resolve({
              result: true,
              policies: res.data.policies
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notification.warn({
              message: '获取镜像失败',
            })
            resolve({
              result: false
            })
          }
        }
      })
    })
  }

  loadAllPolicies() {
    const { getReplicationPolicies, registry, harbor } = this.props
    getReplicationPolicies(harbor, registry)
  }

  componentDidMount() {
    setTimeout( () => this.refreshData(), 200)
    //bind 'esc' key down
    const scope = this;
    function handler(e){
      if(e.keyCode == 27) {
        scope.setState({
          logsVisible: false,
          expand: false,
        });
      }
    }

    document.addEventListener('keyup',handler )
    const { loadProjectList, registry, harbor } = this.props
    this.props.isReplications && loadProjectList(registry, Object.assign({}, registry, { harbor }))
  }

  componentWillUnmount() {
    const scope = this;
    function handler(e){
      if(e.keyCode == 27) {
        scope.setState({
          logsVisible: false,
          expand: false,
        });
      }
    }

    document.removeEventListener('keyup', handler)
  }

  refreshData() {
    const { isReplications } = this.props
    if (isReplications) {
      this.loadAllPolicies()
      return
    }
    !isReplications && this.handleloadImageUpdateList()
  }

  handleInputValue = e => {
    this.setState({
      searchText: e.target.value,
      currentRule: undefined,
    })
  }

  handleAddRules(){
    const { form } = this.props
    form.resetFields()
    form.setFieldsValue({SelectTargetStore: 'createNewstore'})
    this.setState({
      addRulesVisible: true,
      editDisabled: false,
      editUrlDisabled: false,
      edit: false,
      currentKey: false,
      currentRulesEnabled: false,
      currentName: undefined,
    },()=>{
      document.getElementById('rulesName').focus()
    })
  }

  modalCancel(){
    const { form } = this.props
    form.resetFields()
    this.setState({
      addRulesVisible: false,
      testLinkResult: false,
      testLink: false,
    })
  }

  createNewTargetStore(newStoreInfo){
    const { registry, createTargetStore, harbor } = this.props
    return new Promise((resolve, reject) => {
      createTargetStore(harbor, registry, newStoreInfo, {
        success : {
          func: (res) => {
            resolve({
              useful: true,
              target_id: res.data.id
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            resolve({
              useful: false,
              statusCode: res.statusCode
            })
          }
        }
      })
    })
  }

  handelEidtImageRules(id, body){
    const { editImageUpdateRules, registry, isReplications, harbor } = this.props
    let Notification = new NotificationHandler()
    editImageUpdateRules(harbor, registry, id, body, {
      success : {
        func: () => {
          this.changeLoading()
          Notification.success('修改规则成功')
          if (isReplications) {
            this.loadAllPolicies()
          } else {
            this.handleloadImageUpdateList()
          }
          this.setState({
            addRulesVisible: false,
            disappear: !this.state.disappear,
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          this.changeLoading()
          if(res.statusCode = 409){
            Notification.error('存在相同规则，修改规则失败')
            return
          }
          Notification.error('修改规则失败')
        }
      }
    })
  }

  validationTargetStore(storeType, storeInfo){
    const { registry, validationOldTargetStore, validationNewTargetStore, harbor } = this.props
    return new Promise((resolve, reject) => {
      if(storeType == 'create'){
        // test create store
        validationNewTargetStore(harbor, registry, storeInfo, {
          success : {
            func: () => {
              resolve(true)
            },
            isAsync: true
          },
          failed: {
            func: () => {
              resolve(false)
            }
          }
        })
        return
      }
      // test original store
      validationOldTargetStore(harbor, registry, storeInfo, {
        success : {
          func: () => {
            resolve(true)
          }
        },
        failed: {
          func: () => {
            resolve(false)
          }
        }
      })
    })
  }

  // 老版规则
  postCreateNewRules(ruleName, targetId, startUse){
    const { iamgeUpdateAddNewRules, registry, detail, harbor } = this.props
    let projectID = detail.data.projectId
    const body = {
      project_id: projectID,
      target_id: targetId,
      name: ruleName,
      enabled: 0
    }
    return new Promise((resolve, reject) => {
      iamgeUpdateAddNewRules(harbor, registry, body, {
        success : {
          func: () => {
            this.setState({
              addRulesVisible: false,
              testLink: false,
              testLinkResult: false,
            })
            this.modalCancel()
            resolve({
              result: true
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            resolve({
              result: false,
              statusCode: res.statusCode
            })
          }
        }
      })
    }).then(createRulesResult => {
      if(!createRulesResult.result){
        if(createRulesResult.statusCode == 409){
          throw(new Error('存在相同规则，添加规则失败'))
        }
        throw(new Error('添加规则失败'))
      }
      // reload 镜像同步页面
      return this.handleloadImageUpdateList()
    }).then(loadListResult => {
      if(!loadListResult.result){
        throw(new Error('添加规则成功，页面列表刷新失败，请刷新重试！'))
      }
      if(startUse){
        let id = 0
        for(let i=0;i<loadListResult.policies.length;i++){
          if(loadListResult.policies[i].name == ruleName){
            id = loadListResult.policies[i].id
            break
          }
        }
        // 启用规则
        return this.startUseRules(id)
      }else{
        throw(new Error('添加规则成功'))
      }
    }).then(switchResult => {
      if(!switchResult.result){
        throw(new Error('添加规则成功，启用规则失败，请手动启用！'))
      }
      // reload 镜像同步页面
      return this.handleloadImageUpdateList()
    }).then(loadListResult => {
      if(!loadListResult.result){
        throw(new Error('添加规则成功，页面列表刷新失败，请刷新重试！'))
      }
      throw(new Error('添加规则成功'))
    })
  }

  // 新版规则
  async putNewRule(values) {
    const { loadImageUpdateList, loadProjectDetail, iamgeUpdateAddNewRules,
      registry, detail, harbor, isReplications, projectList, getTargets } = this.props
    let projectID = isReplications ? values.originPro : detail.data.projectId
    const rep = {
      registry,
      projectID,
    }
    await getTargets(DEFAULT_REGISTRY, { harbor })
    await loadImageUpdateList(harbor, rep)
    let project = detail.data
    if (isReplications) {
      projectList.forEach(el => {
        if (el.projectId === projectID) {
          project = el
        }
      })
    }
    const projects = [{
      creation_time: project.creationTime,
      current_user_role_id: project.currentUserRoleId,
      deleted: project.deleted,
      metadata: project.metadata,
      name: project.name,
      owner_id: project.ownerId,
      owner_name: project.ownerName,
      project_id: project.projectId,
      repo_count: project.repoCount,
      togglable: project.togglable,
      update_time: project.updateTime,
    }]
    const currentTarget = []
    const { targets } = this.props
    targets && targets.length && targets.forEach(item => {
      if (item.endpoint === values.URLAddress) {
        currentTarget.push({
          creation_time: item.creationTime,
          endpoint: item.endpoint,
          id: item.id,
          insecure: item.insecure,
          name: item.name,
          password: item.password,
          type: item.type,
          update_time: item.updateTime,
          username: item.username,
        })
      }
    })
    const body = {
      description: values.description || "",
      filters: [],
      name: values.rulesName,
      projects,
      replicate_deletion: values.deleteImage || false, // 立即触发切勾选删除, 为true
      replicate_existing_image_now: values.quick ||　false, // 立即复制
      targets: currentTarget,
      trigger: { kind: values.emitMode },
    }
    // 镜像过滤
    if (values.repository) {
      body.filters.push({
        kind: 'repository',
        pattern: values.repositoryPattern,
      })
    }
    if (values.tag) {
      body.filters.push({
        kind: 'tag',
        pattern: values.tagPattern,
      })
    }
    // 定时触发
    if (values.emitMode === "Scheduled") {
      const originTime = '2018/01/01 08:00'
      const setTime = `2018/01/01 ${values.setTime}`
      let offtime = (new Date(setTime).getTime() - new Date(originTime).getTime())/1000
      // 选择的时间在 08:00之前的
      if (offtime < 0) {
        offtime = offtime + 86400
      }
      if (values.setDay === '0') {
        body.trigger.schedule_param = {
          type: 'Daily',
          offtime,
        }
      } else {
        const num = Number(values.setDay)
        body.trigger.schedule_param = {
          type: 'Weekly',
          weekday: num,
          offtime,
        }
      }
    }
    if (this.state.edit) {
      return this.handelEidtImageRules(this.state.editKey, body)
    }
    let Notification = new NotificationHandler()
    return new Promise((resolve, reject) => {
      iamgeUpdateAddNewRules(harbor, registry, body, {
        success : {
          func: () => {
            this.setState({
              addRulesVisible: false,
              testLink: false,
              testLinkResult: false,
            })
            this.changeLoading()
            this.modalCancel()
            resolve({
              result: true
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            this.changeLoading()
            resolve({
              result: false,
              statusCode: res.statusCode
            })
          }
        }
      })
    }).then(createRulesResult => {
      if(!createRulesResult.result){
        if(createRulesResult.statusCode == 409){
          throw(new Error('存在相同规则，添加规则失败'))
        }
        throw(new Error('添加规则失败'))
      }
      // reload 镜像同步页面
      if (isReplications) {
        this.loadAllPolicies()
      } else {
        this.handleloadImageUpdateList()
      }
      this.setState({ disappear: !this.state.disappear })
      Notification.success('添加规则成功')
    })
  }

  createNewRules(values){
    const {  targets } = this.props
    let Notification = new NotificationHandler()
    if(values.targetStoreType == "createNewstore"){
      const newStoremInfo = {
        name: values.NewTargetstoreName,
        endpoint: values.URLAddress,
        username: values.userName,
        password: values.passWord,
        insecure: !values.insecure,
        type: 0,
      }
      // 检验新仓库是否可用
      this.validationTargetStore('create', newStoremInfo).then(validateResult => {
        if(!validateResult){
          this.changeLoading()
          throw(new Error('新目标仓库未连接，创建规则失败！'))
        }
        // 创建新仓库
        return this.createNewTargetStore(newStoremInfo)
      }).then(createStoreResult => {
        if(!createStoreResult.useful){
          if(createStoreResult.statusCode == 409){
            this.changeLoading()
            throw(new Error('仓库名称/地址已存在！请直接选择已有目标仓库！'))
          }
          this.changeLoading()
          throw(new Error('新目标仓库创建失败！添加规则失败!'))
        }
        // 创建新规则 (旧版)
        // return this.postCreateNewRules(values, values.rulesName, createStoreResult.target_id, values.startUse) //立即使用startUse
        return this.putNewRule(values)
      }).catch(err => {
        if (err) {
          switch(err.message){
            case 'none':
              return
            case '添加规则成功':
              return Notification.success('添加规则成功')
            default:
              return Notification.error(err.message)
          }
        }
      })
      return
    }
    // 使用已有目标仓库
    return this.putNewRule(values)

    /*
    // 检验原有仓库是否可用
    let targetId = 0
    for(let i=0; i< targets.length; i++){
      if(values.SelectTargetStore == targets[i].name){
        targetId = targets[i].id
        break
      }
    }
    this.validationTargetStore('original', targetId).then(validateResult => {
      if(!validateResult){
        throw(new Error('新目标仓库未连接，创建规则失败！'))
      }
      //创建新规则
      return this.postCreateNewRules(values.rulesName, targetId, values.startUse)
    }).catch(err => {
      if (err) {
        switch(err.message){
          case 'none':
            return
          case '添加规则成功':
            return Notification.success('添加规则成功')
          default:
            return Notification.error(err.message)
        }
      }
    })
    */
  }

  handleeditImageUpdateRules(values){
    const { rulesData, detail, targets, isReplications } = this.props
    const { currentKey } = this.state
    let id = rulesData[currentKey].id
    let projectID = isReplications ? rulesData[currentKey].projectId : detail.data.projectId
    let targetId = 0
    let Notification = new NotificationHandler()
    for(let i=0; i < targets.length; i++){
      if(targets[i].name == values.SelectTargetStore){
        targetId = targets[i].id
        break
      }
    }
    if(rulesData[currentKey].enabled == 1){
      Notification.error('规则正在启用中，不可修改规则！')
      return
    }
    let editBody = {
      id:rulesData[currentKey].id,
      project_id:projectID,
      target_id:targetId,
      target_name:values.SelectTargetStore,
      name:values.rulesName,
      enabled:rulesData[currentKey].enabled,
      description:values.description,
    }
    this.handelEidtImageRules(id, editBody)
  }

  modalConfirm(){
    const { form, isReplications } = this.props
    const { getFieldValue } = form
    const { edit } = this.state
    let checkArr = []
    const targetType = getFieldValue('targetStoreType')
    if (targetType === 'createNewstore') {
      checkArr = [ 'rulesName', 'description', 'targetStoreType', 'NewTargetstoreName', 'URLAddress', 'userName', 'passWord',
        'emitMode', 'repository', 'tag', 'quick',  ]
    } else if (targetType === 'selectTargetStore') {
      checkArr = [ 'rulesName',  'description', 'targetStoreType', 'SelectTargetStore', 'URLAddress',
        'emitMode', 'repository', 'tag', 'quick',  ]
    }
    if (isReplications) {
      checkArr.push('originPro')
    }
    if (getFieldValue('repository')) {
      checkArr.push('repositoryPattern')
    }
    if (getFieldValue('tag')) {
      checkArr.push('tagPattern')
    }
    const emode = getFieldValue('emitMode')
    if (emode === 'Immediate') {  // emitMode
      checkArr.push('deleteImage')
    } else if (emode === 'Scheduled') {
      checkArr.push('setDay')
      checkArr.push('setTime')
    }
    form.validateFields(checkArr, (errors, values) => {
      if(!!errors){
        return
      }
      this.changeLoading()
      if(edit){
        this.putNewRule(values)
        return
      }
      this.createNewRules(values)
    })
  }

  testStoreLink(){
    const { form, targets } = this.props
    form.validateFields((errors, values) => {
      if(!!errors){
        return
      }
      this.setState({ testStoreLinkLoading: true })
      if(values.targetStoreType == "createNewstore"){
        let newStoremInfo = {
          name: values.NewTargetstoreName,
          endpoint: values.URLAddress,
          username: values.userName,
          password: values.passWord
        }
        // 检验新仓库是否可用
        this.validationTargetStore('create', newStoremInfo).then(validateResult => {
          this.setState({ testStoreLinkLoading: false })
          if(!validateResult){
            this.setState({
              testLink: true,
              testLinkResult: false,
            })
            return
          }
          this.setState({
            testLink: true,
            testLinkResult: true,
          })
        })
        return
      }
      // 检验原仓库是否可用
      let targetId = 0
      for(let i=0; i< targets.length; i++){
        if(values.SelectTargetStore == targets[i].name){
          targetId = targets[i].id
          break
        }
      }
      this.validationTargetStore('original', targetId).then(validateResult => {
        this.setState({ testStoreLinkLoading: false })
        if(!validateResult){
          this.setState({
            testLink: true,
            testLinkResult: false,
          })
          return
        }
        this.setState({
          testLink: true,
          testLinkResult: true,
        })
      })
    })
  }

  testLinkResult(){
    const { testLinkResult } = this.state
    if(testLinkResult){
      return <div className='success'><Icon type="check-circle-o icon" />测试连接成功</div>
    }
    return <div className='failed'><Icon type="cross-circle-o icon" />测试连接失败</div>
    return <Spin />
  }

  changeLoading = () => {
    this.setState({
      confirmLoading: !this.state.confirmLoading,
    })
  }

  handleModalFooterDomNodes(){
    const { testLink, disappear, confirmLoading } = this.state
    if (disappear) {
      return <div>
        <Button
          size="large"
          onClick={this.modalCancel}
        >
          取消
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={this.handleNextStep}
        >
          下一步
        </Button>
      </div>
    }
    return <div>
      {
        this.props.form.getFieldValue('targetStoreType') === 'createNewstore' &&
        <Button
          type="primary"
          className="test"
          size="large"
          loading={this.state.testStoreLinkLoading}
          onClick={this.testStoreLink}
        >
        测试仓库连接
        </Button>
      }
      {
        testLink
        ? <div className='wrap'>{this.testLinkResult()}</div>
        : <span></span>
      }
      <Button size="large" onClick={this.handleNextStep}>上一步</Button>
      <Button type="primary" size="large" loading={confirmLoading} onClick={this.modalConfirm}>确定</Button>
    </div>
  }

  handleNextStep() {
    const { form, isReplications } = this.props
    const { disappear } = this.state
    if (disappear) {
      let checkArr = [ 'rulesName', 'targetStoreType', 'URLAddress', ]
      const targetType = form.getFieldValue('targetStoreType')
      if (targetType === 'createNewstore') {
        checkArr = [ 'rulesName', 'targetStoreType', 'NewTargetstoreName', 'URLAddress', 'userName', 'passWord' ]
      } else if (targetType === 'selectTargetStore') {
        checkArr = [ 'rulesName', 'targetStoreType', 'SelectTargetStore', 'URLAddress' ]
      }
      isReplications && checkArr.push('originPro')
      form.validateFields(checkArr, (errors, values) => {
        if(!!errors){
          return
        }
        this.setState({ disappear: !disappear })
      })
    } else {
      this.setState({ disappear: !disappear })
    }
  }

  selectOriginPro = () => {
    const { projectList } = this.props
    return projectList.length && projectList.map(item => {
      return <Select.Option key={item.projectId} value={item.projectId}>{item.name}</Select.Option>
    })
  }

  // checkNewTarget = (rule, value, callback) => {
  //   if (!value) {
  //     return callback('请输入新目标仓库名称')
  //   }
  //   callback()
  // }

  handleSelectOption(){
    const { targets } = this.props
    if(!targets){
      return []
    }
    let options = targets.map((item, index) => {
      return <Select.Option key={item.id} value={item.name + ',' + item.id}>{item.name}</Select.Option>
    })
    return options
  }

  checkRulesNameProps(rule, value, callback){
    const { rulesData } = this.props
    const { edit, currentName } = this.state
    if(!value){
      return callback('请输入规则名称')
    }
    if(value.length < 3 || value.length > 26){
      return callback('规则名称为3到25个字符')
    }
    if (edit && value === currentName) {
      return callback()
    }
    rulesData && rulesData.length && rulesData.forEach(item => {
      if (item.name ===  value) {
        return callback('规则名已存在')
      }
    })
    callback()
  }

  startUseRules(id){
    const { registry, imageUpdateSwitch, harbor } = this.props
    const body = {
      enabled: 1
    }
    return new Promise((resolve, reject) => {
      imageUpdateSwitch(harbor, registry, id, body, {
        success : {
          func: () => {
            resolve({
              result: true
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            resolve({
              result: false
            })
          }
        }
      })
    })
  }

  handleImageUpdateSwitch(currentKey){
    const { registry, imageUpdateSwitch, rulesData, isReplications, harbor } = this.props
    let Notification = new NotificationHandler()
    const { switchTitle } = this.state
    let id = rulesData[currentKey].id

    const body = {
      enabled: 0
    }
    if(switchTitle == '启用'){
      body.enabled = 1
    }
    imageUpdateSwitch(harbor, registry, id, body, {
      success : {
        func: () => {
          Notification.success(switchTitle + '规则成功')
          if (isReplications) {
            this.loadAllPolicies()
          } else {
            this.handleloadImageUpdateList()
          }
          this.setState({
            SwitchRulesVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          Notification.error(switchTitle + '规则失败')
          this.setState({
            SwitchRulesVisible: false
          })
        }
      }
    })
  }

  handleDeleteImageUpdataRules(currentKey){
    const { registry, rulesData, deleteImageUpdateRules, isReplications, harbor } = this.props
    let Notification = new NotificationHandler()
    let id = rulesData[currentKey].id
    if(rulesData[currentKey].enabled == 1){
      Modal.error({
        title: '提示',
        content: '不能直接删除启用中的规则，请停用后再删除',
      });
      return
    }
    deleteImageUpdateRules(harbor, registry, id, {
      success : {
        func: () => {
          Notification.success('删除规则成功')
          if (isReplications) {
            this.loadAllPolicies()
          } else {
            this.handleloadImageUpdateList()
          }
          if (id === this.state.currentRule) {
            this.setState({
              currentRule: undefined,
            })
          }
          this.setState({
            SwitchRulesVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: err => {
          this.setState({
            SwitchRulesVisible: false
          })
          if (err.statusCode === 412) {
            Notification.warn('删除复制规则失败', '仍有未完成的任务或规则未停用。')
            return
          }
          Notification.error('删除规则失败')
        }
      }
    })
  }

  handleSelcetOnchange(values){
    const { form, targets } = this.props
    let id = values.split(',')[1]
    let value = values.split(',')[0]
    this.setState({
      testLink: false,
    })
    for(let i=0;i<targets.length;i++){
      if(targets[i].id == id){
        form.setFieldsValue({
          SelectTargetStore: value,
          URLAddress: targets[i].endpoint,
          userName: targets[i].username,
          passWord: '',
        })
        break
      }
    }
  }

  handleRadioGroupChange(value){
    const { form } = this.props
    const { edit, currentRules } = this.state
    this.setState({
      testLink: false,
    })
    if(value.target.value == 'selectTargetStore'){
      this.setState({
        editUrlDisabled: true,
        editDisabled: true,
      })
      if(edit){
        form.setFieldsValue({
          URLAddress: currentRules.store.endpoint,
          userName: currentRules.store.username,
          passWord: '',
          SelectTargetStore: currentRules.store.name
        })
        return
      }
      form.setFieldsValue({
        URLAddress: undefined,
        userName: undefined,
        passWord: undefined,
        SelectTargetStore: undefined
      })
      return
    }

    if(value.target.value == 'createNewstore'){
      this.setState({
        editUrlDisabled: false,
        editDisabled: false,
      })
      form.setFieldsValue({
        URLAddress: undefined,
        userName: undefined,
        passWord: undefined,
        NewTargetstoreName: undefined,
      })
      return
    }
  }

  handleConfirmSwitchRules(){
    const { switchTitle, currentKey } = this.state
    this.setState({
      SwitchRulesVisible: false,
    })
    switch(switchTitle){
      // case '停用':
      // case '启用':
      //   return this.handleImageUpdateSwitch(currentKey)
      case '删除':
        return this.handleDeleteImageUpdataRules(currentKey)
      default:
        return
    }
  }

  handleRulesModalText(){
    const { switchTitle } = this.state
    let obj = {}
    switch(switchTitle){
      case '停用':
        return obj = {
          title: '停用规则',
          text: '停用规则后，所有未完成的同步任务将被终止和取消。'
        }
      case '启用':
        return  obj = {
          title: '启用规则',
          text: '启用规则后，该仓库组下的所有镜像仓库将同步到目标实例。'
        }
      case '删除':
        return  obj = {
          title: '删除规则',
          text: '删除规则后，将无法继续同步任务。'
        }
      default:
        return obj = {}
    }
  }

  handleDropDownMenu(key, item){
    this.setState({
      currentKey: key,
    })
    switch(item.key){
      // case 'stop':
      //   return this.setState({
      //     switchTitle: '停用',
      //     SwitchRulesVisible: true,
      //   })
      case 'delete':
        return this.setState({
          switchTitle: '删除',
          SwitchRulesVisible: true,
        })
      // case 'start':
      //   return this.setState({
      //     switchTitle: '启用',
      //     SwitchRulesVisible: true,
      //   })
      default: return
    }
  }

  async handleEditRule(record){
    const key = record.key
    const { form, rulesData, targets, isReplications  } = this.props
    let targetStore = {}
    form.setFieldsValue({
      rulesName: record.name,
      description: record.description,
      targetStoreType: "selectTargetStore",
      URLAddress: record.targets && record.targets[0].endpoint,
      SelectTargetStore: record.targets && record.targets[0].name,
      quick: record.replicateExistingImageNow,
      deleteImage: record.replicateDeletion,
      emitMode: record.trigger && record.trigger.kind,
    })
    // 设置镜像过滤
    if (record.filters && record.filters.length > 0) {
      record.filters.forEach(item => {
        form.setFieldsValue({
          [item.kind]: true,
          [`${item.kind}Pattern`]: item.pattern,
        })
      })
    }
    if (record.trigger && record.trigger.kind === 'Scheduled') {
      // offtime => HH:mm
      const schedule = record.trigger.scheduleParam
      let newTime = null
      const originTime = '2018/01/01 08:00'
      if (schedule.offtime > 57540) {
        newTime = new Date(new Date(originTime).getTime() - (86400 - schedule.offtime) * 1000)
      } else {
        newTime = new Date(schedule.offtime * 1000 + new Date(originTime).getTime())
      }
      const setTime = newTime.toString().substring(16, 21)
      form.setFieldsValue({
        setDay: schedule.weekday.toString(),
        setTime,
      })
    }
    if (isReplications) {
      form.setFieldsValue({
        originPro: record.projects && record.projects[0].projectId,
      })
    }
      /*
        需要设置表单状态
      */
    this.setState({
      addRulesVisible: true,
      currentKey: key,
      editDisabled: true,
      editUrlDisabled: true,
      edit: true,
      currentRules: {
        rules: rulesData[key],
        store: record.targets && record.targets[0],
      },
      currentRulesEnabled: true,
      editKey: record.id,
      currentName: record.name,
    })
    return
  }

  getLogs(item){
    const { getTasklogs, registry, harbor } = this.props
    getTasklogs(harbor, registry, item)
    this.setState({
      logsVisible: true
    })
  }

  emitModeOption() {
    const { getFieldValue, getFieldProps } = this.props.form
    const mode = getFieldValue('emitMode')
    if (mode === 'Manual') {
      return (
        <span>
          <div className="emitPrompt">
            <img src={light} alt='light'/>
            手动点击触发同步
          </div>
        </span>
      )
    } else if (mode === 'Immediate') {
      return (
        <span>
          <Form.Item>
            <Checkbox
              {
                ...getFieldProps('deleteImage', {
                  initialValue: false,
                  valuePropName: 'checked',
                })
              }
            >
              删除本地镜像时同步删除远程镜像
            </Checkbox>
          </Form.Item>
          <div className="emitPrompt">
            <img src={light} alt='light'/>
            push 镜像自动触发同步
          </div>
        </span>
      )
    } else if (mode === 'Scheduled') {
      return (
        <span>
          <span style={{ display: 'flex' }}>
            <span style={{ marginRight: 10, width: 150 }}>
              <Form.Item>
                <Select
                  size="large"
                  style={{ width: 150 }}
                  {
                    ...getFieldProps('setDay', {
                      initialValue: '0',
                    })
                  }
                >
                  <Option key='0' >每天</Option>
                  <Option key='1' >每周一</Option>
                  <Option key='2' >每周二</Option>
                  <Option key='3' >每周三</Option>
                  <Option key='4' >每周四</Option>
                  <Option key='5' >每周五</Option>
                  <Option key='6' >每周六</Option>
                  <Option key='7' >每周日</Option>
                </Select>
              </Form.Item>
            </span>
            <span>
              <Form.Item>
                <TimePicker
                  format="HH:mm"
                  {...getFieldProps('setTime', {
                    getValueFromEvent: (value, timeString) => timeString,
                    rules: [
                      { required: true, message: '请选择一个时间' },
                    ],
                  })}
                />
              </Form.Item>
            </span>
          </span>
          <div className="emitPrompt">
            <img src={light} alt='light'/>
            定时触发同步
          </div>
        </span>
      )
    }
  }

  handleRadio = e => {
    const { harbor, registry, getCurrentRuleTask } = this.props
    const id = e.target.values.id
    this.setState({
      currentRule: id,
    })
    getCurrentRuleTask(harbor, registry, id)
  }

  handleOnChange = v => {
    const { harbor, registry, getCurrentRuleTask } = this.props
    this.setState({
      currentRule: v.id,
    })
    getCurrentRuleTask(harbor, registry, v.id)
  }

  handleCopyRule = () => {
    const { copyCurrentRule, getCurrentRuleTask, harbor, registry } = this.props
    const { currentRule } = this.state
    const body = {
      policy_id: currentRule,
    }
    const Notification = new NotificationHandler()
    Notification.spin('同步中...')
    copyCurrentRule(harbor, registry, body, {
      success : {
        func: () => {
          Notification.close()
          Notification.success('同步任务开始执行')
          getCurrentRuleTask(harbor, registry, currentRule)
        },
        isAsync: true
      },
      failed: {
        func: err => {
          Notification.close()
          Notification.error('同步任务开启失败')
        }
      }
    })
  }

  handleStopTask = () => {
    this.setState({
      isStopLoading: true,
    }, () => {
      const { updateCurrentTask, getCurrentRuleTask, harbor, registry } = this.props
      const { currentRule } = this.state
      const body = {
        policy_id: currentRule,
        status: 'stop',
      }
      const Notification = new NotificationHandler()
      Notification.spin('停止中...')
      updateCurrentTask(harbor, registry, body, {
        success: {
          func: () => {
            Notification.close()
            Notification.success('停止任务成功')
            getCurrentRuleTask(harbor, registry, currentRule)
            this.setState({
              isShowStopModal: false,
            })
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            Notification.close()
            Notification.error('停止任务失败')
          },
        },
        finally: {
          func: () => {
            this.setState({
              isStopLoading: false,
            })
          },
        },
      })
    })
  }

  handleRefreshTask = () => {
    const { harbor, registry, getCurrentRuleTask } = this.props
    const { currentRule } = this.state
    getCurrentRuleTask(harbor, registry, currentRule)
  }

  checkAddressUrl = (rule, value, callback) => {
    if (!value) {
      return callback('请输入 Url 地址')
    }
    if (!URL_REG_EXP.test(value)) {
      return callback('请输入正确地址')
    }
    callback()
  }

  render(){
    const { form, rulesData, taskUpdataData, imageUpdateLogs, isReplications, loading, isFetching, projectList } = this.props
    const { edit, currentRules, currentRulesEnabled, disappear, currentRule, searchType, searchText } = this.state
    if(!rulesData || !taskUpdataData){
      return <div style={{textAlign:'center'}}><Spin style={{textAlign:'center'}}></Spin></div>
    }
    const { getFieldProps, getFieldValue } = form
    const scope = this
    function formatstatus(mode){
      switch(mode){
        case 'Manual':
          return <span>手动同步</span>
        case 'Immediate':
          return <span>自动同步</span>
        case 'Scheduled':
          return <span>定时同步</span>
        default:
          return <span>--</span>
      }
    }

    const menu = rulesData && rulesData.length && rulesData.map((item, index) => {
      return <Menu onClick={this.handleDropDownMenu.bind(this,index)}>
        {/* { // 新版harbor无 起停
          item.enabled == 1
            ? <Menu.Item key="stop" style={{width:'90px'}}><i className="fa fa-stop" aria-hidden="true" style={{ marginRight: '8px'}}></i>停用</Menu.Item>
            : <Menu.Item key="start" style={{width:'90px'}}><i className="fa fa-play" aria-hidden="true" style={{ marginRight: '8px'}}></i>启用</Menu.Item>
        } */}
        <Menu.Item key="delete" style={{width:'90px'}}><i className="fa fa-trash-o" aria-hidden="true" style={{ marginRight: '8px'}}></i>删除</Menu.Item>
      </Menu>
    })
    let rulesColumn = [
      {
        title:' ',
        dataIndex:'check',
        width: '3%',
        render: (row, record) => <Radio values={record} checked={currentRule === record.id} onChange={(record) =>　this.handleRadio(record)}/>,
      },
      {
        title:'名称',
        dataIndex:'name',
        render: text => <div className="fixWidth"><Ellipsis>{text}</Ellipsis></div>
      },{
        title:'描述',
        dataIndex:'description',
        render: (item) => <div className="fixWidth"><Ellipsis>{ item ? item : '--'}</Ellipsis></div>
      },{
        title:'目标名',
        dataIndex:'targets',
        render: item => <div className="fixWidth"><Ellipsis>{item ? item[0].name : null}</Ellipsis></div>
      },{
        title:'更新时间',
        dataIndex:'updateTime',
        render: (time) => <TimeHover time={time} />
      },{
        title:'触发模式',
        dataIndex:'trigger',
        render: (status) => <div>{ status && formatstatus(status.kind)}</div>
      },{
        title:'操作',
        dataIndex:'key',
        render: (row, record) => <div>
          <Dropdown.Button onClick={this.handleEditRule.bind(this, record)} overlay={menu[row]} type="ghost">
            <i className="fa fa-pencil-square-o handleicon"></i>修改
          </Dropdown.Button>
        </div>
      }
    ]

    if (isReplications) {
      rulesColumn.splice(4, 0, {
        title:'仓库组',
        dataIndex:'projects',
        render: item => item && <Link to={`app_center/projects/detail/${item[0].projectId}?key=sync`}>
          <div className="fixWidth"><Ellipsis>{item[0].name}</Ellipsis></div>
        </Link>
      })
    }

    const updataTaskColumn = [
      {
        title:'名称',
        dataIndex:'repository',
      },
      {
        title:'状态',
        dataIndex:'status',
      },
      {
        title:'操作',
        dataIndex:'operation',
      },
      // {
      //   title:'耗时',
      //   dataIndex:'timeConsuming',
      //   render: (item) => <div>{formatDuration(item.begin, item.end, true)}</div>
      // },
      {
        title:'创建时间',
        dataIndex:'creationTime',
        render: (time) => <div>{formatDate(time)}</div>
      },
      {
        title:'更新时间',
        dataIndex:'updateTime',
        render: (time) => <div>{formatDate(time)}</div>
      },
      {
        title:'日志',
        dataIndex:'id',
        render: (item) => <div><Icon type="file-text icon" onClick={this.getLogs.bind(this, item)}/></div>
      }
    ]

    const rulesNameProps = getFieldProps('rulesName',{
      rules: [
        { validator: this.checkRulesNameProps}
      ]
    })

    const descriptionProps = getFieldProps('description',{
      rules: [
        {required: false},
      ]
    })

    const targetStoreTypeProps = getFieldProps('targetStoreType',{
      initialValue: 'createNewstore',
      onChange: this.handleRadioGroupChange
    })
    const targetstoretype = getFieldValue('targetStoreType')
    // let NewTargetstoreNameProps = getFieldProps('NewTargetstoreName')
    const URLAddressProps = getFieldProps('URLAddress',{
      rules: [
        { validator: this.checkAddressUrl }
      ]
    })
    let SelcetTargetStoreProps = getFieldProps('SelectTargetStore')
    const NewTargetstoreNameProps = getFieldProps('NewTargetstoreName',{
      rules: [
        { required: true, message: '请输入新目标仓库名称' },
        // { validator:　this.checkNewTarget }
      ]
    })
    const userNameProps = getFieldProps('userName',{
      rules: [
        { required: true, message: '请输入用户名' },
      ]
    })
    const passWordProps = getFieldProps('passWord',{
      rules: [
        { required: true, message: '请输入密码' },
      ],
    })
    // if(targetstoretype == 'selectTargetStore'){
    SelcetTargetStoreProps = getFieldProps('SelectTargetStore',{
      rules: [
        { required: true, message: '请选择一个目标仓库' },
      ]
    })
    // }

    const formItemLayout = {
      labelCol: {span: 5},
      wrapperCol: {span: 19},
    }
    const text = "确定镜像复制是否要验证远程Harbor实例的 ssl 证书。如果远程实例使用的是自签或者非信任证书，不要勾选此项。"
    const selectBefore = (
      <Select
        value={searchType}
        style={{ width: 80 }}
        onChange={searchType => this.setState({ searchType, searchText: '' })}>
        <Option value="name">名称</Option>
        <Option value="target">目标</Option>
      </Select>
    )
    const listData = !searchText ? rulesData : rulesData.filter(item => {
      if (searchType === 'target') {
        return item.targets[0].name.toUpperCase().indexOf(searchText.toUpperCase()) > -1
      }
      return item.name.toUpperCase().indexOf(searchText.toUpperCase()) > -1
    })
    const _that = this
    return(
      <div id='imageUpdata'>
        <div className='rules'>
          <div className="headerPrompt">
            镜像同步可以将当前镜像仓库组，同步到另一个 harbor 的同名仓库组中，适用于仓库组间的批量复制镜像操作，例如做镜像备份或应用需要部署到不同集群等场景
          </div>
          <div className='header'>
            {
              // !isReplications &&
              <Button type="primary" size='large' className='buttonadd' onClick={this.handleAddRules}>
                <i className='fa fa-plus'/>&nbsp;添加规则
              </Button>
            }
            <Button size='large' className='buttonadd btn-refresh' onClick={this.refreshData}>
              <i className='fa fa-refresh'/>&nbsp;刷新
            </Button>
            <Button
              size='large'
              type="ghost"
              className='btbuttonadd'
              disabled={!currentRule}
              onClick={this.handleCopyRule}>
              同步镜像
            </Button>
            <span className='searchBox'>
              <Input
                addonBefore={selectBefore}
                size="large"
                placeholder={searchType === 'name' ? '按名称搜索' : '按目标名搜索'}
                className='inputStandrd'
                value={searchText}
                onChange={this.handleInputValue}
              />
            </span>
            {
              listData.length
              ? <span className='totleNum'>共计：{listData.length} 条</span>
              : null
            }
          </div>
          <div className="body">
            <Table
              onRowClick={this.handleOnChange}
              loading={this.props.loading}
              columns={rulesColumn}
              dataSource={listData}
              pagination={{simple: true}}
            />
          </div>
        </div>
        {/* {
          // !isReplications &&*/}
          <div className='updataTask'>
            <div className='title'>同步任务</div>
            <div className="header">
            <Button
              size="large"
              type="ghost"
              disabled={ !currentRule ? true : taskUpdataData.length < 1 }
              onClick={() => {
                _that.setState({
                  isShowStopModal: true,
                })
              }}>
              停止任务
            </Button>
            <Button
              size="large"
              type="ghost"
              disabled={!currentRule}
              onClick={this.handleRefreshTask}>
              刷新
            </Button>
              {
                taskUpdataData.length
                  ? <span className='totNum'>共计：{taskUpdataData.length} 条</span>
                  : null
              }
            </div>
            <div className="body">
              <Table
                loading={isFetching}
                columns={updataTaskColumn}
                dataSource={currentRule ? taskUpdataData : []}
                pagination={{simple: true}}
              />
            </div>
          </div>
        {/* } */}
        <Modal
          title={this.state.edit ? '修改规则' : '新建规则'}
          visible={this.state.addRulesVisible}
          closable={true}
          width='460px'
          onCancel={this.modalCancel}
          maskClosable={false}
          wrapClassName="imageUpdataAddRules"
          footer={this.handleModalFooterDomNodes()}
          className="imageSynchronousCreateRule"
        >
          <div className="topStep">
            <span className="step active" >
              <span className="number">1</span> 填写仓库信息
            </span>
            <span className={ disappear ? "step" : "step active" } >
              <span className="number">2</span> 同步规则设置
            </span>
          </div>
          <Form>
            <div className={ disappear ? "firstStep" : "firstStep disappear" }>
              <Form.Item
                {...formItemLayout}
                label="规则名称"
                key="rulesName"
              >
                <Input size="large" {...rulesNameProps} placeholder="请输入规则名称"/>
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label="描述"
                className='description itemMarginBottom'
              >
                <Input size="large" {...descriptionProps} className='textareaStyle' type="textarea"/>
              </Form.Item>
              {
                isReplications
                ? <Form.Item
                    {...formItemLayout}
                    label='源项目'
                    key="originPro"
                    style={{ marginTop: 24, marginBottom: 0 }}
                  >
                    <Select
                      showSearch
                      optionFilterProp="children"
                      placeholder="选择源项目"
                      {
                        ...getFieldProps('originPro',{
                          rules: [{
                            required: true, message: '请选择一个源项目'
                          }]
                        })
                      }
                    >
                      {this.selectOriginPro()}
                    </Select>
                  </Form.Item>
                  : null
              }

              <Form.Item
                {...formItemLayout}
                key="targeStoreType"
                label={<span></span>}
                className='itemMarginBottom'
              >
                <Radio.Group {...targetStoreTypeProps}>
                  <Radio value="createNewstore" key="createNewstore" disabled={currentRulesEnabled}>新建目标仓库</Radio>
                  <Radio value="selectTargetStore" key="selectTargetStore">选择已有目标仓库</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>目标仓库<span className='star'>*</span></span>}
                key="targetStoreName"
              >
                {
                  targetstoretype == 'createNewstore'
                    ? <Input {...NewTargetstoreNameProps} placeholder="请输入目标名" />
                    : <Select
                    showSearch
                    {...SelcetTargetStoreProps}
                    placeholder="选择目标仓库"
                    size='large'
                    onChange={this.handleSelcetOnchange}
                    disabled={currentRulesEnabled}
                  >
                    {this.handleSelectOption()}
                  </Select>
                }
              </Form.Item>
              <Form.Item
                {...formItemLayout}
                label={<span>URL地址<span className='star'>*</span></span>}
              >
                <Input
                  size="large"
                  placeholder="请输入目标 URL, 如：http(s)://192.168.2.232"
                  {...URLAddressProps}
                  disabled={this.state.editUrlDisabled}/>
              </Form.Item>
              {
                targetstoretype === 'createNewstore' ?
                  <span>
                    <Form.Item
                      {...formItemLayout}
                      label={<span>用户名<span className='star'>*</span></span>}
                    >
                      <Input size="large" {...userNameProps} disabled={this.state.editDisabled} placeholder="请输入用户名"/>
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      label={<span>密码<span className='star'>*</span></span>}
                    >
                      <Input type="password" size="large" {...passWordProps} disabled={this.state.editDisabled}  placeholder="请输入密码" />
                    </Form.Item>
                    <Form.Item
                      {...formItemLayout}
                      label="验证远程证书"
                    >
                      <Checkbox
                        {...getFieldProps('insecure', {
                          valuePropName: 'checked',
                        })}
                      >
                        <Tooltip placement="top" title={text}>
                          <Icon type="info-circle-o" />
                        </Tooltip>
                      </Checkbox>
                    </Form.Item>
                  </span>
                  : null
              }
              {/* {
                edit
                ? null
                : <Form.Item
                  {...formItemLayout}
                  label={<span></span>}
                  className='itemMarginBottom'
                >
                  <Checkbox {...startUseProps}>创建完成后，立即启用</Checkbox>
                </Form.Item>
              } */}
            </div>

            <div className={ disappear ? "second disappear" : "second" }>
              <Row>
                <Col className="ant-col-4 ant-form-item-label">
                  镜像过滤
                </Col>
                <Col className="checkBox ">
                  <Form.Item>
                    <Checkbox
                      {
                        ...getFieldProps('repository', {
                          initialValue: false,
                          valuePropName: 'checked',
                        })
                      }
                    >
                      repository
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>
              {
                getFieldValue('repository')
                  ? <Row className="inpRow">
                      <Col className="ant-col-4"></Col>
                      <Col className="ant-col-20">
                        <Form.Item>
                          <Input
                            size="large"
                            placeholder="请输入镜像名称"
                            {
                              ...getFieldProps('repositoryPattern',{
                                rules: [
                                  { required: true, message: '请输入 tag' },
                                ]
                              })
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  : null
              }

              <Row>
                <Col className="ant-col-4"></Col>
                <Col className="checkBox">
                  <Form.Item>
                    <Checkbox
                      {
                        ...getFieldProps('tag', {
                          initialValue: false,
                          valuePropName: 'checked',
                        })
                      }
                    >
                      tag
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              {
                getFieldValue('tag')
                  ? <Row className="inpRow">
                      <Col className="ant-col-4"></Col>
                      <Col className="ant-col-20">
                        <Form.Item>
                          <Input
                            size="large"
                            placeholder="请输入镜像版本"
                            {
                              ...getFieldProps('tagPattern',{
                                rules: [
                                  { required: true, message: '请输入 tag' },
                                ]
                              })
                            }
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  : null
              }

              <Form.Item
                label="触发模式"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                style={{ marginTop: 10, marginBottom: 10 }}
              >
                <Select
                  id="select"
                  size="large"
                  {
                    ...getFieldProps('emitMode', {
                      initialValue: 'Manual',
                    })
                  }
                >
                  <Option value="Manual">手动同步</Option>
                  <Option value="Immediate">自动同步</Option>
                  <Option value="Scheduled">定时触发</Option>
                </Select>
              </Form.Item>
              <Row>
                <Col className="ant-col-4"></Col>
                <Col className="checkBox" span={20}>
                  <Form.Item>
                    <Checkbox
                      {
                        ...getFieldProps('quick', {
                          initialValue: false,
                          valuePropName: 'checked',
                        })
                      }
                    >
                      立即同步镜像
                    </Checkbox>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col className="ant-col-4"></Col>
                <Col className="checkBox" span={20}>{this.emitModeOption()}</Col>
              </Row>
              <Form.Item>
          </Form.Item>
            </div>

          </Form>
        </Modal>

        <Modal
          title={this.handleRulesModalText().title}
          visible={this.state.SwitchRulesVisible}
          closable={true}
          onOk={this.handleConfirmSwitchRules}
          onCancel={() => this.setState({SwitchRulesVisible: false})}
          width='570px'
          maskClosable={false}
          wrapClassName="switchRulesModal"
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            <div className='tipsone'>{this.handleRulesModalText().text}请确认继续。</div>
          </div>
        </Modal>

        <Modal
          title={null}
          visible={this.state.logsVisible}
          closable={true}
          onOk={() => this.setState({logsVisible: false})}
          onCancel={() => this.setState({logsVisible: false})}
          footer={[]}
          maskClosable={true}
          width="750px"
          wrapClassName="taskUpdataLogsModal"
        >
          <LogsTemplate scope={scope} imageUpdateLogs={imageUpdateLogs}/>
        </Modal>
        {
          this.state.isShowStopModal ?
            <Modal
              visible={this.state.isShowStopModal}
              title="停止服务"
              onOk={this.handleStopTask}
              onCancel={() => this.setState({ isShowStopModal: false })}
              confirmLoading={this.state.isStopLoading}
            >
              <div className="deleteRow">
                <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
                  确认停止服务 ?
              </div>
            </Modal>
            :
            null
        }
      </div>
    )
  }
}

ImageUpdate = Form.create()(ImageUpdate)

function mapStateToProp(state, props) {
  const { harbor: stateHarbor, entities } = state
  const { location, registry } = props
  const { detail, imageUpdate, imageUpdateLogs, rules, targets: allTargets } = stateHarbor
  const { isFetching, logs } = state.harbor.currentRuleTask
  const { policies, jobs, targets } = imageUpdate
  const { data: ruleList } = rules
  const { pathname } = location
  let isReplications = false
  if (pathname === "/app_center/projects/replications") {
    isReplications = true
  }
  const { data: allTargetList } = allTargets

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  const projectList = state.harbor && state.harbor.projects[registry] && state.harbor.projects[registry].list || []
  return {
    detail,
    loading: isReplications ? rules.isFetching : imageUpdate.isFetching,
    rulesData: isReplications ? ruleList : policies || [],
    taskUpdataData: logs || [],
    targets: isReplications ? allTargetList : targets || [],
    imageUpdateLogs,
    isReplications,
    harbor,
    isFetching,
    projectList,
  }
}

export default connect(mapStateToProp, {
  loadImageUpdateList,
  imageUpdateSwitch,
  deleteImageUpdateRules,
  editImageUpdateRules,
  createTargetStore,
  iamgeUpdateAddNewRules,
  validationNewTargetStore,
  validationOldTargetStore,
  getTasklogs,
  getReplicationPolicies,
  getCurrentRuleTask,
  copyCurrentRule,
  updateCurrentTask,
  loadProjectList,
  loadProjectDetail,
  getTargets,
})(ImageUpdate)

