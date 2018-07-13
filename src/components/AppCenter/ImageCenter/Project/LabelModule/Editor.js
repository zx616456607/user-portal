import React, { Component } from 'react'
import { Row, Col } from 'antd'

class Editor extends Component {
  render() {
    const { current, onOk, onCancel } = this.props
    return (
      <div className="editor">
        <Row>
          <Col span={18}>{JSON.stringify(current)}</Col>
          <Col span={6}>
            <Button type="primary" size="large" onClick={onCancel}><i className='fa fa-tag'/>保存</Button>
            <Button type="ghost" size="large" onClick={onOk}><i className='fa fa-refresh'/>取消</Button>
          </Col>
        </Row>
      </div>
    )
  }
}
export default Editor