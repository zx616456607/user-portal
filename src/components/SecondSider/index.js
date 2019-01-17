/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * SecondSider component
 *
 * v0.1 - 2016-11-17
 * @author GaoJian
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Menu, Tooltip } from 'antd'
import { Link } from 'react-router'
import "./style/SecondSider.less"
import { FormattedMessage } from 'react-intl'
import IntelMessages from '../Sider/Enterprise/Intl'
import filter from 'lodash/filter'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

function currentPathNameCheck(scope, menuList) {
  //this function for check the pathname and change the current key
  let pathname = window.location.pathname
  let flag = true
  if (pathname.indexOf('/account/costCenter') > -1) {
    pathname = window.location.pathname + '#consumptions'
    if (window.location.hash && window.location.hash !== '') {
      pathname = window.location.pathname + window.location.hash
    }
  }
  //this check the pathname from the image_store
  if (pathname.indexOf('/account/user/') > -1) { // for more membership infomation
    scope.setState({
      current: 'secondSider1'
    })
    return
  }

  menuList.some((item, index) => {
    if(index != 0) {
      let checkPath = pathname.indexOf(item.url)
      if (checkPath > -1) {
        flag = false
        let temp = 'secondSider' + index
        if (item.url === '/ci_cd') {
          if (pathname === '/ci_cd' || pathname === '/ci_cd/') {
            scope.setState({
              current: temp
            })
            return true
          }
          return false
        }
        scope.setState({
          current: temp
        })
        return true
      }
      return false
    }
    return false
  })
  if(flag) {
    scope.setState({
      current: 'secondSider0'
    })
  }
}


class SecondSider extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.changeSiderStyle = this.changeSiderStyle.bind(this)
    this.state = {
      current: 'secondSider0',
      currentSiderStyle: 'normal',
    }
  }

  componentWillMount(){

    const { menuList } = this.props
    currentPathNameCheck(this, menuList)
    // if (filter(menuList, { url : '/tenant_manage' })[0]) {
    //   this.
    // }
  }
  componentWillReceiveProps(nextProps) {
    const { menuList } = nextProps
    currentPathNameCheck(this, menuList)
  }

  handleClick(e) {
    this.setState({
      current: e.key,
    })
  }

  changeSiderStyle() {
    //this function for user changet the second sider style to 'normal' or 'hide'
    const { currentSiderStyle } = this.state
    const { scope } = this.props
    if(currentSiderStyle == 'normal') {
      this.setState({
        currentSiderStyle: 'hide'
      })
      scope.setState({
        containerSiderStyle: 'hide'
      })
    } else {
      this.setState({
        currentSiderStyle: 'normal'
      })
      scope.setState({
        containerSiderStyle: 'normal'
      })
    }
  }

  render() {
    const { current } = this.state
    const { menuList, isShow } = this.props
    let menuShow = menuList.map((item, index) => {
      const tempIsShow = isShow &&
        (item.url.indexOf("/tenant_manage/cluster_authorization") > -1 ||
        item.url.indexOf("/tenant_manage/approvalLimit") > -1)
      if (item.onClick) {
        return (
          <Menu.Item key={'secondSider' + index}>
            <div onClick={item.onClick}>
            <FormattedMessage {...IntelMessages[item.name]} />
            { tempIsShow && <span className="topRightPoint"><strong>●</strong></span> }
            </div>
          </Menu.Item>
        )
      }
      return (
        <Menu.Item key={'secondSider' + index}>
          <Link to={item.url + ( tempIsShow ? '?link_status=1' : '')}>
            <FormattedMessage {...IntelMessages[item.name]} />
            { tempIsShow && <span className="topRightPoint"><strong>●</strong></span> }
          </Link>
        </Menu.Item>
      )
    })
    return (
      <div id="SecondSider">
        <div>
          <Menu onClick={this.handleClick}
            selectedKeys={[current]}
            mode="inline"
            >
            { menuShow }
          </Menu>
          <div className={ this.state.currentSiderStyle == 'normal' ? 'siderBtnBox' : 'hideBtnBox siderBtnBox' } onClick={this.changeSiderStyle}>
            { this.state.currentSiderStyle == 'normal' ? <i key='fa-step-backward' className='fa fa-step-backward'></i> : <i key='fa-step-forward' className='fa fa-step-forward'></i> }
            <div className='btnBack'></div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, nextProps) {
  const { projectAuthority } = state
  const { projectsApprovalClustersList } = projectAuthority
  const projects = getDeepValue(projectsApprovalClustersList, ['approvalData', 'projects']) || []
  const isShow = filter(projects, { status: 1 }).length > 0
  return {
    isShow,
    // 解决ai,cicd,等通过iframe嵌入方式当路由切换时组件不刷新的问题
    pathname: nextProps.scope.props.location.pathname
  }
}

export default connect(mapStateToProps, {})(SecondSider)

