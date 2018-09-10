/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * config group: configfilecontent
 *
 * v0.1 - 2018-08-24
 * @author rensiwei
 */

import React from 'react'
import { connect } from 'react-redux'
import { Upload, Button, Icon, Radio, Select, Row, Col, Input, Form, Checkbox } from 'antd'
import Editor from '../../../client/components/EditorModule/index'
import './style/ConfigFileContent.less'
import { getProjectList } from "../../actions/cicd_flow"
import { getProjectBranches, getGitFileContent } from "../../actions/configs"
import filter from 'lodash/filter'

import NotificationHandler from '../../components/Notification'
const notify = new NotificationHandler()

const RadioGroup = Radio.Group
const FormItem = Form.Item

class ConfigFileContent extends React.Component {
  state = {
    readOnly: (!!this.props.method && this.props.method === 2) || false,
    method: this.props.method || 1,
    btnLoading: false,
    fetchStatus: false,
    branches: [],
    projects: [],
    isNeedSet: false,
  }
  componentDidMount = () => {
    const { method } = this.props
    if (method === 2) {
      this.loadGitProjects()
    }
  }
  loadGitProjects = () => {
    const { getProjectList } = this.props
    getProjectList({
      failed:{
        func: (err) => {
          this.setState({
            isNeedSet: true,
          })
        }
      },
      success: {
        func: (res) => {
          if(res.data && res.data.results){
            this.setState({
              projects: filter(res.data.results, { repoType: "gitlab" }),
            })
          } else {
            this.setState({
              isNeedSet: true,
            })
          }
        }
      }
    })
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
    } else {
      this.loadGitProjects()
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
      // setTimeout(() => {
      //   // 模拟导入成功
      //   const res = "导入成功"
      //   this.setState({
      //     btnLoading: false,
      //     fetchStatus: true,
      //   })
      //   setFieldsValue({
      //     configDesc: res,
      //   })
      // }, 2000)
      const { getGitFileContent, form } = this.props
      const { validateFields } = form
      validateFields(["projectId", "filePath", "defaultBranch"], (errors, values) => {
        if(!!errors){
          return
        }
        const query = {
          project_id: values.projectId,
          branch_name: values.defaultBranch,
          path_name: values.filePath,
        }
        !!getGitFileContent && getGitFileContent(query, {
          success: {
            func: res => {
              this.setState({
                fetchStatus: true,
              })
              setFieldsValue({
                data: res.results.content,
              })
            },
          },
          failed: {
            func: err => {
              notify.warn("导入失败, 请检查目录结构")
            },
          },
          finally: {
            func: () => {
              this.setState({
                btnLoading: false,
              })
            }
          }
        })
      })
    })
  }
  beforeUpload = (file) => {
    const fileInput = this.uploadInput.refs.upload.refs.inner.refs.file
    const fileType = fileInput.value.substr(fileInput.value.lastIndexOf('.') + 1)
    if(!/xml|json|conf|config|data|ini|txt|properties|yaml|yml/.test(fileType)) {
      notify.info('目前仅支持 properties/xml/json/conf/config/data/ini/txt/yaml/yml 格式', true)
      return false
    }
    const self = this
    const fileName = fileInput.value.substr(fileInput.value.lastIndexOf('\\') + 1)
    self.setState({
      disableUpload: true,
      filePath: '上传文件为 ' + fileName
    })
    notify.spin('读取文件内容中，请稍后')
    const fileReader = new FileReader()
    fileReader.onerror = function(err) {
      self.setState({
        disableUpload: false,
      })
      notify.close()
      notify.error('读取文件内容失败')
    }
    fileReader.onload = function() {
      self.setState({
        disableUpload: false
      })
      notify.close()
      notify.success('文件内容读取完成')
      const configDesc = fileReader.result.replace(/\r\n/g, '\n')
      self.props.form.setFieldsValue({
        configDesc,
      })
      this.setState({
        tempConfigDesc: configDesc
      })
    }
    fileReader.readAsText(file)
    return false
  }
  onProjectSelect = value => {
    this.setState({
      branches: [],
    }, async () => {
      const { getProjectBranches, form } = this.props
      const { getFieldProps, getFieldValue, setFieldsValue } = form
      await setFieldsValue({
        defaultBranch: undefined,
      })
      const currProjectId = getFieldValue("projectId") || ""
      getProjectBranches({ project_id: currProjectId }, {
        success: {
          func: res => {
            !!res.results.branches && this.setState({
              branches: res.results.branches,
            })
          }
        }
      })
    })
  }
  render() {
    const { descProps, filePath, form, defaultData, configNameList } = this.props
    const { projectId, defaultBranch, path, enable } = defaultData || {}
    const { readOnly, btnLoading, fetchStatus, projects, branches, isNeedSet } = this.state
    const { getFieldProps, getFieldValue } = form
    const method = getFieldValue("method") || this.props.method || 1

    const currProjectId = getFieldValue("projectId") || ""
    const currProject = filter(projects, { id: currProject })[0]
    const project_options = projects.map(item => <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>)
    const branch_options = branches.map(item => <Select.Option key={item.branch} value={item.branch}>{item.branch}</Select.Option>)

    const methodProps = {...getFieldProps('method',
      {
        initialValue: this.props.method || 1,
        onChange: this.onRadioChange,
      },
    )}
    const selBranchProps = {...getFieldProps('defaultBranch',
      {
        initialValue: defaultBranch || undefined,
      }
    )}
    const selProjectProps = {...getFieldProps('projectId',
      {
        initialValue: projectId || undefined,
        onChange: this.onProjectSelect,
      }
    )}
    const pathProps = {...getFieldProps('filePath',
      {
        initialValue: path || undefined,
      }
    )}
    const enableProps = {...getFieldProps('enable',
      {
        initialValue: enable || 0,
        valuePropName: 'checked',
      }
    )}
    // console.log("configNameList", configNameList)
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
              <Upload beforeUpload={(file) => this.beforeUpload(file)} showUploadList={false} ref={(instance) => this.uploadInput = instance}>
                <Button type="ghost" style={{marginLeft: '5px'}} disabled={this.state.disableUpload}>
                  <Icon type="upload" /> 读取文件内容
                </Button>
              </Upload>
              <span className="filepath" >{filePath}</span>
            </div>
            :
            <div>
              {
                isNeedSet &&
                <div className="deleteRow alertRow">
                  <i className="fa fa-exclamation-triangle"/>请先关联 GitLab 代码仓库
                </div>
              }
              <Row className="importRow">
                <Col className="selleft" span={12}>
                  <FormItem className="formItem">
                    <Select {...selProjectProps} className="selBranch" placeholder="请选择代码仓库">
                      {project_options}
                    </Select>
                  </FormItem>
                </Col>
                <Col className="selright" span={12}>
                  <FormItem className="formItem">
                    <Select {...selBranchProps} className="selBranch" placeholder="请选择代码分支">
                      {branch_options}
                    </Select>
                  </FormItem>
                </Col>
              </Row>
              <Row className="importRow">
                <Col span={20}>
                  <FormItem className="formItem">
                    <Input {...pathProps} className="path" placeholder='请输入配置文件路径，例如"/app/config"' />
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
              <Row>
                <Col span={24}>
                  <Checkbox {...enableProps}>提交代码自动更新</Checkbox>
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

function mapStateToProps(state) {
  const { cluster } = state.entities.current
  return {
    clusterId: cluster.clusterID,
  }
}
export default connect(mapStateToProps,{
  getProjectList, getProjectBranches, getGitFileContent
})(ConfigFileContent)
