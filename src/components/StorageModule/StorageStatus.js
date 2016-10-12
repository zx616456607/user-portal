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
import { Tabs,Card, Menu, Progress, Upload ,Radio ,Modal,Button, Icon, Col, message} from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { cloneDeep } from 'lodash'
import { getUploadFileUlr, uploadFileRequest, uploadFileSuccess, getStorageFileHistory, beforeUploadFile, uploading, mergeUploadingIntoList } from '../../actions/storage'
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
      isUnzip: false,
      uploadFile: true,
      uploadFileStatus: 'success',
      downloadFileStatus: 'success'
    }
    this.showUploadModal = this.showUploadModal.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.showUploadModal = this.showUploadModal.bind(this)
    this.changeRadioValue = this.changeRadioValue.bind(this)
  }
  componentWillMount() {
    this.props.getStorageFileHistory(this.props.pool, this.props.volumeName)
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

  showPercent(item) {
    if(item.backupId === this.props.beforeUploadState.backupId) {
      return this.props.upload.percent
    } else{
      return 100
    }
  }
  // showStatus(item) {
  //   if (item.backupId === this.props.beforeUploadState.backupId) {
  //     if(this.props.upload.percent < 100) {
  //       return 'Uploading'
  //     }
  //     if(this.state.uploadFileStatus == 'exception') {
  //       return 'Failure'
  //     }
  //     return 'Complete' 
  //   } 
  //   return item.status
  // }
  getFileStatus(item) {
    // if (item.backupId === this.props.beforeUploadState.backupId) {
    //   if(item.backupType == 1) {
    //     return this.state.uploadFileStatus
    //   }
    //   if(item.backupType ==2) {
    //     return this.state.downloadFileStatus
    //   }
    // }
    switch(item.status) {
      case 'Complete':
        return 'success'
      case 'Failure':
        return 'exception'
      case 'Uploading':
        return 'active'
      default:
        return item.status
    }
  }
  showBackground(item) {
    switch(item.backupType) {
      case 1:
        return 'status-icon success'
      case 0:
        return 'status-icon primary'
    }
  }
  getUploadData() {
    const volumeName = this.props.volumeName
    const self = this
    return {
      showUploadList: false,
      data: {
        isUnzip: self.state.isUnzip,
        format: 'ext4',
        volumeName: volumeName,
        pool: 'test',
        backupId: self.props.beforeUploadState.backupId
      },
      beforeUpload: (file) =>{ 
        self.props.uploading(0)
        file.isUnzip = self.state.isUnzip
        self.setState({
          uploadFile: false
        })
        return new Promise(function(resolve, reject) {
          self.props.beforeUploadFile(self.props.pool, volumeName, file, {
            success: {
              isAsync: true,
              func(){
                self.props.mergeUploadingIntoList(self.props.beforeUploadState)
                self.setState({
                  visible: false
                })
                resolve(true)
              }
            }
          })
        })
      },
      action: getUploadFileUlr(self.props.pool, volumeName),
      onChange(info) {
        if(info.event) {
          self.props.uploading(info.event.percent)
        }
        if (info.file.status === 'done') {
          self.props.uploadFileSuccess()
          self.setState({
            uploadFile: true,
            uploadFileStatus: 'success'
          })
          const fileInfo = cloneDeep(self.props.beforeUploadState)
          fileInfo.status = 'Complete'
          self.props.mergeUploadingIntoList(fileInfo)
          self.props.uploading(100)
          message.success('文件上传成功')
        } else if (info.file.status === 'error') {
         // self.props.uploading(100)
          self.setState({
            uploadFile: true,
            uploadFileStatus: 'exception'
          })
          const fileInfo = cloneDeep(self.props.beforeUploadState)
          fileInfo.status = 'Failure'
          self.props.mergeUploadingIntoList(fileInfo)
          message.error('文件上传失败')
        }
      } 
    }
  }
  render(){
    const {formatMessage} = this.props.intl
    const statusList = this.props.fileHistory.history
    let status_list = []
    if(statusList && statusList.length >= 0) {
     status_list = statusList.map(item => {
       return (<div className="status-list" key={item.backupId}> 
            <span className={ this.showBackground(item)}><Icon type={ item.backupType == 1 ? 'cloud-upload-o' :'cloud-download-o'} /></span>
            <div className="status-content">
              <div className="status-row">
                <span className="pull-left">{ item.backupType == 1 ? '上传' :'下载'}：{item.backupName} ({(item.size/1024/1024).toFixed(2)} MB)</span>
                <span className="pull-right">{item.startTime}</span>
              </div>
              <Col span={8} className="fullProgress">
                <Progress percent={ this.showPercent(item) } status={this.getFileStatus(item)}  showInfo={true}/>
              </Col>
              <Col span={4} offset={2}>{ item.status }</Col>
            </div>
          </div>)
     })
    }
    return (
      <div className="action-btns" style={{paddingLeft:'30px',paddingTop:'10px'}}>
        <Modal title="上传文件" wrapClassName="vertical-center-modal" footer="" visible={this.state.visible} onCancel={this.handleCancel}>
          <div className="uploadModal">
            <RadioGroup onChange={(e) => {this.changeRadioValue(e)}} value={this.state.isUnzip}>
              <Radio key="a" value={false}>直接上传</Radio>
              <Radio key="b" value={true}>上传并解压</Radio>
            </RadioGroup>
            <p>
              <Upload {...(this.getUploadData())} >
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
        <Button type="primary" onClick={this.showUploadModal} disabled={ !this.state.uploadFile }><Icon type="cloud-upload-o" />上传文件</Button>
        <span className="margin"></span>
        <Button type="ghost"><Icon type="cloud-download-o" />导出文件</Button>
        <div className="status-box">
         { status_list }
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
    upload: state.storage.uploadFile,
    fileHistory: state.storage.storageFileHistory,
    beforeUploadState: state.storage.beforeUploadFile,
  }
}

  
export default connect(mapStateToProp, {
  uploadFileRequest,
  uploadFileSuccess,
  getStorageFileHistory,
  beforeUploadFile,
  uploading,
  mergeUploadingIntoList
})(injectIntl(StorageStatus, {
  withRef: true,
}))