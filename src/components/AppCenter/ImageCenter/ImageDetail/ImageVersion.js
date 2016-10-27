/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageVersion component
 *
 * v0.1 - 2016-10-09
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Card, Spin, Tabs } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ServiceAPI from './ServiceAPI.js'
import OtherServiceApi from './OtherServiceApi.js'
import './style/ImageVersion.less'
import { loadImageDetailTag , getOtherImageTag} from '../../../../actions/app_center'

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
  render: function () {
    const { loading } = this.props;
    if (loading) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let { tagList } = this.props.config ||[];
    const fullname = this.props.fullname;
    
    let items
    if (this.props.imageId) {
      items = tagList.map((item, index) => {
        return (
          <TabPane tab={<span><i className="fa fa-tag"></i>&nbsp;{item}</span>} className="imageDetail" key={index} >
            <OtherServiceApi imageTag={item} fullname={fullname} imageId={this.props.imageId} />
          </TabPane>
        );
      });      
    } else {
      items = tagList.map((item, index) => {
        return (
          <TabPane tab={<span><i className="fa fa-tag"></i>&nbsp;{item}</span>} className="imageDetail" key={index} >
            <ServiceAPI imageTag={item} fullname={fullname} />
          </TabPane>
        );
      });

    }
    return (
      <Tabs>
        {items}
      </Tabs>
    );
  }
});

class ImageVersion extends Component {
  constructor(props) {
    super(props);
    this.changeNewImage = this.changeNewImage.bind(this);
    this.state = {
      imageDetail: null
    }
  }

  componentWillMount() {
    const { registry, loadImageDetailTag , getOtherImageTag} = this.props;
    const imageDetail = this.props.config;
    const imageId = this.props.imageId
    this.setState({
      imageDetail: imageDetail
    })
    if (typeof imageDetail === "string") {
      const config = {imageName: imageDetail, id: imageId}
      getOtherImageTag(config)
    } else {
      loadImageDetailTag(registry, imageDetail.name);
    }
  }

  componentWillReceiveProps(nextPorps) {
    //this function mean when the user change show image detail
    //it will be check the old iamge is different from the new one or not
    //if the different is true,so that the function will be request the new one's tag
    const oldImageDatail = this.state.imageDetail;
    const newImageDetail = nextPorps.config;
    if (newImageDetail != oldImageDatail) {
      this.changeNewImage(newImageDetail);
    }
  }

  changeNewImage(image) {
    //this function mean first change the new image to the old and request the image's tag
    this.setState({
      imageDetail: image
    });
    const { registry, loadImageDetailTag ,getOtherImageTag} = this.props;

    const imageId = this.props.imageId
    const imageDetail = this.props.config;
    const config = {imageName: image, id: imageId }
    if (typeof imageDetail === "string") {
      const config = {imageName: imageDetail, id: imageId}
      console.log('image', image)
      getOtherImageTag(config)
    } else {
      loadImageDetailTag(registry, imageDetail.name);
    }
  }

  render() {
    const { isFetching } = this.props;
    const imageDetail = this.props.config;
    console.log('parent ',this.props)
    let  tagList = {
      "tagList": this.props.imageDetailTag
    };
    if (this.props.imageId) {
      tagList = {'tagList': this.props.otherDetailTag}
    }
    return (
      <Card className="ImageVersion">
        <MyComponent loading={isFetching} config={tagList} imageId={this.props.imageId} fullname={imageDetail.name ? imageDetail.name : imageDetail} />
      </Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultImageDetailTag = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    tag: [],
  }
  const { imageTag ,otherImageTag} = state.getImageTag
  const { registry, tag, isFetching, server} = imageTag[DEFAULT_REGISTRY] || defaultImageDetailTag
  const otherDetailTag = otherImageTag.imageTag || []
  return {
    registry,
    registryServer: server,
    imageDetailTag: tag,
    isFetching,
    otherDetailTag,
  }
}

ImageVersion.propTypes = {
  // getOtherImageTag: PropTypes.func.isRequired
}

function mapDispatchToProps(dispatch) {
  return {
    getOtherImageTag:(obj)=> {
      dispatch(getOtherImageTag(obj))
    },
    loadImageDetailTag:(registry, name)=> {
      dispatch(loadImageDetailTag(registry, name))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ImageVersion);