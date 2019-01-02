/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Host self build
 *
 * @author zhangxuan
 * @date 2018-11-27
 */
import React from 'react'
import { connect } from 'react-redux'
import { Row, Col } from 'antd'
import * as ClusterActions from '../../../../src/actions/cluster'
import AddClusterOrNodeModalContent from '../../../../src/components/ClusterModule/AddClusterOrNodeModal/Content'
import { getDeepValue } from '../../../util/util'
import { camelize } from 'humps'

const mapStateToProps = state => {
  const addClusterCMD = getDeepValue(state, [ 'cluster', 'addClusterCMD', 'result' ])
  const loginUser = getDeepValue(state, [ 'entities', 'loginUser', 'info' ])
  return {
    addClusterCMD,
    loginUser,
  }
}
@connect(mapStateToProps, {
  getAddClusterCMD: ClusterActions.getAddClusterCMD,
})
export default class SelfBuild extends React.PureComponent {

  componentDidMount() {
    const { getAddClusterCMD } = this.props
    getAddClusterCMD()
  }
  render() {
    const { addClusterCMD, loginUser } = this.props
    const { tenxApi } = loginUser
    let cmd = addClusterCMD && addClusterCMD[camelize('default_command')] || ''
    cmd = cmd.replace('ADMIN_SERVER_URL', `${tenxApi.protocol}://${tenxApi.host}`)
    return (
      <Row>
        <Col offset={2} style={{ paddingLeft: 8 }}>
          <AddClusterOrNodeModalContent
            CMD={cmd}
          />
        </Col>
      </Row>
    )
  }
}
