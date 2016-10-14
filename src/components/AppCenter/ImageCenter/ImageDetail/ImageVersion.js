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
import { Card,Spin,Tabs } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { loadImageDetailTag } from '../../../../actions/app_center'
import { DEFAULT_REGISTRY } from '../../../../constants'
import ServiceAPI from './ServiceAPI.js'
import './style/ImageVersion.less'

const TabPane = Tabs.TabPane;

let MyComponent = React.createClass({	  
  propTypes : {
    config : React.PropTypes.object
  },
  getInitialState: function() {
    return {
    	currentTag: null
    };
  },
  render : function() {
  	const { loading } = this.props;
  	if(loading){
  		return (
  			<div>
  				<Spin />
  			</div>
  		)
  	}
		let { tagList } = this.props.config;
		const fullname = this.props.fullname;
		let items = tagList.map((item,index) => {
		  return (
		    <TabPane tab={<span><i className="fa fa-tag"></i>&nbsp;{ item }</span>} className="imageDetail" key={index} >
					<ServiceAPI imageTag={item} fullname={ fullname } />
				</TabPane>
	    );
		});
		return (
			<Tabs>
	    	{ items }
	    </Tabs>
    );
  }
});

class ImageVersion extends Component {
  constructor(props) {
    super(props);
    this.changeNewImage = this.changeNewImage.bind(this);
    this.state = {
    	imageDetail:null
    }
  }
  
	componentWillMount(){
		const { registry, loadImageDetailTag } = this.props;
		const imageDetail = this.props.config;
		this.setState({
			imageDetail:imageDetail
		})
		loadImageDetailTag(registry, imageDetail.name);
	}
	
	componentWillReceiveProps(nextPorps){
		//this function mean when the user change show image detail
		//it will be check the old iamge is different from the new one or not
		//if the different is true,so that the function will be request the new one's tag
		const {scope} = this.props;
		const oldImageDatail = this.state.imageDetail;
		const newImageDetail = nextPorps.config;
		if(newImageDetail != oldImageDatail){
			console.log("change event")
			this.changeNewImage(newImageDetail);
  	}
	}
	
	changeNewImage(imageDetail){
		//this function mean first change the new image to the old and request the image's tag
		this.setState({
			imageDetail:imageDetail
		});
		const { registry, loadImageDetailTag } = this.props;
		loadImageDetailTag(registry, imageDetail.name);
	}
  
  render() {
  	const { isFetching } = this.props;	
  	const imageDetail = this.props.config;
  	const tagList = {
  		"tagList": this.props.imageDetailTag
  	};
    return (
      <Card className="ImageVersion">      	
        <MyComponent loading={ isFetching } config={ tagList } fullname={ imageDetail.name }/>     
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