/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * filterTabs.js page
 *
 * @author zhangtao
 * @date Friday September 14th 2018
 */
// antd 1.xx tabs 存在缺陷, 其子组件必须是TabPane,当需要按条件显示某些tabs时, 特别困难, 可以利用这个组件做.
import React from 'react'
import { Tabs } from 'antd'
// url: Regx
// filterKey: Array<string>
// /\/middleware_center\/deploy\/detail/
export default function TenxTabFactory(url, filterKey) {
  return class TenxTab extends React.Component {
    render() {
      const appCenterChoiceShowRegx = url
      const appCenterChoiceHidden = appCenterChoiceShowRegx.test(window.location.pathname)
      const newChildren = appCenterChoiceHidden ?
      this.props.children.filter(({key}) => filterKey.includes(key)).map(item => {
        item.props.children.props.appCenterChoiceHidden = true // 对子组件注入props
        return item
      })
      :  this.props.children
      return <div>
        <Tabs {...this.props}>
        {newChildren}
        </Tabs>
      </div>
    }
  }
}

