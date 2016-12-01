/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * Yaml editor
 *
 * v0.1 - 2016-11-30
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import Editor from './'
import 'codemirror/mode/yaml/yaml'
import merge from 'lodash/merge'

const defaultOpts = {
  lineNumbers: true,
  readOnly: true,
  mode: 'yaml',
  styleActiveLine: true,
  theme: '3024-night',
  lineWrapping: true,
  tabSize: 2,
}

class YamlEditor extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { value, options, parentId, callback } = this.props
    const newOpts = merge({}, defaultOpts, options)
    newOpts.mode = 'yaml'
    return (
      <Editor value={value} options={newOpts} title={'Yaml'} parentId={parentId} callback={callback} />
    )
  }
}

export default YamlEditor