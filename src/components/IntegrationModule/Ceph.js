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
import { Card,Button,Icon } from 'antd'
import { connect } from 'react-redux'
import { GetCalamariUrl } from '../../actions/storage'
import './style/Ceph.less'

class Ceph extends Component {
  constructor(props) {
    super()
    this.state = {
      calamariUrl:'',
      overall:false
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
  componentWillMount() {
    const { clusterID } = this.props
    const _this = this
    this.props.GetCalamariUrl({clusterID},{
      success:{
        func:(ret) => {
          _this.setState({calamariUrl:ret.data.calamariUrl})
        }
      }
    })
  }

  render() {
    const height = !this.state.overall ? document.body.offsetHeight - 170:'auto'
    return (
      <Card id={this.state.overall ? 'overall':''} className="ceph" style={{height:height}} extra={<span className="cursor" onClick={()=> this.showAll(this.state.overall)}><Icon type={this.state.overall ? 'shrink':'arrow-salt'} /></span>}  title={<Button size='large' type='ghost' className='backBtn' onClick={()=> this.returnToList()}>
            返回应用列表
          </Button>}>
        <iframe id="iframe" style={{width:'100%',border:0}} src={this.state.calamariUrl}></iframe>
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
  GetCalamariUrl
})(Ceph)