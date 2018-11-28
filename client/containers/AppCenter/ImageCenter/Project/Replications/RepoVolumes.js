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
import * as harborAction from '../../../../../../src/actions/harbor'
import { DEFAULT_REGISTRY } from '../../../../../../src/constants'
import './style/RepoVolumes.less'
class RepoVolumes extends React.Component {

  componentDidMount() {
    const { getSysteminfoVolumes } = this.props
    getSysteminfoVolumes(DEFAULT_REGISTRY)
  }

  render() {
    const { storage: { total, free } } = this.props
    const all = Math.round(total / 1024 / 1024 / 1024)
    const used = Math.round((total - free) / 1024 / 1024 / 1024)
    const percent = (used / all * 100).toFixed(2)
    return <Row className="repoVolumesRow">
      <Col style={{ padding: 0 }}>
        &nbsp;存储容量( {used} G / {all} G )&nbsp;
      </Col>
      <Col className="ant-col-16">
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
