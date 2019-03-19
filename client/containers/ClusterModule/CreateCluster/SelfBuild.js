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
import * as ClusterNodeActions from '../../../../src/actions/cluster_node'
import AddClusterOrNodeModalContent from '../../../../src/components/ClusterModule/AddClusterOrNodeModal/Content'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import { camelize } from 'humps'

const mapStateToProps = state => {
  const addClusterCMD = getDeepValue(state, [ 'cluster', 'addClusterCMD', 'result' ])
  const addNodeCMD = getDeepValue(state, [ 'cluster_nodes', 'addNodeCMD' ])
  const loginUser = getDeepValue(state, [ 'entities', 'loginUser', 'info' ])
  return {
    addClusterCMD,
    addNodeCMD,
    loginUser,
  }
}
@connect(mapStateToProps, {
  getAddClusterCMD: ClusterActions.getAddClusterCMD,
  getAddNodeCMD: ClusterNodeActions.getAddNodeCMD,
})
export default class SelfBuild extends React.PureComponent {

  componentDidMount() {
    const { getAddClusterCMD, getAddNodeCMD, isAddHost, clusterID } = this.props
    if (isAddHost) {
      getAddNodeCMD(clusterID)
      return
    }
    getAddClusterCMD()
  }
  render() {
    const { addClusterCMD, loginUser, isAddHost, clusterID, addNodeCMD } = this.props
    const { tenxApi } = loginUser
    let cmd = addClusterCMD && addClusterCMD[camelize('default_command')] || ''
    cmd = cmd.replace('ADMIN_SERVER_URL', `${tenxApi.protocol}://${tenxApi.host}`)
    if (isAddHost) {
      cmd = addNodeCMD[clusterID][camelize('default_command')]
    }
    return (
      <Row>
        <Col offset={isAddHost ? 0 : 2} style={{ paddingLeft: 8 }}>
          <AddClusterOrNodeModalContent
            CMD={cmd}
          />
        </Col>
      </Row>
    )
  }
}
