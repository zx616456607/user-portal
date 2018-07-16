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
import { getbackupChainDetail, getbackupChain } from '../../../actions/backupChain'
import rollback from '../../../assets/img/database_cache/rollback.png'
import create from '../../../assets/img/database_cache/new.png'
import BackupStrategy from '../BackupStrategy'
const Panel = Collapse.Panel
const RadioGroup = Radio.Group
const FormItem = Form.Item
class Backup extends React.Component {
  state= {
    extendId: '',
    expendKeys: [], // 用expendKeys和keys做对比，keys多出来的那一项是当前展开的
    currentItem: '', // 为了标记当前展开的高亮
    autoBackupModalShow: false, // 自动备份弹框
    manualBackupModalShow: false, // 手动备份弹框
    curentChain: '', // 点击手动备份或者备份链的加号，将当前链或者当前点击的备份链信息存到这里
    backupType: 0,
    rollBackAlert: false, // 回滚操作弹框显示隐藏
    notYetConfirm: true, // 确认回滚勾选
    delThis: false, // 删除备份链弹框显示隐藏
    backupChain: '', // 当前操作的备份点
  }
  componentDidMount() {
    this.props.getbackupChain()
  }
  renderHeader = v => {
    return (
      <Row className="list-item-header" ref="header" key={v.id} style={ this.state.currentItem === `${v.id}` ? { background: '#fafafa' } : {}}>
        <Col span={4}>
          {v.name}
          <span>"当前链"</span>
        </Col>
        <Col span={4}>{v.capacity}</Col>
        <Col span={4}>备份点{v.pointNum}个</Col>
        <Col span={4}>{calcuDate(v.creattTime)}</Col>
      </Row>)
  }
  expendPanel = keys => {
    if (keys.length === 0) {
      this.setState({
        currentItem: '',
      })
      return
    }
    // 当expendKeys中找不到keys中的最后一项，说明第一次展开，去请求数据
    if (this.state.expendKeys.indexOf(keys[keys.length - 1]) < 0) {
      this.setState({
        expendKeys: keys,
        currentItem: keys[keys.length - 1],
      })
      this.props.getbackupChainDetail(`${keys[keys.length - 1]}`)
    } else {
      this.setState({
        currentItem: '',
      })
    }
  }
  rollBackAlert = () => {
    const confirmRollBack = () => {
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
          此操作不可恢复，确定删除此备份点xxx吗？
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
  menualBackup = chain => {
    this.setState({
      manualBackupModalShow: true,
      curentChain: chain,
    })
  }
  // 自动备份弹窗组件
  autoBackupModal = () => {
    // 确定
    const handleAutoBackupOk = () => {
      this.setState({
        autoBackupModalShow: false,
      })
    }
    // 获取选择备份周期
    const selectPeriod = () => {
      // console.log(period)
    }
    const statusSwitch = () => {
      // console.log(val)
    }
    // 获取小时
    const hour = () => {
      // console.log(time)
    }
    // 获取分钟
    const minutes = () => {
      // console.log(time)
    }
    return <Modal
      visible={this.state.autoBackupModalShow}
      title="设置自动备份"
      onOk={handleAutoBackupOk}
      onCancel={() => this.setState({
        autoBackupModalShow: false,
      })}
      width={650}
    >
      <div className="autoContent">
        <Row className="item">
          <Col span={4} className="title">备份集群</Col>
          <Col span={19} push={1}>123</Col>
        </Row>
        <Row className="item">
          <Col span={4} className="title">状态</Col>
          <Col span={19} push={1}>
            <Switch checkedChildren="开" onChange={statusSwitch} unCheckedChildren="关" defaultChecked />
          </Col>
        </Row>
        <Row className="item">
          <Col span={4} className="title">备份周期</Col>
          <Col span={19} push={1}>
            <BackupStrategy setPeriod={selectPeriod}/>
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
    </Modal>
  }

  // 手动弹窗组件
  manualBackupModal = () => {
    const tipText1 = `将在${this.state.curentChain.name}备份链上做差异备份`
    const tipText2 = '新建备份链后，自动备份和手动备份的差异备份将在新建备份链上进行'
    // 选择备份方式
    const selectBackupType = e => {
      this.setState({
        backupType: e.target.value,
      })
    }

    // 提交
    const commitBackup = () => {
      this.props.form.validateFields(errors => {
        if (errors) {
          return
        }
      })
    }
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
      },
    }

    const { getFieldProps } = this.props.form
    const prefix = `${this.state.backupType === 0 ? '增量' : '全量'}`
    const nameCheck = getFieldProps('name', {
      rules: [{ required: true, message: `请输入${prefix}备份名称`, whitespace: true }],
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
            <RadioGroup onChange={selectBackupType} defaultValue={0}>
              <Radio value={0}>原备份链上差异备份</Radio>
              <Radio value={1}>新建备份链</Radio>
            </RadioGroup>
            <div className="tip">
              {this.state.backupType === 0 ? tipText1 : tipText2}
            </div>
            <FormItem
              {...formItemLayout}
              label={`${prefix}备份名称`}
            >
              <Input placeholder= {`请输入${prefix}备份名称`} id="name" {...nameCheck} style={{ width: 200 }}/>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  }

  render() {
    const { chainsData } = this.props
    return <div className="backup">
      <div className="title">备份</div>
      <div className="content">
        <div className="operation">
          <div className="status">
            自动备份：<span style={{ color: '#5cb85c' }}>已开启</span>
          </div>
          {/* 初次备份时候，自动备份禁用 */}
          <Button type="primary" disabled={chainsData.length === 0} onClick={this.autoBackup}>设置自动备份</Button>
          <Button onClick={() => this.menualBackup(chainsData[0])}>手动备份</Button>
        </div>
        <div className="list">
          <Collapse onChange={this.expendPanel}>
            {
              chainsData.map((v, i) => {
                return <Panel header={this.renderHeader(v, i)} key={v.id}>
                  <div className="new-point" onClick={() => this.menualBackup(chainsData[i])} >
                    <div className="line"></div>
                  </div>
                  {
                    v.children ?
                      <Timeline>
                        {
                          v.children.map(k => (
                            <Timeline.Item
                              dot={k.backupType === '5' ? this.fullBackupPoint(k.status) : ''}
                              key={k.id}
                              color={this.pointClass(k.status).color}>
                              <Row>
                                <Col span={5}>{formatDate(k.time)}</Col>
                                <Col span={5}>{k.size}</Col>
                                <Col span={5}>{k.type}</Col>
                                <Col span={5}>
                                  <span className={ `status ${this.pointClass(k.status).className}` }>
                                    {this.pointStatus(k.status)}
                                  </span>
                                </Col>
                                <Col span={4}>
                                  <Dropdown.Button overlay={this.backupPointmenu(k)} type="ghost">
                                    <Icon type="setting" />
                                    操作
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
  const { chains } = state.backupChain
  const chainsData = chains.data || []
  return {
    chainsData,
  }
}
const BackupForm = Form.create()(Backup)
export default connect(mapStateToProps, {
  getbackupChainDetail,
  getbackupChain,
})(BackupForm)
