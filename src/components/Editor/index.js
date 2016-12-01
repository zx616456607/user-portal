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
import { Icon } from 'antd'
import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codeMirror/theme/3024-night.css'
import './style/Editor.less'

class Editor extends Component {
  constructor(props) {
    super(props)
    this.changeBoxSize = this.changeBoxSize.bind(this);
    this.state = {
      currentBox: 'normal'
    }
  }
  
  changeBoxSize() {
    //this function for user change the box size
    const { currentBox } = this.state;
    const { parentId } = this.props;
    if(currentBox == 'normal') {
      this.setState({
        currentBox: 'big'
      })
      if(Boolean(parentId)) {
        document.getElementById(parentId).style.transform = 'none';
      }
      setTimeout(function(){    
        document.getElementById('CodeMirror').style.position = 'fixed';
      })
    } else {
      this.setState({
        currentBox: 'normal'
      })
      if(Boolean(parentId)) {
        document.getElementById(parentId).style.transform = 'translateX(0px)';
      }
      document.getElementById('CodeMirror').style.position = 'relative';
    }
  }

  render() {
    const { value, options, title } = this.props;
    return (
      <div id='CodeMirror' className={ this.state.currentBox == 'big' ? 'bigCodeMirror' : null }>
        <div className='editOperaBox'>
          <span className='title'>{title}</span>
          <div className='operaBtn' onClick={this.changeBoxSize.bind(this)}>
            { this.state.currentBox == 'normal' ? [<Icon type='arrow-salt' key='arrow-salt'/>] : [<Icon type='shrink' key='shrink' />] }
          </div>
        </div>
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
  onFocusChange: PropTypes.func // Called when the editor is focused or loses focus
}

Editor.defaultProps = {
  autoSave: false,
  preserveScrollPosition: false,
}

export default Editor