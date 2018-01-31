/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * config group
 *
 * v0.1 - 2018-01-30
 * @author Zhangpc
 */

import React from 'react'
import { Collapse } from 'antd'
import ConfigGroupHeader from './Header'
import ConfigGroupContent from './Content'

export default function ConfigGroup(props) {
  const {
    group, checkedList, setCheckedList, removeSecrets,
    openCreateConfigFileModal, openUpdateConfigFileModal,
    removeKeyFromSecret,
    ...otherProps
  } = props
  return (
    <Collapse.Panel
      header={
        <ConfigGroupHeader
          group={group}
          checkedList={checkedList}
          setCheckedList={setCheckedList}
          removeSecrets={removeSecrets}
          openCreateConfigFileModal={openCreateConfigFileModal}
        />
      }
      {...otherProps}
    >
      <ConfigGroupContent
        group={group}
        openUpdateConfigFileModal={openUpdateConfigFileModal}
        removeKeyFromSecret={removeKeyFromSecret}
      />
    </Collapse.Panel>
  )
}
