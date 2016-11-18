 /**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * codeRepo component
 *
 * v0.1 - 2016-10-31
 * @author BaiYu
 */
import React, { Component, PropTypes } from 'react'
import { Alert,Icon, Menu, Button, Card, Input, Tabs , Tooltip,message, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

const TabPane = Tabs.TabPane

const menusText = defineMessages({
  search: {
    id: 'CICD.TenxStorm.search',
    defaultMessage: '搜索',
  },
  publicKey: {
    id: 'CICD.TenxStorm.publicKey',
    defaultMessage: '公钥授权',
  },
  back: {
    id: 'CICD.TenxStorm.back',
    defaultMessage: '返回',
  },
  creageCodeStore: {
    id: 'CICD.TenxStorm.creageCodeStore',
    defaultMessage: '创建代码仓库',
  },
  logout: {
    id: 'CICD.TenxStorm.logout',
    defaultMessage: '注销',
  },
  clickCopy: {
    id: 'CICD.TenxStorm.clickCopy',
    defaultMessage: '点击复制',
  },
  copyBtn: {
    id: 'CICD.TenxStorm.copyBtn',
    defaultMessage: '复制',
  },
  copySuccess: {
    id: 'CICD.TenxStorm.copySuccess',
    defaultMessage: '复制成功',
  },
})

const GithubComponent = React.createClass({
  propTypes: { 
  },
  getInitialState() {
    return { 
      copySuccess: false ,keyModal: false,
      regUrl: '',
      regToken:''
    }
  },
 copyItemKey() {
    const scope = this;
    let code = document.getElementsByClassName("KeyCopy");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  },
  addBuild(item) {
    this.props.scope.props.addCodeRepo('gitlab',item)
  },
  removeRepo() {
    const scope = this.props.scope
    const repoItem = scope.state.repokey
    Modal.confirm({
      title: '注销代码源',
      content: '您是否确认要注销这项代码源',
      onOk() {
        scope.props.deleteRepo(repoItem)
      },
      onCancel() {},
    });
  },
  registryRepo() {
    const url= this.state.regUrl
    const token = this.state.regToken
    if (!url) {
      message.info('地址不能为空')
      return
    }
    if (!token) {
      message.info('Private Token不能为空')
      return
    }
    const config = {
      url,
      token,
      type: this.props.scope.state.repokey
    }
    const self = this
    this.props.scope.props.registryRepo(config, {
      success: {
        func: ()=> {
          self.setState({
            authorizeModal: false,
            regUrl:'',
            regToken:''
          })
          self.props.scope.props.getRepoList(config.type)
        },
        isAsync: true
      }
    })
  },
  changeUrl(e) {
    this.setState({regUrl: e.target.value})
  },
  changeToken(e) {
    this.setState({regToken: e.target.value})
  },
  render: function () {
    const { config, scope , formatMessage } = this.props
    
    if (!config) {
      return (
        <div style={{lineHeight:'150px', paddingLeft:'250px'}}>
          <Button type="primary" size="large" onClick={()=>this.setState({authorizeModal: true})}>授权同步代码源</Button>
          <Modal title="授权同步代码源" visible={this.state.authorizeModal} onOk={()=>this.registryRepo() } onCancel={()=>this.setState({authorizeModal: false})}
          >
            <div style={{ padding: "0 20px" }}>
              <p style={{ lineHeight: '30px' }}>仓库地址：
                <Input placeholder="http://*** | https://***" onChange={this.changeUrl} value={this.state.regUrl} size="large" />
              </p>
              <p style={{ lineHeight: '30px' }}>Private Token:
                <Input placeholder="Private Token: " size="large" onChange={this.changeToken} value={this.state.regToken} />
              </p>
            </div>
           
          </Modal>
        </div>
      )
    }
    let items = config.map((item) => {
      return (
        <div className='CodeTable' key={item.name} >
          <div className="name">{item.name}</div>
          <div className="type">{item.type == false ? "public" : "private"}</div>
          <div className="action">
            {item.status ==1 ? 
            <Tooltip placement="right" title="将公钥添加到代码库后，可激活为构建项目">
              <Button type="primary" onClick={()=>{this.setState({keyModal: true})}}>公钥授权</Button>
            </Tooltip>
            :
            <Tooltip placement="right" title="可构建项目">
              <Button type="ghost" onClick={()=>this.addBuild(item)} >激活</Button>
            </Tooltip>
          }
          </div>

        </div>
      );
    });
    return (
      <div className='codelink'>
        <div className="tableHead">
          <Icon type="user" /> shwsosfs
          <Tooltip placement="top" title={formatMessage(menusText.logout)}>
            <Icon type="logout" onClick={()=>this.removeRepo()} style={{margin:'0 10px'}}/>
          </Tooltip>
          <Icon type="reload" />
          <div className="right-search">
            <Input className='searchBox' size="large" style={{width:'180px'}} placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search'></i>
          </div>
        </div>

        { items }

        <Modal title="项目公钥" visible={this.state.keyModal}
         footer={[
            <Button key="back" type="ghost" size="large" onClick={()=>{this.setState({keyModal: false})}}>关闭</Button>,
          ]}
         >
          <div style={{padding:"0 20px"}}>
            <p style={{lineHeight:'30px'}}>检测到关联的代码托管系统：</p>
            <p style={{lineHeight:'40px'}}><span style={{color:'#00A0EA'}} className="name">zubis 仓库</span>  <span style={{color:'#00A0EA'}} className="type">属性：私有</span> </p>

            <p style={{lineHeight:'40px'}}>* 请手动配置一下公钥到github 项目中</p>
            <p style={{marginBottom: '10px'}}><Input type="textarea" className="KeyCopy" autosize={{ minRows: 2, maxRows: 6 }} defaultValue="ssssss-keyvalueslfjsldfldsflkdjsfjdsfdsfkldsfhttp://gitlab.tenxcloud.comanch"/></p>
            <p style={{lineHeight:'40px'}}>
            <Tooltip title={this.state.copySuccess ? formatMessage(menusText.copySuccess) : formatMessage(menusText.clickCopy)} placement="right">
              <Button type="primary" size="large" onClick={this.copyItemKey} onMouseLeave={this.returnDefaultTooltip}><FormattedMessage {...menusText.copyBtn} /></Button>
            </Tooltip>
          </p>
          </div>
        </Modal>

      </div>
    );
  }
});

export default GithubComponent