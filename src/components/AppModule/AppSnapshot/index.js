/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ServiceList component
 *
 * v0.1 - 2017-05-12
 * @author ZhangChengZheng
 */
import React,{ Component,PropTypes } from 'react'
import { Button, Input, Table, Icon, Spin, Modal, Dropdown, Menu, Form } from 'antd'
import { connect } from 'react-redux'
import './style/Snapshot.less'
import CurrentImg from '../../../assets/img/appmanage/rollbackcurrent.jpg'
import ForwardImg from '../../../assets/img/appmanage/rollbackforward.jpg'
import ArrowImg from '../../../assets/img/appmanage/arrow.png'
import { loadStorageList, SnapshotList, SnapshotRollback, SnapshotDelete } from '../../../actions/storage'
import { DEFAULT_IMAGE_POOL } from '../../../constants'
import NotificationHandler from '../../../components/Notification'
import { formatDate } from  '../../../common/tools'
import Title from '../../Title'
import { Link } from 'react-router'
import CreateVolume from '../../StorageModule/CreateVolume'
import { browserHistory } from 'react-router'
import { UPDATE_INTERVAL } from '../../../constants'
import QueueAnim from 'rc-queue-anim'
import ResourceBanner from '../../TenantManage/ResourceBanner/index'
import { injectIntl, FormattedMessage } from 'react-intl'
import SnapshotIntl from './SnapshotIntl'

const notificationHandler = new NotificationHandler()

class Snapshot extends Component {
  constructor(props) {
    super(props)
    this.handleDeleteSnapshots = this.handleDeleteSnapshots.bind(this)
    this.onSelectChange = this.onSelectChange.bind(this)
    this.handleDeleteSnapshot = this.handleDeleteSnapshot.bind(this)
    this.handleRollbackSnapback = this.handleRollbackSnapback.bind(this)
    this.handelEnterSearch = this.handelEnterSearch.bind(this)
    this.handleConfirmRollback = this.handleConfirmRollback.bind(this)
    this.handleCancelRollback = this.handleCancelRollback.bind(this)
    this.handleConfirmDeletaSnapshot = this.handleConfirmDeletaSnapshot.bind(this)
    this.hanndleCancelDeleteSnapshot = this.hanndleCancelDeleteSnapshot.bind(this)
    this.loadSnapshotList = this.loadSnapshotList.bind(this)
    this.handlecolsetips = this.handlecolsetips.bind(this)
    this.updateSnapshotList = this.updateSnapshotList.bind(this)
    this.handleTableRowClick = this.handleTableRowClick.bind(this)
    this.handleDropdown = this.handleDropdown.bind(this)
    this.handleCloneSnapshot = this.handleCloneSnapshot.bind(this)
    this.rollbackSuccessConfirm = this.rollbackSuccessConfirm.bind(this)
    this.getStorageList = this.getStorageList.bind(this)
    this.rollbackOperate = this.rollbackOperate.bind(this)
    this.cloneSnapshotOperate = this.cloneSnapshotOperate.bind(this)
    this.state = {
      selectedRowKeys: [],
      DeleteSnapshotButton: true,
      rollbackModal: false,
      rollbackLoading: false,
      DeletaSnapshotModal: false,
      DeleteSnapshotConfirmLoading: false,
      tipsModal: false,
      tipsSwitch: true,
      currentKey: 0,
      currentSnapshot: {},
      currentDeletedSnapshotArrary: {},
      SnapshotList: [],
      RowClickObj: {},
      delelteSnapshotNum: false,
      RowDelete: false,
      TopDelete: false,
      currentVolume: {},
      visible: false,
      createFalse: false,
      rollbackSuccess: false,
      hasAlreadyGetStorageList: false,
    }
  }

  loadSnapshotList(){
    const { cluster, SnapshotList } = this.props

    const body = {
      clusterID: cluster,
    }
    SnapshotList(body, {
      success: {
        func: (res) => {
          this.setState({
            SnapshotList: res.data,
          })
        }
      },
      failed: {
        func: err => {
          if (err.statusCode === 403) this.setState({ SnapshotList: [] })
        },
        isAsync: true,
      }
    })
  }

  getStorageList(type, operate){
    const { loadStorageList, cluster, currentImagePool } = this.props
    const { formatMessage } = this.props.intl
    const query = {
      storagetype: 'ceph',
      srtype: 'private'
    }
    loadStorageList(currentImagePool, cluster, query, {
      success: {
        func: () => {
          this.setState({
            hasAlreadyGetStorageList: true,
          })
          operate()
        },
        isAsync: true,
      },
      failed: {
        func: () => {
          let message = formatMessage(SnapshotIntl.rollBack)
          if(type == 'clone'){
            message = formatMessage(SnapshotIntl.create)
          }
          notificationHandler.info(formatMessage(SnapshotIntl.storageListFail, {message}))
        }
      }
    })
  }

  updateSnapshotList(){
    const { cluster, SnapshotList } = this.props
    const body = {
      clusterID: cluster,
    }
    SnapshotList(body)
  }

  componentWillMount() {
    this.loadSnapshotList()
  }

  componentDidMount() {
    this.updateInterval = setInterval(() => {
      this.loadSnapshotList()
    }, UPDATE_INTERVAL)
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval)
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.cluster !== nextProps.cluster){
      const { loadStorageList, currentImagePool, SnapshotList } = this.props
      const body = {
        clusterID: nextProps.cluster,
      }
      SnapshotList(body,{
        success: {
          func: () => {
            this.setState({
              SnapshotList: this.props.snapshotDataList
            })
            loadStorageList(currentImagePool, nextProps.cluster)
          },
          isAsync: true
        }
      })
    }
    if(this.props.snapshotDataList !== nextProps.snapshotDataList &&
      JSON.stringify(this.props.snapshotDataList) !== JSON.stringify(nextProps.snapshotDataList)
    ){
      this.setState({
        SnapshotList: nextProps.snapshotDataList
      })
    }
  }

  handleConfirmDeletaSnapshot(){
    const { snapshotDataList, SnapshotDelete, cluster } = this.props
    const { formatMessage } = this.props.intl
    const { currentKey, currentDeletedSnapshotArrary, selectedRowKeys, RowDelete, TopDelete } = this.state
    const info = new NotificationHandler()
    this.setState({
      DeleteSnapshotConfirmLoading: true,
      RowClickObj: {},
    })
    let body = {}
    if(RowDelete){
      body = {
        clusterID: cluster,
        body: {
          snapshotName: {
            [snapshotDataList[currentKey].volume]: [snapshotDataList[currentKey].name]
          }
        }
      }
    }
    if(TopDelete){
      body = {
        clusterID: cluster,
        body: {
          snapshotName: currentDeletedSnapshotArrary,
        }
      }
    }
    SnapshotDelete(body,{
      success: {
        func: () => {
          info.success(formatMessage(SnapshotIntl.delSnapShotSuccess))
          this.setState({
            DeletaSnapshotModal: false,
            DeleteSnapshotConfirmLoading: false,
            DeleteSnapshotButton: true,
            selectedRowKeys: [],
            RowDelete: false,
            TopDelete: false,
          })
          this.updateSnapshotList()
        },
        isAsync: true
      },
      failed: {
        func: err => {
          const { statusCode, message } = err
          if (statusCode === 409 && message.data && message.data.length > 0) {
            info.error(`${message.data} ${formatMessage(SnapshotIntl.delStorageFail)}`)
            this.updateSnapshotList()
          } else {
            info.error(formatMessage(SnapshotIntl.delSnapShotFail))
          }
          this.setState({
            DeletaSnapshotModal: false,
            DeleteSnapshotConfirmLoading: false,
            DeleteSnapshotButton: true,
            selectedRowKeys: [],
            RowDelete: false,
            TopDelete: false,
          })
        },
        isAsync: true
      }
    })
  }

  hanndleCancelDeleteSnapshot(){
    this.setState({
      DeletaSnapshotModal: false,
      DeleteSnapshotConfirmLoading: false,
    })
  }

  handleDeleteSnapshots(){
    this.setState({
      delelteSnapshotNum: false,
      DeletaSnapshotModal: true,
      TopDelete: true,
    })
  }

  onSelectChange(selectedRowKeys) {
    const { snapshotDataList } = this.props
    const currentDeletedSnapshotArrary = {}
    if(selectedRowKeys.length == 0){
      this.setState({
        selectedRowKeys,
        currentDeletedSnapshotArrary: {},
        DeleteSnapshotButton: true
      })
      return
    }
    for(let i=0; i < selectedRowKeys.length; i++){
      if(!currentDeletedSnapshotArrary[snapshotDataList[selectedRowKeys[i]].volume]){
        currentDeletedSnapshotArrary[snapshotDataList[selectedRowKeys[i]].volume] = [snapshotDataList[selectedRowKeys[i]].name]
      } else {
        currentDeletedSnapshotArrary[snapshotDataList[selectedRowKeys[i]].volume].push(snapshotDataList[selectedRowKeys[i]].name)
      }
    }
    this.setState({
      selectedRowKeys,
      currentDeletedSnapshotArrary,
      DeleteSnapshotButton: false
    });
  }

  handleDeleteSnapshot(key, e){
    //e.stopPropagation()
    const { snapshotDataList } = this.props
    //判断当前快照状态
    if(snapshotDataList[key].status !== 0){
      return this.statusModalInfo(snapshotDataList[key].status)
    }
    this.setState({
      DeletaSnapshotModal: true,
      currentSnapshot: snapshotDataList[key],
      currentKey: key,
      delelteSnapshotNum: true,
      RowDelete: true,
    })
  }

  statusModalInfo(status){
    const { formatMessage } = this.props.intl
    return Modal.info({
      title: formatMessage(SnapshotIntl.prompt),
      content: (
        <div>
          <p>{status == 1 ?
            formatMessage(SnapshotIntl.currentIsRollBacking) :
            formatMessage(SnapshotIntl.currentIsCloneing)}</p>
        </div>
      ),
      onOk() {},
    });
  }

  rollbackOperate(key){
    const { snapshotDataList, storageList } = this.props
    //判断当前快照状态
    if(snapshotDataList[key].status !== 0){
      return this.statusModalInfo(snapshotDataList[key].status)
    }
    //判断当前快照所在存储卷的状态
    for(let pool in storageList){
      for(let i = 0; i < storageList[pool].storageList.length; i++){
        if(snapshotDataList[key].volume == storageList[pool].storageList[i].name){
          this.setState({
            currentSnapshot: snapshotDataList[key],
            currentVolume: storageList[pool].storageList[i]
          })
          if(storageList[pool].storageList[i].isUsed == true){
            this.setState({
              tipsSwitch: false,
              tipsModal: true
            })
            return
          }
        }
      }
    }
    this.setState({
      rollbackModal: true,
      currentKey: key,
    })
  }

  handleRollbackSnapback(isUsed, key, e) {
    const { formatMessage } = this.props.intl
    if(isUsed){
      notificationHandler.warn(formatMessage(SnapshotIntl.isUsingForbidRollBack));
      return;
    }
    e.stopPropagation()
    const { hasAlreadyGetStorageList } = this.state
    if(hasAlreadyGetStorageList){
      this.rollbackOperate(key)
      return
    }
    this.getStorageList('rollback', this.rollbackOperate.bind(this, key))
  }

  handlecolsetips(){
    this.setState({
      tipsModal: false,
      //currentKey: key,
    })
  }

  handelEnterSearch(e){
    const { snapshotDataList } = this.props
    const keyword = document.getElementById('searchSnapshot').value
    if(keyword.length == 0){
      this.setState({
        SnapshotList: snapshotDataList
      })
      return
    }
    let snapshotList = []
    snapshotDataList.map((node) => {
      if (node.name.indexOf(keyword) > -1) {
        snapshotList.push(node);
      }
    });
    this.setState({
      SnapshotList: snapshotList
    });
  }

  handleConfirmRollback(){
    const { snapshotDataList, SnapshotRollback, cluster } = this.props
    const { formatMessage } = this.props.intl
    const { currentKey } = this.state
    const info = new NotificationHandler()
    this.setState({
      rollbackLoading: true,
    })
    const body = {
      clusterID: cluster,
      volumeName: snapshotDataList[currentKey].volume,
      body: {
        snapshotName: snapshotDataList[currentKey].name
      }
    }
    SnapshotRollback(body,{
      success: {
        func: () => {
          this.updateSnapshotList()
          this.setState({
            rollbackModal: false,
            rollbackLoading: false,
            rollbackSuccess: true,
          })
        },
        isAsync: true
      },
      falied: {
        func: () => {
          info.error(formatMessage(SnapshotIntl.rollBackFail))
          this.setState({
            rollbackModal: false,
            rollbackLoading: false,
          })
        }
      }
    })
  }

  handleCancelRollback(){
    this.setState({
      rollbackModal: false,
      rollbackLoading: false,
    })
  }

  handleTableRowClick(record, index,e){
    const { RowClickObj } = this.state
    let arr = []
    if(RowClickObj[index]){
      delete RowClickObj[index]
    } else {
      RowClickObj[index] = index+1
    }
    for(let i in RowClickObj){
      arr.push(RowClickObj[i]-1)
    }
    this.onSelectChange(arr)
  }

  cloneSnapshotOperate(key){
    const { snapshotDataList, storageList, currentCluster } = this.props
    setTimeout(() => {
      document.getElementById('volumeName').focus()
    },100)
    for(let pool in storageList){
      for(let i = 0; i < storageList[pool].storageList.length; i++){
        if(snapshotDataList[key].volume == storageList[pool].storageList[i].name){
          this.setState({
            currentSnapshot: snapshotDataList[key],
            currentVolume: storageList[pool].storageList[i]
          })
        }
      }
    }
    this.setState({
      visible: true
    })
  }

  handleCloneSnapshot(key){
    const { snapshotDataList, currentCluster, storageClassType } = this.props
    //判断当前快照状态
    if(snapshotDataList[key].status !== 0){
      return this.statusModalInfo(snapshotDataList[key].status)
    }
    const { private: privateValue } = storageClassType
    if(!privateValue){
      this.setState({
        createFalse: true,
      })
      return
    }
    const { hasAlreadyGetStorageList } = this.state
    if(hasAlreadyGetStorageList){
      this.cloneSnapshotOperate(key)
      return
    }
    this.getStorageList('clone', this.cloneSnapshotOperate.bind(this, key))
  }

  handleDropdown(key, item){
    switch(item.key){
      case 'deleteSnapshot':
        return this.handleDeleteSnapshot(key)
      case 'cloneSnapshot':
        return this.handleCloneSnapshot(key)
      default:
        return
    }
  }

  rollbackSuccessConfirm(){
    this.setState({
      rollbackSuccess : false
    })
    browserHistory.push('/manange_monitor')
  }

  formatStatus(status){
    const { formatMessage } = this.props.intl
    switch(status){
      case 1:
        return <span style={{color: 'red'}}>
          <i className='fa fa-circle icon' aria-hidden="true"></i>
          <span>{formatMessage(SnapshotIntl.rollBacking)}</span>
        </span>
      case 2:
        return <span style={{color: 'red'}}>
          <i className='fa fa-circle icon' aria-hidden="true"></i>
          <span>{formatMessage(SnapshotIntl.creating)}</span>
        </span>
      case 0:
      default:
        return <span style={{color: '#5cb85c'}}>
          <i className='fa fa-circle icon' aria-hidden="true"></i>
          <span>{formatMessage(SnapshotIntl.normal)}</span>
        </span>
    }
  }

  render() {
    const { snapshotDataList, currentCluster, storageList, currentImagePool, isFetching, intl } = this.props
    const { formatMessage } = intl
    const {
      selectedRowKeys, DeleteSnapshotButton, currentSnapshot,
      delelteSnapshotNum, currentVolume, SnapshotList,
    } = this.state
    let currentStorageList= []
    if(storageList[currentImagePool]){
      currentStorageList = storageList[currentImagePool].storageList
    }
    function iconclassName(text){
      switch(text){
        case '正常':
          return 'statusRunning'
      }
    }

    function soterCreateTime(a, b){
      let oDate1 = new Date(a);
      let oDate2 = new Date(b);
      if(oDate1.getTime() > oDate2.getTime()){
        return 1
      } else {
        return -1
      }
    }
    const snapshotcolumns = [{
        title: formatMessage(SnapshotIntl.snapshotName),
        key: 'name',
        dataIndex: 'name',
        width: '16%'
      }, {
        title: formatMessage(SnapshotIntl.status),
        key: 'status',
        dataIndex: 'status',
        width: '10%',
        render: (text) => <div className={iconclassName('正常')}>
          {this.formatStatus(text)}
        </div>
      }, {
        title: formatMessage(SnapshotIntl.type),
        key: 'type',
        dataIndex: 'fstype',
        width: '8%',
        render: (fstype) => <div>{fstype}</div>
      }, {
        title: formatMessage(SnapshotIntl.size),
        key: 'size',
        dataIndex: 'size',
        width: '8%',
        render: (size) => <div>{size} M</div>
      }, {
        title: formatMessage(SnapshotIntl.relatedVolume),
        key: 'volume',
        dataIndex: 'volume',
        width: '10%',
        render: (volume) => <div>
          <Link to={`/app_manage/storage/exclusiveMemory/${DEFAULT_IMAGE_POOL}/${this.props.cluster}/${volume}`}>
            {volume}
          </Link>
        </div>
      }, {
        title: formatMessage(SnapshotIntl.volumeType),
        key: 'storageServer',
        dataIndex: 'storageServer',
        width: '15%',
        render: (text, record, index) => <div style={{ wordBreak: 'break-all' }}>
          {formatMessage(SnapshotIntl.storageServer)} ({text})</div>
      }, {
        title: formatMessage(SnapshotIntl.createTime),
        key: 'CreateTime',
        width: '18%',
        dataIndex: 'createTime',
        render: (createTime) => <div>{formatDate(createTime)}</div>,
        sorter: (a, b) => soterCreateTime(a.createTime, b.createTime)
      }, {
        title: formatMessage(SnapshotIntl.operate),
        key: 'Handle',
        dataIndex: 'key',
        width: '15%',
        render: (key, record, index) => {
          const menu = <Menu onClick={this.handleDropdown.bind(this, index)} style={{ width: '80px' }}>
            <Menu.Item key="deleteSnapshot">
              {formatMessage(SnapshotIntl.delete)}
            </Menu.Item>
            <Menu.Item key="cloneSnapshot">
              {formatMessage(SnapshotIntl.create)}
            </Menu.Item>
          </Menu>
          return <div>
            <Dropdown.Button onClick={this.handleRollbackSnapback.bind(this, record.volumeStatus === "used", key)} overlay={menu} type="ghost">
              {formatMessage(SnapshotIntl.rollBack)}
            </Dropdown.Button>
          </div>
        }
      }]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <QueueAnim className='appmanage_snapshot' type='right'>
      <div id="appmanage_snapshot" key='appmanage_snapshot'>
        <Title title={formatMessage(SnapshotIntl.exclusiveStorageShot)} />
        <ResourceBanner resourceType='snapshot'/>
        <div className='appmanage_snapshot_header'>
          <Button size="large" onClick={() => this.loadSnapshotList()} style={{ marginRight: 8 }}>
            <i className="fa fa-refresh" aria-hidden="true" style={{ marginRight: 8 }}/>
            {formatMessage(SnapshotIntl.refresh)}
          </Button>
          <Button icon="delete" size='large' onClick={this.handleDeleteSnapshots} disabled={DeleteSnapshotButton}>
            {formatMessage(SnapshotIntl.delete)}
          </Button>
          <span className='searchBox'>
            <Input
              className='searchInput'
              placeholder={formatMessage(SnapshotIntl.placeholder)}
              size="large"
              onPressEnter={this.handelEnterSearch}
              id="searchSnapshot"
              style={{ width: 180 }}
            />
            <i className="fa fa-search searchIcon" aria-hidden="true" onClick={this.handelEnterSearch}></i>
          </span>
          {
            SnapshotList && SnapshotList.length !== 0
              ? <span className='totalNum'>
                {formatMessage(SnapshotIntl.listTotal)}
                <span className='item'> {SnapshotList.length} </span>
                {formatMessage(SnapshotIntl.slip)}
                </span>
              : <span></span>
          }
        </div>
        <div className='appmanage_snapshot_main'>
          <Table
            columns={snapshotcolumns}
            dataSource={SnapshotList}
            rowSelection={rowSelection}
            onRowClick={this.handleTableRowClick}
            pagination={{ simple: true }}
            loading={ isFetching }
          >
          </Table>
        </div>

        <Modal
          title={formatMessage(SnapshotIntl.rollBackSnapshot)}
          visible={this.state.rollbackModal}
          closable={true}
          onOk={this.handleConfirmRollback}
          onCancel={this.handleCancelRollback}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.rollbackLoading}
          wrapClassName="RollbackModal"
          okText={formatMessage(SnapshotIntl.EnterRollBack)}
        >
          <div>
            <div className='img'>
              <div className='imgBox'>
                <div className='rollback float'><img src={ForwardImg}/></div>
                <div className='arrow float'>
                  <img src={ArrowImg}/>
                  <div>{formatMessage(SnapshotIntl.rollBack)}</div>
                </div>
                <div className='rollback float'><img src={CurrentImg}/>  </div>
              </div>
              <div className='imgtips'>
                <span className='imgtipsBox'>
                  <div className='left'>{formatMessage(SnapshotIntl.snapshotStatus)}</div>
                  <div className='left'>{formatMessage(SnapshotIntl.type)}<span className='item'>{currentSnapshot.fstype}</span></div>
                </span>
                <span className='imgtipsBox'>
                  <div className='right'>{formatMessage(SnapshotIntl.currentStatus)}</div>
                  <div className='right'>{formatMessage(SnapshotIntl.type)}<span className='item'>{currentVolume.format}</span></div>
                </span>
              </div>
            </div>
            <div className='tips'>
              {formatMessage(SnapshotIntl.storage)}
              <span className='name'>{currentSnapshot.volume}</span>
              {formatMessage(SnapshotIntl.willRollbackTo)}
              <span className='time'>{formatDate(currentSnapshot.createTime)}</span>
              ， {formatMessage(SnapshotIntl.willClearPrompt)}！
            </div>
            <div className='warning'>
              <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
              {formatMessage(SnapshotIntl.promptBackup)}
            </div>
          </div>
        </Modal>

         <Modal
           title={formatMessage(SnapshotIntl.delSnapshot)}
           visible={this.state.DeletaSnapshotModal}
           closable={true}
           onOk={this.handleConfirmDeletaSnapshot}
           onCancel={this.hanndleCancelDeleteSnapshot}
           width='570px'
           maskClosable={false}
           confirmLoading={this.state.DeleteSnapshotConfirmLoading}
           wrapClassName="DeleteSnapshotModal"
           okText={formatMessage(SnapshotIntl.enterDelete)}
         >
           <div>
             { delelteSnapshotNum
               ? <div className='infobox'>
                   <div className='leftbox'>
                     <div className='item'>{formatMessage(SnapshotIntl.snapshotName)}</div>
                     <div className='item'>{formatMessage(SnapshotIntl.snapshotType)}</div>
                     <div className='item'>{formatMessage(SnapshotIntl.createTime)}</div>
                   </div>
                   <dvi className='rightbox'>
                     <div className='item'>{currentSnapshot.name}</div>
                     <div className='item'>{currentSnapshot.fstype}</div>
                     <div className='item color'>{formatDate(currentSnapshot.createTime)}</div>
                   </dvi>
                 </div>
               : <span></span>
             }

             <div className='mainbox'>
               <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
               {formatMessage(SnapshotIntl.willDeletePrompt)}
             </div>
           </div>
         </Modal>

         <Modal
           title={formatMessage(SnapshotIntl.prompt)}
           visible={this.state.tipsModal}
           closable={true}
           onOk={this.handlecolsetips}
           onCancel={this.handlecolsetips}
           width='570px'
           maskClosable={false}
           wrapClassName="RollbackSnapshotTipsModal"
           okText={formatMessage(SnapshotIntl.knowed)}
         >
           <div className='container'>
             <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
             {
               this.state.tipsSwitch
               ? <span>{formatMessage(SnapshotIntl.forbidRollBack)}</span>
               : <span>{formatMessage(SnapshotIntl.isUsingForbidRollBack)}</span>
             }
           </div>
         </Modal>

         <Modal
           title={formatMessage(SnapshotIntl.createStorage)}
           visible={this.state.visible}
           closable={true}
           onCancel={() => this.setState({visible: false})}
           width='570px'
           maskClosable={false}
           footer={[]}
           wrapClassName="createVloumeModal"
         >
           <div>
             <CreateVolume
              createModal={this.state.visible}
              scope={this}
              snapshotRequired={true}
              snapshotDataList={snapshotDataList}
              currentVolume={currentVolume}
              currentSnapshot={currentSnapshot}
              storageList={currentStorageList}/>
           </div>
         </Modal>

          <Modal
            title={formatMessage(SnapshotIntl.prompt)}
            visible={this.state.createFalse}
            onOk={() => this.setState({createFalse: false})}
            onCancel={() => this.setState({createFalse: false})}
          >
            {formatMessage(SnapshotIntl.needConfigCluster)}
          </Modal>

          <Modal
            title={formatMessage(SnapshotIntl.rollBackSucccess)}
            visible={this.state.rollbackSuccess}
            closable={true}
            onOk={this.rollbackSuccessConfirm}
            onCancel={() => this.setState({rollbackSuccess: false})}
            width='570px'
            maskClosable={false}
            wrapClassName="rollbackSuccess"
            footer={[
              <Button key='close' onClick={() => this.setState({rollbackSuccess: false})} size="large">
                {formatMessage(SnapshotIntl.close)}
              </Button>,
              <Button key='check' onClick={this.rollbackSuccessConfirm} size='large' type="primary">
                {formatMessage(SnapshotIntl.watchComputeLog)}
              </Button>]}
          >
            <div className='container'>
              <div className='header'>
                <div>
                  <Icon type="check-circle-o" className='icon'/>
                </div>
                <div className='tips'>
                  {formatMessage(SnapshotIntl.operateSuccess)}
                </div>
              </div>
              <div className='footer'>
                <div className='lineone'>
                  {formatMessage(SnapshotIntl.isRollBacking)}
                </div>
              </div>
            </div>
          </Modal>
      </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props){
  const { cluster } = state.entities.current
  const { snapshotList } = state.storage
  const { result: snapshotDataList, isFetching } = snapshotList
  for(let i = 0; i < snapshotDataList.length; i++){
    snapshotDataList[i].key = i
  }
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
    currentImagePool: DEFAULT_IMAGE_POOL,
    cluster: cluster.clusterID,
    snapshotDataList,
    isFetching,
    currentCluster: cluster,
    storageClassType: defaultStorageClassType,
  }
}

export default connect(mapStateToProps,{
  loadStorageList,
  SnapshotList,
  SnapshotDelete,
  SnapshotRollback,
})(injectIntl(Snapshot), {withRef: true})