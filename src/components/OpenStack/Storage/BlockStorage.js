/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Object store component
 *
 * v0.1 - 2017-7-18
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Button, Input, Table, Modal, Form, Select, Card, Dropdown, Menu, InputNumber, Slider } from 'antd'
import { connect } from 'react-redux'
import './style/BlockStorage.less'
import {
  getBlockStorageList,
  createBlockStorage,
  attachBlockStorage,
  resizeBlockStorage,
  snapshotBlockStorage,
  deleteBlockStorage,
  detachBlockStorage,
  getVolumeType,
} from '../../../actions/openstack/openstack_storage'
import { getSnapshotList } from '../../../actions/openstack/snapshot'

import { getAZList, getVMList } from '../../../actions/openstack/calculation_service'
import NotificationHandler from '../../../common/notification_handler'
import { formatDate } from  '../../../common/tools'
// import { STORAGENAME_REG_EXP } from '../../../constants/index'
const Noti = new NotificationHandler()
const Option = Select.Option

class BlockStorage extends Component {
  constructor(props) {
    super(props)
    this.openCreateModal = this.openCreateModal.bind(this)
    // this.selectTableRow = this.selectTableRow.bind(this)
    this.confirmCreate = this.confirmCreate.bind(this)
    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.comfirmMount = this.comfirmMount.bind(this)
    this.comfirmUninstall = this.comfirmUninstall.bind(this)
    this.comfirmCapacity = this.comfirmCapacity.bind(this)
    this.comfirmSnapshot = this.comfirmSnapshot.bind(this)
    this.refreshLoadBlockStorage = this.refreshLoadBlockStorage.bind(this)
    this.renderBlockStorageStatus = this.renderBlockStorageStatus.bind(this)
    this.renderAvailabilityZoneOption = this.renderAvailabilityZoneOption.bind(this)
    this.renderHostListOption = this.renderHostListOption.bind(this)
    this.changeBlockStorageSize = this.changeBlockStorageSize.bind(this)
    this.changeBlockStorageCapacitySize = this.changeBlockStorageCapacitySize.bind(this)
    this.searchInput = this.searchInput.bind(this)
    this.searchChange = this.searchChange.bind(this)
    this.state = {
      createVisible: false,
      confirmLoading: false,
      currentBlockStorage: {},
      mountVisible: false,
      uninstallVisible: false,
      capacityVisible: false,
      freeVisible: false,
      snapshotVisible: false,
      currentHandle: '',
      currentTitle: '',
      tableDataSource: [],
      size: 1,
      currentSize: 1,
      minSize: 1,
      searchValue: '',
      snapshotsList:[]
    }
  }

  componentWillMount() {
    this.loadData()
  }
  loadData() {
    const { getAZList, getVMList, getVolumeType } = this.props
    getAZList({
      project: this.state.currentProject
    })
    getVMList({
      project: this.state.currentProject
    })
    this.refreshLoadBlockStorage()
    getVolumeType({
      project: this.state.currentProject
    })
  }

  selectTableRow(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    })
  }

  openCreateModal() {
    const { form } = this.props
    form.resetFields()
    this.setState({
      createVisible: true,
      confirmLoading: false,
      size: 1,
    })
  }

  refreshLoadBlockStorage() {
    const { getBlockStorageList } = this.props
    getBlockStorageList({
      project: this.state.currentProject
    },{
      success: {
        func: (res) => {
          this.setState({
            tableDataSource: res.volumes
          })
        }
      },
      finally: {
        func: () => {
          this.setState({
            searchValue: '',
          })
        }
      }
    })
  }

  searchChange(e){
    const value = e.target.value
    this.setState({
      searchValue: value
    })
  }

  searchInput() {
    if(!this.state.currentProject) {
      return
    }
    const { blockStorageList } = this.props
    const { searchValue } = this.state

    if(!searchValue){
      this.setState({
        tableDataSource: blockStorageList.result
      })
      return
    }
    const newList = blockStorageList.result.filter( list => {
      const search = new RegExp(searchValue)
      if (search.test(list.name)) {
        return true
      }
      return false
    })
    this.setState({
      tableDataSource: newList
    })
  }

  changeBlockStorageSize(value){
    this.setState({
      size: value
    })
  }

  confirmCreate() {
    if(!this.state.currentProject) {
      return
    }
    const { form, createBlockStorage } = this.props

    this.setState({
      confirmLoading: true
    })
    const validataArray = [
      'create_display_name',
      'create_volume_type',
      'create_display_description'
    ]
    form.validateFields(validataArray, (errors, values) => {
      if (!!errors) {
        this.setState({
          confirmLoading: false
        })
        return
      }
      let body = {
        volume_type: values.create_volume_type,
        display_name: values.create_display_name,
        display_description: values.create_display_description,
        size: this.state.size,
      }
      createBlockStorage(body, {
        project: this.state.currentProject
      }, {
        success: {
          func: () => {
            Noti.success('创建成功')
            this.refreshLoadBlockStorage()
            this.setState({
              confirmLoading: false,
              createVisible: false,
            })
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            this.setState({
              confirmLoading: false,
            })
            let message =''
            if(res.message) {
              try {
                const keys = Object.getOwnPropertyNames(res.message)
                message = res.message[keys[0]].message
              } catch (err) {
                // message = ''
              }
            }
            Noti.error('创建失败',message)
          }
        }
      })
    })
  }

  handleMenuClick(item, obj) {
    if(!this.state.currentProject) {
      return
    }
    const { form } = this.props
    form.resetFields()
    let key = obj.key
    this.setState({
      currentBlockStorage: item,
      confirmLoading: false,
    })
    switch (key) {
      case 'uninstall':
        if(item.attachments && !item.attachments.length){
          Modal.info({
            title: '提示',
            content: (
              <div>
                {item.name} 未挂载，无须卸载。
              </div>
            ),
            onOk() {},
          });
          return
        }
        return this.setState({
          uninstallVisible: true,
          currentHandle: 'uninstall',
          currentTitle: '卸载',
        })
      case 'capacity':
        return this.setState({
          capacityVisible: true,
          currentSize: item.size,
          minSize: item.size,
        })
      case 'free':
        return this.setState({
          uninstallVisible: true,
          currentHandle: 'free',
          currentTitle: '释放',
        })
      case 'snapshot':
        return this.setState({
          snapshotVisible: true
        },()=> {
          this.loadSnapshot()
        })
      default:
        return
    }
  }
  loadSnapshot() {
    const { getSnapshotList } = this.props
    getSnapshotList({project: this.state.currentProject}, {
      success: {
        func: (res) => {
          let snapshotsList = res.snapshots || []
          this.setState({ snapshotsList })
        }
      }
    })
  }
  changeBlockStorageCapacitySize(value){
    if(!this.state.currentProject) {
      return
    }
    this.setState({
      currentSize: value
    })
  }

  mountBlockStorage(item) {
    if(!this.state.currentProject) {
      return
    }
    const { form } = this.props
    if(item.attachments && item.attachments.length){
      Modal.info({
        title: '提示',
        content: (
          <div>
            {item.name} 已挂载 {item.hostName},不能重复挂载。
          </div>
        ),
        onOk() {},
      });
      return
    }
    form.resetFields()
    this.setState({
      mountVisible: true,
      confirmLoading: false,
      currentBlockStorage: item,
    })
  }

  comfirmMount() {
    if(!this.state.currentProject) {
      return
    }
    const { form, attachBlockStorage } = this.props
    const { currentBlockStorage } = this.state
    this.setState({
      confirmLoading: true,
    })
    const validataArray = [
      'willMount_block_storage_name',
      //'mount_belong_area',
      'mount_cloud_host',
      //'mount_free_behavior'
    ]
    form.validateFields(validataArray, (errors, values) => {
      if (!!errors) {
        this.setState({
          confirmLoading: false
        })
        return
      }
      let volumes ={
        id: currentBlockStorage.id
      }
      let body = {
        instance_uuid: values.mount_cloud_host,
      }
      const notificat = new NotificationHandler()
      attachBlockStorage(volumes, body, {
        project: this.state.currentProject
      },{
        success: {
          func: () => {
            this.setState({
              confirmLoading: false,
              mountVisible: false,
            })
            notificat.success('挂载成功')
            this.refreshLoadBlockStorage()
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            this.setState({
              confirmLoading: false,
            })
            let message = ''
            if(res.message) {
              try {
                const keys = Object.getOwnPropertyNames(res.message)
                message = res.message[keys[0]].message
              } catch (err) {
                // message = '请重试'
              }
            }
            notificat.success('挂载失败',message)
          }
        }
      })
    })
  }

  comfirmUninstall() {
    if(!this.state.currentProject) {
      return
    }
    const { currentTitle, currentBlockStorage } = this.state
    const { deleteBlockStorage, detachBlockStorage } = this.props
    this.setState({
      confirmLoading: true
    })

    if(currentTitle == '释放'){
      let body = {
        id: currentBlockStorage.id
      }
      deleteBlockStorage(body,{
        project: this.state.currentProject
      }, {
        success: {
          func: () => {
            Noti.success('释放成功')
            setTimeout(()=> {this.refreshLoadBlockStorage()},500)
            this.setState({
              confirmLoading: false,
              uninstallVisible: false,
            })
          },
        },
        failed: {
          func: (res) => {
            let message = '释放失败，请重试'
            this.setState({
              confirmLoading: false,
            })
            if(res.message) {
              try {
                const keys = Object.getOwnPropertyNames(res.message)
                const initalMessage = res.message[keys[0]].message
                const statusErrorMessage = `Invalid volume: Volume status must be available or error or error_restoring or error_extending and must not be migrating, attached, belong to a consistency group or have snapshots.`
                message = res.message[keys[0]].message
                if(initalMessage ==  statusErrorMessage){
                  message = `无效存储卷:存储卷状态必须为可用、错误、错误恢复或错误扩展，必须不迁移、附加、属于一致性组或有快照。`
                }
              } catch (err) {
                message = '释放失败，请重试'
              }
            }
            Noti.error(message)
          }
        }
      })
      return
    }
    let volumes = {
      id: currentBlockStorage.id
    }
    let body = {
      attach_id: currentBlockStorage.attachments[0].attachmentId,
      instance_uuid: currentBlockStorage.attachments[0].serverId
    }
    detachBlockStorage(volumes, body, {
      project: this.state.currentProject
    }, {
      success: {
        func: () => {
          Noti.success('卸载成功')
          this.refreshLoadBlockStorage()
          this.setState({
            confirmLoading: false,
            uninstallVisible: false,
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let message = '卸载失败，请重试'
          this.setState({
            confirmLoading: false
          })
          if(res.message) {
            try {
              const keys = Object.getOwnPropertyNames(res.message)
              message = res.message[keys[0]].message
            } catch (err) {
              message = '卸载失败，请重试'
            }
          }
          Noti.error(message)
        }
      }
    })
  }

  comfirmCapacity() {
    if(!this.state.currentProject) {
      return
    }
    const { form, resizeBlockStorage } = this.props
    const { currentBlockStorage } = this.state
    this.setState({
      confirmLoading: true
    })

    let validataArray = [
      'capacity_cloud_host_disk',
      //'capacity_belong_area',
      //'capacity_cloud_host',
      //'capacity_currebt_capacity',
      //'capacity_later_capacity',
    ]
    form.validateFields(validataArray, (errors, values) => {
      if (!!errors) {
        this.setState({
          confirmLoading: false
        })
        return
      }
      let volumes ={
        id: currentBlockStorage.id
      }
      let body = {
        size: this.state.currentSize,
      }
      resizeBlockStorage(volumes, body, {
        project: this.state.currentProject
      }, {
        success: {
          func: () => {
            Noti.success('扩容成功')
            this.refreshLoadBlockStorage()
            this.setState({
              confirmLoading: false,
              capacityVisible: false,
            })
          },
          isAsync: true,
        },
        failed: {
          func: (res) => {
            let message = '扩容失败，请重试'
            this.setState({
              confirmLoading: false,
            })
            if(res.message) {
              try {
                const keys = Object.getOwnPropertyNames(res.message)
                message = res.message[keys[0]].message
              } catch (err) {
                message = '扩容失败，请重试'
              }
            }
            Noti.error(message)
          }
        }
      })
    })
  }

  comfirmSnapshot() {
    if(!this.state.currentProject) {
      return
    }
    const { form, snapshotBlockStorage } = this.props
    const { currentBlockStorage } = this.state
    this.setState({
      confirmLoading: true
    })

    let validataArray = [
      //'snapshot_app',
      //'snapshot_cloud_host',
      //'snapshot_cloud_disk_id',
      'snapshot_name',
      'snapshot_desc',
    ]
    form.validateFields(validataArray, (errors, values) => {
      if (!!errors) {
        this.setState({
          confirmLoading: false
        })
        return
      }
      let body ={
        'volume_id': currentBlockStorage.id,
        'name': values.snapshot_name,
        'description': values.description,
      }
      snapshotBlockStorage(body,{
        project: this.state.currentProject
      },{
        success: {
          func: () => {
            Noti.success('创建快照成功')
            this.setState({
              confirmLoading: false,
              snapshotVisible: false,
            })
          }
        },
        failed: {
          func: (res) => {
            let message = '创建快照失败，请重试'
            this.setState({
              confirmLoading: false,
            })
            if(res.message) {
              try {
                const keys = Object.getOwnPropertyNames(res.message)
                message = res.message[keys[0]].message
              } catch (err) {
                message = '创建快照失败，请重试'
              }
            }
            Noti.error(message)
          }
        }
      })
    })
  }

  renderUninstallOrFreeText(currentHandle) {
    const { currentBlockStorage } = this.state
    if (currentHandle == 'uninstall') {
      let serverName = ''
      if(currentBlockStorage && currentBlockStorage.attachments.length){
        serverName = currentBlockStorage.attachments[0].serverName
      }
      return <span>您确定从云主机 <span style={{color: '#2DB7F5'}}>{ serverName }</span> 上卸载云硬盘 <span style={{color: '#2DB7F5'}}>{currentBlockStorage.name}</span> 吗？ </span>
    }
    if (currentHandle == 'free') {
      return <span>您确认释放云硬盘 <span style={{color: '#2DB7F5'}}>{currentBlockStorage.name}</span> 吗？云硬盘释放后数据将永久丢失，无法找回！</span>
    }
    return null
  }

  renderBlockStorageStatus(status){
    switch(status){
      case 'available':
        return <span>可用</span>
      case 'in-use':
        return <span>使用中</span>
      case 'attaching':
        return <span>挂载中</span>
      case 'detaching':
        return <span>卸载中</span>
      case 'deleting':
        return <span>释放中</span>
      case 'error':
        return <span>错误</span>
      case 'creating':
        return '创建中'
      default:
        return <span>暂无</span>
    }
  }

  renderHostListOption(){
    const { hostList } = this.props
    if(!hostList){
      return null
    }
    let hostlist = hostList.map((item, index) => {
      return <Option value={item.id} key={'hostList' + index} >{item.name}</Option>
    })
    return hostlist
  }

  getVolumeType(text, record) {
      if(text) {
        return text
      }
      let type = record["osVolHostAttr:host"]
      if(type) {
        type = type.split('#')[1]
      }
      return type
  }
  getVT() {
    const { vt } = this.props
    if(vt.isFetching == true) {
      return []
    }
    if(!vt.result) {
      return []
    }
    return vt.result.volumeTypes.map(item => {
      return <Option key={item.name} value={item.name}>{item.name}</Option>
    })
  }

  renderAvailabilityZoneOption(){
    const { azList } = this.props
    //let option = azList.map((item, index) => {
    //  return <Option value={item.zoneName} key={'AvailabilityZone' + index}>{item.zoneName}</Option>
    //})
    let option = []
    for(let i = 0; i < azList.length; i++){
        option.push(<Option value={azList[i].zoneName} key={'AvailabilityZone' + i}>{azList[i].zoneName}</Option>)
    }
    return option
  }
  changeProejct(value) {
    this.setState({
      currentProject: value
    })
    setTimeout(() => {
      this.loadData()
    }, 0)
  }
  render() {
    const { tableDataSource, snapshotsList } = this.state
    const { blockStorageList } = this.props
    const isFetching = blockStorageList.isFetching
    const { form } = this.props
    const { getFieldProps } = form
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.selectTableRow
    // }
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    }

    const formItemLayouts = {
      labelCol: { span: 4 },
      wrapperCol: { span: 17 }
    }

    const menu = tableDataSource.map((item, index) => {
      const disabled= item.status == 'in-use' ? true : false
      return <Menu key={'block_storage' + index} style={{ width: '80px' }} onClick={this.handleMenuClick.bind(this, item)}>
        <Menu.Item key='uninstall' disabled={item.status == 'available'}>卸载</Menu.Item>
        <Menu.Item key='capacity' disabled={item.status == 'in-use'}>扩容</Menu.Item>
        <Menu.Item key='free' disabled={item.status == 'in-use'}>释放</Menu.Item>
        <Menu.Item key='snapshot' disabled={item.status == 'in-use'}>快照</Menu.Item>
      </Menu>
    })

    const columns = [
      {
        title: '云硬盘ID/名称',
        dataIndex: 'name',
        width: '20%',
      }, {
        title: '可卸载',
        dataIndex: 'bytes',
        width: '10%',
        render: (text) => <div>支持</div>
      }, {
        title: '类型',
        width: '10%',
        dataIndex: "volumeType",
        render: (text, record) => <div>{this.getVolumeType(text, record)}</div>
      }, {
        title: '规格',
        dataIndex: 'size',
        width: '10%',
        render: (text) => <div>{text} G</div>
      }, {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: '20%',
        render: (text) => <div>{formatDate(text)}</div>
      }, {
        title: '状态',
        dataIndex: 'status',
        width: '15%',
        render: (text) => <div>{ this.renderBlockStorageStatus(text) }</div>
      }, {
        title: '操作',
        width: '15%',
        render: (text, record, index) => <div>
          <Dropdown.Button overlay={menu[index]} type="ghost" trigger={['click']} onClick={this.mountBlockStorage.bind(this, record)}>
            挂载
          </Dropdown.Button>
        </div>
      }
    ]

    const blockStorageProps = getFieldProps('create_display_name', {
      rules: [{
        validator: function(rule, value, callback) {
          if(!value) {
             return callback('云硬盘名称不能为空')
          }
          if (value.length <3 || value.length > 32) {
            return callback('长度为3~32位字符')
          }
          const result = tableDataSource.some(item => item.name == value)
          if(result) {
            return callback('云硬盘名称已经存在')
          }
          if(!/^[a-zA-Z0-9]([a-zA-Z0-9_]*[a-zA-Z0-9])$/.test(value)) {
            return callback('字母数字开头结尾，字母、数字、下划线组成，3到32位')
          }
          return callback()
        }
      }]
    })
    const blockStorageVolumeType = getFieldProps('create_volume_type', {
      rules: [{ required: true, message: '云硬盘类型不能为空' }]
    })
    const blockStorageDescProps = getFieldProps('create_display_description',{
      rules: [{
        validator: function(rule, value, callback){
          if (!value) {
            return callback()
          }
          var reg = new RegExp('^[A-Za-z0-9_]{1}[A-Za-z0-9_]*$')
          if(!reg.test(value)){
            return callback("由字母、数字、下划线_组成")
          }
          return callback()
        }
      },{max:60, message:'最多可填写60个字符'}]
    })

    const willMountBlockStorageProps = getFieldProps('willMount_block_storage_name', {
      rules: [{ required: true, message: '待挂载硬盘名称不能为空' }],
      initialValue: this.state.currentBlockStorage || undefined,
    })
    const mountCloudHost = getFieldProps('mount_cloud_host', {
      rules: [{ required: true, message: '请选择云主机' }]
    })

    const capacityCloudHostDiskProps = getFieldProps('capacity_cloud_host_disk', {
      rules: [{ required: true }],
      initialValue: this.state.currentBlockStorage.name || undefined,
    })

    const snapshotCloudDiskName = getFieldProps('capacity_cloud_host_disk', {
      rules: [{ required: true }],
      initialValue: this.state.currentBlockStorage.name || undefined,
    })

    const snapshotName = getFieldProps('snapshot_name', {
      rules: [{
        validator:function(rule,value,callback) {
          if(!value) {
            return callback('快照名称不能为空')
         }
         if (value.length <3 || value.length > 32) {
           return callback('长度为3~32位字符')
         }
         const result = snapshotsList.some(item => item.name == value)
         if(result) {
           return callback('快照名称已经存在')
         }
         if(!/^[a-zA-Z0-9]([a-zA-Z0-9_]*[a-zA-Z0-9])$/.test(value)) {
           return callback('字母数字开头结尾，字母、数字、下划线组成，3到32位')
         }
         return callback()
        }
      }]
    })
    const snapshotDesc = getFieldProps('snapshot_desc')
    return (
      <div id='block_storage'>
        <div className='handleBox'>

          <Button type="primary" className='buttonMarign' size="large" onClick={this.openCreateModal}>
            <i className="fa fa-plus" aria-hidden="true"></i> 创建云硬盘
            </Button>
          <Button className='buttonMarign' size="large" onClick={this.refreshLoadBlockStorage}>
            <i className="fa fa-refresh" aria-hidden="true"></i> 刷新
            </Button>

          <div className='searchDiv'>
            <Input placeholder='请输入云硬盘ID/名搜索' onPressEnter={this.searchInput} className='searchBox' size="large" onChange={this.searchChange} value={this.state.searchValue} id="blockInput"/>
            <i className="fa fa-search searchIcon" aria-hidden="true" onClick={this.searchInput}></i>
          </div>
          {
            tableDataSource.length
              ? <div className='totleNum'>
                共计 {tableDataSource.length} 条
              </div>
              : null
          }
        </div>
        <div className='tableBox'>
          <Card className="tabCard">
            <Table
              columns={columns}
              dataSource={tableDataSource}
              pagination={{ simple: true }}
              loading={isFetching}
              className="strategyTable"
            />
          </Card>
        </div>
        <Modal
          title="创建云硬盘"
          visible={this.state.createVisible}
          closable={true}
          onOk={this.confirmCreate}
          onCancel={() => this.setState({ createVisible: false })}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
          wrapClassName="creata_block_storage"
        >
          <Form>
            <div className='title'>
              <div className='content'>基本信息</div>
            </div>
            <Form.Item
              {...formItemLayouts}
              label="云硬盘名称"
              className='item'
            >
              <Input placeholder='请输入云硬盘名称' {...blockStorageProps   } />
            </Form.Item>
            <Form.Item
              {...formItemLayouts}
              label="云硬盘类型"
              className='item'
            >
              <Select
                placeholder='请选择云硬盘类型'
                {...blockStorageVolumeType}
              >
              {this.getVT()}

              </Select>
            </Form.Item>
            <Form.Item
              {...formItemLayouts}
              label="描述"
              className='item'
            >
              <Input placeholder='选填' {...blockStorageDescProps}/>
            </Form.Item>
            <Form.Item
              {...formItemLayouts}
              label="大小"
              className='item'
            >
              <Slider min={1} max={1000} value={this.state.size} onChange={this.changeBlockStorageSize} style={{width: '200px'}}/>
              <InputNumber min={1} max={1000} onChange={this.changeBlockStorageSize} value={this.state.size} className='inputNumberSize'/> GB
            </Form.Item>

          </Form>
        </Modal>

        <Modal
          title="挂载云硬盘"
          visible={this.state.mountVisible}
          closable={true}
          onOk={this.comfirmMount}
          onCancel={() => this.setState({ mountVisible: false })}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
          wrapClassName="creata_block_storage"
        >
          <Form>
            <Form.Item
              {...formItemLayout}
              label="待挂载云硬盘"
            >
              <Input placeholder='请输入待挂载硬盘名称' {...willMountBlockStorageProps} disabled={true} value={this.state.currentBlockStorage.name}/>
            </Form.Item>

            <Form.Item
              {...formItemLayout}
              label="云主机"
              className='last_item'
            >
              <Select
                placeholder='请选择云主机'
                {...mountCloudHost}
              >
                { this.renderHostListOption() }
              </Select>
              {/*<Button type='primary' className='create_button'>选择</Button>*/}
            </Form.Item>

          </Form>
        </Modal>

        <Modal
          title={this.state.currentTitle + "云硬盘"}
          visible={this.state.uninstallVisible}
          closable={true}
          onOk={this.comfirmUninstall}
          onCancel={() => this.setState({ uninstallVisible: false })}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
          wrapClassName="uninstall_block_storage"
        >
          <div style={{wordBreak: 'break-all'}}>
            {this.renderUninstallOrFreeText(this.state.currentHandle)}
          </div>
        </Modal>

        <Modal
          title="云硬盘扩容"
          visible={this.state.capacityVisible}
          closable={true}
          onOk={this.comfirmCapacity}
          onCancel={() => this.setState({ capacityVisible: false })}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
          wrapClassName="creata_block_storage"
        >
          <Form>
            <Form.Item
              {...formItemLayouts}
              label={<span>待扩容云硬盘</span>}
            >
              <Input disabled={true} {...snapshotCloudDiskName} />
            </Form.Item>
            <Form.Item
              {...formItemLayouts}
              label="扩容后的容量"
            >
              <Slider
                min={this.state.minSize}
                max={1000}
                defaultValue={this.state.minSize}
                value={this.state.currentSize}
                onChange={this.changeBlockStorageCapacitySize}
              />
              <InputNumber
                min={this.state.minSize}
                max={1000}
                defaultValue={this.state.minSize}
                onChange={this.changeBlockStorageCapacitySize}
                value={this.state.currentSize}
                className='inputNumberSize'
              /> GB
              {/*<Input placeholder='请输入扩容后的容量'*/}
                {/*{...capacityLaterCapacity} />*/}
            </Form.Item>

          </Form>
        </Modal>

        <Modal
          title="创建快照"
          visible={this.state.snapshotVisible}
          closable={true}
          onOk={this.comfirmSnapshot}
          onCancel={() => this.setState({ snapshotVisible: false })}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.confirmLoading}
          wrapClassName="creata_block_storage"
        >
          <Form>

           <Form.Item
              {...formItemLayouts}
              label={<span>云硬盘</span>}
            >
              <Input disabled={true} {...capacityCloudHostDiskProps} />
            </Form.Item>
            <Form.Item
              {...formItemLayouts}
              label="快照名称"
            >
              <Input placeholder='请输入快照名称' {...snapshotName} />
            </Form.Item>
            <Form.Item
              {...formItemLayouts}
              label={<span>描述</span>}
            >
              <Input placeholder='选填' {...snapshotDesc}/>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}

BlockStorage = Form.create()(BlockStorage)

function mapStateToProp(state, props) {
  const { openstack_storage, openstack } = state
  let blockStorageList = {
    isFetching: true,
    result: []
  }
  let azList = []
  let hostList = []
  let vt = {}
  if(openstack.az && openstack.az.result && openstack.az.result.availabilityZoneInfo){
    azList = openstack.az.result.availabilityZoneInfo
  }
  if(openstack.host && openstack.host.servers){
    hostList = openstack.host.servers
  }
  if (openstack_storage.blockStorageList) {
    blockStorageList = openstack_storage.blockStorageList

  }
  if(openstack_storage.volumeTypes) {
    vt = openstack_storage.volumeTypes
  }


  return {
    blockStorageList,
    azList,
    hostList,
    vt,
  }
}

export default connect(mapStateToProp, {
  getBlockStorageList,
  createBlockStorage,
  getAZList,
  getVMList,
  attachBlockStorage,
  resizeBlockStorage,
  snapshotBlockStorage,
  deleteBlockStorage,
  detachBlockStorage,
  getVolumeType,
  getSnapshotList,
})(BlockStorage)