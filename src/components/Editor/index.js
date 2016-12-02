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
import { Icon, Button, Tooltip } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/3024-night.css'
import './style/Editor.less'

const menusText = defineMessages({
  rows: {
    id: 'Editor.Error.rows',
    defaultMessage: '行：',
  },
  lines: {
    id: 'Editor.Error.lines',
    defaultMessage: '列：',
  },
  unknownReason: {
    id: 'Editor.Error.unknownReason',
    defaultMessage: '未知错误',
  },
  yamlError: {
    id: 'Editor.Error.yamlError',
    defaultMessage: 'yaml语法错误：',
  },
  yamlErrorReason: {
    id: 'Editor.Error.yamlErrorReason',
    defaultMessage: '错误原因：',
  },
  num: {
    id: 'Editor.Error.num',
    defaultMessage: '第',
  },
  yamlIndex: {
    id: 'Editor.Error.yamlIndex',
    defaultMessage: '段yaml',
  },
  errorNum: {
    id: 'Editor.Error.errorNum',
    defaultMessage: '错误数：',
  },
  nextOne: {
    id: 'Editor.Error.nextOne',
    defaultMessage: '下一个',
  },
  lastOne: {
    id: 'Editor.Error.lastOne',
    defaultMessage: '上一个',
  },
  Tooltip: {
    id: 'Editor.Error.Tooltip',
    defaultMessage: '多个Yaml文件请使用 --- 做分隔符',
  },
})

function matchClass(state, config) {
  //this function for match different class name
  if(state == 'big') {
    if(config.readOnly) {
      return 'bigCodeMirror bigCodeMirrorNoEdit';
    } else {
      if(config.mode == 'yaml') {
        return 'bigCodeMirror';
      }
      if(config.mode == 'dockerfile') {
        return 'bigCodeMirror bigCodeMirrorNoEdit';
      }
    }
  } else {
    return null;
  }
}

class Editor extends Component {
  constructor(props) {
    super(props)
    this.changeBoxSize = this.changeBoxSize.bind(this);
    this.onChangeLastError = this.onChangeLastError.bind(this);
    this.onChangeNextError = this.onChangeNextError.bind(this);
    this.state = {
      currentBox: 'normal',
      currentValues: null
    }
  }
  
  componentDidMount() {
    const { value } = this.props;
    this.setState({
      currentValues: value
    });
  }
  
  componentWillReceiveProps(nextProps) {
    const { value } = nextProps;
    this.setState({
      currentValues: value,
      currentBox: 'normal',
    })
  }
  
  changeBoxSize() {
    //this function for user change the box size
    //due to the css of parent dom have transform and it is not 'none'
    //when the dom have transform the borwer take it as an new container
    //and when it's child dom have 'postion: fixed'
    //the child only fixed in the parent dom not the root body
    //so we will recive which parent's css have transfrom and set it 'none'
    //ps: parent must be have an unity id
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
  
  onChangeLastError() {
    //this function for view user last one error
    let { errorList, currentErrorIndex, scope } = this.props;
    currentErrorIndex--;
    if( currentErrorIndex < 0 ) {
      currentErrorIndex = errorList.length - 1;
    }
    scope.setState({
      currentErrorIndex: currentErrorIndex
    })
  }
  
  onChangeNextError() {
    //this function for view user next one error
    let { errorList, currentErrorIndex, scope } = this.props;
    currentErrorIndex++;
    if( currentErrorIndex >= errorList.length ) {
      currentErrorIndex = 0;
    }
    scope.setState({
      currentErrorIndex: currentErrorIndex
    })
  }

  render() {
    const { options, title, errorList, currentErrorIndex, onChange } = this.props;
    let errorShow = null;
    if(title == 'Yaml') {     
      errorShow = errorList.map((item, index) => {
        return (
              <QueueAnim key={'codeMirrorErrorDetailAnimate' + index} className='codeMirrorErrorDetailAnimate'>
                <div className='codeMirrorErrorDetail' key={'codeMirrorErrorDetail' + index}>
                  <span>[{currentErrorIndex + 1}]</span>
                  <span><FormattedMessage {...menusText.num} />{item.index}<FormattedMessage {...menusText.yamlIndex} /></span>&nbsp;
                  {
                    Boolean(item.line) ? [
                      <span key='codeMirrorErrorDetailspan'>
                        <span><FormattedMessage {...menusText.rows} />{item.line}</span>&nbsp;
                        <span><FormattedMessage {...menusText.lines} />{item.column}</span>&nbsp;
                      </span>
                    ] : null
                  }  
                  <span><FormattedMessage {...menusText.yamlErrorReason} />{item.reason}</span>
                </div>
              </QueueAnim>
        )
      })
    }
    return (
      <div id='CodeMirror' className={ matchClass(this.state.currentBox, options) }>
        <div className='editOperaBox'>
          <span className='title'>{title}</span>
          <div className='operaBtn' onClick={this.changeBoxSize.bind(this)}>
            { this.state.currentBox == 'normal' ? [<Icon type='arrow-salt' key='arrow-salt'/>] : [<Icon type='shrink' key='shrink' />] }
            { title == 'Yaml' ? [
              <Tooltip placement='left'
                getTooltipContainer={() => document.getElementById('CodeMirror')}
                title={<FormattedMessage {...menusText.Tooltip} />}>
                <Icon type='question-circle-o' />
              </Tooltip>
              ] : null 
            }
          </div>
        </div>
        <CodeMirror ref='CodeMirror' value={this.state.currentValues} options={options} onChange={onChange} />
        {
          !options.readOnly && title == 'Yaml' ? [           
            <div className='CodeMirrorErrorBox' key='CodeMirrorErrorBox'>
              <span className='errorNumSpan'><FormattedMessage {...menusText.errorNum} />{errorList.length}</span>
              <div className='line' />
              {errorShow[currentErrorIndex]}
              <div className='CodeMirrorBtnBox'>
                <div className='commonBtn' onClick={this.onChangeLastError.bind(this)}>
                  <FormattedMessage {...menusText.lastOne} />
                </div>
                <div className='commonBtn' onClick={this.onChangeNextError.bind(this)}>
                  <FormattedMessage {...menusText.nextOne} />
                </div>
              </div>
              <div style={{ clear: 'both' }} />
            </div>
          ] : null
        }
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

export default connect()(injectIntl(Editor, {
  withRef: true,
}));
