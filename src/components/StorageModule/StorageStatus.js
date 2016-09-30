/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 *  Storage list
 * 
 * v0.1 - 2016-09-22
 * @author BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Tabs,Card, Menu, Progress, Upload ,Radio ,Modal,Button, Icon, Col} from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getUploadFileUlr, uploadFileRequest, uploadFileSuccess, uploadFileFailure } from '../../actions/storage'
import './style/storage.less'

const RadioGroup = Radio.Group
const messages = defineMessages({
  app: {
    id: "StorageBind.bind.app",
    defaultMessage: "应用"
  },
  modalRedHint: {
    id: "StorageBind.bind.app",
    defaultMessage: "应用"
  }
})
const props = {
  name: 'file',
  showUploadList: false,
  action: '/upload.do',
};

class StorageStatus extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      RadioValue:1,
      isUnzip: false
    }
    this.showUploadModal = this.showUploadModal.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.showUploadModal = this.showUploadModal.bind(this)
    this.changeRadioValue = this.changeRadioValue.bind(this)
  }
  showUploadModal(){
    this.setState({
      visible: true
    })
  }
  handleCancel () {
    this.setState({
      visible: false
    })
  }
  changeRadioValue(e) {
    this.setState({
      isUnzip: e.target.value
    })
  }
  getUploadData() {
    return {
      data: {
        isUnzip: this.state.isUnzip,
        format: 'ext4',
        volumeName: 'test',
        pool: 'test'
      },
      beforeUpload: () => this.props.uploadFileRequest(),
      action: getUploadFileUlr('test', 'test'),
      onChange(info) {
        if (info.file.status === 'done') {
          this.props.uploadFileSuccess()
          this.setState({
            visible: false
          })
          message.success('文件上传成功')
        } else if (info.file.status === 'error') {
          this.props.uploadFileFailure(`${info.file.name} file upload failed.`)
          this.setState({
            visible: false
          })
          message.error('文件上传失败')
        }
      } 
    }
  }
  render(){
    const {formatMessage} = this.props.intl
    return (
      <div className="action-btns" style={{paddingLeft:'30px',paddingTop:'10px'}}>
        <Modal title="上传文件" wrapClassName="vertical-center-modal" footer="" visible={this.state.visible} onCancel={this.handleCancel}>
          <div className="uploadModal">
            <RadioGroup onChange={(e) => {this.changeRadioValue(e)}} value={this.state.isUnzip}>
              <Radio key="a" value={false}>直接上传</Radio>
              <Radio key="b" value={true}>上传并解压</Radio>
            </RadioGroup>
            <p>
              <Upload {...(this.getUploadData())}>
                <Button type="primary">
                  <Icon type="upload" /> 选择文件
                </Button>
              </Upload>
            </p>
            <p>或将文件拖到这里</p>
          </div>
          <ul className="uploadhint">
            <li>1、支持任何格式文件，大小不超过600M</li>
            <li>2、仅支持 zip 格式文件解压，导入时会覆盖存储卷内[同文件名]</li>
            <li style={{color:'red'}}>* 请先停止挂载该存储卷的服务再进行文件导入</li>
          </ul>
        </Modal>
        <Button type="primary" onClick={this.showUploadModal}><Icon type="cloud-upload-o" />上传文件</Button>
        <span className="margin"></span>
        <Button type="ghost"><Icon type="cloud-download-o" />导出文件</Button>
        <div className="status-box">
          <div className="status-list"> 
            <span className="status-icon success"><Icon type="cloud-upload-o" /></span>
            <div className="status-content">
              <div className="status-row">
                <span className="pull-left">上传：absconig (1.01MB)</span>
                <span className="pull-right">2016-09-22 12:15</span>
              </div>
              <Col span={8} className="fullProgress">
                <Progress percent={80} status="success" showInfo={false} />
              </Col>
              <Col span={4} offset={2}>文件上传中</Col>
            </div>
          </div>

          <div className="status-list"> 
            <span className="status-icon primary"><Icon type="cloud-upload-o" /></span>
            <div className="status-content">
              <div className="status-row">
                <span className="pull-left">上传：absconig (1.01MB)</span>
                <span className="pull-right">2016-09-22 12:15</span>
              </div>
              <Col span={8} className="fullProgress">
                <Progress percent={50} status="active" showInfo={false} />
              </Col>
              <Col span={4} offset={2}>查询存储卷</Col>
            </div>
          </div>

          <div className="status-list"> 
            <span className="status-icon primary"><Icon type="cloud-upload-o" /></span>
            <div className="status-content">
              <div className="status-row">
                <span className="pull-left">上传：absconig (1.01MB)</span>
                <span className="pull-right">2016-09-22 12:15</span>
              </div>
              <Col span={8} className="fullProgress">
                <Progress percent={50} status="active" showInfo={false} />
              </Col>
              <Col span={4} offset={2}><Button type="primary"><Icon type="cloud-download-o" />下载</Button></Col>
            </div>
          </div>

        </div>

      </div>
    )
  }
}


StorageStatus.propTypes = {
  intl: PropTypes.object.isRequired
}

function mapStateToProp(state) {
  return {
    upload: state.storage.uploadFile
  }
}
  
export default connect(mapStateToProp, {
  uploadFileRequest,
  uploadFileSuccess,
  uploadFileFailure
})(injectIntl(StorageStatus, {
  withRef: true,
}))