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
import { Link } from 'react-router'
import { loadMergedLicense } from '../../../actions/license'
import { formatDate } from '../../../common/tools'
import { ROLE_SYS_ADMIN } from '../../../../constants'

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
          if (licenseStatus == 'VALID' && parseInt(leftLicenseDays) <= 7) {
            outdated = true // show warning and allow login
            licenseDay = parseInt(leftLicenseDays)
          }
          if (licenseStatus == 'NO_LICENSE' && parseInt(leftTrialDays) > 0) {
            outdated = true // show warning and allow login
            licenseTips = '产品试用'
            licenseDay = parseInt(leftTrialDays)
          }
          if (licenseStatus == 'NO_LICENSE' && parseInt(leftTrialDays) < 0) {
            outdated = true //show error and not allow login
            licenseDay = 0
            window.location.href ='/logout'
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

  checkTipsText() {
    if (!this.props.loginUser) return
    if (this.props.loginUser.role == ROLE_SYS_ADMIN) {
      return (
      <span><Link to="/setting/license" style={{color:'white',textDecoration: 'underline'}}> 输入激活码 </Link>以使用平台</span>
      )
    }
    return '请联系管理员输入激活码以继续使用平台'
  }
  tipError() {
    if( this.state.outdated ) {
      return (
        <div id='topError'>
          {this.state.licenseTips}将于{this.state.licenseDay}天后（即{ formatDate(this.state.license.trialEndTime)}）过期，{this.checkTipsText()}
        </div>
     )
   }
  }
  render() {
    return (
      <App siderStyle='bigger' License={this.state.outdated} tipError={this.tipError()} Sider={Sider} {...this.props} />
    )
  }
}

// For transfer redux props to App component
function mapStateToProps(state, props) {
  const { loginUser } = state.entities
  const defaultState = {leftLicenseDays: 7}
  let license
  if(!state.license.mergedLicense.result) {
    license = ''
  } else {
    license = state.license.mergedLicense.result.data
  }
  license = license || defaultState
  return {
    loginUser: loginUser.info,
    leftLicenseDays: license
  }
}

export default connect(mapStateToProps, {
    loadMergedLicense,// check license
})(EnterpriseApp)
