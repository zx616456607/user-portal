/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * DetailInfo component
 *
 * v0.1 - 2017-12-08
 * @author Zhangcz
 */

import React, { Component } from 'react'
import { Card, Button, Spin } from 'antd'
import './style/DetailInfo.less'
import MarkdownEditor from '../../../Editor/Markdown'
import NotificationHandler from '../../../../components/Notification'
import { getImageDetailInfo, putEditImageDetailInfo } from '../../../../actions/harbor'
import { connect } from 'react-redux'
import { camelize } from 'humps'
import { injectIntl } from 'react-intl'
import detailInfoIntl from './intl/detailInfo'

class DetailInfo extends Component {
  constructor(props) {
    super(props)
    this.loadImageDetailInfo = this.loadImageDetailInfo.bind(this)
    this.state = {
      editor: false,
      detailInfo: '',
      loading: false,
    }
  }

  componentWillMount() {
    this.loadImageDetailInfo()
  }

  componentWillReceiveProps(nextProps) {
    const { imageName, project_id } = this.props
    const { imageName: nextImageName} = nextProps
    if (imageName !== nextImageName) {
      const { getImageDetailInfo, registry, imageName, harbor } = nextProps
      const name = encodeURIComponent(imageName)
      const body = {
        registry,
        name,
        q: imageName,
        project_id,
      }
      getImageDetailInfo(harbor, body)
    }
  }

  loadImageDetailInfo() {
    const { getImageDetailInfo, registry, imageName, harbor, project_id } = this.props
    const name = encodeURIComponent(imageName)
    const body = {
      registry,
      name,
      q: imageName,
      project_id,
    }
    getImageDetailInfo(harbor, body)
  }

  handEdit() {
    const { currnetImageInfo } = this.props
    const { markdownData } = currnetImageInfo
    this.setState({
      editor: true,
      markdownValue: markdownData,
    })
  }

  onChangeDockerFile(e) {
    //this functio for the editor ccallback
    this.setState({
      detailInfo: e
    })
  }

  updateImageInfo() {
    const { putEditImageDetailInfo, registry, imageName, harbor, intl } = this.props
    const { formatMessage } = intl
    const { detailInfo } = this.state
    let notification = new NotificationHandler()
    const name = encodeURIComponent(imageName)
    const nameArray = imageName.split('/')
    const config = {
      registry,
      name,
      body: {
        description: detailInfo,
      }
    }
    this.setState({
      loading: true,
    })
    notification.spin(formatMessage(detailInfoIntl.inUpdate, {name: nameArray[1]}))
    putEditImageDetailInfo(harbor, config, {
      success: {
        func: () => {
          notification.close()
          notification.success(formatMessage(detailInfoIntl.updateSuccess, {name: nameArray[1]}))
          this.loadImageDetailInfo()
          this.setState({
            editor: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notification.close()
          notification.error(formatMessage(detailInfoIntl.updateFailure, {name: nameArray[1]}))
        }
      },
      finally: {
        func: () => {
          this.setState({
            loading: false,
          })
        }
      }
    })
  }

  render() {
    const { formatMessage } = this.props.intl
    const { markdownValue, loading } = this.state
    const { currnetImageInfo, projectMembers, loginUser } = this.props
    const isAdmin = loginUser.harbor[camelize('has_admin_role')] == 1
    const members = projectMembers.list || []
    const { htmlData, isFetching, markdownData } = currnetImageInfo
    if (isFetching) {
      return <Card className="imageDetailInfo markdown"><Spin /></Card>
    }
    let currentMember = {}
    members.every(member => {
      if (member.username === loginUser.userName) {
        currentMember = member
        return false
      }
      return true
    })
    const currentUserRole = currentMember[camelize('role_id')]
    let htmlValue = `<p>${formatMessage(detailInfoIntl.hasNotBeenAddInfoYet)}</p>`
    if (htmlData) {
      htmlValue = htmlData
    }
    if (markdownData) {
      htmlValue = markdownData
    }

    const editorOptions = {
      readOnly: false
    }
    return (
      <Card className="imageDetailInfo markdown">
        {/* 只有 管理人员 | 开发人员 | harbor管理员 才有权限编辑镜像基本信息 */}
        {
          !this.state.editor && (currentUserRole == 1 || currentUserRole == 2 || isAdmin)
            ? <div style={{ textAlign: 'right' }}><Button
              onClick={() => this.handEdit()}
              icon="edit"
            >
              {formatMessage(detailInfoIntl.edit)}
            </Button></div>
            : null
        }
        {
          this.state.editor
            ? <div className="editInfo">
              <div className="edit-tips">{formatMessage(detailInfoIntl.markdownSupport)}</div>
              <MarkdownEditor
                title={formatMessage(detailInfoIntl.baseInfo)}
                value={markdownValue}
                callback={this.onChangeDockerFile.bind(this)}
                options={editorOptions}
              />
              <div style={{ lineHeight: '50px' }} className="text-center">
                <Button
                  size="large"
                  type="ghost"
                  onClick={() => this.setState({ editor: false })}
                  style={{ marginRight: '10px' }}
                >
                  {formatMessage(detailInfoIntl.cancelText)}
                </Button>
                <Button
                  size="large"
                  type="primary"
                  onClick={() => this.updateImageInfo()}
                  loading={loading}
                >
                  {formatMessage(detailInfoIntl.okText)}
                </Button>
              </div>
            </div>
            : <div style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: htmlValue }}></div>
        }
      </Card>
    )
  }
}

DetailInfo.propTypes = {
  //
}

function mapStateToProps(state, props) {
  const { harbor: stateHarbor, entities } = state
  const { loginUser } = entities
  const { imageBasicInfo } = stateHarbor
  const { registry } = props
  let defaultImageInfo = {
    isFetching: true,
    markdownData: '',
    htmlData: '',
  }
  if (imageBasicInfo[ registry ]) {
    defaultImageInfo = imageBasicInfo[ registry ]
  }

  const { cluster } =  entities.current
  const { harbor: harbors } = cluster
  const harbor = harbors ? harbors[0] || "" : ""
  return {
    currnetImageInfo: defaultImageInfo,
    projectMembers: harbor.members || {},
    loginUser: loginUser.info,
    harbor,
  }
}

export default connect(mapStateToProps, {
  getImageDetailInfo,
  putEditImageDetailInfo,
})(injectIntl(DetailInfo,{ withRef: true }))
