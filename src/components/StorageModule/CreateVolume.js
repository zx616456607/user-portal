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
import { SnapshotClone, createStorage, loadStorageList } from '../../actions/storage'
import { DEFAULT_IMAGE_POOL } from '../../constants'
import NotificationHandler from '../../components/Notification'
import { SHOW_BILLING } from '../../constants'

const Option = Select.Option

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
    }
  }

  SnapshotSwitch(){
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

  componentDidMount() {
    const { currentSnapshot } = this.props
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
    if(this.props.currentSnapshot !== nextProps.currentSnapshot){
      this.setState({
        currentSnapshot: nextProps.currentSnapshot,
        currentVolume: nextProps.currentVolume,
        volumeSize: nextProps.currentSnapshot.size,
        fstype: nextProps.currentSnapshot.fstype,
        volumeSizemin: nextProps.currentSnapshot.size,
        ext4Disabled: nextProps.currentSnapshot.fstype == 'xfs',
        xfsDisabled: nextProps.currentSnapshot.fstype == 'ext4',
        swicthChecked: true,
        switchDisabled: true,
        selectChecked: true,
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
          selectSnapshotName: value
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
      //'type',
      //'address',
      'strategy'
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
      notification.spin('创建存储卷中')
      if(!values.selectSnapshotName){
        let storageConfig = {
          driver: 'rbd',
          name: values.volumeName,
          driverConfig: {
            size: volumeSize,
            fsType: fstype,
          },
          cluster: cluster.clusterID
        }
        createStorage(storageConfig,{
          success: {
            func: () => {
              this.handleResetState()
              notification.close()
              notification.success('创建存储成功')
              loadStorageList(currentImagePool,cluster.clusterID)
            },
            isAsync: true
          },
          failed: {
            func: (err) => {
              this.handleResetState()
              notification.close()
              if(err.statusCode === 409){
                notification.error('存储卷 ' + storageConfig.name + ' 已经存在')
                return
              }
              if (err.statusCode !== 402) {
                notification.error('创建存储卷失败',err.message.message || err.message)
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
            this.props.scope.loadSnapshotList()
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
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
    const { storageList } = this.props
    if(!value){
      return callback('请输入存储名称')
    }
    if(value.length > 32){
      return callback('存储名称不能超过32个字符')
    }
    if(!/^[A-Za-z]{1}/.test(value)){
      return callback('存储名称必须以字母开头')
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_-]*$/.test(value)){
      return callback('存储名称由字母、数字、中划线-、下划线_组成')
    }
    if(value.length < 3){
      return callback('存储名称不能少于3个字符')
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_\-]{1,61}[A-Za-z0-9]$/.test(value)){
      return callback('存储名称必须由字母或数字结尾')
    }
    for(let i = 0; i < storageList.length; i++){
      if(value == storageList[i].name){
        return callback('存储名称已存在！')
      }
    }
    return callback()
  }

  handleFormatSelectOption(){
    const { snapshotDataList } = this.props
    let Options = snapshotDataList.map((item, index) => {
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

  render(){
    const { form, cluster, snapshotRequired } = this.props
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
            <Col span="4" className="name-text-center name" style={{color: 'red'}}>
              存储类型
            </Col>
            <Col span="19" className='type_value'>
              <Form.Item className='form_item_style'>
                <Select
                  placeholder="请选择类型"
                  disabled={this.state.selectChecked}
                  {...getFieldProps('type', {
                    rules: [{required: true, message: '类型不能为空'}]
                  })}
                >
                  <Option key="RBD" value="RBD">RBD</Option>
                </Select>
              </Form.Item>
              <Form.Item className='form_item_style'>
                <Select
                  disabled={this.state.selectChecked}
                  placeholder="请选择一个RBD集群"
                  {...getFieldProps('address', {
                    rules: [{
                      required: true,
                      message: "地址不能为空"
                    }]
                  })}
                >
                  <Option key="ceph" value="ceph">ceph</Option>
                  <Option key="nfs" value="nfs">nfs</Option>
                  <Option key="host" value="host">host</Option>
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
                disabled={this.state.switchDisabled}
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
          <Form.Item
            label={<span style={{color: 'red'}}>回收策略
              <Tooltip title={<div>
                <div>保留：服务删除时删除存储</div>
                <div>删除：删除服务时删除存储</div>
              </div>}>
                <Icon type="question-circle-o" className='question_icon'/>
              </Tooltip>
            </span>}
            {...formItemLayout}
            className='strategy'
          >
            <Radio.Group {...getFieldProps('strategy', {
              initialValue: 'yes'
            })}>
              <Radio key="yes" value="yes" className='item'>保留</Radio>
              <Radio key="no" value="no">删除</Radio>
            </Radio.Group>
          </Form.Item>
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
  return {
    cluster,
    currentImagePool: DEFAULT_IMAGE_POOL,
  }
}

export default connect(mapStateToProp, {
  SnapshotClone,
  createStorage,
  loadStorageList,
})(injectIntl(CreateVolume, {
  withRef: true,
}))