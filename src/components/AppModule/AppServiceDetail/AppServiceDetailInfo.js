/* Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppServiceDetailInfo component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import {
  Card, Spin, Icon, Form, Input, Select, Button, Dropdown,
  Menu, Tooltip, Modal, Row, Col, Checkbox, Cascader, Tag
} from 'antd'
import { connect } from 'react-redux'
import classNames from 'classnames'
import QueueAnim from 'rc-queue-anim'
import './style/AppServiceDetailInfo.less'
import { formatDate, cpuFormat, memoryFormat, isResourceQuotaError } from '../../../common/tools'
import { ENTERPRISE_MODE } from '../../../../configs/constants'
import { mode } from '../../../../configs/model'
import { appEnvCheck } from '../../../common/naming_validation'
import { editServiceEnv, loadAutoScale, editServiceVolume, loadServiceDetail, loadAllServices } from '../../../actions/services'
import NotificationHandler from '../../../components/Notification'
import PersistentVolumeClaim from '../../../../kubernetes/objects/persistentVolumeClaim'
import { createStorage } from '../../../actions/storage'
import { getSecrets } from '../../../actions/secrets'
import { Link } from 'react-router'
import ContainerCatalogueModal from '../ContainerCatalogueModal'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import yaml from 'js-yaml'
import { HARBOR_ALL_PROJECT_FAILURE } from '../../../actions/harbor';
import ServiceCommonIntl, { AppServiceDetailIntl, AllServiceListIntl } from '../ServiceIntl'
import { injectIntl,  } from 'react-intl'
import $ from 'jquery'
import ContainerNetwork from '../../../../client/containers/AppModule/AppServiceDetail/ContainerNetwork'

const enterpriseFlag = ENTERPRISE_MODE == mode
const FormItem = Form.Item
const scheduleBySystem = 'ScheduleBySystem'
const scheduleByHostNameOrIP = 'ScheduleByHostNameOrIP'
const scheduleByLabels = 'ScheduleByLabels'
const unknownSchedulePolicy = 'Error'
const Option = Select.Option

class MyComponent extends Component {
  constructor(props){
    super(props)
    this.templateTable = this.templateTable.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleCancleEdit = this.handleCancleEdit.bind(this)
    this.handleSaveEdit = this.handleSaveEdit.bind(this)
    this.addNewEnv = this.addNewEnv.bind(this)
    this.ModalDeleteOk = this.ModalDeleteOk.bind(this)
    this.ModalDeleteCancel = this.ModalDeleteCancel.bind(this)
    this.envNameCheck = this.envNameCheck.bind(this)
    this.editServiceConfirm = this.editServiceConfirm.bind(this)
    this.state = {
      rowDisableArray : [],
      dataArray : [],
      saveBtnLoadingArray : [],
      ModalDeleteVisible : false,
      DeletingEnvName : '',
      DeletingEnvIndex : '',
      buttonLoading : false,
      appEditBtn: false,
      appEditLoading: false
    }
  }

  componentWillMount(){
    const { serviceDetail, currentCluster, getSecrets } = this.props
    const containers = serviceDetail.spec.template.spec.containers[0].env
    let rowDisableArray = []
    let dataArray = []
    let saveBtnLoadingArray = []
    if(containers){
      for(let i=0; i<containers.length; i++){
        rowDisableArray.push({disable : false})
        dataArray.push(containers[i])
        saveBtnLoadingArray.push({loading : false})
      }
    }
    this.setState({
      rowDisableArray,
      dataArray,
      saveBtnLoadingArray,
    })
    getSecrets(currentCluster.clusterID)
  }
  handleEdit(index){
    const { rowDisableArray, dataArray } = this.state
    rowDisableArray[index].disable = true
    dataArray[index].edit = true
    this.setState({
      rowDisableArray,
      dataArray,
    })
  }

  handleCancleEdit(index){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    const { form } = this.props
    const { getFieldValue } = form
    let name = getFieldValue(`envName${index}`)
    let value = getFieldValue(`envValue${index}`)
    /* if(name == undefined || value == undefined || name == '' || value == ''){
      dataArray.splice(index,1)
      rowDisableArray.splice(index,1)
      saveBtnLoadingArray.splice(index,1)
      this.setState({
        dataArray,
        rowDisableArray,
        saveBtnLoadingArray,
      })
      return
    } */
    // LOT-2805
    const valueArr = []
    dataArray.forEach((v, i) => {
      const nameItem = document.getElementById(`envName${i}`)
      const valueItem = document.getElementById(`envValue${i}`)
      valueArr.push({
        name: nameItem.value,
        value: valueItem.value,
      })
    })
    // LOT-2805
    if(dataArray[index].flag == true){
      dataArray.splice(index,1)
      valueArr.splice(index,1) // LOT-2805
      rowDisableArray.splice(index,1)
      saveBtnLoadingArray.splice(index,1)
      this.setState({
        dataArray,
        rowDisableArray,
        saveBtnLoadingArray,
      },() => {
        if (dataArray.length !== 0) {
          document.getElementById('envName0').value = valueArr[0].name // LOT-2805
          document.getElementById('envValue0').value = valueArr[0].value // LOT-2805
        }
      })
      return
    }
    rowDisableArray[index].disable = false
    this.setState({
      rowDisableArray
    })
  }
  editServiceConfirm(){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    const { serviceDetail, cluster, editServiceEnv, formatMessage } = this.props
    const Notification = new NotificationHandler()
    this.setState({appEditLoading: true})
    /* if(dataArray.length > 1 && (dataArray[dataArray.length-1].name == '' || dataArray[dataArray.length-1].value == '' )){

      new NotificationHandler().error("请先保存新增的环境变量")
      return
    } */
    let body = {
      clusterId : cluster,
      service : serviceDetail.metadata.name,
      arr : dataArray
    }
    editServiceEnv(body,{
      success : {
        func : () => {
          Notification.success(formatMessage(AppServiceDetailIntl.envChangeSuccess))
          this.setState({
            rowDisableArray,
            dataArray,
            saveBtnLoadingArray,
            appEditBtn: false,
            appEditLoading: false
          })
        },
        isAsync : true
      },
      failed : {
        func : () => {
          Notification.error(formatMessage(AppServiceDetailIntl.envChangeFailure))
          this.setState({
            rowDisableArray,
            saveBtnLoadingArray,
            appEditLoading: false
          })
        },
        isAsync : true
      }
    })
  }
  handleSaveEdit(index){
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    const { form, formatMessage } = this.props
    const { getFieldValue } = form
    const Notification = new NotificationHandler()
    let name = getFieldValue(`envName${index}`)
    let value = getFieldValue(`envValue${index}`)
    if(name == '' || name == undefined){
      Notification.error(formatMessage(AppServiceDetailIntl.variableNameNotEmpty))
      return
    }
    for(let i=0; i<dataArray.length; i++ ){
      if(dataArray[i].name == name){
        if(dataArray[index].edit == true){
          break
        }
        Notification.error(formatMessage(AppServiceDetailIntl.variableNameExist))
        return
      }
    }
    saveBtnLoadingArray[index].loading = true
    dataArray[index].name = name
    if (Array.isArray(value)) {
      dataArray[index].valueFrom = {
        secretKeyRef: {
          name: value[0],
          key: value[1],
        }
      }
    } else {
      dataArray[index].value = value
    }
    this.setState({
      saveBtnLoadingArray,
      appEditBtn: true
    },()=>{
      setTimeout(()=>{
        saveBtnLoadingArray[index].loading = false
        rowDisableArray[index].disable = false
        delete dataArray[index].flag
        delete dataArray[index].edit
        this.setState({
          rowDisableArray,
          dataArray,
          saveBtnLoadingArray,
        })
      },300)
    })
  }
  addNewEnv(){
    const {  formatMessage} = this.props
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    if(dataArray.length > 1 && (dataArray[dataArray.length-1].name == '' || dataArray[dataArray.length-1].value == '' )){
      new NotificationHandler().error(formatMessage(AppServiceDetailIntl.saveNewEnv))
      return
    }
    rowDisableArray.push({disable : true})
    saveBtnLoadingArray.push({loading : false})
    dataArray.push({name:'',value:'',flag:true})
    this.setState({
      rowDisableArray,
      dataArray,
      saveBtnLoadingArray
    },()=>{
      document.getElementById(`envName${dataArray.length-1}`).focus()
    })
  }

  handleDelete(index,name){
    this.setState({
      DeletingEnvName : name,
      DeletingEnvIndex : index,
      ModalDeleteVisible : true
    })
  }

  ModalDeleteOk(){
    const { rowDisableArray, dataArray, DeletingEnvIndex, saveBtnLoadingArray } = this.state

    rowDisableArray.splice(DeletingEnvIndex,1)
    dataArray.splice(DeletingEnvIndex,1)
    saveBtnLoadingArray.splice(DeletingEnvIndex,1)
    this.setState({
      buttonLoading : true,
      ModalDeleteVisible : false,
      appEditBtn: true
    },()=>{
      setTimeout(()=>{
        this.setState({
          rowDisableArray,
          dataArray,
          saveBtnLoadingArray,
          buttonLoading : false,
        })
      })
    },300)
  }

  ModalDeleteCancel(){
    this.setState({
      ModalDeleteVisible : false
    })
  }

  envNameCheck(rule, value, callback) {
    const { dataArray } = this.state
    const { formatMessage } = this.props
    let flag = false
    let errorMsg = appEnvCheck(value, formatMessage(AppServiceDetailIntl.envVariable));
    if(value == ''){
      callback(new Error(formatMessage(AppServiceDetailIntl.VariableNameCanNotEmpty)))
    }
    for(let i=0; i<dataArray.length; i++ ){
      if(dataArray[i].name == value){
        callback(new Error(formatMessage(AppServiceDetailIntl.variableNameExist)))
      }
    }
    if(errorMsg == 'success') {
      callback()
    } else {
      callback(new Error([errorMsg]));
    }
  }

  templateTable(dataArray,rowDisableArray, appCenterChoiceHidden) {
    const { formatMessage } = this.props
    if(dataArray.length == 0) {
      return <div className='noData'>{formatMessage(AppServiceDetailIntl.NoEnvVariable)}</div>
    }
    const { form, secretsOptions } = this.props
    const { getFieldProps, getFieldValue, resetFields } = form
    const ele = []
    dataArray.forEach((env,index) => {
      const editMenu = <Menu style={{width:'100px'}} onClick={() => this.handleEdit(index)}>
        <Menu.Item key="1"><Icon type="edit" />&nbsp;{formatMessage(ServiceCommonIntl.edit)}</Menu.Item>
      </Menu>
      let value = env.value
      if (env.valueFrom && env.valueFrom.secretKeyRef) {
        value = [ env.valueFrom.secretKeyRef.name, env.valueFrom.secretKeyRef.key ]
      }
      const valueString = Array.isArray(value) ? value.join('/') : value
      const envValueProps = getFieldProps(`envValue${index}`, {
        initialValue: value
      })
      const envValueTypeProps = getFieldProps(`envValueType${index}`, {
        initialValue: env.valueFrom ? 'secret' : 'normal',
        onChange: () => resetFields([ `envValue${index}` ]),
      })
      const envValueType = getFieldValue(`envValueType${index}`)
      const envValueInputClass = classNames({
        hide: envValueType !== 'normal',
      })
      const envValueSelectClass = classNames('ant-input-wrapper ant-input-group', {
        hide: envValueType !== 'secret',
      })
      const selectBefore = (
        <Select
          {...envValueTypeProps}
          style={{ width: 80 }}
          size="default"
        >
          <Option value="normal">{formatMessage(AppServiceDetailIntl.commonVariable)}</Option>
          <Option value="secret">{formatMessage(AppServiceDetailIntl.encryptionVariable)}</Option>
        </Select>
      )

      ele.push(
        <div className="dataBox" key={index}>
          <div className="commonTitleName">
            {
              rowDisableArray[index].disable
              ?<FormItem>
                <Input id={`envName${index}`} {...getFieldProps(`envName${index}`, {
                  initialValue:env.name,
                  rules: [{ validator: this.envNameCheck },],
                })} placeholder={env.name} size="default"/>
              </FormItem>
              :<Tooltip title={env.name} placement="topLeft">
                <span>{env.name}</span>
              </Tooltip>
            }
          </div>
          <div className="commonTitleValue ">
            {
              rowDisableArray[index].disable
              ?<FormItem>
                <span className={envValueInputClass}>
                  <Input
                    size="default"
                    placeholder={formatMessage(AppServiceDetailIntl.pleaseInputValue)}
                    {...envValueProps}
                    addonBefore={selectBefore}
                  />
                </span>
                <span className={envValueSelectClass}>
                  <span className="ant-input-group-addon">
                    {selectBefore}
                  </span>
                  <Cascader
                    {...envValueProps}
                    placeholder={formatMessage(AppServiceDetailIntl.pleaseChoiceEncryptionObject)}
                    options={secretsOptions}
                  />
                </span>
              </FormItem>
              : <span style={{width:'33%'}}>
                {
                  Array.isArray(value) &&
                  <a>
                    <Tooltip title={formatMessage(AppServiceDetailIntl.encryptionVariable)} placement="top">
                      <i className="fa fa-key" />
                    </Tooltip>
                  </a>
                }
                &nbsp;
                <Tooltip title={valueString} placement="topLeft">
                  <span>{valueString || ' '}</span>
                </Tooltip>
              </span>
            }
          </div>
          <div>
            { appCenterChoiceHidden? null :
              rowDisableArray[index].disable
              ? <div>
                <Button type='primary' className='saveBtn' onClick={() => this.handleSaveEdit(index)} loading={this.state.saveBtnLoadingArray[index].loading}>{formatMessage(ServiceCommonIntl.save)}</Button>
                <Button onClick={() => this.handleCancleEdit(index)}>{formatMessage(ServiceCommonIntl.cancel)}</Button>
              </div>
              : <Dropdown.Button type="ghost" overlay={editMenu} className='editButton' onClick={() => this.handleDelete(index,env.name)}>
                  <Icon type="delete" />{formatMessage(ServiceCommonIntl.delete)}
                </Dropdown.Button>
            }
          </div>
          <div className='checkbox'></div>
        </div>
      )
    })
  return ele
  }
  render(){
    const { DeletingEnvName } = this.state
    const { formatMessage } = this.props
    const {appCenterChoiceHidden = false} = this.props
    return (
      <div className='DetailInfo__MyComponent commonBox'>
          <span className="titleSpan">{formatMessage(AppServiceDetailIntl.envVariable)}</span>
          <div className={classNames("editTip",{'hide' : !this.state.appEditBtn})}>{formatMessage(AppServiceDetailIntl.changeNoEffect)}</div>
        <div className='save_box'>
        {!appCenterChoiceHidden &&
          <Button size="large" type="primary" disabled={this.state.appEditBtn ? false : true} loading={this.state.appEditLoading} onClick={this.editServiceConfirm} className='title_button'>{formatMessage(AppServiceDetailIntl.appChange)}</Button>
        }
        </div>
          <div className="titleBox">
            <div className="commonTitle">
              {formatMessage(AppServiceDetailIntl.variableName)}
            </div>
            <div className="commonTitle">
              {formatMessage(AppServiceDetailIntl.variableValue)}
            </div>
            { !appCenterChoiceHidden &&
            <div className="commonTitle">
              {formatMessage(ServiceCommonIntl.operation)}
            </div>
            }
            <div style={{ clear: 'both' }}></div>
          </div>
        <div>
          <Form>
            {this.templateTable(this.state.dataArray,this.state.rowDisableArray, appCenterChoiceHidden)}
          </Form>
        </div>
        {!appCenterChoiceHidden &&
        <div className="pushRow">
          <a onClick={this.addNewEnv}><Icon type="plus" />{formatMessage(AppServiceDetailIntl.addEnvVariable)}</a>
        </div>
        }
        <Modal
          title={formatMessage(AppServiceDetailIntl.deleteEnvVariableOperation)}
          wrapClassName="ModalDeleteInfo"
          visible={this.state.ModalDeleteVisible}
          onOk={this.ModalDeleteOk}
          onCancel={this.ModalDeleteCancel}
          footer={[
            <Button
              key="back"
              type="ghost"
              size="large"
              onClick={this.ModalDeleteCancel}>
              {formatMessage(ServiceCommonIntl.cancel)}
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              loading={this.state.buttonLoading}
              onClick={this.ModalDeleteOk}>
              {formatMessage(ServiceCommonIntl.confirm)}
            </Button>,
          ]}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            {formatMessage(AppServiceDetailIntl.deleteEnvVariableInfo, { DeletingEnvName })}
          </div>
        </Modal>
      </div>
    )
  }
}
// MyComponent = Form.create()(MyComponent)

function mapStateToProp(state, props){
  const { entities, secrets } = state
  const { current } = entities
  const { cluster } = current
  const defaultConfigList = {
    isFetching: false,
    cluster: cluster.clusterID,
    configGroup: [],
  }
  let secretsList = secrets.list[cluster.clusterID] || {}
  secretsList = secretsList.data || []
  const secretsOptions = secretsList.map(secret => ({
    value: secret.name,
    label: secret.name,
    disabled: !secret.data,
    children: !secret.data
      ? []
      : Object.keys(secret.data).map(key => ({
        value: key,
        label: key,
      }))
  }))
  if (secretsOptions.length === 0) {
    secretsOptions.push({
      value: 'empty',
      value: '无加密对象',
      disabled: true,
    })
  }
  return {
    currentCluster: cluster,
    secretsList,
    secretsOptions,
  }
}

MyComponent = connect(mapStateToProp, {
  editServiceEnv,
  getSecrets,
})(MyComponent)

class BindNodes extends Component {
  constructor(props) {
    super(props)
    this.getSchedulingPolicy = this.getSchedulingPolicy.bind(this)
    this.getNodeAffinityLabels = this.getNodeAffinityLabels.bind(this)
    this.getNodeSelectorTarget = this.getNodeSelectorTarget.bind(this)
    this.template = this.template.bind(this)
    this.labelsTemplate = this.labelsTemplate.bind(this)
    this.showServiceNodeLabels = this.showServiceNodeLabels.bind(this)
    this.state = {
      bindNodesData: {}
    }
  }

  getSchedulingPolicy(data) {
    const template = data.spec.template
    const spec = template.spec
    // const labels = this.getNodeAffinityLabels(spec)
    const node = this.getNodeSelectorTarget(spec)
    const haveLabel = this.getLabelType(spec)
    const policy = {
      type: scheduleBySystem,
    }
    if (haveLabel && haveLabel.labelType) {
      policy.type = haveLabel.labelType
      policy.data = haveLabel.data
    }
    if (node) {
      // Check node policy first
      policy.type = scheduleByHostNameOrIP
      policy.node = node
    }
    // else if (labels) {
    //   // Then check label policy
    //   policy.type = scheduleByLabels
    //   policy.labels = labels
    // }
    return policy
  }
  getLabelType(spec) {
    if (!spec.affinity) {
      return
    }
    let labelType = ''
    const nodeData = this.getNodeListData(spec)
    const podData = this.getPodListData(spec)
    const podAntiData = this.getPodAntiListData(spec)
    if ( (nodeData.preferTag.length ||  nodeData.requireTag.length) && (podData.podReqList.length || podData.podPreList.length || podAntiData.reqAntiData.length || podAntiData.preAntiData.length)  ) {
      labelType = 'all'
    }else if ( nodeData.preferTag.length ||  nodeData.requireTag.length  ) {
      labelType = 'node'
    }else if (podData.podReqList.length || podData.podPreList.length || podAntiData.reqAntiData.length || podAntiData.preAntiData.length ) {
      labelType = 'pod'
    }
    return {
      labelType,
      data:{
        nodeData,
        podData,
        podAntiData
      }
    }
  }

  getNodeListData(spec) {
    const requireTag = []
    const preferTag = []
    const preData = spec.affinity.nodeAffinity.preferredDuringSchedulingIgnoredDuringExecution || {}
    const ln = Object.keys(preData)
    if (ln.length>0) {
      preData[0].preference.matchExpressions.map( item=>{
        preferTag.push(item)
      })
    }
    const reqFlag = spec.affinity.nodeAffinity && spec.affinity.nodeAffinity.hasOwnProperty('requiredDuringSchedulingIgnoredDuringExecution')
    if (reqFlag) {
      const reqData = spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution
      reqData.nodeSelectorTerms[0].matchExpressions.map( item=>{
        requireTag.push(item)
      })
    }
    return {
      requireTag,
      preferTag
    }
  }
  getPodListData(spec) {
    const podPreList = []
    const podReqList = []
    let podPreData = []
    let podReqData = []
    if (spec.affinity.podAffinity) {
      podPreData = spec.affinity.podAffinity.preferredDuringSchedulingIgnoredDuringExecution || []
      podReqData = spec.affinity.podAffinity.requiredDuringSchedulingIgnoredDuringExecution || []
    }
    if (podPreData.length>0) {
      podPreData[0].podAffinityTerm.labelSelector.matchExpressions.map( item=>{
        podPreList.push(item)
      })
    }
    if (podReqData.length>0) {
      podReqData[0].labelSelector.matchExpressions.map( item=>{
        podReqList.push(item)
      })
    }
    return {
      podReqList,
      podPreList
    }
  }

  getPodAntiListData(spec) {
    const preAntiData = []
    const reqAntiData = []
    let podPreData = []
    let podReqData = []
    if (spec.affinity.podAntiAffinity) {
      podPreData = spec.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution || []
      podReqData = spec.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution || []
    }
    if (podPreData && podPreData.length>0) {
      podPreData[0].podAffinityTerm.labelSelector.matchExpressions.map( item=>{
        preAntiData.push(item)
      })
    }
    if (podReqData && podReqData.length>0) {
      podReqData[0].labelSelector.matchExpressions.map( item=>{
        reqAntiData.push(item)
      })
    }
    return {
      reqAntiData,
      preAntiData
    }
  }
  getNodeSelectorTarget(spec) {
    const hostNameKey = 'kubernetes.io/hostname'
    if (!spec || !spec.hasOwnProperty('nodeSelector')
    || !spec.nodeSelector.hasOwnProperty(hostNameKey)) {
      return null
    }
    return spec.nodeSelector[hostNameKey]
  }

  getNodeAffinityLabels(spec) {
    if (!spec.affinity) {
      return null
    }
    const affinity = spec.affinity
    const requiredDSIE = affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution
    const labels = requiredDSIE && requiredDSIE.nodeSelectorTerms.reduce(
      (expressions, term) => expressions.concat(term.matchExpressions), []).reduce(
      (labels, expression) => {
        expression.values.map((value, index) => {
          // Only show IN operator for now
          if (expression && expression.operator === "In") {
            labels = labels.concat({
              key: expression.key,
              operator: expression.operator,
              value
            })
          }
        })
        return labels
      }, [])
    return labels && labels.length > 0 ? labels : null
  }

  labelsTemplate(labels) {
    let arr = labels.map((item, index) => {
      if (item) {
        // Only show IN operator for now
        return <div key={index} className='label'>
          <span>{item.key}</span>
          <span> : </span>
          <span>{item.value}</span>
        </div>
      }
    })
    return arr
  }
  showLabelValues(item) {
    //( 'item----', item.operator, item.values ,JSON.stringify(item))
    const cloneItem = cloneDeep(item)
    if (cloneItem.operator=='In' || cloneItem.operator=='NotIn') {
      return  cloneItem.key + ' ' + cloneItem.operator + ' ' + cloneItem.values[0]

    }else if (cloneItem.operator=='Gt' || cloneItem.operator=='Lt') {
      if (cloneItem.operator=='Gt') {
        cloneItem.operator = '>'
      }else if (cloneItem.operator=='<') {
        cloneItem.operator = '<'
      }
      return  cloneItem.key + ' ' + cloneItem.operator + ' ' + cloneItem.values[0]
    }else if (cloneItem.operator=='Exists' || cloneItem.operator=='DoesNotExist') {
      return cloneItem.key + ' ' + cloneItem.operator
    }
  }
  showServiceNodeLabels(data) {
    const { nodeData } = data
    return <span>
      {
        nodeData.preferTag.length > 0 ?
        nodeData.preferTag.map( (item,index)=>{
          return <Tag closable={false} className='preferedTag' key={item.key+ item.operator + item.index}> 最好 | {this.showLabelValues(item)} </Tag>
        })
        : null
      }
      {
        nodeData.requireTag.length > 0 ?
        nodeData.requireTag.map( item=>{
          return <Tag closable={false} color="blue" key={item.index + item.key+ item.operator }> 必须 | {this.showLabelValues(item)} </Tag>
        })
        : null
      }
      </span>
  }
  showServicePodAffinityLabel(data) {
    const { podAntiData, podData } = data
    return <span>
      {
        podData.podPreList.length>0 ?
        podData.podPreList.map( item=>{
          return <Tag closable={false} className='preferedTag' key={'prefered'+item.key+ item.operator + + item.index}> 最好 | {this.showLabelValues(item)} </Tag>
        })
        : null
      }
      {
        podData.podReqList.length>0 ?
        podData.podReqList.map( item=>{
          return <Tag closable={false} color="blue" key={'required'+item.key+ item.operator + item.index}> 必须 | {this.showLabelValues(item)} </Tag>
        })
        : null
      }
      {
        podAntiData.preAntiData.length>0 ?
        podAntiData.preAntiData.map( item=>{
          return <Tag closable={false} className='preferAntiTag' key={'preferAnti'+item.key+ item.operator + item.index}> 最好不 | {this.showLabelValues(item)} </Tag>
        })
        : null
      }
      {
        podAntiData.reqAntiData.length>0 ?
        podAntiData.reqAntiData.map( item=>{
          return <Tag closable={false} className='requireAntiTag' key={ 'reuqiredAnti'+ item.key+ item.operator + item.index}> 必须不 | {this.showLabelValues(item)} </Tag>
        })
        : null
      }
    </span>
  }
  template() {
    const { serviceDetail, formatMessage } = this.props
    let bindNodesData = this.getSchedulingPolicy(serviceDetail)
    switch (bindNodesData.type) {
      case "ScheduleBySystem":
        return <span>
          <div className="commonTitle">--</div>
          <div>{formatMessage(AppServiceDetailIntl.systemDefaultDispatch)}</div>
        </span>
      case 'all':
        return <span>
          <div className="pointManage">
            <div className="commonTitle">{formatMessage(AppServiceDetailIntl.serviceNodeTag)}</div>
            <div className="commonCont">
            {
              this.showServiceNodeLabels( bindNodesData.data )
            }
            </div>
          </div>
          <div className="pointManage">
            <div className="commonTitle">{formatMessage(AppServiceDetailIntl.serviceAndServiceTag)}</div>
            <div className="commonCont">
              {
                this.showServicePodAffinityLabel( bindNodesData.data )
              }
            </div>
          </div>
        </span>
      case 'node':
        return <span>
          <div className="pointManage">
            <div className="commonTitle">{formatMessage(AppServiceDetailIntl.serviceNodeTag)}</div>
            <div className="commonCont">
            {
              this.showServiceNodeLabels( bindNodesData.data )
            }
            </div>
          </div>
        </span>
      case 'pod':
        return <span>
          <div className="pointManage">
            <div className="commonTitle">{formatMessage(AppServiceDetailIntl.serviceAndServiceTag)}</div>
            <div className="commonCont">
              {
                this.showServicePodAffinityLabel( bindNodesData.data )
              }
            </div>
          </div>
      </span>
      case "ScheduleByHostNameOrIP":
        return <span>
          <div className="commonTitle">{formatMessage(AppServiceDetailIntl.HostNameAndIp)}</div>
          <div>{bindNodesData.node}</div>
        </span>
      case "ScheduleByLabels":
        return <span>
          <div>
            <div className="commonTitle bindnodeTitle">{formatMessage(AppServiceDetailIntl.HostTag)}</div>
            <div>{this.labelsTemplate(bindNodesData.labels)}</div>
          </div>
        </span>
      case "Error":
      default:
        return <span>
          <div className="commonTitle">--</div>
          <div>--</div>
        </span>
    }
  }

  render() {
    const { formatMessage } = this.props
    return <div className='commonBox bindNodes'>
      <span className="titleSpan">{formatMessage(AppServiceDetailIntl.NodeDispatch)}</span>
      <div className="titleBox">
        <div className="commonTitle">
          {formatMessage(AppServiceDetailIntl.bindPatter)}
        </div>
        <div className="commonTitle">
          {formatMessage(AppServiceDetailIntl.bindObject)}
        </div>
        <div style={{ clear: 'both' }}></div>
      </div>
      <div className='dataBox'>
        {this.template()}
      </div>
    </div>
  }
}

class AppServiceDetailInfo extends Component {
  constructor(props) {
    super(props)
    this.callbackFields = this.callbackFields.bind(this)
    this.getAutoScaleStatus = this.getAutoScaleStatus.bind(this)
    this.loadServiceList = this.loadServiceList.bind(this)
    this.state={
      volumeList: [],
      isEdit: false,
      currentItem: {},
      currentIndex: undefined,
      containerCatalogueVisible: false,
      nouseEditing: true,
      loading: false,
      isAutoScale: false,
      replicas: 1,
      currentService: '',
      isBindNode: false,
      menuAnchors: [],
      activeButton: ''
    }
  }

  getAutoScaleStatus(cluster, serviceName){
    const { loadAutoScale } = this.props
    loadAutoScale(cluster, serviceName, {
      success: {
        func: res => {
          if (!isEmpty(res.data)) {
            const { metadata } = res.data
            const { status } = metadata.annotations
            this.setState({
              isAutoScale: status == 'RUN',
            })
          }
        }
      }
    })
  }

  getServiceDetail(cluster, serviceName){
    const { loadServiceDetail } = this.props
    loadServiceDetail(cluster, serviceName, {
      success: {
        func: (res) => {
          let volumeList = []
          let volumeMounts = []
          let newService = false
          let oldService = false
          const volume = res.data.volume || []
          if(res.data && res.data.spec){
            this.setState({
              replicas: res.data.spec.replicas
            })
          }
          if(res.data
            && res.data.spec
            && res.data.spec.template
            && res.data.spec.template.spec
          ){
            // 获取当前服务绑定节点的情况
            if(res.data.spec.template.spec.nodeSelector){
              this.setState({
                isBindNode: true
              })
            }
            // 获取服务存储的 容器目录 及 存储卷信息
            if(
              res.data.spec.template.spec.containers
              && res.data.spec.template.spec.containers[0]
              && res.data.spec.template.spec.containers[0].volumeMounts
            ){
              volumeMounts = res.data.spec.template.spec.containers[0].volumeMounts
              volumeList = res.data.spec.template.spec.volumes || []
            }
          }
          // 为兼容旧服务，需要在 spec 不同的位置取当前服务的 container
          const list = [];
          volumeList.forEach((item, index) => {
            let mountPath = ''
            let readOnly = false
            let size = 512
            let fsType = 'ext4'
            // 当前存储卷的挂载路径、读写情况
            for(let i = 0; i < volumeMounts.length; i++){
              if(item.name == volumeMounts[i].name){
                mountPath = volumeMounts[i].mountPath
                readOnly = volumeMounts[i].readOnly || false
              }
            }
            // 新存储
            if(item.persistentVolumeClaim || item.hostPath){
              let strategy = false
              let claimName = '-'
              let type = 'host'
              let type_1 = ''
              let isGfs = false
              if(item.persistentVolumeClaim){
                strategy = item.persistentVolumeClaim.strategy
                claimName = item.persistentVolumeClaim.claimName
                for(let i = 0; i < volume.length; i++){
                  if(volume[i].volumeName == claimName){
                    type = volume[i].srType
                    type_1 = volume[i].storageType
                    size = volume[i].size
                    fsType = volume[i].fsType
                    if(type_1 === "glusterfs"){ isGfs = true }
                  }
                }
              }
              // if(type == 'private'){
              //   type_1 = 'rbd'
              // } else {
              //   type_1 = 'nfs'
              // }
              const container = {
                mountPath,
                readOnly,
                strategy,
                type,
                type_1,
                //volume: `${claimName} ${fsType} ${size}`,
                volume: `${claimName} ${fsType}`,
                isOld: false,
                volumesName: item.name,
                size,
                fsType,
                claimName,
                storageType: type,
                hostPath: mountPath,
              }
              if(isGfs){ container.volume = `${claimName} ${fsType} ${size}` }
              // 过滤掉 hostPath 的 path 为 '/etc/localtime' 和 '/etc/timezone' 的情况
              if(item.hostPath){
                if(item.hostPath.path !== '/etc/localtime' && item.hostPath.path !== '/etc/timezone'){
                  list.push(container)
                }
              }
              if(item.persistentVolumeClaim){
                list.push(container)
              }
            }
            // 老存储
            if(item.rbd){
              const { strategy, image, fsType } = item.rbd
              const imageArray = image.split('.')
              const currentVolume = imageArray[imageArray.length - 1]
              // @todo 缺少旧服务存储卷的大小
              const container = {
                mountPath,
                readOnly,
                strategy,
                type: 'private',
                type_1: 'rbd',
                volume: currentVolume,
                isOld: true,
                volumesName: item.name,
                storageType: 'private',
                hostPath: mountPath,
                fsType,
              }
              list.push(container)
            }
          })
          this.setState({
            volumeList: list
          })
        }
      },
      failed: {
        func: () => {
          this.setState({
            volumeList: []
          })
        }
      }
    })
  }

  componentWillMount() {
    const { cluster, serviceName } = this.props
    this.getServiceDetail(cluster, serviceName)
    this.getAutoScaleStatus(cluster, serviceName)
    this.setState({
      currentService: serviceName
    })
  }
  componentDidMount() {
    // const { serviceDetail } = this.props
    const titles = document.getElementsByClassName('titleSpan')
    const commonBoxes = document.getElementsByClassName('commonBox')
    this.setState({
      activeButton: titles[0].innerText
    })

    const menus = []
    for (let i=0; i<titles.length; i++) {
      menus.push({
        name: titles[i].innerHTML,
        top: commonBoxes[i].offsetTop
      })
    }

    this.setState({
      menuAnchors: menus
    })

  }

  componentWillReceiveProps(nextProps) {
    if(this.props.serviceName !== nextProps.serviceName){
      this.setState({
        currentService: nextProps.serviceName
      })
    }
    if(
      (this.props.activeTabKey !== '#basic' && nextProps.activeTabKey == '#basic')
      || (this.props.modalShow !== nextProps.modalShow && nextProps.modalShow)
    ){
      this.getServiceDetail(nextProps.cluster, nextProps.serviceName)
      this.getAutoScaleStatus(nextProps.cluster, nextProps.serviceName)
      this.setState({
        nouseEditing: true,
        loading: false,
      })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.activeTabKey == '#basic'){
      return true
    } else {
      return false
    }
  }

  editContainerCatalogue(item, index){
    this.setState({
      isEdit: true,
      currentItem: item,
      currentIndex: index,
      containerCatalogueVisible: true,
    })
  }

  openDeleteModal(item, index){
    this.setState({
      currentItem: item,
      currentIndex: index,
      deleteVisible: true,
    })
  }

  deleteContainerCatalogue(){
    const { volumeList, currentIndex } = this.state
    const list = cloneDeep(volumeList)
    list.splice(currentIndex, 1)
    this.setState({
      volumeList: list,
      deleteVisible: false,
      nouseEditing: false,
    })
  }

  formatVolumeType(type, type_1){
    const { formatMessage } = this.props.intl
    switch(type){
      case 'private':
        return <span>{formatMessage(AppServiceDetailIntl.privateCache)}</span>
      case 'share':
        if(!!type_1 && type_1 === 'glusterfs')
        {
          return <span>{formatMessage(AppServiceDetailIntl.privateCacheNFS)}</span>
        }
        else{
          return <span>{formatMessage(AppServiceDetailIntl.shareCacheNFS)}</span>
        }
      case 'host':
        return <span>{formatMessage(AppServiceDetailIntl.localStorage)}</span>
      default:
        return <span>{formatMessage(AppServiceDetailIntl.unknown)}</span>
    }
  }

  renderVolumeName(item){
    if(item.type == 'host'){
      return '-'
    }
    if(item.volume == 'create'){
      return item.name
    }
    return item.volume.split(' ')[0]
  }

  getMount(appCenterChoiceHidden) {
    const { volumeList } = this.state
    const { formatMessage } = this.props.intl
    let ele = []
    if(!Object.keys(volumeList).length){
      return <div style={{ textAlign: 'center'}}>{formatMessage(AppServiceDetailIntl.noCacheVolume)}</div>
    }
    ele = volumeList.map((item, index) => {
      return <Row key={`volume${index}`} className='volume_row_style'>
        <Col span="5" className='text_overfow'>{ this.formatVolumeType(item.type, item.type_1) }</Col>
        <Col span="5" className='text_overfow'>{ this.renderVolumeName(item) }</Col>
        <Col span="5" className='text_overfow'>{item.mountPath}</Col>
        <Col span="4" className='text_overfow'>{item.readOnly ? formatMessage(AppServiceDetailIntl.readOnly) :
        formatMessage(AppServiceDetailIntl.readWrite) }</Col>
        { !(appCenterChoiceHidden || false) &&
        <Col span="5">
          {/* <Checkbox checked={item.readOnly} disabled>{formatMessage(AppServiceDetailIntl.readOnly)}</Checkbox> */}
          <Button
            type="dashed"
            icon="edit"
            className='handle_button'
            style={{ marginLeft: 0 }}
            onClick={this.editContainerCatalogue.bind(this, item, index)}
          />
          <Button
            type="dashed"
            icon="delete"
            className='handle_button'
            onClick={this.openDeleteModal.bind(this, item, index)}
          />
        </Col>
        }
      </Row>
    })
    return ele
  }

  loadServiceList(){
    const { loadAllServices, page, size, name, cluster } = this.props
    const query = {
      pageIndex: page,
      pageSize: size,
      name
    }
    loadAllServices(cluster, query)
  }

  saveVolumnsChange = async () => {
    const { cluster, serviceName, createStorage, editServiceVolume } = this.props
    const { formatMessage } = this.props.intl
    const { volumeList } = this.state
    const notification = new NotificationHandler()
    this.setState({
      loading: true,
    })
    const template = []
    volumeList.forEach((item, index) => {
      if(item.volume == 'create' && item.type){
        let body = {}
        if(item.type == 'private'){
          const { name, fsType, strategy, storageClassName, size} = item
          body = {
            name,
            fsType,
            storageType: 'ceph',
            reclaimPolicy: strategy ? 'delete' : 'retain',
            storageClassName,
            storage: `${size}Mi`,
            accessModes: '',
          }
        }
        if(item.type == 'share'){
          const { name, storageClassName, serverDir } = item
          body = {
            name,
            storageType: item.type_1,
            storageClassName,
            serverDir,
          }
          if(item.type_1 == 'glusterfs'){
            body.storage = item.storage
          }
        }
        const persistentVolumeClaim = new PersistentVolumeClaim(body)
        template.push(yaml.dump(persistentVolumeClaim))
      }
    })
    const body = {
      cluster,
      template
    }
    const result = await createStorage(body)
    if (result.error) {
      this.setState({
        loading: false
      })
      if (isResourceQuotaError(result.error)) {
        return
      }
      notification.warn(result.message.message || result.message)
      return
    }
    const editResult = await editServiceVolume(cluster, serviceName, volumeList)
    if (editResult.error) {
      this.setState({
        loading: false,
      })
      let message = formatMessage(AppServiceDetailIntl.changeServiceVolumeFailureInfo)
      if(editResult.error.message){
        message = editResult.error.message
      }
      notification.warn(message)
      return
    }
    this.setState({
      nouseEditing: true,
      loading: false,
    })
    this.getServiceDetail(cluster, serviceName)
    this.loadServiceList()
    notification.success(formatMessage(AppServiceDetailIntl.changeServiceVolumeSuccess))
  }

  callbackFields(info){

    const { volumeList, isEdit, currentIndex } = this.state
    const list = cloneDeep(volumeList)
    const type = info.type
    if(type == 'cancel'){
      this.setState({
        containerCatalogueVisible: false,
      })
      return
    }
    if(type === 'confirm'){
      const values = info.values
      values.isOld = values.volumeIsOld || false
      const { volume, type } = info.values
      values.storageType = values.type
      values.claimName = ''
      if(type !== 'host'){
        values.hostPath = values.mountPath
        values.claimName = volume.split(' ')[0]
        if(volume == 'create' && type){
          values.claimName = values.name
        }
      }
      if(isEdit){
        Object.assign(list[currentIndex], values)
      } else {
        const lastVolume = list[list.length - 1]
        if (lastVolume) {
          const { volumesName } = lastVolume
          const vloumeArray = volumesName.split('-')
          const index = parseInt(vloumeArray[1]) + 1
          values.volumesName = `volume-${index}`
        } else {
          values.volumesName = `volume-0`
        }
        list.push(values)
      }
      this.setState({
        containerCatalogueVisible: false,
        volumeList: list,
        nouseEditing: false,
      })
    }
  }

  addContainerCatalogue(){
    const { volumeList } = this.state
    this.setState({
      isEdit: false,
      currentItem: {},
      currentIndex: volumeList.length,
      containerCatalogueVisible: true,
    })
  }

  scrollToAnchors = (position, name) => {
    this.setState({
      activeButton: name
    })
    const target = position - 16
    $('#baseInfo').animate({
      scrollTop: target
    }, 300)
  }
  render() {
    const menu = document.getElementsByClassName('menu')[0]
    if (this.refs.baseInfo) {
      this.refs.baseInfo.style.paddingTop = menu.offsetHeight + 'px'
    }
    const { isFetching, serviceDetail, cluster, volumes, intl, form } = this.props
    const { formatMessage } = this.props.intl
    const { isEdit, currentItem, currentIndex, containerCatalogueVisible, nouseEditing, volumeList, isAutoScale, replicas, loading, currentService, isBindNode } = this.state
    if (isFetching || !serviceDetail.metadata) {
      return ( <div className="loadingBox">
          <Spin size="large" />
        </div>
      )
    }
    let cpuFormatResult
    if(serviceDetail.spec.template.spec && serviceDetail.spec.template.spec.containers[0] && serviceDetail.spec.template.spec.containers[0].resources && serviceDetail.spec.template.spec.containers[0].resources.requests){
      cpuFormatResult = cpuFormat(serviceDetail.spec.template.spec.containers[0].resources.requests.memory, serviceDetail.spec.template.spec.containers[0].resources)
    } else {
      cpuFormatResult = '-'
    }
    const annotations = serviceDetail.spec.template.metadata.annotations
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    }
    return (
      <Card id="AppServiceDetailInfo">
        <div id="baseInfo" ref="baseInfo">
            <div className="menu">
              {
                this.state.menuAnchors.map(v => {
                  return <Button
                    key={v.name}
                    onClick={() => this.scrollToAnchors(v.top, v.name)}
                    className={this.state.activeButton === v.name? "anchorItem" : "anchorItem defaultBtn"}
                    type={this.state.activeButton === v.name? "primary" : "default" }
                  >{ v.name }</Button>
                })
              }
            </div>
            <div className="info commonBox">
              <span className="titleSpan">{formatMessage(AppServiceDetailIntl.basicsMessage)}</span>
              <div className="titleBox">
                <div className="commonTitle">
                  {formatMessage(ServiceCommonIntl.name)}
                </div>
                <div className="commonTitle">
                  {formatMessage(AppServiceDetailIntl.mirrorName)}
                </div>
                <div className="commonTitle">
                  {formatMessage(AppServiceDetailIntl.createTime)}
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
              <div className="dataBox">
                <div className="commonTitle">
                  {serviceDetail.metadata.name}
                </div>
                <div className="commonTitle">
                  {serviceDetail.images.join(', ') || '-'}
                </div>
                <div className="commonTitle">
                  {formatDate(serviceDetail.metadata.creationTimestamp || '')}
                </div>
                <div style={{ clear: 'both' }}></div>
              </div>
            </div>
            {
              annotations && annotations.hasOwnProperty('tensorflow/modelsetName') ?
                <div className="compose commonBox">
                  <span className="titleSpan">{formatMessage(AppServiceDetailIntl.modelMessage)}</span>
                  <Row className="titleBox">
                    <Col span={6} >{formatMessage(AppServiceDetailIntl.bindModelAssembly)}</Col>
                    <Col span={18}>
                      <Select defaultValue="lucy" style={{ width: 300 }}allowClear disabled>
                        <Option value="lucy">{annotations['tensorflow/modelsetName']}</Option>
                      </Select>
                      <div style={{ color: '#999', fontSize: 12 }}>{formatMessage(AppServiceDetailIntl.modelGroupMapToUserCatalogue)}</div>
                    </Col>
                  </Row>
                </div>
                : null
            }

        <div className="compose commonBox">
          <span className="titleSpan">{formatMessage(AppServiceDetailIntl.resourceConfig)}</span>
          <div className="titleBox">
            <div className="commonTitle">
              CPU
          </div>
            <div className="commonTitle">
              {formatMessage(AppServiceDetailIntl.memory)}
          </div>
            <div className="commonTitle">
              {formatMessage(AppServiceDetailIntl.systemDisk)}
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className="dataBox">
            <div className="commonTitle">
              { cpuFormatResult }
            </div>
            <div className="commonTitle">
              { memoryFormat(serviceDetail.spec.template.spec.containers[0].resources)}
            </div>
            <div className="commonTitle">
              10G
          </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
        <BindNodes serviceDetail={serviceDetail} formatMessage={formatMessage}/>
        <MyComponent
          form={form}
          ref="envComponent"
          serviceDetail={serviceDetail}
          cluster={cluster}
          formatMessage={formatMessage}
          appCenterChoiceHidden={this.props.appCenterChoiceHidden}
        />
        <div className="storage commonBox">
          <span className="titleSpan">{formatMessage(AppServiceDetailIntl.CacheVolume)}</span>
          {
            !nouseEditing &&  <span className='editTip'>
              {formatMessage(AppServiceDetailIntl.changeNoEffect)}
            </span>
            }
            <div className='save_box'>
              <Button
                type="primary"
                size="large"
                onClick={() => this.saveVolumnsChange()}
                className='title_button'
                disabled={nouseEditing}
                loading={loading}
              >
                {formatMessage(AppServiceDetailIntl.appChange)}
              </Button>
            </div>
            <div className="titleBox">
              <Row className='volume_row_style'>
                <Col span="5">{formatMessage(AppServiceDetailIntl.cacheType)}</Col>
                <Col span="5">{formatMessage(AppServiceDetailIntl.cache)}</Col>
                <Col span="5">{formatMessage(AppServiceDetailIntl.containerDir)}</Col>
                <Col span="4">{formatMessage(AppServiceDetailIntl.readWriteRight)}</Col>
                <Col span="5">{formatMessage(ServiceCommonIntl.operation)}</Col>
              </Row>
            </div>
            <div className="dataBox">
              {this.getMount()}
            </div>
            <div className='add_volume_button'>
            <span
              className='add_button'
              onClick={() => this.addContainerCatalogue()}
            >
              <Icon type="plus" />{formatMessage(AppServiceDetailIntl.addContainerDir)}
            </span>
            </div>
          </div>
          <ContainerNetwork
            forDetail
            serviceDetail={serviceDetail}
            cluster={cluster}
            formItemLayout={formItemLayout}
            form={form}
            intl={intl}
          />
        </div>
        <Modal
          title={ isEdit ? formatMessage(AppServiceDetailIntl.editContainerDir): formatMessage(AppServiceDetailIntl.addOnlyContainerDir) }
          visible={ containerCatalogueVisible }
          closable={ true }
          onCancel={ () => this.setState({containerCatalogueVisible:false}) }
          width="570px"
          maskClosable={ false }
          footer={ [] }
          wrapClassName="container_catalogue_modal_style"
        >
          <ContainerCatalogueModal
            visible={containerCatalogueVisible}
            callbackFields={ this.callbackFields }
            fieldsList={volumeList}
            replicas={replicas}
            isAutoScale={isAutoScale}
            from={'editService'}
            currentIndex={ currentIndex }
            currentService={currentService}
            isBindNode={isBindNode}
          />
        </Modal>
        <Modal
          title={formatMessage(AppServiceDetailIntl.deleteContainerDir)}
          visible={ this.state.deleteVisible }
          closable={ true }
          onOk={ () => this.deleteContainerCatalogue() }
          onCancel={ () => this.setState({deleteVisible:false}) }
          width="570px"
          maskClosable={ false }
          wrapClassName="delete_container_calalogue"
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            {formatMessage(AppServiceDetailIntl.makeSureRemoveContainerDir)}
          </div>
        </Modal>
      </Card>
    )
  }
}

AppServiceDetailInfo.propTypes = {
  //
}

function mapStateToPropsInfo(state, props) {
  return {
    //
  }
}

export default injectIntl(connect(mapStateToPropsInfo, {
  loadAutoScale,
  createStorage,
  editServiceVolume,
  loadAllServices,
  loadServiceDetail,
})(Form.create()(AppServiceDetailInfo)), { withRef: true, })
