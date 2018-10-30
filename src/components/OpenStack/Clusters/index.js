/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * cluster Tabs component
 *
 * v0.1 - 2017-9-17
 * @author Baiyu
 */

import React,{ Component } from 'react'

import { Card, Button,Table, Modal, Menu, Dropdown, Input, InputNumber, Slider,Row,Col, Select } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { getClusterList,deleteCluster,clearCluster, scaleBay } from '../../../actions/openstack/lb'

import './style/index.less'
import Title from '../../Title'
import CreateModal from './CreateCluster'
import { formatDate } from '../../../common/tools'
import notificatHandler from '../../../common/notification_handler'
const Option = Select.Option
const notificat = new notificatHandler()

class Cluster extends Component {
  constructor(props) {
    super()
    this.state = {
      selectedRowKeys:[],
      dataList:[],
      current: {}
    }
  }
  componentWillMount() {
    this.loadData()
  }
  componentWillUnmount() {
    this.props.clearCluster()
  }
  loadData(e) {

    this.props.getClusterList({project: this.state.currentProject}, {
      success:{
        func:(res)=> {
          this.setState({dataList: res.bays})
        }
      },
      finally:{
        func:()=> {
          if (e) {
            document.getElementById('searchInput').value = ''
          }
        }
      }
    })
  }
  Modalfunc = (e)=> {
    this.setState({create: e})
  }
  queryList() {
    if(!this.state.currentProject) {
      return
    }
    const inputValue = document.getElementById('searchInput').value
    const { bays } = this.props
    if (!inputValue) {
      this.setState({
        dataList: bays
      })
      return
    }
    const newList = bays.filter(list => {
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
  startCreate() {

    this.setState({create: true})
    setTimeout(()=> {
      document.getElementById('name').focus()
    },400)
  }
  deleteAction() {
    if(!this.state.currentProject) {
      return
    }
    const { current } = this.state
    const body ={
      uuid: current.uuid,
      model:current.baymodelId
    }
    notificat.spin('删除集群中...')
    this.setState({delete: false})
    this.props.deleteCluster(body,{project: this.state.currentProject},{
      success:{
        func:()=> {
          notificat.success('删除操作已提交')
          this.loadData()
        },
        isAsync: true
      },
      failed:{
        func:(res)=> {
          if (res.statusCode == 400) {
            notificat.info('删除操作已提交，稍后手动刷新查看状态')
            return
          }
          let message =''
          try {
            message = res.message.errors[0].detail
          } catch (error) {
          }
          notificat.error('删除操作失败',message)
        },
        isAsync: true
      },
      finally:{
        func:()=> {
          notificat.close()
        }
      }
    })
  }
  renderExpand(record) {
    return (<div className="ant-expand">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>链接</th>
            <th>Master节点地址</th>
            <th>Slave节点地址</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{record.uuid}</td>
            <td style={{whiteSpace:'pre'}}>{record.links.map(list => list.href).join('\n')}</td>
            <td style={{whiteSpace:'pre'}}>{record.masterAddresses.join('\n')}</td>
            <td style={{whiteSpace:'pre'}}>{record.nodeAddresses.join('\n')}</td>
          </tr>
        </tbody>
      </table>
    </div>)
  }

  scaleBay() {
    const { inputValue, current } = this.state
    if(!inputValue) {
      return notificat.warn("节点数量应大于0")
    }
    this.setState({
      scaleLoading: true
    })
    const _this = this
    this.props.scaleBay(current.uuid, {
      value: inputValue,
      op: 'replace'
    }, {
      success: {
        func: () => {
          notificat.success('扩缩容请求已发送成功')
          setTimeout(() => {
            _this.props.loadData()
          }, 1000)
        },
        isAsync: true
      },
      failed: {
        func:() => {
          notificat.warn('扩缩容请求处理失败，请稍后重试')
        }
      },
      finally: {
        func: () => {
          this.setState({
            scaleLoading: false,
            resise: false
          })
        }
      }
    })
  }
  render() {
    const columns = [
      { title: '名称', dataIndex: 'name', key: 'name' },
      {
        title: '集群模板',
        dataIndex: 'age',
        key: 'age',
        render: (text,row)=> {
          return row.name + '-baymodel'
        }
      },
      { title: 'Master节点数目', dataIndex: 'masterCount', key: 'address' },
      { title: 'Slave节点数目', dataIndex: 'nodeCount', key: 'x'},
      { title: '状态', dataIndex: 'status', key: 'status',
        render: text => {
          switch(text) {
            case 'CREATE_COMPLETE': {
              return '创建成功'
            }
            case 'CREATE_IN_PROGRESS':{
              return '创建中'
            }
            case 'DELETE_IN_PROGRESS':{
              return '删除中'
            }
            case 'DELETE_FAILED':{
              return '删除失败'
            }
            case 'CREATE_FAILED':{
              return '创建失败'
            }
            case 'UPDATE_IN_PROGRESS': {
              return '更新中'
            }
            case 'UPDATE_COMPLETE': {
              return '更新完成'
            }
            case 'UPDATE_FAILED': {
              return '更新失败'
            }
            default: return text
          }
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'create_time',
        render:text => {
          if (!text) {
            return '-'
          }
          return formatDate(text)
        }
      },
      {
        title: '操作', dataIndex: 'action', key: 'action',
        render:(text,row)=> {
         // return <Button type="ghost" onClick={()=> this.setState({delete: true,current: row})}>删除</Button>
          const menus =(
            <Menu onClick={() => this.setState({resise: true,current: row, inputValue: row.nodeCount})}  style={{width:80}}>
                <Menu.Item key="resize" disabled={ (row.status != 'CREATE_COMPLETE' && row.status != 'UPDATE_COMPLETE')  }>扩缩容</Menu.Item>
            </Menu>
          )
          return <Dropdown.Button type="ghost" trigger={['click']} overlay={menus} onClick={()=> this.setState({delete: true,current: row})}>删除</Dropdown.Button>
        }
      }
    ];

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
    const func = {
      Modalfunc: this.Modalfunc,
      loadData: ()=> this.loadData
    }
    const { dataList } = this.state
    return (
      <QueueAnim>
        <div key="cluster" id="base-cluster">
          <Title title="容器集群" />
          <div className="top-row">

            <Button size="large" onClick={()=> this.startCreate()} type="primary"><i className="fa fa-plus" /> 创建集群</Button>
            <Button size="large" type="ghost" onClick={()=> this.loadData(true)}><i className='fa fa-refresh' /> 刷新</Button>
            <Input placeholder="请输入名称搜索"  onPressEnter={()=> this.queryList()} size="large" style={{width:180,paddingRight:20}}
             id="searchInput"/>
            <i className="fa fa-search btn-search" onClick={()=> this.queryList()} />
          </div>
          <Card bodyStyle={{padding:0}}>
              {/* expandedRowRender={record => <p>{record.description}</p>} */}
              {/* rowSelection={rowSelection} */}
            <div style={{height:'10px'}}></div>
            <Table columns={columns}
              dataSource={dataList}
              expandedRowRender={record => this.renderExpand(record)}
              pagination={ paginationOpts }
              className="strategyTable"
              rowKey="uuid"
              loading={this.props.isFetching}
            />
            {dataList && dataList.length >0 ?
              <span className="pageCount" style={{position:'absolute',right:'160px',top:'-40px'}}>共计 {dataList.length} 条</span>
              :null
            }
          </Card>
          {
            this.state.create && <CreateModal func={func} data={this.props.bays} project={this.state.currentProject}/>
          }
          {
            this.state.delete ?
            <Modal title="删除集群"
              visible={true}
              maskClosable={false}
              onCancel={()=>  this.setState({delete: false})}
              onOk={()=> this.deleteAction()}
              >
              <div className="alertRow">确定要删除集群 {this.state.current.name}？</div>
            </Modal>
            :null
          }
          {
            this.state.resise ?
            <Modal title="扩缩集群" visible={true}
              onCancel={()=> this.setState({resise: false})}
              maskClosable={false}
              onOk = {() => this.scaleBay()}
              confirmLoading = {this.state.scaleLoading}
              >
              <Row gutter={10}>
                <Col span={16}>
                  <Slider min={1} max={50}  onChange={(e)=> this.setState({inputValue: e})} value={this.state.inputValue} />
                </Col>
                <Col span={4}>
                  <InputNumber min={1} max={50}
                    onChange={(e)=> this.setState({inputValue: e})}
                    value={this.state.inputValue}
                  />
                </Col>
              </Row>
            </Modal>
            :null
          }
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const { cluster } = state.openstack
  const isFetching = cluster.isFetching || false
  const bays = cluster.bays || []
  let ycProjects = state.user.ycProjects || {}
  if(ycProjects.result) {
    ycProjects.projects = ycProjects.result.projects
  }
  return {
    isFetching,
    bays,
    ycProjects

  }
}

export default connect(mapStateToProps,{
  getClusterList,
  deleteCluster,
  clearCluster,
  scaleBay
})(Cluster)