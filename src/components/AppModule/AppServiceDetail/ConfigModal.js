/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  Storage list
 *
 * v0.1 - 2016/10/27
 * @author ZhaoXueYu
 */

import React, {Component} from 'react'
import { Row, Col, Button, Modal } from 'antd'
import './style/ConfigModal.less'

export default class ConfigModal extends Component {
  constructor(props){
    super(props)
    this.selectComposeType = this.selectComposeType.bind(this)
    this.handleConfigOK = this.handleConfigOK.bind(this)
    this.handleConfigCancel = this.handleConfigCancel.bind(this)
    this.state = {
      composeType: '1'
    }
  }
  selectComposeType(type) {
    console.log(type);
    this.setState({
      composeType: type
    })
    console.log('this',this.state.composeType);
  }
  handleConfigOK() {
    const { parentScope } = this.props
    parentScope.setState({
      configModal: false
    })
  }
  handleConfigCancel() {
    const { parentScope } = this.props
    parentScope.setState({
      configModal: false
    })
  }
  render(){
    const { checkedServiceList, visible } = this.props
    const { composeType } = this.state
    if(checkedServiceList.length === 1){
      return (
        <Modal ref="modal"
               wrapClassName="modal"
               visible={ visible }
               title="更改服务配置" onOk={this.handleConfigOK} onCancel={this.handleConfigCancel}
               footer={[
                 <Button key="back" type="ghost" size="large" onClick={this.handleConfigCancel}>取 消</Button>,
                 <Button key="submit" type="primary" size="large" loading={this.state.loading}
                         onClick={this.handleConfigOK}>
                   保 存
                 </Button>
               ]}>
          <div id="ConfigModal">
            <Row className="serviceName">
              <Col className="itemTitle" span={4} style={{textAlign: 'left'}}>服务名称</Col>
              <Col className="itemBody" span={20}>
                { checkedServiceList[0].metadata.name }
              </Col>
            </Row>
            <Row>
              <Col className="itemTitle" span={4} style={{textAlign: 'left'}}>
                选择配置
                <i className="anticon anticon-question-circle-o" />
              </Col>
              <Col className="itemBody" span={20}>
                <div className="operaBox">
                  <div className="selectCompose">
                    <ul className="composeList">
                      <li className="composeDetail">
                        <Button type={composeType == "1" ? "primary" : "ghost"}
                                onClick={() => this.selectComposeType("1")}>
                          <div className="topBox">
                            1X
                          </div>
                          <div className="bottomBox">
                            <span>256M&nbsp;内存</span><br />
                            <span>1CPU&nbsp;(共享)</span>
                          </div>
                        </Button>
                      </li>
                      <li className="composeDetail">
                        <Button type={composeType == "2" ? "primary" : "ghost"}
                                onClick={() => this.selectComposeType("2")}>
                          <div className="topBox">
                            2X
                          </div>
                          <div className="bottomBox">
                            <span>512M&nbsp;内存</span><br />
                            <span>1CPU&nbsp;(共享)</span>
                          </div>
                        </Button>
                      </li>
                      <li className="composeDetail">
                        <Button type={composeType == "4" ? "primary" : "ghost"}
                                onClick={() => this.selectComposeType("4")}>
                          <div className="topBox">
                            4X
                          </div>
                          <div className="bottomBox">
                            <span>1GB&nbsp;内存</span><br />
                            <span>1CPU&nbsp;(共享)</span>
                          </div>
                        </Button>
                      </li>
                      <li className="composeDetail">
                        <Button type={composeType == "8" ? "primary" : "ghost"}
                                onClick={() => this.selectComposeType("8")}>
                          <div className="topBox">
                            8X
                          </div>
                          <div className="bottomBox">
                            <span>2GB&nbsp;内存</span><br />
                            <span>1CPU&nbsp;(共享)</span>
                          </div>
                        </Button>
                      </li>
                      <li className="composeDetail">
                        <Button type={composeType == "16" ? "primary" : "ghost"}
                                onClick={() => this.selectComposeType("16")}>
                          <div className="topBox">
                            16X
                          </div>
                          <div className="bottomBox">
                            <span>4GB&nbsp;内存</span><br />
                            <span>1CPU</span>
                          </div>
                        </Button>
                      </li>
                      <li className="composeDetail">
                        <Button type={composeType == "32" ? "primary" : "ghost"}
                                onClick={() => this.selectComposeType("32")}>
                          <div className="topBox">
                            32X
                          </div>
                          <div className="bottomBox">
                            <span>8GB&nbsp;内存</span><br />
                            <span>2CPU</span>
                          </div>
                        </Button>
                      </li>
                      <div style={{ clear: "both" }}></div>
                    </ul>
                    <div style={{ clear: "both" }}></div>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col style={{color: '#a0a0a0',textAlign: 'left',marginTop: '20px'}}>注: 重新选择配置 , 保存后系统将重启该服务的所有实例 . </Col>
            </Row>
          </div>
        </Modal>
      )
    } else {
      return (<div></div>)
    }
  }
}