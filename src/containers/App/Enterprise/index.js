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
      license: {},
      siderStyle: 'bigger'
    }
  }
  componentWillMount() {
    const self = this
    this.props.loadMergedLicense({
      success: {
        func: (res) => {
          let outdated = false
          let loginModalVisible = false
          let licenseTips = '许可证'
          let licenseDay = 14
          const { licenseStatus, leftLicenseDays, leftTrialDays } = res.data
          if (licenseStatus == 'VALID' && parseInt(leftLicenseDays) <= 7) {
            outdated = true // show warning and allow login
            licenseDay = Math.floor(leftLicenseDays *10) /10
            if (licenseDay <= 0) {
              window.location.href ='/logout'
            }
          }
          if (licenseStatus == 'NO_LICENSE' && parseInt(leftTrialDays) <= 7) {
            outdated = true // show warning and allow login
            licenseTips = '产品试用'
            licenseDay = Math.floor(leftTrialDays *10) /10
            if (licenseDay <= 0) {
              window.location.href ='/logout'
            }
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
    const winWidth = document.body.clientWidth
    if (winWidth < 1280) {
      self.setState({siderStyle:'mini'})
    }
  }

  checkTipsText() {
    if (!this.props.loginUser) return
    if (this.props.loginUser.role == ROLE_SYS_ADMIN) {
      return (
      <span><Link to="/setting/license" style={{color:'white',textDecoration: 'underline'}}> 输入许可证 </Link>以使用平台</span>
      )
    }
    return '请联系管理员输入许可证以继续使用平台'
  }
  tipError() {
    if( this.state.outdated ) {
      return (
        <div id='topError'>
          {this.state.licenseTips}将于 {Math.floor(this.state.licenseDay) } 天后（即{ formatDate(this.state.license.end)}）过期，{this.checkTipsText()}
        </div>
     )
   }
  }
  render() {
    return (
      <App siderStyle={this.state.siderStyle} License={this.state.outdated} tipError={this.tipError()} Sider={Sider} {...this.props} />
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
