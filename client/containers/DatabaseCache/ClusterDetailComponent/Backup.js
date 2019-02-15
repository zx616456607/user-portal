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
import { Button, Row, Col, Collapse, Timeline, Menu, Dropdown, Checkbox, Icon, Modal, Radio, Tooltip, Input, Form } from 'antd'
import { connect } from 'react-redux'
import { calcuDate, formatDate } from '../../../../src/common/tools'
import * as backupChainActions from '../../../actions/backupChain'
import NotificationHandler from '../../../../src/components/Notification'
import TenxIcon from '@tenx-ui/icon/es/_old'
import AutoBackupModal from '../../../components/AutoBackupModal'
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
const FormItem = Form.Item
const notification = new NotificationHandler()

class Backup extends React.Component {
  state= {
    extendId: '',
    expendKeys: [], // 用expendKeys和keys做对比，keys多出来的那一项是当前展开的
    currentItem: '', // 为了标记当前展开的高亮
    autoBackupModalShow: false, // 自动备份弹框
    manualBackupModalShow: false, // 手动备份弹框
    curentChain: '', // 点击手动备份或者备份链的加号，将当前链或者当前点击的备份链信息存到这里
    backupType: 'diffbackup',
    rollBackAlert: false, // 回滚操作弹框显示隐藏
    notYetConfirm: true, // 确认回滚勾选
    delThis: false, // 删除备份链弹框显示隐藏
    backupChain: '', // 当前操作的备份点
    hadSetAutoBackup: false, // 是否已经设置了自动备份
    currentIndex: '', // 当前选的第几个备份链
    notAllowDiffBackup: false, // 是否允许差异备份
    fullBackupPointDel: true, // 是否不允许删除当前备份链上的全量备份点
    isFetching: false,
    radosgw: false,
  }
  componentDidMount() {
    this.getList() // 获取备份链数据
    this.checkAutoBackupExist() // 检查是否有自动备份
    this.checkRadosgwStatus() // 检查radosgw是否配置，未配置不能备份
  }
  checkRadosgwStatus = () => {
    const { getRadosgwStatus, clusterID, databaseInfo } = this.props
    getRadosgwStatus(clusterID, databaseInfo.storageCluster, {
      success: {
        func: res => {
          this.setState({
            radosgw: res.data,
          })
        },
      },
    })

  }
  getList = () => {
    const { clusterID, database, databaseInfo, getbackupChain } = this.props
    return getbackupChain(clusterID, database, databaseInfo.objectMeta.name, {
      success: {
        func: res => {
          if (res.data.items && res.data.items.length !== 0) {
            // 当前没有主备份链，不允许从当前备份链上新建差异备份
            const chains = res.data.items.filter(v => v.masterBackup)
            if (chains.length === 0) {
              this.setState({
                notAllowDiffBackup: true,
                backupType: 'fullbackup',
              })
            } else {
              this.setState({
                notAllowDiffBackup: false,
                backupType: 'diffbackup',
              })

            }
          } else {
            // 当没有备份链时，新建备份点不能选原备份链上差异备份
            this.setState({
              notAllowDiffBackup: true,
              backupType: 'fullbackup',
            })
          }
        },
      },
    }) // 获取备份链数据
  }
  checkAutoBackupExist = () => {
    const { clusterID, database, databaseInfo, checkAutoBackupExist } = this.props
    checkAutoBackupExist(clusterID, database, databaseInfo.objectMeta.name, {
      success: {
        func: res => {
          if (database === 'redis') {
            // 如果有数据或者数据内的schedule字段不为空，说明开启了自动备份。把控制自动备份开关的state置为true
            if (res.data.length !== 0 && res.data[0] && res.data[0].schedule !== '') {
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
      <Row className="list-item-header" ref="header" key={v.name} style={ this.state.currentItem === `${v.name}` ? { background: '#fafafa' } : {}}>
        <Col span={6} className="name-wrapper">
          <Tooltip title={v.name} placement="topLeft">
            <span className="chain-name">
              {v.name}
            </span>
          </Tooltip>
          { (i === 0 && v.masterBackup) && <span style={{ color: '#57c5f7' }}> (当前链)</span> }
        </Col>
        <Col span={4}>{(v.size / 1024 / 1024).toFixed(2)} M</Col>
        <Col span={6}>备份点 {v.chains.length} 个</Col>
        <Col span={6}>创建于{calcuDate(v.creationTimestamp)}</Col>
      </Row>)
  }
  expendPanel = keys => {
    if (keys.length === 0) {
      this.setState({
        currentItem: '',
      })
      return
    }
    this.setState({
      currentItem: keys[keys.length - 1],
    })
    this.props.resetRecordItem()
  }
  rollBackAlert = () => {
    const confirmRollBack = () => {
      const {
        clusterID, database, databaseInfo, postRollback,
      } = this.props
      const { name } = this.state.backupChain
      const urlName = databaseInfo.objectMeta.name
      const body = { name }
      postRollback(clusterID, database, urlName, body, {
        success: {
          func: () => {
            notification.success(`操作成功,集群数据将回滚至 ${name} 状态`)
            setTimeout(() => {
              this.props.rollBackSuccess()
              this.getList()
            })
          },
        },
        failed: {
          func: () => {
            notification.warn('回滚操作失败')
          },
        },
      })
      this.props.jumpToRollbackRecord()
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
        onCancel={() => this.setState({ rollBackAlert: false })}
      >
        <div className="dbClusterBackup-rollbackAlertContent">
          <div className="left">
            <Icon type="question-circle-o" />
          </div>
          <div className="right">
            <p>回滚后，此数据库集群将恢复到该备份点的状态。回滚完成后将自动重启集群，确定回滚操作吗？</p>
            {
              this.state.rollBackAlert &&
              <Checkbox onChange={onChange}>已经对当前数据备份，确定执行回滚操作</Checkbox>
            }
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
  delBackupPointAlert = () => {
    const { backupChain } = this.state
    // title要根据备份点的类型来判断到底显示什么类型， 获取backupChain即为当前操作的备份点对象
    const confirmDel = () => {
      const {
        clusterID, databaseInfo, database, deleteManualBackupChain,
      } = this.props
      deleteManualBackupChain(
        clusterID, database,
        databaseInfo.objectMeta.name, backupChain.name, {
          success: {
            func: () => {
              notification.success('删除成功')
              setTimeout(() => {
                this.getList()
              })
            },
          },
        })
      this.setState({
        delThis: false,
      })
    }
    const onChange = e => {
      this.setState({
        fullBackupPointDel: !e.target.checked,
      })
    }
    const isCurrentFullBackup = backupChain.backType === 'fullbackup'
    return (
      <Modal
        visible={this.state.delThis}
        onOk={confirmDel}
        onCancel={() => this.setState({ delThis: false })}
        title= {isCurrentFullBackup ? '删除全量备份点' : '删除备份点'}
        footer={[
          <Button key="cancel" onClick={() => this.setState({ delThis: false })}>取消</Button>,
          <Button key="confirm" type="primary" disabled={isCurrentFullBackup && this.state.fullBackupPointDel && backupChain.masterBackup} onClick={confirmDel}>确定</Button>,
        ]}
      >
        {
          backupChain.masterBackup && backupChain.backType === 'fullbackup' ?
            <div className="dbClusterBackup-delPoint">
              <Col span={3} className="alert-icon">
                <Icon type="exclamation-circle-o" />
              </Col>
              <Row className="alert">
                <Col span={21}>
                  同一条备份链上的备份点与全量备份之间的数据有依赖关系，删除该全量备份后，该备份链上的所有备份点都将被删除，此操作不可恢复
                </Col>
              </Row>
              <Row>
                {
                  this.state.delThis &&
                  <Checkbox onChange={onChange}>若删除此全量备份，自动备份暂不生效，新建一个备份链后可继续自动备份</Checkbox>
                }
              </Row>
            </div>
            :
            <div className="dbClusterBackup-delPoint">
              <div className="delPoint">
                <Icon type="question-circle-o" />
                此操作不可恢复，确定删除此备份点{this.state.backupChain.name}吗？
              </div>
            </div>

        }
      </Modal>
    )
  }
  delThis = (point, i) => {
    point.index = i
    this.setState({
      delThis: true,
      backupChain: point,
    })
  }
  // 备份点操作
  backupPointmenu = (point, i) => {
    return (
      <Menu>
        <Menu.Item key="3">
          <div onClick={() => this.delThis(point, i)}>
            <Icon type="delete" style={{ marginRight: 5 }}/>
            删除</div>
        </Menu.Item>
      </Menu>)
  }
  //  备份点状态
  pointStatus = (status, item) => {
    const { database } = this.props
    if (database === 'mysql') {
      switch (status) {
        case 'Failed':
          return <div style={{ marginTop: -2 }}>
              备份失败
            <Tooltip title={`失败原因：${item.message && item.message}`}><Icon type="question-circle-o" style={{ marginLeft: 5 }} /></Tooltip>
          </div>
        case 'Scheduled':
          return '正在备份'
        case 'Started':
          return '正在备份'
        case 'Complete':
          return '完成备份'
        default:
          return '未知状态'
      }
    } else if (database === 'redis') {
      switch (status) {
        case '500':
          return <div style={{ marginTop: -2 }}>
            备份失败
            <Tooltip title={`失败原因：${item.message && item.message}`}><Icon type="question-circle-o" style={{ marginLeft: 5 }} /></Tooltip>
          </div>
        case '0':
          return '正在备份'
        case '200':
          return '完成备份'
        case '202':
          return '正在备份'
        default:
          return '未知状态'
      }
    }
  }
  //  备份点类名
  pointClass = status => {
    const { database } = this.props
    if (database === 'mysql') {
      switch (status) {
        case 'Failed':
          return {
            className: 'err',
            color: '#f85a5a',
          }
        case 'Started':
          return {
            className: 'ing',
            color: '#2db7f5',
          }
        case 'Scheduled':
          return {
            className: 'ing',
            color: '#2db7f5',
          }
        case 'Complete':
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
    } else if (database === 'redis') {
      switch (status) {
        case '500':
          return {
            className: 'redis-err',
            color: '#f85a5a',
          }
        case '202':
          return {
            className: 'ing',
            color: '#2db7f5',
          }
        case '0':
          return {
            className: 'ing',
            color: '#2db7f5',
          }
        case '200':
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
  nameIsLegal(rule, value, callback) {
    let flag = false;
    if (value === '') {
      return callback('请输入名称')
    }
    const nameReg = name => {
      if (name.length < 1 || name.length > 23) {
        return false
      }
      const regx = new RegExp('^[a-z][-a-z0-9]{1,58}[a-z0-9]$')
      if (!regx.test(name)) {
        return false
      }
      return true
    }
    if (!nameReg(value)) {
      flag = true
      return callback('名称由1~23 位小写字母、数字、中划线组成')
    }
    const checkName = /^[a-z]([-a-z0-9]*[a-z0-9])$/;
    if (!checkName.test(value)) {
      callback([ new Error('名称仅由小写字母、数字和横线组成，且以小写字母开头') ]);
      flag = true;
    }
    if (!flag) {
      callback();
    }
  }
  // 点击弹出手动备份弹出弹框
  menualBackup = (chain, i) => {
    if (this.props.rollbackComplete) return
    this.setState({
      manualBackupModalShow: true,
      curentChain: chain,
      currentIndex: i,
      backupType: i && i !== 0 || this.state.notAllowDiffBackup ? 'fullbackup' : 'diffbackup',
    }, () => {
      if (chain) {
        for (const v of this.state.curentChain.chains) {
          if (v.backType === 'fullbackup' && (v.status === '' || v.status === 'Failed' || v.status === '202')) {
            this.setState({
              backupType: 'fullbackup',
              notAllowDiffBackup: true,
            })
          }
        }
      }
    })
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
        this.setState({
          isFetching: true,
        })
        const {
          createBackupChain,
          databaseInfo,
          clusterID } = this.props
        const body = database === 'redis' ? { name: value.name } : { name: value.name, type }
        createBackupChain(clusterID,
          this.props.database,
          databaseInfo.objectMeta.name,
          body, {
            success: {
              func: () => {
                setTimeout(() => { this.getList() })
                this.setState({
                  manualBackupModalShow: false,
                  isFetching: false,
                })
              },
            },
            failed: {
              func: err => {
                if (err.statusCode === 500) {
                  const reg = /already exists/g
                  if (err.message && reg.test(err.message.message)) {
                    notification.error('名称已存在，请核对后输入')
                    this.setState({
                      isFetching: false,
                    })
                    return
                  }
                  if (err.message && err.message.message.includes('get default storage cluster failed')) {
                    notification.warn('备份操作需要设置默认存储集群')
                    this.setState({
                      isFetching: false,
                    })
                  }
                }
              },
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
      rules: [
        { validator: this.nameIsLegal }],
    })
    return <Modal
      width={650}
      visible={this.state.manualBackupModalShow}
      title="创建备份"
      onCancel={() => this.setState({
        manualBackupModalShow: false,
        isFetching: false,
      })}
      confirmLoading = {this.state.isFetching}
      onOk={commitBackup}
    >
      <Form className="dbClusterBackup-manualBackup">
        <Row>
          {
            database !== 'redis' &&
            <Col span={4} className="title">备份方式</Col>
          }
          <Col span={20}>
            {
              database === 'redis' ?
                ''
                :
                <RadioGroup onChange={selectBackupType}>
                  {
                    this.state.currentIndex === 0 && <Radio value="diffbackup" disabled={this.state.notAllowDiffBackup} checked={this.state.backupType === 'diffbackup'}>原备份链上差异备份</Radio>
                  }
                  <Radio value="fullbackup" checked={this.state.backupType === 'fullbackup'}>新建备份链</Radio>
                </RadioGroup>

            }
            {
              database !== 'redis' &&
              <div className="tip">
                {this.state.backupType === 'diffbackup' && database !== 'redis' ? tipText1 : tipText2}
              </div>
            }
            <FormItem
              {...formItemLayout}
              label= "备份名称"
            >
              <Input placeholder= "请输入备份名称" id="name" {...nameCheck} style={{ width: 300 }}/>
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
        return '差异备份'
      default:
        return '未知'
    }
  }

  renderList = () => {
    const { database, databaseInfo, rollbackComplete, recordItem } = this.props
    let chainsData = JSON.parse(JSON.stringify(this.props.chainsData))
    const sortData = chainsData.splice(1)
    sortData.sort(
      (a, b) => {
        return Date.parse(b.chains[b.chains.length - 1].creationTimestamp)
          - Date.parse(a.chains[a.chains.length - 1].creationTimestamp)
      })
    chainsData = [ this.props.chainsData[0] ].concat(sortData)

    const activeIndex = () => {
      let key
      chainsData.forEach(v => {
        v.chains.forEach(k => {
          if (k.name === recordItem) key = v.name
        })
      })
      return key
    }
    const rollbackDisabled = databaseInfo.status !== 'Running' || rollbackComplete
    let rollbackText = ''
    if (databaseInfo.status !== 'Running') {
      rollbackText = '运行中的集群支持回滚'
    } else if (rollbackComplete) {
      rollbackText = '正在回滚中'
    }
    const disabledStyle = {
      cursor: 'not-allowed',
      color: '#cccccc',
    }
    const newPointClass = () => {
      if (this.props.rollbackComplete) {
        return 'new-point disabled-point'
      }
      return 'new-point'
    }
    return database === 'mysql' ?
      <Collapse onChange={this.expendPanel} defaultActiveKey={activeIndex()}>
        {
          chainsData.length !== 0 && chainsData.map((v, i) => {
            return <Panel header={this.renderHeader(v, i)} key={v.name}>
              {
                databaseInfo.status !== 'Running' || !v.masterBackup ?
                  ''
                  :
                  <Tooltip title={this.props.rollbackComplete ? '回滚中不支持备份' : ''}>
                    <div className={newPointClass()}
                      onClick={ () => this.menualBackup(chainsData[i], i) } >
                      <div className="line"></div>
                    </div>

                  </Tooltip>
              }
              {
                v.chains ?
                  <Timeline>
                    {
                      v.chains.map(k => (
                        <Timeline.Item
                          dot={k.backType === 'fullbackup' ? this.fullBackupPoint(k.status) : ''}
                          key={k.creationTimestamp}
                          color={this.pointClass(k.status).color}>
                          <Row className={recordItem && recordItem === k.name ? 'children-chain selected' : 'children-chain'}>
                            <Col span={6}>{formatDate(k.creationTimestamp)}</Col>
                            <Col span={3}>{(k.size / 1024 / 1024).toFixed(2)} M</Col>
                            <Col span={4} pull={1}>
                              <Tooltip title={`${k.autoBackup ? '自动' : '手动'} ${this.convertBackupType(k.backType)} (${k.name})`}>
                                <div className="point-name">{k.autoBackup ? '自动' : '手动'} {this.convertBackupType(k.backType)} ({k.name})</div>
                              </Tooltip>
                            </Col>
                            <Col span={4} push={3}>
                              <span className={ `status ${this.pointClass(k.status).className}` }>
                                {this.pointStatus(k.status, k)}
                              </span>
                            </Col>
                            <Col span={6} push={2} className={rollbackDisabled ? 'disabled-rollback' : ''}>
                              {
                                k.status === 'Complete' ?
                                  <Dropdown.Button onClick={() => {
                                    if (!rollbackDisabled) {
                                      this.rollBack(k)
                                    }
                                  }} overlay={this.backupPointmenu(k, i)} type="ghost">
                                    <Tooltip title={rollbackText}>
                                      <span style={rollbackDisabled ? disabledStyle : null}>
                                        <TenxIcon type="rollback"size={13} style={{ marginRight: 4 }}/>
                                        <span>回滚</span>
                                      </span>
                                    </Tooltip>
                                  </Dropdown.Button>
                                  :
                                  <Button icon="delete" onClick={() => this.delThis(k, i)} style={{ width: 95, background: '#fff' }}>
                                    删除
                                  </Button>
                              }
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
          chainsData.length !== 0 && chainsData.map((v, i) => {
            return <Row className={activeIndex() === v.name ? 'redis-list-item-header selected' : 'redis-list-item-header' } ref="header" key={v.name} >
              <Col span={3} className="name">
                <Tooltip title={v.name}>
                  <span className="backup-point-name">
                    ({v.chains[0].autoBackup ? '自动' : '手动'})
                    {v.name}
                  </span>
                </Tooltip>
                <span style={{ color: '#57c5f7' }}></span>
              </Col>
              <Col span={3}>{(v.size / 1024 / 1024).toFixed(2)} M</Col>
              <Col span={3}>
                <span className={ `redis-status ${this.pointClass(v.chains[0].status).className}` }>
                  {this.pointStatus(v.chains[0].status, v.chains[0])}
                </span>
              </Col>
              <Col span={8} className="create-time">创建于{formatDate(v.creationTimestamp)}</Col>
              <Col span={5} className={rollbackDisabled ? 'disabled-rollback' : ''}>
                {
                  v.chains[0].status === '500' ?
                    <Button icon="delete" onClick={() => this.delThis(v.chains[0], i)} style={{ width: 95, background: '#fff' }}>
                      删除
                    </Button>
                    :
                    <Dropdown.Button onClick={() => {
                      if (!rollbackDisabled) {
                        this.rollBack(v)
                      }
                    }} overlay={this.backupPointmenu(v)} type="ghost">
                      <Tooltip title={rollbackText}>
                        <div style={rollbackDisabled ? disabledStyle : null}>
                          <TenxIcon type="rollback" size={13} style={{ marginRight: 4 }}/>
                          回滚
                        </div>
                      </Tooltip>
                    </Dropdown.Button>
                }
              </Col>
            </Row>
          })
        }
      </div>
  }
  // 自动备份设置成功
  setAutobackupSuccess = () => {
    this.setState({
      autoBackupModalShow: false,
    })
    this.checkAutoBackupExist()
  }
  // 检测所有备份链的全量备份是否都成功
  checkAllFullbackupFailure = () => {
    const { chainsData, database } = this.props
    let returnData = {
      msg: '',
      disabled: false,
    }
    if (!this.state.radosgw) {
      return {
        msg: '集群存储未配置radosgw地址，管理员配置后即可备份',
        disabled: true,
      }
    }
    if (database === 'mysql') {
      if (chainsData.length === 0) {
        return {
          msg: '无任何备份链，手动备份后，可设置自动备份',
          disabled: true,
        }
      }
      let data = []
      chainsData.forEach(v => {
        data = data.concat(v.chains)
      })

      data.forEach(k => {
        if (k.backType === 'fullbackup' && k.status !== 'Failed') {
          returnData = {
            msg: '',
            disabled: false,
          }
          return
        }
        returnData = {
          msg: '无备份成功的全量备份点，无法设置自动备份',
          disabled: true,
        }
      })
      return returnData
    }
    return returnData
  }
  render() {
    const { chainsData, database, databaseInfo, rollbackComplete } = this.props
    const { radosgw } = this.state
    let disabledText = ''
    if (!radosgw) {
      disabledText = '集群存储未配置radosgw地址，管理员配置后即可备份'
    } else if (databaseInfo.status !== 'Running') {
      disabledText = '运行中的集群支持备份'
    } else {
      disabledText = '回滚中不支持备份'
    }
    return <div className="dbClusterBackup" onClick={() => { this.props.resetRecordItem() }}>
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
          {
            this.checkAllFullbackupFailure().disabled ?
              <div className="btn-wrapper">
                <div className="fake">
                  <Tooltip title={this.checkAllFullbackupFailure().msg}>
                    <div className="mask"></div>
                  </Tooltip>
                </div>
                <Button type="primary" disabled onClick={this.autoBackup}>
                  <Icon type="setting" />
                  设置自动备份
                </Button>
              </div>
              :
              <Button type="primary" onClick={this.autoBackup}>
                <Icon type="setting" />
                设置自动备份
              </Button>
          }
          {
            databaseInfo.status !== 'Running' || rollbackComplete || !radosgw ?
              <div className="btn-wrapper">
                <div className="fake">
                  <Tooltip title={disabledText}>
                    <div className="mask" ></div>
                  </Tooltip>
                </div>
                <Button disabled>
                  <TenxIcon type="hand-press" style={{ marginRight: 4 }}/>
                  手动备份
                </Button>
              </div>
              :
              <Button onClick={() => this.menualBackup(chainsData[0], 0)}>
                <TenxIcon type="hand-press" style={{ marginRight: 4 }}/>
                手动备份
              </Button>
          }
        </div>
        <div className="list">
          {
            chainsData.length === 0 ?
              <div className="no-data">
                <Icon type="frown" />暂无数据
              </div>
              :
              <div>{this.renderList()}</div>
          }
        </div>
      </div>
      {/* 设置自动备份弹框*/}
      {
        this.state.autoBackupModalShow &&
          <AutoBackupModal
            isShow={this.state.autoBackupModalShow}
            closeModal={() => this.setState({
              autoBackupModalShow: false,
            })}
            hadSetAutoBackup={this.state.hadSetAutoBackup}
            onSubmitSuccess={this.setAutobackupSuccess}
            databaseInfo={databaseInfo}
            database={database}
          />
      }
      {/* this.autoBackupModal()*/}
      {/* 手动设置自动备份*/}
      {this.manualBackupModal()}
      {/* 确认回滚弹窗*/}
      {this.rollBackAlert()}
      {/* 确认删除备份点弹窗*/}
      {this.delBackupPointAlert()}
    </div>
  }
}

const mapStateToProps = (state, props) => {
  const { database } = props
  const { clusterID } = state.entities.current.cluster
  const { namespace } = state.entities.loginUser.info
  const { chains, autoBackupChains } = state.backupChain
  const chainsData = chains.data || []
  // 是否正在备份
  const rollbackComplete = chains.rollbackComplete || false
  if (database === 'mysql') {
    // 将当前备份链放到第一个
    if (chainsData && chainsData.length !== 0) {
      for (let i = 0; i < chainsData.length; i++) {
        if (chainsData[i].masterBackup) {
          chainsData[i].chains.forEach(v => {
            v.masterBackup = true
          })
          chainsData.unshift(chainsData.splice(i, 1)[0])
          i = chainsData.length
        }
      }
    }
    // 备份点排序，全量备份排在最下边
    for (const v of chainsData) {
      v.chains.sort((a, b) => Date.parse(b.creationTimestamp) - Date.parse(a.creationTimestamp))
    }
  } else if (database === 'redis') {
    // 排序，最新的放在最上边
    chainsData.sort((a, b) => Date.parse(b.creationTimestamp) - Date.parse(a.creationTimestamp))
  }
  return {
    namespace,
    chainsData,
    clusterID,
    autoBackupChains, // 当前是自动备份的备份链
    rollbackComplete,
  }
}
const BackupForm = Form.create()(Backup)
export default connect(mapStateToProps, {
  getbackupChain: backupChainActions.getbackupChain, // 获取备份链列表
  deleteManualBackupChain: backupChainActions.deleteManualBackupChain, // 删除手动备份链
  createBackupChain: backupChainActions.createBackupChain,
  checkAutoBackupExist: backupChainActions.checkAutoBackupExist, // 检查是否又自动备份链
  autoBackupSet: backupChainActions.autoBackupSet, // 设置自动备份
  autoBackupDetele: backupChainActions.autoBackupDetele, // 关闭定时备份
  updateAutoBackupSet: backupChainActions.updateAutoBackupSet, // 修改定时备份
  postRollback: backupChainActions.postRollback, // 回滚
  getRadosgwStatus: backupChainActions.getRadosgwStatus, // 检查是否配置了radosgw地址
})(BackupForm)
