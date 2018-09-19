/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
*/

/**
 *
 *
 *
 * @author Songsz
 * @date 2018-09-19
 *
*/

import React from 'react'
import './style/ThirdTabs.less'

const ThirdTabs = ({ onChange, tabs, active }) => (
  <div className="thirdTabs">
    {
      tabs.map(tab => (
        <div
          className={`tabs ${active === tab.value ? 'activeTabs' : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.name}
        </div>
      ))
    }
  </div>
)

export default ThirdTabs
