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
import { injectIntl, FormattedMessage } from 'react-intl'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import remove from 'lodash/remove'
import findIndex from 'lodash/findIndex'
import { loadStorageList, deleteStorage, createStorage, formateStorage, resizeStorage, SnapshotCreate, searchStorage } from '../../actions/storage'
import { DEFAULT_IMAGE_POOL, STORAGENAME_REG_EXP, UPDATE_INTERVAL } from '../../constants'
import './style/storage.less'
import { calcuDate, parseAmount, formatDate, adjustBrowserUrl, mergeQueryFunc } from '../../common/tools'
// import { volNameCheck } from '../../common/naming_validation'
import NotificationHandler from '../../components/Notification'
import ResourceQuotaModal from '../ResourceQuotaModal/Storage'
import CreateVolume from '../StorageModule/CreateVolume'
import { SHOW_BILLING, UPGRADE_EDITION_REQUIRED_CODE } from '../../constants'
// import Title from '../Title'
import StorageIntl from './StorageIntl'
import Title from '../../../src/components/Title'
import ResourceBanner from '../../../src/components/TenantManage/ResourceBanner'
import TimeHover from '@tenx-ui/time-hover/lib'

const RadioGroup = Radio.Group;
let isActing = false


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
    const { formatMessage } = this.props.intl
    const { query = {} } = location
    const type = this.state.modalType
    const self = this
    let notification = new NotificationHandler()
    notification.spin(formatMessage(StorageIntl.execution))
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
              notification.success(formatMessage(StorageIntl.formatSuccess))
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
              notification.error(formatMessage(StorageIntl.formatFailed))
            }
          }
        })
    } else if (type === 'resize') {
      if (this.state.size <= this.state.modalSize) {
        notification.close()
        notification.info(formatMessage(StorageIntl.notchange))
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
              notification.success(formatMessage(StorageIntl.dilationSuccess))
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
              let message = this.formatMessage(res, formatMessage(StorageIntl.dilationFailed))
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
    const { formatMessage } = this.props.intl
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
        modalTitle: formatMessage(StorageIntl.dilation)
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
        modalTitle: formatMessage(StorageIntl.formatting)
      })
    }
  },
  handleConfirmCreateSnapshot(){
    const { form, SnapshotCreate, cluster, intl } = this.props
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
            Noti.success(intl.formatMessage(StorageIntl.createSuccess))
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
              Noti.error(intl.formatMessage(StorageIntl.createFailed))
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
    const { snapshotDataList, intl } = this.props
    const { formatMessage } = intl
    if(!value){
      return callback(formatMessage(StorageIntl.pleaseInput))
    }
    if(value.length > 32){
      return callback(formatMessage(StorageIntl.atMost32Character))
    }
    if(!/^[A-Za-z]{1}/.test(value)){
      return callback(formatMessage(StorageIntl.beginCharacter))
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_-]*$/.test(value)){
      return callback(formatMessage(StorageIntl.ruleName))
    }
    if(value.length < 3){
      return callback(formatMessage(StorageIntl.atMost3Character))
    }
    if(!/^[A-Za-z]{1}[A-Za-z0-9_\-]{1,61}[A-Za-z0-9]$/.test(value)){
      return callback(formatMessage(StorageIntl.endNumber))
    }
    for(let i = 0; i < snapshotDataList.length; i++){
      if(value == snapshotDataList[i].name){
        callback(formatMessage(StorageIntl.nameExists))
        break
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
        <FormattedMessage {...StorageIntl.createing} />
      </span>
      case 'used':
        return <span style={{color: '#f85a5a'}}>
        <i className="fa fa-circle icon-marginRight used"></i>
        <FormattedMessage {...StorageIntl.useing} />
      </span>
      case 'unused':
        return <span style={{color: '#5cb85c'}}>
        <i className="fa fa-circle icon-marginRight no_used"></i>
        <FormattedMessage {...StorageIntl.nouse} />
      </span>
      default:
        return <span style={{color: '#666666'}}>
        <i className="fa fa-circle icon-marginRight unknown"></i>
        <FormattedMessage {...StorageIntl.unknown} />
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
        title: <FormattedMessage {...StorageIntl.storageName} />,
        key: 'name',
        dataIndex: 'name',
        width: '12%',
        className: 'name',
        render: name => <div><span className='text' onClick={() => browserHistory.push(`/app_manage/storage/exclusiveMemory/${this.props.imagePool}/${this.props.cluster}/${name}`)}>{name}</span></div>
      },{
        title: <FormattedMessage {...StorageIntl.status} />,
        key: 'status',
        dataIndex: 'status',
        width: '10%',
        render: status => <div className='status'>{this.formatStatus(status)}</div>
      },{
        title: <FormattedMessage {...StorageIntl.type} />,
        key: 'storageServer',
        dataIndex: 'storageServer',
        width: '18%',
        render: storageServer => <div><FormattedMessage {...StorageIntl.blockStorage} /> ({storageServer || '-'})</div>
      },{
        title: <FormattedMessage {...StorageIntl.size} />,
        key: 'desireSize',
        dataIndex: 'desireSize',
        width: '9%',
        render: (desireSize, record) => {
          const size = record.desireSize || record.totalSize
          return <div>{size == 0 ? '-' : size} M</div>
        }
      },{
        title: <FormattedMessage {...StorageIntl.format} />,
        key: 'format',
        dataIndex: 'format',
        width: '9%'
      },{
        title: <FormattedMessage {...StorageIntl.service} />,
        key: 'deployServiceList',
        dataIndex: 'deployServiceList',
        width: '10%',
        render: deployServiceList => {
          const serviceName = deployServiceList && deployServiceList[0] && deployServiceList[0].serviceName
          if (!serviceName) {
            return <FormattedMessage {...StorageIntl.unService} />
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
        title: <FormattedMessage {...StorageIntl.createTime} />,
        key: 'createTime',
        dataIndex: 'createTime',
        width: '17%',
        sorter: (a, b) => new Date(formatDate(a.createTime)) - new Date(formatDate(b.createTime)),
        render: createTime => <TimeHover time={createTime} />
      },{
        title: <FormattedMessage {...StorageIntl.act} />,
        key: 'handle',
        dataIndex: 'handle',
        width: '15%',
        render: (text, record, index) => {
          const menu = <Menu
            onClick={(e) => { this.showAction(e, 'format', record) } }
          >
            <Menu.Item
              key='resize'
              disabled={record.status == 'pending' || record.status == 'used'}
              title= {<FormattedMessage {...StorageIntl.notDilationTips} />}
            >
              <FormattedMessage {...StorageIntl.dilation} />
            </Menu.Item>
            <Menu.Item key="createSnapshot" disabled={record.status == 'pending'}>
              <FormattedMessage {...StorageIntl.create} /><FormattedMessage {...StorageIntl.snapshot} />
            </Menu.Item>
            <Menu.Item
              key="format"
              disabled={record.status == 'pending' || record.status == 'used'}
              title={<FormattedMessage {...StorageIntl.notFormatTips} />}
            >
              <FormattedMessage {...StorageIntl.formatting} />
            </Menu.Item>
          </Menu>
          return <Dropdown.Button
            overlay={menu}
            type='ghost'
            onClick={() => browserHistory.push(`/app_manage/storage/exclusiveMemory/${imagePool}/${cluster}/${record.name}`)}
            key="dilation"
          >
            <FormattedMessage {...StorageIntl.see} />
          </Dropdown.Button>
        }
      }
    ]
    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: record.status === "used" || (record.status === 'unused' && !isEmpty(record.deployServiceList)),
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
          className="storageModal"
          width={600}
          onCancel= {() => this.cancelModal() }
          footer={[
            <Button key="back" type="ghost" size="large" onClick={(e) => { this.cancelModal() } }><FormattedMessage {...StorageIntl.cancel} /></Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              // disabled={this.state.modalType === 'resize' && resizeConfirmBtnDisabled}
              loading={isActing}
              onClick={(e) => { this.handleSure() } }
            >
              <FormattedMessage {...StorageIntl.btnOk} />
            </Button>
          ]}
         >
          <div className={this.state.modalType === 'resize' ? 'show' : 'hide'}>
            <Row style={{ height: '40px' }}>
              <Col span="3" className="text-center" style={{ lineHeight: '30px' }}><FormattedMessage {...StorageIntl.name} /></Col>
              <Col span="12"><input type="text" className="ant-input" value={this.state.modalName} disabled /></Col>
            </Row>
            <Row style={{ height: '40px' }}>
              <Col span="3" className="text-center" style={{ lineHeight: '30px' }}>{formatMessage(StorageIntl.size)}</Col>
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
              <FormattedMessage {...StorageIntl.storage} />{hourPrice.unit == '￥'? '￥': ''}{ resourcePrice.storage /10000 } {hourPrice.unit == '￥'? '': ' T'}/(GB*<FormattedMessage {...StorageIntl.hour} />)
              </div>
              <div className="price-unit">
                <p><FormattedMessage {...StorageIntl.count} />：<span className="unit">{hourPrice.unit == '￥'? '￥': ''}</span><span className="unit blod"> { hourPrice.amount }{hourPrice.unit == '￥'? '': ' T'}/<FormattedMessage {...StorageIntl.hour} /></span></p>
                <p><span className="unit">（<FormattedMessage {...StorageIntl.about} />：</span><span className="unit"> { countPrice.fullAmount }/<FormattedMessage {...StorageIntl.month} />）</span></p>
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
                  <FormattedMessage {...StorageIntl.afterDilationTips} />&nbsp;
                    <a target="_blank" href={`/app_manage/service?serName=${currentVolumeServiceName}`}>
                    {currentVolumeServiceName}
                    </a>
                  &nbsp;
                </Checkbox>
              </div>
            }
          </div>
          <div className={this.state.modalType === 'format' ? 'show' : 'hide'}>
            <div style={{ height: '30px' }}><FormattedMessage {...StorageIntl.areyousure} /> {this.state.modalName} ？
              <span style={{ color: 'red' }}>(<FormattedMessage {...StorageIntl.afterFormetTips} />)。</span>
            </div>
            <Col span="6" style={{ lineHeight: '30px' }}><FormattedMessage {...StorageIntl.fileFormat} />：</Col>
            <RadioGroup defaultValue='ext4' value={this.state.formateType} size="large" onChange={(e) => this.changeType(e)}>
              <Radio prefixCls="ant-radio-button" value="ext4">ext4</Radio>
              <Radio prefixCls="ant-radio-button" value="xfs">xfs</Radio>

            </RadioGroup>
          </div>
        </Modal>

        <Modal
          title={<span><FormattedMessage {...StorageIntl.create}/><FormattedMessage {...StorageIntl.snapshot} /></span>}
          visible={this.state.createSnapModal}
          closable={true}
          onOk={this.handleConfirmCreateSnapshot}
          onCancel={this.handleCancelCreateSnapshot}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmCreateSnapshotLoading}
          wrapClassName="CreateSnapshotModal"
          okText={<span><FormattedMessage {...StorageIntl.create}/><FormattedMessage {...StorageIntl.snapshot} /></span>}
        >
          <div>
            <div className='header'>
              <div className='leftbox'>
                <div className="item"><FormattedMessage {...StorageIntl.storage}/><FormattedMessage {...StorageIntl.name}/></div>
                <div className="item"><FormattedMessage {...StorageIntl.storage}/><FormattedMessage {...StorageIntl.size}/></div>
                <div className="item"><FormattedMessage {...StorageIntl.storage}/><FormattedMessage {...StorageIntl.format}/></div>
                <div className="item"><FormattedMessage {...StorageIntl.snapshot}/><FormattedMessage {...StorageIntl.name}/></div>
              </div>
              <div className="rightbox">
                <div className='item'>{this.state.volumeName}</div>
                <div className="item">{this.state.volumeSize} MB</div>
                <div className="item">{this.state.volumeFormat}</div>
                <div className='item'>
                  <Form.Item>
                    <Input
                      {...snapshotName}
                      placeholder={formatMessage(StorageIntl.pleaseInput)}
                      onPressEnter={this.handleConfirmCreateSnapshot}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className='footer'>
              <div className="title"><FormattedMessage {...StorageIntl.createModalTops} />：</div>
              <div className="item"><span className='num'>1</span><FormattedMessage {...StorageIntl.dbService} />：Flush & Lock Table</div>
              <div className="item"><span className='num'>2</span><FormattedMessage {...StorageIntl.createMOdalTips} /></div>
            </div>
          </div>
        </Modal>

        <Modal
          title={<span><FormattedMessage{...StorageIntl.create} /><FormattedMessage {...StorageIntl.snapshot} /></span>}
          visible={this.state.CreateSnapshotSuccessModal}
          closable={true}
          onOk={this.handleConfirmCreateSnapshotSuccess}
          onCancel={this.handleCancelCreateSnapshotSuccess}
          width='570px'
          maskClosable={false}
          wrapClassName="CreateSnapshotSccessModal"
          okText={<FormattedMessage{...StorageIntl.see} />}
          cancelText={<FormattedMessage{...StorageIntl.close} />}
        >
          <div className='container'>
            <div className='header'>
              <div>
                <Icon type="check-circle-o" className='icon'/>
              </div>
              <div className='tips'>
                <FormattedMessage{...StorageIntl.actionSuccess} />
              </div>
            </div>
            <div><FormattedMessage{...StorageIntl.snapshot} /><FormattedMessage{...StorageIntl.name} /> {this.state.snapshotName}</div>
          </div>
        </Modal>

         <Modal
           title={<FormattedMessage{...StorageIntl.tips} />}
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
             <FormattedMessage{...StorageIntl.stopBindTips} />
             {
               this.state.dilation
               ? <span><FormattedMessage{...StorageIntl.formatting} /></span>
               : <span><FormattedMessage{...StorageIntl.dilation} /></span>
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
    const { location,intl } = this.props
    const { formatMessage } = intl
    const { query = {} } = location
    let volumeArray = this.state.ableListArray
    let notification = new NotificationHandler()
    let message = ''
    if(disableListArray.length){
      let serviceStr = disableListArray.map((item, index) => {
        return item.name
      })
      message = formatMessage(StorageIntl.storageVolume) + serviceStr.join('、') + formatMessage(StorageIntl.deleteVolume)
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
    notification.spin(formatMessage(StorageIntl.deleteing))
    this.props.deleteStorage(this.props.currentImagePool, this.props.cluster, { volumes: volumeArray }, {
      success: {
        func: () => {
          notification.close()
          this.getStorageList()
          notification.success(formatMessage(StorageIntl.deleteSuccess))
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
            notification.error(`${message.data} `+ formatMessage(StorageIntl.deleteFailed))
            this.getStorageList()
            return
          }
          notification.error(formatMessage(StorageIntl.deleteFailed))
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
      // volumeArray: [],
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
      title = <FormattedMessage{...StorageIntl.configTips} />
    }
    if (!currentCluster.resourcePrice) return <div></div>
    if (!this.props.storageList[this.props.currentImagePool]) return <div></div>
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
        <Title title={"独享型存储"}/>
          <ResourceBanner resourceType="volume" />
          <div className='alertRow'>
            <FormattedMessage{...StorageIntl.exclusiveTips} />
          </div>
          { mode === standard && <div className='alertRow'><FormattedMessage{...StorageIntl.creditLowTips} /></div> }
          <div className="operationBox">
            <div className="leftBox">
              <Tooltip title={title} placement="right"><Button type="primary" size="large" disabled={!canCreate} onClick={this.showModal}>
                <i className="fa fa-plus" /><FormattedMessage{...StorageIntl.create} /><FormattedMessage{...StorageIntl.exclusiveStorage} />
              </Button></Tooltip>
              <Button className="refreshBtn" size='large' onClick={this.refreshstorage}>
                <i className='fa fa-refresh' /><FormattedMessage{...StorageIntl.refresh} />
              </Button>
              <Button type="ghost" className="stopBtn" size="large" onClick={this.deleteButton}
                disabled={!this.state.volumeArray || this.state.volumeArray.length < 1}>
                <i className="fa fa-trash-o" /><FormattedMessage{...StorageIntl.delete} />
              </Button>
              <Modal title={<FormattedMessage{...StorageIntl.deleteAct} />} visible={this.state.delModal}
                onOk={()=> this.deleteStorage()} onCancel={()=> this.setState({delModal: false})}
                wrapClassName="deleteVolumeModal"
                footer={[
                  <Button size='large' onClick={()=> this.setState({delModal: false})} key="cancel" type='ghost'><FormattedMessage{...StorageIntl.cancel} /></Button>,
                  <Button size='large' type="primary" onClick={()=> this.deleteStorage()} key="ok" disabled={this.state.comfirmRisk ? false : true}>{<FormattedMessage{...StorageIntl.btnOk} />}</Button>
                ]}
              >
                <div className="deleteRow">
                  <div>
                    <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                    <FormattedMessage{...StorageIntl.sureDelete} />
                    <span style={{ padding: '0 3px' }}> {this.state.volumeArray.length} </span>
                    <FormattedMessage{...StorageIntl.aStorage} />？
                  </div>
                </div>
                <div>
                  <Form>
                    <Form.Item><Checkbox {...confirmRisk} checked={this.state.comfirmRisk}><FormattedMessage{...StorageIntl.deleteTips} /> </Checkbox></Form.Item>
                  </Form>
                </div>
              </Modal>
              <Modal
                title={<span><FormattedMessage{...StorageIntl.create} /><FormattedMessage{...StorageIntl.exclusiveStorage} /></span>}
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
                  placeholder={formatMessage(StorageIntl.pleaseStorageName)}
                  onChange={e => this.setState({ searchInput: e.target.value })}
                  onPressEnter={() => this.searchByStorageName()}
                />
              </div>
            </div>
            <div className='total_num'>
              { storageList.length > 0 && <div><FormattedMessage{...StorageIntl.totalItems} /> {storageList.length} <FormattedMessage{...StorageIntl.item} /></div> }
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
