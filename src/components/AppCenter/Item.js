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
import { Modal, Menu, Button, Card, Input } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { Link,browserHistory } from 'react-router'
// import ImageDetailBox from './ImageCenter/ImageDetail'
// import ImageSpace from './ImageCenter/ImageSpace.js'
// import PublicSpace from './ImageCenter/PublicSpace.js'
import Project from './ImageCenter/Project'
import OtherSpace from './ImageCenter/OtherSpace.js'
import './style/Item.less'
import { LoadOtherImage, addOtherStore, getImageDetailInfo, deleteOtherImage, getAppCenterBindUser } from '../../actions/app_center'
import NotificationHandler from '../../common/notification_handler'
import Title from '../Title'

class ImageCenter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      createModalShow: false,
    }
  }
  setItem(type) {
    this.setState({itemType:type})
    if (type=='public') {
      browserHistory.push('/app_center/projects/public')
      return
    }
    browserHistory.push('/app_center/projects')
  }
  componentWillMount() {
    let type='private'
    if(location.pathname.indexOf('/app_center/projects/public') >-1) {
      type = 'public'
    }
    this.setState({itemType:type})
  }
  render() {
    const { children } = this.props
    return (
      <QueueAnim className='ImageCenterBox' type='right'>
        <div id='ImageCenter' key='ImageCenterBox'>
          <Title title="镜像仓库" />
          <div className="ImageCenterTabs">
           <span className={this.state.itemType =='private' ?'tab active':'tab'} onClick={()=> this.setItem('private')}>我的镜像项目</span>
            <span className={this.state.itemType =='public' ?'tab active':'tab'} onClick={()=> this.setItem('public')}>公开镜像项目</span>
            <Button type="primary" size="large" icon="plus" style={{float:'right',marginTop:10,marginRight:10}}>添加第三方</Button>
          </div>
          {children}
          {/*<Tabs
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

          </Modal>*/}
        </div>
      </QueueAnim>
    )
  }
}

export default ImageCenter