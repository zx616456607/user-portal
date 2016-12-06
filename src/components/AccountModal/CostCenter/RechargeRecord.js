import React, { Component } from 'react'
import { Card, Button, Icon, Table, Modal, Alert, Row, Col, Checkbox, InputNumber } from 'antd'
import './style/RechargeRecord.less'
import { connect } from 'react-redux'
import { loadUserTeamspaceList } from '../../../actions/user'
import { loadTeamClustersList } from '../../../actions/team'
import { setCurrent, loadLoginUserDetail } from '../../../actions/entities'
import PopSelect from '../../PopSelect'


class RechargeRecord extends Component{
  constructor(props){
    super(props)
    this.handleSpaceChange = this.handleSpaceChange.bind(this)
    this.showModal = this.showModal.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.state = {
      spacesVisible: false,
      currentSpaceName: '我的空间',
      currentTeamName: '',
      remindModal: false,
      alertLine: 10
    }
  }
  handleSpaceChange(space) {
    const { loadTeamClustersList,loadUserTeamspaceList, setCurrent, current, loginUser } = this.props
    console.log('space',space)
    this.setState({
      spacesVisible: false,
      currentSpaceName: space.spaceName,
      currentTeamName: space.teamName,
    })
  }
  handleOk() {
    this.setState({
      remindModal: false
    })
  }
  handleCancel() {
    this.setState({
      remindModal: false
    })
  }
  componentWillMount() {
    const {
      loadTeamClustersList,
      loadLoginUserDetail,
      loadUserTeamspaceList,
      loginUser,
      userDetail,
      teamspaces,
    } = this.props
    loadUserTeamspaceList(loginUser.info.userID||userDetail.userID,{ size: 100 }, {
      success: {
        func:()=>{
          console.log('teamspaces',teamspaces)
        },
        isAsync: true
      }
    })
  }
  showModal(){
    this.setState({
      remindModal: true
    })
  }
  render(){
    const {
      current,
      loginUser,
      teamspaces,
      teamClusters,
    } = this.props
    let {
      spacesVisible,
      currentSpaceName,
      currentTeamName,
      remindModal,
      alertLine
    } = this.state
    let rechargeData = [
      {bef: '1T',money: '100T',rest: '102T',time: '2016-11-17 19:55:55',operator: 'zhaoxy'},
      {bef: '1T',money: '100T',rest: '102T',time: '2016-11-17 19:55:55',operator: 'zhaoxy'},
      {bef: '1T',money: '100T',rest: '102T',time: '2016-11-17 19:55:55',operator: 'zhaoxy'},
      {bef: '1T',money: '100T',rest: '102T',time: '2016-11-17 19:55:55',operator: 'zhaoxy'},
      {bef: '1T',money: '100T',rest: '102T',time: '2016-11-17 19:55:55',operator: 'zhaoxy'},
      {bef: '1T',money: '100T',rest: '102T',time: '2016-11-17 19:55:55',operator: 'zhaoxy'},
    ]
    let rechargecolumns = [
      {
        title: '充值前',
        key: 'bef',
        dataIndex: 'bef',
        className: 'firstCol',
      },
      {
        title: '充值金额',
        key: 'money',
        dataIndex: 'money',
        className: 'blueFont',
      },
      {
        title: '充值后余额',
        key: 'rest',
        dataIndex: 'rest',
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
        2. 您可在 <Button type='primary' style={{color: '#fff',width:90,height:28}}>我的信息</Button> 中填写或修改接受提醒的邮箱地址
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
            dataSource={rechargeData}
            columns={rechargecolumns}
            pagination = {false}
          />
        </Card>
        <Modal visible={this.state.remindModal}
               title='设置提醒'
               wrapClassName='remindModal'
               onOk={this.handleOk}
               onCancel={this.handleCancel}
               width = '610' >
          <div>
            <Alert message={alertMessage} type="info" />
            <Row style={{color: '#333333',height: 35}}>
              <Icon type="pay-circle-o" style={{marginRight: 10}}/>
              余额不足提醒
            </Row>
            <Row style={{paddingLeft:'22px',height: 35}}>
              <Col span={4} style={{color: '#7a7a7a'}}>提醒规则</Col>
              <Col span={20} style={{color: '#666666'}}>我的空间可用余额小于&nbsp;
                <InputNumber defaultValue = {alertLine} />T币
                时发送提醒
              </Col>
            </Row>
            <Row style={{paddingLeft:'22px',height: 28}}>
              <Col span={4} style={{color: '#7a7a7a'}}>提醒方式</Col>
              <Col span={20}>
                <Checkbox style={{color: '#7a7a7a',fontSize: '14px'}}>通知中心</Checkbox>
              </Col>
            </Row>
            <Row style={{paddingLeft:'22px',height: 30}}>
              <Col span={4}/>
              <Col span={20}>
                <Checkbox style={{color: '#7a7a7a',fontSize: '14px'}}>邮件( ... )</Checkbox>
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
  
  return {
    current,
    loginUser,
    teamspaces: (teamspaces.result ? teamspaces.result.teamspaces : []),
    userDetail: (userDetail.result ? userDetail.result.data: {})
  }
}
export default connect (mapStateToProps,{
  loadUserTeamspaceList,
  loadTeamClustersList,
  loadLoginUserDetail,
})(RechargeRecord)