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
  Menu, Tooltip, Modal, Row, Col, Checkbox, Cascader
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
    if(name == undefined || value == undefined || name == '' || value == ''){
      dataArray.splice(index,1)
      rowDisableArray.splice(index,1)
      saveBtnLoadingArray.splice(index,1)
      this.setState({
        dataArray,
        rowDisableArray,
        saveBtnLoadingArray,
      })
      return
    }
    if(dataArray[index].flag == true){
      dataArray.splice(index,1)
      rowDisableArray.splice(index,1)
      saveBtnLoadingArray.splice(index,1)
      this.setState({
        dataArray,
        rowDisableArray,
        saveBtnLoadingArray,
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
    const { serviceDetail, cluster, editServiceEnv } = this.props
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
          Notification.success('环境变量修改成功！')
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
          Notification.error('环境变量修改失败！')
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
    const { form } = this.props
    const { getFieldValue } = form
    const Notification = new NotificationHandler()
    let name = getFieldValue(`envName${index}`)
    let value = getFieldValue(`envValue${index}`)
    if(name == '' || value == '' || name == undefined || value == undefined){
      Notification.error('变量名和变量值均不能为空')
      return
    }
    for(let i=0; i<dataArray.length; i++ ){
      if(dataArray[i].name == name){
        if(dataArray[index].edit == true){
          break
        }
        Notification.error('变量名已经存在，请修改！')
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
    const { rowDisableArray, dataArray, saveBtnLoadingArray } = this.state
    if(dataArray.length > 1 && (dataArray[dataArray.length-1].name == '' || dataArray[dataArray.length-1].value == '' )){
      new NotificationHandler().error("请先保存新增的环境变量")
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
    let flag = false
    let errorMsg = appEnvCheck(value, '环境变量');
    if(value == ''){
      callback(new Error('变量名不能为空！'))
    }
    for(let i=0; i<dataArray.length; i++ ){
      if(dataArray[i].name == value){
        callback(new Error('变量名已存在！'))
      }
    }
    if(errorMsg == 'success') {
      callback()
    } else {
      callback(new Error([errorMsg]));
    }
  }

  templateTable(dataArray,rowDisableArray) {
    if(dataArray.length == 0) {
      return <div className='noData'>暂无环境变量</div>
    }
    const { form, secretsOptions } = this.props
    const { getFieldProps, getFieldValue, resetFields } = form
    const ele = []
    dataArray.forEach((env,index) => {
      const editMenu = <Menu style={{width:'100px'}} onClick={() => this.handleEdit(index)}>
        <Menu.Item key="1"><Icon type="edit" />&nbsp;编辑</Menu.Item>
      </Menu>
      let value = env.value
      if (env.valueFrom) {
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
          <Option value="normal">普通变量</Option>
          <Option value="secret">加密变量</Option>
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
                    placeholder="请填写值"
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
                    placeholder="请选择加密对象"
                    options={secretsOptions}
                  />
                </span>
              </FormItem>
              : <span style={{width:'33%'}}>
                {
                  Array.isArray(value) &&
                  <a>
                    <Tooltip title="加密变量" placement="top">
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
            {
              rowDisableArray[index].disable
              ? <div>
                <Button type='primary' className='saveBtn' onClick={() => this.handleSaveEdit(index)} loading={this.state.saveBtnLoadingArray[index].loading}>保存</Button>
                <Button onClick={() => this.handleCancleEdit(index)}>取消</Button>
              </div>
              : <Dropdown.Button type="ghost" overlay={editMenu} className='editButton' onClick={() => this.handleDelete(index,env.name)}>
                  <Icon type="delete" />删除
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
    return (
      <div className='DetailInfo__MyComponent commonBox'>
          <span className="titleSpan">环境变量</span>
          <div className={classNames("editTip",{'hide' : !this.state.appEditBtn})}>修改尚未更新，请点击"应用修改"使之生效</div>
        <div className='save_box'>
          <Button size="large" type="primary" disabled={this.state.appEditBtn ? false : true} loading={this.state.appEditLoading} onClick={this.editServiceConfirm} className='title_button'>应用修改</Button>
        </div>
          <div className="titleBox">
            <div className="commonTitle">
              变量名
            </div>
            <div className="commonTitle">
              变量值
            </div>
            <div className="commonTitle">
              操作
            </div>
            <div style={{ clear: 'both' }}></div>
          </div>
        <div>
          <Form>
            {this.templateTable(this.state.dataArray,this.state.rowDisableArray)}
          </Form>
        </div>
        <div className="pushRow">
          <a onClick={this.addNewEnv}><Icon type="plus" />添加环境变量</a>
        </div>
        <Modal
          title="删除环境变量操作"
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
              取 消
            </Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              loading={this.state.buttonLoading}
              onClick={this.ModalDeleteOk}>
              确 定
            </Button>,
          ]}
        >
          <div className='ModalColor'><i className="anticon anticon-question-circle-o modali"></i>你是否确定删除 [<span>{DeletingEnvName}</span>] 环境变量</div>
        </Modal>
      </div>
    )
  }
}
MyComponent = Form.create()(MyComponent)

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
    this.state = {
      bindNodesData: {}
    }
  }

  getSchedulingPolicy(data) {
    const template = data.spec.template
    const spec = template.spec
    const labels = this.getNodeAffinityLabels(spec)
    const node = this.getNodeSelectorTarget(spec)
    const policy = {
      type: scheduleBySystem,
    }
    if (node) {
      // Check node policy first
      policy.type = scheduleByHostNameOrIP
      policy.node = node
    } else if (labels) {
      // Then check label policy
      policy.type = scheduleByLabels
      policy.labels = labels
    }
    return policy
  }

  getNodeSelectorTarget(spec) {
    const hostNameKey = 'kubernetes.io/hostname'
    if (!spec.hasOwnProperty('nodeSelector') || !spec.nodeSelector.hasOwnProperty(hostNameKey)) {
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

  template() {
    const { serviceDetail } = this.props
    let bindNodesData = this.getSchedulingPolicy(serviceDetail)
    switch (bindNodesData.type) {
      case "ScheduleBySystem":
        return <span>
          <div className="commonTitle">--</div>
          <div>系统默认调度</div>
        </span>
      case "ScheduleByHostNameOrIP":
        return <span>
          <div className="commonTitle">主机名及IP</div>
          <div>{bindNodesData.node}</div>
        </span>
      case "ScheduleByLabels":
        return <span>
          <div className="commonTitle bindnodeTitle">主机标签</div>
          <div>{this.labelsTemplate(bindNodesData.labels)}</div>
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
    return <div className='commonBox bindNodes'>
      <span className="titleSpan">绑定节点</span>
      <div className="titleBox">
        <div className="commonTitle">
          绑定方式
        </div>
        <div className="commonTitle">
          绑定对象
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
          const list = []
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
              if(item.persistentVolumeClaim){
                strategy = item.persistentVolumeClaim.strategy
                claimName = item.persistentVolumeClaim.claimName
                for(let i = 0; i < volume.length; i++){
                  if(volume[i].volumeName == claimName){
                    type = volume[i].srType
                    size = volume[i].size
                    fsType = volume[i].fsType
                  }
                }
              }
              let type_1 = ''
              if(type == 'private'){
                type_1 = 'rbd'
              } else {
                type_1 = 'nfs'
              }
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

  formatVolumeType(type){
    switch(type){
      case 'private':
        return <span>独享型（rbd）</span>
      case 'share':
        return <span>共享型（NFS）</span>
      case 'host':
        return <span>本地存储</span>
      default:
        return <span>未知</span>
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

  getMount() {
    const { volumeList } = this.state
    let ele = []
    if(!Object.keys(volumeList).length){
      return <div style={{ textAlign: 'center'}}>暂无存储卷</div>
    }
    ele = volumeList.map((item, index) => {
      return <Row key={`volume${index}`} className='volume_row_style'>
        <Col span="6" className='text_overfow'>{ this.formatVolumeType(item.type) }</Col>
        <Col span="6" className='text_overfow'>{ this.renderVolumeName(item) }</Col>
        <Col span="5" className='text_overfow'>{item.mountPath}</Col>
        <Col span="7">
          <Checkbox checked={item.readOnly} disabled>只读</Checkbox>
          <Button
            type="dashed"
            icon="edit"
            className='handle_button'
            onClick={this.editContainerCatalogue.bind(this, item, index)}
          />
          <Button
            type="dashed"
            icon="delete"
            className='handle_button'
            onClick={this.openDeleteModal.bind(this, item, index)}
          />
        </Col>
      </Row>
    })
    return ele
  }
  getConfigMap(container) {
    let ele = []
    let volumes = container.spec.template.spec.volumes
    let configMaps = []
    if (container.spec.template.spec.containers[0].volumeMounts) {
     container.spec.template.spec.containers[0].volumeMounts.forEach((volume) => {
        if (volume.mountPath === '/var/run/secrets/kubernetes.io/serviceaccount') { return }
        volumes.forEach(item => {
          if(!item) return false
          if (item.name === volume.name) {
            if (item.configMap) {
              if (item.configMap.items) {
                item.configMap.items.forEach(configMap => {
                  let arr = volume.mountPath.split('/')
                  if(arr[arr.length - 1] == configMap.path) {
                    configMap.mountPath = volume.mountPath
                    configMap.configMapName = item.configMap.name
                    configMaps.push(configMap)
                  }
                })
              } else {
                configMaps.push({
                  mountPath: volume.mountPath,
                  key: '已挂载整个配置组',
                  configMapName: item.configMap.name,
                })
              }
            }
          }
        })
      })
      configMaps.forEach((item, index) => {
        ele.push(
          <div key={item.name + item.key + '-' + index}>
            <div className="commonTitle"><Link to="/app_manage/configs">{item.configMapName}</Link></div>
            <div className="commonTitle">{item.key}</div>
            <div className="commonTitle">{item.mountPath}</div>
            <div style={{ clear: "both" }}></div>
          </div>
        )
      })
      return ele
    }
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
          const { name, storageClassName } = item
          body = {
            name,
            storageType: 'nfs',
            storageClassName,
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
      let message = '修改服务存储卷失败，请重试'
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
    notification.success('修改服务存储卷成功')
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

  render() {
    const { isFetching, serviceDetail, cluster, volumes } = this.props
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
    return (
      <Card id="AppServiceDetailInfo">
        <div className="info commonBox">
          <span className="titleSpan">基本信息</span>
          <div className="titleBox">
            <div className="commonTitle">
              名称
          </div>
            <div className="commonTitle">
              镜像名称
          </div>
            <div className="commonTitle">
              创建时间
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
        <div className="compose commonBox">
          <span className="titleSpan">资源配置</span>
          <div className="titleBox">
            <div className="commonTitle">
              CPU
          </div>
            <div className="commonTitle">
              内存
          </div>
            <div className="commonTitle">
              系统盘
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
        <BindNodes serviceDetail={serviceDetail}/>
        <MyComponent
          ref="envComponent"
          serviceDetail={serviceDetail}
          cluster={cluster}
        />
        <div className="storage commonBox">
          <span className="titleSpan">存储卷</span>
          {
            !nouseEditing &&  <span className='editTip'>
              修改尚未更新，请点击"应用修改"使之生效
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
              应用修改
            </Button>
          </div>
          <div className="titleBox">
            <Row className='volume_row_style'>
              <Col span="6">存储类型</Col>
              <Col span="6">存储</Col>
              <Col span="5">容器目录</Col>
              <Col span="7">操作</Col>
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
              <Icon type="plus" />添加一个容器目录
            </span>
          </div>
        </div>
        <div className="storage commonBox">
          <span className="titleSpan">服务配置</span>
          <div className="titleBox">
            <div className="commonTitle">
              配置组
            </div>
            <div className="commonTitle">
              配置文件
            </div>
            <div className="commonTitle">
              挂载点
            </div>
            <div style={{ clear: "both" }}></div>
          </div>
          <div className="dataBox">
            {this.getConfigMap(serviceDetail)}
          </div>
        </div>
        <Modal
          title={ isEdit ? '编辑容器目录': '添加容器目录' }
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
          title="删除容器目录"
          visible={ this.state.deleteVisible }
          closable={ true }
          onOk={ () => this.deleteContainerCatalogue() }
          onCancel={ () => this.setState({deleteVisible:false}) }
          width="570px"
          maskClosable={ false }
          wrapClassName="delete_container_calalogue"
        >
          <div className='tips'>
            <Icon type="question-circle-o" className='question_icon'/>
            确定移除当前的容器目录吗？
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

export default connect(mapStateToPropsInfo, {
  loadAutoScale,
  createStorage,
  editServiceVolume,
  loadAllServices,
  loadServiceDetail,
})(AppServiceDetailInfo)