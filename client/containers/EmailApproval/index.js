
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/* EmailApproval page for enterprise
 *
 * v0.1 - 2018-10-10
 * @author lvjunfeng
 */

import React from 'react'
import { connect } from 'react-redux'
import Top from '../../../src/components/Top'
import { getPersonalized } from '../../../src/actions/personalized'
import { Button, Spin, Row } from 'antd'
import './style/index.less'
import * as emailActions from '../../actions/emailApprocal'

class EmailApproval extends React.Component {

  componentDidMount() {
    const { getEmailApproval, stageId, stageBuildId, token } = this.props
    this.props.getPersonalized()
    getEmailApproval(stageId, stageBuildId, token)
  }

  hadleApproval = async type => {
    const { stageId, stageBuildId, token, email,
      updateApprovalStatus, getEmailApproval } = this.props
    const body = { email }
    await updateApprovalStatus(stageId, stageBuildId, type, token, body)
    getEmailApproval(stageId, stageBuildId, token)
  }

  copyright = info => {
    if (info.company) {
      if (info.company.visible) {
        return info.company.name
      }
    }
    return
  }

  render() {
    const { info, isFetching, approvalStatus } = this.props
    // const approvalStatus = 1
    let showStatus = '正在获取状态'
    if (approvalStatus === 0) {
      showStatus = '已通过'
    } else if (approvalStatus === 1) {
      showStatus = '其他原因任务失败'
    } else if (approvalStatus === 4) {
      showStatus = '人工停止'
    } else if (approvalStatus === 32) {
      showStatus = <div className="operate">
        <Button
          size="large"
          onClick={() => this.hadleApproval('deny')}
        >
          拒绝
        </Button>
        <Button
          size="large"
          type="primary"
          onClick={() => this.hadleApproval('approve')}
        >
          通过
        </Button>
      </div>
    } else if (approvalStatus === 33) {
      showStatus = '已超时'
    } else if (approvalStatus === 34) {
      showStatus = '已拒绝'
    } else if (approvalStatus === 36) {
      showStatus = '已审批'
    }
    return <div id="EmailApproval">
      <Top loginLogo={info.loginLogo} />
      <div className="emailPrompt">
        <div className="textCont">
          【时速云tenxcloud.com】流水线任务 测试环境一 中 部署N1镜像 通知审批
        </div>
        <div className="operate">
          { isFetching ? <Spin size="large" spinning={isFetching} /> : showStatus }
        </div>
      </div>

      <Row className="footer">
        <span className="copyright" span={12}>
          {this.copyright(info)}
        </span>
        {/* <span className="langSwitch" span={12}>
          <span className="lang" onClick={() => this.changeLang('zh')}>
          简体中文
          </span>
          <span>∙</span>
          <span className="lang" onClick={() => this.changeLang('en')}>
          English
          </span>
        </span> */}
      </Row>
    </div>
  }
}

function mapStateToProps({ personalized,
  emailApproval: { approvalStatus: { approvalStatus, isFetching } } }, {
  location: { query: { stageId, stageBuildId, token, email } },
}) {
  const { info } = personalized || {}
  return {
    info: info.result || {},
    stageId,
    stageBuildId,
    token,
    email,
    approvalStatus,
    isFetching,
  }
}

export default connect(mapStateToProps, {
  getPersonalized,
  getEmailApproval: emailActions.getEmailApproval,
  updateApprovalStatus: emailActions.updateApprovalStatus,
})(EmailApproval)
