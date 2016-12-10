/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Spin, Alert, } from 'antd'
import './style/License.less'
import { loadLicense } from '../../../actions/entities'
import { connect } from 'react-redux'
import { formatDate } from '../../../common/tools'

class License extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    document.title = '授权管理 | 时速云'
    const { loadLicense } = this.props
    loadLicense()
  }

  getAlertType(code) {
    switch (code) {
      case 0:
        return 'success'
      case -1:
        return 'error'
      case 1:
      default:
        return 'warning'
    }
  }

  render() {
    const { isFetching, license } = this.props
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    return (
      <div id='License'>
        <Row className="licenseTitle">
          <Col>许可证信息</Col>
        </Row>
        <Row className="licenseMessage">
          <Col>
            <Alert
              type={this.getAlertType(license.plain.code)}
              message={license.message}
              showIcon />
          </Col>
        </Row>
        <table className="licenseTable">
          <tbody>
            <tr>
              <td className="tableTitle">许可证有效期:</td>
              <td className="itemContent">{formatDate(license.plain.expireDate)}</td>
            </tr>
            <tr>
              <td className="tableTitle">集群授权个数:</td>
              <td className="itemContent">{license.plain.clusterLimit}</td>
            </tr>
            <tr>
              <td className="tableTitle">单集群节点授权个数:</td>
              <td className="itemContent">{license.plain.nodesLimitPerCluster}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { isFetching, info } = state.entities.license
  return {
    isFetching,
    license: info,
  }
}

export default connect(mapStateToProps, {
  loadLicense,
})(License)