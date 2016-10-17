/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ContainerDetail component
 *
 * v0.1 - 2016-09-22
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Dropdown, Tabs, Card, Menu, Button } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import ContainerDetailInfo from "./ContainerDetailInfo.js"
import ContainerDetailGraph from "./ContainerGraph.js"
import ContainerDetailLog from "./ContainerLog.js"
import "./style/ContainerDetail.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane
const ButtonGroup = Button.Group;
const operaMenu = (
  <Menu>
    <Menu.Item key="0">
      <i className="fa fa-stop" style={{ marginRight: "10px" }}></i>停止
    </Menu.Item>
    <Menu.Item key="1">
      <i className="fa fa-trash-o" style={{ marginRight: "10px" }}></i>删除
    </Menu.Item>
  </Menu>);

class ContainerDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentKey: "1"
    }
  }

  render() {
    const { containerID } = this.props
    const { children } = this.props
    const { currentKey } = this.state
    return (
      <div id="ContainerDetail">
        <QueueAnim className="demo-content"
          key="demo"
          type="right"
          >
          <div className="cover"></div>
          <div key="ca" className="containerInfo">
            <Card className="topCard">
              <div className="imgBox">
                <img src="/img/test/github.jpg" />
              </div>
              <div className="infoBox">
                <p className="appTitle">
                  萌萌的应用
	              </p>
                <div className="leftInfo">
                  <div className="status">
                    运行状态&nbsp;:
	                  <span>
                      <i className="fa fa-circle"></i>
                      运行中
	                  </span>
                  </div>
                  <div className="address">
                    地址&nbsp;:&nbsp;http:\//www.tenxcloud.com
	                </div>
                </div>
                <div className="middleInfo">
                  <div className="createDate">
                    创建&nbsp;:&nbsp;2016-09-09&nbsp;18:15
	                  </div>
                  <div className="updateDate">
                    更新&nbsp;:&nbsp;2016-09-09&nbsp;18:15
	                  </div>
                </div>
                <div className="rightInfo">
                  <div className="actionBox commonData">
                    <Button type="primary" className="viewBtn">
                      <svg className="terminal">
                        <use xlinkHref="#terminal" />
                      </svg>
                      登录终端
			    		      </Button>
                    <ButtonGroup>
                      <Button type="ghost">
                        <i className="fa fa-power-off"></i>重启
			    		        </Button>
                      <Dropdown overlay={operaMenu} trigger={['click']}>
                        <Button type="ghost" className="moreBtn ant-dropdown-link">
                          <i className="fa fa-caret-down"></i>
                        </Button>
                      </Dropdown>
                    </ButtonGroup>
                  </div>
                </div>
                <div style={{ clear: "both" }}></div>
              </div>
              <div style={{ clear: "both" }}></div>
            </Card>
            <Card className="bottomCard">
              <Tabs
                tabPosition="top"
                defaultActiveKey="1"
                >
                <TabPane tab="容器配置" key="1" ><ContainerDetailInfo key="ContainerDetailInfo" /></TabPane>
                <TabPane tab="监控" key="2" >监控</TabPane>
                <TabPane tab="日志" key="3" ><ContainerDetailGraph key="ContainerDetailGraph" /></TabPane>
                <TabPane tab="事件" key="4" ><ContainerDetailLog key="ContainerDetailLog" /></TabPane>
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const { container_id } = props.params
  return {
    containerID: container_id
  }
}

export default connect(mapStateToProps, {
  //
})(ContainerDetail)
