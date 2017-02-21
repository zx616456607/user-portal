/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 */

/* activation page for enterprise
 *
 * v0.1 - 2017-2-8
 * @author BaiYu
 */
import React, { PropTypes } from 'react'
import { Button, Form, Input, Card, message, Alert, Col, Row, Icon, Tooltip } from 'antd'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import Top from '../../components/Top'
import '../Login/Enterprise/style/Login.less'
import { addLicense, loadLicensePlatform } from '../../actions/license'
import NotificationHandler from '../../common/notification_handler'

const createForm = Form.create
const FormItem = Form.Item

let Activation = React.createClass({
  getInitialState() {
    return {
      submitting: false,
      loginResult: {},
      intNameFocus: false,
      copySuccess:false
    }
  },

  handleSubmit(e) {
    e.preventDefault()
    const _this = this
    this.props.form.validateFields((error, value) => {
      if (!!error) {
        return
      }
      _this.props.addLicense({rawlicense: value.name}, {
        success: {
          func: () => {
            new NotificationHandler().success('激活成功')
            browserHistory.push('/login')
          },
          isAsync: true
        },
        failed: {
          func: (res) => {
            new NotificationHandler().error('激活失败', res.message.message)
          }
        }
      })
    })
  },
  checkName(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写激活码')])
      return
    }
    callback()
  },

  componentWillMount() {
    this.props.loadLicensePlatform()
  },

  componentDidMount() {
    this.refs.intName.refs.input.focus()
  },
  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("CodeInput");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  },
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
  },
  render() {
    const { getFieldProps } = this.props.form
    const { submitting, loginResult, submitProps } = this.state
    const nameProps = getFieldProps('name', {
      rules: [
        { validator: this.checkName },
      ],
    })

    return (
      <div id="LoginBg">
        <Top/>
        <div className="login">
          <div className="loginContent">
          <Row style={{ textAlign: 'center' }}>
            <span className='logoLink'>
              <div className='logTitle'>时速云</div>
              <div className=''>技术领先的容器云计算服务商</div>
            </span>
          </Row>
          <Card className="loginForm" bordered={false}>
            <div>
              {
                loginResult.error && <Alert message={loginResult.error} type="error" showIcon />
              }
            </div>
            <Form onSubmit={(e)=> this.handleSubmit(e)}>
              <div className="platform">平台ID <span className="platformId textoverflow">{this.props.platform.platformid}</span>
                <Tooltip title={this.state.copySuccess ? '复制成功': '点击复制'}><span className={this.state.copySuccess ? "actions copyBtn":"copyBtn"} onClick={()=> this.copyDownloadCode()} onMouseLeave={()=> this.returnDefaultTooltip()}><Icon type="copy" /></span></Tooltip>
              </div>
              <FormItem
                hasFeedback
                >
                <Input {...nameProps}
                  ref="intName"
                  type="textarea" placeholder="请输入激活码：如XXX-XXX-XXX-XXXX"
                  style={{ maxHeight: 180 , height:180}} />
              </FormItem>

              <FormItem wrapperCol={{ span: 24, }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={(e)=> this.handleSubmit(e)}
                  loading={submitting}
                  className="subBtn">
                  {submitting ? '激活中...' : '激活'}
                </Button>
              </FormItem>
            </Form>
          </Card>
          <input className="CodeInput" style={{ position: "absolute", opacity: "0", top:'0'}} defaultValue={this.props.platform.platformid} />
        </div>
        </div>
        <div className="footer">
          © 2017 北京云思畅想科技有限公司 &nbsp;|&nbsp; 时速云企业版 v2.0
          </div>
      </div>
    )
  }
})

function mapStateToProps(state, props) {
  const defaultState = {data: {'platformid': ''}}
  const {data} = state.license.platform.result || defaultState
  return {
   platform: data
  }
}

Activation = createForm()(Activation)

Activation = connect(mapStateToProps, {
  loadLicensePlatform,
  addLicense
})(Activation)

export default Activation
