/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  keypair component
 *
 * v0.1 - 2017-9-17
 * @author Baiyu
 */

import React,{ Component } from 'react'

import { Card, Button, Modal, Input,Table, Select } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { getKeypairList,deleteKeypair, clearKeyPair } from '../../../actions/openstack/lb'
import Title from '../../Title'
import CreateModal from './CreateModal'
import './style/index.less'
import NotificationHander from '../../../common/notification_handler'
const Option = Select.Option
const notificat = new NotificationHander()
class Keypairs extends Component {
  constructor(props) {
    super()
    this.state = {selectedRowKeys:[]}
  }
  componentWillMount() {
    this.loadData()
  }
  componentWillUnmount() {
    this.props.clearKeyPair()
  }
  loadData() {

    this.props.getKeypairList({project: this.state.currentProject}, {
      success:{
        func:(res)=> {
          let dataList = []
          if (Array.isArray(res.keypairs)){
            dataList = res.keypairs.map(item => item.keypair)
          }
          this.setState({dataList})
        }
      },
      finally:{
        func:()=> {
         setTimeout(()=> document.getElementById('searchInput').value = '',500)
        }
      }
    })
  }
  queryList() {
    if(!this.state.currentProject) {
      return
    }
    const inputValue = document.getElementById('searchInput').value
    const { keypair } = this.props

    if (!inputValue) {
      this.setState({
        dataList: keypair
      })
      return
    }
    const newList = keypair.filter(list => {
      const search = new RegExp(inputValue)
      if (search.test(list.name)) {
        return true
      }
      return false
    })
    this.setState({
      dataList: newList
    })
  }
  Modalfunc = (e)=> {
    this.setState({create: e,upload: false})
  }
  hanldRemove() {
    if(!this.state.currentProject) {
      return
    }

    this.setState({deleteing: true})
    this.props.deleteKeypair(this.state.currentName,{project: this.state.currentProject},{
      success:{
        func: text => {
          notificat.success('删除成功')
          this.setState({delete: false})
          this.loadData()
        },
        isAsync: true
      },
      finally: {
        func:(res)=> {
          this.setState({deleteing: false})
        }
      }
    })
  }

  crateBtn(e) {

    if (e) {
      this.setState({create: true,upload: true})
      return
    }
    this.setState({create: true })
  }
  render() {
    const { keypair,isFetching } = this.props
    const func = {
      Modalfunc: this.Modalfunc,
      loadData: ()=> this.loadData()
    }
    const columns = [
      { title: '名称', dataIndex: 'name', key: 'name',width:'35%' },
      { title: '指纹', dataIndex: 'fingerprint', key: 'fingerprint',width:'50%'},
      {
        title: '操作', dataIndex: 'action', key: 'action',width:'15%',
        render: (text,row) => <Button type="ghost" onClick={()=> this.setState({delete: true,currentName: row.name})}>删除</Button>
      }
    ];
    const data = this.state.dataList
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange:(selectedRowKeys,selectRows) => {
        this.setState({selectedRowKeys,selectRows})
      }
    }
    const paginationOpts = {
      simple:true,
      pageSize: 10,
    }
    return (
      <QueueAnim>
        <div key="Keypairs" id="base-keypairs">
          <Title title="SSH密钥对" />
          <div className="top-row">

            <Button size="large" onClick={()=> this.crateBtn()} type="primary"><i className="fa fa-plus" /> 创建密钥对</Button>
            <Button size="large" onClick={()=> this.crateBtn('upload')} type="primary"><i className="fa fa-upload" /> 上传密钥对</Button>
            <Button size="large" type="ghost" onClick={()=> this.loadData()}><i className='fa fa-refresh' /> 刷新</Button>
            <Input placeholder="请输入名称搜索"  onPressEnter={()=> this.queryList()} size="large" style={{width:180,paddingRight:20}}
             id="searchInput"/>
            <i className="fa fa-search btn-search" onClick={()=> this.queryList()} />
          </div>
          <Card bodyStyle={{padding:0}}>
            <Table columns={columns}
              dataSource={data}
              pagination={ paginationOpts }
              expandedRowRender={record => <p>公钥：{record.publicKey}</p>}
              className="strategyTable"
              rowKey={record => record.name}
              loading={isFetching}
            />
            {data && data.length >0 ?
              <span className="pageCount" style={{position:'absolute',right:'160px',top:'-40px'}}>共计 {data.length} 条</span>
              :null
            }
          </Card>
          {
            this.state.create &&
            <CreateModal func={func} upload={this.state.upload} data={keypair} project={this.state.currentProject}/>
          }
          { this.state.delete &&
            <Modal title="删除操作" visible={true}
              onCancel={()=> this.setState({delete: false})}
              onOk={()=> this.hanldRemove()}
              loading={this.state.deleteing}
              >
              <div className="alertRow">确定要删除 {this.state.currentName} ?</div>
            </Modal>
          }
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { keypairs } = state.openstack
  const keypair = keypairs.keypairs || []
  let ycProjects = state.user.ycProjects || {}
  if(ycProjects.result) {
    ycProjects.projects = ycProjects.result.projects
  }
  return {
    keypair,
    isFetching: keypairs.isFetching,
    ycProjects
  }
}

export default connect(mapStateToProps,{
  getKeypairList,
  deleteKeypair,
  clearKeyPair
})(Keypairs)