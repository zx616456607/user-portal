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
import { Alert,Icon, Menu, Button, Card, Input, Tabs , Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import './style/CodeRepo.less'
const TabPane = Tabs.TabPane

let testData = [
  {
    'name': 'ant-design',
    'type':  1,
    'status': 0
  },
  {
    'name': 'ant-design-mobile',
    'type': 1,
    'status': 1
  },
  {
    'name': 'dashboard',
    'type': 2,
    'status': 1
  },
]


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

const MyComponent = React.createClass({
  propTypes: { 
  },
  getInitialState() {
    return { copySuccess: false ,keyModal: false}
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
  render: function () {
    const { config, scope , formatMessage } = this.props
    let items = config.map((item) => {
      return (
        <div className='CodeTable' key={item.name} >
          <div className="name">{item.name}</div>
          <div className="type">{item.type ==1 ? "public" : "private"}</div>
          <div className="action">
            {item.status ==1 ? 
            <Tooltip placement="right" title="将公钥添加到代码库后，可激活为构建项目">
              <Button type="primary" onClick={()=>{this.setState({keyModal: true})}}>公钥授权</Button>
            </Tooltip>
            :
            <Tooltip placement="right" title="可构建项目">
              <Button type="ghost">激活</Button>
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
            <Icon type="logout" style={{margin:'0 10px'}}/>
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

class CodeRepo extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentWillMount() {
    document.title = '关联代码库 | 时速云';
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    const gitlabBud = (
      <span className="section">
        <i className="icon gitlab"></i>
        gitlab
      </span>
    )
    const githubBud = (
      <span className="section">
        <i className="icon github"></i>
        github
      </span>
    )
    const svnBud = (
      <span className="section">
        <i className="icon svn"></i>
        SVN
      </span>
    )
    const bibucketBud = (
      <span className="section">
        <i className="icon bibucket"></i>
        <span className="node-number">10</span>
        bibucket
      </span>
    )
    return (
      <QueueAnim id='codeRepo'
        type='right'
        >
        <div className="codeContent">
          <div className='headBox'>
            <Link to="/ci_cd">
              <i className='fa fa-arrow-left' />&nbsp;
              <FormattedMessage {...menusText.back} />
            </Link>
            <p className="topText"><FormattedMessage {...menusText.creageCodeStore} /></p>
          </div>
          <div>
            <div className="card-container">
              <p style={{paddingLeft:'36px', lineHeight:'40px'}}>选择代码源</p>
              <Tabs type="card">
                <TabPane tab={gitlabBud} key="1"><MyComponent formatMessage={formatMessage} config={testData} /></TabPane>
                <TabPane tab={githubBud} key="2">选项卡二内容</TabPane>
                <TabPane tab={svnBud} key="3">选项卡三内容</TabPane>
                <TabPane tab={bibucketBud} key="4">无</TabPane>
              </Tabs>
            </div>
          </div>

        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}

CodeRepo.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect()(injectIntl(CodeRepo, {
  withRef: true,
}));

