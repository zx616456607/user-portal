/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * CreateModel component
 * 
 * v0.1 - 2016-09-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card,Button } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/CreateModel.less'

export default class CreateModel extends Component {
  constructor(props) {
	super(props);
	this.selectCreateModel = this.selectCreateModel.bind(this);
	this.state = {
	  createModel : "fast",
	  linkUrl : "fast_create"
	}
  }
  
  selectCreateModel(currentSelect){
  	//user select current create model,so that current selected model's css will be change
    let linkUrl = "";
  	if(currentSelect == "fast"){
  	  linkUrl = "fast_create"
  	}else if(currentSelect == "store"){
  	  linkUrl = "app_store"
  	}else if(currentSelect == "layout"){
  	  linkUrl = "compose_file"
  	}
  	const parentScope = this.props.scope;
  	this.setState({
  	  createModel:currentSelect,
  	  linkUrl:linkUrl
  	});
  	parentScope.setState({
  	  createModel:currentSelect
  	});
  }
  
  render() {
  	const { children } = this.props
  	const { createModel } = this.state
  	const { linkUrl } = this.state
  	console.log(this.props)
    return (
        <QueueAnim 
          id = "CreateModel"        
          type = "right"
        >
          <div className="CreateModel" key = "CreateModel">
            <div className="topBox">
              <div className="contentBox">
              <div className={ createModel == "fast" ? "fastCreate commonBox selectedBox":"fastCreate commonBox" } onClick={this.selectCreateModel.bind(this,"fast")}>
                <svg className="commonImg">
			      <use xlinkHref="#appcreatefast" />
			    </svg>
			    <div className="infoBox">
			      <p>快速创建</p>
			      <span>这是一个快速创建的介绍,怎么说呢,就是创建很快的,然后呢,总之呢,就是很快了!</span>
			    </div>
			    <svg className="commonSelectedImg">
			      <use xlinkHref="#appcreatemodelselect" />
			    </svg>
			    <i className="fa fa-check"></i>
              </div>
              <div className={ createModel == "store" ? "appStore commonBox selectedBox":"appStore commonBox" } onClick={this.selectCreateModel.bind(this,"store")}>
                <svg className="commonImg">
			      <use xlinkHref="#appstore" />
			    </svg>
			    <div className="infoBox">
			      <p>应用商城</p>
			      <span>这是一个应用商城的介绍,啥应用都有,要啥有啥,啥啥都有的,就看你能不想到了!</span>
			    </div>
			    <svg className="commonSelectedImg">
			      <use xlinkHref="#appcreatemodelselect" />
			    </svg>
			    <i className="fa fa-check"></i>
              </div>
              <div className={ createModel == "layout" ? "layout commonBox selectedBox":"layout commonBox" } onClick={this.selectCreateModel.bind(this,"layout")}>
                <svg className="commonImg">
			      <use xlinkHref="#appcreatelayout" />
			    </svg>
			    <div className="infoBox">
			      <p>编排文件</p>
			      <span>这是一个编排文件的介绍,如果你感觉你可以自己直接写呢,那就选这个好啦,反正我是不会写!</span>
			    </div>
			    <svg className="commonSelectedImg">
			      <use xlinkHref="#appcreatemodelselect" />
			    </svg>
			    <i className="fa fa-check"></i>
              </div>
              <div style={{ clear:"both" }}></div>
              </div>
            </div>
            <div className="bottomBox">
              <Link to="/app_manage">
                <Button size="large">
                  取消
                </Button>
              </Link>
              <Link to={`/app_manage/app_create/${linkUrl}`}>
                <Button size="large" type="primary">
                  下一步
                </Button>
              </Link>
            </div>
          </div>
      </QueueAnim>
    )
  }
}

CreateModel.propTypes = {
  // Injected by React Router
}