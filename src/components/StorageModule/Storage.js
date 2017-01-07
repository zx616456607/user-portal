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
import ReactDOM from 'react-dom'
import { Checkbox, Card, Menu, Button, Dropdown, Icon, Radio, Modal, Input, Slider, InputNumber, Row, Col, Tooltip } from 'antd'
import { Link } from 'react-router'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import remove from 'lodash/remove'
import findIndex from 'lodash/findIndex'
import { loadStorageList, deleteStorage, createStorage, formateStorage, resizeStorage } from '../../actions/storage'
import { DEFAULT_IMAGE_POOL, STORAGENAME_REG_EXP } from '../../constants'
import './style/storage.less'
import { calcuDate, parseAmount } from '../../common/tools'
import { volNameCheck } from '../../common/naming_validation'
import NotificationHandler from '../../common/notification_handler'

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;
let isActing = false

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

let MyComponent = React.createClass({
  getInitialState() {
    return {
      visible: false,
      modalTitle: '',
      modalSize: 512,
      size: 512
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
  handleSure() {
    if(isActing) return
    isActing = true
    const type = this.state.modalType
    const self = this
    let notification = new NotificationHandler()
    notification.spin("执行中")
    if (type === 'format') {
      this.props.formateStorage(this.props.imagePool, this.props.cluster, {
        name: this.state.modalName,
        fsType: this.state.formateType
      }, {
          success: {
            isAsync: true,
            func: () => {
              self.setState({
                visible: false,
              })
              isActing = false
              notification.close()
              notification.success('格式化存储卷成功')
              this.props.loadStorageList()
            }
          },
          failed: {
            isAsync: true,
            func: () => {
              self.setState({
                visible: false
              })
              isActing = false
              notification.close()
              notification.error('格式化存储卷失败')
              this.props.loadStorageList()
            }
          }
        })
    } else if (type === 'resize') {
      if (this.state.size <= this.state.modalSize) {
        notification.close()
        notification.error('不能比以前小')
        isActing = false
        return
      }
      this.props.resizeStorage(this.props.imagePool, this.props.cluster, {
        name: this.state.modalName,
        size: this.state.size
      }, {
          success: {
            isAsync: true,
            func: () => {
              self.setState({
                visible: false
              })
              isActing = false
              notification.close()
              notification.success('扩容成功')
              self.props.loadStorageList()
            }
          },
          failed: {
            isAsync: true,
            func: () => {
              self.setState({
                visible: false
              })
              isActing = false
              notification.close()
              notification.error('扩容失败')
              self.props.loadStorageList()
            }
          }
        })
    }
  },
  cancelModal() {
    this.setState({
      visible: false,
    });
  },
  onChange(value) {
    this.setState({
      size: value,
    });
  },
  showAction(e, type, one, two) {
    if(e.stopPropagation) e.stopPropagation()
    else e.cancelable = true
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
  changeDilation(size) {
    this.setState({
      size: size
    })
  },

  selectByline(e, item) {
    if(item.isUsed) return
    this.props.saveVolumeArray({target:{checked:!this.isChecked(item.name)}}, item.name)
  },

  render() {
    const { formatMessage } = this.props.intl
    let list = this.props.storage;
    if (!list || !list.storageList) return (<div></div>)
    let items = list.storageList.map((item) => {
      const menu = (<Menu onClick={(e) => { this.showAction(e, 'format', item.name, item.format) } } style={{ width: '80px' }}>
        <Menu.Item key="1" disabled={item.isUsed}><FormattedMessage {...messages.formatting} /></Menu.Item>
      </Menu>
      )
      return (
        <div className="appDetail" key={item.name} onClick={(e) => this.selectByline(e, item)}>
          <div className="selectIconTitle commonData">
            <Checkbox disabled={item.isUsed} onChange={(e) => this.onchange(e, item.name)} checked={this.isChecked(item.name)}></Checkbox>
          </div>
          <div className="name commonData">
            <Link to={`/app_manage/storage/${this.props.imagePool}/${this.props.cluster}/${item.name}`} >
              {item.name}
            </Link>
          </div>
          <div className="status commonData">
            <i className={item.isUsed == true ? "error fa fa-circle" : "normal fa fa-circle"}></i>
            <span className={item.isUsed == false ? "normal" : "error"} >{item.isUsed == true ? <FormattedMessage {...messages.use} /> : <FormattedMessage {...messages.noUse} />}</span>
          </div>
          <div className="formet commonData">{item.format}</div>
          <div className="forin commonData">{item.mountPoint || '无'}</div>
          <div className="appname commonData">{item.appName || '无'}</div>
          <div className="size commonData">{item.totalSize}M</div>
          <div className="createTime commonData">
            <span className='spanBlock'>
              <Tooltip placement="topLeft" title={calcuDate(item.createTime)}>
                <span>{calcuDate(item.createTime)}</span>
              </Tooltip>
            </span>
          </div>
          <div className="actionBtn commonData">
            {/*<Dropdown overlay={menu}>
              <Button type="ghost" disabled={item.isUsed} style={{ marginLeft: 8 }}>
                <span onClick={() => { this.showAction('resize', item.name, item.totalSize) } }><FormattedMessage {...messages.dilation} /> </span><Icon type="down" />
              </Button>
            </Dropdown>*/}
            {!item.isUsed ?
              <Dropdown overlay={menu} onClick={(e) => { this.showAction(e, 'resize', item.name, item.totalSize) } }>
                <Button type="ghost" disabled={item.isUsed}>
                  <span className="divider"><FormattedMessage {...messages.dilation} /> </span><Icon type="down" />
                </Button>
              </Dropdown>
            :
              <Dropdown overlay={menu} visible={false}>
                <Button type="ghost" disabled={item.isUsed}>
                  <span className="divider"><FormattedMessage {...messages.dilation} /> </span><Icon type="down" />
                </Button>
              </Dropdown>
            }
          </div>
        </div>
      );
    });
    const { scope } = this.props
    const { resourcePrice } = scope.props.currentCluster
    const hourPrice = parseAmount(this.state.size /1024 * resourcePrice.storage, 4)
    const countPrice = parseAmount(this.state.size /1024 * resourcePrice.storage * 24 *30, 4)
    return (
      <div className="dataBox">
        {items}
        <Modal title={this.state.modalTitle} visible={this.state.visible} okText="确定" cancelText="取消" className="storageModal" width={600} onCancel= {() => this.cancelModal() }
         footer={[
            <Button key="back" type="ghost" size="large" onClick={(e) => { this.cancelModal() } }>取消</Button>,
            <Button key="submit" type="primary" size="large" disabled={isActing} loading={this.state.loading} onClick={(e) => { this.handleSure() } }>
              确定
            </Button>
          ]}
         >
          <div className={this.state.modalType === 'resize' ? 'show' : 'hide'}>
            <Row style={{ height: '40px' }}>
              <Col span="3" className="text-center" style={{ lineHeight: '30px' }}><FormattedMessage {...messages.name} /></Col>
              <Col span="12"><input type="text" className="ant-input" value={this.state.modalName} disabled /></Col>
            </Row>
            <Row style={{ height: '40px' }}>
              <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>{formatMessage(messages.size)}</Col>
              <Col span="12">
                <Slider min={this.state.modalSize} max={20480} step={512} onChange={(e) => { this.changeDilation(e) } } value={this.state.size} /></Col>
              <Col span="8">
                <InputNumber min={this.state.modalSize} max={20480} step={512} style={{ marginLeft: '16px' }} value={this.state.size} onChange={(e) => { this.onChange(e) } } />
                <span style={{ paddingLeft: 10 }} >MB</span>
              </Col>
            </Row>
            <div className="modal-price">
              <div className="price-left">
                存储：{hourPrice.unit == '￥'? '￥': ''}{ resourcePrice.storage /10000 } {hourPrice.unit == '￥'? '元': 'T'}/(GB*小时)
              </div>
              <div className="price-unit">
                <p>合计：<span className="unit">{hourPrice.unit == '￥'? '￥': ''}</span><span className="unit blod"> { hourPrice.amount }{hourPrice.unit == '￥'? '元': ''}/小时</span></p>
                <p><span className="unit">（约：</span><span className="unit"> { countPrice.fullAmount }{hourPrice.unit == '￥'? '元': ''}/小时</span></p>
              </div>
            </div>

          </div>
          <div className={this.state.modalType === 'format' ? 'show' : 'hide'}>
            <div style={{ height: '30px' }}>确定格式化存储卷{this.state.modalName}吗? <span style={{ color: 'red' }}>(格式化后数据将被清除)。</span></div>
            <Col span="6" style={{ lineHeight: '30px' }}>选择文件系统格式：</Col>
            <RadioGroup defaultValue='ext4' value={this.state.formateType} size="large" onChange={(e) => this.changeType(e)}>
              <RadioButton value="ext4">ext4</RadioButton>
              <RadioButton value="xfs">xfs</RadioButton>

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
    formateStorage: (pool, cluster, storage, callback) => {
      dispath(formateStorage(pool, cluster, storage, callback))
    },
    resizeStorage: (pool, cluster, storage, callback) => {
      dispath(resizeStorage(pool, cluster, storage, callback))
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
    // this.focus = this.focus.bind(this)
    this.state = {
      visible: false,
      volumeArray: [],
      currentType: 'ext4',
      inputName: '',
      size: 512,
      nameError: false,
      nameErrorMsg: ''
    }
  }
  componentWillMount() {
    document.title = '存储 | 时速云'
    this.props.loadStorageList(this.props.currentImagePool, this.props.cluster)
  }
  componentWillReceiveProps(nextProps) {
    let { currentCluster, loadStorageList, currentImagePool, cluster } = nextProps
    if (currentCluster.clusterID !== this.props.currentCluster.clusterID || currentCluster.namespace !== this.props.currentCluster.namespace) {
      loadStorageList(currentImagePool, cluster)
    }
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
    const self = this
    setTimeout(function () {
      if (self.focusInput) {
        self.focusInput.refs.input.focus()
      }
    }, 0)
  }
  handleOk() {
    let notification = new NotificationHandler()
    //create storage
    if (!this.state.name) {
      notification.error('请输入存储卷名称')
      return
    }
    if(this.state.nameError) {
      return
    }
    if (this.state.size === 0) {
      notification.error('请输入存储卷大小')
      return
    }
    /*if(this.state.name.length < 3 || this.state.name.length > 20) {
      notification.error('存储卷名称大小应在3到15个字符, 且只可以a-z或A-Z开始,且只可以英文字母或者数字组成')
      return
    }
    if(!/^[a-zA-z][a-zA-z0-9]*$/.test(this.state.name)) {
      notification.error('存储名称只可以a-z或A-Z开始,且只可以英文字母或者数字组成')
      return
    }*/
    if(isActing) return
    isActing = true
    notification.spin('创建存储卷中')
    let storageConfig = {
      driver: 'rbd',
      name: this.state.name,
      driverConfig: {
        size: this.state.size,
        fsType: this.state.currentType,
      },
      cluster: this.props.cluster
    }
    let self = this
    this.props.createStorage(storageConfig, {
      success: {
        func: () => {
          isActing = false
          self.setState({
            visible: false,
            name: '',
            size: 512,
            currentType: 'ext4'
          })
          notification.close()
          notification.success('创建存储成功')
          self.props.loadStorageList(self.props.currentImagePool, self.props.cluster)
        },
        isAsync: true
      },
      failed: {
        isAsync: true,
        func: (err) => {
          isActing = false
          notification.close()
          if (err.statusCode == 409) {
            notification.error('存储卷 ' + storageConfig.name + ' 已经存在')
          } else {
            notification.error('创建存储卷失败')
          }
        }
      }
    })
  }
  handleCancel() {
    this.setState({
      nameError: false,
      visible: false,
      size: 512,
      name: '',
      currentType: 'ext4'
    });
  }
  deleteStorage() {
    let volumeArray = this.state.volumeArray
    if (volumeArray && volumeArray.length === 0) {
      return
    }
    this.setState({
      volumeArray: []
    })
    volumeArray = volumeArray.map(item => {
      return item.name
    })
    let notification = new NotificationHandler()
    notification.spin("删除存储中")
    this.props.deleteStorage(this.props.currentImagePool, this.props.cluster, { volumes: volumeArray }, {
      success: {
        func: () => {
          notification.close()
          this.props.loadStorageList(this.props.currentImagePool, this.props.cluster)
          notification.success('删除存储成功')
        },
        isAsync: true
      },
      failed: {
        isAsync: true,
        func: () => {
          notification.close()
          notification.error('删除存储失败')
          this.props.loadStorageList(this.props.currentImagePool, this.props.cluster)
        }
      }
    })
  }
  onAllChange(e) {
    const storage = this.props.storageList[this.props.currentImagePool]
    if (!storage || !storage.storageList) {
      return
    }
    if (e.target.checked) {
      let volumeArray = []
      storage.storageList.forEach(item => {
        volumeArray.push({
          name: item.name,
          diskType: 'rbd'
        })
      })
      this.setState({
        volumeArray
      })
      return
    }
    this.setState({
      volumeArray: []
    })
  }
  isAllChecked() {
    if (this.state.volumeArray.length === 0) {
      return false
    }
    if (this.state.volumeArray.length === this.props.storageList[this.props.currentImagePool].storageList.length) {
      return true
    }
    return false
  }

  selectItem() {
    return (e, name, diskType) => {
      let volumeArray = this.state.volumeArray
      if (e.target.checked) {
        if (findIndex(volumeArray, { name }) >= 0) {
          return
        }
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
    if (this.props.storageList && this.props.storageList[this.props.currentImagePool]) {
      this.props.storageList[this.props.currentImagePool].storageList.some((item) => {
        if (item.isUsed) {
          selectAll = false
        }
      })
      return selectAll
    }
  }
  handleInputName(e) {

    let name = e.target.value;
    let errorMsg = volNameCheck(name, '存储名称');
    let errorFlag = false;
    if(errorMsg != 'success') {
      errorFlag = true;
    }
    this.setState({
      name: e.target.value,
      nameError: errorFlag,
      nameErrorMsg: errorMsg
    })
  }
  getSearchStorageName(e) {
    this.setState({
      storageName: e.target.value
    })
  }
  searchByStorageName(e) {
    this.props.loadStorageList(this.props.currentImagePool, this.props.cluster, this.state.storageName)
  }
  showDeleteModal() {
    let notification = new NotificationHandler()
    if (this.state.volumeArray.length <= 0) {
      notification.error('请选择要删除的存储')
      return
    }
    const self = this
    Modal.confirm({
      title: '提示',
      content: `确定要删除 ${this.state.volumeArray.map(item => item.name).join(',')} 存储卷吗?`,
      okText: '删除',
      cancelText: '取消',
      onOk() {
        self.deleteStorage()
      }
    });
  }
  render() {
    const { formatMessage } = this.props.intl
    if (!this.props.currentCluster.resourcePrice) return <div></div>
    const storagePrice = this.props.currentCluster.resourcePrice.storage /10000
    const hourPrice = parseAmount(this.state.size / 1024 * this.props.currentCluster.resourcePrice.storage, 4)
    const countPrice = parseAmount(this.state.size / 1024 * this.props.currentCluster.resourcePrice.storage * 24 *30, 4)
    return (
      <QueueAnim className="StorageList" type="right">
        <div id="StorageList" key="StorageList">
          <div className="operationBox">
            <div className="leftBox">
              <Button type="primary" size="large" onClick={this.showModal}>
                <i className="fa fa-plus" /><FormattedMessage {...messages.createTitle} />
              </Button>
              <Button type="ghost" className="stopBtn" size="large" onClick={() => { this.showDeleteModal() } }
                disabled={!this.state.volumeArray || this.state.volumeArray.length < 1}>
                <i className="fa fa-trash-o" /><FormattedMessage {...messages.delete} />
              </Button>
              <Modal title={formatMessage(messages.createModalTitle)}
                visible={this.state.visible} width={550}
                okText={formatMessage(messages.createBtn)}
                cancelText={formatMessage(messages.cancelBtn)}
                className='createAppStorageModal'
                onCancel= {() => this.handleCancel() }
                footer={[
                   <Button key="back" type="ghost" size="large" onClick={() => { this.handleCancel() }}>取消</Button>,
                   <Button key="submit" type="primary" size="large" disabled={isActing} loading={this.state.loading} onClick={(e) => { this.handleOk() } }>
                   确定
                   </Button>
                ]}
                >
                <Row style={{ height: '45px' }}>
                  <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>
                    <FormattedMessage {...messages.name} />
                  </Col>
                  <Col span="21">
                    <Input className={ this.state.nameError ? 'nameErrorInput nameInput' : 'nameInput' } ref={(input) => this.focusInput = input} value={this.state.name} placeholder={formatMessage(messages.placeholder)} onChange={(e) => { this.handleInputName(e) } } />
                    { this.state.nameError ? [<span className='nameErrorSpan'>{this.state.nameErrorMsg}</span>] : null }
                  </Col>
                </Row>
                <Row style={{ height: '40px' }}>
                  <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>
                    {formatMessage(messages.size)}
                  </Col>
                  <Col span="12">
                    <Slider min={512} max={20480} step={512} onChange={this.onChange} value={this.state.size} />
                  </Col>
                  <Col span="8">
                    <InputNumber min={512} max={20480} step={512} style={{ marginLeft: '16px' }} value={this.state.size} onChange={this.onChange} />
                    <span style={{ paddingLeft: 10 }} >MB</span>
                  </Col>
                </Row>
                <Row>
                  <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>
                    {formatMessage(messages.formats)}
                  </Col>
                  <Col span="20" className="action-btns" style={{ lineHeight: '30px' }}>
                    <Button type={this.state.currentType === 'ext4' ? 'primary' : 'ghost'} onClick={(e) => { this.changeType('ext4') } }>ext4</Button>
                    <Button type={this.state.currentType === 'xfs' ? 'primary' : 'ghost'} style={{ margin: '0 10px' }} onClick={(e) => { this.changeType('xfs') } }>xfs</Button>
                  </Col>
                </Row>
                <div className="modal-price">
                  <div className="price-left">
                    存储：{hourPrice.unit == '￥' ? '￥' : ''}{ storagePrice } {hourPrice.unit == '￥' ? '元' : 'T'}/(GB*小时)
                  </div>
                  <div className="price-unit">
                    <p>合计：<span className="unit">{hourPrice.unit == '￥'? '￥': ''}</span><span className="unit blod">{ hourPrice.amount }{hourPrice.unit == '￥'? '元': ''}/小时</span></p>
                    <p><span className="unit">（约：</span><span className="unit">{ countPrice.fullAmount }{hourPrice.unit == '￥'? '元': ''}/月）</span></p>
                  </div>
                </div>
              </Modal>
            </div>
            <div className="rightBox">
              <div className="littleLeft">
                <i className="fa fa-search cursor" onClick={() => this.searchByStorageName()}/>
              </div>
              <div className="littleRight">
                <Input size="large" placeholder={formatMessage(messages.inputPlaceholder)} onChange={(e) => this.getSearchStorageName(e)} onPressEnter={() => this.searchByStorageName()} />
              </div>
            </div>
            <div className="clearDiv"></div>
          </div>
          <Card className="storageBox appBox">
            <div className="appTitle">
              <div className="selectIconTitle commonTitle">
                <Checkbox onChange={(e) => this.onAllChange(e)} checked={this.isAllChecked()} disabled={!this.disableSelectAll()} />
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
            <MyComponent
              storage={this.props.storageList[this.props.currentImagePool]}
              volumeArray={this.state.volumeArray}
              saveVolumeArray={this.selectItem()}
              cluster={this.props.cluster}
              imagePool={this.props.currentImagePool}
              loadStorageList={() => { this.props.loadStorageList(this.props.currentImagePool, this.props.cluster) } }
              scope ={ this }
              />
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
  const { cluster } = state.entities.current
  return {
    storageList: state.storage.storageList,
    createStorage: state.storage.createStorage,
    deleteStorage: state.storage.deleteStorage,
    currentImagePool: DEFAULT_IMAGE_POOL,
    cluster: cluster.clusterID,
    currentCluster: cluster,
  }
}

export default connect(mapStateToProps, {
  deleteStorage,
  createStorage,
  loadStorageList
})(injectIntl(Storage, {
  withRef: true,
}))
