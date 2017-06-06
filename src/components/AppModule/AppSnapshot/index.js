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
import { Button, Input, Table, Icon, Spin, Modal } from 'antd'
import { connect } from 'react-redux'
import './style/Snapshot.less'
import CurrentImg from '../../../assets/img/appmanage/rollbackcurrent.jpg'
import ForwardImg from '../../../assets/img/appmanage/rollbackforward.jpg'
import ArrowImg from '../../../assets/img/appmanage/arrow.png'
import { loadStorageList, SnapshotList, SnapshotRollback, SnapshotDelete } from '../../../actions/storage'
import { DEFAULT_IMAGE_POOL } from '../../../constants'
import NotificationHandler from '../../../common/notification_handler'
import { formatDate } from  '../../../common/tools'
import Title from '../../Title'
import { Link } from 'react-router'

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
    }
  }

  loadSnapshotList(){
    const { loadStorageList, cluster, currentImagePool, SnapshotList } = this.props
    const body = {
      clusterID: cluster,
    }
    SnapshotList(body,{
      success: {
        func: () => {
          loadStorageList(currentImagePool, cluster)
        },
        isAsync: true
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
    if(this.props.snapshotDataList !== nextProps.snapshotDataList){
      this.setState({
        SnapshotList: nextProps.snapshotDataList
      })
    }
  }

  handleConfirmDeletaSnapshot(){
    const { snapshotDataList, SnapshotDelete, cluster } = this.props
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
          info.success('快照删除成功！')
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
        func: () => {
          info.error('快照删除失败！')
          this.setState({
            DeletaSnapshotModal: false,
            DeleteSnapshotConfirmLoading: false,
            DeleteSnapshotButton: true,
            selectedRowKeys: [],
            RowDelete: false,
            TopDelete: false,
          })
        }
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
    e.stopPropagation()
    const { snapshotDataList } = this.props
    this.setState({
      DeletaSnapshotModal: true,
      currentSnapshot: snapshotDataList[key],
      currentKey: key,
      delelteSnapshotNum: true,
      RowDelete: true,
    })
  }

  handleRollbackSnapback(key, e){
    e.stopPropagation()
    const { snapshotDataList, storageList } = this.props
    //判断当前快照状态
    if(snapshotDataList[key].status == '不正常'){
      this.setState({
        tipsSwitch: true,
        tipsModal: true,
      })
      return
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

  handlecolsetips(){
    this.setState({
      tipsModal: false,
      //currentKey: key,
    })
  }

  handelEnterSearch(e){
    const { snapshotDataList } = this.props
    const keyword = e.target.value
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
          info.success('快照回滚成功！')
          this.setState({
            rollbackModal: false,
            rollbackLoading: false,
          })
        }
      },
      falied: {
        func: () => {
          info.error('快照回滚失败！')
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

  render() {
    const { snapshotDataList } = this.props
    const { selectedRowKeys, DeleteSnapshotButton, currentSnapshot, delelteSnapshotNum, currentVolume } = this.state
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
        title:'快照名称',
        key:'name',
        dataIndex:'name',
        width:'14%',
      },{
        title:'状态',
        //key:'Status',
        //dataIndex:'Status',
        width:'12%',
        render: () => <div className={iconclassName('正常')}>
          <i className='fa fa-circle icon' aria-hidden="true"></i>
          <span>正常</span>
        </div>
      },{
        title:'格式',
        key:'type',
        dataIndex:'fstype',
        width:'12%',
        render: (fstype) => <div>{fstype}</div>
      },{
        title:'大小',
        key:'size',
        dataIndex:'size',
        width:'12%',
        render: (size) => <div>{size} M</div>
      },{
        title:'关联卷',
        key:'volume',
        dataIndex:'volume',
        width:'12%',
        render: (volume) => <div>
          <Link to={`/app_manage/storage/${DEFAULT_IMAGE_POOL}/${this.props.cluster}/${volume}`} >
            {volume}
          </Link>
        </div>
      },{
        title:'创建时间',
        key:'CreateTime',
        dataIndex:'createTime',
        render: (createTime) => <div>{formatDate(createTime)}</div>,
        sorter:(a, b) => soterCreateTime(a.createTime, b.createTime)
      },{
        title:'操作',
        key:'Handle',
        dataIndex:'key',
        render: (key) => <div>
          <Button type="primary" onClick={ this.handleRollbackSnapback.bind(this, key)}>回滚</Button>
          <Button onClick={ this.handleDeleteSnapshot.bind(this, key)} className='deleteButton'>删除</Button>
        </div>
      }]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div id="appmanage_snapshot">
        <Title title="快照" />
        <div className='appmanage_snapshot_header'>
          <Button icon="delete" size='large' onClick={this.handleDeleteSnapshots} disabled={DeleteSnapshotButton}>删除</Button>
          <span className='searchBox'>
            <Input className='searchInput' placeholder='按快照名称搜索' size="large" onPressEnter={this.handelEnterSearch}/>
            <i className="fa fa-search searchIcon" aria-hidden="true" onClick={this.handelEnterSearch}></i>
          </span>
        </div>
        <div className='appmanage_snapshot_main'>
          {
            snapshotDataList
            ?<Table
              columns={snapshotcolumns}
              dataSource={this.state.SnapshotList}
              rowSelection={rowSelection}
              onRowClick={this.handleTableRowClick}
            >
            </Table>
            :<div className='nodata'><Spin/></div>
          }
          {
            snapshotDataList && snapshotDataList.length !== 0
              ? <div className='totalNum'>共计<span className='item'>{snapshotDataList.length}</span>条</div>
              : <span></span>
          }
        </div>

        <Modal
          title="回滚快照"
          visible={this.state.rollbackModal}
          closable={true}
          onOk={this.handleConfirmRollback}
          onCancel={this.handleCancelRollback}
          width='570px'
          maskClosable={false}
          confirmLoading={this.state.rollbackLoading}
          wrapClassName="RollbackModal"
          okText="确定风险，并立即回滚"
        >
          <div>
            <div className='img'>
              <div className='imgBox'>
                <div className='rollback float'><img src={ForwardImg}/></div>
                <div className='arrow float'>
                  <img src={ArrowImg}/>
                  <div>回滚</div>
                </div>
                <div className='rollback float'><img src={CurrentImg}/>  </div>
              </div>
              <div className='imgtips'>
                <span className='imgtipsBox'>
                  <div className='left'>快照状态</div>
                  <div className='left'>格式<span className='item'>{currentSnapshot.fstype}</span></div>
                </span>
                <span className='imgtipsBox'>
                  <div className='right'>当前状态</div>
                  <div className='right'>格式<span className='item'>{currentVolume.format}</span></div>
                </span>
              </div>
            </div>
            <div className='tips'>
              存储卷
              <span className='name'>{currentSnapshot.volume}</span>
              即将回滚至
              <span className='time'>{formatDate(currentSnapshot.createTime)}</span>
              ，此刻之后的数据将被清除，请谨慎操作！
            </div>
            <div className='warning'>
              <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
              数据回滚有一定风险，建议将当前存储卷内容提前做好备份
            </div>
          </div>
        </Modal>

         <Modal
           title="删除快照"
           visible={this.state.DeletaSnapshotModal}
           closable={true}
           onOk={this.handleConfirmDeletaSnapshot}
           onCancel={this.hanndleCancelDeleteSnapshot}
           width='570px'
           maskClosable={false}
           confirmLoading={this.state.DeleteSnapshotConfirmLoading}
           wrapClassName="DeleteSnapshotModal"
           okText="确定风险，并立即删除"
         >
           <div>
             { delelteSnapshotNum
               ? <div className='infobox'>
                   <div className='leftbox'>
                     <div className='item'>快照名称</div>
                     <div className='item'>快照格式</div>
                     <div className='item'>创建时间</div>
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
               删除该快照后，数据将立即被清除，请谨慎操作！
             </div>
           </div>
         </Modal>

         <Modal
           title="提示"
           visible={this.state.tipsModal}
           closable={true}
           onOk={this.handlecolsetips}
           onCancel={this.handlecolsetips}
           width='570px'
           maskClosable={false}
           wrapClassName="RollbackSnapshotTipsModal"
           okText="知道了"
         >
           <div className='container'>
             <i className="fa fa-exclamation-triangle icon" aria-hidden="true"></i>
             {
               this.state.tipsSwitch
               ? <span>快照状态非正常，不可回滚快照</span>
               : <span>存储卷正在使用中，不可回滚快照！</span>
             }
           </div>
         </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props){
  const { cluster } = state.entities.current
  const { snapshotList } = state.storage
  const snapshotDataList = snapshotList.result || []
  for(let i = 0; i < snapshotDataList.length; i++){
    snapshotDataList[i].key = i
  }
  return {
    storageList: state.storage.storageList || [],
    currentImagePool: DEFAULT_IMAGE_POOL,
    cluster: cluster.clusterID,
    snapshotDataList,
  }
}

export default connect(mapStateToProps,{
  loadStorageList,
  SnapshotList,
  SnapshotDelete,
  SnapshotRollback,
})(Snapshot)