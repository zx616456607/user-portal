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
import { Link } from 'react-router'
import { Timeline, Row, Icon, Button, Tooltip, Modal } from 'antd'

export default class ConfigGroupContent extends React.Component {
  state = {
    moreModalVisible: false,
    moreUseArray: [],
    moreKey: undefined,
  }

  render() {
    const {
      group, openUpdateConfigFileModal, removeKeyFromSecret,
      secretOnUse,
    } = this.props
    const { name, data = [], createdAt } = group
    const { moreModalVisible, moreUseArray, moreKey } = this.state
    if (data.length === 0) {
      return (
        <div className='li' style={{ lineHeight: '60px', height: '10px' }}>
        未添加加密对象
        </div>
      )
    }
    return (
      <Row className='file-list'>
        <Timeline>
          {
            data.map(item => {
              const key = item.name
              const useArray = secretOnUse[key] || []
              const useService = new Set()
              useArray.forEach(use => {
                useService.add(use.serviceName)
              })
              const useServiceSum = Array.from(useService).length
              let useElement
              if (useArray.length === 0) {
                useElement = <td style={{ textAlign: 'center' }}>
                  <div>暂无挂载</div>
                </td>
              } else {
                const secretServiceMap = <span>
                  {
                    useArray[0].mountPath &&
                    useArray[0].mountPath + '（挂载路径）'
                  }
                  &nbsp;&nbsp;
                  {
                    useArray[0].env.length > 0 &&
                    useArray[0].env.join(', ') + '（环境变量）'
                  }
                </span>
                useElement = <td>
                  <div className="li">
                    应用：
                    <Link to={`/app_manage/detail/${useArray[0].appName}`}>
                    {useArray[0].appName}
                    </Link>，
                    服务：
                    <Link to={`/app_manage/service?serName=${useArray[0].serviceName}`}>
                    {useArray[0].serviceName}
                    </Link>
                  </div>
                  <Tooltip title={secretServiceMap}>
                    <div className='lis textoverflow'>
                      {secretServiceMap}
                    </div>
                  </Tooltip>
                </td>
              }
              return (
                <Timeline.Item key={key}>
                  <Row className='file-item'>
                    <div className='line'></div>
                    <table>
                      <tbody>
                        <tr>
                          <td style={{ padding: '15px' }}>
                            <div style={{ width: '160px' }} className='textoverflow'>
                              <Icon type='file-text' style={{ marginRight: '10px',float:'left' }} />
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
                              onClick={openUpdateConfigFileModal.bind(this, name, key)}
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
                              {useServiceSum + ''}
                              </span>
                            </div>
                            <div className='lis'>映射方式</div>
                          </td>
                          {useElement}
                          {
                            useArray.length > 1 &&
                            <td style={{ textAlign: 'center' }}>
                              <div
                                style={{cursor:'pointer'}}
                                onClick={
                                  () => this.setState({
                                    moreModalVisible: true,
                                    moreUseArray: useArray.slice(1),
                                    moreKey: key,
                                  })
                                }
                              >
                                <a>查看更多</a>
                              </div>
                            </td>
                          }
                        </tr>
                      </tbody>
                    </table>
                    <Modal
                      title={`加密对象 ${moreKey}`}
                      wrapClassName="server-check-modal"
                      visible={moreModalVisible}
                      onCancel={() => { this.setState({ moreModalVisible: false }) }}
                      onOk={() => { this.setState({ moreModalVisible: false }) }}
                    >
                      <div className="check-config-head">
                        <div className="span4">服务名称</div>
                        <div className="span6">映射方式</div>
                      </div>
                        {/*查看更多-关联服务列表-start*/}
                        {moreUseArray.map((item, index) => {
                          const secretServiceMap = <span>
                            {
                              item.mountPath &&
                              item.mountPath + '（挂载路径）'
                            }
                            &nbsp;&nbsp;
                            {
                              item.env.length > 0 &&
                              item.env.join(', ') + '（环境变量）'
                            }
                          </span>
                          return (
                            <div className="check-config" key={index}>
                              <div className="span4">
                                <Link to={`/app_manage/service?serName=${item.serviceName}`}>
                                  {item.serviceName}
                                </Link>
                              </div>
                              <div className="span6 textoverflow">
                                <Tooltip title={secretServiceMap} placement="topLeft">
                                  {secretServiceMap}
                                </Tooltip>
                              </div>
                            </div>
                          )
                        })}
                        {/*查看更多-关联服务列表*-end*/}
                    </Modal>
                  </Row>
                </Timeline.Item>
              )}
            )
          }
        </Timeline>
      </Row>
    )
  }
}
