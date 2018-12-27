/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Integration ceph module
 *
 * v2.0 - 2016-11-22
 * @author by Baiyu
 */

import React, { Component } from 'react'
import { Card,Button,Icon,Input } from 'antd'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import * as integrationActions from '../../actions/integration'
import './style/Ceph.less'
import NotificationHandler from '../../components/Notification'
import { getDeepValue } from '../../../client/util/util'


class Ceph extends Component {
  constructor(props) {
    super(props)
    this.state = {
      calamariUrl:'',
      overall: false,
      setting: true,
    }
  }
  returnToList() {
    //the function for user return to the list
    const { scope } = this.props;
    scope.setState({
      showType: 'list'
    });
  }
  showAll(overall) {
    this.setState({overall:!overall})
  }
  setUrl = async () => {
    const { calamariUrl } = this.state
    const notifcat = new NotificationHandler()
    if (!/^http:\/\/|https:\/\//.test(calamariUrl)) {
      notifcat.error('请输入以 http://或者https://开头')
      return
    }
    const { createCeph, getAllIntegration } = this.props
    const body ={
      url: calamariUrl,
    }
    createCeph(body,{
      success:{
        func: async ()=> {
          notifcat.success('设置成功！')
          await getAllIntegration()
          this.loadUrl()
        },
        isAsync: true
      },
      failed: {
        func:()=> {
          notifcat.error('设置地址失败','地址无效')
        }
      }
    })
  }
  loadUrl = () => {
    const notific = new NotificationHandler()
    const { integrations } = this.props
    const { ceph } = integrations
    if (!ceph || isEmpty(ceph) || isEmpty(ceph[0]) || !ceph[0].url) {
      notific.info('请设置地址')
      return
    }
    this.setState({calamariUrl:ceph[0].url ,setting:false})
  }
  componentWillMount() {
    this.loadUrl()
  }

  render() {
    const { calamariUrl, overall } = this.state
    const height = !overall ? document.body.offsetHeight - 170:'auto'
    return (
      <Card id={this.state.overall ? 'overall':''} className="ceph" style={{height:height}}
        extra={
          <div>
            <Button size="large" icon="edit" type="ghost" onClick={() => this.setState({setting: true})}>修改访问配置</Button>
            <Button size='large' type='ghost' className='backBtn' onClick={()=> this.returnToList()}>
              返回应用列表
            </Button>
            <span className="cursor" onClick={()=> this.showAll(overall)}>
              <Icon type={overall ? 'shrink':'arrow-salt'} />
            </span>
          </div>
        }
        title=" "
      >
        {this.state.setting ?
          <div className="pushUrl">
            <Input id="url" size="large" value={calamariUrl} onChange={(e) => this.setState({calamariUrl: e.target.value})}
                   placeholder='请输入访问地址（即 Calamari Server 的节点 IP:Port）' onPressEnter={()=> this.setUrl()}/>
            <Button size="large" type="primary" onClick={()=> this.setUrl()}>立即进入</Button>
          </div>
        :<iframe id="iframe" style={{width:'100%',border:0}} src={calamariUrl}/>
        }
      </Card>
    )
  }
}

function mapStateToProps(state,props) {
  const { clusterID } = state.entities.current.cluster
  const integrations = getDeepValue(state, ['integration', 'getAllIntegration', 'integrations'])
  return {
    clusterID,
    integrations,
  }
}

export default connect(mapStateToProps,{
  createCeph: integrationActions.createCeph,
  getAllIntegration: integrationActions.getAllIntegration,
})(Ceph)