/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * SecondSider component
 *
 * v0.1 - 2016-11-17
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router'
import "./style/SecondSider.less"

const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

function currentPathNameCheck(scope, menuList) {
  //this function for check the pathname and change the current key 
  let pathname = window.location.pathname;
  let flag = true;
  //this check the pathname from the image_store
  menuList.map((item, index) => {
    if(index != 0) {      
      let checkPath = pathname.indexOf(item.url)
      if(checkPath > -1) {
        flag = false;
        let temp = 'secondSider' + index
        scope.setState({
          current: temp
        })
      }
    }
  });
  if(flag) {
    scope.setState({
      current: 'secondSider0'
    })
  }
}


export default class SecondSider extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.changeSiderStyle = this.changeSiderStyle.bind(this);
    this.state = {
      current: 'secondSider0',
      currentSiderStyle: 'normal' 
    }
  }
  
  componentWillMount(){
    const { menuList } = this.props
    currentPathNameCheck(this, menuList);
  }

  handleClick(e) {
    this.setState({
      current: e.key,
    });
  }
  
  changeSiderStyle() {
    //this function for user changet the second sider style to 'normal' or 'hide'
    const { currentSiderStyle } = this.state;
    const { scope } = this.props;
    if(currentSiderStyle == 'normal') {
      this.setState({
        currentSiderStyle: 'hide'
      });
      scope.setState({
        containerSiderStyle: 'hide'
      });
    } else {
      this.setState({
        currentSiderStyle: 'normal'
      });
      scope.setState({
        containerSiderStyle: 'normal'
      });
    }
  }

  render() {
    const { current } = this.state
    const { menuList } = this.props
    let menuShow = menuList.map((item, index) => {
      return (       
        <Menu.Item key={'secondSider' + index}>
          <Link to={item.url}>{item.name}</Link>
        </Menu.Item>
      )
    });
    return (
      <div id="SecondSider">
        <div>
          <Menu onClick={this.handleClick}
            selectedKeys={[current]}
            mode="inline"
            >
            { menuShow }
          </Menu>
          <div className={ this.state.currentSiderStyle == 'normal' ? 'siderBtnBox' : 'hideBtnBox siderBtnBox' } onClick={this.changeSiderStyle}>
            { this.state.currentSiderStyle == 'normal' ? [<i key='fa-step-backward' className='fa fa-step-backward'></i>] : [<i key='fa-step-forward' className='fa fa-step-forward'></i>] }
            <div className='btnBack'></div>
          </div>
        </div>
      </div>
    )
  }
}