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

const SubMenu = Menu.SubMenu

class Sider extends React.Component {
  render() {
    const { backColor, oemInfo } = this.props
    return (
      <div id="sider" className={`oemMenu-drek-${backColor}`}>
        <QueueAnim type='left' className='siderBiggerBox'>
          <div key='siderBigger' className='siderBigger'>
            <div className='logBox'>
              <Link to='/OpenStack'>
                <img className='logo' src={oemInfo.naviExpand} />
              </Link>
            </div>
            <Menu
              style={{ width: '100%', color: '#c4c4c4' }}
              mode='inline'
              theme='dark'
              // selectedKeys={this.state.currentSelectedMenu}
              // openKeys={this.state.currentOpenMenu}
              // onClick={this.onSelectMenu}
              // onOpen={this.onOpenBigMenu}
              // onClose={this.onCloseBigMenu}
              className={`oemMenu-drek-${backColor}`}
            >
              <Menu.Item>
                <Link to="/integration"><Icon type="arrow-left" theme="outlined" />返回控制台</Link>
              </Menu.Item>
              <SubMenu key="ol" title={
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
                <Menu.Item key='obj'>
                  <div className="adminBox">
                    <Link to="/OpenStack/objStorage">
                      <div className="sideCircle"></div>
                      对象存储
                  </Link>
                  </div>
                </Menu.Item>
              </SubMenu>
              <SubMenu key="net" title={<div>网络资源</div>}>
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
                <Menu.Item key='ip'>
                  <div className="adminBox">
                    <Link to="/OpenStack/floatIP">
                      <div className="sideCircle"></div>
                      浮动 IP
                  </Link>
                  </div>
                </Menu.Item>
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
    oemInfo: oemInfo || {},
  }
}

export default connect(mapStateToProp)(Sider)