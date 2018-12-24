/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * User panel component
 *
 * v0.1 - 2016-12-22
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import { Icon, Popover, Button, Tag } from 'antd'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { GetProjectsApprovalClustersWithoutTypes } from '../../actions/project'
import { checkApplyRecordWithoutTypes } from '../../../client/actions/applyLimit'
import "./style/UserPanel.less"
import { AVATAR_HOST } from '../../constants'
import { parseAmount } from '../../common/tools'
import proIcon from '../../assets/img/version/proIcon.png'
import proIconGray from '../../assets/img/version/proIcon-gray.png'
import TenxIcon from '@tenx-ui/icon/es/_old'
import { injectIntl, FormattedMessage } from 'react-intl'
import IntlMessages from '../Header/Intl'
import SiderIntlMessages from '../Sider/Enterprise/Intl'
import { getDeepValue } from '../../../client/util/util'
import filter from 'lodash/filter'
import Keycloak from '../../3rd_account/Keycloak'

const standard = require('../../../configs/constants').STANDARD_MODE
const mode = require('../../../configs/model').mode
import {
  ROLE_USER,
  ROLE_TEAM_ADMIN,
  ROLE_SYS_ADMIN,
  ADMIN_ROLE,
  ROLE_BASE_ADMIN,
  ROLE_PLATFORM_ADMIN
} from '../../../constants'
import { SHOW_BILLING }  from '../../constants'

/**
 * User panel in the upper right corner
 *
 * @class UserPanel
 * @extends {Component}
 */
class UserPanel extends Component {
  constructor(props) {
    super(props)
    this.handleVisibleChange = this.handleVisibleChange.bind(this)
    this.renderMenuItems = this.renderMenuItems.bind(this)
    this.getEdition = this.getEdition.bind(this)
    this.getTitle = this.getTitle.bind(this)
    this.getContent = this.getContent.bind(this)
    this.logout = this.logout.bind(this)
    this.state = {
      visible: false,
      isShowApprovalClusters: false,
      isShowApprovalLimits: false,
    }
    this.keycloak = new Keycloak()
  }
  componentWillReceiveProps(next) {
    this.getPonitFunc(next)
  }
  componentDidMount() {
    this.getPonitFunc(this.props)
  }
  getPonitFunc = props => {
    const { role } = props
    const isNeedGet = role !== ROLE_USER && role !== ROLE_BASE_ADMIN
    const { GetProjectsApprovalClustersWithoutTypes, checkApplyRecordWithoutTypes, isShowClusterPoint, isShowLimitPoint } = props
    if (isNeedGet) {
      GetProjectsApprovalClustersWithoutTypes({
        filter: `status__neq,2,status__neq,3`,
        size: 10,
        from: 0,
        sort: `d,tenx_project_resource_ref.request_time`,
      }, {
        success: {
          func: res => {
            if (!!res && !!res.data && !!res.data.projects) {
              this.setState({
                isShowApprovalClusters: filter(res.data.projects, { status: 1 }).length > 0
              })
            } else {
              this.setState({
                isShowApprovalClusters: false
              })
            }
          }
        }
      })
      checkApplyRecordWithoutTypes({
        from: 0, size: 10, filter: "project_type,public,status,0"
      }, {
        success: {
          func: res => {
            if (!!res && !!res.data && !!res.data.records) {
              this.setState({
                isShowApprovalLimits: filter(res.data.records, { status: 0 }).length > 0
              })
            } else {
              this.setState({
                isShowApprovalLimits: false,
              })
            }
          }
        }
      })
    }
  }

  handleVisibleChange() {
    const { visible } = this.state
    this.setState({
      visible: !visible
    })
  }

  // 公有云部分，不做国际化
  getEdition() {
    const { loginUser } = this.props
    const { envEdition } = loginUser
    if(mode !== standard) {
      return ''
    }
    if (envEdition == 0) {
      return (
        <Link to="/account/version">
          <img className="edition" alt="升级专业版" title="升级专业版" src={proIconGray}/>
        </Link>
      )
    }
    if (envEdition == 1) {
      return (
        <Link to="/account/version">
          <img className="edition" alt="专业版" title="专业版" src={proIcon}/>
        </Link>
      )
    }
    return
  }

  getTitle() {
    const { loginUser } = this.props
    const { userName, email, avatar, certInfos } = loginUser
    // 公有云部分，不做国际化
    let certName = '个人'
    let certStatus = false
    if (mode === standard) {
      if (certInfos && certInfos.length >= 0) {
        let length = certInfos.length
        for (let i = 0; i < length; i++) {
          if (certInfos[i].type == 2 && certInfos[i].status == 4) {
            certName = "企业"
            break
          }
          if (certInfos[i].type == 3 && certInfos[i].status == 4) {
            certName = "组织"
            break
          }
        }
      }
    }
    let userNameInitials = ''
    if (userName) {
      userNameInitials = userName.substr(0, 1).toUpperCase()
    }
    return (
      <div className='logTitle'>
        <div className='logAvatar'>
          {
            mode === standard
            ? (<img alt={userName} src={`${AVATAR_HOST}${avatar}`} />)
            : userNameInitials
          }
        </div>
        <div className="loginText">
          <div className="text">
            <p className="userName">
              {userName}
              {this.getEdition()}
            </p>
            <p className="email">{email || '...'}</p>
          </div>
        </div>
         {
            mode === standard
            ? <div className='loginTag'>{certName}</div>
            : ''
         }
      </div>
    )
  }

  renderMenuItems(menu, index) {
    return (
      <td className="panelTd" key={`menu${index}`}>
        <Link to={menu.to} onClick={this.handleVisibleChange}>
          {
            menu.isNeedPoint ?
              <span className="topRightPoint"><strong>●</strong></span>
              :
              null
          }
          {
            menu.isAnt ?
              <Icon type={menu.iconType} className="userIcon" />
              :
              <TenxIcon type={menu.iconType} className="userIcon"/>
          }
          <div>{menu.text}</div>
        </Link>
      </td>
    )
  }

  async logout(e) {
    e.preventDefault()
    await this.keycloak.init()
    await this.keycloak.logout({ redirectUri: `${window.location.origin}/logout` })
  }

  getContent() {
    const { loginUser, role, balance, billingEnabled } = this.props
    const { isShowApprovalClusters, isShowApprovalLimits } = this.state
    /*let { balance } = loginUser
    if (balance !== undefined) {
      balance = parseAmount(balance).amount
    }*/
    const { userID } = loginUser
    const base = [
      {
        to: '/account',
        iconType: 'log-account',
        text: <FormattedMessage {...IntlMessages.account} />,
      }]
    let menuItems = (role === ROLE_USER || role === ROLE_BASE_ADMIN) ? [
      {
        to: '/account#edit_pass',
        iconType: 'password-change',
        text: <FormattedMessage {...IntlMessages.changePwd} />,
      },
      {
        to: '/work-order',
        iconType: 'book',
        isAnt: true,
        text: <FormattedMessage {...IntlMessages.workOrder} />,
      },
      {
        to: '/tenant_manage/team',
        iconType: 'team-o',
        text: <FormattedMessage {...IntlMessages.team} />,
      },
      {
        to: `/tenant_manage/project_manage`,
        iconType: 'backup',
        text: <FormattedMessage {...IntlMessages.project} />,
      }
    ]
    :
    [
      {
        to: `/tenant_manage/project_manage`,
        iconType: 'backup',
        text: <FormattedMessage {...IntlMessages.project} />,
      },
      {
        to: '/work-order',
        iconType: 'book',
        isAnt: true,
        text: <FormattedMessage {...IntlMessages.workOrder} />,
      },
      {
        to: '/tenant_manage/cluster_authorization',
        isNeedPoint: isShowApprovalClusters,
        iconType: 'approval-cluster',
        text: <FormattedMessage {...SiderIntlMessages.tenantClusterAuth} />,
      },
      {
        to: '/tenant_manage/approvalLimit' + ( isShowApprovalLimits ? '?link_status=0' : ''),
        isNeedPoint: isShowApprovalLimits,
        iconType: 'approval-limit',
        text: <FormattedMessage {...SiderIntlMessages.tenantResourcequotaAuth} />,
      }
    ]
    menuItems = [].concat(base, menuItems, [
      {
        to: '/work-order/system-notice',
        iconType: 'ring',
        text: <FormattedMessage {...IntlMessages.systemNotice} />,
      }
    ])
    if (mode === standard) {
      menuItems = [
        {
          to: '/account',
          iconType: 'log-account',
          text: '我的帐户',
        },
        {
          to: '/account/costCenter#consumptions',
          iconType: 'cost-record',
          text: '消费记录',
        },
        {
          to: '/account#edit_pass',
          iconType: 'password-change',
          text: '修改密码',
        },
        {
          to: '/tenant_manage/team',
          iconType: 'team-o',
          text: '我的团队',
        },
      ]
    }
    return (
      <div className='logMenu'>
        {/* { billingEnabled ?
        <div className='rechangeInf'>
          <div className='balance'>
            <p><FormattedMessage {...IntlMessages.balance} /> &nbsp;:</p>
            <p>
              {
                mode === standard?
                [<span className="unit" key="standard">¥ </span>,<span className="number" key="s-number">{balance}</span>]:
                [<span className="number" key="enterprise">{balance}</span>,<span className="unit" key="e-number"> T</span>]
              }
            </p>
          </div>

          {
            mode === standard &&
            <Button className="payButton" onClick={() => browserHistory.push('/account/balance/payment')}>
              立即充值
            </Button>
          }
        </div>
        :null} */}
        <table className='navTab'>
          <tbody>
            <tr>
              {menuItems.slice(0, 3).map(this.renderMenuItems)}
            </tr>
            <tr>
              {menuItems.slice(3).map(this.renderMenuItems)}
            </tr>
          </tbody>
        </table>
        <div className='logCancle'>
          <a onClick={this.logout}>
            <Icon type="poweroff" className='logCancleIcon' />
            <FormattedMessage {...IntlMessages.logout} />
          </a>
        </div>
      </div>
    )
  }

  render() {
    const { loginUser, role } = this.props
    const { isShowApprovalLimits, isShowApprovalClusters } = this.state
    const { visible } = this.state
    const rotate = visible ? 'rotate180' : 'rotate0'
    const roleName = (role) => {
      switch (role){
        case ROLE_SYS_ADMIN:
          return <FormattedMessage {...IntlMessages.sysAdmin} />
          break
        case ROLE_PLATFORM_ADMIN:
          return <FormattedMessage {...IntlMessages.paasAdmin} />
          break
        case ROLE_BASE_ADMIN:
          return <FormattedMessage {...IntlMessages.localAdmin} />
          break
        case ROLE_USER:
          return <FormattedMessage {...IntlMessages.normalUser} />
          break

      }
    }
    return (
      <Popover
        title={this.getTitle()}
        content={this.getContent()}
        overlayClassName='UserPanel'
        placement="bottomRight"
        arrowPointAtCenter={true}
        trigger="click"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
        >
        <div className="user-panel-trigger userBtn">
          {
            (isShowApprovalLimits || isShowApprovalClusters) ?
              <span className="topRightPoint"><strong>●</strong></span>
              :
              null
          }
          <div className="userBtnText">
            <div>{loginUser.userName}</div>
            <div>
              <Tag>
                {
                  roleName(role)
                }
              </Tag>
            </div>
          </div>
          <div className="userBtnIcon">
            <Icon type="down" className={rotate} />
          </div>
        </div>
      </Popover>
    )
  }
}

UserPanel.propTypes = {
  loginUser: PropTypes.object.isRequired,
}

function mapStateToProp(state, props) {
  let role = ROLE_USER
  const { entities } = state
  const { loginUser } = props
  const { balance, billingConfig } = loginUser
  if (entities && entities.loginUser && entities.loginUser.info && entities.loginUser.info) {
    role = entities.loginUser.info.role ? entities.loginUser.info.role : 0
  }
  const { enabled: billingEnabled } = billingConfig || { enabled: false }

  const { projectAuthority } = state
  const { projectsApprovalClustersList } = projectAuthority
  const projects = getDeepValue(projectsApprovalClustersList, ['approvalData', 'projects']) || []
  const isShowClusterPoint = filter(projects, { status: 1 }).length > 0

  const limits = getDeepValue(state, ['applyLimit', 'resourcequoteRecord', 'data']) || []
  const isShowLimitPoint = filter(limits, { status: 0 }).length > 0

  return {
    role,
    isShowClusterPoint,
    isShowLimitPoint,
    balance: parseAmount(balance).amount,
    billingEnabled
  }
}

export default injectIntl(connect(mapStateToProp, {
  GetProjectsApprovalClustersWithoutTypes,
  checkApplyRecordWithoutTypes
})(UserPanel), {
  withRef: true,
})
