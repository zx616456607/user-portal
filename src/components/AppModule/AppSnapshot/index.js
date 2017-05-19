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
    this.state = {
      selectedRowKeys: [],
      loading: false,
      DeleteSnapshotButton: true,
      rollbackModal: false,
      rollbackLoading: false,
      DeletaSnapshotModal: false,
      DeleteSnapshotConfirmLoading: false,
      tipsModal: false,
      tipsSwitch: true,
      deletedSnapshotName: '',
      deletedSnapshotFormat: '',
      deletedSnapshotTime: '',
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

  componentWillMount() {
    document.title = '存储 | 时速云'
    this.loadSnapshotList()
  }

  handleConfirmDeletaSnapshot(){
    this.setState({
      DeletaSnapshotModal: false,
    })
  }

  hanndleCancelDeleteSnapshot(){
    this.setState({
      DeletaSnapshotModal: false,
    })
  }

  handleDeleteSnapshots(){
    const { SnapshotDelete } = this.props
    //this.setState({ loading: true });
    //// 模拟 ajax 请求，完成后清空
    //setTimeout(() => {
    //  this.setState({
    //    selectedRowKeys: [],
    //    loading: false,
    //    DeleteSnapshotButton: true
    //  });
    //}, 1000);
  }

  onSelectChange(selectedRowKeys) {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    if(selectedRowKeys.length == 0){
      this.setState({
        selectedRowKeys,
        DeleteSnapshotButton: true
      })
      return
    }
    this.setState({
      selectedRowKeys,
      DeleteSnapshotButton: false
    });
  }

  handleDeleteSnapshot(key){
    console.log('delete.key=',key)
    const { snapshotDataList } = this.props
    this.setState({
      DeletaSnapshotModal: true,
      deletedSnapshotName: 123,
      deletedSnapshotFormat: 234,
      deletedSnapshotTime: 123
    })
  }

  handleRollbackSnapback(key){
    const { snapshotDataList, storageList, SnapshotRollback } = this.props
    if(snapshotDataList[key].status == '不正常'){
      this.setState({
        tipsSwitch: true,
        tipsModal: true,
      })
      return
    }
    for(let pool in storageList){
      for(let i = 0; i < storageList[pool].storageList.length; i++){
        if(snapshotDataList[key].name == storageList[pool].storageList[i].name){
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
      //tipsModal: true,
    })
  }

  handlecolsetips(){
    this.setState({
      tipsModal: false,
    })
  }

  handelEnterSearch(){
    console.log('shanxuan')
  }

  handleConfirmRollback(){
    const { storageList } = this.props
    console.log('storageList=',storageList)
    console.log('确定回gun')

    this.setState({
      rollbackModal: false,
    })
  }

  handleCancelRollback(){
    console.log('取消回滚')
    this.setState({
      rollbackModal: false,
    })
  }

  render() {
    const { snapshotDataList } = this.props
    const { loading, selectedRowKeys , DeleteSnapshotButton} = this.state
    function iconclassName(text){
      switch(text){
        case '正常':
          return 'statusRunning'
      }
    }
    const snapshotcolumns = [{
        title:'快照名称',
        key:'name',
        dataIndex:'snapshot',
        render: (snapshot) => <div>{snapshot.name}</div>
      },{
        title:'状态',
        //key:'Status',
        //dataIndex:'Status',
        render: () => <div className={iconclassName('正常')}>
          <i className='fa fa-circle icon' aria-hidden="true"></i>
          <span>正常</span>
        </div>
      },{
        title:'格式',
        key:'type',
        dataIndex:'fstype',
        render: (fstype) => <div>{fstype}</div>
      },{
        title:'大小',
        key:'size',
        dataIndex:'size',
        render: (size) => <div>{size} M</div>
      },{
        title:'关联卷',
        key:'volume',
        dataIndex:'snapshot',
        render: (snapshot) => <div>{snapshot.volume}</div>
      },{
        title:'创建时间',
        key:'CreateTime',
        dataIndex:'snapshot',
        render: (snapshot) => <div>{snapshot.createTime}</div>,
        sorter:(a, b) => { a.createTime - b.createTime }
      },{
        title:'操作',
        key:'Handle',
        dataIndex:'key',
        render: (key) => <div>
          <Button type="primary" onClick={ () => this.handleRollbackSnapback(key)}>回滚</Button>
          <Button onClick={ () => this.handleDeleteSnapshot(key)} className='deleteButton'>删除</Button>
        </div>
      }]
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div id="appmanage_snapshot">
        <div className='appmanage_snapshot_header'>
          <Button icon="delete" size='large' loading={loading} onClick={this.handleDeleteSnapshots} disabled={DeleteSnapshotButton}>删除</Button>
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
              dataSource={snapshotDataList}
              rowSelection={rowSelection}
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
                  <div className='left'>格式<span className='item'>etx5</span></div>
                </span>
                <span className='imgtipsBox'>
                  <div className='right'>当前状态</div>
                  <div className='right'>格式<span className='item'>etx5</span></div>
                </span>
              </div>
            </div>
            <div className='tips'>
              存储卷
              <span className='name'>xxxxx</span>
              即将回滚至时间
              <span className='time'>2017.1.1</span>
              <span className='time'>12:59.08</span>
              此刻之后的数据将被清楚，请谨慎操作！
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
              <div className='infobox'>
                <div className='leftbox'>
                  <div className='item'>快照名称</div>
                  <div className='item'>快照格式</div>
                  <div className='item'>时间</div>
                </div>
                <dvi className='rightbox'>
                  <div className='item'>{this.state.deletedSnapshotName}</div>
                  <div className='item'>{this.state.deletedSnapshotFormat}</div>
                  <div className='item color'>{this.state.deletedSnapshotTime}</div>
                </dvi>
              </div>
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