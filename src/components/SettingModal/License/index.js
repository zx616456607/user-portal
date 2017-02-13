/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  license list
 *
 * v0.1 - 2016/11/10
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Row, Col, Spin, Alert, Card, Tooltip, Icon, Button, Form, Input, Table } from 'antd'
import './style/License.less'
import { loadLicenseList, loadLicensePlatform, addLicense } from '../../../actions/license'
import { connect } from 'react-redux'
import { formatDate } from '../../../common/tools'
import NotificationHandler from '../../../common/notification_handler'

const createForm = Form.create;
const FormItem = Form.Item;

let LicenseKey = React.createClass ({
  activeLicense() {
    const parentScope = this.props.scope
    const { validateFields } = this.props.form
    validateFields((errors, values) => {
      if (errors) {
        return
      }
      parentScope.props.addLicense({rawlicense: values}, {
        success:{
          func: () => {
            new NotificationHandler().success('添加激活成功')
            parentScope.props.loadLicenseList()
            parentScope.setState({activeClick: false})
          },
          isAsync: true
        },
        failed: {
          func:(res) => {
            new NotificationHandler().error('添加激活失败', res.message.message)
          }
        }
      })

    })
  },
  
  render() {
    const { getFieldProps } = this.props.form;
    const rePasswdProps = getFieldProps('rePasswd', {
      rules: [{
        required: true, whitespace: true, message: '请输入激活码'
      }]
    });
    const parentScope = this.props.scope
    return (
      <div className="ant-col-10">
        <Form>
        <FormItem hasFeedback>
          <Button type="primary" onClick={()=> this.activeLicense()}>激活</Button>&nbsp;&nbsp;&nbsp;
          <Button onClick={()=> parentScope.setState({activeClick: false})}>取消</Button>
        </FormItem>
        <FormItem hasFeedback>
          <Input type="textarea" {...rePasswdProps} style={{maxHeight: 200}}/>
        </FormItem>
        </Form>
      </div>
    )
  }
})

LicenseKey = createForm()(LicenseKey)

class License extends Component {
  constructor(props) {
    super(props)
    this.state = {
      copySuccess: false,
      activeClick: false
    }
  }

  componentWillMount() {
    document.title = '授权管理 | 时速云'
    this.props.loadLicensePlatform()
    this.props.loadLicenseList()
  }

  getAlertType(code) {
    switch (code) {
      case 0:
        return 'success'
      case -1:
        return 'error'
      case 1:
      default:
        return 'warning'
    }
  }
  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("licenseInput");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  }
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  }
  render() {
    const { isFetching, license, platform} = this.props
    if (isFetching || !license) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const columns = [
    {
      title: '完整 License',
      dataIndex: 'shortKey'
    },
    {
      title: '最大节点数',
      dataIndex: 'maxNodes'
    },
    {
      title: '生效时间',
      dataIndex: 'start',
    },{
      title: '失效时间',
      dataIndex: 'end',
    },{
      title: '有效时长',
      dataIndex: 'effective',
    },{
      title: '添加时间',
      dataIndex: 'addTime',
    },{
      title: '操作人',
      dataIndex: 'addUser'
    }];
    return (
      <div id='License'>
        <div className="title">授权管理</div>
        <Card className="licenseWrap">
          <div className="list">
            <span className="leftKey ant-col-2">平台ID</span>
            <span className="inputGroup ant-col-10">
              <span>{ platform.data.platformid }</span>
              <Tooltip title={this.state.copySuccess ? '复制成功' : '点击复制'}><a onClick={()=> this.copyDownloadCode()} onMouseLeave={()=> this.returnDefaultTooltip()}><Icon type="copy" /></a></Tooltip>
              <input className="licenseInput"  defaultValue={ platform.data.platformid } />
            </span>
          </div>
          <div className="list">
            <span className="leftKey ant-col-2">License</span>
            {this.state.activeClick ?
              <LicenseKey scope={this} />
            :
            <div className="ant-col-20">
              <Button type="primary" size="large" onClick={()=> this.setState({activeClick: true})}>立即授权</Button>
              <div className="actionsText"><Icon type="check-circle" className="success" /> 已激活  <span className="dataKey">有效期：{ formatDate(license.merged.end || '') } </span></div>
            </div>
            }

          </div>
          <div className="list oneTips">
            <div>申请授权码Listen</div>
            <div className="ant-col-20 oneTips">
              请发送“<span style={{color:'#24a7eb'}}>平台ID + 姓名 + 电话 + 公司名 </span>”到 <span style={{color:'#24a7eb'}}>support@tenxcloud.com </span>我们将主动与您联系
            </div>
          </div>
        </Card>
        <br/>
        <Card  className="licenseWrap">
          <Table
            columns={columns} 
            dataSource={license.licenses} pagination={false} className="list-table" loading={isFetching}/>
        </Card>
      </div>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultState = {
    isFetching: false,
    result: { 'platformid':'test' }
  }
  const { data } = state.license.licenses.result || {}
  const { isFetching, result} = state.license.platform || defaultState
  return {
    isFetching,
    license: data,
    platform: result
  }
}

export default connect(mapStateToProps, {
  addLicense,
  loadLicenseList,
  loadLicensePlatform
})(License)