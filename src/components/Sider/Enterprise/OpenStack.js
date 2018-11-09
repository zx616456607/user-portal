/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * OpenStack sider
 *
 * v0.1 - 2018-10-24
 * @author baiYu
 */

import React from 'react'
import { connect } from 'react-redux'
import { Link, browserHistory } from 'react-router'
import { Menu } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { Icon } from 'antd'
import './style/index.less'
import OpenStackImg from '../../../assets/img/appstore/openstack-logo.svg'

const SubMenu = Menu.SubMenu

class Sider extends React.Component {
  state = {
    currentSelectedMenu: []
  }
  componentWillMount() {
   const selectMenu = location.pathname.split('/')
   const currentKey = selectMenu[2]
   let currentOpenMenu
   switch(currentKey) {
    case 'router':
    case 'net': {
      currentOpenMenu = ['network']
      break
    }
    case 'image':
    case 'host': {
      currentOpenMenu = ['resource']
      break
    }
    case 'storage': {
      currentOpenMenu = ['cahe']
      break
    }
    default: currentOpenMenu = []
   }
    this.setState({
      currentOpenMenu,
      currentSelectedMenu: [currentKey]
    })
  }
  checkUrlSelectedKey(pathname) {
    //this function for check the pathname and return the selected key of menu and return the opened key of menu
    let pathList = pathname.split('/')
    return [pathList[1]]
  }
  onOpenBigMenu(e) {
    //this function for show only one menu opened
    let currentOpenMenu = [e.key]
    this.setState({
      currentOpenMenu: currentOpenMenu
    })
  }

  onCloseBigMenu(e) {
    //this function for close big menu callback
    this.setState({
      currentOpenMenu: []
    })
  }
  onSelectMenu(e) {
    //this function for user select the menu item and change the current key
    const { keyPath } = e
    this.setState({
      currentSelectedMenu: keyPath
    })
  }
  render() {
    const { backColor } = this.props
    return (
      <div id="sider" className={`oemMenu-drek-${backColor}`}>
        <QueueAnim type='left' className='siderBiggerBox'>
          <div key='siderBigger' className='siderBigger'>
            <div className='logBox'>
              <Link to='/OpenStack'>
                <img className='logo' src={OpenStackImg} />
              </Link>
            </div>
            <Menu
              style={{ width: '100%', color: '#c4c4c4' }}
              mode='inline'
              theme='dark'
              selectedKeys={this.state.currentSelectedMenu}
              openKeys={this.state.currentOpenMenu}
              onClick={(e)=> this.onSelectMenu(e)}
              onOpen={(e)=>this.onOpenBigMenu(e)}
              onClose={(e)=> this.onCloseBigMenu(e)}
              className={`oemMenu-drek-${backColor}`}
            >
              <Menu.Item>
                <Link to="/cluster/integration"><Icon type="arrow-left" theme="outlined" />返回控制台</Link>
              </Menu.Item>
              <SubMenu key="resource" title={
                <div>计算资源</div>
              }>
                <Menu.Item key='host'>
                  <div className="adminBox">
                    <Link to="/OpenStack/host">
                      <div className="sideCircle"></div>
                      云主机
                  </Link>
                  </div>
                </Menu.Item>
                <Menu.Item key='image'>
                  <div className="adminBox">
                    <Link to="/OpenStack/image">
                      <div className="sideCircle"></div>
                      镜像
                  </Link>
                  </div>
                </Menu.Item>
              </SubMenu>
              <SubMenu key="cahe" title={<div>存储资源</div>}>
                <Menu.Item key='storage'>
                  <div className="adminBox">
                    <Link to="/OpenStack/storage">
                      <div className="sideCircle"></div>
                      云硬盘
                  </Link>
                  </div>
                </Menu.Item>
                {/* <Menu.Item key='obj'>
                  <div className="adminBox">
                    <Link to="/OpenStack/objStorage">
                      <div className="sideCircle"></div>
                      对象存储
                  </Link>
                  </div>
                </Menu.Item> */}
              </SubMenu>
              <SubMenu key="network" title={<div>网络资源</div>}>
                <Menu.Item key='net'>
                  <div className="adminBox">
                    <Link to="/OpenStack/net">
                      <div className="sideCircle"></div>
                      网络
                  </Link>
                  </div>
                </Menu.Item>
                <Menu.Item key='router'>
                  <div className="adminBox">
                    <Link to="/OpenStack/router">
                      <div className="sideCircle"></div>
                      路由器
                  </Link>
                  </div>
                </Menu.Item>
                {/* <Menu.Item key='ip'>
                  <div className="adminBox">
                    <Link to="/OpenStack/floatIP">
                      <div className="sideCircle"></div>
                      浮动 IP
                  </Link>
                  </div>
                </Menu.Item> */}
              </SubMenu>
            </Menu>
          </div>
        </QueueAnim>

      </div>
    )
  }
}


function mapStateToProp(state) {
  let role
  const { entities } = state
  if (entities && entities.loginUser && entities.loginUser.info && entities.loginUser.info) {
    role = entities.loginUser.info.role ? entities.loginUser.info.role : 0
  }
  const oemInfo = entities.loginUser.info.oemInfo || {}
  let backColor = 1
  if (oemInfo.colorThemeID) {
    backColor = oemInfo.colorThemeID
  }

  return {
    role,
    backColor,
    loginUser: entities && entities.loginUser && entities.loginUser.info,
  }
}

export default connect(mapStateToProp)(Sider)