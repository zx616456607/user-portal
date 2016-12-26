/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/12/9
 * @author ZhaoXueYu
 */
import React, { Component } from 'react'
import { Modal,Alert,Icon,Button,Row,Col,Input } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { getTeamDissoveable } from '../../../actions/team'
import NotificationHandler from '../../../common/notification_handler'
import { browserHistory } from 'react-router'

let balanceMessage = (
  <Row className="tip">
    <Col span={2} className='tipIcon'>
      <Icon type="exclamation-circle" />
    </Col>
    <Col className="tipText" span={22}>
      Tip: &nbsp;请注意 , &nbsp;当前团队仍有欠款未结清, 请充值当前团队帐户后再尝试解散团队!
    </Col>
  </Row>
)

class DelTeamModal extends Component{
  constructor(props){
    super(props)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.renderFooter = this.renderFooter.bind(this)
    this.checkTeamName = this.checkTeamName.bind(this)

    this.state = {
      btnDis: true,
    }
  }
  handleOk() {
    const { closeDelTeamModal, teamID, dissolveTeam, loadUserTeamList } = this.props
    let notification = new NotificationHandler()
    notification.spin(`解散团队中...`)
    dissolveTeam(teamID, {
      success: {
        func: () => {
          notification.close()
          notification.spin(`解散团队成功...`)
          browserHistory.push('/account/teams')
          loadUserTeamList()
        },
        isAsync: true,
      },
      failed: {
        func: (err) => {
          notification.close()
          notification.error(`解散团队失败`, err.message.message)
        }
      }
    })
    closeDelTeamModal()
  }
  handleCancel() {
    const { closeDelTeamModal } = this.props
    closeDelTeamModal()
  }
  renderFooter (balance) {
    if(balance){
      return [
        <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>取消</Button>,
        <Button key="submit" size="large" onClick={this.handleOk} className="delBtn"  disabled={this.state.btnDis}>
          确定
        </Button>,
      ]
    }
    return [
      <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>知道了</Button>,
      <Link to='/account/balance' style={{marginLeft: '12px'}}>
        <Button key="submit" type="primary" size="large">
          去充值
        </Button>
      </Link>,
    ]
  }
  checkTeamName (e) {
    const { teamName } = this.props
    if (e.target.value === teamName) {
      this.setState({
        btnDis: false,
      })
      return
    }
    this.setState({
      btnDis: true,
    })
  }
  render(){
    const { visible, balance, teamName, userName } = this.props
    let delMessage = (
      <div>
        <Row className="tip delTip">
          <Col span={2} className='tipIcon'>
            <Icon type="exclamation-circle" />
          </Col>
          <Col className="tipText" span={22} style={{color:'#4e4e4d'}}>
            Tip：请注意，点击确认后“{teamName}”团队将会被解散
          </Col>
        </Row>
        <Row className="tip" style={{marginTop: '30px'}}>
          <Col span={2} className='tipIcon'>
            <Icon type="exclamation-circle" />
          </Col>
          <Col className="tipText" span={22} style={{color:'#8f8e8c'}}>
            团队内的应用、存储、数据库均将被清空
          </Col>
        </Row>
        <Row className="tip">
          <Col span={2} className='tipIcon'>
            <Icon type="exclamation-circle" />
          </Col>
          <Col className="tipText" span={22} style={{color:'#8f8e8c'}}>
            团队余额将退回至“{userName}（创建者）”帐户，稍后请查收个人帐户的充值记录【来源显示：时速云（注：团队解散退款）】
          </Col>
        </Row>
      </div>
      
    )
    return (
      <Modal
        wrapClassName="DelTeamModal"
        title="确认解散"
        visible={visible}
        onOK={this.handleOk}
        onCancel={this.handleCancel}
        footer={ this.renderFooter(balance) }
      >
        <Alert message={balance ? delMessage : balanceMessage} type="warning"/>
        {
          balance?
          <Row className="confirm">
            <Col span={2} className='confirmIcon'>
              <Icon type="question-circle-o" />
            </Col>
            <Col className="confirmText" span={22}>
              请确认是否解散团队
              <Input placeholder="输入团队名称" className="confirmInt" onChange={this.checkTeamName}/>
            </Col>
          </Row>:
          <div></div>
        }
        
      </Modal>
    )
  }
}
function mapStateToProp(state, props) {
  const { teamDissoveable } = state.team
  let userName = state.entities.loginUser.info.userName
  let balance = true
  if(teamDissoveable.reslut) {
    if (teamDissoveable.reslut.data) {
      balance = teamDissoveable.reslut.data.data
    }
  }
  return {
    balance,
    userName
  }
}

export default connect(mapStateToProp, {
  getTeamDissoveable,
})(DelTeamModal)