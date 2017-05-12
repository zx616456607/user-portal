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
    this.state = {
      selectedRowKeys: [],
      loading: false,
      DeleteSnapshotButton: true,
      rollbackModal: false,
      rollbackLoading: false,
    }
  }

  handleDeleteSnapshots(){
    this.setState({ loading: true });
    // 模拟 ajax 请求，完成后清空
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
        DeleteSnapshotButton: true
      });
    }, 1000);
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
  }

  handleRollbackSnapback(key){
    console.log('rollback.key=',key)
    this.setState({
      rollbackModal: true,
    })
  }

  handelEnterSearch(){
    console.log('shanxuan')
  }

  handleConfirmRollback(){
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
    const { data } = this.props
    const { loading, selectedRowKeys , DeleteSnapshotButton} = this.state
    function iconclassName(text){
      switch(text){
        case '正常':
          return 'statusRunning'
      }
    }
    const snapshotcolumns = [{
        title:'快照名称',
        key:'ImageName',
        dataIndex:'ImageName',
      },{
        title:'状态',
        key:'Status',
        dataIndex:'Status',
        render: (text) => <div className={iconclassName(text)}>
          <i className='fa fa-circle icon' aria-hidden="true"></i>
          <span>{text}</span>
        </div>
      },{
        title:'格式',
        key:'Format',
        dataIndex:'Format',
      },{
        title:'大小',
        key:'Size',
        dataIndex:'Size',
      },{
        title:'关联卷',
        key:'AssociatedVolume',
        dataIndex:'AssociatedVolume',
      },{
        title:'创建时间',
        key:'CreateTime',
        dataIndex:'CreateTime',
        sorter:(a, b) => { a.time - b.time }
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
            data
            ?<Table
              columns={snapshotcolumns}
              dataSource={data}
              rowSelection={rowSelection}
            >
            </Table>
            :<div className='nodata'><Spin/></div>
          }
          {
            data && data.length !== 0
              ? <div className='totalNum'>共计<span className='item'>{data.length}</span>条</div>
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
           visible={this.state.}
           closable={true}
           onOk={}
           onCancel={}
           width=''
           maskClosable={false}
           confirmLoading={}
           wrapClassName=""
         >
           <div>

           </div>
         </Modal>

      </div>
    )
  }
}

function mapStateToProps(state, props){
  const data = [{
      key:'1',
      ImageName:'name-snapshot',
      Status:'正常',
      Format:'xfs',
      Size:'100MB',
      AssociatedVolume:'xxxxxx',
      CreateTime:'1个月前'
    },{
      key:'2',
      ImageName:'name-snapshot',
      Status:'正常',
      Format:'xfs',
      Size:'100MB',
      AssociatedVolume:'xxxxxx',
      CreateTime:'7个月前'
    },{
      key:'3',
      ImageName:'name-snapshot',
      Status:'正常',
      Format:'xfs',
      Size:'100MB',
      AssociatedVolume:'xxxxxx',
      CreateTime:'20个月前'
    },{
      key:'4',
      ImageName:'name-snapshot',
      Status:'正常',
      Format:'xfs',
      Size:'100MB',
      AssociatedVolume:'xxxxxx',
      CreateTime:'5个月前'
    }]
   const abc = []
  return {
    data
  }
}

export default connect(mapStateToProps,{

})(Snapshot)