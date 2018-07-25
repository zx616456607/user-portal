/*
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 * ----
 * serviceMesh.js page
 *
 * @author zhangtao
 * @date Wednesday July 25th 2018
 */
import React from 'react';
import { connect } from "react-redux";
import { Switch,Form } from 'antd';
import "./style/ServiceMesh.less"

const FormItem = Form.Item
//TODO: 增加根据登录用户身份及后台api情况, 来显示不同的表单选项, 并修改表单字段
export default class ServiceMesh extends React.Component {
  renderMesh() {
    const form = this.props.form
    const { getFieldProps } = form;
    const meshProps = getFieldProps('mesh', {
      valuePropName: 'checked',
    })
    const checkedmeshProps = getFieldProps('mesh', {
      valuePropName: 'checked',
      initialValue: true,
    })
    const userrole = 6
    if (userrole === 1){
      return  <span className="infoText">当前平台未配置微服务治理套件，前往
                <span>全局配置</span>
              </span>
    }
    if (userrole === 2){
      return <span className="infoText">当前平台未配置微服务治理套件，请联系基础设施管理员配置</span>
    }
    if (userrole === 3) {
      return <span className="infoText">当前集群未安装 istio，前往
                <span>基础设施-「集群」-插件 </span>安装
              </span>
    }
    if (userrole === 4) {
      return <span className="infoText">当前集群未安装 istio，请联系基础设施管理员安装</span>
    }
    if (userrole === 5) {
      return [
        <Switch {...meshProps} checkedChildren="开" unCheckedChildren="关" key="switch" disabled={true}/>,
        <span key="span" className="infoText">当前项目已经开通 service mesh，此服务将默认开启状态，服务将由 service mesh 代理，使用微服务中心
          提供的治理功能</span>
      ]
    }
    if (userrole === 6) {
      return [
        <Switch {...meshProps} checkedChildren="开" unCheckedChildren="关" key="switch"/>,
        <span key="span" className="infoText">开通后，此服务将由 service mesh 代理，使用微服务中心提供的治理功能</span>
      ]
    }

  }
  render () {
    const { formItemLayout } = this.props;
    return (
      <FormItem
        {...formItemLayout}
        label="服务网格"
        key="serviceMesh"
        className="serviceMesh"
      >
        {this.renderMesh()}
      </FormItem>
    )
  }
}