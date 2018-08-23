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
import { Upload, Button, Icon, Radio, Select, Row, Col, Input, Form } from 'antd'
import Editor from '../../../client/components/EditorModule/index'
import './style/ConfigFileContent.less'

const RadioGroup = Radio.Group
const FormItem = Form.Item

class ConfigFileContent extends React.Component {
  state = {
    readOnly: false,
    method: this.props.method || 1,
    btnLoading: false,
    fetchStatus: false,
  }
  onRadioChange = (e) => {
    const method = e.target.value
    const readOnly = method === 2
    const { tempConfigDesc, form } = this.props
    const { setFieldsValue } = form
    this.setState({
      readOnly,
    })
    let configDesc = ""
    if (!readOnly) {
      configDesc = tempConfigDesc
    }
    setFieldsValue({
      configDesc,
      method,
    })
  }
  onImportClick = () => {
    const { form } = this.props
    const { setFieldsValue } = form
    this.setState({
      btnLoading: true,
    }, () => {
      setTimeout(() => {
        // 模拟导入成功
        const res = "导入成功"
        this.setState({
          btnLoading: false,
          fetchStatus: true,
        })
        setFieldsValue({
          configDesc: res,
        })
      }, 2000)
      const { fetchFileContent } = this.props
      const query = {}
      !!fetchFileContent && fetchFileContent(query, {
        success: {
          func: res => {
            res.xxx
            this.setState({
              fetchStatus: true,
            })
          },
        },
        failed: {
          func: () => {

          },
        },
      })
    })
  }
  render() {
    const { descProps, beforeUpload, filePath, form, branch, path, branchs = [1,2,3] } = this.props
    const { readOnly, btnLoading, fetchStatus } = this.state
    const options = branchs.map(item => <Select.Option key={item} value={item}>{item}</Select.Option>)
    const { getFieldProps, getFieldValue } = form
    const method = getFieldValue("method") || 1
    const methodProps = {...getFieldProps('method',
      {
        initialValue: 1,
        onChange: this.onRadioChange,
      },
    )}
    const selBranchProps = {...getFieldProps('branch',
      {
        initialValue: branch || undefined,
      }
    )}
    const pathProps = {...getFieldProps('path',
      {
        initialValue: path || undefined,
      }
    )}

    return(
      <div className="configFileContent">
        <div>导入或直接输入配置文件</div>
        <FormItem className="formItem">
          <RadioGroup {...methodProps}>
            <Radio key="1" value={1}>本地文件导入</Radio>
            <Radio key="2" value={2}>Git仓库导入</Radio>
          </RadioGroup>
        </FormItem>
        {
          method === 1 ?
            <div>
              <Upload beforeUpload={(file) => beforeUpload(file)} showUploadList={false} ref={(instance) => this.uploadInput = instance}>
                <Button type="ghost" style={{marginLeft: '5px'}} disabled={this.state.disableUpload}>
                  <Icon type="upload" /> 读取文件内容
                </Button>
              </Upload>
              <span className="filepath" >{filePath}</span>
            </div>
            :
            <div>
              <div className="deleteRow alertRow">
                <i className="fa fa-exclamation-triangle"/>请先配置 Git 仓库
              </div>
              <Row className="importRow">
                <Col span={7}>
                  <FormItem className="formItem" {...selBranchProps}>
                    <Select className="selBranch" placeholder="请选择代码分支">
                      {options}
                    </Select>
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem className="formItem" {...pathProps}>
                    <Input className="path" placeholder='请输入配置文件路径，例如"/app/config"' />
                  </FormItem>
                </Col>
                <Col span={4}>
                  <Button type="primary" onClick={this.onImportClick} loading={btnLoading}>导入</Button>
                </Col>
                <Col className="importStatus" span={4}>
                  {
                    (() => {
                      let ele
                      if (btnLoading) {
                        ele = "" // <span className="primary">导入中...</span>
                      } else {
                        if (fetchStatus){
                          ele = <span className="succ"><Icon type="check-circle-o" /> 导入成功</span>
                        } else {
                          ele = "" // <span className="failed">导入失败</span>
                        }
                      }
                      return ele
                    })()
                  }
                </Col>
              </Row>
            </div>
        }
        <Editor
          title="配置文件内容"
          options={{
            readOnly
          }}
          style={{ minHeight: '300px' }}
          {...descProps}/>
      </div>
    )
  }
}

export default ConfigFileContent
