/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */
/**
 * AppStack Iframe Portal
 *
 * v1.0 - 2019-02-21
 * @author zhangpc
 */
import React from 'react'
import IframePortal from './'
import { connect } from 'react-redux'
class AppStack extends React.Component {
  render() {
    const iframe = {
      id: 'DevFlowPortal',
      title: 'CI/CD',
      src: '/devops/index.html',
      queryConfig: {
        billingenabled: this.props.billingEnabled ? 1 : 0,
        ftpEnabled: this.props.ftpEnabled ? 1 : 0,
        emailEnabled: this.props.emailEnabled ? 1 : 0,
      },
    }
    return <IframePortal iframe={iframe} {...this.props} />
  }
}

const mapStateToProps = state => {
  const { billingConfig, ftpConfig, emailConfiged } = state.entities.loginUser.info
  const { enabled: billingEnabled } = billingConfig
  // sys admin check user personal space
  return {
    billingEnabled,
    ftpEnabled: ftpConfig && ftpConfig.addr,
    emailEnabled: emailConfiged,
  }
}

export default connect(mapStateToProps, {})(AppStack)
