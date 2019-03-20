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
import { injectIntl } from 'react-intl'
import { Upload, Button, Icon, Radio, Select, Row, Col, Input, Form, Checkbox } from 'antd'
import Editor from '../../../client/components/EditorModule/index'
import './style/ConfigFileContent.less'
import { getProjectList } from "../../actions/cicd_flow"
import { getProjectBranches, getGitFileContent } from "../../actions/configs"
import filter from 'lodash/filter'
import indexIntl from './intl/indexIntl'

import NotificationHandler from '../../components/Notification'
import { format } from 'util';
const notify = new NotificationHandler()

const RadioGroup = Radio.Group
const FormItem = Form.Item

class ConfigFileContent extends React.Component {
  state = {
    readOnly: (!!this.props.method && this.props.method === 2) || false,
    btnLoading: false,
    fetchStatus: false,
    branches: [],
    projects: [],
    isNeedSet: false,
  }
  componentDidMount = async () => {
    const { method, getProjectBranches, defaultData} = this.props
    const project_id = defaultData ? defaultData.projectId : ""
    if (method === 2) {
      await this.loadGitProjects(project_id)
      project_id && getProjectBranches({ project_id }, {
        success: {
          func: res => {
            !!res.results.branches && this.setState({
              branches: res.results.branches,
            })
    }
  }
      })
    }
  }
  loadGitProjects = (project_id) => {
    const { getProjectList, form } = this.props
    const { setFieldsValue } = form
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
          if(res.data && res.data.results && res.data.results.length > 0){
            const projects = filter(res.data.results, { repoType: "gitlab" })
            this.setState({
              projects,
            })
            !!project_id && setFieldsValue({ projectName: filter(projects, { id: project_id })[0].name })
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
    const { tempConfigDesc, form, getMethod, tempConfigName } = this.props
    const { setFieldsValue, getFieldValue } = form
    this.setState({
      readOnly,
    })
    let configDesc = ""
    let data = ''
    let name = ''
    if (!readOnly) {
      configDesc = tempConfigDesc
      data = tempConfigDesc
      name = tempConfigName
    } else {
      this.loadGitProjects(getFieldValue("projectId"))
    }
    const values = {
      configDesc,
      method,
      data,
      name,
    }
    // if(readOnly) values.name = ""
    setFieldsValue(values)
    getMethod(method)
  }
  onImportClick = () => {
    const { getGitFileContent, form } = this.props
    const { validateFields, setFieldsValue } = form
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
    validateFields(["projectId", "filePath", "defaultBranch"], (errors, values) => {
      if(!!errors){
        return
      }
      this.setState({
        btnLoading: true,
      }, () => {
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
              notify.warn(this.props.intl.formatMessage(indexIntl.importFileFailed))
              this.setState({
                fetchStatus: false,
              })
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
    const { intl } = this.props
    const { formatMessage } = intl
    const fileInput = this.uploadInput.refs.upload.refs.inner.refs.file
    const fileType = fileInput.value.substr(fileInput.value.lastIndexOf('.') + 1)
    if(!/xml|json|conf|config|data|ini|txt|properties|yaml|yml|cfg/.test(fileType)) {
      notify.info(formatMessage(indexIntl.filePathHint2), true)
      return false
    }
    const self = this
    const fileName = fileInput.value.substr(fileInput.value.lastIndexOf('\\') + 1)
    self.setState({
      disableUpload: true,
      filePath: formatMessage(indexIntl.fileNameHint, { name: fileName })
    })
    notify.spin(formatMessage(indexIntl.loadFileSpin))
    const fileReader = new FileReader()
    fileReader.onerror = function(err) {
      self.setState({
        disableUpload: false,
      })
      notify.close()
      notify.error(formatMessage(indexIntl.loadFileFailed))
    }
    fileReader.onload = function() {
      self.setState({
        disableUpload: false
      })
      notify.close()
      notify.success(formatMessage(indexIntl.loadFileSucc))
      const configDesc = fileReader.result.replace(/\r\n/g, '\n')
      self.props.form.setFieldsValue({
        data: configDesc,
      })
    }
    fileReader.readAsText(file)
    return false
  }
  onProjectSelect = async value => {
    this.setState({
      branches: [],
    }, async () => {
      const { getProjectBranches, form } = this.props
      const { getFieldProps, getFieldValue, setFieldsValue } = form
      const { projects } = this.state
      await setFieldsValue({
        defaultBranch: undefined,
      })
      const project_id = getFieldValue("projectId") || ""
      !!project_id && setFieldsValue({ projectName: filter(projects, { id: project_id })[0].name })
      getProjectBranches({ project_id }, {
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
  checkFilePath = (rule, value, callback) => {
    if(!/^.\//.test(value)){
      return callback(new Error(this.props.intl.formatMessage(indexIntl.wrongFilePathHint)))
    }
    return callback()
  }
  onPathChange = path => {
    const { form: { setFieldsValue } } = this.props
    if (path.endsWith("/")) return setFieldsValue({ name: '' })
    if (path.length < 3) return
    const arr = path.split("/")
    const name = arr[arr.length-1]
    setFieldsValue({
      name
    })
  }
  render() {
    const { descProps, filePath, form, defaultData, configNameList, isUpdate, intl } = this.props
    const { formatMessage } = intl
    const { projectId, defaultBranch, path, filePath: tempFliePath, enable } = defaultData || {}
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
        initialValue: path || tempFliePath || undefined,
        rules: [
          {
            validator: this.checkFilePath
          }
        ],
        onChange: e => this.onPathChange(e.target.value)
      }
    )}
    const enableProps = {...getFieldProps('enable',
      {
        initialValue: enable || 0,
        valuePropName: 'checked',
      }
    )}
    return(
      <div className="configFileContent">
        <div>{formatMessage(indexIntl.importFileorEnter)}</div>
        <FormItem className="formItem">
          <RadioGroup disabled={isUpdate} {...methodProps}>
            <Radio key="1" value={1}>{formatMessage(indexIntl.importFileRadio)}</Radio>
            <Radio key="2" value={2}>{formatMessage(indexIntl.gitFileRadio)}</Radio>
          </RadioGroup>
        </FormItem>
        {
          method === 1 ?
            <div>
              <Upload beforeUpload={(file) => this.beforeUpload(file)} showUploadList={false} ref={(instance) => this.uploadInput = instance}>
                <Button type="ghost" style={{marginLeft: '5px'}} disabled={this.state.disableUpload}>
                  <Icon type="upload" /> {formatMessage(indexIntl.upload)}
                </Button>
              </Upload>
              <span className="filepath" >{filePath}</span>
            </div>
            :
            <div>
              {
                isNeedSet &&
                <div className="deleteRow alertRow">
                  <i className="fa fa-exclamation-triangle"/>{formatMessage(indexIntl.noGitLabHint)}
                </div>
              }
              <input type="hidden" {
                ...getFieldProps('projectName', {
                  initialValue: "",
                })
              } />
              <Row className="importRow">
                <Col className="selleft" span={12}>
                  <FormItem className="formItem">
                    <Select disabled={isUpdate} {...selProjectProps} className="selBranch" placeholder={formatMessage(indexIntl.projectPlaceholder)}>
                      {project_options}
                    </Select>
                  </FormItem>
                </Col>
                <Col className="selright" span={12}>
                  <FormItem className="formItem">
                    <Select disabled={isUpdate} {...selBranchProps} className="selBranch" placeholder={formatMessage(indexIntl.branchPlaceholder)}>
                      {branch_options}
                    </Select>
                  </FormItem>
                </Col>
              </Row>
              <Row className="importRow">
                <Col span={20}>
                  <FormItem className="formItem">
                    <Input disabled={isUpdate} {...pathProps} className="path" placeholder={formatMessage(indexIntl.pathPlaceholder)} />
                  </FormItem>
                </Col>
                <Col span={4}>
                  <Button type="primary" onClick={this.onImportClick} loading={btnLoading}>{formatMessage(indexIntl.import)}</Button>
                </Col>
                <Col className="importStatus" span={4}>
                  {
                    (() => {
                      let ele
                      if (btnLoading) {
                        ele = "" // <span className="primary">导入中...</span>
                      } else {
                        if (fetchStatus){
                          ele = <span className="succ">{/*<Icon type="check-circle-o" /> */}{formatMessage(indexIntl.importSucc)}</span>
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
                  <Checkbox {...enableProps}>{formatMessage(indexIntl.autoUpdateCheck)}</Checkbox>
                </Col>
              </Row>
            </div>
        }
        <Editor
          title={formatMessage(indexIntl.editorTitle)}
          // options={{
          //   readOnly
          // }}
          mode="Text"
          readOnly={readOnly}
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
})(injectIntl(ConfigFileContent, {
  withRef: true,
}))
