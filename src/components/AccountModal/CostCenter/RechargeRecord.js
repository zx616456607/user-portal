import React, { Component } from 'react'
import { Card, Button, Icon, Table, Modal, Alert, Row, Col, Checkbox } from 'antd'
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
    this.state = {
      spacesVisible: false,
      currentSpaceName: '我的空间',
      currentTeamName: '',
      remindModal: false,
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
      remindModal
    } = this.state
    let rechargeData = [
      
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
      },
      {
        title: '充值后余额',
        key: 'rest',
        dataIndex: 'rest',
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
        1. 此设置可根据您的个人情况进行更改, 您所设置的内容不会影响到其他协作者<br/>
        2. 您可在 <Button type='primary' style={{color: '#fff'}}>我的信息中</Button> 填写或修改接受提醒的邮箱地址
      </div>
    )
    return (
      <div id='RechargeRecord'>
        <Card style={{marginBottom: '20px'}}>
          <div className="selectSpace">
            <i className='fa fa-cube' style={{marginRight:'10px'}}/>
            <div style={{display:'inline-block'}}>
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
              <Button icon="clock-circle-o" style={{float: 'right'}} onClick={this.showModal}>设置提醒</Button>
            </div>
          </div>
        </Card>
        <Card className="RechargeTable" bodyStyle={{padding: 0}}>
          <Table
            dataSource={rechargeData}
            columns={rechargecolumns}
          />
        </Card>
        <Modal visible={this.state.remindModal} title='设置提醒' wrapClassName='remindModal'>
          <div>
            <Alert message={alertMessage} type="info" />
            <div>
              <Icon type="pay-circle-o" style={{marginRight: 10}}/>
              余额不足提醒
              <div style={{paddingLeft: 22}}>
                <Row>
                  <Col span={6}>提醒规则</Col>
                  <Col span={18}>我的空间可用余额小于 1000T 时发送提醒</Col>
                </Row>
                <Row>
                  <Col span={6}>提醒方式</Col>
                  <Col span={18}>
                    <Checkbox >通知中心</Checkbox>
                  </Col>
                </Row>
                <Row>
                  <Col span={6}></Col>
                  <Col span={18}>
                    <Checkbox >邮件( ... )</Checkbox>
                  </Col>
                </Row>
              </div>
            </div>
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