
import React, { Component, PropTypes } from 'react'
import { Tabs,Card, Menu, Progress  } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import AppInstanceList from "../../components/AppModule/AppInstanceList.js"
import AppGraph from "../../components/AppModule/AppGraph.js"
import AppLog from "../../components/AppModule/AppLog.js"
import StorageBind from './StorageBind.js'
import "./style/StorageDetail.less"
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup
const TabPane = Tabs.TabPane

const messages = defineMessages({
  useStatus: {
    id: "StorageDetail.header.useStatus",
    defaultMessage: '使用状态'
  },
  using: {
    id: "StorageDetail.header.using",
    defaultMessage: '使用中'
  },
  create: {
    id: "StorageDetail.header.create",
    defaultMessage: '创建'
  },
  useLevel: {
    id: "StorageDetail.header.useLevel",
    defaultMessage: '用量'
  },
  bindContainer: {
    id: "StorageBind.bind.bindContainer",
    defaultMessage: '绑定容器'
  },
  operating: {
    id: "StorageDetail.operating",
    defaultMessage: '操作'
  },
})

class StorageDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentKey: "1"
    }
  }
  
  render() {
    const { formatMessage } = this.props.intl
    const { appID } = this.props
    const { children } = this.props
    const { currentKey } = this.state
    return (
      <div id="StorageDetail">
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
                <div className="info">
                  <div className="status">
                    <FormattedMessage {...messages.useStatus} />
                    &nbsp;:
                    <span>
	                      <i className="fa fa-circle"></i>
	                      <FormattedMessage {...messages.using} />
                    </span>
                  </div>
                  <div className="createDate">
                    <FormattedMessage {...messages.create} />
                    &nbsp;:&nbsp;2016-09-09&nbsp;18:15
                  </div>
                  <div className="use">
                    <FormattedMessage {...messages.useLevel} />
                    : &nbsp;&nbsp;<Progress percent={50} showInfo={false} />&nbsp;&nbsp;365/1024MB
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
                <TabPane tab={<FormattedMessage {...messages.operating} />} key="1" >
                  <AppInstanceList key="AppInstanceList" />
                </TabPane>
                <TabPane tab={<FormattedMessage {...messages.bindContainer} />} key="2" >
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
StorageDetail.propTypes = {
  intl: PropTypes.object.isRequired
}
  
export default injectIntl(StorageDetail, {
  withRef: true,
})


  