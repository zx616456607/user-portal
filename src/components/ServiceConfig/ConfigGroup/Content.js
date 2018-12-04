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
import { injectIntl } from 'react-intl'
import { Timeline, Row, Icon, Button, Tooltip, Modal } from 'antd'
import secretIntl from '../intl/secretsIntl'
import indexIntl from '../intl/indexIntl'

class ConfigGroupContent extends React.Component {
  state = {
    moreModalVisible: false,
    moreUseArray: [],
    moreKey: undefined,
  }

  render() {
    const {
      group, openUpdateConfigFileModal, removeKeyFromSecret,
      secretOnUse, intl
    } = this.props
    const { formatMessage } = intl
    let { name, data, createdAt } = group
    if(!data) data = {}
    const { moreModalVisible, moreUseArray, moreKey } = this.state
    if (Object.keys(data).length === 0) {
      return (
        <div className='li' style={{ lineHeight: '60px', height: '10px' }}>
        {formatMessage(secretIntl.noSecretHint)}
        </div>
      )
    }
    let appNameStr = ''
    return (
      <Row id="secret_content" className='file-list'>
        <Timeline>
          {
            Object.keys(data).map(key => {
              const useArray = secretOnUse[key] || []
              const useService = new Set()
              const configFileItem = data[key]
              if(!configFileItem.name) configFileItem.name = key
              useArray.forEach(use => {
                useService.add(use.serviceName)
              })
              const useServiceSum = Array.from(useService).length
              let useElement
              if (useArray.length === 0) {
                useElement = <td style={{ textAlign: 'center' }}>
                  <div>{formatMessage(indexIntl.noVolumeMounts)}</div>
                </td>
              } else {
                const secretServiceMap = <span>
                  {
                    useArray[0].mountPath &&
                    formatMessage(secretIntl.mountPath, { path: useArray[0].mountPath })
                  }
                  &nbsp;&nbsp;
                  {
                    useArray[0].env.length > 0 &&
                    formatMessage(secretIntl.mountPath, { env: useArray[0].env.join(', ') })
                  }
                </span>
                useElement = <td>
                  <div className="li">
                    <div>
                      {formatMessage(indexIntl.appTitle)}
                      {
                        useArray.map(item => {
                          if (!(appNameStr.indexOf(item.appName) > -1)) {
                            appNameStr += item.appName
                            return <Link to={`/app_manage/detail/${item.appName}`}>
                              {item.appName},
                            </Link>
                          }
                        })
                      }
                    </div>
                    <div>
                      {formatMessage(indexIntl.serviceTitle)}
                      {
                        useArray.map(item => <Link to={`/app_manage/service?serName=${item.serviceName}`}>
                          {item.serviceName},
                          </Link>
                        )
                      }
                    </div>
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
                          <td className="title" style={{ padding: '15px' }}>
                            {
                              configFileItem.defaultBranch || configFileItem.projectName ?
                                <div style={{ width: '160px' }}>
                                  <div>
                                    <Tooltip title={configFileItem.name} placement="topLeft">
                                      <div className="textoverflow">
                                        <i className="fa fa-gitlab" aria-hidden="true" style={{ marginRight: '10px', marginTop: '3px' }}></i>
                                        {configFileItem.name}
                                      </div>
                                    </Tooltip>
                                  </div>
                                  <div style={{ color: "#999", fontSize: "12px" }}>
                                    {configFileItem.projectName && <Tooltip title={configFileItem.projectName} placement="left">
                                      <div><span>{formatMessage(indexIntl.projectName)}</span><span className="textoverflow projectName">
                                        {configFileItem.projectName}
                                      </span></div>
                                    </Tooltip>}
                                    {configFileItem.defaultBranch && <Tooltip title={configFileItem.defaultBranch} placement="left">
                                      <div><span>{formatMessage(indexIntl.branchName)} </span><span className="textoverflow branchName">{configFileItem.defaultBranch}</span></div>
                                    </Tooltip>}
                                  </div>
                                </div>
                                :
                                <div style={{ width: '160px' }} className='textoverflow'>
                                  <Icon type='file-text' style={{ marginRight: '10px',float:'left', marginTop: '3px' }} />
                                  <Tooltip title={configFileItem.name} placement="topLeft">
                                    <div className="textoverflow">{configFileItem.name}</div>
                                  </Tooltip>
                                </div>

                            }
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
                              {formatMessage(indexIntl.associatedService)}&nbsp;
                              <span className='node-number'>
                              {useServiceSum + ''}
                              </span>
                            </div>
                            <div className='lis'>{formatMessage(indexIntl.mapMode)}</div>
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
                                <a>{formatMessage(indexIntl.loadMore)}</a>
                              </div>
                            </td>
                          }
                        </tr>
                      </tbody>
                    </table>
                    <Modal
                      title={formatMessage(secretIntl.viewMoreModalTitle, { key: moreKey })}
                      wrapClassName="server-check-modal"
                      visible={moreModalVisible}
                      onCancel={() => { this.setState({ moreModalVisible: false }) }}
                      onOk={() => { this.setState({ moreModalVisible: false }) }}
                    >
                      <div className="check-config-head">
                        <div className="span4">{formatMessage(indexIntl.serviceName)}</div>
                        <div className="span6">{formatMessage(indexIntl.mapMode)}</div>
                      </div>
                        {/*查看更多-关联服务列表-start*/}
                        {moreUseArray.map((item, index) => {
                          const secretServiceMap = <span>
                            {
                              item.mountPath &&
                              formatMessage(secretIntl.mountPathContent, {path:item.mountPath})
                            }
                            &nbsp;&nbsp;
                            {
                              item.env.length > 0 &&
                              formatMessage(secretIntl.EnvContent, {env:item.env.join(', ') })
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
export default injectIntl(ConfigGroupContent, {
  withRef: true,
})
