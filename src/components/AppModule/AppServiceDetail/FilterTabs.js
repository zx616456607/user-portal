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
export default class TenxTab extends React.Component {
    render() {
      const appCenterChoiceHidden = this.props.bpmShow
      const children = this.props.children
      // react 包含的子组件的形式有很多种
      /**
      常规方式 [{},{},{}] 每个对象代表一个组件
      也有可能, 会出现 [{}, [{}, {}], {}] 这种方式react也是可以渲染的, 为了兼容这种情况, 添加下面这行代码
      */
      let spreadChildren = []
      children.forEach((item) => {
        if (Array.isArray(item)) {
          return spreadChildren = spreadChildren.concat(item)
        }
        spreadChildren.push(item)
      })
      const newChildren = appCenterChoiceHidden ?
      spreadChildren.filter(({key}) => this.props.filterKey.includes(key)).map(item => {
        // item.props.children.props.appCenterChoiceHidden = true // 对子组件注入props
        return item
      })
      :  children
      return <div>
        <Tabs {...this.props}>
        {newChildren}
        </Tabs>
      </div>
    }
  }

