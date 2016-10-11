import React, { Component, PropTypes } from 'react'
import {Button, Icon } from 'antd'

export default class ModalDetail extends Component {
  constructor(){
    super()
  }
  render() {
    const { scope } = this.props
    return (
      <div className="modalWrap">
        <div className="modalHead">
          <img className="detailImg" src="/img/test/mysql.jpg" />
          <ul className="detailTitle">
            <li><div className="name">MySql-1</div></li>
            <li>
              <div className="desc">
                tenxcloud/mysql-stack
              </div>
            </li>
            <li><span>状态：</span><span className="normal">运行中</span></li>
          </ul>
          <div className="danger">
            <Icon type="cross" className="cursor" onClick={() => {scope.setState({detailModal: false})}} />
            <div className="li"><Button size="large" className="btn-danger" type="ghost" onClick={(name) => this.deleteCluster('mysql-1')}><Icon type="delete" />删除集群</Button></div>
          </div>
        </div>
        <div className="modalDetailBox">
          <div className="configContent">
            <div className="configHead">配置信息</div>
            <div className="configList"><span className="listKey"><Icon type="link" />&nbsp;访问地址：</span><span className="listLink">tcp://xhesfdsjl.baidu.com:8088</span></div>
            <div className="configList"><span className="listKey">副本数：</span>996/999个</div>
            <div className="configHead">参数</div>
            <ul className="parse-list">
              <li><span className="key">key</span> <span className="value">value</span></li>
              <li><span className="key">username</span> <span className="value">mysql-admin</span></li>
              <li><span className="key">password</span> <span className="value">value</span></li>
              <li><span className="key">InstanceId</span> <span className="value">uuid-md5-1212555-xxlos</span></li>
              <li><span className="key">volume</span> <span className="value">volume-value-1212555-xxlos</span></li>
            </ul>

          </div>
        </div>
      </div>
    )
  }

}

ModalDetail.PropTypes = {
  // closeDetailModal: PropTypes.func.isRequired
}
