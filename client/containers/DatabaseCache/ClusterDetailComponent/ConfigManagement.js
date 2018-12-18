/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * configManagement component
 *
 * v0.1 - 2018-07-12
 * @author zhouhaitao
 */

import React from 'react'
import './style/configManagement.less'
import { Form, Input, Button } from 'antd'
import { connect } from 'react-redux'
import * as configManageActions from '../../../../src/actions/database_cache'
import NotificationHandler from '../../../../src/components/Notification'
const FormItem = Form.Item
class ConfigManagement extends React.Component {
  state = {
    isEdit: false,
    configContent: '',
    configContentDefault: '',
    path: '/etc/redis',
    file: 'redis.conf',
  }
  componentDidMount() {
    const { database, databaseInfo, clusterID, getMySqlConfig } = this.props
    if (database === 'mysql' || database === 'rabbitmq') {
      this.setState({
        path: `/etc/${database}`,
        file: `${database}.conf`,
      })
      getMySqlConfig(clusterID, databaseInfo.objectMeta.name, database, {
        success: {
          func: res => {
            this.setState({
              configContent: res.data.config,
              configContentDefault: res.data.config,
            })

          },
        },
        failed: {
          func: () => {
            const notification = new NotificationHandler()
            notification.warn('获取配置失败')
          },
        },
      })
    } else if (database === 'redis') {
      this.setState({
        configContent: databaseInfo.config,
        configContentDefault: databaseInfo.config,
      })

    }

  }
  submitChange = () => {
    this.props.form.validateFields(errors => {
      if (errors) {
        return
      }
      const { database,
        databaseInfo,
        clusterID,
        updateMySqlConfig, editDatabaseCluster } = this.props
      if (database === 'mysql' || database === 'rabbitmq') {
        updateMySqlConfig(
          clusterID, databaseInfo.objectMeta.name, database, this.state.configContent, {
            success: {
              func: res => {
                const notification = new NotificationHandler()
                notification.success('保存成功，需重启后生效')
                this.setState({
                  isEdit: false,
                  configContent: res.data.config,
                  configContentDefault: res.data.config,
                })
                setTimeout(() => {
                  this.props.onEditConfigOk()
                })
              },
            },
            failed: {
              func: () => {
                const notification = new NotificationHandler()
                notification.warn('更新MySQL配置失败')
              },
            },
          })
      } else if (database === 'redis') {
        const body = {
          config: this.state.configContent,
        }
        editDatabaseCluster(clusterID, database, databaseInfo.objectMeta.name, body, {
          success: {
            func: res => {
              const notification = new NotificationHandler()
              notification.success('保存成功，需重启后生效')
              this.setState({
                isEdit: false,
                configContent: res.data.spec.advanceSetting.master,
                configContentDefault: res.data.spec.advanceSetting.master,
              })
              setTimeout(() => {
                this.props.onEditConfigOk()
              })
            },
          },
          failed: {
            func: () => {
              const notification = new NotificationHandler()
              notification.warn('更新MySQL配置失败')
            },
          },

        })
      }

    })
  }
  onCancel = () => {
    this.props.form.resetFields()
    this.setState({
      isEdit: false,
      configContent: this.state.configContentDefault,
    })
  }
  render() {
  /*
    const testChinese = (rule, value, callback) => {
      if (new RegExp('[\\u4E00-\\u9FFF]+', 'g').test(value)) {
        return callback('不得包含汉字')
      }
      callback()
    }
*/
    const { getFieldProps } = this.props.form
    const configContent = getFieldProps('config', {
      initialValue: this.state.configContent,
      rules: [{
        required: true,
        message: '配置不能为空',
      }],
      onChange: e => {
        this.setState({
          configContent: e.target.value,
        })
      },
    })
    return <div className="configManagement">
      <div className="tips">
        Tips: 修改密码或修改资源配置后，需要重启集群才能生效。
      </div>
      <div className="title">配置管理</div>
      <div className="content">
        <Form>
          <FormItem>
            <span>挂载目录</span>
            <span>{this.state.path}</span>
          </FormItem>
          <FormItem>
            <span>配置文件</span>
            <span>{this.state.file}</span>
          </FormItem>
          <FormItem>

            <span>内容</span>
            <div className="btnGroup">
              {
                !this.state.isEdit ?
                  <Button type="primary" onClick={() => this.setState({ isEdit: true })}>修改</Button>
                  :
                  <span>
                    <Button onClick={this.onCancel}>取消</Button>
                    <Button type="primary" onClick={this.submitChange}>保存</Button>
                  </span>
              }
              <div className="inputWrapper">
                <Input type="textarea" {...configContent} disabled={!this.state.isEdit} value={this.state.configContent} rows={6}/>
              </div>
            </div>
          </FormItem>
        </Form>
      </div>
    </div>
  }
}
const mapStateToProps = state => {
  const { cluster } = state.entities.current
  return {
    clusterID: cluster.clusterID,
  }
}
const FormConfigManagement = Form.create()(ConfigManagement)
export default connect(mapStateToProps, {
  getMySqlConfig: configManageActions.getMySqlConfig, // 获取mysql集群配置
  updateMySqlConfig: configManageActions.updateMySqlConfig, // 更新mysql集群配置
  editDatabaseCluster: configManageActions.editDatabaseCluster, // 修改集群
})(FormConfigManagement)
