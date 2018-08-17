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
import { Checkbox, Card, Menu, Button, Dropdown, Icon, Radio, Modal, Input, Slider, InputNumber, Row, Col, Tooltip, Spin, Form, Table } from 'antd'
import { Link, browserHistory } from 'react-router'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import cloneDeep from 'lodash/cloneDeep'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import remove from 'lodash/remove'
import findIndex from 'lodash/findIndex'
import { loadStorageList, deleteStorage, createStorage, formateStorage, resizeStorage, SnapshotCreate, searchStorage } from '../../actions/storage'
import { DEFAULT_IMAGE_POOL, STORAGENAME_REG_EXP, UPDATE_INTERVAL } from '../../constants'
import './style/storage.less'
import { calcuDate, parseAmount, formatDate, adjustBrowserUrl, mergeQueryFunc } from '../../common/tools'
import { volNameCheck } from '../../common/naming_validation'
import NotificationHandler from '../../components/Notification'
import ResourceQuotaModal from '../ResourceQuotaModal/Storage'
import CreateVolume from '../StorageModule/CreateVolume'
import { SHOW_BILLING, UPGRADE_EDITION_REQUIRED_CODE } from '../../constants'
import Title from '../Title'
const RadioGroup = Radio.Group;
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

const DEFAULT_QUERY = {
  storagetype: 'ceph',
  srtype: 'private',
}

let MyComponent = React.createClass({
  getInitialState() {
    return {
      visible: false,
      modalTitle: '',
      modalSize: 512,
      size: 512,
      createSnapModal: false,
      confirmCreateSnapshotLoading: false,
      volumeName: '',
      volumeFormat: '',
      volumeSize: '',
      CreateSnapshotSuccessModal: false,
      snapshotName: '',
      tipsModal: false,
      dilation: false,
      selectedRowKeys: [],
      resizeConfirmBtnDisabled: true,
      confirmChecked: false,
      currentVolume: {},
    };
  },
  propTypes: {
    config: React.PropTypes.object
  },
  componentWillReceiveProps(nextProps){
    if(nextProps.storage.isFetching !== this.props.storage.isFetching && nextProps.storage.isFetching){
      this.setState({
        selectedRowKeys: [],
      })
    }
  },
  changeType(e) {
    this.setState({
      formateType: e.target.value
    })
  },
  handleSure() {
    if(isActing) return
    isActing = true
    const { location, loadStorageList } = this.props
    const { query = {} } = location
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
              loadStorageList({ page: query.page || 1 })
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
            }
          }
        })
    } else if (type === 'resize') {
      if (this.state.size <= this.state.modalSize) {
        notification.close()
        notification.info('存储卷大小没有变化')
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
              loadStorageList({ page: query.page || 1 })
            }
          },
          failed: {
            isAsync: true,
            func: (res) => {
              self.setState({
                visible: false
              })
              isActing = false
              notification.close()
              let message = this.formatMessage(res, '扩容失败')
              notification.error(message)
            }
          }
        })
    }
  },
  formatMessage(res, defaultMessage){
    let message = defaultMessage
    if(res.message && typeof res.message == 'string'){
      return message = res.message
    }
    if(res.message.message && typeof res.message.message == 'string'){
      return message = res.message.message
    }
    return message
  },
  cancelModal() {
    this.setState({
      visible: false,
      resizeConfirmBtnDisabled: true,
      confirmChecked: false,
    });
  },
  onChange(value) {
    this.setState({
      size: value,
    });
  },
  showAction(e, type, item) {
    if(e.stopPropagation) e.stopPropagation()
    else e.cancelable = true
    if(e.key && e.key == 'createSnapshot'){
      const { form } = this.props
      const { setFieldsValue } = form
      setFieldsValue({
        snapshotName: undefined
      })
      this.setState({
       createSnapModal: true,
       volumeName: item.name,
       volumeFormat: item.format,
       volumeSize: item.desireSize,
      })
      setTimeout(function() {
        document.getElementById('snapshotName').focus()
      },100)
      return
    }
    if(e.key && e.key == 'resize'){
      if(item.isUsed){
        this.setState({
          tipsModal: true,
          dilation: false,
        })
        return
      }
      const size = item.desireSize || item.totalSize
      this.setState({
        visible: true,
        modalType: 'resize',
        modalName: item.name,
        modalSize: size,
        size,
        currentVolume: item,
        modalTitle: '扩容'
      });
      return
    }
    if (e.key && e.key == 'format') {
      if(item.isUsed){
        this.setState({
          tipsModal: true,
          dilation: true,
        })
        return
      }
      this.setState({
        visible: true,
        modalType: type,
        modalName: item.name,
        modalFormat: item.format,
        format: item.format,
        formateType: item.format
      });
      this.setState({
        modalTitle: '格式化'
      })
    }
  },
  handleConfirmCreateSnapshot(){
    const { form, SnapshotCreate, cluster } = this.props
    const { volumeName } = this.state
    let Noti = new NotificationHandler()
    form.validateFields( (errors, values) => {
      if(errors){
        return
      }
      const body = {
        clusterID: cluster,
        volumeName,
        body: {
          snapshotName:values.snapshotName
        }
      }
      this.setState({
        confirmCreateSnapshotLoading: true
      })
      SnapshotCreate(body,{
        success: {
          func: () => {
            Noti.success('创建快照成功！')
            this.setState({
              createSnapModal: false,
              confirmCreateSnapshotLoading: false,
              CreateSnapshotSuccessModal: true,
              snapshotName: values.snapshotName,
            })
          },
          isAsync: true
        },
        failed: {
          func: err => {
            if(err.statusCode !== UPGRADE_EDITION_REQUIRED_CODE){
              Noti.error('创建快照失败！')
            }
            this.setState({
              createSnapModal: false,
              confirmCreateSnapshotLoading: false
            })
          }
        }
      })
    })
  },
  handleCancelCreateSnapshot(){
    this.setState({
      createSnapModal: false,
      volumeName: '',
      volumeFormat: '',
      volumeSize: '',
      confirmCreateSnapshotLoading: false,
    })
  },
  checksnapshotName(rule, value, callback){
    const { snapshotDataList } = this.props
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
    for(let i = 0; i < snapshotDataList.length; i++){
      if(value == snapshotDataList[i].name){
        return callback('快照名称已存在！')
      }
    }
    return callback()
  },
  handleConfirmCreateSnapshotSuccess(){
    this.setState({
      CreateSnapshotSuccessModal: false,
      snapshotName: '',
    })
    browserHistory.push('/app_manage/snapshot')
  },
  handleCancelCreateSnapshotSuccess(){
    this.setState({
      CreateSnapshotSuccessModal: false,
      snapshotName: '',
    })
  },
  changeDilation(size) {
    if (size > 20480) {
      size = 20480
    }
    this.setState({
      size: size
    })
  },
  colseTipsModal(){
    this.setState({
      tipsModal: false
    })
  },
  formatStatus(status){
    switch(status){
      case 'pending':
        return <span style={{color: '#0eb4ff'}}>
        <i className="fa fa-circle icon-marginRight penging"></i>
        创建中
      </span>
      case 'used':
        return <span style={{color: '#f85a5a'}}>
        <i className="fa fa-circle icon-marginRight used"></i>
        使用中
      </span>
      case 'unused':
        return <span style={{color: '#5cb85c'}}>
        <i className="fa fa-circle icon-marginRight no_used"></i>
        未使用
      </span>
      default:
        return <span style={{color: '#666666'}}>
        <i className="fa fa-circle icon-marginRight unknown"></i>
        未知
      </span>
    }
  },
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys })
    this.props.scope.setState({
      volumeArray: selectedRowKeys,
    })
  },
  tableRowClick(record, index) {
    if (record.status == 'used') {
      return
    }
    const { selectedRowKeys } = this.state
    const newSelectedRowKeys = cloneDeep(selectedRowKeys)
    if(newSelectedRowKeys.indexOf(record.name) > -1){
      newSelectedRowKeys.splice(newSelectedRowKeys.indexOf(record.name), 1)
    } else {
      newSelectedRowKeys.push(record.name)
    }
    this.setState({
      selectedRowKeys: newSelectedRowKeys
    })
    this.props.scope.setState({
      volumeArray: newSelectedRowKeys,
    })
  },
  render() {
    const {
      isFetching, storage, billingEnabled, location,
      scope, form, imagePool, cluster,
    } = this.props
    const {
      selectedRowKeys, currentVolume, resizeConfirmBtnDisabled,
      confirmChecked,
    } = this.state
    const currentVolumeServiceName = currentVolume.deployServiceList
      && currentVolume.deployServiceList[0]
      && currentVolume.deployServiceList[0].serviceName
    const { formatMessage } = this.props.intl
    const { query = {} } = location
    let storageList = storage.storageList
    if(!storageList || !storageList.length){
      storageList = []
    }
    const { getFieldProps } = form
    const { resourcePrice } = scope.props.currentCluster
    const hourPrice = parseAmount(this.state.size /1024 * resourcePrice.storage, 4)
    const countPrice = parseAmount(this.state.size /1024 * resourcePrice.storage * 24 *30, 4)
    const snapshotName = getFieldProps('snapshotName',{
      rules: [{
        validator: this.checksnapshotName
      }]
    })
    const columns = [
      {
        title: '存储名称',
        key: 'name',
        dataIndex: 'name',
        width: '12%',
        className: 'name',
        render: name => <div><span className='text' onClick={() => browserHistory.push(`/app_manage/storage/exclusiveMemory/${this.props.imagePool}/${this.props.cluster}/${name}`)}>{name}</span></div>
      },{
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        width: '10%',
        render: status => <div className='status'>{this.formatStatus(status)}</div>
      },{
        title: '类型',
        key: 'storageServer',
        dataIndex: 'storageServer',
        width: '18%',
        render: storageServer => <div>块存储 ({storageServer || '-'})</div>
      },{
        title: '大小',
        key: 'desireSize',
        dataIndex: 'desireSize',
        width: '9%',
        render: (desireSize, record) => {
          const size = record.desireSize || record.totalSize
          return <div>{size == 0 ? '-' : size} M</div>
        }
      },{
        title: '格式',
        key: 'format',
        dataIndex: 'format',
        width: '9%'
      },{
        title: '服务',
        key: 'deployServiceList',
        dataIndex: 'deployServiceList',
        width: '10%',
        render: deployServiceList => {
          const serviceName = deployServiceList && deployServiceList[0] && deployServiceList[0].serviceName
          if (!serviceName) {
            return '未挂载服务'
          }
          return <Link to={`/app_manage/service?serName=${serviceName}`}>{serviceName}</Link>
        }
      //},{
      //  title: <div>
      //    回收策略
      //    <Tooltip title={<div>
      //        <div>保留：服务删除时，保留存储</div>
      //        <div>删除：删除服务时，删除存储</div>
      //      </div>}>
      //      <Icon type="question-circle-o" className='question_icon'/>
      //    </Tooltip>
      //  </div>,
      //  key: 'reclaimPolicy',
      //  dataIndex: 'reclaimPolicy',
      //  width: '13%',
      //  className: 'strategy',
      //  render: reclaimPolicy => <div>{ reclaimPolicy == 'delete' ? '删除' : '保留'}</div>
      },{
        title: '创建时间',
        key: 'createTime',
        dataIndex: 'createTime',
        width: '17%',
        sorter: (a, b) => new Date(formatDate(a.createTime)) - new Date(formatDate(b.createTime)),
        render: createTime => <div>{formatDate(createTime)}</div>
      },{
        title: '操作',
        key: 'handle',
        dataIndex: 'handle',
        width: '15%',
        render: (text, record, index) => {
          const menu = <Menu
            onClick={(e) => { this.showAction(e, 'format', record) } }
            style={{ width: '80px' }}
          >
            <Menu.Item
              key='resize'
              disabled={record.status == 'pending' || record.status == 'used'}
              title="使用中存储不能进行扩容操作"
            >
              <FormattedMessage {...messages.dilation} />
            </Menu.Item>
            <Menu.Item key="createSnapshot" disabled={record.status == 'pending'}>
              创建快照
            </Menu.Item>
            <Menu.Item
              key="format"
              disabled={record.status == 'pending' || record.status == 'used'}
              title="使用中存储不能进行格式化操作"
            >
              <FormattedMessage {...messages.formatting} />
            </Menu.Item>
          </Menu>
          return <Dropdown.Button
            overlay={menu}
            type='ghost'
            onClick={() => browserHistory.push(`/app_manage/storage/exclusiveMemory/${imagePool}/${cluster}/${record.name}`)}
            key="dilation"
          >
            查看
          </Dropdown.Button>
        }
      }
    ]
    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: record.status === "used",
      }),
      selectedRowKeys,
      onChange: this.onSelectChange,
    }
    const paginationProps = {
      simple: true,
      current: parseInt(query.page) || 1,
      onChange: page => adjustBrowserUrl(location, mergeQueryFunc(DEFAULT_QUERY, { page, search: query.search })),
    }
    return (
      <div className="dataBox">
        <div className='reset_antd_table_header'>
          <Table
            columns={columns}
            dataSource={storageList}
            rowSelection={rowSelection}
            onRowClick={this.tableRowClick}
            pagination={paginationProps}
            loading={isFetching}
            rowKey={record => record.name}
          />
        </div>

        <Modal
          title={this.state.modalTitle}
          visible={this.state.visible}
          okText="确定"
          cancelText="取消"
          className="storageModal"
          width={600}
          onCancel= {() => this.cancelModal() }
          footer={[
            <Button key="back" type="ghost" size="large" onClick={(e) => { this.cancelModal() } }>取消</Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              // disabled={this.state.modalType === 'resize' && resizeConfirmBtnDisabled}
              loading={isActing}
              loading={this.state.loading}
              onClick={(e) => { this.handleSure() } }
            >
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
                <Slider
                  min={ parseInt(this.state.modalSize) < 20480 ? parseInt(this.state.modalSize) : 512}
                  disabled={this.state.modalSize == 20480}
                  max={20480}
                  step={512}
                  onChange={(e) => { this.changeDilation(e) } }
                  value={parseInt(this.state.size)}
                />
              </Col>
              <Col span="8">
                <InputNumber min={parseInt(this.state.modalSize)} max={20480} step={512} style={{ marginLeft: '16px' }} value={this.state.size} onChange={(e) => { this.onChange(e) } } />
                <span style={{ paddingLeft: 10 }} >MB</span>
              </Col>
            </Row>
            { billingEnabled ?
            <div className="modal-price">
              <div className="price-left">
                存储：{hourPrice.unit == '￥'? '￥': ''}{ resourcePrice.storage /10000 } {hourPrice.unit == '￥'? '': ' T'}/(GB*小时)
              </div>
              <div className="price-unit">
                <p>合计：<span className="unit">{hourPrice.unit == '￥'? '￥': ''}</span><span className="unit blod"> { hourPrice.amount }{hourPrice.unit == '￥'? '': ' T'}/小时</span></p>
                <p><span className="unit">（约：</span><span className="unit"> { countPrice.fullAmount }/月）</span></p>
              </div>
            </div>
            :null
            }
            {
              currentVolumeServiceName &&
              <div className="confirm-resize">
                <Checkbox
                  checked={confirmChecked}
                  onChange={e => this.setState({
                    resizeConfirmBtnDisabled: !e.target.checked,
                    confirmChecked: e.target.checked,
                  })}
                >
                  存储扩容后，将重新部署服务&nbsp;
                    <a target="_blank" href={`/app_manage/service?serName=${currentVolumeServiceName}`}>
                    {currentVolumeServiceName}
                    </a>
                  &nbsp;
                </Checkbox>
              </div>
            }
          </div>
          <div className={this.state.modalType === 'format' ? 'show' : 'hide'}>
            <div style={{ height: '30px' }}>确定格式化存储卷 {this.state.modalName} 吗？
              <span style={{ color: 'red' }}>(格式化后数据将被清除)。</span>
            </div>
            <Col span="6" style={{ lineHeight: '30px' }}>选择文件系统格式：</Col>
            <RadioGroup defaultValue='ext4' value={this.state.formateType} size="large" onChange={(e) => this.changeType(e)}>
              <Radio prefixCls="ant-radio-button" value="ext4">ext4</Radio>
              <Radio prefixCls="ant-radio-button" value="xfs">xfs</Radio>

            </RadioGroup>
          </div>
        </Modal>

        <Modal
          title="创建快照"
          visible={this.state.createSnapModal}
          closable={true}
          onOk={this.handleConfirmCreateSnapshot}
          onCancel={this.handleCancelCreateSnapshot}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmCreateSnapshotLoading}
          wrapClassName="CreateSnapshotModal"
          okText="创建快照"
        >
          <div>
            <div className='header'>
              <div className='leftbox'>
                <div className="item">存储名称</div>
                <div className="item">存储大小</div>
                <div className="item">存储格式</div>
                <div className="item">快照名称</div>
              </div>
              <div className="rightbox">
                <div className='item'>{this.state.volumeName}</div>
                <div className="item">{this.state.volumeSize} MB</div>
                <div className="item">{this.state.volumeFormat}</div>
                <div className='item'>
                  <Form.Item>
                    <Input
                      {...snapshotName}
                      placeholder='请输入快照名称'
                      onPressEnter={this.handleConfirmCreateSnapshot}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className='footer'>
              <div className="title">为了保证快照能完整的捕获磁盘数据内容，建议制作快照前，进行以下操作：</div>
              <div className="item"><span className='num'>1</span>数据库业务：Flush & Lock Table</div>
              <div className="item"><span className='num'>2</span>文件系统：进行Sync操作，将内存缓冲区中的数据立刻写入磁盘内</div>
            </div>
          </div>
        </Modal>

        <Modal
          title="创建快照"
          visible={this.state.CreateSnapshotSuccessModal}
          closable={true}
          onOk={this.handleConfirmCreateSnapshotSuccess}
          onCancel={this.handleCancelCreateSnapshotSuccess}
          width='570px'
          maskClosable={false}
          wrapClassName="CreateSnapshotSccessModal"
          okText="去查看"
          cancelText="关闭"
        >
          <div className='container'>
            <div className='header'>
              <div>
                <Icon type="check-circle-o" className='icon'/>
              </div>
              <div className='tips'>
                操作成功
              </div>
            </div>
            <div>快照名称 {this.state.snapshotName}</div>
          </div>
        </Modal>

         <Modal
           title="提示"
           visible={this.state.tipsModal}
           closable={true}
           onOk={this.colseTipsModal}
           onCancel={this.colseTipsModal}
           width='570px'
           maskClosable={true}
           wrapClassName="handleVolumeTips"
         >
           <div className='content'>
             <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
             停止绑定的服务后可
             {
               this.state.dilation
               ? <span>格式化</span>
               : <span>扩容</span>
             }
           </div>
         </Modal>
      </div>
    )
  }
});

MyComponent = Form.create()(MyComponent)

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
    this.refreshstorage = this.refreshstorage.bind(this)
    // this.focus = this.focus.bind(this)
    this.deleteButton = this.deleteButton.bind(this)
    this.getStorageList = this.getStorageList.bind(this)
    this.state = {
      visible: false,
      volumeArray: [],
      currentType: 'ext4',
      size: 512,
      nameError: false,
      nameErrorMsg: '',
      resourceQuotaModal: false,
      resourceQuota: {},
      comfirmRisk: false,
      disableListArray: [],
      ableListArray: [],
      searchInput: '',
      refreshLoading: false,
    }
  }
  getStorageList(query = {}, isFirstLoad){
    const { loadStorageList, cluster, currentImagePool, location } = this.props
    const { searchInput } = this.state
    query = Object.assign({}, mergeQueryFunc(DEFAULT_QUERY, query))
    loadStorageList(currentImagePool, cluster, DEFAULT_QUERY, {
      success: {
        func: () => {
          this.setState({
            selectedRowKeys: [],
            refreshLoading: false,
          })
          if (searchInput) {
            return this.searchByStorageName(query)
          }
          adjustBrowserUrl(location, query, isFirstLoad)
        },
        isAsync: true,
      }
    })
  }
  componentWillMount() {
    this.getStorageList({}, true)
  }

  componentDidMount() {
    this.loadInterval = setInterval(() => {
      const { location } = this.props
      const { query = {} } = location
      this.getStorageList({ page: query.page || 1})
    }, UPDATE_INTERVAL)
  }

  componentWillUnmount() {
    clearInterval(this.loadInterval)
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
    setTimeout(() => {
      document.getElementById('volumeName').focus()
    },100)
    setTimeout(function () {
      if (self.focusInput) {
        self.focusInput.refs.input.focus()
      }
    }, 0)
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
    const { disableListArray } = this.state
    const { location } = this.props
    const { query = {} } = location
    let volumeArray = this.state.ableListArray
    let notification = new NotificationHandler()
    let message = ''
    if(disableListArray.length){
      let serviceStr = disableListArray.map((item, index) => {
        return item.name
      })
      message = '存储卷 ' + serviceStr.join('、') + ' 仍在服务挂载状态，暂时无法删除，请先删除对应服务'
    }
    if (volumeArray && volumeArray.length === 0) {
      notification.info(message)
      this.setState({
        volumeArray: [],
        disableListArray: [],
        ableListArray: [],
        delModal: false,
      })
      return
    }
    volumeArray = volumeArray.map(item => {
      return item.name
    })
    this.setState({
      delModal: false,
    })
    notification.spin("删除存储中")
    this.props.deleteStorage(this.props.currentImagePool, this.props.cluster, { volumes: volumeArray }, {
      success: {
        func: () => {
          notification.close()
          this.getStorageList()
          notification.success('删除存储成功')
          this.setState({
            volumeArray: [],
            disableListArray: [],
            ableListArray: [],
          }, this.getStorageList({ page: query.page || 1 }))
          if(disableListArray.length){
            notification.info(message)
          }
        },
        isAsync: true
      },
      failed: {
        isAsync: true,
        func: err => {
          notification.close()
          const { statusCode, message } = err
          if (statusCode === 409 && message.data && message.data.length > 0) {
            notification.error(`${message.data} 存储删除失败，请稍后重试`)
            this.getStorageList()
            return
          }
          notification.error('删除存储失败')
          this.getStorageList()
        }
      }
    })
  }
  refreshstorage() {
    const { location } = this.props
    const { query = {} } = location
    const { searchInput } = this.state
    this.setState({
      volumeArray: [],
      disableListArray: [],
      ableListArray: [],
      refreshLoading: true,
    }, this.getStorageList({ page: query.page || 1, search: searchInput }))
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
          diskType: 'rbd',
          serviceName: item.serviceName,
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
    return (e, name, diskType, serviceName) => {
      let volumeArray = this.state.volumeArray
      if (e.target.checked) {
        if (findIndex(volumeArray, { name }) >= 0) {
          return
        }
        volumeArray.push({
          name,
          diskType: 'rbd',
          serviceName: serviceName,
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
    let { storageList } = this.props.storageList[this.props.currentImagePool]
    if (this.props.storageList && storageList) {
      storageList.some((item) => {
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
  searchByStorageName(query = { page: 1 }) {
    const { searchStorage, location } = this.props
    const { searchInput } = this.state
    searchStorage(searchInput)
    const mergedQuery = mergeQueryFunc(DEFAULT_QUERY, { page: query.page, search: searchInput})
    adjustBrowserUrl(location, mergedQuery)
  }

  deleteButton(){
    const { volumeArray } = this.state
    const { storageList, currentImagePool } = this.props
    const array = []
    volumeArray.forEach((item, index) => {
      storageList[currentImagePool].storageList.forEach((volumeItem, index) => {
        if(volumeItem.name == item){
          array.push(volumeItem)
        }
      })
    })
    let ableList = []
    let disableList = []
    for(let i=0;i<array.length;i++){
      if(array[i].status == 'used' || array.status == 'pending'){
        disableList.push(array[i])
      } else {
        ableList.push(array[i])
      }
    }
    this.setState({
      delModal: true,
      comfirmRisk: false,
      disableListArray: disableList,
      ableListArray: ableList
    })
  }
  render() {
    const { formatMessage } = this.props.intl
    const { getFieldProps } = this.props.form
    const {
      SnapshotCreate, snapshotDataList, billingEnabled, location, currentCluster,
      storageClassType,
    } = this.props
    const { searchInput, refreshLoading } = this.state
    const { query = {} } = location
    let canCreate = false
    if(storageClassType.private){
      canCreate = storageClassType.private
    }
    const standard = require('../../../configs/constants').STANDARD_MODE
    const mode = require('../../../configs/model').mode
    let title = ''
    if (!canCreate) {
      title = '尚未配置块存储集群，暂不能创建'
    }
    if (!currentCluster.resourcePrice) return <div></div>
    if (!this.props.storageList[this.props.currentImagePool]) return <div></div>
    const storagePrice = currentCluster.resourcePrice.storage /10000
    const hourPrice = parseAmount(this.state.size / 1024 * currentCluster.resourcePrice.storage, 4)
    const countPrice = parseAmount(this.state.size / 1024 * currentCluster.resourcePrice.storage * 24 *30, 4)
    const dataStorage = this.props.storageList[this.props.currentImagePool].storageList
    const confirmRisk = getFieldProps('confirmRisk',{
      valuePropName: 'checked',
      initialValue: true,
      onChange: (value) => {
        this.setState({
          comfirmRisk: value.target.checked
        })
      }
    })
    const storageList = this.props.storageList[this.props.currentImagePool].storageList || []
    return (
      <QueueAnim className="StorageList" type="right">
        <div id="StorageList" key="StorageList">
          <Title title="存储" />
          <div className='alertRow'>
            独享存储，仅支持一个容器实例读写操作；块存储类型的存储卷可创建快照
          </div>
          { mode === standard && <div className='alertRow'>您的存储创建在时速云平台，如果帐户余额不足时，1 周内您可以进行充正，继续使用。如无充正，1 周后资源会被彻底销毁，不可恢复。</div> }
          <div className="operationBox">
            <div className="leftBox">
              <Tooltip title={title} placement="right"><Button type="primary" size="large" disabled={!canCreate} onClick={this.showModal}>
                <i className="fa fa-plus" />创建独享型存储
              </Button></Tooltip>
              <Button className="refreshBtn" size='large' onClick={this.refreshstorage}>
                <i className='fa fa-refresh' />刷新
              </Button>
              <Button type="ghost" className="stopBtn" size="large" onClick={this.deleteButton}
                disabled={!this.state.volumeArray || this.state.volumeArray.length < 1}>
                <i className="fa fa-trash-o" />删除
              </Button>
              <Modal title="删除存储卷操作" visible={this.state.delModal}
                onOk={()=> this.deleteStorage()} onCancel={()=> this.setState({delModal: false})}
                wrapClassName="deleteVolumeModal"
                footer={[
                  <Button size='large' onClick={()=> this.setState({delModal: false})} key="cancel" type='ghost'>取消</Button>,
                  <Button size='large' type="primary" onClick={()=> this.deleteStorage()} key="ok" disabled={this.state.comfirmRisk ? false : true}>确定</Button>
                ]}
              >
                <div className="deleteRow">
                  <div>
                    <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                    确定要删除这 {this.state.volumeArray.length} 个存储吗?
                  </div>
                </div>
                <div>
                  <Form>
                    <Form.Item><Checkbox {...confirmRisk} checked={this.state.comfirmRisk}>了解删除快照风险，确认将存储卷关联快照一并删除。</Checkbox></Form.Item>
                  </Form>
                </div>
              </Modal>
              <Modal
                title='创建独享型存储卷'
                visible={this.state.visible} width={550}
                className='createAppStorageModal'
                onCancel= {() => this.handleCancel() }
                footer={[]}
                >
                 <CreateVolume
                   snapshotRequired={false}
                   scope={this}
                   snapshotDataList={snapshotDataList}
                   storageList={dataStorage}
                   createModal={this.state.visible}
                   loadStorageList={this.getStorageList}
                 />
              </Modal>
            </div>
            <div className="rightBox">
              <div className="littleLeft">
                <i className="fa fa-search cursor" onClick={() => this.searchByStorageName()}/>
              </div>
              <div className="littleRight">
                <Input size="large"
                  style={{ paddingRight: '28px' }}
                  placeholder={formatMessage(messages.inputPlaceholder)}
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={() => this.searchByStorageName()}
                />
              </div>
            </div>
            <div className='total_num'>
              { storageList.length > 0 && <div>共 {storageList.length} 条</div> }
            </div>
            <div className="clearDiv"></div>
          </div>
          <div className="storageBox appBox">
            <MyComponent
              storage={this.props.storageList[this.props.currentImagePool]}
              volumeArray={this.state.volumeArray}
              saveVolumeArray={this.selectItem()}
              cluster={this.props.cluster}
              imagePool={this.props.currentImagePool}
              loadStorageList = {() => this.getStorageList()}
              scope ={ this }
              isFetching={refreshLoading}
              SnapshotCreate={SnapshotCreate}
              snapshotDataList={snapshotDataList}
              delModal={this.state.delModal}
              billingEnabled={billingEnabled}
              location={location}
            />
          </div>
          <ResourceQuotaModal
            visible={this.state.resourceQuotaModal}
            closeModal={() => this.setState({resourceQuotaModal: false})}
            storageResource={this.state.resourceQuota} />
        </div>
      </QueueAnim>
    )
  }
}

Storage = Form.create()(Storage)

Storage.propTypes = {
  intl: PropTypes.object.isRequired,
  loadStorageList: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { cluster } = state.entities.current
  const { billingConfig } = state.entities.loginUser.info
  const { snapshotList } = state.storage
  const snapshotDataList = snapshotList.result || []
  const { enabled: billingEnabled } = billingConfig
  let defaultStorageClassType = {
    private: false,
    share: false,
    host: false,
  }
  if(cluster.storageClassType){
    defaultStorageClassType = cluster.storageClassType
  }
  return {
    storageList: state.storage.storageList || [],
    createStorage: state.storage.createStorage,
    deleteStorage: state.storage.deleteStorage,
    currentImagePool: DEFAULT_IMAGE_POOL,
    cluster: cluster.clusterID,
    currentCluster: cluster,
    snapshotDataList,
    storageClassType: defaultStorageClassType,
    billingEnabled
  }
}

export default connect(mapStateToProps, {
  deleteStorage,
  createStorage,
  loadStorageList,
  SnapshotCreate,
  searchStorage,
})(injectIntl(Storage, {
  withRef: true,
}))
