
import React, { Component, PropTypes } from 'react'
import { Tabs,Card, Menu } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppInstanceList from "../../components/AppModule/AppInstanceList.js"
import AppGraph from "../../components/AppModule/AppGraph.js"
import AppLog from "../../components/AppModule/AppLog.js"
import StorageBind from './StorageBind.js'
import "./style/StorageDetail.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane

class StorageDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentKey: "1"
    }
  }
  
  render() {
    const { appID } = this.props
    const { children } = this.props
    const { currentKey } = this.state
    return (
      <div id="AppDetail">
        <QueueAnim className="demo-content"
                   key="demo"
                   type="right"
        >
          <div className="cover"></div>
          <div key="ca" className="AppInfo">
            <Card className="topCard">
              <div className="imgBox">
                <img src="/img/test/github.jpg" />
              </div>
              <div className="infoBox">
                <p className="appTitle">
                  我是存储名称
                </p>
                <div className="leftInfo">
                  <div className="status">
                    使用状态&nbsp;:
                    <span>
	                      <i className="fa fa-circle"></i>
	                      使用中
                    </span>
                  </div>
                  <div className="createDate">
                    创建&nbsp;:&nbsp;2016-09-09&nbsp;18:15
                  </div>
                  <div className="service">
                    服务&nbsp;:&nbsp;3/3
                  </div>
                </div>
                <div className="middleInfo">
                  
                  <div className="updateDate">
                    更新&nbsp;:&nbsp;2016-09-09&nbsp;18:15
                  </div>
                </div>
                <div className="rightInfo">
                  <div className="introduction">
                    应用描述&nbsp;:&nbsp;这是一个萌萌哒的应用描述
                  </div>
                </div>
                <div style={{ clear:"both" }}></div>
              </div>
              <div style={{ clear:"both" }}></div>
            </Card>
            <Card className="bottomCard">
              <Tabs
                tabPosition="top"
                defaultActiveKey="1"
              >
                <TabPane tab="操作" key="1" >
                  <AppInstanceList key="AppInstanceList" />
                </TabPane>
                <TabPane tab="绑定容器" key="2" >
                  <StorageBind />
                </TabPane>
              </Tabs>
            </Card>
          </div>
        </QueueAnim>
      </div>
  )
  }
  }
  
  function mapStateToProps(state, props) {
    const { app_id } = props.params
    return {
    appID: app_id
  }
  }
  
  export default connect(mapStateToProps, {
    //
  })(StorageDetail)
