/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * NetworkConfiguration list component
 *
 * v0.1 - 2017-4-24
 * @author XuLongcheng
 */
import React from 'react'
import { camelize } from 'humps'
import {
  Icon,
  Select,
  Button,
  Card,
  Form,
  Input,
  Tooltip,
  Spin,
  Modal,
  Dropdown,
  Menu,
  Row,
  Col,
  Tabs,
  Table,
} from 'antd'
import ThirdTabs from './ThirdTabs'
import QueueAni from 'rc-queue-anim'
import { getProxy, updateProxy, getClusterNodeAddr, setDefaultGroup } from '../../actions/cluster'
import { changeClusterIPsAndDomains } from '../../actions/entities'
import { getAllClusterNodes, getNodesIngresses } from '../../actions/cluster_node'
import NotificationHandler from '../../components/Notification'
import { connect } from 'react-redux'
import networkImg from '../../assets/img/integration/network.png'
import mappingImg from '../../assets/img/integration/mapping.svg'
import sketchImg from '../../assets/img/integration/Sketch.png'
import './style/NetworkConfiguration.less'
import { IP_REGEX, HOST_REGEX } from '../../../constants'
import { genRandomString } from '../../common/tools'
import cloneDeep from 'lodash/cloneDeep'
import intlMsg from './NetworkConfigurationIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
import ServiceMeshPortCard from './ServiceMeshPortCard'
import HelpModal from './NetworkSolutions/HelpModal'
import { getDeepValue } from "../../../client/util/util"
import NoteIcon from './NoteIcon'

const Option = Select.Option
const FormItem = Form.Item
const TabPane = Tabs.TabPane
let formadd=1;
let validing = false

let NetworkConfiguration = React.createClass ({
  getInitialState() {
    this.uuid = {
      configKey: 0,
      nodes: []
    }
    return {
      editCluster: true, // edit btn
      saveBtnDisabled: false,
      showDeleteModal: false,
      visible:false,
      settingDefalut: false,
      settingDefalutLoading: true,
      defaultSetting: undefined,
      deleteDefaultGroup: false,
      currentItem: {},
      defaultGroup: undefined,
      lbgroupInputId: `lbgroup${genRandomString('0123456789',4)}`,
      copyCMDSuccess: false,
      networkType: 'server',
      editingKey: null,
      helpVisible: false,
      addContentVisible: false,
      nodeList: [],
    }
  },
  componentWillMount(){
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { getProxy, cluster } = this.props
    getFieldProps('arr', {
      initialValue: [0]
    })
    getFieldProps('networkConfigArray', {
      initialValue: [0]
    })
    this.loadData()
  },
  componentWillReceiveProps(next) {
    if (next.cluster.clusterID != this.props.cluster.clusterID) {
      const { getNodesIngresses } = this.props
      getNodesIngresses(next.cluster.clusterID)
    }
  },
  loadData(needFetching) {
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { getProxy, cluster, getNodesIngresses } = this.props
    getNodesIngresses(cluster.clusterID, {
      success: {
        func: res => {
          if (res && res.data) {
            this.setState({
              nodeList: res.data,
            })
          }
        }
      }
    })
    getProxy(this.props.cluster.clusterID, needFetching == undefined ? true : needFetching, {
      success: {
        func:(res) => {
          const clusterID = camelize(cluster.clusterID)
          if(res[clusterID] && res[clusterID].data) {
            const data = res[clusterID].data
            const networkConfigArray = []
            this.uuid.configKey = data.length -1
            data.forEach((item, index) => {
              let nodesArray = []
              let nodesItem = {
                key: index,
                nodesKey: item.nodes.length - 1
              }

              if(item.isDefault){
                this.setState({
                  defaultGroup: item.id
                })
              }

              item.nodes.forEach((nodeItem, nodeIndex) => {
                nodesArray.push(nodeIndex)
              })

              let networkConfig = {
                key: index,
                arr: nodesArray,
              }
              this.uuid.nodes.push(nodesItem)
              networkConfigArray.push(networkConfig)
            })
            setFieldsValue({
              'arr': [0],
              'networkConfigArray': networkConfigArray
            })
            return
          }
          setFieldsValue({
            'arr': [0],
            'networkConfigArray': [
              {
                key: 0,
                arr: [0]
              }
            ]
          })
        }
      }
    })
  },
  getSelectItem() {
    const { isFetching, cluster } = this.props
    const { nodeList } = this.state
    if(!nodeList.length) {
      return <Option key="none"/>
    }
    if(isFetching) {
      return <Card key="Network" id="Network" className='header'>
        <div className="h3"><FormattedMessage {...intlMsg.networkConfig}/></div>
        <div className="loadingBox" style={{height:'100px'}}><Spin size="large"></Spin></div>
      </Card>
    }
    let nodes = nodeList
    return nodes.map(node => {
      return <Option key={node.metadata.name} disabled={node.unavailableReason}>{node.metadata.name}</Option>
    })
  },
  isExistRepeat(type, config, key) {
    const { form } = this.props
    const { getFieldsValue, getFieldValue } = form
    const itemKey = config.key
    const networkConfigArray = getFieldValue('networkConfigArray')
    const values = getFieldsValue()
    const nodeValue = getFieldValue(`nodeSelect-${itemKey}-${key}`)
    const IPValue = getFieldValue(`nodeIP-${itemKey}-${key}`)
    let nodeResult = false
    let IPResult = false
    networkConfigArray.forEach(item => {
      if(type == 'node'){
        item.arr.forEach(arrItem => {
          if(values[`nodeSelect-${item.key}-${arrItem}`] === nodeValue && `${item.key}-${arrItem}` !== `${config.key}-${key}`){
            nodeResult = true
          }
        })
      }
      if(type == 'IP'){
        item.arr.forEach(arrItem => {
          // Allow all IP to be 0.0.0.0
          if (values[`nodeIP-${item.key}-${arrItem}`] === '0.0.0.0') {
            return true
          }
          if(values[`nodeIP-${item.key}-${arrItem}`] === IPValue && `${item.key}-${arrItem}` !== `${config.key}-${key}`){
            IPResult = true
          }
        })
      }
    })
    return {
      nodeResult,
      IPResult,
    }
  },
  validAllField(type) {
    if(validing) {
      return
    }
    validing = true
    const { form } = this.props

    let networkConfigArray = form.getFieldValue('networkConfigArray')
    let validateFieldsArray = []
    if(type == 'node'){
      networkConfigArray.forEach(item => {
        item.arr.forEach(arrItem => {
          validateFieldsArray.push([`nodeSelect-${item.key}-${arrItem}`])
        })
      })
    } else if(type == 'IP'){
      networkConfigArray.forEach(item => {
        item.arr.forEach(arrItem => {
          validateFieldsArray.push([`nodeIP-${item.key}-${arrItem}`])
        })
      })
    } else {
      networkConfigArray.forEach(item => {
        item.arr.forEach(arrItem => {
          validateFieldsArray.push([`nodeSelect-${item.key}-${arrItem}`])
          validateFieldsArray.push([`nodeIP-${item.key}-${arrItem}`])
        })
      })
    }
    form.validateFields(validateFieldsArray, {force: true}, (err, callback) => {
      validing = false
    })
  },
  valiadAllGroupNameField(){
    if(validing) {
      return
    }
    validing = true
    const { form } = this.props
    let networkConfigArray = form.getFieldValue('networkConfigArray')
    let validateFieldsArray = []
    networkConfigArray.forEach(item => {
      if(!item.deleted){
        validateFieldsArray.push(`name${item.key}`)
      }
    })
    form.validateFields(validateFieldsArray, {force: true}, (err, callback) => {
      validing = false
    })
  },
  isNameRepeat(key){
    const { form } = this.props
    const { getFieldsValue, getFieldValue } = form
    let networkConfigArray = getFieldValue('networkConfigArray')
    let values = getFieldsValue()
    let nowName = getFieldValue([`name${key}`])
    return networkConfigArray.some(item => {
      if(values[`name${item.key}`] === nowName && item.key !== key){
        return true
      }
    })
  },
  handDelete(config, key) {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    let networkConfigArray = getFieldValue('networkConfigArray')
    networkConfigArray.forEach((item, index) => {
      if(item.key == config.key){
        item.arr = item.arr.filter(keys => {return keys !== key})
      }
    })
    setFieldsValue({
      networkConfigArray
    })
  },
  updateCluster() {
    const { form, cluster, updateProxy, getProxy, changeClusterIPsAndDomains, intl: { formatMessage } } = this.props
    const { getFieldValue } = form
    validing = true
    this.setState({
      saveBtnDisabled: true
    })
    form.validateFields({force: true}, (err, values) => {
      validing = false
      if(err) {
        this.setState({
          saveBtnDisabled: false
        })
        return
      }
      const notify = new NotificationHandler()
      const networkConfigArray = values.networkConfigArray
      networkConfigArray.forEach(item => {
        if(item.arr.length == 0) {
          this.setState({
            saveBtnDisabled: false
          })
          notify.error(formatMessage(intlMsg.inputProxyOut))
          return
        }
      })
      const body = []
      networkConfigArray.forEach(item => {
        if(!item.deleted){
          let obj = {
            'id': values[`groupId${item.key}`],
            "name": values[`name${item.key}`],
            "type": values[`networkType${item.key}`],
            "address": values[`address${item.key}`],
            "domain": values[`domain${item.key}`],
            'is_default': values[`isDefaultGroupAttr${item.key}`],
          }
          let nodes = []
          item.arr.forEach(arrItem => {
            let arrObj = {
              'host': values[`nodeSelect-${item.key}-${arrItem}`],
              'address': values[`nodeIP-${item.key}-${arrItem}`],
            }
            nodes.push(arrObj)
          })
          obj.nodes = nodes
          body.push(obj)
        }
      })
      const entity = {
        bindingIPs: getFieldValue('bindingIPs'),
        bindingDomains: getFieldValue('bindingDomains'),
        nodeProxys: []
      }
      //const nodeProxys = entity.nodeProxys
      //arr.forEach(item => {
      //  nodeProxys.push({
      //    host: getFieldValue(`nodeSelect${item}`),
      //    address: getFieldValue(`nodeIP${item}`)
      //  })
      //})
      notify.spin(formatMessage(intlMsg.updatingProxyOut))
      updateProxy(cluster.clusterID, body, {
        success: {
          func: () => {
            notify.close()
            notify.success(formatMessage(intlMsg.updateProxyOutSuccess))
            setTimeout(() => changeClusterIPsAndDomains(entity.bindingIPs ? `["${entity.bindingIPs}"]` : '', entity.bindingDomains ? `["${entity.bindingDomains}"]` : ''),0)
            this.loadData(false)
            this.setState({
              saveBtnDisabled: false,
              editCluster: false,
              editingKey: null,
            })
            this.props.refreshComponent()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notify.close()
            notify.error(formatMessage(intlMsg.updateProxyOutFail))
            this.setState({
              saveBtnDisabled: false,
              editCluster: true
            })

          }
        }
      })
    })
  },
  cancleEdit() {
    this.setState({
      editCluster: false,
      editingKey: null,
      saveBtnLoading: false,
      saveBtnDisabled: true,
      addContentVisible: false,
    })
    const { form, cluster, clusterProxy } = this.props
    const clusterID = camelize(cluster.clusterID)
    if(clusterProxy.result[clusterID] && clusterProxy.result[clusterID].data) {
      const data = clusterProxy.result[clusterID].data
      const networkConfigArray = []
      this.uuid.configKey = data.length -1
      data.forEach((item, index) => {
        let nodesArray = []
        let nodesItem = {
          key: index,
          nodesKey: item.nodes.length - 1
        }
        item.nodes.forEach((nodeItem, nodeIndex) => {
          nodesArray.push(nodeIndex)
        })

        let networkConfig = {
          key: index,
          arr: nodesArray,
        }
        this.uuid.nodes.push(nodesItem)
        networkConfigArray.push(networkConfig)
        if(item.isDefault){
          this.setState({
            defaultGroup: item.id,
          })
          form.setFieldsValue({'defaultSetting': item.id })
        }
      })
      form.setFieldsValue({
        'networkConfigArray': networkConfigArray
      })
      // 重置表单
      const values = form.getFieldsValue()
      const valuesKeys = Object.keys(values)
      let index = 0
      for(let j = 0; j < valuesKeys.length; j++){
        if(valuesKeys[j] == 'networkConfigArray'){
          index = j
        }
      }
      valuesKeys.splice(index, 1)
      form.resetFields(valuesKeys)
      return
    }
  },
  nodeChange(value, networkKey, key){
    const { cluster, form } = this.props
    const { nodeList } = this.state
    let address = undefined
    nodeList.map(item => {
      if (item.metadata.name === value) {
        address = item.ip
      }
    })
    form.setFieldsValue({
      [`nodeIP-${networkKey}-${key}`]: address
    })
  },
  getItems(config) {
    const { cluster, form, clusterProxy, intl: { formatMessage } } = this.props
    const { getFieldProps, getFieldValue } = form;
    const { editingKey, saveBtnLoading } = this.state
    const editCluster = editingKey === config.key
    let {bindingIPs} = cluster
    if(clusterProxy.isEmptyObject || !clusterProxy.result) {
      return <div></div>
    }
    let proxy = clusterProxy.result[camelize(cluster.clusterID)].data
    //if(!proxy.length) {
    //  return <div></div>
    //}
    let arr = config.arr;
    if(!arr.length) {
      return <div></div>
    }

    let networkKey = config.key
    const onlyOne = arr.length === 1
    return arr.map(item => {
      let nodes = {}
      if(proxy[networkKey] && proxy[networkKey].nodes){
        nodes = proxy[networkKey].nodes
      }
      return <div key={item} id="error-s" style={{height: '57px'}}>
        <Row style={{width: '100%'}}>
          <Col xs={{span: 11}} style={{paddingRight: '10px'}}>
            <Form.Item>
              <Select
                {...getFieldProps(`nodeSelect-${networkKey}-${item}`, {
                  initialValue: nodes && nodes[item] ? nodes[item].host : undefined,
                  rules: [{
                    validator: (rule, value, callback) => {
                      if(!value) {
                        return callback(formatMessage(intlMsg.plsSelectNode))
                      }
                      this.validAllField('node')
                      if(this.isExistRepeat('node', config, item).nodeResult) {
                        return callback(formatMessage(intlMsg.proxyNodeRepeat))
                      }
                      callback()
                    }
                  }],
                  onChange:(value) => this.nodeChange(value, networkKey, item)
                  })}
                  className="select-width-full"
                  placeholder={formatMessage(intlMsg.selectServiceNode)}
                  disabled={!editCluster}
                >
                  {this.getSelectItem()}
                </Select>
            </Form.Item>
          </Col>
          <Col xs={{span: 11}} style={{paddingRight:'10px'}}>
            <Form.Item>
              <Input
                {...getFieldProps(`nodeIP-${config.key}-${item}`,{
                  initialValue: nodes && nodes[item] ? nodes[item].address : undefined,
                  rules: [
                    {
                      validator_: (rule, value, callback) => {
                        if(!value) {
                          return callback(formatMessage(intlMsg.inputNetworkCardIp))
                        }
                        if (!IP_REGEX.test(value)) {
                          return callback([new Error(formatMessage(intlMsg.inputRightNetworkIp))])
                        }
                        this.validAllField('IP')
                        if(this.isExistRepeat('IP', config, item).IPResult) {
                          return callback(formatMessage(intlMsg.nodeNetworkCardRepeat))
                        }
                        callback()
                      }
                    }
                  ]
                })}
                placeholder={formatMessage(intlMsg.inputServiceOutIp)}
                disabled={!editCluster}
              />
            </Form.Item>

          </Col>
          <Col xs={{span:2}}>
            {
              editCluster
                ? <p className="delete-p">
                    <Button disabled={onlyOne} style={{ border: 'none', padding: 0 }}>
                      <Icon style={{paddingTop:'5px',cursor:'pointer'}}  type="delete" onClick={() => this.handDelete(config, item)}/>
                    </Button>
                  </p>
                : <span></span>
            }
          </Col>
        </Row>
      </div>
    })
  },
  add (item){
    const {form} = this.props;
    validing = true
    let validateFieldsArray = []
    let itemKey = item.key
    item.arr.forEach(item => {
      validateFieldsArray.push(`nodeSelect-${itemKey}-${item}`)
      validateFieldsArray.push(`nodeIP-${itemKey}-${item}`)
    })
    form.validateFields(validateFieldsArray, (err, callback) => {
      validing = false
      if(err) {
        return
      }
      const { getFieldValue, setFieldsValue } = form;
      let arr = item.arr;
      let nodesLength = 0
      this.uuid.nodes.forEach((nodesItem, index) => {
        if(nodesItem.key == item.key){
          nodesLength = nodesItem.nodesKey + 1
          nodesItem.nodesKey = nodesLength
        }
      })
      arr.push(nodesLength);
      let newnetworkConfigArray = getFieldValue('networkConfigArray')
      for(let i = 0; i < newnetworkConfigArray.length; i++){
        if(newnetworkConfigArray[i].key == item.key){
          newnetworkConfigArray[i].arr = arr
        }
      }
      setFieldsValue({
        'networkConfigArray': newnetworkConfigArray
      });
    })
  },
  addPublicModal(){
    const _ = this
    const { intl: { formatMessage } } = this.props
    const { editingKey } = this.state
    editingKey || editingKey === 0 ? Modal.confirm({
      width:460,
      title: <span style={{fontWeight:500}}>{formatMessage(intlMsg.haveEditingOut)}</span>,
      content: formatMessage(intlMsg.goOnNoSave),
      onOk() {
        _.addPublic()
      },
    }) : _.addPublic()

  },
  addPublic() {
    this.cancleEdit()
    this.setState({
      addContentVisible: true,
    })
    this.uuid.configKey++
    const { form } = this.props;
    // can use data-binding to get
    form.validateFields((err, values) => {
      if(!!err){
        return
      }
      let networkConfigArray = form.getFieldValue('networkConfigArray');
      let item = {
        key: this.uuid.configKey,
        arr: [0],
        add: true,
      }
      let nodesItem = {
        key: this.uuid.configKey,
        nodesKey: 0,
        add: true
      }
      this.uuid.nodes.unshift(nodesItem)
      networkConfigArray.unshift(item)
      //keys = keys.concat(uuid);
      // can use data-binding to set
      // important! notify form to detect changes
      form.setFieldsValue({
        networkConfigArray,
      });
      this.setState({
        editingKey: this.uuid.configKey,
      })
    })
  },
  deletePublic(item, record){
    const { form } = this.props
    let networkConfigArray = form.getFieldValue('networkConfigArray')
    let newnetworkConfigArray = cloneDeep(networkConfigArray)
    // [LOT-3802] 服务网络出口，删除操作时，提示有问题
    this.setState({
      currentGroup: record.isDefault,
    })
    if(record && record.isDefault){
      return this.setState({
        deleteDefaultGroup: true,
        currentItem: item,
        currentName: record.name,
      })
    }
    if(!record || record == 'confirm'){
      const { cluster, clusterProxy } = this.props
      let dataList = []
      let data = []
      if(clusterProxy && clusterProxy.result[camelize(cluster.clusterID)] && clusterProxy.result[camelize(cluster.clusterID)].data){
        dataList = clusterProxy.result[camelize(cluster.clusterID)].data
      }
      dataList.forEach((item, index) => {
        if(item.type !== "incluster"){
          data.push(item)
        }
      })
      newnetworkConfigArray.forEach(network => {
        if(network.key == item.key){
          network.deleted = true
        }
      })
      if(data[item.key] && data[item.key].isDefault){
        form.setFieldsValue({ 'defaultSetting': undefined})
        this.setState({
          defaultGroup: undefined
        })
      }
      form.setFieldsValue({
        'networkConfigArray': newnetworkConfigArray
      })
      this.setState({
        deleteDefaultGroup: false
      })
      this.updateCluster()
      return
    }
    return this.setState({
      deleteDefaultGroup: true,
      currentItem: item,
      currentName: record.name
    })
  },
  networkTypeText(type){
    if(type == "public"){
      return <span><FormattedMessage {...intlMsg.publicNet}/></span>
    }
    if(type == 'private'){
      return <span><FormattedMessage {...intlMsg.intranet}/></span>
    }
    return <span></span>
  },
  typeIcon(type){
    if(type == "public"){
      return <span className='typeIcon typePublic'>公</span>
    }
    if(type == 'private'){
      return <span className='typeIcon typePrivate'>内</span>
    }
    return null
  },
  titleStar(type){
    if(type == "public" || type == 'private'){
      return <span style={{color: 'red'}}>*</span>
    }
    return null
  },
  selectOption(){
    const { clusterProxy, cluster, form } = this.props
    if(clusterProxy.isEmptyObject || !clusterProxy.result) {
      return <Option value="none" key="none"><FormattedMessage {...intlMsg.noOutForNow}/></Option>
    }
    let proxy = clusterProxy.result[camelize(cluster.clusterID)]
    let networkConfigArray = form.getFieldValue('networkConfigArray').filter(i => !i.add)
    const optionMapArray = []
    for(let i = 0; i < proxy.data.length; i++){
      if (networkConfigArray[i] && !networkConfigArray[i].deleted){
        optionMapArray.push(proxy.data[networkConfigArray[i].key])
      }
    }
    return optionMapArray.map((item, index) => {
      return <Option value={item.id} key={'option' + index}>{item.name}</Option>
    })
  },
  selectSettingChange(value){
    this.setState({
      defaultSetting: value
    })
  },
  confirmSet(){
    const { defaultSetting } = this.state
    const { setDefaultGroup, cluster, form, intl: { formatMessage } } = this.props
    let Noti = new NotificationHandler()
    this.setState({
      settingDefalutLoading: true
    })
    if(!defaultSetting){
      this.setState({
        settingDefalutLoading: false
      })
      return Noti.error(formatMessage(intlMsg.defaultNetOutNotNull))
    }
    const clusterID = cluster.clusterID
    const groupID = defaultSetting
    setDefaultGroup(clusterID, groupID, {
      success: {
        func: () => {
          this.setState({
            settingDefalutLoading: false,
            settingDefalut: false,
          })
          this.props.form.resetFields(['defaultSetting'])
          Noti.success(formatMessage(intlMsg.setDefaultNetOutSuccess))
          this.loadData()
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            settingDefalutLoading: false
          })
          Noti.error(formatMessage(intlMsg.setDefaultNetOutFail))
        }
      }
    })
  },
  cancelSet(){
    const { form } = this.props
    this.setState({
      settingDefalut: false
    })
    form.resetFields(['defaultSetting'])
  },
  copyOrder(id) {
    //this function for user click the copy btn and copy the download code
    const code = document.getElementById(`${this.state.lbgroupInputId}${id}`)
    code.select()
    document.execCommand('Copy',false)
    this.setState({
      copyCMDSuccess: true,
    })
  },
  serverDomainValidator(rule, value, cb) {
    const { intl: { formatMessage } } = this.props
    const pattern = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
    if (value && !pattern.test(value)) cb(formatMessage(intlMsg.inputRightDomain)) // 域名可以为空
    cb()
  },
  renderDomainWarningStatus(data, item) {
    const { form, intl: { formatMessage } } = this.props
    const { editCluster, editingKey } = this.state
    const isEditing = editingKey || editingKey === 0
    const { getFieldValue } = form
    const initialValue = data[item.key] && data[item.key].domain ? data[item.key].domain : undefined
    const currentValue = getFieldValue(`domain${item.key}`)
    let status = {
      status: 'success',
      message: ''
    }
    if (isEditing && initialValue && !currentValue.length) {
      status = {
        status: 'warning',
        message: formatMessage(intlMsg.clearDomainHttpError)
      }
      return status
    }
    if (isEditing && !currentValue && !initialValue) {
      return {
        status: 'success',
        message: '',
      }
    }
    const domainPattern = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
    if (isEditing && !domainPattern.test(currentValue)) {
      return {
        status: 'error',
        message: '',
      }
    }
    return status
  },
  onTabChange(key) {
    console.log(key)
  },
  renderIstioGateway() {
    const { nodeList } = this.state
    return(
      <ServiceMeshPortCard key="ServiceMeshPortCard"
      nodeList={nodeList}
      cluster={this.props.cluster}
      loadData={this.loadData}
      />
    )
  },
  _networkConfigArray(networkConfigArray, data ,isAdd) {
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 17 }
    }
    const { form, intl: { formatMessage } } = this.props
    const { editingKey, } = this.state
    const { getFieldProps, getFieldValue } = form
    return  networkConfigArray.filter(item => isAdd ? item.add : !item.add).map((item) => {
      const index = item.key
      const editCluster = editingKey === item.key

      if(item == 0){
        return <div></div>
      }
      if(item.deleted){
        return <Row key={`row-${index}`}></Row>
      }
      let originType = data[item.key] && data[item.key].type ? data[item.key].type : undefined
      let networkType = originType
      if(editCluster){
        networkType = getFieldValue(`networkType${item.key}`) || originType
      }
      let nameProps = getFieldProps(`name${item.key}`,{
        initialValue: data[item.key] && data[item.key].name ? data[item.key].name : undefined,
        rules:[{
          validator: (rule, value, callback) => {
            if(!value) {
              return callback(formatMessage(intlMsg.netProxyNotNull))
            }
            this.valiadAllGroupNameField()
            if(this.isNameRepeat(item.key)) {
              return callback(formatMessage(intlMsg.netProxyRepeat))
            }
            return callback()
          }
        }]
      })
      let addressProps = getFieldProps(`address${item.key}`,{
        initialValue: data[item.key] && data[item.key].address ? data[item.key].address : '',
        rules:[{required: true, message: formatMessage(intlMsg.serviceOutNotNull)}, {
          pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
          message: formatMessage(intlMsg.inputRightIp)
        }]
      })
      let domainProps  = getFieldProps(`domain${item.key}`,{
        initialValue: data[item.key] && data[item.key].domain ? data[item.key].domain: '',
        rules: [{ required: false }, {
          validator: this.serverDomainValidator
        }]
      })
      const domainWarningStatus = this.renderDomainWarningStatus(data, item)
      let groupidProps = getFieldProps(`groupId${item.key}`,{
        initialValue: data[item.key] && data[item.key].id ? data[item.key].id : '',
      })
      let isDefaultGroupAttr = getFieldProps(`isDefaultGroupAttr${item.key}`,{
        initialValue: data[item.key] && data[item.key].isDefault ? data[item.key].isDefault : false,
      })
      return  <div className={`clusterTable ${isAdd ? 'no-border-top' : ''}`} key={`rows-${index}`}>
        {
          data[item.key] && data[item.key].isDefault
            ? <div className='dafaultGroup'><NoteIcon title={`默认`}/></div>
            : null
        }
        <Row className='title'>
          <Col span="12">
            <FormattedMessage {...intlMsg.serviceIntranetProxy}/>
            <Tooltip title={formatMessage(intlMsg.serviceIntranetIpShow)}>
              <Icon type="question-circle-o" className='qustionIcon'/>
            </Tooltip>
          </Col>
          <Col span="9">
            <FormattedMessage {...intlMsg.serviceOut}/>
            <Tooltip title={formatMessage(intlMsg.serviceOutIpShow)}>
              <Icon type="question-circle-o" className='qustionIcon'/>
            </Tooltip>
            <span className="sketchMap" onClick={()=> this.setState({visible:true})}><FormattedMessage {...intlMsg.checkPic}/></span>
          </Col>
          {
            !isAdd && <Col span="3">
              <div className={'actionColumn'}><FormattedMessage {...intlMsg.action}/></div>
            </Col>
          }
        </Row>
        <Row>
          {/*<Icon
              type="cross"
              className='crossIcon'
              onClick={() => this.deletePublic(item, data[item.key])}
              style={{display: editCluster ? 'inline-block' : 'none'}}
            />*/}

          <Col xs={{span:9}}>
            <div className="formItem inner-mesh">
              <Row className='innerItemTitle'>
                <Col xs={{span:11}}><FormattedMessage {...intlMsg.proxyNode}/></Col>
                <Col xs={{span:13}}><FormattedMessage {...intlMsg.nodeNetIpConfirm}/></Col>
              </Row>
              {this.getItems(item)}
              {editCluster &&
              <Form.Item className="increase">
                <span onClick={() => this.add(item)}><Icon type="plus-circle-o" /> <FormattedMessage {...intlMsg.addIntranetProxy}/></span>
              </Form.Item>
              }
            </div>
          </Col>
          <Col style={{height:'100%'}} xs={{span:3}}>
            <div className="imgBox imgboxa">
              <img style={{width:'90%', maxWidth: '190px'}} src={mappingImg}/>
            </div>
          </Col>
          <Col xs={{span:9}}>
            <div className="formItem extranet">
              {
                data[item.key] && data[item.key].id &&
                <Row style={{marginBottom: '20px'}}>
                  <Col span="7"><FormattedMessage {...intlMsg.outId}/></Col>
                  <Col span="17">
                    {data[item.key].id}
                    <Tooltip title={this.state.copyCMDSuccess ? formatMessage(intlMsg.copySuccess): formatMessage(intlMsg.clickCopy)}>
                      <a
                        className={this.state.copyCMDSuccess ? "actions copyBtn": "copyBtn"}
                        onClick={() => this.copyOrder(data[item.key].id)}
                        onMouseLeave={() => setTimeout(() => this.setState({ copyCMDSuccess: false }),500)}
                      >
                        <Icon type="copy" style={{ marginLeft: 8 }}/>
                      </a>
                    </Tooltip>
                    <input
                      id={`${this.state.lbgroupInputId}${data[item.key].id}`}
                      style={{ position: "absolute",opacity: "0",top: '0' }}
                      value={data[item.key].id}
                    />
                  </Col>
                </Row>
              }
              <FormItem
                label={<span> <FormattedMessage {...intlMsg.type}/>
                  <span style={{color: 'red'}}>*</span>
                  <Tooltip title={formatMessage(intlMsg.typeNetOutService)}>
                    <Icon type="question-circle-o" className='qustionIcon'/>
                  </Tooltip>
                  { this.typeIcon(networkType)}
                </span>}
                {...formItemLayout}
              >
                <Select
                  {...getFieldProps(`networkType${item.key}`,{
                    initialValue: data[item.key] && data[item.key].type ? data[item.key].type : undefined,
                    rules:[{required: true, message: formatMessage(intlMsg.netTypeNotNull)}]
                  })}
                  disabled={!editCluster}
                  className="select-width-full"
                >
                  <Option value="public" key="public"><FormattedMessage {...intlMsg.publicNet}/></Option>
                  <Option value="private" key="private"><FormattedMessage {...intlMsg.intranet}/></Option>
                  {/*<Option value="incluster" key="incluster">不填写</Option>*/}
                </Select>
              </FormItem>
              <FormItem
                label={<span> <FormattedMessage {...intlMsg.name}/>
                  <span style={{color: 'red'}}>*</span>
                  <Tooltip title={formatMessage(intlMsg.suggestPublicOrIntranet)}>
                    <Icon type="question-circle-o" className='qustionIcon'/>
                  </Tooltip>
                </span>}
                {...formItemLayout}
              >
                <Input
                  placeholder={formatMessage(intlMsg.inputNetProxyName)}
                  {...nameProps}
                  disabled={!editCluster || networkType == 'incluster'}
                />
              </FormItem>
              <FormItem
                label={<span> <FormattedMessage {...intlMsg.serviceOutIp}/>
                  <span style={{color: 'red'}}>*</span>
                </span>}
                {...formItemLayout}
              >
                <Input
                  placeholder={ networkType == 'incluster' ? formatMessage(intlMsg.noNeedInput) : formatMessage(intlMsg.intranetIpAccessService)}
                  {...addressProps}
                  disabled={networkType == 'incluster' || !editCluster}
                />
              </FormItem>
              <FormItem
                label={<span><FormattedMessage {...intlMsg.serviceDomainConfig}/></span>}
                {...formItemLayout}
                validateStatus={domainWarningStatus.status}
                extra={domainWarningStatus.message}
              >
                <Input
                  placeholder={formatMessage(intlMsg.serviceAddressDomain)}
                  {...domainProps}
                  disabled={networkType == 'incluster' || !editCluster}
                />
              </FormItem>
            </div>
          </Col>
          {
            !isAdd && <Col span={3} className={'actionButtons'}>
              {
                !editCluster ?
                  [
                    <Button
                      key='edit'
                      onClick={() => {
                        const _ = this
                        editingKey || editingKey === 0  ?
                          Modal.confirm({
                            width:460,
                            title: <span style={{fontWeight:500}}>{formatMessage(intlMsg.haveEditingOut)}</span>,
                            content: formatMessage(intlMsg.goOnNoSave),
                            onOk() {
                              _.cancleEdit()
                              _.setState({
                                editingKey: item.key,
                              })
                            },
                          })
                          : this.setState({
                            editingKey: item.key,
                          })
                      }}
                      icon={'edit'}
                      type="dashed"
                    />,
                    <Button
                      key="delete"
                      icon={'delete'}
                      disabled={editingKey || editingKey === 0}
                      onClick={() => this.deletePublic(item, data[item.key])}
                      type="dashed"
                    />,
                  ] : [
                    <Button
                      key="save"
                      onClick={this.updateCluster}
                      icon={'check'}
                      type="dashed"
                    />,
                    <Button
                      key="cancel"
                      onClick={this.cancleEdit}
                      icon={'cross'}
                      type="dashed"
                    />,
                  ]
              }
            </Col>
          }
        </Row>
      </div>
    })
  },
  render (){
    const { cluster, form, clusterProxy, intl: { formatMessage } } = this.props
    const { editCluster, saveBtnLoading, sketchshow, networkType } = this.state
    const { getFieldProps, getFieldValue, setFieldsValue } = form
    if(clusterProxy.isEmptyObject || !clusterProxy.result) {
      return  <Card id="Network">
        <div className="header"><FormattedMessage {...intlMsg.networkConfig}/></div>
        <div className="loadingBox" style={{height:'100px'}}><Spin size="large"></Spin></div>
      </Card>
    }
    let proxy = clusterProxy.result[camelize(cluster.clusterID)]
    if(!proxy) {
      return  <Card id="Network">
        <div className="header"><FormattedMessage {...intlMsg.networkConfig}/></div>
        <div className="loadingBox" style={{height:'100px'}}><FormattedMessage {...intlMsg.noProxyForNow}/></div>
      </Card>
    }
    let networkConfigArray = form.getFieldValue('networkConfigArray')
    let disabledAddNetOut = false
    networkConfigArray.map(conf => conf.add && (disabledAddNetOut = true))
    if(!networkConfigArray) {
      return  <Card id="Network">
        <div className="header"><FormattedMessage {...intlMsg.networkConfig}/></div>
        <div className="loadingBox" style={{height:'100px'}}><FormattedMessage {...intlMsg.noProxyForNow}/></div>
      </Card>
    }
    let dataList = proxy.data
    let data = []
    dataList.forEach((item, index) => {
      if(item.type !== "incluster"){
        data.push(item)
      }
    })
    let networkConfigList = []
    if(!networkConfigArray.length){
      networkConfigList = [
        <div className='nodata'>
          <FormattedMessage {...intlMsg.noConfigPlsAdd}/>
        </div>
      ]
    } else {
      networkConfigList = this._networkConfigArray(networkConfigArray, data)
    }

    return (
      <Card id="Network" >
        <div className="header"><FormattedMessage {...intlMsg.networkConfig}/></div>
        <ThirdTabs
          tabs={[
            { name: formatMessage(intlMsg.serverProxy), value: 'server' },
            { name: formatMessage(intlMsg.IstioGateway), value: 'Istio-gateway' }
            ]}
          active={networkType}
          onChange={key => this.setState({ networkType: key })}
        />
        {
          networkType === 'server' &&
          <QueueAni>
            <div className={'addNetOut'} key={'btn'}>
              <Button disabled={disabledAddNetOut} type="primary" className='addPublick' onClick={this.addPublicModal}>
                <FormattedMessage {...intlMsg.addNetOut}/>
              </Button>
              <Tooltip title={formatMessage(intlMsg.setDefaultNet)}>
                <Button icon="setting" className='settingDefalut' onClick={() => this.setState({settingDefalut: true, defaultSetting: this.state.defaultGroup})}>
                {formatMessage(intlMsg.set)}
                </Button>
              </Tooltip>
            </div>
            <Form key={form}>
              { networkConfigList }
            </Form>
          </QueueAni>
        }
        {
          networkType === 'Istio-gateway' && this.renderIstioGateway()
        }
        <Modal wrapClassName="vertical-center-modal" width='75%' title={formatMessage(intlMsg.Schematic)}
               footer={<Button type="primary" onClick={()=> this.setState({visible:false})}>
                 <FormattedMessage {...intlMsg.iKnow}/></Button>}
               visible={this.state.visible} onCancel={()=> this.setState({visible:false})}>
          <div className="imgBox">
            <img style={{width:'100%',height:'100%'}} src={sketchImg}/>
          </div>
        </Modal>
        <Modal
          wrapClassName="vertical-center-modal"
          // [LOT-3166] 添加网络出口Modal 1280x800小屏幕下有问题
          // 该Modal下内容宽度是确定的, 应该将 Modal的宽度也设置为定值
          width="980px"
          title={formatMessage(intlMsg.addNetOut)}
          footer={[
            <Button key="cancel" onClick={this.cancleEdit}><FormattedMessage {...intlMsg.cancel}/></Button>,
            <Button key="save" onClick={this.updateCluster} type="primary"><FormattedMessage {...intlMsg.save}/></Button>,
            ]}
          visible={this.state.addContentVisible}
          onCancel={this.cancleEdit}
        >
          < div className="network-config-add-modal">
            {this._networkConfigArray(networkConfigArray, data, 'isAdd')}
          </div>
        </Modal>
         <Modal
           title={formatMessage(intlMsg.setDefaultNetOut)}
           visible={this.state.settingDefalut}
           closable={true}
           onOk={this.confirmSet}
           onCancel={this.cancelSet}
           width='570px'
           maskClosable={false}
           confirmLoading={this.settingDefalutLoading}
           wrapClassName="settingDefalut"
         >
           <div>
             <div className='alertRow'><FormattedMessage {...intlMsg.setOneDefaultNetOut}/></div>
           </div>
           <Form.Item
             label={formatMessage(intlMsg.defaultNetOut)}
             labelCol={{span: 5}}
             wrapperCol={{span: 19}}
           >
             <Select
               style={{width:'180px'}}
               placeholder={formatMessage(intlMsg.selectDefaultNetOut)}
               notFoundContent={formatMessage(intlMsg.noOut)}
               {...getFieldProps('defaultSetting',{
                 initialValue: this.state.defaultGroup,
                 onChange: this.selectSettingChange
               })}
             >
               { this.selectOption() }
             </Select>
           </Form.Item>
         </Modal>

        <Modal
          title={formatMessage(intlMsg.deleteNetOut)}
          visible={this.state.deleteDefaultGroup}
          closable={true}
          onOk={() => this.deletePublic(this.state.currentItem, 'confirm')}
          onCancel={() => this.setState({deleteDefaultGroup: false})}
          width='570px'
          maskClosable={false}
          wrapClassName="deleteDefaultGroup"
        >
          <div className='tips'>
            <i className="fa fa-exclamation-triangle warningIcon" aria-hidden="true" style={{top: this.state.currentGroup ? '28px' : '14px' }}></i>
            <div>
            {
              this.state.currentGroup
              ? <span>1、</span>
              : null
            }
              <FormattedMessage {...intlMsg.deleteNetOutTip}/></div>
            {
              this.state.currentGroup
              ? <div><FormattedMessage {...intlMsg.deleteNetOutTip2}/></div>
              : null
            }
          </div>

          <div className='message'>
            <Icon type="question-circle-o questionIcon" />
            <FormattedMessage {...intlMsg.deleteNetOutConfirm } values={{ currentName: this.state.currentName }}/>
          </div>
        </Modal>
      </Card>
    )
  }
})

function mapStateToProps(state, props) {
  const { cluster_nodes } = state
  // const defaultNodeList = {isFetching: false, isEmptyObject: true}
  const defaultProxy = {isFetching: false, isEmptyObject: true}
  // let allNode = state.cluster_nodes.getAllClusterNodes
  const isFetching = getDeepValue(cluster_nodes, ['clusterIngresses', 'isFetching']) || false
  const nodeList = getDeepValue(cluster_nodes, ['clusterIngresses', 'result', 'data']) || []
  // if(!allNode) {
  //   allNode = defaultNodeList
  // }
  let clusterProxy = state.cluster.proxy
  if(!clusterProxy) {
    clusterProxy = defaultProxy
  }
  return {
    // nodeList,
    isFetching,
    clusterProxy
  }
}

export default connect(mapStateToProps, {
  getProxy,
  updateProxy,
  getClusterNodeAddr,
  getAllClusterNodes,
  getNodesIngresses,
  changeClusterIPsAndDomains,
  setDefaultGroup
})(Form.create()(injectIntl(NetworkConfiguration, {
  withRef: true,
})))
