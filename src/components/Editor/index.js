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
import $ from 'n-zepto'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codeMirror/theme/3024-night.css'
import './style/Editor.less'

let yaml = require('js-yaml')

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

//for js-yaml settting
const YamlDumpOpts = {
    noRefs: true,
    lineWidth: 5000
}

function matchYamlError(e, index, scope, height) {
  //this function for format yaml error
  //and we will change it to intl
  const { formatMessage } = scope.props.intl;
  let markExist = true;
  let reasonExist = true;
  if(!Boolean(e.mark)) {
    //sometime the mark is undefined
    markExist = false;
  }
  if(!Boolean(e.reason)) {
    //sometime the reason is undefined
    reasonExist = false;
    return formatMessage(menusText.search)
  }
  let errorBody = {
    index: (index + 1),
    reason: e.reason
  }
  if(markExist) {
    errorBody.column = e.mark.column;
    errorBody.line = e.mark.line + 1;
  }
  return errorBody;
}

class Editor extends Component {
  constructor(props) {
    super(props)
    this.changeBoxSize = this.changeBoxSize.bind(this);
    this.onChangeFunc = this.onChangeFunc.bind(this);
    this.onChangeLastError = this.onChangeLastError.bind(this);
    this.onChangeNextError = this.onChangeNextError.bind(this);
    this.state = {
      currentBox: 'normal',
      currentValues: null,
      errorList: [],
      currentErrorIndex: 0
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
      errorList: []
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
  
  onChangeFunc(e) {
    //this function for user input new words
    //and we will test the text is right or not
    //and the new words will be callback from the props
    //sometimes the code may not only one and they were split by '---' 
    const { title, callback } = this.props;
    let { errorList, currentErrorIndex } = this.state;
    const _this = this;
    let newErrorList = [];
    this.setState({
      currentValues: e
    });
    if(title == 'Yaml') {
      if(e.indexOf('---') > -1) {
        //multi codes
        let codeList = e.split('---');
        codeList.map((item, index) => {
          try {
            yaml.safeLoad(item)
          } catch(error) {
            let height = 0;
            for(let item of e) {
              if(item == '\n') {
                height++;
              }
            }
            newErrorList.push(matchYamlError(error, index, _this, height))
          }
        })
      } else {
        //only one
        try {
          yaml.safeLoad(e)
        } catch(error) {   
          let height = 0;
            for(let item of e) {
              if(item == '\n') {
                height++;
              }
            }
          newErrorList.push(matchYamlError(error, 0, _this, height))
        }
      }
    }
    callback(e);
    //the error num changed
    if(newErrorList.length != errorList.length && newErrorList.length > 0) {
      currentErrorIndex = newErrorList.length - 1;
      this.setState({
        currentErrorIndex: currentErrorIndex,
      });
    }
    if(newErrorList.length == 0) {
      currentErrorIndex = 0;
      this.setState({
        currentErrorIndex: currentErrorIndex,
      });
    }
    this.setState({
      errorList: newErrorList,
    });
  }
  
  onChangeLastError() {
    //this function for view user last one error
    let { errorList, currentErrorIndex } = this.state;
    currentErrorIndex--;
    if( currentErrorIndex < 0 ) {
      currentErrorIndex = errorList.length - 1;
    }
    this.setState({
      currentErrorIndex: currentErrorIndex
    })
  }
  
  onChangeNextError() {
    //this function for view user next one error
    let { errorList, currentErrorIndex } = this.state;
    currentErrorIndex++;
    if( currentErrorIndex >= errorList.length ) {
      currentErrorIndex = 0;
    }
    this.setState({
      currentErrorIndex: currentErrorIndex
    })
  }

  render() {
    const { options, title } = this.props;
    const { errorList, currentErrorIndex } = this.state;
    let errorShow = errorList.map((item, index) => {
      return (
            <QueueAnim key={'codeMirrorErrorDetailAnimate' + index} className='codeMirrorErrorDetailAnimate'>
              <div className='codeMirrorErrorDetail' key={'codeMirrorErrorDetail' + index}>
                <span>[{this.state.currentErrorIndex + 1}]</span>
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
    return (
      <div id='CodeMirror' className={ this.state.currentBox == 'big' ? 'bigCodeMirror' : null }>
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
        <CodeMirror ref='CodeMirror' value={this.state.currentValues} options={options} onChange={this.onChangeFunc.bind(this)} />
        {
          !options.readOnly ? [           
            <div className='CodeMirrorErrorBox' key='CodeMirrorErrorBox'>
              <span className='errorNumSpan'><FormattedMessage {...menusText.errorNum} />{this.state.errorList.length}</span>
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
