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
import { Row, Col, Spin, Alert, Card, Tooltip, Popover, Icon, Button, Form, Input } from 'antd'
import './style/License.less'
import { loadLicenseList, loadLicensePlatform, addLicense, loadMergedLicense} from '../../../actions/license'
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
      parentScope.props.addLicense({rawlicense: values.rePasswd}, {
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
      activeClick: false,
      leftTrialDays: 14,
      trialEndTime: false
    }
  }

  componentWillMount() {
    document.title = '授权管理 | 时速云'
    const _this = this
    this.props.loadLicensePlatform()
    this.props.loadLicenseList({
      success: {
        func: (res)=> {
          if (!res.data || res.data.licenses.length == 0) {
            _this.props.loadMergedLicense({
              success: {
                func: (res) => {
                  if (res.data) {
                    _this.setState({leftTrialDays: res.data.leftTrialDays,trialEndTime: res.data.trialEndTime})
                  }
                }
              }
            })

          }
        },
        isAsync: true
      }
    })

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
  copyLicenseCode(index) {
    const scope = this;
    let code = document.getElementsByClassName("licenseMoreInput");
    code[index].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
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
  lincenseList(data) {
    if (!data || data.length == 0) {
      return (<tr><td colSpan="7" className="text-center"><Icon type="frown" />&nbsp;暂无数据</td></tr>)
    }
    const listRow = data.map((list, index)=> {
      return (
        <tr className="ant-table-row  ant-table-row-level-0" key={'list' + index}>
          <td>
            {list.licenseUid.substring(0,15)}
            <Popover getTooltipContainer={()=> document.getElementById('License')} trigger="click"
            content={<div className="popLicense">{list.licenseUid}<Tooltip title={this.state.copySuccess ? '复制成功': '点击复制'}><a onClick={()=> this.copyLicenseCode(index)} onMouseLeave={()=> this.returnDefaultTooltip()}>&nbsp;<Icon type="copy" /></a></Tooltip></div>} title={null}>
            <svg className='svgmore' onClick={this.showPop}><use xlinkHref='#more' /></svg>
            </Popover>
            <input style={{position: 'absolute',opacity:'0'}} className="licenseMoreInput" defaultValue={list.licenseUid} />
          </td>
          <td >{list.maxNodes}</td>
          <td >{formatDate(list.start)}</td>
          <td >{formatDate(list.end)}</td>
          <td >{( new Date(list.end).getTime() - new Date(list.start).getTime() ) /24/60/60/1000} 天</td>
          <td >{formatDate(list.addTime)}</td>
          <td >{list.addUser ? list.addUser :'未知'}</td>
        </tr>
      )
    })
    return listRow
  }
  // triaDays() {
  //   const nowDate = new Date()
  //   let nowTime = formatDate(nowDate.getTime() + (parseInt(this.state.leftTrialDays) + 1) * 24*60*60*1000 )
  //   nowTime = nowTime.substr(0, nowTime.indexOf(' '))
  //   return nowTime + ' 00:00'
  // }
  render() {
    const { isFetching, license, platform} = this.props
    if (isFetching || !license) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }

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
              <Button type="primary" size="large" onClick={()=> this.setState({activeClick: true})} style={{marginRight:'40px'}}>立即授权</Button>
               {
                 license.licenses.length > 0 ? [ <Icon type="check-circle" className="success" />,' 已激活',<span className="dataKey">有效期至：{ formatDate(license.merged.end || '') } </span>]
                 :
                 [<Icon type="check-circle" className="success"/>,' 未激活',<span className="dataKey">试用期至：{ formatDate(this.state.trialEndTime) } </span>]
               }
            </div>
            }

          </div>
          <div className="list oneTips">
            <div>您可通过以下几种方式联系我们获取『激活码License』：</div>
            <div className="ant-col-20 oneTips">
              ① 发送“ <span style={{color:'#24a7eb'}}>平台ID + 姓名 + 电话 + 公司名 </span>” 到 <a href="mailto:support@tenxcloud.com" style={{color:'#24a7eb'}}>support@tenxcloud.com </a>我们将主动与您联系
            </div>
            <div className="ant-col-20 oneTips">
              ② 如果平台可访问公网，右下角会出现工单小图标，可直接点击与我们取得联系，获取License
            </div>
            <div className="ant-col-20 oneTips">
              ③ 访问时速云的公有云控制台：portal.tenxcloud.com（即将上线在线购买激活码 License功能）
            </div>
          </div>
        </Card>
        <br/>
        <Card  className="licenseWrap">
          <table className="list-table" >
            <thead className="ant-table-thead">
              <tr><th ><span>完整 License</span></th>
              <th ><span>最大节点数</span></th><th ><span>生效时间</span></th>
              <th ><span>失效时间</span></th><th ><span>有效时长</span></th>
              <th ><span>添加时间</span></th><th ><span>操作人</span></th></tr>
            </thead>
            <tbody className="ant-table-tbody">
              {this.lincenseList(license.licenses)}

            </tbody>
          </table>
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
  loadLicensePlatform,
  loadMergedLicense
})(License)