/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ServiceList component
 *
 * v0.1 - 2017-06-05
 * @author ZhangChengZheng
 */
import React,{ Component,PropTypes } from 'react'
import { Modal, Row, Col, InputNumber, Input, Slider, Button, Form, Select, Icon, Switch, Radio, Tooltip } from 'antd'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import './style/CreateVolume.less'
import { calcuDate, parseAmount, formatDate } from '../../common/tools'
import { serviceNameCheck } from '../../common/naming_validation'
import { SnapshotClone, createStorage, getCheckVolumeNameExist, SnapshotList } from '../../actions/storage'
import { getClusterStorageList } from '../../actions/cluster'
import PersistentVolumeClaim from '../../../kubernetes/objects/persistentVolumeClaim'
import yaml from 'js-yaml'
import { DEFAULT_IMAGE_POOL, UPGRADE_EDITION_REQUIRED_CODE } from '../../constants'
import NotificationHandler from '../../components/Notification'
import { ASYNC_VALIDATOR_TIMEOUT } from '../../constants'
import StorageIntl from './StorageIntl'

const Option = Select.Option
const notificationHandler = new NotificationHandler()

class CreateVolume extends Component {
  constructor(props) {
    super(props)
    this.checkVolumeName = this.checkVolumeName.bind(this)
    this.changeVolumeSizeSlider = this.changeVolumeSizeSlider.bind(this)
    this.changeVolumeSizeInputNumber = this.changeVolumeSizeInputNumber.bind(this)
    this.handleFormatSelectOption = this.handleFormatSelectOption.bind(this)
    this.handleComfirmCreateVolume = this.handleComfirmCreateVolume.bind(this)
    this.handleCancelCreateVolume = this.handleCancelCreateVolume.bind(this)
    this.handleResetState = this.handleResetState.bind(this)
    this.handleSelectSnapshot = this.handleSelectSnapshot.bind(this)
    this.SnapshotSwitch = this.SnapshotSwitch.bind(this)
    this.renderCephSeverOption = this.renderCephSeverOption.bind(this)
    this.selectStorageServer = this.selectStorageServer.bind(this)
    this.state = {
      volumeSizemin: this.props.volumeSize || 1024,
      volumeSize:this.props.volumeSize || 1024,
      fstype: 'ext4',
      currentSnapshot: this.props.currentSnapshot,
      currentVolume: this.props.currentVolume,
      loading: false,
      ext4Disabled: false,
      xfsDisabled: false,
      swicthChecked: false,
      switchDisabled: false,
      selectChecked: false,
      renderSnapshotOptionlist: this.props.snapshotDataList,
      hasAlreadyGetSnapshotList: false,
    }
  }

  SnapshotSwitch(){
    const { swicthChecked, hasAlreadyGetSnapshotList } = this.state
    if(!swicthChecked && !hasAlreadyGetSnapshotList){
      const { SnapshotList, clusterID, intl } = this.props
      const { formatMessage } = intl
      notificationHandler.spin(formatMessage(StorageIntl.getSnapshotList))
      SnapshotList({clusterID}, {
        success: {
          func: () => {
            notificationHandler.close()
            this.setState({
              swicthChecked: !this.state.swicthChecked,
              hasAlreadyGetSnapshotList: true
            })
            if(this.state.swicthChecked){
              this.setState({
                ext4Disabled: false,
                xfsDisabled: false,
              })
            }
          },
          isAsync: true,
        },
        failed: {
          func: () => {
            notificationHandler.close()
            notificationHandler.error(formatMessage(StorageIntl.getSnapshotFailed))
          }
        }
      })
      return
    }
    this.setState({
      swicthChecked: !this.state.swicthChecked
    })
    if(this.state.swicthChecked){
      this.setState({
        ext4Disabled: false,
        xfsDisabled: false,
      })
    }
  }

  componentWillMount() {
    const { getClusterStorageList, cluster } = this.props
    const clusterID = cluster.clusterID
    getClusterStorageList(clusterID)
  }

  componentDidMount() {
    const { currentSnapshot, form } = this.props
    if(currentSnapshot){
      this.setState({
        volumeSize: currentSnapshot.size,
        fstype: currentSnapshot.fstype,
        volumeSizemin: currentSnapshot.size,
        ext4Disabled: currentSnapshot.fstype == 'xfs',
        xfsDisabled: currentSnapshot.fstype == 'ext4',
        swicthChecked: true,
        switchDisabled: true,
        selectChecked: true,
      })
      form.setFieldsValue({
      	'address': currentSnapshot.storageServer
      })
      return
    }
    this.setState({
      ext4Disabled: false,
      xfsDisabled: false,
      swicthChecked: false,
      switchDisabled: false,
      selectChecked: false,
    })
  }

  componentWillReceiveProps(nextProps) {
    // 由快照创建存储卷时需要进行的重置操作
    if(nextProps.currentSnapshot && !this.props.createModal && nextProps.createModal){
      this.setState({
        currentSnapshot: nextProps.currentSnapshot,
        currentVolume: nextProps.currentVolume,
        volumeSize: nextProps.currentSnapshot.size || 1024,
        fstype: nextProps.currentSnapshot.fstype,
        volumeSizemin: nextProps.currentSnapshot.size,
        ext4Disabled: nextProps.currentSnapshot.fstype == 'xfs',
        xfsDisabled: nextProps.currentSnapshot.fstype == 'ext4',
        swicthChecked: true,
        switchDisabled: true,
        selectChecked: true,
      })
      this.props.form.setFieldsValue({
        'address': nextProps.currentSnapshot.storageServer
      })
      return
    }
    // 直接创建独享型存储是需要进行的重置操作
    if(this.props.createModal !== nextProps.createModal && nextProps.createModal){
      this.setState({
        fstype: 'ext4',
        volumeSizemin: 1024,
        volumeSize: 1024,
        ext4Disabled: false,
        xfsDisabled: false,
        swicthChecked: false,
        switchDisabled: false,
        selectChecked: false,
        renderSnapshotOptionlist: nextProps.snapshotDataList,
      })
    }
  }

  handleSelectSnapshot(value) {
    const { snapshotDataList,form } = this.props
    for(let i = 0; i < snapshotDataList.length; i++){
      if(snapshotDataList[i].name == value){
        this.setState({
          volumeSizemin: snapshotDataList[i].size,
          volumeSize: snapshotDataList[i].size,
          fstype: snapshotDataList[i].fstype,
          ext4Disabled: snapshotDataList[i].fstype == 'xfs',
          xfsDisabled: snapshotDataList[i].fstype == 'ext4',
        })
        form.setFieldsValue({
          selectSnapshotName: value,
          address: snapshotDataList[i].storageServer,
          type: 'ceph',
        })
        return
      }
    }
  }

  handleResetState() {
    const { scope, form, currentSnapshot } = this.props
    form.resetFields()
    scope.setState({
      visible: false,
    })
    this.setState({
      loading: false,
      ext4Disabled: false,
      xfsDisabled: false,
      volumeSize: 1024,
    })
    if(!currentSnapshot){
      this.setState({
        swicthChecked: false,
        switchDisabled: false,
        selectChecked: false,
      })
    }
  }

  handleComfirmCreateVolume() {
    const {
      form, SnapshotClone, cluster, currentVolume, createStorage, loadStorageList,
      snapshotDataList, scope, intl
    } = this.props
    const { volumeSize,fstype, swicthChecked } = this.state
    const { formatMessage } = intl
    this.setState({
      loading: true,
    })
    const validataArray = [
      'volumeName',
      'type',
      'address',
      //'strategy'
    ]
    if(swicthChecked){
      validataArray.push('selectSnapshotName')
    }
    form.validateFields(validataArray, (errors,values) => {
      if(!!errors){
        this.setState({
          loading: false,
        })
        return
      }
      let notification = new NotificationHandler()
      notification.spin(formatMessage(StorageIntl.createExclusiveing))
      if(!values.selectSnapshotName){
        // 创建存储卷
        const config = {
          name: values.volumeName,
          fsType: fstype,
          storageType: values.type,
          //reclaimPolicy: values.strategy,
          storageClassName: values.address,
          storage: `${volumeSize}Mi`,
        }
        const persistentVolumeClaim = new PersistentVolumeClaim(config)
        const obj = {
          cluster: cluster.clusterID,
          template: yaml.dump(persistentVolumeClaim)
        }
        createStorage(obj, {
          success: {
            func: () => {
              this.handleResetState()
              notification.close()
              notification.success(formatMessage(StorageIntl.create) + formatMessage(StorageIntl.exclusiveStorage) +`${config.name} `+ formatMessage(StorageIntl.actionSuccess))
              scope.setState({ searchInput: '' }, loadStorageList({ page: 1, search: '' }))
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              this.handleResetState()
              notification.close()
              if(err.statusCode === 409){
                notification.error(formatMessage(StorageIntl.exclusiveStorage)  + config.name + formatMessage(StorageIntl.exists))
                return
              }
              if (err.statusCode !== 402 && err.statusCode !== UPGRADE_EDITION_REQUIRED_CODE) {
                notification.error(
                  formatMessage(StorageIntl.create)+
                  formatMessage(StorageIntl.exclusiveStorage) +
                  ` ${config.name}` + formatMessage(StorageIntl.actionFailed),
                   err.message.message || err.message
                )
              }
            }
          }
        })
        return
      }
      let volumeName = ''
      if(currentVolume){
        volumeName = currentVolume.name
      } else {
        for(let i=0;i<snapshotDataList.length;i++){
          if(snapshotDataList[i].name == values.selectSnapshotName){
            volumeName = snapshotDataList[i].volume
            break
          }
        }
      }
      const body = {
        clusterID: cluster.clusterID,
        volumeName,
        body: {
          "snapshotName": values.selectSnapshotName,
          "cloneName": values.volumeName,
          "size": volumeSize,
          "fstype": fstype
        }
      }
      SnapshotClone(body,{
        success: {
          func: () => {
            notification.close()
            notification.success(
              formatMessage(StorageIntl.create)+
              formatMessage(StorageIntl.exclusiveStorage)+
              formatMessage(StorageIntl.actionSuccess)
            )
            this.handleResetState()
            const { snapshotRequired } = this.props
            if(!snapshotRequired){
              this.props.scope.getStorageList()
            }
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
            if(res.statusCode === 409){
              notification.error(
                formatMessage(StorageIntl.storageVolume)+
                volumeName +
                formatMessage(StorageIntl.exists)
              )
              return
            }
            let message = formatMessage(StorageIntl.create) + formatMessage(StorageIntl.storageVolume) + formatMessage(StorageIntl.actionFailed)
            this.handleResetState()
            notification.close()

            notification.error(message, res.message || '')
          }
        }
      })
    })
  }

  handleCancelCreateVolume() {
    this.handleResetState()
  }

  checkVolumeName(rule, value, callback){
    const { getCheckVolumeNameExist, clusterID, intl } = this.props
    const { formatMessage } = intl
    let msg = serviceNameCheck(value, formatMessage(StorageIntl.storageName))
    if (msg !== 'success') {
      return callback(msg)
    }
    clearTimeout(this.volumeNameChechTimeout)
    this.volumeNameChechTimeout = setTimeout(() => {
      getCheckVolumeNameExist(clusterID, value, {
        success: {
          func: () => {
            return callback()
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            if(res.statusCode == 409){
              msg = serviceNameCheck(value, formatMessage(StorageIntl.storageName), true)
              return callback(msg)
            }
          },
          isAsync: true
        }
      })
    }, ASYNC_VALIDATOR_TIMEOUT)
  }

  handleFormatSelectOption(){
    const { renderSnapshotOptionlist } = this.state
    if(!renderSnapshotOptionlist.length){
      return <Option
        key='nodata'
        value='nodata'
        disabled
        style={{textAlign: 'center'}}
      >
        <FormattedMessage {...StorageIntl.notSnapshot} />
      </Option>
    }
    let Options = renderSnapshotOptionlist.map((item, index) => {
      return <Option key={item.name} value={item.name}>
        <Row>
          <Col span={8} className='snapshotName'>{item.name}</Col>
          <Col span={9}>{formatDate(item.createTime)}</Col>
          <Col span={4}>{item.size} M</Col>
          <Col span={3}>{item.fstype}</Col>
        </Row>
      </Option>
    })
    return Options
  }

  changeVolumeSizeSlider(size){
    const { volumeSizemin } = this.state
    if(size < volumeSizemin){
      size = volumeSizemin
    }
    if (size > 20480) {
      size = 20480
    }
    this.setState({
      volumeSize: size
    })
  }

  changeVolumeSizeInputNumber(number){
    const { volumeSizemin } = this.state
    if(number < volumeSizemin){
      number = volumeSizemin
    }
    this.setState({
      volumeSize: number
    })
  }

  renderCephSeverOption(){
    const { cephList } = this.props
    return cephList.map((item, index) => {
      return <Option key={`ceph${index}`} value={item.metadata.name}>{item.metadata.annotations[`system/scName`]}</Option>
    })
  }

  selectStorageServer(value) {
    const {snapshotDataList, form} = this.props
    const { swicthChecked } = this.state
    if(swicthChecked){
      form.setFieldsValue({
        selectSnapshotName: undefined
      })
    }
    let list = []
    snapshotDataList.forEach((item, index) => {
      if(item.storageServer.indexOf(value) > -1){
        list.push(item)
      }
    })
    this.setState({
      renderSnapshotOptionlist: list
    })
  }

  render(){
    const { form, cluster, snapshotRequired, isFetching, billingEnabled, cephList, intl } = this.props
    const { currentSnapshot } = this.state
    const { getFieldProps } = form
    const { formatMessage } = intl
    const VolumeNameProps = getFieldProps('volumeName',{
      rules: [{
        validator: this.checkVolumeName
      }]
    })
    let selectdefaultValue = undefined
    if(currentSnapshot){
      selectdefaultValue = currentSnapshot.name
    }
    let selectSnapshotNameProps
    if(this.state.swicthChecked){
      selectSnapshotNameProps = getFieldProps('selectSnapshotName',{
        rules:[{
          required: true,
          message: formatMessage(StorageIntl.inputSnapshot),
        }],
        initialValue: selectdefaultValue
      })
    }
    const resourcePrice = cluster.resourcePrice
    const storagePrice = resourcePrice.storage /10000
    const hourPrice = parseAmount(this.state.volumeSize /1024 * resourcePrice.storage, 4)
    const countPrice = parseAmount(this.state.volumeSize /1024 * resourcePrice.storage * 24 *30, 4)

    let init_address
    cephList.map(item => {
      if(item.metadata.labels["system/storageDefault"] === "true"){
        init_address = item.metadata.name
      }
    })
    return(
      <div id="CreateVolume">
        <Form className='formStyle'>
          <Row className='volumeName'>
            <Col span="4" className="name-text-center name">
              {formatMessage(StorageIntl.storageName)}
            </Col>
            <Col span="19" className='nameValue'>
              <Form.Item>
                <Input {...VolumeNameProps} placeholder={formatMessage(StorageIntl.storageName)} />
              </Form.Item>
            </Col>
          </Row>
          <Row className='type'>
            <Col span="4" className="name-text-center name">
              {formatMessage(StorageIntl.type)}
            </Col>
            <Col span="19" className='type_value'>
              <Row>
                <Col span={12}>
                  <Form.Item>
                    <Select
                      placeholder={formatMessage(StorageIntl.pleaseType)}
                      disabled={this.state.selectChecked}
                      {...getFieldProps('type', {
                        initialValue: "ceph",
                        rules: [{required: true, message: formatMessage(StorageIntl.pleaseType)}]
                      })}
                    >
                      <Option key="ceph" value="ceph">{formatMessage(StorageIntl.blockStorage)}</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    <Select
                      disabled={this.state.selectChecked}
                      placeholder={formatMessage(StorageIntl.pleaseBlockCluster)}
                      {...getFieldProps('address', {
                        initialValue: init_address,
                        rules: [{
                          required: true,
                          message: formatMessage(StorageIntl.pleaseBlockCluster)
                        }],
                        onChange: this.selectStorageServer,
                      })}
                    >
                      { this.renderCephSeverOption() }
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className='switchSnapshot'>
            <Col span="4" className="name-text-center switchName">
              {formatMessage(StorageIntl.useSnapshot)}
            </Col>
            <Col span="3">
              <Switch
                checkedChildren={<Icon type="check" />}
                unCheckedChildren={<Icon type="cross" />}
                onChange={this.SnapshotSwitch}
                checked={this.state.swicthChecked}
                disabled={this.state.switchDisabled || isFetching}
              />
            </Col>
            <Col span="15">{formatMessage(StorageIntl.snapshotTops)}</Col>
          </Row>
          {
            this.state.swicthChecked
            ? <Row className='snapshot'>
              <Col span="4" className="name-text-center name">
                <FormattedMessage {...StorageIntl.snapshot} />
              </Col>
              <Col span="12" className='nameValue'>
                <Form.Item>
                  <Select
                    showSearch
                    placeholder={formatMessage(StorageIntl.pleaseSelectSnapshot)}
                    size="large"
                    notFoundContent={formatMessage(StorageIntl.notFound)}
                    {...selectSnapshotNameProps}
                    onChange={this.handleSelectSnapshot}
                    getPopupContainer={() => document.getElementById('CreateVolume')}
                    className='selectSnapshot'
                    disabled={this.state.selectChecked}
                  >
                    <Option key="title" value="title" disabled={true}>
                      <Row>
                        <Col span={8}>{formatMessage(StorageIntl.snapshotName)}</Col>
                        <Col span={9}>{formatMessage(StorageIntl.createTime)}</Col>
                        <Col span={4}>{formatMessage(StorageIntl.size)}</Col>
                        <Col span={3}>{formatMessage(StorageIntl.type)}</Col>
                      </Row>
                    </Option>
                    {this.handleFormatSelectOption()}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            : null
          }
          <Row className='volumeSize'>
            <Col span="4" className="name-text-center size">
              <FormattedMessage {...StorageIntl.size} />
            </Col>
            <Col span="12">
              <Slider
                min={1024}
                max={1024000}
                step={1024}
                defaultValue={this.state.volumeSizemin}
                onChange={(size) => this.changeVolumeSizeSlider(size)}
                value={this.state.volumeSize}
              />
            </Col>
            <Col span="7" className='inputbox'>
              <InputNumber
                min={this.state.volumeSizemin}
                max={1024000}
                step={1024}
                defaultValue={this.state.volumeSizemin}
                value={this.state.volumeSize}
                onChange={(number) => this.changeVolumeSizeInputNumber(number)}
              />
              <span style={{ paddingLeft: 10 }} >MB</span>
            </Col>
          </Row>
          <Row className='volumeFormat'>
            <Col span="4" className="name-text-center format">
              <FormattedMessage {...StorageIntl.format} />
            </Col>
            <Col span="20" className="action-btns">
              <Button
                className='formatbutton'
                type={this.state.fstype == 'ext4' ? 'primary' : 'default'}
                onClick={() => this.setState({fstype: 'ext4'})}
                disabled={this.state.ext4Disabled}
              >
                ext4
              </Button>
              <Button
                className='formatbutton'
                type={this.state.fstype == 'xfs' ? 'primary' : 'default'}
                onClick={() => this.setState({fstype: 'xfs'})}
                disabled={this.state.xfsDisabled}
              >
                xfs
              </Button>
            </Col>
          </Row>
          {/*<Form.Item
            label={<span>回收策略
              <Tooltip title={<div>
                <div>保留：服务删除时，保留存储</div>
                <div>删除：删除服务时，删除存储</div>
              </div>}>
                <Icon type="question-circle-o" className='question_icon'/>
              </Tooltip>
            </span>}
            {...formItemLayout}
            className='strategy'
          >
            <Radio.Group {...getFieldProps('strategy', {
              initialValue: 'retain'
            })}>
              <Radio key="retain" value="retain" className='item'>保留</Radio>
              <Radio key="delete" value="delete" disabled>删除</Radio>
            </Radio.Group>
            <span className='strategy_tips'><Icon type="question-circle-o" className='tips_icon'/>暂不支持删除策略</span>
          </Form.Item>*/}
          { billingEnabled ?
          <div className="modal-price">
            <div className="price-left">
              <FormattedMessage {...StorageIntl.storage} />：{hourPrice.unit == '￥' ? '￥' : ''}{ storagePrice } {hourPrice.unit == '￥' ? '' : ' T'}/(GB*<FormattedMessage {...StorageIntl.hour} />)
            </div>
            <div className="price-unit">
              <p><FormattedMessage {...StorageIntl.count} />：<span className="unit">{hourPrice.unit == '￥'? '￥': ''}</span><span className="unit blod">{ hourPrice.amount }{hourPrice.unit == '￥'? '': ' T'}/<FormattedMessage {...StorageIntl.hour} /></span></p>
              <p><span className="unit">（<FormattedMessage {...StorageIntl.about} />：</span><span className="unit">{ countPrice.fullAmount }/<FormattedMessage {...StorageIntl.month} />）</span></p>
            </div>
          </div>
          :null
          }
        </Form>
        <div className='createVolumeFooter'>
          <Button size='large' type="primary" className='buttonConfirm' onClick={this.handleComfirmCreateVolume} loading={this.state.loading}><FormattedMessage {...StorageIntl.btnOk} /></Button>
          <Button size='large' className='buttonCancel' onClick={this.handleCancelCreateVolume}><FormattedMessage {...StorageIntl.cancel} /></Button>
        </div>
      </div>
    )
  }
}

CreateVolume = Form.create()(CreateVolume)

function mapStateToProp(state, props) {
  const { cluster } = state.entities.current
  const { billingConfig } = state.entities.loginUser.info
  const clusterID = cluster.clusterID
  const stateCluster = state.cluster
  const { snapshotList } = state.storage
  const { enabled: billingEnabled } = billingConfig
  let cephList = []
  if(stateCluster.clusterStorage && stateCluster.clusterStorage[clusterID] && stateCluster.clusterStorage[clusterID].cephList){
    cephList = stateCluster.clusterStorage[clusterID].cephList
  }
  let isFetching = false
  const snapshotListKeys = Object.keys(snapshotList)
  snapshotListKeys.forEach(item => {
    if(item == 'isFetching'){
      isFetching = snapshotList[item]
    }
  })
  return {
    cluster,
    clusterID,
    cephList,
    isFetching,
    billingEnabled
  }
}

export default connect(mapStateToProp, {
  SnapshotClone,
  createStorage,
  getClusterStorageList,
  getCheckVolumeNameExist,
  SnapshotList,
})(injectIntl(CreateVolume, {
  withRef: true,
}))
