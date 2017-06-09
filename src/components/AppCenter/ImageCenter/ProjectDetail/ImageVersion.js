/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageVersion component
 *
 * v0.1 - 2017-6-8
 * @author BaiYu
 */
import React, { Component } from 'react'
import { Card, Spin, Tabs } from 'antd'
import { connect } from 'react-redux'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ServiceAPI from './ServiceAPI.js'
import OtherServiceApi from './OtherServiceApi.js'
import './style/ImageVersion.less'
import { loadRepositoriesTags } from '../../../../actions/harbor'

const TabPane = Tabs.TabPane;

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.object
  },
  getInitialState: function () {
    return {
      currentTag: null
    };
  },
  render() {
    const { loading } = this.props;
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let tagList = this.props.config || []
    const fullname = this.props.fullname
    let items = tagList.map((item, index) => {
      return (
        <TabPane tab={<span><i className="fa fa-tag"></i>&nbsp;{item}</span>} className="imageDetail" key={`${item}@${index}`} >
          <ServiceAPI imageTags={item} fullname={fullname} />
        </TabPane>
      )
    })

    return (
      <Tabs>
        {items}
      </Tabs>
    )
  }
})

class ImageVersion extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageDetail: null,
    }
  }

  componentWillMount() {
    const { loadRepositoriesTags, loadRepositoriesTagConfigInfo } = this.props
    const imageDetail = this.props.config
    loadRepositoriesTags(DEFAULT_REGISTRY, imageDetail.name)
  }

  componentWillReceiveProps(nextPorps) {
    //this function mean when the user change show image detail
    //it will be check the old iamge is different from the new one or not
    //if the different is true,so that the function will be request the new one's tag
    const oldImageDatail = this.props.config;
    const newImageDetail = nextPorps.config;
    const { loadRepositoriesTags } = this.props
    if (newImageDetail.name != oldImageDatail.name) {
      loadRepositoriesTags(DEFAULT_REGISTRY, newImageDetail.name)
    }
  }


  render() {
    const { isFetching, imageDetailTag } = this.props;
    const imageDetail = this.props.config;
    return (
      <Card className="ImageVersion">
        <MyComponent loading={isFetching} config={imageDetailTag} fullname={imageDetail.name ? imageDetail.name : imageDetail} />
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultImageDetailTag = {
    isFetching: false,
    server: '',
    tag: [],
  }
  const { imageTags } = state.harbor
  let targetImageTag = {}
  if (imageTags[DEFAULT_REGISTRY]) {
    targetImageTag = imageTags[DEFAULT_REGISTRY][props.config.name] || {}
  }
  const { tag, server } = targetImageTag || defaultImageDetailTag
  return {
    imageDetailTag: tag,
    isFetching: targetImageTag.isFetching
  }
}


export default connect(mapStateToProps, {
  loadRepositoriesTags
})(ImageVersion);