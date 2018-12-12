/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * LoginBgV3.js page
 *
 * @author zhangtao
 * @date Thursday December 6th 2018
 */
import * as React from 'react'
import './style/LoginBgV3.less'
import wave1 from '../../../../static/img/wave1.png'
import wave2 from '../../../../static/img/wave2.png'
import bgCircle from '../../../../static/img/bgCircle.png'
import Parallax from 'parallax-js'

export default class LoginBgV3 extends React.Component {
  scene
  componentDidMount() {
    // let parallax = new Parallax(this.scene)
    this.setBodyScrollbar()
  }
  componentWillUnmount() {
    this.setBodyScrollbar(true)
  }
  setBodyScrollbar(clearWhenUnmount) {
    [ 'html', 'body' ].map(tag => {
      document.getElementsByTagName(tag)[0]
        .setAttribute('style', clearWhenUnmount? '' : 'overflow-x: hidden !important')
    })
    document.getElementById("root")
    .setAttribute('style', clearWhenUnmount? 'min-width: 1024px' : 'min-width: 0px !important')
  }
  render() {
    return (
      <div id="LoginBgV3">
          {/* <img src={bgCircle} id="bgCircle1"/>
          <img src={bgCircle} id="bgCircle2"/>
          <img src={bgCircle} id="bgCircle3"/>
          <img src={bgCircle} id="bgCircle4"/>
        	<div id="container" className="container">
            <div id="scene" className="scene" ref={(relnode) => this.scene = relnode}>
              <div data-depth="0.90" >
                <div className="waveWrap1">
                  <img className="wave1" src={wave1}/>
                </div>
              </div>
              <div data-depth="1.00" >
                <div className="waveWrap2">
                  <img className="wave2" src={wave2}/>
                </div>
              </div>
            </div>
          </div> */}
          {this.props.children}
      </div>
    )
  }
}
