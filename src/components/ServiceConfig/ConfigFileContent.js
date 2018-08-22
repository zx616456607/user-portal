/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * config group: create modal
 *
 * v0.1 - 2018-01-30
 * @author Zhangpc
 */

import React from 'react'
import { Upload, Button, Icon, Radio } from 'antd'
import Editor from '../../../client/components/EditorModule/index'

const RadioGroup = Radio.Group

class ConfigFileContent extends React.Component {
  state = {
    readOnly: false,
    method: this.props.method || 1
  }
  onRadioChange = (e) => {
    this.setState({

    })
  }
  render() {
    const { descProps, beforeUpload, filePath } = this.props
    const { readOnly, method } = this.state
    return(
      <div>
        <div>导入或直接输入配置文件</div>
        <div>
          <RadioGroup onChange={this.onRadioChange} value={method} >
            <Radio key="1" value={1}>本地文件导入</Radio>
            <Radio key="2" value={2}>Git仓库导入</Radio>
          </RadioGroup>
        </div>
        {
          method === 1 ?
          <div>
            <Upload beforeUpload={(file) => beforeUpload(file)} showUploadList={false} ref={(instance) => this.uploadInput = instance}>
              <Button type="ghost" style={{marginLeft: '5px'}} disabled={this.state.disableUpload}>
                <Icon type="upload" /> 读取文件内容
              </Button>
            </Upload>
            <span style={{width: '100%', display:'block', textAlign: 'left', lineHeight:'20px', color:'#c1c1c1', marginTop:10}} >{filePath}</span>
          </div>
          :
          <div>
            git
          </div>
        }
        <Editor
          title="配置文件内容"
          readOnly={readOnly}
          style={{ minHeight: '300px' }}
          {...descProps}/>
      </div>
    )
  }
}

export default ConfigFileContent
