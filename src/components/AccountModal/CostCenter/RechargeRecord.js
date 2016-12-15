import React, { Component } from 'react'
import { Card, Button, Icon, Table, Modal, Alert, Row, Col, Checkbox, InputNumber,Spin } from 'antd'
import './style/RechargeRecord.less'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../../actions/user'
import { loadTeamClustersList } from '../../../actions/team'
import { setCurrent, loadLoginUserDetail } from '../../../actions/entities'
import { loadChargeRecord, loadNotifyRule, setNotifyRule } from '../../../actions/consumption'
import PopSelect from '../../PopSelect'
import moment from 'moment'
import { Link } from 'react-router'

class RechargeRecord extends Component{
  constructor(props){
    super(props)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.showModal = this.showModal.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.onNotifyCenterCheckBoxChange = this.onNotifyCenterCheckBoxChange.bind(this)
    this.onNotifyMailCheckBoxChange = this.onNotifyMailCheckBoxChange.bind(this)
    this.state = {
      spacesVisible: false,
      currentSpaceName: '我的空间',
      currentTeamName: '',
      currentNamespace: '',
      remindModal: false,
      threshold: props.notifyRule.threshold,
      notifyCenterCheckBox: false,
      notifyMailCheckBox: false,
    }
  }
  handleSpaceChange(space) {
    const { loadTeamClustersList,loadUserTeamspaceList, setCurrent, current, loginUser } = this.props
    this.setState({
      spacesVisible: false,
      currentSpaceName: space.spaceName,
      currentTeamName: space.teamName,
      currentNamespace: space.namespace,
    })
    const {
      loadChargeRecord,
    } = this.props
    loadChargeRecord(space.namespace)
  }
  handleOk() {
    this.setState({
      remindModal: false
    })
    const {
      setNotifyRule,
    } = this.props
    const {
      notifyCenterCheckBox,
      notifyMailCheckBox,
      threshold,
    } = this.state
    let notifyWay = (notifyMailCheckBox ? 1 : 0) + (notifyCenterCheckBox ? 2 : 0)
    setNotifyRule(this.state.currentNamespace, threshold * 100, notifyWay)
  }
  handleCancel() {
    this.setState({
      remindModal: false
    })
  }
  componentWillMount() {
    const {
      userID,
      loadTeamClustersList,
      loadLoginUserDetail,
      loadUserTeamspaceList,
      loginUser,
      userDetail,
      teamspaces,
      loadChargeRecord,
    } = this.props
    loadUserTeamspaceList(userID ? userID : 'default',{ size: 100 }, {
      success: {
        func:()=>{
        },
        isAsync: true
      }
    })
    loadChargeRecord()
  }
  componentWillReceiveProps(nextProps) {
    const { notifyRule } = nextProps
    let notifyByMail = !!(notifyRule.notifyWay & 1)
    let notifyByNofityCenter = !!(notifyRule.notifyWay & 2)
    this.setState({
      threshold: notifyRule.threshold,
      notifyCenterCheckBox: notifyByNofityCenter,
      notifyMailCheckBox: notifyByMail,
    })
  }
  showModal(){
    this.setState({
      remindModal: true
    })
    this.props.loadNotifyRule(this.state.currentNamespace)
  }
  onNotifyCenterCheckBoxChange(e){
    this.setState({
      notifyCenterCheckBox: e.target.checked,
    })
  }
  onNotifyMailCheckBoxChange(e){
    this.setState({
      notifyMailCheckBox: e.target.checked,
    })
  }
  render(){
    const {
      current,
      loginUser,
      teamspaces,
      teamClusters,
      chargeRecord,
      notifyRule,
    } = this.props
    let {
      spacesVisible,
      currentSpaceName,
      currentTeamName,
      remindModal,
      threshold,
      notifyCenterCheckBox,
      notifyMailCheckBox,
    } = this.state
    let convertChargeRecord = function () {
      if (!Array.isArray(chargeRecord.items)) {
        return []
      }
      let items = JSON.parse(JSON.stringify(chargeRecord.items))
      items.map(function(item) {
        item.before = (item.before / 100).toFixed(2) + 'T'
        item.charge = (item.charge / 100).toFixed(2) + 'T'
        item.after = (item.after / 100).toFixed(2) + 'T'
        item.time = moment(item.time).format('YYYY-MM-DD HH:mm:ss')
      })
      return items

    }
    let rechargecolumns = [
      {
        title: '充值前',
        key: 'before',
        dataIndex: 'before',
        className: 'firstCol',
      },
      {
        title: '充值金额',
        key: 'charge',
        dataIndex: 'charge',
        className: 'blueFont',
      },
      {
        title: '充值后余额',
        key: 'after',
        dataIndex: 'after',
        className: 'greenFont',
      },
      {
        title: '充值时间',
        key: 'time',
        dataIndex: 'time',
      },
      {
        title: '操作人',
        key: 'operator',
        dataIndex: 'operator',
      },
    ]
    let alertMessage = (
      <div style={{color: '#137bb8',lineHeight:'28px',}}>
        <Icon type="smile" style={{marginRight: 10}}/> 温馨提示: <br/>
        1. 此设置可根据您的个人情况进行更改, &nbsp;您所设置的内容不会影响到其他协作者<br/>
        2. 您可在
        <Link to="/account">
          <Button type='primary' style={{color: '#fff',width:90,height:28}}>我的信息</Button>
        </Link>
        中填写或修改接受提醒的邮箱地址
      </div>
    )
    return (
      <div id='RechargeRecord'>
        <Card style={{marginBottom: '20px'}}>
          <div className="selectSpace">
            <i className='fa fa-cube' style={{marginRight:'10px',fontSize: '14px',marginTop:'-3px'}}/>
            <div style={{display:'inline-block',fontSize: '14px'}}>
              <PopSelect
                title="选择项目空间"
                btnStyle={false}
                special={true}
                visible={spacesVisible}
                list={teamspaces}
                loading={false}
                onChange={this.handleSpaceChange}
                selectValue={ currentSpaceName }
              />
            </div>
            <div style={{flex: 'auto'}}>
              <Button icon="clock-circle-o" style={{float: 'right',fontSize: '14px'}} onClick={this.showModal}>设置提醒</Button>
            </div>
          </div>
        </Card>
        <Card className="RechargeTable" bodyStyle={{padding: 0}}>
          <Table
            dataSource={convertChargeRecord()}
            columns={rechargecolumns}
            pagination = {false}
          />
        </Card>
        <Modal visible={this.state.remindModal}
               title='设置提醒'
               wrapClassName='remindModal'
               onOk={this.handleOk}
               onCancel={this.handleCancel}
               width = '610px' >
          <div>
            <Alert message={alertMessage} type="info" />
            <Row style={{color: '#333333',height: 35}}>
              <Icon type="pay-circle-o" style={{marginRight: 10}}/>
              余额不足提醒
            </Row>
            <Row style={{paddingLeft:'22px',height: 35}}>
              <Col span={4} style={{color: '#7a7a7a'}}>提醒规则</Col>
              <Col span={20} style={{color: '#666666'}}>我的空间可用余额小于&nbsp;
                <InputNumber
                  value={threshold}
                  onChange={(value) => {
                    this.setState({
                      threshold: value
                    })
                  }}
                  min={0}
                />T币
                时发送提醒
              </Col>
            </Row>
            <Row style={{paddingLeft:'22px',height: 28}}>
              <Col span={4} style={{color: '#7a7a7a'}}>提醒方式</Col>
              <Col span={20}>
                <Checkbox checked={notifyCenterCheckBox} style={{color: '#7a7a7a',fontSize: '14px'}} onChange={this.onNotifyCenterCheckBoxChange}>通知中心</Checkbox>
              </Col>
            </Row>
            <Row style={{paddingLeft:'22px',height: 30}}>
              <Col span={4}/>
              <Col span={20}>
                <Checkbox checked={notifyMailCheckBox} style={{color: '#7a7a7a',fontSize: '14px'}} onChange={this.onNotifyMailCheckBoxChange}>{'邮件(' + this.props.loginUser.info.email + ')'}</Checkbox>
              </Col>
            </Row>
          </div>
          
        </Modal>
      </div>
    )
  }
}
function mapStateToProps (state,props) {
  const { current, loginUser } = state.entities
  const { teamspaces,userDetail } = state.user
  const { chargeRecord, notifyRule } = state.consumption
  let recordData = {
    items: [],
  }
  if (!chargeRecord.isFetching) {
    if (chargeRecord.result && chargeRecord.result.data && chargeRecord.result.data.items) {
      recordData.items = chargeRecord.result.data.items
    }
  }
  let notifyRuleData = {
    threshold: 0,
    notifyWay: 0,
  }
  if (notifyRule.isFetching === false && notifyRule.result && notifyRule.result.data) {
    notifyRuleData.threshold = notifyRule.result.data.threshold / 100
    notifyRuleData.notifyWay = notifyRule.result.data.notifyWay
  }
  return {
    current,
    loginUser,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    userDetail: (userDetail.result ? userDetail.result.data: {}),
    chargeRecord: recordData,
    notifyRule: notifyRuleData,
  }
}
export default connect (mapStateToProps,{
  loadUserTeamspaceList,
  loadTeamClustersList,
  loadLoginUserDetail,
  loadChargeRecord,
  loadNotifyRule,
  setNotifyRule,
})(RechargeRecord)