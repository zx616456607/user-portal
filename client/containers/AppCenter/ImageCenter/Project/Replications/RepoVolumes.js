/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/* RepoReadOnly(tab) for RepoManager
 *
 * v0.1 - 2018-11-26
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import { Progress, Row, Col } from 'antd'
import Notification from '../../../../../../src/components/Notification'
import * as harborAction from '../../../../../../src/actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../../../src/constants'
import './style/RepoVolumes.less'

const notification = new Notification()
class RepoVolumes extends React.Component {

  componentDidMount() {
    const { getSysteminfoVolumes } = this.props
    getSysteminfoVolumes(DEFAULT_REGISTRY, {
      failed: {
        func: error => {
          if (error.statusCode === 403) {
            return null
          }
          notification.warn('获取存储容量失败')
        },
      },
    })
  }

  render() {
    const { storage: { total, free } } = this.props
    const all = Math.round(total / 1024 / 1024 / 1024)
    const used = Math.round((total - free) / 1024 / 1024 / 1024)
    const percent = (used / all * 100).toFixed(2)
    // 普通用户无权限，仓库组中不显示
    if (!total && !free) {
      return null
    }
    return <Row className="repoVolumesRow">
      <Col style={{ padding: 0 }}>
        &nbsp;存储容量( {used} G / {all} G )&nbsp;
      </Col>
      <Col className="ant-col-14">
        <Progress percent={percent}/>
      </Col>
    </Row>
  }
}

const mapStateToProps = ({
  harbor: { volumes: { data } },
}) => ({
  storage: data && data.storage || {},
})

export default connect(mapStateToProps, {
  getSysteminfoVolumes: harborAction.getSysteminfoVolumes,
})(RepoVolumes)
