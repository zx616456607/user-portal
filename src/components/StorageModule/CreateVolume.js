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
import { Modal, Row, Col, InputNumber, Input, Slider, Button, Form } from 'antd'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/CreateVolume.less'

const messages = defineMessages({
  name: {
    id: "Storage.modal.name",
    defaultMessage: '名称'
  },
  cancelBtn: {
    id: "Storage.modal.cancelBtn",
    defaultMessage: '取消'
  },
  createBtn: {
    id: "Storage.modal.createBtn",
    defaultMessage: '创建'
  },
  createTitle: {
    id: "Storage.modal.createTitle",
    defaultMessage: '创建存储'
  },
  createModalTitle: {
    id: "Storage.menu.create",
    defaultMessage: "创建存储卷",
  },
  storageName: {
    id: 'Storage.titleRow.name',
    defaultMessage: '存储名称',
  },
  delete: {
    id: 'Storage.menu.delete',
    defaultMessage: '删除',
  },
  status: {
    id: 'Storage.titleRow.status',
    defaultMessage: '状态',
  },
  formats: {
    id: 'Storage.titleRow.formats',
    defaultMessage: '格式',
  },
  forin: {
    id: 'Storage.titleRow.forin',
    defaultMessage: '容器挂载点',
  },
  cluster: {
    id: 'Storage.titleRow.cluster',
    defaultMessage: '集群'
  },
  app: {
    id: 'Storage.titleRow.app',
    defaultMessage: '应用',
  },
  size: {
    id: 'Storage.titleRow.size',
    defaultMessage: '大小',
  },
  createTime: {
    id: 'Storage.titleRow.createTime',
    defaultMessage: '创建时间',
  },
  action: {
    id: 'Storage.titleRow.action',
    defaultMessage: '操作',
  },
  formatting: {
    id: 'Storage.titleRow.formatting',
    defaultMessage: '格式化',
  },
  dilation: {
    id: 'Storage.titleRow.dilation',
    defaultMessage: '扩容',
  },
  okRow: {
    id: 'Storage.titleRow.normal',
    defaultMessage: '正常',
  },
  use: {
    id: 'Storage.titleRow.use',
    defaultMessage: '使用中',
  },
  noUse: {
    id: 'Storage.titleRow.noUse',
    defaultMessage: '未使用',
  },
  errorRow: {
    id: 'Storage.titleRow.error',
    defaultMessage: '异常',
  },
  placeholder: {
    id: 'Storage.modal.placeholder',
    defaultMessage: '输入名称',
  },
  inputPlaceholder: {
    id: 'Storage.modal.inputPlaceholder',
    defaultMessage: '按存储名称搜索',
  }
})

class CreateVolume extends Component {
	constructor(props){
    super(props)
    this.handleConfirmCreate = this.handleConfirmCreate.bind(this)
    this.handleCancelCreate = this.handleCancelCreate.bind(this)
    this.checkVolumeName = this.checkVolumeName.bind(this)
    this.state = {
      nameError: false
    }
  }

  handleConfirmCreate(){
	  this.setState({
      createvolume: false,
	  })
  }

  handleCancelCreate(){
    this.setState({
      createvolume: false,
    })
  }

  checkVolumeName(rule, value, callback){
    if(!value){
      return callback('请输入快照名称')
    }
    if(value.length > 32){
      return callback('快照名称不能超过32个字符')
    }
    if(!/^[A-Za-z]{1}/.test(value)){
      return callback('快照名称必须以字母开头')
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_-]*$/.test(value)){
      return callback('快照名称由字母、数字、中划线-、下划线_组成')
    }
    if(value.length < 3){
      return callback('快照名称不能少于3个字符')
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_\-]{1,61}[A-Za-z0-9]$/.test(value)){
      return callback('快照名称必须由字母或数字结尾')
    }
    //for(let i = 0; i < snapshotDataList.length; i++){
    //  if(value == snapshotDataList[i].name){
    //    return callback('快照名称已存在！')
    //  }
    //}
    return callback()
  }

  render(){
    const { form } = this.props
    const { getFieldProps } = form
    const VolumeNameProps = getFieldProps('volumeName',{
      rules: [{
        validator: this.checkVolumeName
      }]
    })
    return(
      <div id="CreateVolume">
        <Form>
          <Row className='volumeName'>
            <Col span="3" className="name-text-center name">
              名称
            </Col>
            <Col span="12" className='nameValue'>
              <Form.Item>
                <Input {...VolumeNameProps}/>
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ height: '40px' }}>
            <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>
              大小
            </Col>
            <Col span="12">
              <Slider min={512} max={20480} step={512} />
            </Col>
            <Col span="8">
              <InputNumber min={512} max={20480} step={512} style={{ marginLeft: '16px' }}/>
              <span style={{ paddingLeft: 10 }} >MB</span>
            </Col>
          </Row>
          <Row>
            <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>
              格式
            </Col>
            <Col span="20" className="action-btns" style={{ lineHeight: '30px' }}>
              <Button >ext4</Button>
              <Button>xfs</Button>
            </Col>
          </Row>
          <div className="modal-price">
            <div className="price-left">
              存储：
            </div>
            <div className="price-unit">
              <p>合计：<span className="unit"></span><span className="unit blod">/小时</span></p>
              <p><span className="unit">（约：</span><span className="unit"></span></p>
            </div>
          </div>
        </Form>
      </div>
    )
  }
}

CreateVolume = Form.create()(CreateVolume)

function mapStateToProp(state, props) {

  return {

  }
}


export default connect(mapStateToProp, {

})(CreateVolume)