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
import { GetCalamariUrl,SetCalamariUrl } from '../../actions/storage'
import './style/Ceph.less'
import NotificationHandler from '../../components/Notification'


class Ceph extends Component {
  constructor(props) {
    super(props)
    const { cephIsSetting } = this.props
    this.state = {
      calamariUrl:'',
      overall: false,
      setting: cephIsSetting || false,
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
  setUrl() {
    const { calamariUrl } = this.state
    const notifcat = new NotificationHandler()
    if (!/^http:\/\/|https:\/\//.test(calamariUrl)) {
      notifcat.error('请输入以 http://或者https://开头')
      return
    }
    const { clusterID } = this.props
    const body ={
      calamariUrl: calamariUrl,
      clusterID
    }
    this.props.SetCalamariUrl(body,{
      success:{
        func:(ret)=> {
          this.loadUrl(this)
          notifcat.success('设置成功！')
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
  loadUrl(scope) {
    const { clusterID } = this.props
    const notific = new NotificationHandler()
    scope.props.GetCalamariUrl({clusterID},{
      success:{
        func:(ret) => {
          if (ret.code == '500'|| ret.code == '400') {
            scope.setState({setting: true})
            return
          }
          if (!ret.data.calamariUrl) {
            scope.setState({setting: true})
            notific.info('请设置地址')
            return
          }
          scope.setState({calamariUrl:ret.data.calamariUrl,setting:false})
        }
      },
      failed:{
        func:(ret)=> {
          notific.close()
          if (ret.message.message == 'CEPH_CONFIG_IS_EMPTY') {
            notific.error('获取地址失败','请先配置ceph集群')
            return
          }
          if (ret.message.code >= 300) {
            scope.setState({setting: true})
          }
          if (ret.message.message == 'CALAMARI_ADDRESS_IS_EMPTY') {
            notific.error('获取地址失败','请先设置地址')
          }
          if (ret.message.message == 'CALAMARI_ADDRESS_IS_INVALID') {
            notific.error('获取地址失败','地址无效')
          }
        }
      }
    })
  }
  componentWillMount() {
    this.loadUrl(this)
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
  return {
    clusterID
  }
}

export default connect(mapStateToProps,{
  GetCalamariUrl,
  SetCalamariUrl
})(Ceph)