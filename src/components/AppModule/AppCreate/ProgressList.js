/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * ProgressList component
 * 
 * v0.1 - 2016-09-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/ProgressList.less'		

export default class ProgressList extends Component {
  constructor(props) {
	super(props);
  }
	
  render() {
  	const parentScope = this.props.scope;
  	const pathName = parentScope.props.location.pathname;
  	const createModel = parentScope.state.createModel;
  	return (
        <QueueAnim 
          id = "ProgressList"        
          type = "left"
        >
          <div>
            <div className="blockBox"></div>
            { createModel == "fast" ? [
            <QueueAnim className="ProgressList" key="ProgressList" type="left">
            <div key="a">
              <div className="firstStep step">
                <svg className="commonCircle">
                  <use xlinkHref="#step" />
                </svg>
                <svg className="commonLine">
                  <use xlinkHref="#stepline" />
                </svg>
                <span>部署方式</span>          
              </div>
              <div className={currentShowSecondStep(pathName,"second") ? "currentStep secondStep step":"secondStep step"}>
                <svg className="commonCircle">
                  <use xlinkHref="#step" />
                </svg>
                <svg className="commonLine">
                  <use xlinkHref="#stepline" />
                </svg>
                <span>服务列表</span>
              </div>
              <div className={currentShowSecondStep(pathName,"third") ? "currentStep thirdStep step":"thirdStep step"}>
                <svg className="commonCircle">
                  <use xlinkHref="#step" />
                </svg>
                <span>编排文件</span>
              </div>
            </div>
            </QueueAnim>
            ] : null 
            }
            { createModel == "store" ? [
            <QueueAnim className="ProgressList" key="ProgressList" type="left">
            <div key="b">
              <div className="firstStep step">
                <svg className="commonCircle">
                  <use xlinkHref="#step" />
                </svg>
                <svg className="commonLine">
                  <use xlinkHref="#stepline" />
                </svg>
                <span>部署方式</span>          
              </div>
              <div className={"secondStep step"}>
                <svg className="commonCircle">
                  <use xlinkHref="#step" />
                </svg>
                <svg className="commonLine">
                  <use xlinkHref="#stepline" />
                </svg>
                <span>应用商城</span>
              </div>
              <div className="thirdStep step">
                <svg className="commonCircle">
                  <use xlinkHref="#step" />
                </svg>
                <span>编排文件</span>
              </div>
            </div>
            </QueueAnim>
            ] : null 
            }
            { createModel == "layout" ? [
            <QueueAnim className="ProgressList" key="ProgressList" type="left">
            <div key="c">
              <div className="firstStep step">
                <svg className="commonCircle">
                  <use xlinkHref="#step" />
                </svg>
                <svg className="commonLine">
                  <use xlinkHref="#stepline" />
                </svg>
                <span>部署方式</span>          
              </div>
              <div className={currentShowSecondStep(pathName,"third") ? "currentStep thirdStep step":"thirdStep step"}>
                <svg className="commonCircle">
                  <use xlinkHref="#step" />
                </svg>
                <span>编排文件</span>
              </div>
            </div>
            </QueueAnim>
            ] : null 
            }
          </div>  
        </QueueAnim>
    )
  }
}

ProgressList.propTypes = {
  // Injected by React Router
}

//check create model for show different step
function currentShowSecondStep(pathname,step){
  let appStore = new RegExp("app_store","gi");
  let serviceList = new RegExp("fast_create","gi");
  //check current step is setting compose file?
  let composeFile = new RegExp("compose_file","gi");
  if(composeFile.test(pathname)){
  	return true;
  }else if(step == "second"){
  //the current step isn't setting compose file,so that the current step is in the second step
    if(appStore.test(pathname) ||  serviceList.test(pathname)){	
	  return true;
  	}
  }else{  	
    return false;
  }
}

