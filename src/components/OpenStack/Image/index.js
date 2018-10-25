/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Image list component
 *
 * v0.1 - 2017-7-17
 * @author Baiyu
 */

import React,{ Component } from 'react'
import { Button, Input, Card, Table, Dropdown,Menu,Modal, Select } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { getImageList, clrearImageList} from '../../../actions/openstack/calculation_service'

import { camelize } from 'humps'
import NotificationHander from '../../../common/notification_handler'
import '../style/OpenStack.less'
const noti = new NotificationHander()
const Option = Select.Option

class Image extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  componentWillMount() {
    this.loadData()
  }
  componentWillUnmount() {
    this.props.clrearImageList()
  }
  changeProejct(value) {
    this.setState({
      currentProject: value
    })
    setTimeout(() => {
      this.loadData()
    }, 0)
  }
  loadData = ()=>{

    if(this.refs && this.refs.imageName && this.refs.imageName.refs) {
      this.refs.imageName.refs.input.value = ''
    }
    this.props.getImageList({
      project: this.state.currentProject
    }, {
      success: {
        func: (res) => {
          this.setState({
            imageList: res.images
          })
        }
      }
    })
  }
  queryList() {
    if(!this.state.currentProject) {
      return
    }
    const image = this.refs.imageName.refs.input.value
    const { imageList } = this.props

    if (!image) {
      this.setState({
        imageList: imageList
      })
      return
    }
    const newList = imageList.filter(list => {
      const search = new RegExp(image)
      if (search.test(list.name)) {
        return true
      }
      return false
    })
    this.setState({
      imageList: newList
    })
  }
  hostModalfunc = (visible) => {
    this.setState({hostModal: visible})
  }
  resiseModalfunc = (e) => {
    this.setState({resiseModal: e})
  }
  deleteAction(id) {
    this.setState({deleteMoal: true,id})
  }
  deleteMoalfunc() {
    console.log('ok delete.....')
  }
  formetSize(size) {
    if (!size) return '--'
    let total = size /1024
    if (size <1024) {
      return size +'Byte'
    }
    if (total <1024) {
      return total.toFixed(2)+' KB'
    }
    total = size / 1024/1024
    if (total <1024) {
      return total.toFixed(2) +' MB'
    }
    total = size / 1024/1024/1024
    if (total <1024) {
      return total.toFixed(2) +' GB'
    }
  }
  render() {
    const { isFetching } = this.props
    const { imageList } = this.state
    const columns = [
      {
        title: '镜像名称',
        dataIndex: 'name',
        key: 'name',
        width:'15%'
      }, {
        title: '镜像地址',
        dataIndex: 'self',
        key: 'self',
        width:'20%',
        render: text => <div className="textoverflow">{text}</div>
      }, {
        title: '磁盘格式',
        dataIndex: camelize('disk_format'),
        key: 'type',
        width:'10%'
      }, {
        title: '容器格式',
        dataIndex: camelize('container_format'),
        key: 'containerType',
        width:'10%'
      }, {
        title: '镜像大小',
        dataIndex: 'size',
        key: 'size',
        width:'15%',
        render: text => this.formetSize(text)
      },
    ]
    const paginationOpts = {
      simple: true,
      // current: this.state.currentPage,
      // onChange: current => this.setState({ currentPage: current }),
      pageSize: 10,
    }
    const funcCallback = {
      hostModalfunc: this.hostModalfunc
    }
    const resiseCallback = {
      resiseModalfunc: this.resiseModalfunc
    }
    return (
      <QueueAnim id="openstack">
        <div key="image" id="host-body">
          <div className="top-row">
            <Button type="ghost" size="large"  onClick={this.loadData}><i className='fa fa-refresh' /> 刷新</Button>
            <Input placeholder="请输入镜像名进行搜索" ref="imageName" onPressEnter={()=> this.queryList()} size="large" style={{width:180,paddingRight:20}}/>
            <i className="fa fa-search btn-search" onClick={()=> this.queryList()} />
          </div>
          <Card className="host-list">
            <Table dataSource={imageList} columns={columns} pagination={ paginationOpts } loading={isFetching} className="strategyTable" />
            {imageList &&imageList.length >0?
              <span className="pageCount">共计 {imageList.length} 条</span>
              :null
            }
          </Card>

        </div>
        <Modal title="删除操作"
          visible={this.state.deleteMoal}
          onCancel={()=> this.setState({deleteMoal: false})}
          onOk={()=> this.deleteMoalfunc()}
        >
          <div className="alertRow">确定要删除当前镜像？</div>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state,props) {
  // const { currentProject } = state.entities.loginUser.info
  // const projectID = currentProject ? currentProject.id : ''
  const { images } = state.openstack
  let imageList = []
  let isFetching
  if (images && images.result) {
    imageList = images.result.images
    isFetching = images.isFetching
  }

  let defaultYCProjects = {
    isFetching: false,
    projects:[]
  }
  let ycProjects = state.user.ycProjects || {}
  if(ycProjects.result) {
    ycProjects.projects = ycProjects.result.projects
  }
  return {
    imageList,
    isFetching,
    ycProjects
  }
}

export default connect(mapStateToProps, {
  getImageList,
  clrearImageList,
})(Image)