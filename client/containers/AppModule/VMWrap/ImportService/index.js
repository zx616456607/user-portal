/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: import service
 *
 * v0.1 - 2018-11-16
 * @author rensiwei
 */

import React from 'react'
import { browserHistory } from 'react-router'
import { importVMservice } from '../../../../../src/actions/vm_wrap'
import { connect } from 'react-redux'
import { Card, Form, Collapse, Button, Tooltip } from 'antd'
import TraditionEnv from './TraditionEnv'
import TraditionApp from './TraditionApp'
import NotificationHandler from '../../../../../src/components/Notification'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'

const notify = new NotificationHandler();
const Panel = Collapse.Panel;

class ImportService extends React.Component {
  state = {
    btnLoading: false,
    isDisabled: true,
    jdk_id: '',
    host: '',
  }
  renderPanelHeader(text) {
    return (
      <div className="headerBg">
        <i/>{text}
      </div>
    )
  }
  checkSucc = b => {
    this.setState({
      isDisabled: !b,
    })
  }
  importService = () => {
    const { form, importVMservice } = this.props
    const { validateFields } = form
    validateFields((err, values) => {
      if (err) return
      this.setState({
        btnLoading: true,
      }, () => {
        const body = {
          apps: [],
        }
        if (values.type === '1') {
          body.vminfo = {
            name: values.envName,
            host: values.host,
            account: values.account,
            password: values.password,
            jdk_id: values.jdk_id,
            java_home: values.java_home,
            jre_home: values.jre_home,
          }
          body.tomcat = {
            name: values.tomcat_name,
            start_port: values.start_port,
            catalina_home_dir: values.catalina_home_dir,
            catalina_home_env: values.catalina_home_env,
            tomcat_id: values.tomcat_id,
          }
        } else if (values.type === '2') {
          body.vminfo = values.vm_id
          if (values.isNewTomcat === '1') { // 已有 tomcat
            body.tomcat = values.tomcat_env_id
          } else if (values.isNewTomcat === '2') { // 新建 tomcat
            body.tomcat = {
              name: values.tomcat_name,
              start_port: values.start_port,
              catalina_home_dir: values.catalina_home_dir,
              catalina_home_env: values.catalina_home_env,
              tomcat_id: values.tomcat_id,
            }
          }
        }
        const arr = []
        Object.keys(values).map(item => {
          if (item.indexOf('description_') > -1) {
            arr.push(parseInt(item.replace('description_', '')))
          }
          return item
        })
        arr.map(i => {
          let tempAddress = values['check_address_temp_' + i] || ''
          if (tempAddress && !tempAddress.startsWith('/')) tempAddress = '/' + tempAddress
          const temp = {
            name: values['name_' + i],
            description: values['description_' + i],
            healthcheck: {
              check_address: values['check_address_' + i] + tempAddress,
              init_timeout: values['init_timeout_' + i],
              normal_timeout: values['normal_timeout_' + i],
              interval: values['interval_' + i],
            },
          }
          body.apps.push(temp)
          return i
        })
        importVMservice(body, {
          success: {
            func: res => {
              if (res.statusCode === 200) {
                notify.success('导入成功')
                this.cancelCreate()
              }
            },
            isAsync: true,
          },
          failed: {
            func: () => {
              notify.warn('导入失败')
            },
            isAsync: true,
          },
          finally: {
            func: () => {
              this.setState({
                btnLoading: false,
              })
            },
            isAsync: true,
          },
        })
      })
    })
  }
  cancelCreate = () => {
    browserHistory.push({
      pathname: '/app_manage/vm_wrap',
    })
  }
  getJdkId = jdk_id => {
    this.setState({
      jdk_id,
    })
  }
  getHost = host => {
    this.setState({
      host,
    })
  }
  setVmList = vmList => {
    this.setState({
      vmList,
    })
  }
  setTomcatList = tomcatList => {
    this.setState({
      tomcatList,
    })
  }
  render() {
    const { form } = this.props
    const { getFieldValue } = form
    const { btnLoading, isDisabled, jdk_id, host, vmList, tomcatList } = this.state
    return (
      <QueueAnim
        id="importVMService"
        type="right"
      >
        <div key="ImportService">
          <Card>
            <Form>
              <Collapse defaultActiveKey={[ 'env', 'app' ]}>
                <Panel header={this.renderPanelHeader('传统环境')} key="env">
                  <TraditionEnv
                    getHost={this.getHost}
                    getJdkId={this.getJdkId}
                    checkSucc={this.checkSucc}
                    form={form}
                    setVmList={this.setVmList}
                    setTomcatList={this.setTomcatList}
                  />
                </Panel>
                <Panel header={this.renderPanelHeader('传统应用')} key="app">
                  <TraditionApp
                    tomcatList={tomcatList || []}
                    vmList={vmList || []}
                    tomcatId={getFieldValue('tomcat_env_id')}
                    vmId={getFieldValue('vm_id')}
                    startPort={getFieldValue('start_port')}
                    jdk_id={jdk_id}
                    host={host}
                    form={form}/>
                </Panel>
              </Collapse>
            </Form>
            <div className="btnBox clearfix">
              {
                isDisabled ?
                  <Tooltip title="请先测试连接, 通过后可以导入">
                    <Button disabled={true} type="primary" size="large" className="pull-right" loading={btnLoading} onClick={this.importService}>
                      导入
                    </Button>
                  </Tooltip>
                  :
                  <Button type="primary" size="large" className="pull-right" loading={btnLoading} onClick={this.importService}>
                    导入
                  </Button>
              }
              <Button size="large" className="pull-right" onClick={this.cancelCreate}>取消</Button>
            </div>
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps() {
  return {

  }
}
export default connect(mapStateToProps, {
  importVMservice,
})(Form.create()(ImportService))
