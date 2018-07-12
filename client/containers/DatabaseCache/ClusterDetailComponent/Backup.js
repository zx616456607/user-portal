/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Backup container
 *
 * v0.1 - 2018-07-12
 * @author zhouhaitao
 */


import React from 'react'
import './style/Backup.less'
import { Button, Row, Col, Collapse } from 'antd'
import { connect } from 'react-redux'
import { calcuDate } from '../../../../src/common/tools'
import { getBackupChainDetail } from '../../../actions/backupChain'

const Panel = Collapse.Panel

class Backup extends React.Component {
  state= {
    data: [
      {
        name: 'xxx备份链',
        id: 1,
        capacity: '100GB',
        pointNum: 3,
        creattTime: '2018-07-11T17:34:54+08:00',
      },
      {
        name: 'fdsfds备份链',
        id: 2,
        capacity: '100GB',
        pointNum: 6,
        creattTime: '2018-07-11T17:34:54+08:00',
      },
    ],
    extendId: '',
    expendKeys: [], // 用expendKeys和keys做对比，keys多出来的那一项是当前展开的
  }
  renderHeader = v => (
    <Row className="list-item" key={v.id}>
      <Col span={4}>
        {v.name}
        <span>"当前链"</span>
      </Col>
      <Col span={4}>{v.capacity}</Col>
      <Col span={4}>备份点{v.pointNum}个</Col>
      <Col span={4}>{calcuDate(v.creattTime)}</Col>
    </Row>)
  expendPanel = keys => {
    if (keys.length === 0) {
      return
    }
    // 当expendKeys中找不到keys中的最后一项，说明第一次展开，去请求数据
    if (this.state.expendKeys.indexOf(keys[keys.length - 1]) < 0) {
      this.setState({
        expendKeys: keys,
      }, () => {
        // 根据expendKey请求备份链下的详细内容
        // const expendKey = keys[keys.length - 1]
        // const expendIndex = this.state.data.findIndex(v => {
        //   return v.id === parseInt(expendKey)
        // })

      })
    }


  }
  render() {
    return <div className="backup">
      <div className="title">备份</div>
      <div className="content">
        <div className="operation">
          <div className="status">
            自动备份：<span style={{ color: '#5cb85c' }}>已开启</span>
          </div>
          <Button type="primary">设置自动备份</Button>
          <Button>手动备份</Button>
        </div>
        <div className="list">
          <Collapse onChange={this.expendPanel}>
            {
              this.state.data.map(v => {
                return <Panel header={this.renderHeader(v)} key={v.id}>
                  <p>

                  </p>
                </Panel>

              })
            }

          </Collapse>
        </div>
      </div>
    </div>
  }
}

const mapStateToProps = state => {
  return state
}

export default connect(mapStateToProps, {
  getBackupChainDetail,
})(Backup)
