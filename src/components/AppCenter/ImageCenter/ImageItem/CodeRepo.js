/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CodeRepo component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Tabs, Menu, Dropdown, Table, Icon, Button, Card, Input } from 'antd'
import { Link, browserHistory } from 'react-router'
import { camelize } from 'humps'
import { loadProjectRepos } from '../../../../actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../constants'
import '../style/CodeRepo.less'
import ProjectDetail from '../ProjectDetail'

class CodeRepo extends Component {
  constructor(props) {
    super()
    this.closeImageDetailModal= this.closeImageDetailModal.bind(this)
    this.state = {
      downloadModalVisible: false,
      uploadModalVisible: false,
      imageDetailModalShow: false
    }
    this.loadRepos = this.loadRepos.bind(this)
  }

  componentWillMount() {
    const { params } = this.props
    this.loadRepos(DEFAULT_REGISTRY, { page_size: 10, project_id: params.id, detail: 1 })
  }

  loadRepos(registry, query) {
    const { loadProjectRepos } = this.props
    loadProjectRepos(registry, query)
  }

  showUpload(visible) {
    this.setState({uploadModalVisible:visible})
  }
  showDownload(visible) {
    this.setState({downloadModalVisible:visible})
  }
  showImageDetail (item) {
    //this function for user select image and show the image detail info
    console.log('item detail ',item)
    this.setState({
      imageDetailModalShow: true,
      currentImage: item
    });
  }
  closeImageDetailModal(){
    this.setState({imageDetailModalShow:false})
  }
  render() {
    const { repos } = this.props
    let { isFetching, list, server } = repos || {}
    list = list || []
    server = server || ''
    server = server.replace('http://', '').replace('https://', '')
    const columns = [
      {
        title: '镜像名',
        dataIndex: 'name',
        key: 'name',
        render: (text, row) => {
          return (
            <div className="imageList">
              <div className="imageBox">
                <svg className='appcenterlogo'>
                  <use xlinkHref='#appcenterlogo' />
                </svg>
              </div>
              <div className="contentBox">
                <span className="title" onClick={()=> this.showImageDetail(row)}>
                  {text}
                </span>
              </div>
            </div>
          )
        }
      }, {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
        render: (text, row) => {
          return (
            <div className="imgurl">镜像地址：{server}/{row.name}</div>
          )
        }
      }, {
        title: '下载',
        dataIndex: camelize('pull_count'),
        key: camelize('pull_count'),
        render: text => {
          return (
            <div>下载次数：{text}</div>
          )
        }
      }, {
        title: '部署',
        dataIndex: 'icon',
        key: 'icon',
        render: (text, row) => {
          const dropdown = (
            <Menu onClick={() => this.setState({ delModal: true, imageName: row.name })}
              style={{ width: "100px" }}
            >
              <Menu.Item key={row.id}>
                删除
              </Menu.Item>
            </Menu>
          );
          return (
            <Dropdown.Button overlay={dropdown} type="ghost" trigger={['click']} onClick={() => browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${server}&imageName=${row.name}`)}>
              部署服务
            </Dropdown.Button>
          )
        }
      }
    ]

    return (
      <div id="codeRepo">
        <div className="topRow">
          <Button type="primary" size="large" icon="cloud-upload-o" onClick={()=> this.showUpload(true)}>上传镜像</Button>
          <Button type="ghost" size="large" icon="cloud-download-o" onClick={()=> this.showDownload(true)}>下载镜像</Button>

          <Input placeholder="搜索" className="search" size="large" />
          <i className="fa fa-search"></i>
          <span className="totalPage">共计：{list.length || 0} 条</span>
        </div>
        <Table
          showHeader={false}
          className="myImage_item"
          dataSource={list}
          columns={columns}
          pagination={{ simple: true }}
          loading={isFetching}
        />
        <Modal title="上传镜像" className="uploadImageModal" visible={this.state.uploadModalVisible} width="800px"
          onCancel={()=> this.showUpload(false)} onOk={()=> this.showUpload(false)}
         >
          <p>1.&nbsp;&nbsp;在本地 docker 环境中输入以下命令进行登录</p>
          <pre className="codeSpan">
            sudo docker login {server}
          </pre>
          <p>2.&nbsp;&nbsp; 然后，对本地需要 push 的 image 进行标记，比如：</p>
          <pre className="codeSpan">
            {`sudo docker tag tenxcloud/ubuntu:latest ${this.props.server}/<username>/<image name>:<tag>`}
          </pre>
          <p>3.&nbsp;&nbsp;最后在命令行输入如下命令，就可以 push 这个 image 到镜像仓库中了</p>
          <pre className="codeSpan">
            {`sudo docker push ${server}/<username>/<image name>:<tag>`}
          </pre>
        </Modal>
        <Modal title="下载镜像" className="uploadImageModal" visible={this.state.downloadModalVisible} width="800px"
          onCancel={()=> this.showDownload(false)} onOk={()=> this.showDownload(false)}
        >
          <p>在本地 docker 环境中输入以下命令，就可以 pull 一个镜像到本地了</p>
          <p><i className="fa fa-exclamation-triangle"></i>&nbsp;私有镜像需要先 login 后才能拉取</p>
          <pre className="codeSpan">
            {`sudo docker pull ${server}/<username>/<image name>:<tag>`}
          </pre>
          <p><i className="fa fa-exclamation-triangle"></i>&nbsp;为了在本地方便使用，下载后可以修改tag为短标签，比如：</p>
          <pre className="codeSpan">
            sudo docker tag  {server}/tenxcloud/hello-world:latest tenxcloud/hello-world:latest
            </pre>
        </Modal>
        <Modal
          visible={this.state.imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={()=> this.setState({imageDetailModalShow:false})}
        >
          <ProjectDetail server={server} scope={this} config={this.state.currentImage}/>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { harbor } = state
  return {
    repos: harbor.repos || {},
  }
}

export default connect(mapStateToProps, {
  loadProjectRepos,
})(CodeRepo)
