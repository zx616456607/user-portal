/**
 * Created by Administrator on 2016/9/21.
 */
import React, { Component } from 'react'
import "./style/StorageBind.less"
import { Card, Row, Col,Icon } from 'antd';
import { Timeline } from 'antd';

export default class StorageBind extends Component {
  constructor(props) {
    super(props)
  }
  render(){
    return (
      <div id="StorageBind">
        <Row>
          <Col>
            <Timeline>
              <Timeline.Item>
                <Card title={`应用: my_app`} style={{ width: 300 }} bordered={false}>
                  <div className="container">
                    <div className="container-ico">
                      <i className="fa fa-server"></i>
                    </div>
                    <p>容器: my_container</p>
                  </div>
                </Card>
                <div className="point">
                  <span>挂载点:var/data/_123321test/volume</span>
                </div>
              </Timeline.Item>
              <Timeline.Item color="#5bb95b">
                <div className="volume">
                  <div className="volume-ico">
                    <Icon type="hdd" />
                  </div>
                  <p>存储卷: my-volume</p>
                </div>
              </Timeline.Item>
            </Timeline>
          </Col>
        </Row>
      </div>
    )
  }
}

