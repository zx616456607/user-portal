import React from 'react'
import { Modal, Row, Col, Switch, InputNumber, Icon } from 'antd'
import BackupStrategy from '../../containers/DatabaseCache/BackupStrategy'
import NotificationHandler from '../../../src/components/Notification'
import { connect } from 'react-redux'
import {
  autoBackupSet,
  autoBackupDetele,
  updateAutoBackupSet,
  checkAutoBackupExist,
} from '../../actions/backupChain'

const notification = new NotificationHandler()

class AutoBackupModal extends React.Component {
  state = {
    days: [ '0', '1', '2', '3', '4', '5', '6' ],
    daysConvert: [ '1', '2', '3', '4', '5', '6', '0' ],
    autoBackupSwitch: false,
    hour: '1',
    minutes: '0',
    pending: false,
    flag: true,
    notYet: true, // 标识有没有请求回数据
  }

  // 获取选择备份周期
  selectPeriod = (week, index) => {
    const { days } = this.state
    const localWeeks = JSON.parse(JSON.stringify(days))
    localWeeks[index] = localWeeks[index] ? false : week.en
    // 转换周期格式（仅天）参考格式： http://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/crontab.html
    const newDays = localWeeks.filter(v => v !== false)
    if (newDays[0] === '0') {
      newDays.push(newDays.shift())
    }
    this.setState({
      days: localWeeks,
      daysConvert: newDays,
    })
  }
  // 确定
  handleAutoBackupOk = () => {
    const { database,
      closeModal,
      clusterID,
      databaseInfo,
      onSubmitSuccess,
    } = this.props
    const { hour, minutes, daysConvert } = this.state
    // const schedule = `${minutes} ${hour} * * ${daysConvert.join(',').replace(/,/g, ' ')}`
    const schedule = `${minutes} ${hour} * * ${daysConvert.join(',')}`
    this.setState({ pending: true })
    if (!this.state.autoBackupSwitch) {
      // 如果开关关闭，说明要关闭自动备份, redis和mysql的关闭方法不一样，前者调用修改接口，后者调用删除接口
      if (database === 'redis') {
        const postData = { schedule: '' }
        this.props.updateAutoBackupSet(
          clusterID,
          database,
          databaseInfo.objectMeta.name, postData, {
            success: {
              func: () => {
                closeModal()
                notification.success('关闭自动备份成功')
                this.setState({ pending: false })
                setTimeout(() => {
                  onSubmitSuccess()
                })
              },
            },
          })
      } else if (database === 'mysql') {
        this.props.autoBackupDetele(clusterID, database, databaseInfo.objectMeta.name, {
          success: {
            func: () => {
              notification.success('关闭自动备份成功')
              this.setState({ pending: false })
              setTimeout(() => {
                onSubmitSuccess()
              })

            },
          },
          failed: {
            func: () => {
              notification.warn('关闭自动备份失败')
              this.setState({ pending: false })
            },
          },
        })
      }
    } else {
      const postData = { schedule }
      // 如果已经设置过自动备份，说明要修改，调用修改接口
      if (this.props.hadSetAutoBackup) {
        this.props.updateAutoBackupSet(
          clusterID, database, databaseInfo.objectMeta.name, postData, {
            success: {
              func: () => {
                closeModal()
                notification.success('修改自动备份成功')
                this.setState({ pending: false })
                setTimeout(() => {
                  onSubmitSuccess()
                })
              },
            },
          })
      } else {
        // 否则是已经关闭了自动备份，需要调用设置接口
        this.props.autoBackupSet(clusterID, database, databaseInfo.objectMeta.name, postData, {
          success: {
            func: () => {
              closeModal()
              notification.success('设置自动备份成功')
              this.setState({ pending: false })
              setTimeout(() => {
                onSubmitSuccess()
              })

            },
          },
          failed: {
            func: () => {
              notification.warn('设置自动备份失败')
              this.setState({ pending: false })
            },
          },
        })
      }
    }
  }

  statusSwitch = val => {
    this.setState({
      autoBackupSwitch: val,
    })
  }
  // 获取小时
  hour = h => {
    this.setState({ hour: `${h}` })
  }
  // 获取分钟
  minutes = m => {
    this.setState({ minutes: `${m}` })
  }
  differentiation = (arr, subArr) => {
    const temp = []
    for (const key in arr) {
      let count = 0
      for (let j = 0; j < subArr.length; j++) {
        if (arr[key] === subArr[j]) {
          count++
        }
      }
      if (count === 0) {
        temp.push(arr[key])
      }
    }
    for (let k = 0; k < temp.length; k++) {
      if (arr.indexOf(temp[k]) >= 0) {
        arr[arr.indexOf(temp[k])] = false
      }
    }
  }
  getDerivedStateFromProps(nextProps) {
    if (this.props.hadSetAutoBackup !== nextProps.hadSetAutoBackup) {
      this.setState({
        autoBackupSwitch: nextProps.hadSetAutoBackup,
      })
    }
    if (nextProps.hadSetAutoBackup && nextProps.isShow) {
      const { databaseInfo, clusterID, database } = nextProps
      const name = databaseInfo.objectMeta.name
      if (this.state.flag) {
        this.props.checkAutoBackupExist(clusterID, database, name, {
          success: {
            func: res => {
              this.setState({
                notYet: false,
              })
              if (database === 'redis') {
                // 如果有数据或者数据内的schedule字段不为空,说明开启了自动备份。把控制自动备份开关的state置为true
                if (res.data.length !== 0 && res.data[0] && res.data[0].schedule !== '') {
                  const schedule = res.data[0].schedule.split(' ')
                  const { days } = this.state
                  const scheduleDays = schedule[4].split(',')
                  this.differentiation(days, scheduleDays)
                  this.setState({
                    minutes: schedule[0],
                    hour: schedule[1],
                    days: days.splice(0),
                  })

                  return
                }

              } else if (database === 'mysql') {
                if (res.data.schedule !== '') {
                  const schedule = res.data.schedule.split(' ')
                  const { days } = this.state
                  const scheduleDays = schedule[4].split(',')
                  this.differentiation(days, scheduleDays)
                  this.setState({
                    minutes: schedule[0],
                    hour: schedule[1],
                    days: days.splice(0),
                  })

                  return
                }
              }
            },
          },
          failed: {
            func: () => {
              notification.warn('检查是否有自动备份失败')
              this.setState({
                days: [ '0', '1', '2', '3', '4', '5', '6' ],
                daysConvert: [ '1', '2', '3', '4', '5', '6', '0' ],
                hour: '1',
                minutes: '0',
                flag: true,
                notYet: false,
              })

            },
          },
        }) // 检查是否有自动备份
        this.setState({
          flag: false,
        })
      }

    } else {
      this.setState({
        days: [ '0', '1', '2', '3', '4', '5', '6' ],
        daysConvert: [ '1', '2', '3', '4', '5', '6', '0' ],
        hour: '1',
        minutes: '0',
        flag: true,
        notYet: false,
      })
    }
  }
  render() {
    const { database, isShow, databaseInfo, closeModal } = this.props
    const { hour, minutes, notYet } = this.state
    return <Modal
      visible={isShow}
      title={database === 'redis' ? '设置自动全量备份' : '设置自动差异备份（基于当前链）'}
      onOk={this.handleAutoBackupOk}
      confirmLoading={this.state.pending}
      onCancel={() => closeModal()}
      width={650}
    >
      <div className="dbClusterBackup-autoContent">
        <Row className="item">
          <Col span={4} className="title">备份集群</Col>
          <Col span={19} push={1}>{databaseInfo && databaseInfo.objectMeta.name}</Col>
        </Row>
        <Row className="item">
          <Col span={4} className="title">状态</Col>
          <Col span={3} push={1}>
            <Switch checkedChildren="开" onChange={this.statusSwitch} unCheckedChildren="关" checked={this.state.autoBackupSwitch} />
          </Col>
          <Col span={1} push={1}>
            <Icon type="info-circle-o" />
          </Col>
          <Col span={12} push={1} className="tip">
            {
              database === 'mysql' ?
                '开启自动备份后，将基于当前链路中的全量备份自动差异备份运行中的集群'
                :
                '开启自动备份后，将自动全量备份运行中的集群'
            }
          </Col>
        </Row>
        {
          this.state.autoBackupSwitch &&
          <div>
            <Row className="item">
              <Col span={4} className="title">备份周期</Col>
              <Col span={19} push={1}>
                <BackupStrategy
                  disabled={notYet} weeksSelected={this.state.days} setPeriod={this.selectPeriod}/>
              </Col>
            </Row>
            <Row className="item">
              <Col span={4} className="title">备份时间</Col>
              <Col span={19} push={1}>
                <div>
                  <InputNumber min={0}
                    max={24}
                    value={hour} disabled={notYet} onChange={this.hour} />
                  <span className="text">时</span>
                  <InputNumber min={0}
                    max={60} value={minutes} disabled={notYet} onChange={this.minutes} />
                  <span className="text">分</span>
                </div>
              </Col>
            </Row>
          </div>
        }
      </div>
    </Modal>

  }
}
const mapStateToProps = state => {
  const { clusterID } = state.entities.current.cluster
  return {
    clusterID,
  }
}
export default connect(mapStateToProps, {
  autoBackupSet,
  autoBackupDetele,
  updateAutoBackupSet,
  checkAutoBackupExist,
})(AutoBackupModal)
