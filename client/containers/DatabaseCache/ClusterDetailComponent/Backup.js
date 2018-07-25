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
import { Button, Row, Col, Collapse, Timeline, Menu, Dropdown, Checkbox, Icon, Modal, Radio, Switch, InputNumber, Input, Form } from 'antd'
import { connect } from 'react-redux'
import { calcuDate, formatDate } from '../../../../src/common/tools'
import {
  getbackupChain,
  createBackupChain,
  deleteManualBackupChain,
  checkAutoBackupExist,
  autoBackupSet,
  autoBackupDetele,
  updateAutoBackupSet,
  postRollback,
} from '../../../actions/backupChain'
import { loadDbCacheList } from '../../../../src/actions/database_cache'
import NotificationHandler from '../../../../src/components/Notification'
import rollback from '../../../assets/img/database_cache/rollback.png'
import create from '../../../assets/img/database_cache/new.png'
import BackupStrategy from '../BackupStrategy'

const Panel = Collapse.Panel
const RadioGroup = Radio.Group
const FormItem = Form.Item
const notification = new NotificationHandler()

class Backup extends React.Component {
  state= {
    extendId: '',
    expendKeys: [], // 用expendKeys和keys做对比，keys多出来的那一项是当前展开的
    currentItemUid: '', // 为了标记当前展开的高亮
    autoBackupModalShow: false, // 自动备份弹框
    manualBackupModalShow: false, // 手动备份弹框
    curentChain: '', // 点击手动备份或者备份链的加号，将当前链或者当前点击的备份链信息存到这里
    backupType: 'diffbackup',
    rollBackAlert: false, // 回滚操作弹框显示隐藏
    notYetConfirm: true, // 确认回滚勾选
    delThis: false, // 删除备份链弹框显示隐藏
    backupChain: '', // 当前操作的备份点
    days: [ '0', '1', '2', '3', '4', '5', '6' ],
    daysConvert: [ '1', '2', '3', '4', '5', '6', '0' ],
    autoBackupSwitch: false,
    hadSetAutoBackup: false, // 是否已经设置了自动备份
    hour: '1',
    minutes: '0',
    currentIndex: '0', // 当前选的第几个备份链
  }
  componentDidMount() {
    const { clusterID, database, getbackupChain, databaseInfo } = this.props
    getbackupChain(clusterID, database, databaseInfo.objectMeta.name) // 获取备份链数据
    this.checkAutoBackupExist() // 检查是否有自动备份
  }
  checkAutoBackupExist = () => {
    const { clusterID, database, databaseInfo, checkAutoBackupExist } = this.props
    checkAutoBackupExist(clusterID, database, databaseInfo.objectMeta.name, {
      success: {
        func: res => {
          if (database === 'redis') {
            // 如果有数据或者数据内的schedule字段不为空，说明开启了自动备份。把控制自动备份开关的state置为true
            if (res.data.length !== 0 || res.data[0] && res.data[0].schedule !== '') {
              this.setState({
                autoBackupSwitch: true,
                hadSetAutoBackup: true,
              })
              return
            }
          } else if (database === 'mysql') {
            if (res.data.schedule !== '') {
              this.setState({
                autoBackupSwitch: true,
                hadSetAutoBackup: true,
              })
              return
            }
          }
          this.setState({
            autoBackupSwitch: false,
            hadSetAutoBackup: false,
          })
        },
      },
      failed: {
        func: () => {
          notification.warn('检查是否有自动备份失败')
        },
      },
    }) // 检查是否有自动备份
  }
  renderHeader = (v, i) => {
    return (
      <Row className="list-item-header" ref="header" key={v.name} style={ this.state.currentItemUid === `${v.name}` ? { background: '#fafafa' } : {}}>
        <Col span={6}>
          {v.name}
          { i === 0 && <span style={{ color: '#57c5f7' }}> (当前链)</span> }
        </Col>
        <Col span={4}>总 {(v.size / 1024).toFixed(2)} kb</Col>
        <Col span={4}>备份点 {v.total} 个</Col>
        <Col span={4}>{calcuDate(v.creationTimestamp)}</Col>
      </Row>)
  }
  expendPanel = keys => {
    if (keys.length === 0) {
      this.setState({
        currentItemUid: '',
      })
      return
    }
    // 当expendKeys中找不到keys中的最后一项，说明第一次展开，去请求数据
    if (this.state.expendKeys.indexOf(keys[keys.length - 1]) < 0) {
      this.setState({
        expendKeys: keys,
        currentItemUid: keys[keys.length - 1],
      })

    } else {
      this.setState({
        currentItemUid: '',
      })
    }
  }
  rollBackAlert = () => {
    const confirmRollBack = () => {
      const {
        postRollback, clusterID, databaseInfo, database, getbackupChain,
      } = this.props
      const { name } = this.state.backupChain
      const body = { name }
      postRollback(clusterID, database, name, body, {
        success: {
          func: () => {
            notification.success('回滚操作成功')
            setTimeout(() => getbackupChain(clusterID, database, databaseInfo.objectMeta.name))
          },
        },
        failed: {
          func: () => {
            notification.warn('回滚操作失败')
          },
        },
      })
      this.setState({ rollBackAlert: false })
    }
    const onChange = e => {
      this.setState({
        notYetConfirm: !e.target.checked,
      })

    }
    const content = (
      <Modal
        visible={this.state.rollBackAlert}
        title="回滚操作"
        footer={[
          <Button key="cancel" onClick={() => this.setState({ rollBackAlert: false })}>取消</Button>,
          <Button key="confirm" type="primary" disabled={this.state.notYetConfirm} onClick={confirmRollBack}>确定</Button>,
        ]}
      >
        <div className="rollbackAlertContent">
          <div className="left">
            <Icon type="question-circle-o" />
          </div>
          <div className="right">
            <p>回滚后，此数据库集群将恢复到该备份点的状态。确定回滚操作吗？</p>
            <Checkbox onChange={onChange}>已经对当前数据备份，确定执行回滚操作</Checkbox>
          </div>
        </div>
      </Modal>
    )
    return content
  }
  // 回滚
  rollBack = point => {
    this.setState({
      rollBackAlert: true,
      backupChain: point,
    })
  }
  newDatabase = () => {

  }
  delBackupPointAlert = () => {
    // title要根据备份点的类型来判断到底显示什么类型， 获取backupChain即为当前操作的备份点对象
    const confirmDel = () => {
      const {
        deleteManualBackupChain, clusterID, databaseInfo, database, getbackupChain,
      } = this.props
      const { backupChain } = this.state
      deleteManualBackupChain(clusterID, database, databaseInfo.objectMeta.name, backupChain.name, {
        success: {
          func: () => {
            notification.success('删除成功')
            setTimeout(() => getbackupChain(clusterID, database, databaseInfo.objectMeta.name))
          },
        },
      })
      this.setState({
        delThis: false,
      })
    }
    return (
      <Modal
        visible={this.state.delThis}
        onOk={confirmDel}
        onCancel={() => this.setState({ delThis: false })}
        title="删除备份点"
      >
        <div className="delPoint">
          <Icon type="question-circle-o" />
          此操作不可恢复，确定删除此备份点{this.state.backupChain.name}吗？
        </div>
      </Modal>
    )
  }
  delThis = point => {
    this.setState({
      delThis: true,
      backupChain: point,
    })
  }
  // 备份点操作
  backupPointmenu = point => {
    const iconStyle = {
      width: 13,
      height: 13,
      fontSize: 0,
      marginRight: 5,
    }
    return (
      <Menu>
        <Menu.Item key="1">
          <div onClick={() => this.rollBack(point)}>
            <img src={rollback} style={iconStyle} alt=""/>
            回滚</div>
        </Menu.Item>
        <Menu.Item key="2">
          <div onClick={() => this.newDatabase(point)}>
            <img src={create} style={iconStyle} alt=""/>
            新建MySql数据库
          </div>
        </Menu.Item>
        <Menu.Item key="3">
          <div onClick={() => this.delThis(point)}>
            <Icon type="delete" style={{ marginRight: 5 }}/>
            删除</div>
        </Menu.Item>
      </Menu>)
  }
  //  备份点状态
  pointStatus = status => {
    switch (status) {
      case 0:
        return '备份失败'
      case 1:
        return '正在备份'
      case 2:
        return '完成备份'
      default:
        return '未知状态'
    }
  }
  //  备份点类名
  pointClass = status => {
    switch (status) {
      case 0:
        return {
          className: 'err',
          color: '#f85a5a',
        }
      case 1:
        return {
          className: 'ing',
          color: '#2db7f5',
        }
      case 2:
        return {
          className: 'suc',
          color: '#5cb85c',
        }
      default:
        return {
          className: '',
          color: '#cccccc',
        }
    }
  }
  // 全量备份点样式
  fullBackupPoint = status => {
    return <div className="fullPoint" style={{ backgroundColor: this.pointClass(status).color }}>全</div>
  }
  // 点击自动备份弹出弹框
  autoBackup = () => {
    this.setState({
      autoBackupModalShow: true,
    })
  }
  // 点击弹出手动备份弹出弹框
  menualBackup = (chain, i) => {
    this.setState({
      manualBackupModalShow: true,
      curentChain: chain,
      currentIndex: i,
      backupType: i && i !== 0 ? 'fullbackup' : 'diffbackup',
    })
  }
  // 自动备份弹窗组件
  autoBackupModal = () => {
    const {
      database, databaseInfo, clusterID,
      autoBackupSet, updateAutoBackupSet, autoBackupDetele, loadDbCacheList,
    } = this.props
    const parentScope = this.props.scope.props.scope

    // 获取选择备份周期
    const selectPeriod = (week, index) => {
      const { days } = this.state
      const localWeeks = JSON.parse(JSON.stringify(days))
      localWeeks[index] = localWeeks[index] ? false : week.en
      // 转换周期格式（仅天）参考格式： http://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/crontab.html
      const newDays = localWeeks.filter(v => !!v)
      if (newDays[0] === '0') {
        newDays.push(newDays.shift())
      }
      this.setState({
        days: localWeeks,
        daysConvert: newDays,
      })
      // console.log(period)
    }
    // 确定
    const handleAutoBackupOk = () => {
      const { hour, minutes, daysConvert } = this.state
      // const schedule = `${minutes} ${hour} * * ${daysConvert.join(',').replace(/,/g, ' ')}`
      const schedule = `${minutes} ${hour} * * ${daysConvert.join(',')}`
      if (!this.state.autoBackupSwitch) {
        // 如果开关关闭，说明要关闭自动备份, redis和mysql的关闭方法不一样，前者调用修改接口，后者调用删除接口
        if (database === 'redis') {
          const postData = { schedule: '' }
          updateAutoBackupSet(clusterID, database, databaseInfo.objectMeta.name, postData, {
            success: {
              func: () => {
                parentScope.setState({ detailModal: false })
                notification.success('关闭自动备份成功')
                setTimeout(() => {
                  loadDbCacheList(clusterID, database)
                  this.checkAutoBackupExist()
                })
              },
            },
          })
        } else if (database === 'mysql') {
          autoBackupDetele(clusterID, database, databaseInfo.objectMeta.name, {
            success: {
              func: () => {
                notification.success('关闭自动备份成功')
                parentScope.setState({ detailModal: false })
                setTimeout(() => {
                  loadDbCacheList(clusterID, database)
                  this.checkAutoBackupExist()
                })
              },
            },
            failed: {
              func: () => {
                notification.warn('关闭自动备份失败')
              },
            },
          })
        }

      } else {
        const postData = { schedule }
        // 如果已经设置过自动备份，说明要修改，调用修改接口
        if (this.state.hadSetAutoBackup) {
          updateAutoBackupSet(clusterID, database, databaseInfo.objectMeta.name, postData, {
            success: {
              func: () => {
                parentScope.setState({ detailModal: false })
                notification.success('修改自动备份成功')
                setTimeout(() => {
                  loadDbCacheList(clusterID, database)
                  this.checkAutoBackupExist()
                })
              },
            },
          })
        } else {
          // 否则是已经关闭了自动备份，需要调用设置接口
          autoBackupSet(clusterID, database, databaseInfo.objectMeta.name, postData, {
            success: {
              func: () => {
                notification.success('设置自动备份成功')
                parentScope.setState({ detailModal: false })
                setTimeout(() => {
                  loadDbCacheList(clusterID, database)
                  this.checkAutoBackupExist()
                })
              },
            },
            failed: {
              func: () => {
                notification.warn('设置自动备份失败')
              },
            },
          })
        }
      }
      this.setState({
        autoBackupModalShow: false,
      })
    }

    const statusSwitch = val => {
      this.setState({
        autoBackupSwitch: val,
      })

      // console.log(val)
    }
    // 获取小时
    const hour = h => {
      this.setState({ hour: `${h}` })
      // console.log(time)
    }
    // 获取分钟
    const minutes = m => {
      this.setState({ minutes: `${m}` })
      // console.log(time)
    }
    return <Modal
      visible={this.state.autoBackupModalShow}
      title={database === 'redis' ? '设置自动全量备份' : '设置自动差异备份（基于当前链）'}
      onOk={handleAutoBackupOk}
      onCancel={() => this.setState({
        autoBackupModalShow: false,
      })}
      width={650}
    >
      <div className="autoContent">
        <Row className="item">
          <Col span={4} className="title">备份集群</Col>
          <Col span={19} push={1}>{databaseInfo.objectMeta.name}</Col>
        </Row>
        <Row className="item">
          <Col span={4} className="title">状态</Col>
          <Col span={19} push={1}>
            <Switch checkedChildren="开" onChange={statusSwitch} unCheckedChildren="关" checked={this.state.autoBackupSwitch} />
          </Col>
        </Row>
        {
          this.state.autoBackupSwitch &&
            <div>
              <Row className="item">
                <Col span={4} className="title">备份周期</Col>
                <Col span={19} push={1}>
                  <BackupStrategy weeksSelected={this.state.days} setPeriod={selectPeriod}/>
                </Col>
              </Row>
              <Row className="item">
                <Col span={4} className="title">备份时间</Col>
                <Col span={19} push={1}>
                  <div>
                    <InputNumber min={0} max={24} defaultValue={1} onChange={hour} />
                    <span className="text">时</span>
                    <InputNumber min={0} max={60} defaultValue={0} onChange={minutes} />
                    <span className="text">分</span>
                  </div>
                </Col>
              </Row>
            </div>
        }
      </div>
    </Modal>
  }
  // 手动弹窗组件
  manualBackupModal = () => {
    const { database } = this.props
    const tipText1 = `将在${this.state.curentChain ? this.state.curentChain.name : ''}备份链上做差异备份`
    const tipText2 = '新建备份链后，自动备份和手动备份的差异备份将在新建备份链上进行'
    // 选择备份方式
    let type = this.state.backupType
    const selectBackupType = e => {
      type = e.target.value
      this.setState({
        backupType: e.target.value,
      })
    }
    // 提交
    const commitBackup = () => {
      this.props.form.validateFields((errors, value) => {
        if (errors) {
          return
        }
        const {
          createBackupChain,
          getbackupChain,
          databaseInfo,
          database,
          clusterID } = this.props
        const body = database === 'redis' ? { name: value.name } : { name: value.name, type }
        createBackupChain(clusterID,
          database,
          databaseInfo.objectMeta.name,
          body, {
            success: {
              func: () => {
                this.setState({
                  manualBackupModalShow: false,
                }, () => {
                  setTimeout(() => {
                    getbackupChain(clusterID, database, databaseInfo.objectMeta.name)
                  })
                })
              },
            },
            failed: {
              func: () => {},
            },
          })
      })
    }
    const formItemLayout = {
      labelCol: {
        sm: { span: 5, pull: 1 },
      },
      wrapperCol: {
        sm: { span: 19 },
      },
    }
    const { getFieldProps } = this.props.form
    const nameCheck = getFieldProps('name', {
      rules: [{ required: true, message: '请输入备份名称', whitespace: true }],
    })

    return <Modal
      width={650}
      visible={this.state.manualBackupModalShow}
      title="创建备份"
      onCancel={() => this.setState({
        manualBackupModalShow: false,
      })}
      onOk={commitBackup}
    >
      <Form className="manualBackup">
        <Row>
          <Col span={4} className="title">备份方式</Col>
          <Col span={20}>
            {
              database === 'redis' ?
                <RadioGroup defaultValue={0}>
                  <Radio value={0}>新建备份链</Radio>
                </RadioGroup>
                :
                <RadioGroup onChange={selectBackupType}>
                  {
                    this.state.currentIndex === 0 && <Radio value="diffbackup" checked={this.state.backupType === 'diffbackup'}>原备份链上差异备份</Radio>
                  }
                  <Radio value="fullbackup" checked={this.state.backupType === 'fullbackup'}>新建备份链</Radio>
                </RadioGroup>

            }
            <div className="tip">
              {this.state.backupType === 'diffbackup' && database !== 'redis' ? tipText1 : tipText2}
            </div>
            <FormItem
              {...formItemLayout}
              label= "备份名称"
            >
              <Input placeholder= "请输入备份名称" id="name" {...nameCheck} style={{ width: 200 }}/>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  }
  convertBackupType = type => {
    switch (type) {
      case 'fullbackup':
        return '全量备份'
      case 'diffbackup':
        return '增量备份'
      default:
        return '未知'
    }
  }
  renderList = () => {
    const { chainsData, database } = this.props
    const iconStyle = {
      width: 13,
      height: 13,
      fontSize: 0,
      marginRight: 5,
    }

    return database === 'mysql' ?
      <Collapse onChange={this.expendPanel}>
        {
          chainsData.length !== 0 && chainsData.map((v, i) => {
            return <Panel header={this.renderHeader(v, i)} key={v.name}>
              <div className="new-point" onClick={() => this.menualBackup(chainsData[i], i)} >
                <div className="line"></div>
              </div>
              {
                v.chains ?
                  <Timeline>
                    {
                      v.chains.map(k => (
                        <Timeline.Item
                          dot={k.backType === 'fullbackup' ? this.fullBackupPoint(k.status) : ''}
                          key={k.creationTimestamp}
                          color={this.pointClass(k.status).color}>
                          <Row>
                            <Col span={5}>{formatDate(k.creationTimestamp)}</Col>
                            <Col span={5}>{(k.size / 1024).toFixed(2)} kb</Col>
                            <Col span={5}>{this.convertBackupType(k.backType)}</Col>
                            <Col span={5}>
                              <span className={ `status ${this.pointClass(k.status).className}` }>
                                {this.pointStatus(k.status)}
                              </span>
                            </Col>
                            <Col span={4}>
                              <Dropdown.Button overlay={this.backupPointmenu(k)} type="ghost">
                                <img src={rollback} style={iconStyle} alt=""/>
                                回滚
                              </Dropdown.Button>
                            </Col>
                          </Row>
                        </Timeline.Item>
                      ))
                    }
                  </Timeline>
                  :
                  ''
              }
            </Panel>
          })
        }

      </Collapse>
      :
      <div className="redis-list-wrapper">
        {
          chainsData.length !== 0 && chainsData.map(v => {
            return <Row className="redis-list-item-header" ref="header" key={v.name}>
              <Col span={4}>
                {v.name}<span style={{ color: '#57c5f7' }}> (全量备份)</span>
              </Col>
              <Col span={4}>总 {(v.size / 1024).toFixed(2)} kb</Col>
              <Col span={4}>
                <span className={ `status ${this.pointClass(v.chains[0].status).className}` }>
                  {this.pointStatus(v.chains[0].status)}
                </span>
              </Col>
              <Col span={4}>{formatDate(v.creationTimestamp)}</Col>
              <Col span={4} push={4}>
                <Dropdown.Button overlay={this.backupPointmenu(v)} type="ghost">
                  <img src={rollback} style={iconStyle} alt=""/>
                  回滚
                </Dropdown.Button>
              </Col>
            </Row>
          })
        }
      </div>
  }
  render() {
    const { chainsData, database } = this.props
    return <div className="backup">
      <div className="title">备份</div>
      <div className="content">
        <div className="operation">
          <div className="status">
            自动备份：
            {
              this.state.hadSetAutoBackup ?
                <span style={{ color: '#5cb85c' }}>已开启</span>
                :
                <span style={{ color: '#cccccc' }}>已关闭</span>
            }
          </div>
          {/* 初次备份时候，自动备份禁用 */}
          <Button type="primary" disabled={chainsData.length === 0 && database === 'mysql'} onClick={this.autoBackup}>设置自动备份</Button>
          <Button onClick={() => this.menualBackup(chainsData[0], 0)}>手动备份</Button>
        </div>
        <div className="list">
          {
            chainsData.length === 0 ?
              <div className="no-data">暂无数据</div>
              :
              <div>{this.renderList()}</div>
          }
        </div>
      </div>
      {/* 设置自动备份弹框*/}
      {this.autoBackupModal()}
      {/* 手动设置自动备份*/}
      {this.manualBackupModal()}
      {/* 确认回滚弹窗*/}
      {this.rollBackAlert()}
      {/* 确认删除备份点弹窗*/}
      {this.delBackupPointAlert()}
    </div>
  }
}

const mapStateToProps = state => {
  const { clusterID } = state.entities.current.cluster
  const { namespace } = state.entities.loginUser.info
  const { chains, autoBackupChains } = state.backupChain
  const chainsData = chains.data || []
  // 将当前备份链放到第一个
  if (chainsData && chainsData.length !== 0) {
    for (let i = 0; i < chainsData.length; i++) {
      if (chainsData[i].masterBackup) {
        chainsData.unshift(chainsData.splice(i, 1)[0])
        i = chainsData.length
      }
    }
  }
  return {
    namespace,
    chainsData,
    clusterID,
    autoBackupChains, // 当前是自动备份的备份链
  }
}
const BackupForm = Form.create()(Backup)
export default connect(mapStateToProps, {
  getbackupChain, // 获取备份链列表
  deleteManualBackupChain, // 删除手动备份链
  createBackupChain,
  checkAutoBackupExist, // 检查是否又自动备份链
  autoBackupSet, // 设置自动备份
  autoBackupDetele, // 关闭定时备份
  updateAutoBackupSet, // 修改定时备份
  postRollback, // 回滚
  loadDbCacheList, // 请求集群列表
})(BackupForm)
