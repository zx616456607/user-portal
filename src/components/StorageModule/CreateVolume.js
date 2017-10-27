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
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/CreateVolume.less'
import { calcuDate, parseAmount, formatDate } from '../../common/tools'
import { serviceNameCheck } from '../../common/naming_validation'
import { SnapshotClone, createStorage, loadStorageList, getCheckVolumeNameExist, SnapshotList } from '../../actions/storage'
import { getClusterStorageList } from '../../actions/cluster'
import PersistentVolumeClaim from '../../../kubernetes/objects/persistentVolumeClaim'
import yaml from 'js-yaml'
import { DEFAULT_IMAGE_POOL, UPGRADE_EDITION_REQUIRED_CODE } from '../../constants'
import NotificationHandler from '../../components/Notification'
import { SHOW_BILLING, ASYNC_VALIDATOR_TIMEOUT } from '../../constants'

const Option = Select.Option
const notificationHandler = new NotificationHandler()

const messages = defineMessages({
  name: {
    id: "Storage.modal.name",
    defaultMessage: '名称'
  },
  snapshot: {
    id: "Storage.modal.snapshot",
    defaultMessage: '快照'
  },
  cancelBtn: {
    id: "Storage.modal.cancelBtn",
    defaultMessage: '取消'
  },
  formats: {
    id: 'Storage.titleRow.formats',
    defaultMessage: '格式',
  },
  size: {
    id: 'Storage.titleRow.size',
    defaultMessage: '大小',
  },
  placeholder: {
    id: 'Storage.modal.placeholder',
    defaultMessage: '输入名称',
  },
})

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
      volumeSizemin: this.props.volumeSize || 512,
      volumeSize:this.props.volumeSize || 512,
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
      const { SnapshotList, clusterID } = this.props
      notificationHandler.spin('获取独享存储快照列表中')
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
            notificationHandler.error('获取独享型快照列表失败，不能使用快照创建独享型存储，请重试')
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
        volumeSize: nextProps.currentSnapshot.size || 512,
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
        volumeSizemin: 512,
        volumeSize: 512,
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
      volumeSize: 512,
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
    const { form,SnapshotClone,cluster,currentVolume,createStorage,currentImagePool,loadStorageList, snapshotDataList } = this.props
    const { volumeSize,fstype, swicthChecked } = this.state
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
      notification.spin('创建独享型存储中')
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
              notification.success(`创建独享型存储 ${config.name} 操作成功`)
              const query = {
                storagetype: 'ceph',
                srtype: 'private'
              }
              loadStorageList(currentImagePool, cluster.clusterID, query)
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              this.handleResetState()
              notification.close()
              if(err.statusCode === 409){
                notification.error('独享型存储 ' + config.name + ' 已经存在')
                return
              }
              if (err.statusCode !== 402 && err.statusCode !== UPGRADE_EDITION_REQUIRED_CODE) {
                notification.error(`创建独享型存储 ${config.name} 操作失败`,err.message.message || err.message)
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
            notification.success('创建存储成功')
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
              notification.error('存储卷 ' + volumeName + ' 已经存在')
              return
            }
            let message = '创建存储卷失败，请重试'
            this.handleResetState()
            notification.close()
            if(res.message){
              message = res.message
            }
            notification.error(message)
          }
        }
      })
    })
  }

  handleCancelCreateVolume() {
    this.handleResetState()
  }

  checkVolumeName(rule, value, callback){
    const { getCheckVolumeNameExist, clusterID } = this.props
    let msg = serviceNameCheck(value, '存储名称')
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
              msg = serviceNameCheck(value, '存储名称', true)
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
      return <Select.Option
        key='nodata'
        value='nodata'
        disabled
        style={{textAlign: 'center'}}
      >
        暂无可用快照
      </Select.Option>
    }
    let Options = renderSnapshotOptionlist.map((item, index) => {
      return <Select.Option key={item.name} value={item.name}>
        <Row>
          <Col span={8} className='snapshotName'>{item.name}</Col>
          <Col span={9}>{formatDate(item.createTime)}</Col>
          <Col span={4}>{item.size} M</Col>
          <Col span={3}>{item.fstype}</Col>
        </Row>
      </Select.Option>
    })
    return Options
  }

  changeVolumeSizeSlider(size){
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
      return <Option key={`ceph${index}`} value={item.metadata.name}>{item.metadata.annotations[`tenxcloud.com/scName`]}</Option>
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
    const { form, cluster, snapshotRequired, isFetching } = this.props
    const { currentSnapshot } = this.state
    const { getFieldProps } = form
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
          message:'请选择快照名称',
        }],
        initialValue: selectdefaultValue
      })
    }
    const resourcePrice = cluster.resourcePrice
    const storagePrice = resourcePrice.storage /10000
    const hourPrice = parseAmount(this.state.volumeSize /1024 * resourcePrice.storage, 4)
    const countPrice = parseAmount(this.state.volumeSize /1024 * resourcePrice.storage * 24 *30, 4)
    const formItemLayout = {
    	labelCol: {span: 4},
    	wrapperCol: {span: 19}
    }
    return(
      <div id="CreateVolume">
        <Form className='formStyle'>
          <Row className='volumeName'>
            <Col span="4" className="name-text-center name">
              存储卷名称
            </Col>
            <Col span="19" className='nameValue'>
              <Form.Item>
                <Input {...VolumeNameProps} />
              </Form.Item>
            </Col>
          </Row>
          <Row className='type'>
            <Col span="4" className="name-text-center name">
              存储类型
            </Col>
            <Col span="19" className='type_value'>
              <Form.Item className='form_item_style'>
                <Select
                  placeholder="请选择类型"
                  disabled={this.state.selectChecked}
                  {...getFieldProps('type', {
                    initialValue: "ceph",
                    rules: [{required: true, message: '类型不能为空'}]
                  })}
                >
                  <Option key="ceph" value="ceph">块存储</Option>
                </Select>
              </Form.Item>
              <Form.Item className='form_item_style'>
                <Select
                  disabled={this.state.selectChecked}
                  placeholder="请选择一个块存储集群"
                  {...getFieldProps('address', {
                    rules: [{
                      required: true,
                      message: "请选择块存储集群"
                    }],
                    onChange: this.selectStorageServer,
                  })}
                >
                  { this.renderCephSeverOption() }
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row className='switchSnapshot'>
            <Col span="4" className="name-text-center switchName">
              使用快照创建
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
            <Col span="15">通过快照创建存储卷，1-2分钟即可创建成功</Col>
          </Row>
          {
            this.state.swicthChecked
            ? <Row className='snapshot'>
              <Col span="4" className="name-text-center name">
                <FormattedMessage {...messages.snapshot} />
              </Col>
              <Col span="12" className='nameValue'>
                <Form.Item>
                  <Select
                    showSearch
                    placeholder="请选择快照"
                    size="large"
                    notFoundContent="无法找到"
                    {...selectSnapshotNameProps}
                    onChange={this.handleSelectSnapshot}
                    getPopupContainer={() => document.getElementById('CreateVolume')}
                    className='selectSnapshot'
                    disabled={this.state.selectChecked}
                  >
                    <Select.Option key="title" value="title" disabled={true}>
                      <Row>
                        <Col span={8}>快照名称</Col>
                        <Col span={9}>创建时间</Col>
                        <Col span={4}>大小</Col>
                        <Col span={3}>格式</Col>
                      </Row>
                    </Select.Option>
                    {this.handleFormatSelectOption()}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            : null
          }
          <Row className='volumeSize'>
            <Col span="4" className="name-text-center size">
              <FormattedMessage {...messages.size} />
            </Col>
            <Col span="12">
              <Slider
                min={this.state.volumeSizemin}
                max={20480}
                step={512}
                defaultValue={this.state.volumeSizemin}
                onChange={(size) => this.changeVolumeSizeSlider(size)}
                value={this.state.volumeSize}
              />
            </Col>
            <Col span="7" className='inputbox'>
              <InputNumber
                min={this.state.volumeSizemin}
                max={20480}
                step={512}
                defaultValue={this.state.volumeSizemin}
                value={this.state.volumeSize}
                onChange={(number) => this.changeVolumeSizeInputNumber(number)}
              />
              <span style={{ paddingLeft: 10 }} >MB</span>
            </Col>
          </Row>
          <Row className='volumeFormat'>
            <Col span="4" className="name-text-center format">
              <FormattedMessage {...messages.formats} />
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
          { SHOW_BILLING ?
          <div className="modal-price">
            <div className="price-left">
              存储：{hourPrice.unit == '￥' ? '￥' : ''}{ storagePrice } {hourPrice.unit == '￥' ? '' : ' T'}/(GB*小时)
            </div>
            <div className="price-unit">
              <p>合计：<span className="unit">{hourPrice.unit == '￥'? '￥': ''}</span><span className="unit blod">{ hourPrice.amount }{hourPrice.unit == '￥'? '': ' T'}/小时</span></p>
              <p><span className="unit">（约：</span><span className="unit">{ countPrice.fullAmount }/月）</span></p>
            </div>
          </div>
          :null
          }
        </Form>
        <div className='createVolumeFooter'>
          <Button size='large' type="primary" className='buttonConfirm' onClick={this.handleComfirmCreateVolume} loading={this.state.loading}>确定</Button>
          <Button size='large' className='buttonCancel' onClick={this.handleCancelCreateVolume}>取消</Button>
        </div>
      </div>
    )
  }
}

CreateVolume = Form.create()(CreateVolume)

function mapStateToProp(state, props) {
  const { cluster } = state.entities.current
  const clusterID = cluster.clusterID
  const stateCluster = state.cluster
  const { snapshotList } = state.storage
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
    currentImagePool: DEFAULT_IMAGE_POOL,
    cephList,
    isFetching,
  }
}

export default connect(mapStateToProp, {
  SnapshotClone,
  createStorage,
  loadStorageList,
  getClusterStorageList,
  getCheckVolumeNameExist,
  SnapshotList,
})(injectIntl(CreateVolume, {
  withRef: true,
}))