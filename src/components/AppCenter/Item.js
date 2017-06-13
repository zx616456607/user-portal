/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2017-6-5
 * @author Baiyu
 */


import React, { Component, PropTypes } from 'react'
import { Modal, Tabs, Icon, Menu, Button, Card, Form, Input, Alert } from 'antd'
import TweenOne from 'rc-tween-one';
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
// import ImageDetailBox from './ImageCenter/ImageDetail'
// import ImageSpace from './ImageCenter/ImageSpace.js'
// import PublicSpace from './ImageCenter/PublicSpace.js'
import Project from './ImageCenter/Project'
import OtherSpace from './ImageCenter/OtherSpace.js'
import './style/ImageCenter.less'
import { LoadOtherImage, addOtherStore, getImageDetailInfo, deleteOtherImage, getAppCenterBindUser } from '../../actions/app_center'
import findIndex from 'lodash/findIndex'
import NotificationHandler from '../../common/notification_handler'
import Title from '../Title'
const TabPane = Tabs.TabPane

class ImageCenter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createModalShow: false
    }
  }

  render() {
    return(
      <QueueAnim className='ImageCenterBox' type='right'>
        <div id='ImageCenter' key='ImageCenterBox'>
          <Title title="镜像仓库" />
          <Tabs
            className="ImageCenterTabs"
            key='ImageCenterTabs'
            defaultActiveKey='private'
            tabBarExtraContent={
              <Button className='addBtn' key='addBtn' size='large' type='primary' onClick={this.addImageTab}>
                <Icon type='plus' />&nbsp;
                  <span>添加第三方</span>
              </Button>
            }
            >
            <TabPane tab="我的镜像项目" key="private"><Project type="private" /></TabPane>
            <TabPane tab="公有镜像项目" key="public"><Project type="public" /></TabPane>
          </Tabs>
          <Modal title='添加第三方' className='addOtherSpaceModal' visible={this.state.createModalShow}
            >
            {/*<MyComponent scope={scope} addOtherStore={this.props.addOtherStore} />*/}
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

export default ImageCenter