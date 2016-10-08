/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/9/22
 * @author ZhaoXueYu
 */
import React, { Component, PropTypes } from 'react'
import { Tabs,Card, Menu, Progress  } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import StorageStatus from "./StorageStatus"
import StorageBind from './StorageBind.js'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { loadStorageInfo } from '../../actions/storage'
import "./style/StorageDetail.less"
import { DEFAULT_CLUSTER } from '../../constants'

function loadData(props) {
  const {name, loadStorageInfo } = props
  loadStorageInfo('test', props.params.storage_id)
}

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
  stop: {
    id: "StorageDetail.header.stop",
    defaultMessage: '已停止'
  },
  create: {
    id: "StorageDetail.header.create",
    defaultMessage: '创建时间'
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
  componentWillMount() {
    document.title = "存储详情 | 时速云"
    loadData(this.props)
  }


  render() {
    const { formatMessage } = this.props.intl
    const { currentKey } = this.state
    const { StorageInfo } = this.props
    return (
      <div id="StorageDetail">
        <QueueAnim className="demo-content"
                   key="demo"
                   type="right"
        >
          <div key="ca" className="AppInfo">
            <Card className="topCard">
              <div className="imgBox">
                <img src="/img/test/github.jpg" />
              </div>
              <div className="infoBox">
                <div className="appTitle">
                 { StorageInfo.volumeName }
                </div>
                <div className="info">
                  <div className="status">
                    <FormattedMessage {...messages.useStatus} />
                    &nbsp;：
                    <span>
	                    <i className="fa fa-circle"></i>
	                    {StorageInfo.isUsed ?  <FormattedMessage {...messages.using} /> :  <FormattedMessage {...messages.stop} />}
                    </span>
                  </div>
                  <div className="createDate">
                    <FormattedMessage {...messages.create} />：
                   { StorageInfo.createTime }
                  </div>
                  <div className="use">
                    <FormattedMessage {...messages.useLevel} />
                    ：&nbsp;&nbsp;
                    <Progress percent={(StorageInfo.usedSize / StorageInfo.totalSize) * 100} showInfo={false} />
                    &nbsp;&nbsp;{ StorageInfo.usedSize } / { StorageInfo.totalSize } MB
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
                  <StorageStatus key="StorageStatus" />
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
  intl: PropTypes.object.isRequired,
  loadStorageInfo: PropTypes.func.isRequired
}
  
function mapStateToProps(state, props) {
  const defaultInfo = {
    isFetching: false,
    cluster: DEFAULT_CLUSTER,
    pool: 'test',
    StorageInfo: props.params.storage_id
  }
  console.log(props)
  const { Storage } = state
  const { cluster, StorageInfo, isFetching } = state.storage.storageDetail || defaultInfo

  return {
    // cluster,
    StorageInfo,
    // pool,
    isFetching
  }
}
  
export default connect(mapStateToProps,{ 
  loadStorageInfo}
)(injectIntl(StorageDetail,{withRef: true,}))