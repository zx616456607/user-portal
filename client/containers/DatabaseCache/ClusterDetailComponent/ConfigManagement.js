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
import { getMySqlConfig, updateMySqlConfig, editDatabaseCluster } from '../../../../src/actions/database_cache'
import NotificationHandler from '../../../../src/components/Notification'
const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    sm: { span: 3 },
  },
  wrapperCol: {
    sm: { span: 18 },
  },
}
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
    if (database === 'mysql') {
      this.setState({
        path: '/etc/mysql',
        file: 'mysql.conf',
      })
      getMySqlConfig(clusterID, databaseInfo.objectMeta.name, {
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
            notification.warn('获取MySQL配置失败')
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
      const { database, databaseInfo, clusterID, editDatabaseCluster } = this.props
      if (database === 'mysql') {
        const { updateMySqlConfig } = this.props
        updateMySqlConfig(clusterID, databaseInfo.objectMeta.name, this.state.configContent, {
          success: {
            func: res => {
              this.setState({
                isEdit: false,
                configContent: res.data.config,
                configContentDefault: res.data.config,
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
              this.setState({
                isEdit: false,
                configContent: res.data.spec.advanceSetting.master,
                configContentDefault: res.data.spec.advanceSetting.master,
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
    const testChinese = (rule, value, callback) => {
      if (new RegExp('[\\u4E00-\\u9FFF]+', 'g').test(value)) {
        return callback('不得包含汉字')
      }
      callback()
    }
    const { getFieldProps } = this.props.form
    const configContent = getFieldProps('config', {
      rules: [{
        required: true,
        message: '配置不能为空',
      },
      {
        validator: testChinese,
        trigger: [ 'onBlur', 'onChange' ],
      }],
      onChange: e => {
        this.setState({
          configContent: e.target.value,
        })
      },
    })

    return <div className="configManagement">
      <div className="title">配置管理</div>
      <div className="content">
        <Form>
          <FormItem
            {...formItemLayout}
            label="挂载目录"
          >
            <span>/etc/mysql</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="配置文件"
          >
            <span>mysql.conf</span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="内容"
          >
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
              <span className="tip">重新编辑配置文件后，系统将重启该集群的所有实例，将进行滚动升级</span>
            </div>
            <Input type="textarea" {...configContent} disabled={!this.state.isEdit} value={this.state.configContent} rows={6}/>
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
  getMySqlConfig, // 获取mysql集群配置
  updateMySqlConfig, // 更新mysql集群配置
  editDatabaseCluster, // 修改集群
})(FormConfigManagement)
