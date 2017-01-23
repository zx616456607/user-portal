/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AppService rental component
 *
 * v0.1 - 2017-1-19
 * @author Baiyu
 */
import React, { Component, PropTypes } from 'react'
import { Card, Icon, Switch, Button, Tooltip, Form, Modal, Input } from 'antd'
import { connect } from 'react-redux'
import { Link } from 'react-router'
// import { calcuDate, parseAmount} from '../../../common/tools.js'
import './style/AppSettingsHttps.less'

const FormItem = Form.Item
const createForm = Form.create

let UploadSslModal = React.createClass({
  nameExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入证书名称')])
      return
    }
    callback()
  },
  usernameExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入用户名')])
      return
    }
    callback()
  },
  privateExists(rule, values, callback) {
    if (!values) {
      callback([new Error('请输入密钥内容')])
      return
    }
    callback()
  },
  handsubmit() {
    this.props.form.validateFields((error, values)=> {
      if (!!error) {
        return
      }
    })
  },
  render() {
    const parentScope = this.props.scope
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const nameProps = getFieldProps('sslName', {
      rules: [
        { validator: this.nameExists },
      ],
    })
    const usernameProps = getFieldProps('username', {
      rules: [
        { validator: this.usernameExists },
      ],
    })
    const privateContent = getFieldProps('private', {
      rules: [
        { validator: this.privateExists },
      ],
    })
    return (
      <Modal title="新建证书" visible={parentScope.state.createModal} className="createSslModal"
        onOk={()=> this.handsubmit()} onCancel={()=> parentScope.setState({createModal: false})} 
        okText="创建"
        >
        <Form horizontal>
          <FormItem
            {...formItemLayout}
            label="证书名称"
            >
            <Input {...nameProps} type="text" className="SslName" placeholder="请输入名称" />
          </FormItem>
          <FormItem {...formItemLayout} label="证书类型">
            <span>服务器证书</span>
          </FormItem>
          <FormItem {...formItemLayout} label="用户名">
            <Input type="textarea" {...usernameProps}/>
            <a>查看样例</a>
          </FormItem>
          <FormItem {...formItemLayout} label="密钥内容">
            <Input type="textarea" {...privateContent}/>
            <a>查看样例</a>
          </FormItem>

        </Form>
      </Modal>
    )
  }
})

UploadSslModal = createForm()(UploadSslModal)

class AppSettingsHttps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabsActive: 1,
      status: false,
      statusText: '关闭',
      targeStatus: false,
      createModal: false
    }
  }
  settingHttps(e) {
    // settings https true
    this.setState({ targeStatus: e })
  }
  changeSwitch(e) {
    // target on || off
    if (e) {
      this.setState({ statusText: '开启', status: e })
      return
    }
    this.setState({ statusText: '关闭', status: false })
  }
  targetTabs(e) {
    this.setState({
      tabsActive: e
    })
  }
  goLinks(key) {
    // setting ports || binddomain
    this.props.scope.setState({ activeTabKey: key })
  }
  headActionfunc() {
    //  初始化开关是关闭状态，不可编辑， 如果有绑定了域名和添加了端口，会有设置按钮 ，如果关闭状态，并且有绑定了域名和添加了端口，可以打开 开关
    if (this.state.status) {
      return (
        <span>
          <Tooltip title={`HTTPS已${this.state.statusText}`}><Switch checkedChildren="开" unCheckedChildren="关" onChange={(e) => this.changeSwitch(e)} defaultChecked={true} style={{ marginLeft: '40px' }} /></Tooltip>
          <span className="settingsIcon" onClick={() => this.settingHttps(true)}><svg ><use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#settingsIcon"></use></svg></span>
        </span>
      )
    }
    // *** ----- 如果有绑定了域名和添加了端口，是关闭状态，可以打开，暂未判断  ------
    return (
      <Tooltip title={`HTTPS已${this.state.statusText}`}><Switch checkedChildren="开" unCheckedChildren="关" checked={false} style={{ marginLeft: '40px' }} /></Tooltip>
    )
  }
  render() {
    return (
      <div id="settingsHttps">
        <div className="topHead">
          设置HTTPS
          {this.state.targeStatus ?
            <span style={{ marginLeft: '50px' }}><Button type="primary">开启并保存</Button><Button onClick={() => this.setState({ targeStatus: false })} style={{ marginLeft: '10px' }}>取消</Button></span>
            :
            null
          }
          {this.headActionfunc()}
        </div>
        <Card className="content">
          <div className="info commonBox">
            <div className="titleSpan">设置条件</div>
            <div className="setting">
              <div className="commonTitle">是否绑定域名&nbsp;&nbsp;
                <Tooltip title="请在绑定域名中添加"><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                <span className="links" onClick={() => this.goLinks('#binddomain')}><Icon type="link" style={{ marginRight: '6px' }} />去绑定</span>
                {/* 去绑定， 或者已绑定 */}
                {/* <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>已绑定</span> */}

              </div>
              <div className="commonTitle">是否已有http端口&nbsp;&nbsp;
                <Tooltip title="请在端口中添加"><Icon type="question-circle-o" /></Tooltip>
              </div>
              <div className="commonTitle">
                <span className="links" onClick={() => this.goLinks('#ports')}><Icon type="plus-circle-o" style={{ marginRight: '6px' }} />去添加</span>

                {/* <span className="linked"><Icon type="check-circle-o" style={{marginRight:'6px'}}/>已添加</span> */}
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className="hrs"></div>
            <div className="titleSpan">证书</div>
            <div className="certificate">
              <div className="headTab">
                <span className={this.state.tabsActive == 1 ? "tabKey tabs-active" : 'tabKey'} onClick={() => this.targetTabs(1)}>使用自有证书</span>
                <span className={this.state.tabsActive == 2 ? "tabKey tabs-active" : 'tabKey'} onClick={() => this.targetTabs(2)}>使用Tenxcloud提供的信任证书</span>
              </div>
              <div className="tabsBody">
                <div className={this.state.tabsActive == 1 ? "tabs tabs-active" : 'tabs'}>
                  {/* 满足条件则不 提示 */}
                  <Tooltip title="请先满足上边的设置条件"><Button size="large" disabled={!this.state.targeStatus} onClick={()=> this.setState({createModal: true})}><Icon type="plus" />新建</Button></Tooltip>
                  {/* <Button size="large" type='primary' >重新上传</Button> */}
                  <div className="alertTips">Tips：使用自有的 ssl 证书则需要上传您的证书至该服务</div>
                </div>

                <div className={this.state.tabsActive == 2 ? "tabs tabs-active" : 'tabs'}>
                  <Button size="large" disabled>敬请期待</Button>
                </div>

              </div>

            </div>
          </div>
        </Card>
        {/* 新建证书 */}
        <UploadSslModal scope={this} />

        <div className="notice">注：HTTPS启动，则停止原有的HTTP服务</div>
      </div>
    )
  }
}

AppSettingsHttps.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired
}

function mapStateToProps(state) {
  const { cluster } = state.entities.current
  return {
    resourcePrice: cluster.resourcePrice
  }
}

export default connect(mapStateToProps)(AppSettingsHttps)