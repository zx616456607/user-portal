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
import { Modal, Menu, Dropdown, Table, Button, Input } from 'antd'
import { browserHistory } from 'react-router'
import { camelize } from 'humps'
import { loadProjectRepos, deleteRepo } from '../../../../actions/harbor'
import { encodeImageFullname } from '../../../../common/tools'
import NotificationHandler from '../../../../components/Notification'
import '../style/CodeRepo.less'
import ProjectDetail from '../ProjectDetail'
import PublishModal from './PublishModal'
import { DEFAULT_REGISTRY } from '../../../../constants'
import TenxIcon from '@tenx-ui/icon/es/_old'
import codeRepoIntl from './intl/codeRepoIntl'
import { injectIntl } from 'react-intl'
import { ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN } from '../../../../../constants/index'

const notification = new NotificationHandler()

class PageCodeRepo extends Component {
  constructor(props) {
    super()
    this.state = {
      downloadModalVisible: false,
      uploadModalVisible: false,
      imageDetailModalShow: false,
      searchInput: '',
      deleteRepoVisible: false,
      selectedRepo: '',
      current: 1,
    }
    this.DEFAULT_QUERY = {
      page: 1,
      page_size: 10,
      project_id: props.params.id,
      detail: 1,
    }
    this.closeImageDetailModal= this.closeImageDetailModal.bind(this)
    this.deleteRepoOk= this.deleteRepoOk.bind(this)
    this.loadRepos = this.loadRepos.bind(this)
    this.searchProjects = this.searchProjects.bind(this)
    this.confirmPublishModal = this.confirmPublishModal.bind(this)
  }

  componentWillMount() {
    const { params, location } = this.props
    const { imageName } = location.query || {}
    let q
    if (imageName !== '' && imageName !== undefined) {
      q = imageName.split('/')[1]
      this.setState({
        imageDetailModalShow: true,
        currentImage: { name: imageName },
        searchInput: q,
      })
    }
    this.loadRepos({ q })
  }
  componentDidUpdate() {
    let searchInput = document.getElementsByClassName('search')[0]
    searchInput && searchInput.focus()
  }
  loadRepos(query) {
    const { loadProjectRepos, registry, location, harbor } = this.props
    const { imageName } = location.query || {}
    if(query && query.page) {
      this.setState({
        current: query.page,
      })
    }
    loadProjectRepos(registry, Object.assign({}, this.DEFAULT_QUERY, query, { harbor }), {
      success: {
        func: res => {
          res.data && res.data.forEach(image => {
            if (image.name === imageName) {
              this.setState({
                imageDetailModalShow: true,
                currentImage: image,
              })
            }
          })
        },
        isAsync: true,
      }
    })
  }

  deleteRepoOk() {
    const { deleteRepo, harbor, intl } = this.props
    const { formatMessage } = intl
    const { selectedRepo } = this.state
    const doSuccess = () => {
      notification.success(formatMessage(codeRepoIntl.delMessage, {repo: selectedRepo}))
      this.setState({
        deleteRepoVisible: false,
      })
      // this.loadRepos({ page: 1 })
      this.loadRepos({ page: this.state.current })
    }
    let processedImageName = encodeImageFullname(selectedRepo)
    deleteRepo(harbor, DEFAULT_REGISTRY, processedImageName, {
      success: {
        func: () => {
          doSuccess()
        },
        isAsync: true,
      },
      failed: {
        func: err => {
          const { statusCode } = err
          if (statusCode === 404) {
            doSuccess()
            return
          }
          if (statusCode === 403) {
            notification.warn(formatMessage(codeRepoIntl.cannotDelMessage))
            this.setState({
              deleteRepoVisible: false,
            })
            return
          }
          if (statusCode === 503) {
            notification.warn(formatMessage(codeRepoIntl.prohibitDelMessage))
            this.setState({
              deleteRepoVisible: false,
            })
            return
          }
          notification.warn(formatMessage(codeRepoIntl.delFailedMessage))
        },
      }
    })
  }

  searchProjects() {
    const { registry } = this.props
    this.loadRepos({ q: this.state.searchInput })
  }

  showUpload(visible) {
    this.setState({uploadModalVisible:visible})
  }

  showDownload(visible) {
    this.setState({downloadModalVisible:visible})
  }

  showImageDetail(item) {
    //this function for user select image and show the image detail info
    this.setState({
      imageDetailModalShow: true,
      currentImage: item
    });
  }

  closeImageDetailModal(){
    this.setState({imageDetailModalShow:false})
  }

  confirmPublishModal() {
    this.setState({
      publishModal: false,
      currentImage: ''
    })
  }

  render() {
    const { repos, projectDetail, isAdminAndHarbor, location, user, members, currentUserRole, intl } = this.props
    const { publishModal, currentImage } = this.state
    const { formatMessage } = intl
    let { isFetching, list, server, total } = repos || {}
    list = list || []
    server = server || ''
    server = server.replace('http://', '').replace('https://', '')
    let currentMember = {}
    members.every(member => {
      if (member.username === user.userName || member.entityName === user.userName) {
        currentMember = member
        return false
      }
      return true
    })
    const isAbleToDel = [ 1,2 ].indexOf(currentMember.roleId) > -1 ||
      [ ROLE_SYS_ADMIN, ROLE_PLATFORM_ADMIN, ROLE_BASE_ADMIN ].indexOf(user.role) > -1

    const columns = [
      {
        title: '镜像名',
        dataIndex: 'name',
        key: 'name',
        width:'33%',
        render: (text, row) => {
          return (
            <div className="imageList">
              <div className="imageBox">
                <div className="appcenterlogo">
                  <TenxIcon type="app-center-logo"/>
                </div>
              </div>
              <div className="contentBox">
                <span className="title" onClick={()=> this.showImageDetail(row)}>
                  {text.substring(text.indexOf('/') + 1)}
                </span>
              </div>
            </div>
          )
        }
      }, {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
        width:'33%',
        render: (text, row) => {
          return (
            <div className="imgurl">{formatMessage(codeRepoIntl.imageUrl)}：{server}/{row.name}</div>
          )
        }
      }, {
        title: '版本数',
        dataIndex: 'count',
        key: 'count',
        render: (text, row) => {
          return (
            <div className="imgurl">{formatMessage(codeRepoIntl.versionNumber)}：{row.tagsCount}</div>
          )
        }
      }, {
        title: '下载',
        dataIndex: camelize('pull_count'),
        key: camelize('pull_count'),
        width:'14%',
        render: text => {
          return (
            <div>{formatMessage(codeRepoIntl.downloadCount)}：{text}</div>
          )
        }
      }, {
        title: '部署',
        dataIndex: 'icon',
        key: 'icon',
        width:'120px',
        render: (text, row) => {
          const dropdown = (
            <Menu onClick={({key}) => {
                if (key === 'delete') {
                  this.setState({
                    deleteRepoVisible: true,
                    selectedRepo: row.name
                  })
                }
                if (key === 'publish') {
                  this.setState({
                    publishModal: true,
                    currentImage: row
                  })
                }
              }}
              style={{ width: "100px" }}
            >
              <Menu.Item key="publish">
                {formatMessage(codeRepoIntl.publish)}
              </Menu.Item>
              <Menu.Item key="delete" disabled={!isAbleToDel}>
                {formatMessage(codeRepoIntl.delThis)}
              </Menu.Item>
            </Menu>
          );
          return (
            <Dropdown.Button overlay={dropdown} type="ghost" onClick={() => browserHistory.push(`/app_manage/app_create/quick_create?registryServer=${server}&imageName=${row.name}`)}>
              {formatMessage(codeRepoIntl.DeployService)}
            </Dropdown.Button>
          )
        }
      }
    ]

    const paginationOpts = {
      size: "small",
      pageSize: this.DEFAULT_QUERY.page_size,
      current: this.state.current,
      total: total,
      onChange: current => this.loadRepos({ page: current }),
      showTotal: total => `${formatMessage(codeRepoIntl.total, { total: total })}`,
    }

    return (
      <div id="codeRepo">
        <div className="topRow">
          <Button type="primary" size="large" icon="cloud-upload-o" onClick={()=> this.showUpload(true)}>{formatMessage(codeRepoIntl.uploadImage)}</Button>
          <Button type="ghost" size="large" icon="cloud-download-o" onClick={()=> this.showDownload(true)}>{formatMessage(codeRepoIntl.downloadImage)}</Button>

          <Input
            placeholder={formatMessage(codeRepoIntl.searchPlaceholder)}
            className="search"
            size="large"
            value={this.state.searchInput}
            onChange={e => this.setState({ searchInput: e.target.value })}
            onPressEnter={this.searchProjects}
          />
          <i className="fa fa-search" onClick={this.searchProjects}></i>
          {/*{total >0?
          <span className="totalPage">共计：{total || 0} 条</span>
          :null
          }*/}
        </div>
        <Table
          showHeader={false}
          className="myImage_item"
          dataSource={list}
          columns={columns}
          locale={{emptyText: formatMessage(codeRepoIntl.noData)}}
          pagination={paginationOpts}
          loading={isFetching}
        />
        <PublishModal
          server={server}
          visible={publishModal}
          currentImage={currentImage}
          callback={this.confirmPublishModal}
        />
        <Modal title={formatMessage(codeRepoIntl.uploadImage)} className="uploadImageModal" visible={this.state.uploadModalVisible} width="800px"
          onCancel={()=> this.showUpload(false)} onOk={()=> this.showUpload(false)}
         >
          <p>1.&nbsp;&nbsp;{formatMessage(codeRepoIntl.uploadImageStep1)}</p>
          <pre className="codeSpan">
            sudo docker login {server}
          </pre>
          <p>2.&nbsp;&nbsp; {formatMessage(codeRepoIntl.uploadImageStep2)}</p>
          <pre className="codeSpan">
            {`sudo docker tag ubuntu:latest ${server}/${projectDetail.name}/<image name>:<tag>`}
          </pre>
          <p>3.&nbsp;&nbsp;{formatMessage(codeRepoIntl.uploadImageStep3)}</p>
          <pre className="codeSpan">
            {`sudo docker push ${server}/${projectDetail.name}/<image name>:<tag>`}
          </pre>
        </Modal>
        <Modal title="下载镜像" className="uploadImageModal" visible={this.state.downloadModalVisible} width="800px"
          onCancel={()=> this.showDownload(false)} onOk={()=> this.showDownload(false)}
        >
          <p>{formatMessage(codeRepoIntl.downloadImageStep1)}</p>
          <p><i className="fa fa-exclamation-triangle"></i>&nbsp;{formatMessage(codeRepoIntl.downloadImageStep2)}</p>
          <pre className="codeSpan">
            {`sudo docker pull ${server}/${projectDetail.name}/<image name>:<tag>`}
          </pre>
          <p><i className="fa fa-exclamation-triangle"></i>&nbsp;{formatMessage(codeRepoIntl.downloadImageStep3)}</p>
          <pre className="codeSpan">
            sudo docker tag  {server}/{projectDetail.name}/hello-world:latest {projectDetail.name}/hello-world:latest
            </pre>
        </Modal>
        {
          this.state.imageDetailModalShow ?
          <Modal
            visible={this.state.imageDetailModalShow}
            className="AppServiceDetail"
            transitionName="move-right"
            onCancel={()=> this.setState({imageDetailModalShow:false})}
          >
            <ProjectDetail
              currentUserRole={currentUserRole}
              isAdminAndHarbor={isAdminAndHarbor}
              location={location} server={server}
              scope={this}
              config={this.state.currentImage}
              project_id={this.props.params.id}
            />
          </Modal>
          :
          null
        }
        {/* 删除镜像 Modal */}
        <Modal title={formatMessage(codeRepoIntl.delImageTitle)} visible={this.state.deleteRepoVisible}
          onCancel={()=> this.setState({deleteRepoVisible:false})}
          onOk={()=> this.deleteRepoOk()}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            {formatMessage(codeRepoIntl.delImageConfirm, {image: this.state.selectedRepo})}?
          </div>
        </Modal>
      </div>
    )
  }
}
const CodeRepo = injectIntl(PageCodeRepo, {
  withRef: true
})
function mapStateToProps(state, props) {
  const { harbor: stateHarbor, entities } = state
  const { loginUser } = entities
  const user = loginUser.info

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    repos: stateHarbor.repos || {},
    user,
    harbor,
    members:stateHarbor.members.list
  }
}

export default connect(mapStateToProps, {
  loadProjectRepos,
  deleteRepo,
})(CodeRepo)

