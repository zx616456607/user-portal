/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cleaning Tool component
 *
 * v0.1 - 2017-8-31
 * @author ZhangChengZheng
 */

import React, { Component } from 'react'
import { Tabs, Select, Form, Button, Modal, Icon, Timeline, Row, Col, Spin } from 'antd'
import { connect } from 'react-redux'
import { browserHistory, Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/index.less'
import Title from '../../Title'
import CleaningToolImg from '../../../../static/img/setting/cleaningTool.png'
import NotificationHandler from '../../../components/Notification'
import ReactEcharts from 'echarts-for-react'
import {
  startClean, getCleanLogs, cleanSystemLogs, cleanMonitor,
  getSystemCleanLogs, getMonitorSetting, getSystemCleanStatus
} from '../../../actions/clean'
import { formatDate } from '../../../common/tools'
import classNames from 'classnames'

const TabPane = Tabs.TabPane
const Option = Select.Option
const FormItem = Form.Item
const TimelineItem = Timeline.Item

class CleaningTool extends Component {
  constructor(props) {
    super(props)
    this.renderLogsList = this.renderLogsList.bind(this)
    this.renderTips = this.renderTips.bind(this)
    this.state = {
      cleanModal: false,
      cleanSystemLogStatus: undefined,
      cleanCicdStatus: undefined,
      editMonitoringData: false,
      monitorBtnLoading: false,
      mirrorImageEdit: true,
      accomplish: true,
      pending: false,
      forbid: false,
      systemLogs: [],
      cicdLogs: [],
      logsLoading: false,
      activeKey: 'systemLog'
    }
  }
  componentWillMount() {
    this.getSystemLogs()
    this.getCicdLogs()
    this.getMonitorSetting()
  }
  getMonitorSetting() {
    const { getMonitorSetting, form } = this.props
    const { setFieldsValue } = form
    getMonitorSetting({
      success: {
        func: res => {
          this.setState({
            monitorTime: res.data.substring(0, res.data.length - 1)
          })
          setFieldsValue({'monitoringDataTime': res.data.substring(0, res.data.length - 1)})
        }
      }
    })
  }
  getCicdLogs() {
    const { getCleanLogs } = this.props
    this.setState({
      logsLoading: true
    })
    getCleanLogs({
      sort: 'd,create_time',
      from: 0,
      size: 5,
    }, {
      success: {
        func: res => {
          this.setState({
            cicdLogs: res.data.body,
            logsLoading: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            cicdLogs: [],
            logsLoading: false
          })
        },
        isAsync: true
      },
      finally: {
        func: () => {
          this.setState({
            logsLoading: false
          })
        }
      }
    })
  }
  getSystemLogs() {
    const { getSystemCleanLogs } = this.props
    this.setState({
      logsLoading: true
    })
    getSystemCleanLogs({
      sort: 'd,create_time'
    }, {
      from: 0,
      size: 5,
    }, {
      success: {
        func: res => {
          this.setState({
            systemLogs: res.data.data,
            logsLoading: false
          })
        },
        isAsync: true
      },
      failed: {
        func: () => {
          this.setState({
            systemLogs: [],
            logsLoading: false
          })
        },
        isAsync: true
      },
      finally: {
        func: () => {
          this.setState({
            logsLoading: false
          })
        }
      }
    })
  }
  cleaningSystemLog(){
    const { form } = this.props
    const validateArray = ['systemLogTime']
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      this.setState({
        currentType: 'systemLogs',
        cleanModal: true,
      })
    })
  }

  confirmCleanSystemLog(){
    const { currentType } = this.state
    this.setState({
      cleanModal: false
    })
    switch(currentType) {
      case 'cicd':
        this.cleanCicd()
        break;
      case 'systemLogs':
        this.cleanSystem()
    }
  }

  cleanCicd() {
    const { form, startClean, userName } = this.props
    const time = form.getFieldValue("cache")
    const cleanRange = parseInt(time)
    let notify = new NotificationHandler()
    this.setState({
      cleanCicdStatus: 'cleaning'
    })
    notify.spin('CICD手动清理中')
    startClean({
      cicd_clean: {
        meta: {
          automatic: false,
          cleaner: userName,
          target: "cicd_clean",
          type: "manual"
        },
        spec: {
          cron: '',
          scope: cleanRange
        }
      }
    }, {
      success: {
        func: () => {
          notify.close()
          notify.success('CICD手动清理成功')
          this.setState({
            cleanCicdStatus: true,
          })
          this.getCicdLogs()
        },
        isAsync: true
      },
      failed: {
        func: res => {
          if (res.message === 'RUNNING') {
            notify.close()
            notify.info('有用户正在操作，请稍后重试')
          } else {
            notify.close()
            notify.error('CICD手动清理失败')
          }
          this.setState({
            cleanCicdStatus: false,
          })
        }
      }
    })
  }

  cleanSystem() {
    const { form, cleanSystemLogs } = this.props
    const time = form.getFieldValue("systemLogTime")
    const time_range = parseInt(time)
    let notify = new NotificationHandler()
    this.setState({
      cleanSystemLogStatus: 'cleaning'
    })
    notify.spin('服务日志手动清理中')
    cleanSystemLogs({
      type: 0,
      time_range,
    } ,null, {
      success: {
        func: res => {
          if (res.data) {
            notify.close()
            notify.success('服务日志手动清理成功')
            this.setState({
              cleanSystemLogStatus: true
            })
            this.getSystemLogs()
          }
        },
        isAsync: true
      },
      failed: {
        func: () => {
          notify.close()
          notify.error('服务日志手动清理失败')
          this.setState({
            cleanSystemLogStatus: false
          })
        }
      }
    })
  }
  cancelEditMonitoringData(){
    const { form } = this.props
    const { setFieldsValue } = form
    const { monitorTime } = this.state
    this.setState({
      editMonitoringData: false,
    })
    setFieldsValue({'monitoringDataTime': monitorTime})
  }

  saveEditMonitoringData(){
    const { cleanMonitor, form } = this.props
    const { setFieldsValue } = form
    const { monitorBtnLoading, monitorTime } = this.state
    const validateArray = ['monitoringDataTime']
    form.validateFields(validateArray, (errors, values) => {
      if(!!errors){
        return
      }
      this.setState({
        monitorBtnLoading: true
      })
      const time = values.monitoringDataTime
      cleanMonitor({
        duration: `${time}h`
      }, {
        success: {
          func: () => {
            this.setState({
              editMonitoringData: false,
              monitorBtnLoading: false
            })
            this.getMonitorSetting()
          },
          isAsync: true
        },
        failed: {
          func: () => {
            this.setState({
              editMonitoringData: false,
              monitorBtnLoading: false
            })
            setFieldsValue({'monitoringDataTime': monitorTime})
          }
        }
      })
    })
  }

  cleaningStopContainer(){
    const { form } = this.props
    const validateArray = ['stopContainer']
    form.validateFields(validateArray, (errors) => {
      if(!!errors){
        return
      }
      this.setState({
        cleanModal: true
      })
    })
  }

  cleaningCicd(){
    const { form } = this.props
    const validateArray = ['cache']
    form.validateFields(validateArray, (errors) => {
      if(!!errors){
        return
      }
      this.setState({
        currentType: 'cicd',
        cleanModal: true
      })
    })
  }

  saveMirrorImage(){
    const { accomplish, pending, forbid } = this.state
    const { form } = this.props

    if(accomplish){
      form.setFieldsValue({
        'pendingTime': 1
      })
      this.setState({
        mirrorImageEdit: true,
      })
      return
    }
    if(pending){
      const time = form.getFieldValue('pendingTime')
      this.setState({
        mirrorImageEdit: true,
      })
      return
    }
    form.setFieldsValue({
      'pendingTime': 1
    })
    this.setState({
      mirrorImageEdit: true,
    })
  }

  renderLogsList(){
    const { activeKey, logsLoading, systemLogs, cicdLogs } = this.state
    let copyLog = activeKey === 'systemLog' ? systemLogs : cicdLogs
    let tailText = activeKey === 'systemLog' ? ' 个文件' : 'MB 垃圾'
    function formatTotal(item) {
      if (activeKey === 'cache') {
        return ((item.total) / (1024 * 1024)).toFixed(2)
      }
      return item.detail[0].total
    }
    if (logsLoading) {
      return(
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (activeKey === 'monitoringData') {
      return <div style={{ textAlign: 'center' }}>监控数据无清理记录</div>
    }
    if (!copyLog || !copyLog.length) {
      return <div style={{ textAlign: 'center' }}>{ activeKey !== 'monitoringData' ? '暂无数据' : ''}</div>
    }
    return(
      <Timeline>
        {
          copyLog && copyLog.length && copyLog.map((item, index) => {
            return (
              <TimelineItem key={item.id} color={index === 0 ? 'green' : '#e9e9e9'}>
                <Row className={classNames({'successColor': index === 0})}>
                  <Col span={20}>{index === 0 ? `上次清理 ${formatTotal(item)}${tailText}` : `清理 ${formatTotal(item)}${tailText}`}</Col>
                  <Col className="time_item" span={4}>{formatDate(item.createTime, 'MM-DD')}</Col>
                </Row>
              </TimelineItem>
            )
          })
        }
      </Timeline>
    )
  }

  cleaningMirrorImage(type){
    switch(type){
      case 'pending':
        this.setState({
          accomplish: false,
          pending: true,
          forbid: false,
          mirrorImageEdit: false,
        })
        return
      case 'forbid':
        this.setState({
          accomplish: false,
          pending: false,
          forbid: true,
          mirrorImageEdit: false,
        })
        return
      default:
      case 'accomplish':
        this.setState({
          accomplish: true,
          pending: false,
          forbid: false,
          mirrorImageEdit: false,
        })
        return
    }
  }

  renderTips(){
    const { accomplish, pending, forbid } = this.state
    if(accomplish){
      return <span>后端运行垃圾回收直至移除所有无标签镜像</span>
    }
    if(pending){
      return <span>后端运行垃圾回收持续上方设置时长后结束</span>
    }
    if(forbid){
      return <span>后端运行垃圾回收无效，将不会移除无标签镜像</span>
    }
    return <span>后端运行垃圾回收直至移除所有无标签镜像</span>
  }

  renderSystemTab() {
    const { getFieldProps } = this.props.form
    const { cleanSystemLogStatus, systemLogs } = this.state
    switch(cleanSystemLogStatus) {
      case 'cleaning':
        return (
          <div className='done_box'>
            <div className='tips'>
              您可以静待清理完成，也可以清理其他垃圾或者离开清理工具
            </div>
            <Button size="large" type="primary" loading>清理中</Button>
          </div>
        )
      break;
      case true:
        return (
          <div className='done_box'>
            <div className='tips'>
              清理已提交，{/*此次清理 <span className='number'>{systemLogs && systemLogs[0] && systemLogs[0].total}</span> 个文件，*/}查看 <Link to="/setting/cleaningTool/cleaningRecord?type=system">清理记录</Link>
            </div>
            <Button size="large" type="primary" onClick={() => this.setState({cleanSystemLogStatus: undefined})}>完成</Button>
          </div>
        )
      break;
      case false:
        return (
          <div className='done_box'>
            <div className='tips'>
              清理失败
            </div>
            <Button size="large" type="primary" onClick={() => this.setState({cleanSystemLogStatus: undefined})}>返回</Button>
          </div>
        )
      break;
      default:
        return (
          <div className='handle_box'>
            <div className='tips'>您可以根据数据时效选择需要清理的文件范围!</div>
            <FormItem className='time_select'>
              <Select
                placeholder="选择删除服务日志时间"
                size="large"
                className='select_box'
                {...getFieldProps('systemLogTime',{
                  rules: [{required: true, message: '请选择删除服务日志时间'}]
                })}
              >
                <Option key="system_15" value="15">清除15天前数据（推荐）</Option>
                <Option key="system_90" value="90">清除3月前数据</Option>
                <Option key="system_30" value="30">清除1月前数据</Option>
                <Option key="system_7" value="7">清除7天前数据</Option>
                <Option key="system_3" value="3">清除3天前数据</Option>
                <Option key="system_1" value="1">清除1天前数据</Option>
                <Option key="system_0" value="0">清除所有数据</Option>
              </Select>
            </FormItem>
            <div>
              <Button size="large" type="primary" onClick={() => this.cleaningSystemLog()}>清理</Button>
            </div>
          </div>
        )
    }
  }

/*  renderCicdTab() {  LOT-2873【【前端任务】- 插件管理去掉 prune-tool 编排 & CI/CD 缓存的清理】
    const { getFieldProps } = this.props.form
    const { cleanCicdStatus, cicdLogs } = this.state
    switch(cleanCicdStatus) {
      case 'cleaning':
        return (
          <div className='done_box'>
            <div className='tips'>
              您可以静待清理完成，也可以清理其他垃圾或者离开清理工具
            </div>
            <Button size="large" type="primary" loading>清理中</Button>
          </div>
        )
        break;
      case true:
        return (
          <div className='done_box'>
            <div className='tips'>
              清理完成，此次清理 <span className='number'>{((cicdLogs && cicdLogs[0] && cicdLogs[0].total) / (1024 * 1024)).toFixed(2)}</span> MB，查看 <Link to="/setting/cleaningTool/cleaningRecord?type=cicd">清理记录</Link>
            </div>
            <Button size="large" type="primary" onClick={() => this.setState({cleanCicdStatus: undefined})}>完成</Button>
          </div>
        )
      break;
      case false:
        return (
          <div className='done_box'>
            <div className='tips'>
              清理失败
            </div>
            <Button size="large" type="primary" onClick={() => this.setState({cleanCicdStatus: undefined})}>返回</Button>
          </div>
        )
      break;
      default:
        return(
          <div className='handle_box'>
            <div className='tips'>您可以根据数据时效选择需要清理的文件范围!</div>
            <FormItem className='time_select'>
              <Select
                placeholder="请选择删除缓存时间"
                size="large"
                className='select_box'
                {...getFieldProps('cache',{
                  rules: [{required: true, message: '请选择删除缓存时间'}]
                })}
              >
                <Option key="cicd_15" value='15'>清除15天前数据（推荐）</Option>
                <Option key="cicd_90" value='90'>清除3月前数据</Option>
                <Option key="cicd_30" value='30'>清除1月前数据</Option>
                <Option key="cicd_7" value='7'>清除7天前数据</Option>
                <Option key="cicd_3" value='3'>清除3天前数据</Option>
                <Option key="cicd_1" value='1'>清除1天前数据</Option>
                <Option key="cicd_0" value='0'>清除所有数据</Option>
              </Select>
            </FormItem>
            <div>
              <Button size="large" type="primary" onClick={() => this.cleaningCicd()}>清理</Button>
            </div>
          </div>
        )
    }
  }*/
  tabChange(tab){
    this.setState({
      activeKey: tab
    })
    if (tab === 'systemLog') {
      this.getSystemLogs()
      //this.systemCleanStatus()
    } else if (tab === 'cache') {
      this.getCicdLogs()
    }
  }
  render() {
    const {
      editMonitoringData,
      monitorBtnLoading,
      accomplish, pending,
      forbid, mirrorImageEdit,
      cicdLogs, systemLogs, activeKey,
      cleanSystemLogStatus, cleanCicdStatus
    } = this.state
    const { form } = this.props
    const { getFieldProps } = form
    const systemOption = {
      color: ['#3398DB'],
      tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
          type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        top: '30px',
        left: '3%',
        right: '4%',
        bottom: '30px',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          data : ['服务日志'],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis : [
        {
          type : 'value',
          name: '个',
        }
      ],
      series : [
        {
          name:'最近清除',
          type:'bar',
          barWidth: '40px',
          data:[systemLogs && systemLogs.length && systemLogs[0].detail[0].total || 0]
        }
      ]
    };
    const cicdOption = {
      color: ['#3398DB'],
      tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
          type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        top: '30px',
        left: '3%',
        right: '4%',
        bottom: '30px',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          data : ['CI/CD缓存'],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis : [
        {
          type : 'value',
          name: 'MB',
        }
      ],
      series : [
        {
          name:'最近清除',
          type:'bar',
          barWidth: '40px',
          data:[cicdLogs && cicdLogs.length && (cicdLogs[0].total / (1024 * 1024)).toFixed(2) || 0]
        }
      ]
    };
    return(
      <QueueAnim className='cleaningTool' type="right">
        <Title title="清理工具"/>
        <div id='cleaning_tool' key="cleaning_tool">
          <div className='tool_header'>
            清理工具
          </div>
          <div className='tool_tabs'>
            <Tabs
              onChange={this.tabChange.bind(this)}
              activeKey={activeKey}
              tabBarExtraContent={<Button
                type="ghost"
                size="large"
                style={{margin: '12px 20px 0 0'}}
                onClick={() => browserHistory.push(`/setting/cleaningTool/timingClean`)}
              >
                定时清理
              </Button>}
            >
              <TabPane tab="服务日志" key="systemLog">
                <div className='img_box'>
                  <img className={classNames({'cleaning': cleanSystemLogStatus === 'cleaning'})} src={CleaningToolImg}/>
                </div>
                {
                  this.renderSystemTab()
                }
              </TabPane>
              {/*<TabPane tab="停止容器" key="stopContainer">
                <div className='img_box'>
                  <img src={CleaningToolImg} alt=""/>
                </div>
                <div className='handle_box'>
                  <div className='tips'>您可以根据选择清理未正常运行的容器!</div>
                  <FormItem className='time_select'>
                    <Select
                      placeholder="请选择要停止的容器"
                      size="large"
                      className='select_box'
                      {...getFieldProps('stopContainer',{
                        rules: [{required: true, message: '请选择要停止的容器'}]
                      })}
                    >
                      <Option key="3" value="3">全选</Option>
                      <Option key="0" value="0">pending超时</Option>
                      <Option key="1" value="1">已经停止</Option>
                      <Option key="2" value="2">不断重启</Option>
                    </Select>
                  </FormItem>
                  <div>
                    <Button size="large" type="primary" onClick={() => this.cleaningStopContainer()}>清理</Button>
                  </div>
                </div>
              </TabPane>*/}
{/*              <TabPane tab="CI/CD缓存" key="cache">  LOT-2873【【前端任务】- 插件管理去掉 prune-tool 编排 & CI/CD 缓存的清理】
                <div className='img_box'>
                  <img className={classNames({'cleaning': cleanCicdStatus === 'cleaning'})} src={CleaningToolImg}/>
                </div>
                {
                  this.renderCicdTab()
                }
              </TabPane>*/}
              <TabPane tab="监控数据" key="monitoringData">
                <div className='img_box'>
                  <img className={classNames({'cleaning': monitorBtnLoading})} src={CleaningToolImg}/>
                </div>
                <div className='handle_box'>
                  <div className='tips'>您可以根据数据时效配置数据保留时间！</div>
                  <FormItem className='time_select'>
                    <Select
                      placeholder="选择数据保留时间"
                      size="large"
                      className='select_box'
                      disabled={!editMonitoringData}
                      {...getFieldProps('monitoringDataTime',{
                        initialValue: "168",
                        rules: [{required: true, message: '请选择数据保留时间'}],
                      })}
                    >
                      <Option key="monitor_0" value="168">保留7天</Option>
                      <Option key="monitor_1" value="360">保留15天</Option>
                      <Option key="monitor_2" value="720">保留30天</Option>
                      <Option key="monitor_3" value="1440">保留60天</Option>
                      {/*<Option key="4" value="4">永久保留</Option>*/}
                    </Select>
                  </FormItem>
                  <div>
                    {
                      editMonitoringData
                      ? <div>
                          <Button
                            size="large"
                            onClick={() => this.cancelEditMonitoringData()}
                            style={{marginRight: 8}}
                          >
                            取消
                          </Button>
                          <Button
                            size="large"
                            type="primary"
                            loading={monitorBtnLoading}
                            onClick={() => this.saveEditMonitoringData()}
                          >
                            保存
                          </Button>
                        </div>
                      : <Button
                          size="large"
                          type="primary"
                          onClick={() => this.setState({editMonitoringData: true})}
                        >
                          编辑
                        </Button>
                    }
                  </div>
                </div>
              </TabPane>
              {/*<TabPane tab="镜像" key="mirrorImage">
                <div className='img_box'>
                  <img src={CleaningToolImg} alt=""/>
                </div>
                <div className='handle_box'>
                  <div className='tips'>您可以在存储后端运行垃圾回收来移除无标签镜像!</div>
                  <Button.Group>
                    <Button
                      type={accomplish ? 'primary' : 'ghost'}
                      onClick={() => this.cleaningMirrorImage('accomplish')}
                      className='until_done'
                    >
                      直到完成
                    </Button>
                    <Button
                      type={pending ? 'primary' : 'ghost'}
                      onClick={() => this.cleaningMirrorImage('pending')}
                      className='duration'
                    >
                      持续
                      <InputNumber
                        min={1}
                        style={{width: '55px', margin: '0 8px'}}
                        {...getFieldProps('pendingTime', {
                          initialValue: 1
                        })}
                      />
                      分钟
                    </Button>
                    <Button
                      type={forbid ? 'primary' : 'ghost'}
                      onClick={() => this.cleaningMirrorImage('forbid')}
                      className='forbiden_use'
                    >
                      禁止使用
                    </Button>
                  </Button.Group>
                  <div className='checkBox'></div>
                  <div className='slected_tips'>{this.renderTips()}</div>
                  <div>
                    <Button
                      size="large"
                      type="primary"
                      disabled={mirrorImageEdit}
                      onClick={() => this.saveMirrorImage()}
                    >
                      保存
                    </Button>
                  </div>
                </div>
              </TabPane>*/}
            </Tabs>
          </div>

          <div className='tool_echarts'>
            <Row>
              <Col span="12">
                <div className='left_box'>
                  <div className='header'>最近一次清理详情</div>
                  <ReactEcharts
                    option={systemOption}
                    style={{ height: '280px'}}
                  />
                </div>
              </Col>
              <Col span="12" className='right_box_col'>
                <div className='right_box'>
                  <div className='header'>成就清单</div>
                  <div className='logs_list'>
                    {this.renderLogsList()}
                  </div>
                  <div className='log_record'>
                    <span
                      className='go_record'
                      onClick={() => browserHistory.push(`/setting/cleaningTool/cleaningRecord?type=${activeKey === 'cache' ? 'cicd' : 'system'}`)}
                    >
                      清理记录>>
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <Modal
            title="确认清理"
            visible={this.state.cleanModal}
            closable={true}
            onOk={() => this.confirmCleanSystemLog()}
            onCancel={() => this.setState({ cleanModal: false })}
            width="570px"
            maskClosable={false}
            wrapClassName="cleanTool_systemLog"
          >
            <div>
              <Icon type="question-circle-o" className='icon_margin'/>数据清除之后无法恢复，是否确认清理？
            </div>
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

CleaningTool = Form.create({})(CleaningTool)

function mapStateToProp(state, props) {
  const { loginUser } = state.entities
  const { info } = loginUser
  const { userName } = info
  return {
    userName
  }
}

export default connect(mapStateToProp, {
  startClean,
  getCleanLogs,
  cleanSystemLogs,
  cleanMonitor,
  getSystemCleanLogs,
  getMonitorSetting,
  getSystemCleanStatus
})(CleaningTool)
