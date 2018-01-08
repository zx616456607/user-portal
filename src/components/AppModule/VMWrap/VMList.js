/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 */

/**
 * VMWrap: vm list
 *
 * v0.1 - 2017-07-18
 * @author ZhaoYanbei
 */

import React from 'react'
import { Button, Table, Row, Card, Modal, Icon, Input, Pagination, Tooltip } from 'antd'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import './style/VMList.less'
import CommonSearchInput from '../../../components/CommonSearchInput'
import Title from '../../Title'
import { getVMinfosList, postVMinfoList, delVMinfoList, putVMinfoList, checkVMUser, checkVminfoExists } from '../../../actions/vm_wrap'
import reduce from '../../../reducers/vm_wrap'
import CreateVMListModal from './CreateVMListModal/createListModal'
import NotificationHandler from '../../../components/Notification'
import classNames from 'classnames'

class VMList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      modalTitle: true,
      editRows: [],
      isModal: false,
      isAdd: false,
      isPrompt: '',
      isShowText: false,
      isDelVisible: false,
      isDelete: false,
      ID: '',
      Name: '',
      creationTime: true,
      createTime: true,
      ciphertext: true,
      list: [],
      total: 0,
      host: '',
      isLoading: true,
    }
  }

  getInfo(n, value) {
    const { getVMinfosList } = this.props
    const { createTime } = this.state
    let notify = new NotificationHandler()
    const query = {
      page: n || 1,
      size: 10,
      name: value,
      sort: createTime ? "create_time" : "-create_time"
    }
    getVMinfosList(query, {
      success: {
        func: res => {
          res.results.map(item =>{
            item.createTime = item.createTime.replace('T',' ')
            item.createTime = item.createTime.split('.')[0]
          })
          if (res.statusCode === 200){
            this.setState({
              total: res.count,
              list: res.results,
              isLoading: false,
            })
          }
        },
        isAsync: true,
      },
      failed: {
        func: res => {
          this.setState({
            isLoading: false,
          })
          if (res.statusCode < 500) {
            notify.warn('获取数据失败', res.message || res.message.message)
          } else {
            notify.error('获取数据失败', res.message || res.message.message)
          }
        }
      },
      finally: {
        func: () => {
          this.setState({
            isLoading: false
          })
        }
      }
    })
  }

  componentWillMount() {
    this.getInfo(1, null)
  }

  /**
   * 回调添加
   * @param {*} state
   */
  vmAddList(state) {
    const { postVMinfoList, putVMinfoList } = this.props
    let notification = new NotificationHandler()
    let res = {
      /*vmInfoName: 'root',*/
      vmInfoID: this.state.editRows.vminfoId !== null ? this.state.editRows.vminfoId : '',
      host: state.host,
      account: state.account,
      password: state.password
    }
    if (this.state.isAdd) {
      postVMinfoList(res, {
        success: {
          func: res => {
            if (res.statusCode === 201) {
              notification.success(`添加成功`)
              notification.close()
              this.getInfo()
            }
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            if (err.statusCode === 400) {
              notification.error(err.message)
              return
            }
            notification.error(`添加失败`)
          }
        }
      })
    } else {
      putVMinfoList(res, {
        success: {
          func: res => {
            if (res.statusCode === 200) {
              notification.success(`修改成功`)
              notification.close()
              this.getInfo()
            }
          },
          isAsync: true,
        },
        failed: {
          func: err => {
            notification.error(`修改失败`)
          }
        }
      })
    }
  }

  /**
   * 添加信息
   */
  handleA() {
    this.setState({
      isDelVisible: true,
    })
    // this.setState({
    //   visible: true,
    //   modalTitle: true,
    //   isModal: true,
    //   isAdd: true
    // })
    // const self = this
    // setTimeout(() => {
    //   document.getElementById('host').focus()
    // },100)
    // setTimeout(function () {
    //   if (self.focusInput) {
    //     self.focusInput.refs.input.focus()
    //   }
    // }, 0)
  }

  /**
   * 编辑信息
   */
  handleE(row) {
    this.setState({
      editRows: row,
      visible: true,
      modalTitle: false,
      isModal: true,
      isAdd: false
    })
  }

  /**
   * 删除信息
   */
  handleDel() {
    const { delVMinfoList } = this.props
    let notification = new NotificationHandler()
    notification.spin(`删除 ${this.state.host} 中...`)
    this.state.isDelete ?
      delVMinfoList({
        vmID: this.state.ID
      }, {
          success: {
            func: res => {
              if (res.statusCode === 204) {
                notification.close()
                notification.success(`删除 ${this.state.host} 成功`)
                this.setState({
                  isDelVisible: false,
                  isDelete: false
                })
                this.getInfo()
              }
            },
            isAsync: true
          },
          failed: {
            func: () => {
              notification.error('删除失败！')
            }
          }
        }) : ''
  }

  /**
   * 信息验证
   * @param check
   */
  vmCheck(check) {
    const { checkVMUser } = this.props
    let query = {
      host: check.host,
      account: check.account,
      password: check.password
    }
    checkVMUser(query, {
      success: {
        func: res => {
          if (res.statusCode === 200) {
            return res.statusCode
          }
        }
      }, failed: {
        func: err => {
          this.setState({
            Prompt: false,
            isShow: false
          })
        }
      }
    })
  }

  /**
   * 查询
   * @param values
   */
  handleSearch(values) {
    this.setState({
      name: values
    })
    this.getInfo(1, values)
  }

  /**
   * 显示密文
   */
  handleChange(value) {
    this.setState({
      ciphertext: value
    })
  }

  /**
   * 关闭删除对话框
   */
  handleClose() {
    this.setState({
      isDelVisible: false
    })
  }

  /**
   * 确定删除
   */
  handleOK(ID, Name, host) {
    this.setState({
      isDelVisible: true,
      isDelete: true,
      ID: ID,
      Name: Name,
      host: host,
    })
  }

  handleSort() {
    const { createTime } = this.state
    this.getInfo(null);
    if (createTime) {
      this.setState({
        createTime: false
      })
    } else {
      this.setState({
        createTime: true
      })
    }
  }

  renderStatus(record) {
    let successCount = 0
    let errorCount = 0
    let startCount = 0
    let javaMessage = ''
    let tomcatMessage = ''
    switch (record.javaStatus) {
      case 0:
        javaMessage = 'jre启动中'
        startCount ++
        break
      case 1:
        javaMessage = 'jre停止'
        errorCount ++
        break
      case 2:
        javaMessage = 'jre运行中'
        successCount ++
        break
      default:
        break
    }
    switch (record.tomcatStatus) {
      case 0:
        tomcatMessage = 'tomcat启动中'
        startCount ++
        break
      case 1:
        tomcatMessage = 'tomcat停止'
        errorCount ++
        break
      case 2:
        tomcatMessage = 'tomcat运行中'
        successCount ++
        break
      default:
        break
    }
    return(
      <div>
        <div className={errorCount ? 'warnColor' : 'successColor'}>
          <i className={classNames("circle", {'successCircle': !errorCount, 'warnCircle': errorCount})}/>
          {successCount === 2 ? '正常' : ''}
          {errorCount ? '异常' : ''}
          {!errorCount && startCount ? '启动中' : ''}
        </div>
        <div>
          {
            successCount !== 2 &&
              <Tooltip
                title={
                  tomcatMessage + ' ' + javaMessage
                }
              >
                <Icon type="exclamation-circle-o" className="warnColor" style={{ marginRight: 5 }}/>
              </Tooltip>
          }
          {`${successCount}/2 运行中`}
          </div>
      </div>
    )
  }

  render() {
    const { data } = this.props
    const { ciphertext, list, total } = this.state
    const pagination = {
      simple: true,
      defaultCurrent: 1,
      defaultPageSize: 10,
      total: total,
      onChange: (n) => this.getInfo(n, null)
    }
    const columns = [
      {
        title: '虚拟机IP',
        dataIndex: 'host',
        key: 'host',
        ID: 'vminfoId'
      },
      {
        title: '运行状态',
        render: (text, record) => this.renderStatus(record)
      },
      {
        title: '登录账号',
        dataIndex: 'user',
        key: 'user',
      },
      {
        title: '登录密码',
        dataIndex: 'password',
        key: 'password',
        render: (text, record, index) =>
          ciphertext ?
            <div>
              <span ref="info" className="info">******</span>
              <Icon
                type={this.state.isShowText === 'eye' ? 'eye-o' : 'eye'}
                style={{ float: 'right', marginRight: 30 }}
                onClick={this.handleChange.bind(this, false)} />
            </div> :
            <div>
              <span ref="info" className="info">{text}</span>
              <Icon
                type={this.state.isShowText === 'eye' ? 'eye-o' : 'eye'}
                style={{ float: 'right', marginRight: 30 }}
                onClick={this.handleChange.bind(this, true)} />
            </div>
        ,
      },
      {
        title: '服务数量',
        dataIndex: 'serviceCount',
        key: 'serviceCount',
        sorter: (a, b) => a.serviceCount - b.serviceCount,
      },
      {
        title: (
          <div onClick={() => this.handleSort()}>
            创建时间
            <div className="ant-table-column-sorter">
              <span className={this.state.createTime ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'} title="↑">
                <i className="anticon anticon-caret-up" />
              </span>
              <span className={!this.state.createTime ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'} title="↓">
                <i className="anticon anticon-caret-down" />
              </span>
            </div>
          </div>
        ),
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: '操作',
        /*key: 'operation',*/
        ID: 'vminfoId',
        render: (text, record, index) => {
          let fStyle = {
            marginRight: '6%'
          }
          return (
            <div>
              <Button type="primary" className="tabBtn" onClick={this.handleE.bind(this, record)}>编辑信息</Button>
              <Button className="tabDel" onClick={this.handleOK.bind(this, record.vminfoId, record.user, record.host)}>删除</Button>
            </div>
          )
        }
      },
    ]
    const rowSelection = {
      // onSelect:(record)=> console.log(record),
      // onSelectAll: (selected, selectedRows)=>this.selectAll(selectedRows),
      onChange: (selectedRowKeys, selectedRows) => {
      }
    };
    const scope = this
    return (
      <QueueAnim>
        <div key="VMList" id="VMList">
          <Title title="传统应用环境"/>
          <Row>
            <Button type='primary' size='large' className='addBtn' onClick={() => this.handleA()}>
              <i className='fa fa-plus' /> 添加传统环境
            </Button>
            <Button type="ghost" size="large" className="manageBtn" onClick={() => this.getInfo(1, null)} ><i className='fa fa-refresh' /> 刷 新</Button>
            {/*<Button type="ghost" icon="delete" size="large" className="manageBtn">删除</Button>*/}
            {/* <Input className="search" placeholder="请输入虚拟机IP搜索" size="large" onSearch={(e) => this.handleSearch(e)} /> */}
            <CommonSearchInput onSearch={(value) => { this.getInfo(1, value) }} size="large" placeholder="请输入虚拟机IP搜索" />
            { total !== 0 && <Pagination className="pag" {...pagination} />}
            { total !== 0 && <span className="total">共 {total} 个</span>}
          </Row>
          <Table
            pagination={false}
            loading={this.state.isLoading}
            columns={columns}
            dataSource={list}
          />
          {
            this.state.isModal ?
              <CreateVMListModal
                scope={scope}
                modalTitle={this.state.modalTitle}
                visible={this.state.visible}
                onSubmit={this.vmAddList.bind(this)}
                Rows={this.state.editRows}
                isAdd={this.state.isAdd}
                Check={this.vmCheck.bind(this)}
              >
              </CreateVMListModal> : ''
          }
          <Row>
            <Modal
              title={"删除传统环境"}
              visible={this.state.isDelVisible}
              footer={[
                <Button key="back" size="large" type="ghost" onClick={() => this.handleClose()}>  取 消 </Button>,
                <Button key="submit" size="large" type="primary" onClick={() => this.handleDel()}> 确 定 </Button>,
              ]}
            >
              <div className="deleteHint"><i className="fa fa-exclamation-triangle"/>是否删除当前传统应用环境？</div>
              {/* <span style={{ fontSize: 16, color: '#ff0000' }}><Icon size={15} style={{ color: '#ff0000' }} type="question-circle-o" />是否删除当前传统应用环境</span> */}
            </Modal>
          </Row>
        </div>
      </QueueAnim>

    )
  }
}

function mapStateToProps(state, props) {
  return {}
}

export default connect(mapStateToProps, {
  getVMinfosList,
  delVMinfoList,
  postVMinfoList,
  putVMinfoList,
  checkVMUser,
  checkVminfoExists,
})(VMList)
