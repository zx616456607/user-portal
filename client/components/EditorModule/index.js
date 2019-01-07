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
// import TenxEditor from '@tenx-ui/editor/lib'
// import '@tenx-ui/editor/assets/index.css'
// import 'codemirror/mode/yaml/yaml'

import TenxEditor from '@tenx-ui/editor'
import '@tenx-ui/editor/assets/index.css'
import 'brace/mode/yaml'
import 'brace/snippets/yaml'
import 'brace/mode/json'
import 'brace/snippets/json'
import 'brace/theme/monokai'
import 'brace/mode/text'
import 'brace/snippets/text'

// const DEFAULT_OPTIONS = {
//   mode: 'yaml',
// }

export default class YamlEditor extends React.Component {
  render() {
    const {
      // title, options,
      ...otherProps } = this.props
    return <TenxEditor
      // height={height || '400px'}
      // title={ title || 'Yaml' }
      // options={Object.assign({}, options, DEFAULT_OPTIONS)}
      {...otherProps}
    />
  }
}
