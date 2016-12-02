/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * DockerFile editor
 *
 * v0.1 - 2016-11-30
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import Editor from './'
import 'codemirror/mode/dockerfile/dockerfile'
import merge from 'lodash/merge'

const defaultOpts = {
  lineNumbers: true,
  readOnly: true,
  mode: 'dockerfile',
  styleActiveLine: true,
  theme: '3024-night',
  lineWrapping: true,
  tabSize: 2,
}

class DockerFileEditor extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { value, options, parentId, callback } = this.props
    console.log(this.props.title)
    const newOpts = merge({}, defaultOpts, options)
    newOpts.mode = 'dockerfile'
    return (
      <Editor value={value} options={newOpts} title={'Docker File'} parentId={parentId} callback={callback} />
    )
  }
}

export default DockerFileEditor