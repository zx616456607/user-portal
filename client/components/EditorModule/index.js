/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Yaml editor
 *
 * v0.1 - 2018-08-07
 * @author lvjunfeng
 */

import React from 'react'
import TenxEditor from '@tenx-ui/editor/lib'
import '@tenx-ui/editor/assets/index.css'
import 'codemirror/mode/yaml/yaml'

const DEFAULT_OPTIONS = {
  mode: 'yaml',
}

export default class YamlEditor extends React.Component {
  render() {
    const { title, options, ...otherProps } = this.props
    return <TenxEditor
      title={ title || 'Yaml' }
      options={Object.assign({}, options, DEFAULT_OPTIONS)}
      {...otherProps}
    />
  }
}
