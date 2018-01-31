/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * config group: content
 *
 * v0.1 - 2018-01-30
 * @author Zhangpc
 */

import React from 'react'
import { Timeline, Row, Icon, Button, Tooltip } from 'antd'

export default class ConfigGroupContent extends React.Component {
  render() {
    const { group, openUpdateConfigFileModal, removeKeyFromSecret } = this.props
    const { name, data = {}, createdAt } = group
    if (Object.keys(data).length === 0) {
      return (
        <div className='li' style={{ lineHeight: '60px', height: '10px' }}>
        未添加配置文件
        </div>
      )
    }
    return (
      <Row className='file-list'>
        <Timeline>
          {
            Object.keys(data).map(key => (
              <Timeline.Item key={key}>
                <Row className='file-item'>
                  <div className='line'></div>
                  <table>
                    <tbody>
                      <tr>
                        <td style={{ padding: '15px' }}>
                          <div style={{ width: '160px' }} className='textoverflow'><Icon type='file-text' style={{ marginRight: '10px',float:'left' }} />
                            <Tooltip title={key} placement="topLeft">
                              <div style={{float:'left',width:'130px'}} className="textoverflow">
                                {key}
                              </div>
                            </Tooltip>
                          </div>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <Button
                            type='primary'
                            style={{ height: '30px', padding: '0 9px' }}
                            onClick={openUpdateConfigFileModal.bind(this, name, key, data[key])}
                          >
                            <Icon type='edit' />
                          </Button>
                          <Button
                            type='ghost'
                            onClick={removeKeyFromSecret.bind(this, name, key)}
                            style={{ marginLeft: '10px', height: '30px', padding: '0 9px', backgroundColor: '#fff' }}
                            className='config-cross'
                          >
                            <Icon type='cross' />
                          </Button>
                        </td>
                        <td style={{ width: '130px' }}>
                          <div className='li'>
                            关联服务&nbsp;
                            <span className='node-number'>
                            0
                            </span>
                          </div>
                          <div className='lis'>挂载路径</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Row>
              </Timeline.Item>
            ))
          }
        </Timeline>
      </Row>
    )
  }
}
