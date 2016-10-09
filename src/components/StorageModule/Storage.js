/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 *  Storage list
 * 
 * v0.1 - 2016-09-20
 * @author BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Checkbox,Card,Menu,Button,Icon ,Radio ,Modal ,Input, Slider, InputNumber, Row, Col, message } from 'antd'
import { Link } from 'react-router'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { remove, findIndex } from 'lodash'
import { loadStorageList, deleteStorage, createStorage, formateStorage, resizeStorage } from '../../actions/storage'
import { DEFAULT_IMAGE_POOL } from '../../constants'
import './style/storage.less'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

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
		id:"Storage.menu.create",
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
    defaultMessage: '输入应用名搜索',
  }
})

let MyComponent = React.createClass({
  // componentWillReceiveProps(nextProps) {
  //   let config = nextProps.config;
  //   let pool = nextProps.pool;
  //   let list = config[pool]
  //   let check = {}
  //   if (list) {
  //     list.storageList.forEach((item) => {
  //       check[item.id] = false
  //     })
  //   }
  //   this.setState({
  //     check
  //   })
  // },
  getInitialState() {
    return {
      visible: false,
      modalTitle: ''
    };
  },
  propTypes: {
    config: React.PropTypes.object
  },
  onchange(e, name) {
    this.props.saveVolumeArray(e, name)
  },
  isChecked(name) {
    return findIndex(this.props.volumeArray, { name }) >= 0
  },
  changeType(e) {
    this.setState({
      formateType: e.target.value
    })
  },
  handleSure () {
    const self = this
    let type = this.state.modalType
    if(type === 'format') {
      if(this.state.formateType === this.state.format) {
        message.error('格式不能和以前相同')
        return
      }
      this.props.formateStorage(this.props.imagePool, {
        name: this.state.modalName,
        type: this.state.formateType
      }, {
        success: {
          isAsync: false,
          func: () => {
            self.setState({
              visible: false,
            })
          }
        }
      })
    } else if(type === 'resize') {
      if(this.state.size <= this.state.modalSize) {
        message.error('不能比以前小')
        return
      }
      this.props.resizeStorage(this.props.imagePool, {
        name: this.state.modalName,
        size: this.state.size
      }, {
        success: {
          isAsync: true,
          func: () => {
            self.setState({
              visible: false,
            })
            this.props.loadStorageList()
          }
        }
      })
    }
  },
  cancelModal () {
    this.setState({
      visible: false,
    });
  },
  showAction (type , one, two) {
    if (type === 'format') {
      this.setState({
        visible: true,
        modalType: type,
        modalName: one,
        modalFormat: two,
        format: two,
        formateType: two
      });
      this.setState({
        modalTitle: '格式化'
      })
    } else {
      this.setState({
        visible: true,
        modalType: type,
        modalName: one,
        modalSize: two,
        size: two,
      });
      this.setState({
        modalTitle: '扩容'
      })
    }
  },
  changeDilation (size) {
    this.setState({
      size: size
    })
  },
  
  render () {
  const { formatMessage } = this.props.intl
	let list = this.props.storage;
  if(!list || !list.storageList) return (<div></div>)
	let items = list.storageList.map((item) => {
	  return (
	    <div className="appDetail" key={item.name} >
			<div className="selectIconTitle commonData">
			  <Checkbox disabled={ item.isUsed } onChange={(e)=>this.onchange(e, item.name)} checked= { this.isChecked(item.name) }></Checkbox>
			</div>
			<div className="name commonData">
		      <Link to={`/app_manage/storage/${this.props.imagePool}/${item.name}`} >
	    	    {item.name}
		      </Link>
			</div>
			<div className="status commonData">
			  <i className={item.isUsed == true ? "error fa fa-circle":"normal fa fa-circle"}></i>
			  <span className={item.isUsed == false ? "normal":"error"} >{item.isUsed == true ? <FormattedMessage {...messages.use} />:<FormattedMessage {...messages.noUse} />}</span>
			</div>
			<div className="formet commonData">{item.format}</div>
			<div className="forin commonData">{item.mountPoint || '无'}</div>
			<div className="appname commonData">{item.rcName}</div>
			<div className="size commonData">{item.totalSize}M</div>
			<div className="createTime commonData">{item.createTime}</div>
			<div className="actionBtn">
			 <Button disabled = { item.isUsed } className="btn-warning" onClick={ (e)=> { this.showAction('format', item.name, item.format) }}><Icon type="delete" /><FormattedMessage {...messages.formatting} /></Button>
			 <span className="margin"></span>
			 <Button disabled = { item.isUsed } className="btn-success" onClick={ () => {this.showAction('resize', item.name, item.totalSize)}}><Icon type="scan" /><FormattedMessage {...messages.dilation} /></Button>
			</div>

		</div>
      );
	});
	return (
      <div className="dataBox">
        { items }
        <Modal title={this.state.modalTitle} visible={this.state.visible} onOk={(e) => {this.handleSure()} } onCancel={ (e) => {this.cancelModal()} } okText="OK" cancelText="Cancel">
        <div className={this.state.modalType === 'resize' ? 'show' : 'hide'}>
          <Row style={{ height: '40px' }}>
            <Col span="3" className="text-center" style={{ lineHeight: '30px' }}><FormattedMessage {...messages.name} /></Col>
            <Col span="12"><input type="text" className="ant-input" value={ this.state.modalName } disabled /></Col>
          </Row>
          <Row style={{ height: '40px' }}>
            <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>{ formatMessage(messages.size) }</Col>
            <Col span="12"><Slider min={this.state.modalSize} max={9999} onChange={ (e)=>{this.changeDilation(e)} } value={this.state.size} /></Col>
            <Col span="8">
              <InputNumber min={this.state.modalSize} max={9999} style={{ marginLeft: '16px' }} value={this.state.size} onChange={(e) => {this.onChange(e)}}/>
              <span style={{ paddingLeft: 10 }} >MB</span>
            </Col>
          </Row>
        </div>
        <div className={this.state.modalType === 'format' ? 'show' : 'hide'}>
          <div style={{ height: '30px' }}>确定格式化存储卷{ this.state.modalName}吗? <span style={{color:'red'}}>(格式化后数据将被清除)。</span></div>
          <Col span="6" style={{ lineHeight: '30px' }}>选择文件系统格式：</Col>
          <RadioGroup defaultValue='ext4' value = { this.state.formateType } size="large" onChange={ (e) => this.changeType(e)}>
            <RadioButton value="ext4">ext4</RadioButton>
            <RadioButton value="xfs">xfs</RadioButton>
            <RadioButton value="reiserfs">reiserfs</RadioButton>
          </RadioGroup>
        </div>
        </Modal>
	    </div>
    )
  }
});

function myComponentMapSateToProp(state) {
  return {
    formateStorage: state.storage.formateStorage,
    resizeStorage: state.storage.resizeStorage
  }
}

function myComponentMapDispathToProp(dispath) {
  return {
    formateStorage: (pool, storage, callback) => {
      dispath(formateStorage(pool, storage, callback))
    },
    resizeStorage: (pool, storage, callback) => {
      dispath(resizeStorage(pool, storage, callback))
    }
  }
}

MyComponent = connect(myComponentMapSateToProp, myComponentMapDispathToProp)(injectIntl(MyComponent, {
  withRef: true,
}))
class Storage extends Component {
	constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
		this.onChange = this.onChange.bind(this)
    this.deleteStorage = this.deleteStorage.bind(this)
    this.state = {
			visible: false,
      volumeArray: [],
      currentType: 'ext4',
      inputName: '',
      size: 200
    }
  }
  componentWillMount() {
    this.props.loadStorageList(this.props.currentImagePool)
  }
	onChange(value) {
    this.setState({
      size: value,
    });
  }
  showModal() {
    this.setState({
      visible: true,
    });
  }
  handleOk() {
    //create storage
    if (!this.state.name) {
      message.error('请输入存储卷名称')
      return
    }
    if (this.state.size === 0) {
      message.error('请输入存储卷大小')
      return
    }

    let storageConfig = {
      format: this.state.currentType,
      size: this.state.size,
      pool: this.props.currentImagePool,
      name: this.state.name
    }
    let self = this
    this.props.createStorage(storageConfig, {
      success: {
         func: () => {
           self.setState({
             visible: false,
             name: '',
             size: 0,
             currentType: 'ext4'
           })
           self.props.loadStorageList(this.props.currentImagePool)
          },
          isAsync: true
      },
    })
  }
  handleCancel() {
    this.setState({
      visible: false,
      size: 0,
      name: '',
      currentType: 'ext4'
  	});
  }
  deleteStorage() {
    const volumeArray = this.state.volumeArray
    this.props.deleteStorage(this.props.currentImagePool, volumeArray, {
      success: {
         func: this.props.loadStorageList(this.props.currentImagePool),
         isAsync: true
      }
    })
  }
  onAllChange(e) {
    const storage = this.props.storageList[this.props.currentImagePool]
    if(!storage || !storage.storageList ) {
      return
    }
    if(e.target.checked) {
      let volumeArray = []
      storage.storageList.forEach(item => {
        volumeArray.push({
          name: item.name,
          diskType: 'rbd'
        })
      })
      this.setState({
        volumeArray,
      })
      return
    } 
    this.setState({
      volumeArray: []
    })
  }
  isAllChecked() {
    if(this.state.volumeArray.length === 0) {
      return false
    }
    if(this.state.volumeArray.length === this.props.storageList[this.props.currentImagePool].storageList.length) {
      return true
    }
    return false
  }

  selectItem() {
    return (e, name, diskType) => {
      let volumeArray = this.state.volumeArray
      if (e.target.checked) {
        volumeArray.push({
          name,
          diskType: 'rbd'
        })
      } else {
        remove(volumeArray, (item) => {
          return item.name === name
        })
      }
      this.setState({
        volumeArray
      })
    }
  }
  changeType(type) {
    this.setState({
      currentType: type
    })
  }
  disableSelectAll() {
    let selectAll = true
    if(this.props.storageList && this.props.storageList[this.props.currentImagePool]) {
      this.props.storageList[this.props.currentImagePool].storageList.some((item) => {
        if(item.isUsed) {
          selectAll = false
        }
      })
      return selectAll
    }
  }
  handleInputName(e) {
    this.setState({
      name: e.target.value
    })
  }
  render() {
		const { formatMessage } = this.props.intl
    return (
      <QueueAnim className ="AppList"  type = "right">
        <div id="AppList" key = "AppList">
          <div className="operationBox">
            <div className="leftBtn">
              <Button type="primary" size="large" onClick={this.showModal}><Icon type="plus" /><FormattedMessage {...messages.createTitle} /></Button>
              <Button type="ghost" className="stopBtn" size="large" onClick={this.deleteStorage}><Icon type="delete" /><FormattedMessage {...messages.delete} /></Button>
              <Modal title={ formatMessage(messages.createModalTitle) } visible={this.state.visible} onOk={ (e) => {this.handleOk()}} onCancel={() => { this.handleCancel()} } okText={ formatMessage(messages.createBtn) } cancelText={ formatMessage(messages.cancelBtn) }>
                <Row style={{ height: '40px' }}>
                  <Col span="3" className="text-center" style={{ lineHeight: '30px' }}><FormattedMessage {...messages.name} /></Col>
                  <Col span="12"><Input placeholder={ formatMessage(messages.placeholder) } onChange={(e) => {this.handleInputName(e)}} /></Col>
                </Row>
                <Row style={{ height: '40px' }}>
                  <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>{ formatMessage(messages.size) }</Col>
                  <Col span="12">
                    <Slider min={1} max={1024} onChange={this.onChange} value={this.state.size} />
                  </Col>
                  <Col span="8">
                    <InputNumber min={1} max={1024} style={{ marginLeft: '16px' }} value={this.state.size} onChange={(e) => {this.onChange(e)}}/>
                    <span style={{ paddingLeft: 10 }} >MB</span>
                  </Col>
                </Row>
                <Row>
                  <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>{ formatMessage(messages.formats) }</Col>
                  <Col span="20" className="action-btns" style={{ lineHeight: '30px' }}>
                    <Button type={this.state.currentType === 'ext4' ? 'primary' : 'ghost'} onClick={ (e)=> { this.changeType('ext4') }}>ext4</Button>
                    <Button type={this.state.currentType === 'xfs' ? 'primary' : 'ghost'} onClick={ (e)=> { this.changeType('xfs') }}>xfs</Button>
                    <Button type={this.state.currentType === 'reiserfs' ? 'primary' : 'ghost'} onClick={(e)=> { this.changeType('reiserfs') }}>reiserfs</Button>
                  </Col>
                </Row>
              </Modal>
            </div>
            <div className="rightBox">
              <div className="littleLeft">
                <i className="fa fa-search"></i>
              </div>
              <div className="littleRight">
                <input placeholder={ formatMessage(messages.inputPlaceholder) } />
              </div>
            </div>
            <div className="clearDiv"></div>
          </div>
          <Card className="storageList appBox">
            <div className="appTitle">
              <div className="selectIconTitle commonTitle">
                <Checkbox onChange={(e) => this.onAllChange(e) } checked = { this.isAllChecked() } disabled = {!this.disableSelectAll()}></Checkbox>
              </div>
              <div className="name commonTitle"><FormattedMessage {...messages.storageName} /></div>
              <div className="status commonTitle"><FormattedMessage {...messages.status} /></div>
              <div className="formet commonTitle"><FormattedMessage {...messages.formats} /></div>
              <div className="forin commonTitle"><FormattedMessage {...messages.forin} /></div>
              <div className="appname commonTitle"><FormattedMessage {...messages.app} /></div>
              <div className="size commonTitle"><FormattedMessage {...messages.size} /></div>
              <div className="createTime commonTitle"><FormattedMessage {...messages.createTime} /></div>
              <div className="actionBox commonTitle"><FormattedMessage {...messages.action} /></div>
            </div>
            <MyComponent storage = {this.props.storageList[this.props.currentImagePool]}  volumeArray = { this.state.volumeArray } saveVolumeArray = { this.selectItem() } imagePool = { this.props.currentImagePool} loadStorageList = { () => {this.props.loadStorageList(this.props.currentImagePool)}}/>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

Storage.propTypes = {
  intl: PropTypes.object.isRequired,
  loadStorageList: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  return {
    storageList: state.storage.storageList,
    createStorage: state.storage.createStorage,
    deleteStorage: state.storage.deleteStorage,
    currentImagePool: DEFAULT_IMAGE_POOL
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadStorageList: (pool) => {
      dispatch(loadStorageList(pool))
    },
    deleteStorage: (pool, volumeArray, callback) => {
      dispatch(deleteStorage(pool, volumeArray, callback))
    },
    createStorage: (obj, callback) => {
      dispatch(createStorage(obj, callback))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Storage, {
  withRef: true,
}))