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
import { Card } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { loadImageDetailTag } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import './style/ImageVersion.less'

let MyComponent = React.createClass({	  
  propTypes : {
    config : React.PropTypes.object
  },
  render : function() {
		let tagList = this.props.config;
		let items = tagList.tagList.map((item,index) => {
		  return (
		    <div className="imageDetail" key={index} >
					<i className="fa fa-tag"></i>&nbsp;
        	{ item }
				</div>
	    );
		});
		return (
			<div>
	    	{ items }
	    </div>
    );
  }
});

class ImageVersion extends Component {
  constructor(props) {
    super(props);
    this.state = {
    	
    }
  }
  
  componentWillMount() {
		const { registry, loadImageDetailTag } = this.props;
		const imageDetail = this.props.config;
		loadImageDetailTag(registry, imageDetail.name)
  }
  
  render() {
  	const tagList = {
  		"tagList": this.props.imageDetailTag
  	};
    return (
      <Card className="ImageVersion">
        <MyComponent config={ tagList } />
    	</Card>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultImageDetailTag = {
    isFetching: false,
    registry: DEFAULT_REGISTRY,
    tag: []
  }
  const { imageTag } = state.getImageTag
  const { registry, tag, isFetching, server } = imageTag[DEFAULT_REGISTRY] || defaultImageDetailTag

  return {
    registry,
		registryServer: server,
    imageDetailTag: tag,
    isFetching
  }
}

ImageVersion.propTypes = {
//
}

export default connect(mapStateToProps, {
	loadImageDetailTag
})(ImageVersion);