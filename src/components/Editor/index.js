/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/**
 * CodeMirror editor
 *
 * v0.1 - 2016-11-30
 * @author Zhangpc
 */

import React, { Component, PropTypes } from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codeMirror/theme/3024-night.css'

class Editor extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { value, options } = this.props
    return (
      <div>
        <CodeMirror {...this.props} />
      </div>
    )
  }
}

Editor.propTypes = {
  autoSave: PropTypes.bool, // Automatically persist changes to underlying textarea (default false)
  value: PropTypes.string, // The editor value
  preserveScrollPosition: PropTypes.bool, // Preserve previous scroll position after updating value (default false)
  options: PropTypes.object, // options passed to the CodeMirror instance (https://codemirror.net/doc/manual.html#api)
  onChange: PropTypes.func, // Called when a change is made
  onFocusChange: PropTypes.func, // Called when the editor is focused or loses focus
}

Editor.defaultProps = {
  autoSave: false,
  preserveScrollPosition: false,
}

export default Editor