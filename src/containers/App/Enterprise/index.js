/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Redux main app file - Enterprise
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Sider from '../../../components/Sider/Enterprise'
import App from '../'
import { loadMergedLicense } from '../../../actions/license'

class EnterpriseApp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      outdated: false,
      licenseTips:'',
      licenseDay:0,
      license: {}
    }
  }
  componentWillMount() {
    const self = this
    this.props.loadMergedLicense({
      success: {
        func: (res) => {
          let outdated = false
          let loginModalVisible = false
          let licenseTips = '激活证书'
          let licenseDay = 14 
          const { licenseStatus, leftLicenseDays, leftTrialDays } = res.data
          if (licenseStatus == 'VALID' && leftLicenseDays <= 7) {
            outdated = true // show warning and allow login
            licenseDay: leftLicenseDays
          }
          if (licenseStatus == 'NO_LICENSE' && leftTrialDays > 0) {
            outdated = true // show warning and allow login
            licenseTips = '产品试用'
            licenseDay: leftTrialDays
          }
          if (licenseStatus == 'NO_LICENSE' && leftTrialDays <= 0) {
            outdated = true //show error and not allow login
            licenseDay: 0
            loginModalVisible = true
          }
          self.setState({
            outdated,
            loginModalVisible,
            licenseTips,
            licenseDay,
            license: res.data
          })
        },
      }
    })
  }
  render() {
    return (
      <App siderStyle='bigger' License={this.state} Sider={Sider} {...this.props} />
    )
  }
}

// For transfer redux props to App component
function mapStateToProps(state, props) {
  return props
}

export default connect(mapStateToProps, {
    loadMergedLicense,// check license
})(EnterpriseApp)
