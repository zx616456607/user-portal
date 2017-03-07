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
  checkClusterName(rule, value, callback) {
    callback()
  },
  render () {
    const { editCluster } = this.state
    const { getFieldProps } = this.props.form;
    const nameProps = getFieldProps('clusterName',{
      rules: [
        { required: true, message: '输入集群名称' },
        { validator: this.checkClusterName },
      ],
    });
    const serverExportProps = getFieldProps('serverExport',{
      rules: [
        { required: true, message: '输入集群名称' },
        { validator: this.checkClusterName },
      ],
      initialValue:''
    });
    const orglistProps = getFieldProps('orgList',{
      rules: [
        { required: true, message: '输入集群名称' },
        { validator: this.checkClusterName },
      ],
      initialValue:''
    });
    const descProps = getFieldProps('desc',{
      rules: [
        { required: false },
      ],
    });
    return (
      <Card className="ClusterInfo">
        <div className="h3">集群信息
          { !editCluster ?
          <a onClick={()=> this.setState({editCluster: true})} className="btnEdit">编辑集群</a>
          :
          <div style={{float:'right'}}><Button size="small" onClick={()=> this.setState({editCluster: false})}>取消</Button><Button type="primary" size="small" style={{marginLeft:'8px'}}>保存</Button></div>
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
                <span>默认集群</span>
              }
            </Form.Item>
            <Form.Item>
              <div className="h4">API Server：</div>192.168.1.1
            </Form.Item>
            <Form.Item>
              <div className="h4">API Tocken：</div>https://192.168.1.1
            </Form.Item>

          </div>
          <div className="formItem">
            <Form.Item>
              <div className="h4">服务出口列表：</div>
              { editCluster ?
              <Input {...serverExportProps } placeholder="输入服务出口列表"/>
              :
              <span></span>
              }
            </Form.Item>
            <Form.Item>
              <div className="h4">域名列表：</div>
              { editCluster ?
              <Input {...orglistProps} placeholder="输入域名列表" />
              :
              <span></span>
              }
            </Form.Item>
          </div>
          <div className="formItem">
          <Form.Item>
            <div className="h4">描述：</div>
            { editCluster ?
            <Input {...descProps} type="textarea" placeholder="添加描述" />
            :
            <span></span>
            }
          </Form.Item>
          </div>
        </Form>
      </Card>
    )
  }
})

ClusterInfo = Form.create()(ClusterInfo)

export default ClusterInfo