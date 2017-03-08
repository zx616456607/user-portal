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
import { updateCluster } from '../../actions/cluster'
import { connect } from 'react-redux'

let saveBtnDisabled = true

let ClusterInfo = React.createClass ({
  getInitialState() {
    return {
      editCluster: false, // edit btn
      saveBtnLoading: false,
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
    const { form, updateCluster, cluster } = this.props
    const { validateFields, resetFields } = form
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      console.log(`values=================`)
      console.log(values)
      this.setState({
        saveBtnLoading: true,
      })
      updateCluster(cluster.clusterID, values, {
        success: {
          func: result => {
            console.log(`result------------`)
            console.log(result)
          },
          isAsync: true
        },
        failed: {
          func: err => {
            console.log(`err------------`)
            console.log(err)
          },
          isAsync: true
        }
      })
    })
  },
  render () {
    const { cluster, form } = this.props
    const { editCluster, saveBtnLoading } = this.state
    const { getFieldProps } = form
    let {
      clusterName, apiHost, apiProtocol,
      apiVersion, bindingIPs, bindingDomains,
      description, apiToken
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
    const bindingIPsProps = getFieldProps('bindingIPs',{
      rules: [
        { required: true, message: '输入服务出口列表' },
        // { validator: this.checkValue },
      ],
      initialValue: bindingIPs
    });
    const bindingDomainsProps = getFieldProps('binding_domain',{
      rules: [
        { required: true, message: '输入域名列表' },
        // { validator: this.checkValue },
      ],
      initialValue: bindingDomains
    });
    const descProps = getFieldProps('description',{
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
              onClick={()=> {
                this.setState({editCluster: false})
                saveBtnDisabled = true
              }}>
              取消
            </Button>
            <Button
              loading={saveBtnLoading}
              disabled={saveBtnDisabled}
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
              <div className="h4">API Server：</div>
              <span>{apiUrl}</span>
            </Form.Item>
            <Form.Item>
              <div className="h4">API Tocken：</div>
              <span>{apiToken}</span>
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

function formChange(porps, fileds) {
  console.log(`arguments----------------`)
  console.log(arguments)
  saveBtnDisabled = false
}

ClusterInfo = Form.create({
  onFieldsChange: formChange
})(ClusterInfo)

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  updateCluster,
})(ClusterInfo)