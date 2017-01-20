/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * PortDetail component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card, Spin, Dropdown, Icon, Menu, Button, Select, Input } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/PortDetail.less"
import { loadK8sService, clearK8sService } from '../../../actions/services'
import findIndex from 'lodash/findIndex'

let MyComponent = React.createClass({
  getInitialState() {
    return {}
  },
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    const _this = this
    const { serviceName } = this.props
    this.props.loadK8sService(this.props.cluster, serviceName, {
      success: {
        func: (res) => {
          console.log('request ing ',  serviceName)
          let openPort = []
          for(let i=0;i< res.data[serviceName].spec.ports.length; i++) {
            openPort.push(false)
          }
          _this.setState({
            openPort
          })
        }
      }
    })
  },
  componentWillUnmount() {
    this.props.clearK8sService()
  },
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow } = nextProps
    if (serviceDetailmodalShow === this.props.serviceDetailmodalShow) {
      return
    }
    if (!serviceDetailmodalShow) {
      return this.props.clearK8sService()
    }
    this.props.loadK8sService(nextProps.cluster, nextProps.serviceName)
  },
  editPort(name, index) {
    console.log('server name', name, index)
    const openPort = {[index]: true}
    this.setState({openPort})
  },
  deletePort(name) {
    console.log('del server port', name)
  },
  handCancel(i) {
    // cancel action 
    const openPort = {[i]: false}
    this.setState({openPort})
  },
  changeSsl(key) {
    console.log('select ssl', key)
  },
  render: function () {
    const {k8sService} = this.props
    if (k8sService.isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (!k8sService.data) {
      return (<div className='loadingBox'>
        无端口
      </div>)
    }
    let property = Object.getOwnPropertyNames(k8sService.data)
    if (property.length === 0) {
      return (<div className='loadingBox'>
        无端口
      </div>)
    }
    const service = k8sService.data[property[0]]
    if (!service.spec) {
      return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    }
    const ports = service.spec.ports
    const annotations = service.metadata.annotations
    let userPort = annotations['tenxcloud.com/schemaPortname']
    if(!userPort)  return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    userPort = userPort.split(',')
    userPort = userPort.map(item => {
      return item.split('/')
    })
    if (ports.length < 1) {
      return (
        <div className='loadingBox'>
          无端口
        </div>
      )
    }
    const items = []
    ports.forEach((item, index) => {
      const targetPort = findIndex(userPort, i => i[0] == item.name)
      if(targetPort < 0) return 
      let target = userPort[targetPort]
      if(!target) return
      if(target[1].toLowerCase() == 'tcp' && target.length < 3) return
      const dropdown = (
        <Menu style={{width:'100px'}} onClick={()=> this.editPort(item.name, index)}>
          <Menu.Item key="1"><Icon type="edit" /> &nbsp;编辑</Menu.Item>
        </Menu>
      )
    
      const actionText = (
        <Menu style={{width:'100px'}} onClick={()=> this.handCancel(index)}>
          <Menu.Item key="1"><Icon type="minus-circle-o" /> &nbsp;取消</Menu.Item>
        </Menu>
      )
      items.push (
        <div className="portDetail" key={item.name}>
          <div className="commonData span2">
            <span>{item.name}</span>
          </div>
          <div className="commonData">
            <span>{item.targetPort}</span>
          </div>
          <div className="commonData">
            { this.state.openPort && this.state.openPort[index] ? 
              <Select defaultValue={target[1]} style={{width:'80px'}} onChange={(e)=> this.changeSsl(e)}>
                <Select.Option key="HTTP">HTTP</Select.Option>
                <Select.Option key="TCP">TCP</Select.Option>
              </Select>
              :
              <span>{target[1]}</span>
            }
          </div>
          <div className="commonData span3">
            { this.state.openPort && this.state.openPort[index] ? 
               
              <Select defaultValue='动态生成' style={{width:'100px'}} onChange={(e)=> this.setState({inPort: e})}>
                <Select.Option key="1">动态生成</Select.Option>
                <Select.Option key="2">指定端口</Select.Option>
              </Select>
              
              :
              <span>{target[1].toLowerCase() == 'http' ? 80 : target[2]}</span>

            }
            { this.state.openPort && this.state.openPort[index] && this.state.inPort =='2' ?
                <Input style={{width:'100px', marginLeft:'10px'}}/>
              :null
            }
          </div>
          <div className="commonData span2">
            { this.state.openPort && this.state.openPort[index] ? 
               <Dropdown.Button overlay={actionText} type="ghost" style={{width:'100px'}}>
                  <Icon type="save" /> 保存
              </Dropdown.Button>
              :
              <Dropdown.Button overlay={dropdown} type="ghost" onClick={()=> this.deletePort(item.name)} style={{width:'100px'}}>
                <Icon type="delete" />删除
              </Dropdown.Button >

            }
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
      );
    });
    if(items.length == 0) return (
        <div className='loadingBox'>
            无端口
        </div>
     )
    return (
      <Card className="portList">
        {items}
      </Card>
    );
  }
});

function mapSateToProp(state) {
  return {
    k8sService: state.services.k8sService
  }
}

MyComponent = connect(mapSateToProp, {
  loadK8sService,
  clearK8sService
})(MyComponent)

class PortDetail extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { containerList, loading } = this.props
    return (
      <div id="PortDetail">
        <div className="titleBox">
          <div className="commonTitle span2">
            名称
          </div>
          <div className="commonTitle">
            容器端口
          </div>
          <div className="commonTitle">
            协议
          </div>
          <div className="commonTitle span3">
            服务端口
          </div>
          <div className="commonTitle span2">
            操作
          </div>
          <div style={{ clear: "both" }}></div>
        </div>
        <MyComponent config={containerList} loading={loading} cluster={this.props.cluster} serviceName={this.props.serviceName} serviceDetailmodalShow={this.props.serviceDetailmodalShow} />
      </div>
    )
  }
}

PortDetail.propTypes = {
  cluster: PropTypes.string.isRequired,
  serviceName: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default PortDetail