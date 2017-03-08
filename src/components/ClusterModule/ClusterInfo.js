/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster info list component
 *
 * v0.1 - 2017-2-24
 * @author BaiYu
 */
import React from 'react'
import { Icon, Button, Card, Form, Input, Tooltip, Spin, } from 'antd'

let ClusterInfo = React.createClass ({
  getInitialState() {
    return {
      editCluster: false, // edit btn
    }
  },
  checkValue(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写用户名')])
      return
    }
    if (value.indexOf('@') > -1) {
      if (!EMAIL_REG_EXP.test(value)) {
        callback([new Error('邮箱地址填写错误')])
        return
      }
      callback()
      return
    }
    callback()
  },
  updateCluster(e) {
    e.preventDefault()
    const { form } = this.props
    const { validateFields, resetFields } = form
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      console.log(`values=================`)
      console.log(values)
    })
  },
  render () {
    const { cluster, form } = this.props
    const { editCluster } = this.state
    const { getFieldProps } = form
    let {
      clusterName, apiHost, apiProtocol,
      apiVersion, bindingIPs, bindingDomains,
      description,
    } = cluster
    const apiUrl = `${apiProtocol}://${apiHost}`
    bindingIPs = parseArray(bindingIPs).join(', ')
    bindingDomains = parseArray(bindingDomains).join(', ')
    const nameProps = getFieldProps('clusterName',{
      rules: [
        { required: true, message: '输入集群名称' },
        // { validator: this.checkValue },
      ],
      initialValue: clusterName
    });
    const bindingIPsProps = getFieldProps('serverExport',{
      rules: [
        { required: true, message: '输入服务出口列表' },
        // { validator: this.checkValue },
      ],
      initialValue: bindingIPs
    });
    const bindingDomainsProps = getFieldProps('orgList',{
      rules: [
        { required: true, message: '输入域名列表' },
        // { validator: this.checkValue },
      ],
      initialValue: bindingDomains
    });
    const descProps = getFieldProps('desc',{
      rules: [
        { required: false },
      ],
      initialValue: description
    });
    return (
      <Card className="ClusterInfo">
        <div className="h3">集群信息
          { !editCluster ?
          <a onClick={()=> this.setState({editCluster: true})} className="btnEdit">编辑集群</a>
          :
          <div style={{float:'right'}}>
            <Button size="small"
              onClick={()=> this.setState({editCluster: false})}>
              取消
            </Button>
            <Button
              type="primary" size="small" style={{marginLeft:'8px'}}
              onClick={this.updateCluster}>
              保存
            </Button>
          </div>
          }
        </div>
        <div className="imgBox" style={{padding:'50px 24px'}}>
          <svg><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#app"></use></svg>
        </div>
        <Form className="clusterTable" style={{padding:'45px 0'}}>
          <div className="formItem">
            <Form.Item >
              <div className="h4">集群名称</div>
              { editCluster ?
                <Input {...nameProps} placeholder="输入集群名称" />
                :
                <span>{clusterName}</span>
              }
            </Form.Item>
            <Form.Item>
              <div className="h4">API Server：</div>{apiUrl}
            </Form.Item>
            <Form.Item>
              <div className="h4">API Tocken：</div>XXXXXXXXXXX
            </Form.Item>

          </div>
          <div className="formItem">
            <Form.Item>
              <div className="h4">服务出口列表：</div>
              { editCluster ?
              <Input {...bindingIPsProps } placeholder="输入服务出口列表，多个出口英文逗号分开" type="textarea" />
              :
              <span>{bindingIPs}</span>
              }
            </Form.Item>
            <Form.Item>
              <div className="h4">域名列表：</div>
              { editCluster ?
              <Input {...bindingDomainsProps} placeholder="输入域名列表，多个域名英文逗号分开" type="textarea" />
              :
              <span>{bindingDomains}</span>
              }
            </Form.Item>
          </div>
          <div className="formItem">
          <Form.Item>
            <div className="h4">描述：</div>
            { editCluster ?
            <Input {...descProps} type="textarea" placeholder="添加描述" defaultValue={description} />
            :
            <span>{description}</span>
            }
          </Form.Item>
          </div>
        </Form>
      </Card>
    )
  }
})

function parseArray(array) {
  try {
    array = JSON.parse(array)
  } catch (error) {
    array = []
  }
  return array
}

ClusterInfo = Form.create()(ClusterInfo)

export default ClusterInfo