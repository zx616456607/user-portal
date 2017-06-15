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
import { Button, Input, Icon, Table, Modal, Form, Row, Col, Checkbox, Select, Spin, Radio, Dropdown, Menu } from 'antd'
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
} from '../../../../actions/harbor'
import { formatDate, formatDuration } from  '../../../../common/tools'
import { ecma48SgrEscape } from '../../../../common/ecma48_sgr_escape'
import NotificationHandler from '../../../../common/notification_handler'

const DATE_REG = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{9})?(Z|(\+\d{2}:\d{2}))\b/

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
    this.handleSearchRules = this.handleSearchRules.bind(this)
    this.handleInputValue = this.handleInputValue.bind(this)
    this.handleAddRules = this.handleAddRules.bind(this)
    this.handleCancelAddRules = this.handleCancelAddRules.bind(this)
    this.handleComfirmAddRules = this.handleComfirmAddRules.bind(this)
    this.handelTestStoreLink = this.handelTestStoreLink.bind(this)
    this.handlTestLinkResult = this.handlTestLinkResult.bind(this)
    this.handleModalFooterDomNodes = this.handleModalFooterDomNodes.bind(this)
    this.handleSelectOption = this.handleSelectOption.bind(this)
    this.checkRulesNameProps = this.checkRulesNameProps.bind(this)
    this.checkURLAddressProps = this.checkURLAddressProps.bind(this)
    this.checkNewTargetstoreNameProps = this.checkNewTargetstoreNameProps.bind(this)
    this.checkuserNameProps = this.checkuserNameProps.bind(this)
    this.checkpassWordProps = this.checkpassWordProps.bind(this)
    this.handleEditTargetStore = this.handleEditTargetStore.bind(this)
    this.handleDelteTargetStore = this.handleDelteTargetStore.bind(this)
    this.handleConfirmSwitchRules = this.handleConfirmSwitchRules.bind(this)
    this.handleRulesModalText = this.handleRulesModalText.bind(this)
    this.handleImageUpdateSwitch = this.handleImageUpdateSwitch.bind(this)
    this.handleloadImageUpdateList = this.handleloadImageUpdateList.bind(this)
    this.handleDeleteImageUpdataRules = this.handleDeleteImageUpdataRules.bind(this)
    this.handleSelcetOnchange = this.handleSelcetOnchange.bind(this)
    this.handleRadioGroupChange = this.handleRadioGroupChange.bind(this)
    this.handleeditImageUpdateRules = this.handleeditImageUpdateRules.bind(this)
    this.handleCreateTargetStore = this.handleCreateTargetStore.bind(this)
    this.handelEidtImageRules = this.handelEidtImageRules.bind(this)
    this.createNewRules = this.createNewRules.bind(this)
    this.handleImageUpdateAddNewRules = this.handleImageUpdateAddNewRules.bind(this)
    this.validationTargetStore = this.validationTargetStore.bind(this)
    this.getLogs = this.getLogs.bind(this)
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
    }
  }

  handleloadImageUpdateList(){
    const { detail, registry, loadImageUpdateList } = this.props
    let projectID = detail.data.projectId
    const body = {
      registry: registry,
      projectID,
    }
    loadImageUpdateList(body)
  }

  componentWillMount() {
    this.handleloadImageUpdateList()
  }

  componentDidMount() {
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

  handleEditTargetStore(){
	  this.setState({
      eidtTargetStore: true,
	  })
  }

  handleDelteTargetStore(){
    console.log('delete')
  }

  handleInputValue(e){
    this.setState({
      inputValue: e.target.value
    })
  }

  handleSearchRules(){
	  const { inputValue } = this.state
    const { rulesData } = this.props
    let newRulesData  = []
    rulesData.map((item, index) => {
	    if(item.name.indexOf(inputValue) > -1){
        newRulesData.push(item)
      }
    })
    this.setState({
      rulesData: newRulesData
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
    },()=>{
      document.getElementById('rulesName').focus()
    })
  }

  handleCancelAddRules(){
    const { form } = this.props
    form.resetFields()
    this.setState({
      addRulesVisible: false,
      testLinkResult: false,
      testLink: false,
    })
  }

  handleCreateTargetStore(values, id, editBody, add){
    const { registry, createTargetStore } = this.props
    let Notification = new NotificationHandler()
    let body = {
      endpoint: values.URLAddress,
      name: values.NewTargetstoreName,
      username: values.userName,
      password: values.passWord,
    }
    createTargetStore(registry, body, {
      success : {
        func: (res) => {
          editBody.target_id = res.data.id
          if(add){
            this.validationTargetStore(true, values, editBody, id)
            return
          }
          this.handelEidtImageRules(id, editBody)
          return
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          if(res.statusCode == 409){
            Notification.error('仓库名称已存在！')
            return
          }
          Notification.error('新仓库创建失败！规则修改失败!')
        }
      }
    })
  }

  handelEidtImageRules(id, body){
    const { editImageUpdateRules, registry } = this.props
    let Notification = new NotificationHandler()
    editImageUpdateRules(registry, id, body, {
      success : {
        func: () => {
          Notification.success('修改规则成功')
          this.handleloadImageUpdateList()
          this.setState({
            addRulesVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          if(res.statusCode = 409){
            Notification.error('存在相同规则，修改规则失败')
            return
          }
          Notification.error('修改规则失败')
        }
      }
    })
  }

  validationTargetStore(createNewTargetStore, body, editBody, id, text){
    const { registry, validationOldTargetStore, validationNewTargetStore } = this.props
    let Notification = new NotificationHandler()
    let abled = false
    if(body.startUse){
      abled = true
    }
    if(createNewTargetStore){
      let testBody = {
        endpoint: body.URLAddress,
        username: body.userName,
        password: body.passWord
      }
      validationNewTargetStore(registry, testBody, {
        success : {
          func: () => {
            if(text){
              this.setState({
                testLink: true,
                testLinkResult: true,
              })
              return
            }
            this.handleImageUpdateAddNewRules(editBody, abled)
          },
          isAsync: true
        },
        failed: {
          func: () => {
            if(text){
              this.setState({
                testLink: true,
                testLinkResult: false,
              })
              return
            }
            Notification.error('新目标仓库未连接，创建规则失败！')
          }
        }
      })
      return
    }
    validationOldTargetStore(registry, id, {
      success : {
        func: () => {
          if(text){
            this.setState({
              testLink: true,
              testLinkResult: true,
            })
            return
          }
          this.handleImageUpdateAddNewRules(editBody, abled)
        },
        isAsync: true
      },
      failed: {
        func: () => {
          if(text){
            this.setState({
              testLink: true,
              testLinkResult: false,
            })
            return
          }
          Notification.error('目标仓库未连接，创建规则失败！')
        }
      }
    })
  }

  handleImageUpdateAddNewRules(addBody, abled){
    const { iamgeUpdateAddNewRules, registry, imageUpdateSwitch, loadImageUpdateList, detail } = this.props
    let Notification = new NotificationHandler()
    let projectID = detail.data.projectId
    let newbody = {
      registry: registry,
      projectID,
    }
    iamgeUpdateAddNewRules(registry, addBody, {
      success : {
        func: () => {
          Notification.success('添加规则成功')
          if(abled){
            loadImageUpdateList(newbody,{
              success : {
                func: (res) => {
                  let id = 0
                  for(let i=0;i<res.data.policies.length;i++){
                    if(res.data.policies[i].name == addBody.name){
                      id = res.data.policies[i].id
                      break
                    }
                  }
                  imageUpdateSwitch(registry, id, {enabled: 1},{
                    success : {
                      func: () => {
                        this.handleCancelAddRules()
                        this.handleloadImageUpdateList()
                      },
                      isAsync: true
                    },
                    failed: {
                      func: () => {

                      }
                    }
                  })
                },
                isAsync: true
              },
              failed: {
                func: () => {

                }
              }
            })
            return
          }
          this.handleloadImageUpdateList()
          this.setState({
            addRulesVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          if(res.statusCode = 409){
            Notification.error('存在相同规则，修改规则失败')
            return
          }
          Notification.error('添加规则失败')
        }
      }
    })
  }

  createNewRules(values){
    const { detail, rulesData, targets } = this.props
    let projectID = detail.data.projectId
    let id = 0
    let editBody = {
      project_id: projectID,
      target_id: 0,
      name: values.rulesName,
      enabled: 0,
    }
    if(values.targetStoreType == "createNewstore"){
      this.handleCreateTargetStore(values, 0, editBody, true)
      return
    }
    for(let i=0; i< targets.length; i++){
      if(values.SelectTargetStore == targets[i].name){
        editBody.target_id = targets[i].id
        id = targets[i].id
        break
      }
    }
    this.validationTargetStore(false, values, editBody, id)
  }

  handleeditImageUpdateRules(values){
    const { registry, rulesData, detail, targets } = this.props
    const { currentKey } = this.state
    let id = rulesData[currentKey].id
    let projectID = detail.data.projectId
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
    if(values.targetStoreType !== "selectTargetStore"){
      this.handleCreateTargetStore(values, id, editBody, false)
      return
    }
    this.handelEidtImageRules(id, editBody)
  }

  handleComfirmAddRules(){
    const { form } = this.props
    const { edit } = this.state
    form.validateFields((errors, values) => {
      if(!!errors){
        return
      }
      if(edit){
        this.handleeditImageUpdateRules(values)
        return
      }
      this.createNewRules(values)
    })
  }

  handelTestStoreLink(){
    const { form, targets } = this.props
    form.validateFields((errors, values) => {
      if(!!errors){
        return
      }

      let createNewTargetStore = true
      let id = 0
      if(values.SelectTargetStore !== "createNewstore"){
        createNewTargetStore = false
        for(let i=0; i< targets.length; i++){
          if(values.SelectTargetStore == targets[i].name){
            id = targets[i].id
            break
          }
        }
      }
      this.validationTargetStore(createNewTargetStore, values, 'none', id, true)
    })
  }

  handlTestLinkResult(){
    const { testLinkResult } = this.state
    if(testLinkResult){
      return <div className='success'><Icon type="check-circle-o icon" />测试连接成功</div>
    }
    return <div className='failed'><Icon type="cross-circle-o icon" />测试连接失败</div>
    return <Spin />
  }

  handleModalFooterDomNodes(){
    const { testLink } = this.state
    return <div>
      <Button  type="primary" className='test' size="large" onClick={this.handelTestStoreLink}>测试仓库连接</Button>
      {
        testLink
        ? <div className='wrap'>{this.handlTestLinkResult()}</div>
        : <span></span>
      }
      <Button size="large" onClick={this.handleCancelAddRules}>取消</Button>
      <Button type="primary" size="large" onClick={this.handleComfirmAddRules}>确定</Button>
    </div>
  }

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
    if(!value){
      return callback('请输入规则名称')
    }
    if(value.length < 3 || value.length > 26){
      return callback('规则名称为3到25个字符')
    }
    callback()
  }

  checkNewTargetstoreNameProps(rule, value, callback){
    //if(!value){
    //  return callback('请输入新目标仓库名称')
    //}
    callback()
  }

  checkURLAddressProps(rule, value, callback){
    if(!value){
      return callback('请输入URL地址')
    }
    if (!/^(http|https):\/\/([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9\-]+(:[0-9]{1,5})?$/.test(value) && !/^(http|https):\/\/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]{1,5})?$/.test(value)) {
      return callback('请填入合法的URL地址')
    }
    callback()
  }

  checkuserNameProps(rule, value, callback){
    if(!value){
      return callback('请输入用户名')
    }
    callback()
  }

  checkpassWordProps(rule, value, callback){
    if(!value){
      return callback('请输入密码')
    }
    callback()
  }

  handleImageUpdateSwitch(currentKey){
    const { registry, imageUpdateSwitch, rulesData, deleteImageUpdateRules } = this.props
    let Notification = new NotificationHandler()
    const { switchTitle } = this.state
    let id = rulesData[currentKey].id

    const body = {
      enabled: 0
    }
    if(switchTitle == '启用'){
      body.enabled = 1
    }
    imageUpdateSwitch(registry, id, body, {
      success : {
        func: () => {
          Notification.success(switchTitle + '规则成功')
          this.handleloadImageUpdateList()
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
    const { registry, rulesData, deleteImageUpdateRules } = this.props
    let Notification = new NotificationHandler()
    let id = rulesData[currentKey].id
    if(rulesData[currentKey].enabled == 1){
      Modal.error({
        title: '提示',
        content: '不能直接删除启用中的规则，请停用后再删除',
      });
      return
    }
    deleteImageUpdateRules(registry, id, {
      success : {
        func: () => {
          Notification.success('删除规则成功')
          this.handleloadImageUpdateList()
          this.setState({
            SwitchRulesVisible: false
          })
        },
        isAsync: true
      },
      failed: {
        func: (err) => {
          Notification.error('删除规则失败')
          this.setState({
            SwitchRulesVisible: false
          })
        }
      }
    })
  }

  handleSelcetOnchange(values){
    const { form, targets } = this.props
    let id = values.split(',')[1]
    let value = values.split(',')[0]
    for(let i=0;i<targets.length;i++){
      if(targets[i].id == id){
        form.setFieldsValue({
          SelectTargetStore: value,
          URLAddress: targets[i].endpoint,
          userName: targets[i].username,
          passWord: '******',
        })
        break
      }
    }
  }

  handleRadioGroupChange(value){
    const { form } = this.props
    const { edit, currentRules } = this.state
    form.setFieldsValue({
      targetStoreType: value.target.value,
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
          passWord: '******',
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
      case '停用':
      case '启用':
        return this.handleImageUpdateSwitch(currentKey)
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
      case 'stop':
        return this.setState({
          switchTitle: '停用',
          SwitchRulesVisible: true,
        })
      case 'delete':
        return this.setState({
          switchTitle: '删除',
          SwitchRulesVisible: true,
        })
      case 'start':
        return this.setState({
          switchTitle: '启用',
          SwitchRulesVisible: true,
        })
      default: return
    }
  }

  handleEditRule(key){
    const { form, rulesData, targets } = this.props
    let targetStore = {}
    for(let i=0;i<targets.length;i++){
      if(rulesData[key].targetId == targets[i].id){
        targetStore.targetName = targets[i].name
        targetStore.URL = targets[i].endpoint
        form.setFieldsValue({
          rulesName: rulesData[key].name,
          description: rulesData[key].description,
          targetStoreType: "selectTargetStore",
          URLAddress: targetStore.URL,
          userName: targets[i].username,
          passWord: '******',
          SelectTargetStore: targetStore.targetName,
        })
        this.setState({
          addRulesVisible: true,
          currentKey: key,
          editDisabled: true,
          editUrlDisabled: true,
          edit: true,
          currentRules: {
            rules: rulesData[key],
            store: targets[i],
          },
          currentRulesEnabled: false,
        })

        if(rulesData[key].enabled){
          this.setState({
            currentRulesEnabled: true,
          })
        }
       return
      }
    }
  }

  getLogs(item){
    const { getTasklogs, registry } = this.props
    getTasklogs(registry, item)
    this.setState({
      logsVisible: true
    })
  }

  render(){
    const { form, rulesData, taskUpdataData, imageUpdateLogs } = this.props
    const { edit, currentRules, currentRulesEnabled } = this.state
    if(!rulesData || !taskUpdataData){
      return <div style={{textAlign:'center'}}><Spin style={{textAlign:'center'}}></Spin></div>
    }
    const { getFieldProps, getFieldValue } = form
    const scope = this
    function formatstatus(status){
      switch(status){
        case 1:
          return <span className='using'><i className="fa fa-circle marginR" aria-hidden="true"></i>启用</span>
        case 0:
          return <span className='stop'><i className="fa fa-circle marginR" aria-hidden="true"></i>停止</span>
        default:
          return <span className='default'><i className="fa fa-circle marginR" aria-hidden="true"></i>异常</span>
      }
    }

    const menu = rulesData.map((item, index) => {
      return <Menu onClick={this.handleDropDownMenu.bind(this,index)}>
        {
          item.enabled == 1
            ? <Menu.Item key="stop" style={{width:'90px'}}><i className="fa fa-stop" aria-hidden="true" style={{ marginRight: '8px'}}></i>停用</Menu.Item>
            : <Menu.Item key="start" style={{width:'90px'}}><i className="fa fa-play" aria-hidden="true" style={{ marginRight: '8px'}}></i>启用</Menu.Item>
        }
        <Menu.Item key="delete" style={{width:'90px'}}><i className="fa fa-trash-o" aria-hidden="true" style={{ marginRight: '8px'}}></i>删除</Menu.Item>
      </Menu>
    })

    const rulesColumn = [
      {
        title:'名称',
        dataIndex:'name',
      },{
        title:'描述',
        dataIndex:'description',
        render: (item) => <div>{ item ? item : '--'}</div>
      },{
        title:'目标名',
        dataIndex:'targetName',
      },{
        title:'上次起始时间',
        dataIndex:'updateTime',
        render: (time) => <div>{formatDate(time)}</div>
      },{
        title:'活动状态',
        dataIndex:'enabled',
        render: (status) => <div>{formatstatus(status)}</div>
      },{
        title:'操作',
        dataIndex:'key',
        render: (row) => <div>
          <Dropdown.Button onClick={this.handleEditRule.bind(this, row)} overlay={menu[row]} type="ghost">
            <i className="fa fa-pencil-square-o handleicon"></i>修改
          </Dropdown.Button>
        </div>
      }
    ]

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
      {
        title:'耗时',
        dataIndex:'timeConsuming',
        render: (item) => <div>{formatDuration(item.begin, item.end, true)}</div>
      },
      {
        title:'创建时间',
        dataIndex:'creationTime',
        render: (time) => <div>{formatDate(time)}</div>
      },
      {
        title:'结束时间',
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
        {validator: this.checkRulesNameProps}
      ]
    })

    const descriptionProps = getFieldProps('description',{
      rules: [
        {required: false},
      ]
    })

    const targetStoreTypeProps = getFieldProps('targetStoreType',{
      initialValue: 'createNewstore'
    })

    const URLAddressProps = getFieldProps('URLAddress',{
      rules: [
        {validator: this.checkURLAddressProps},
      ]
    })

    const userNameProps = getFieldProps('userName',{
      rules: [
        {validator: this.checkuserNameProps},
      ]
    })

    const passWordProps = getFieldProps('passWord',{
      rules: [
        {validator: this.checkpassWordProps},
      ]
    })

    const startUseProps = getFieldProps('startUse',{
      valuePropName:'checked',
      initialValue: false
    })

    let aa = false
    let bb = getFieldValue('targetStoreType')
    if(bb == 'createNewstore'){
      aa = true
    }
    const NewTargetstoreNameProps = getFieldProps('NewTargetstoreName',{
      rules: [
        { validator: this.checkNewTargetstoreNameProps, required: false},
      ]
    })

    const SelcetTargetStoreProps = getFieldProps('SelectTargetStore',{
      rules: [
        {required: !aa, message: '请选择一个目标仓库'},
      ]
    })

    let targetstoretype = getFieldValue('targetStoreType')

    return(
      <div id='imageUpdata'>
        <div className='rules'>
          <div className='header'>
            <Button type="primary" size='large' icon="plus" className='buttonadd' onClick={this.handleAddRules}>添加规则</Button>
            {/*<span className='searchBox'>
              <Input size="large" placeholder='搜索' className='inputStandrd' onPressEnter={this.handleSearchRules}
                onChange={this.handleInputValue}/>
              <Icon type="search" className='iconSearch' onClick={this.handleSearchRules}/>
            </span>*/}
            {
              rulesData.length
              ? <span className='totleNum'>共计：{rulesData.length} 条</span>
              : null
            }
          </div>
          <div className="body">
            <Table
              columns={rulesColumn}
              dataSource={rulesData}
              pagination={{simple: true}}
            />
          </div>
        </div>
        <div className='updataTask'>
          <div className='title'>同步任务</div>
          <div className="header">
            <span className="searchBox">
              <Input size="large" placeholder='搜索' className='inputStandrd' onPressEnter={this.handleSearchRules}
                onChange={this.handleInputValue}/>
              <Icon type="search" className='iconSearch' onClick={this.handleSearchRules}/>
            </span>
            {
              taskUpdataData.length
              ? <span className='totleNum'>共计：{taskUpdataData.length} 条</span>
              : null
            }
          </div>
          <div className="body">
            <Table
              columns={updataTaskColumn}
              dataSource={taskUpdataData}
              pagination={{simple: true}}
            />
          </div>
        </div>

        <Modal
          title={this.state.edit ? '修改规则' : '新建规则'}
          visible={this.state.addRulesVisible}
          closable={true}
          width='460px'
          onCancel={this.handleCancelAddRules}
          maskClosable={false}
          wrapClassName="imageUpdataAddRules"
          footer={this.handleModalFooterDomNodes()}
        >
          <Form>
            <Row className='rulesName standard'>
              <Col span="4" className='title'>规则名称</Col>
              <Col span="20">
                <Form.Item className='value'>
                  <Input size="large" {...rulesNameProps}/>
                </Form.Item>
              </Col>
            </Row>
            <Row className='description'>
              <Col span="4" className='title'>描述</Col>
              <Col span="20" className='valueheight'>
                <Form.Item className='value'>
                  <Input size="large" {...descriptionProps} className='textareaStyle' type="textarea"/>
                </Form.Item>
              </Col>
            </Row>
            <Row className='radioBox'>
              <Col span="4"></Col>
              <Col span="20">
                <Form.Item>
                  <Radio.Group {...targetStoreTypeProps} onChange={this.handleRadioGroupChange}>
                    <Radio value="createNewstore" key="createNewstore" disabled={currentRulesEnabled}>新建目标仓库</Radio>
                    <Radio value="selectTargetStore" key="selectTargetStore">选择已有目标仓库</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row className='targetStore standard'>
              <Col span="4" className='title'>目标仓库<span className='star'>*</span></Col>
              <Col span="20" style={{height:'56px'}}>
                {
                  targetstoretype == 'createNewstore'
                  ? <Form.Item className='value'>
                     <Input {...NewTargetstoreNameProps}/>
                  </Form.Item>
                  : <Form.Item className='value' style={{paddingTop:'0'}}>
                      <Select
                        showSearch
                        {...SelcetTargetStoreProps}
                        placeholder="选择目标仓库"
                        className='widthbox'
                        size='large'
                        style={{width:'320px'}}
                        onChange={this.handleSelcetOnchange}
                        disabled={currentRulesEnabled}
                      >
                        {this.handleSelectOption()}
                      </Select>
                  </Form.Item>
                }
              </Col>
            </Row>
            <Row className='URLAddress standard'>
              <Col span="4" className='title'>URL 地址<span className='star'>*</span></Col>
              <Col span="20">
                <Form.Item className='value'>
                  <Input size="large" {...URLAddressProps} disabled={this.state.editUrlDisabled}/>
                </Form.Item>
              </Col>
            </Row>
            <Row className='userName standard'>
              <Col span="4" className='title'>用户名</Col>
              <Col span="20">
                <Form.Item className='value'>
                  <Input size="large" {...userNameProps} disabled={this.state.editDisabled}/>
                </Form.Item>
              </Col>
            </Row>
            <Row className='passWord standard'>
              <Col span="4" className='title'>密码</Col>
              <Col span="20">
                <Form.Item className='value'>
                  <Input size="large" {...passWordProps} disabled={this.state.editDisabled}/>
                </Form.Item>
              </Col>
            </Row>
            {
              edit
              ? null
              : <Row className='using'>
                <Col span="4"></Col>
                <Col span="20">
                  <Form.Item>
                    <Checkbox {...startUseProps}>创建完成后，立即启用</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            }
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
          <div>
            <div className='tipsone'><Icon type="question-circle-o" className='qusetionIcon'/>{this.handleRulesModalText().text}</div>
            <div className='tipstwo'>请确认继续。</div>
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
      </div>
    )
  }
}

ImageUpdate = Form.create()(ImageUpdate)

function mapStateToProp(state, props) {
  const { harbor } = state
  const { detail, imageUpdate, imageUpdateLogs } = harbor
  const { policies, jobs, targets } = imageUpdate
  return {
    detail,
    rulesData: policies || [],
    taskUpdataData: jobs || [],
    targets: targets || [],
    imageUpdateLogs,
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
})(ImageUpdate)

