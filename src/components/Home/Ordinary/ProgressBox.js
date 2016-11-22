/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/11/22
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import './style/ProgressBox.less'

export default class ProgressBox extends Component{
  constructor(props){
    super(props)
    this.state = {
      
    }
  }
  render(){
    return (
      <div id='ProgressBox'>
        <div className="container">
          <div className="wrapper">
            <div className="green">
              <div className="progress">
                <div className="inner">
                  <div className="txt">授信额度</div>
                  <div className="percent">
                    <span className="symbol">￥</span>9000
                    <span className="symbol">.00</span>
                  </div>
                  <div className="water"></div>
                  <div className="water w2"></div>
                  <div className="glare"></div>
                  <div className="up">
                    提额
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
