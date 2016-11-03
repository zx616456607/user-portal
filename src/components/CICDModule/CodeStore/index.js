 /**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CodeStore component
 *
 * v0.1 - 2016-10-31
 * @author BaiYu
 */
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
// import CreateTenxFlow from './CreateTenxFlow.js'
// import TestModal from '../../TerminalModal'
import './style/CodeStore.less'

let testData = [
  {
    'name': 'test1',
    'updateTime': 1,
    'status': 'finish'
  },
  {
    'name': 'test2',
    'updateTime': 2,
    'status': 'running'
  },
  {
    'name': 'test3',
    'updateTime': 1,
    'status': 'finish'
  },
  {
    'name': 'test4',
    'updateTime': 2,
    'status': 'fail'
  }
]

const menusText = defineMessages({
  tooltips: {
    id: 'CICD.TenxStorm.tooltips',
    defaultMessage: '代码仓库：这里完成构建前的准备的工作，开发者可以在这里关联企业里业务代码所在的托管仓库，关联好的代码仓库后，选择激活代码项目为可构建状态，后便后续构建Flow里选择可构建的代码库。',
  },
  show: {
    id: 'CICD.TenxStorm.show',
    defaultMessage: '查看公钥',
  },
  name: {
    id: 'CICD.TenxStorm.name',
    defaultMessage: '名称',
  },
  attr: {
    id: 'CICD.TenxStorm.attr',
    defaultMessage: '属性',
  },
  action: {
    id: 'CICD.TenxStorm.action',
    defaultMessage: '操作',
  },
  codeSrc: {
    id: 'CICD.TenxStorm.codeSrc',
    defaultMessage: '代码源',
  },
  linkCode: {
    id: 'CICD.TenxStorm.linkCode',
    defaultMessage: '关联代码库',
  },
  releaseActivation: {
    id: 'CICD.TenxStorm.releaseActivation',
    defaultMessage: '解除激活',
  },
  search: {
    id: 'CICD.TenxStorm.search',
    defaultMessage: '搜索',
  },
  copySuccess: {
    id: 'CICD.TenxStorm.copySuccess',
    defaultMessage: '复制成功'
  },
  copyBtn: {
    id: 'CICD.TenxStorm.copyBtn',
    defaultMessage: '复制'
  },
  clickCopy: {
    id: 'CICD.TenxStorm.clickCopy',
    defaultMessage: '点击复制'
  }
})

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  getInitialState() {
    return { showModal: false ,keyModal: false}
  },
  operaMenuClick: function (item, e) {
    //this function for user click the dropdown menu
    console.log(item, e)
    switch(e.key) {
      case '1':
      this.setState({showModal: true})
      break;
      case '2':
      this.setState({keyModal: true})
      break;
      default:
      this.setState({showModal: true})
    }
  },
  showItemKeyModal() {
    this.setState({keyModal: true})
  },
  copyDownloadCode() {
    //this function for user click the copy btn and copy the download code
    const scope = this;
    let code = document.getElementsByClassName("CodeCopy");
    code[0].select();
    document.execCommand("Copy", false);
    scope.setState({
      copySuccess: true
    });
  },
  returnDefaultTooltip() {
    const scope = this;
    setTimeout(function () {
      scope.setState({
        copySuccess: false
      });
    }, 500);
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
      const dropdown = (
        <Menu onClick={this.operaMenuClick.bind(this, item)}
          style={{ width: '100px' }}
          >
          <Menu.Item key='1'>
            <i className='fa fa-eye' />&nbsp;
            WebHook
          </Menu.Item>
          <Menu.Item key='2'>
            <span><i className='fa fa-trash' />&nbsp;
            <FormattedMessage {...menusText.show} />
            </span>
          </Menu.Item>
          <Menu.Item key='3'>
            <span><i className='fa fa-trash' />&nbsp;
            <FormattedMessage {...menusText.releaseActivation} />
            </span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='CodeTable' key={item.name} >
          <div className='name'>
            <Link to='/ci_cd/tenx_flow/tenx_flow_build'>
              <span>{item.name}</span>
            </Link>
          </div>
          {item.updateTime == 2 ? 
            <div className='type private'>
              <i className="fa fa-unlock-alt"></i>&nbsp;
              <span className="margin">public</span>
              <Button type="ghost" onClick={this.showItemKeyModal}><i className="fa fa-eye"></i> 查看公钥</Button>
            </div>
          :
            <div className="type public">
              <i className="fa fa-lock"></i>&nbsp;
              <span className="margin">private</span>
              
            </div>
          }
          <div className='codelink'>
            {item.status}
          </div>
          <div className='action'>
          
            <Dropdown.Button overlay={dropdown} type='ghost'>
              <i className='fa fa-pencil-square-o' />&nbsp;
              <FormattedMessage {...menusText.releaseActivation} />
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className='CodeStore'>
        {items}

        <Modal title="手动添加WebHook" visible={this.state.showModal}
         footer={[
            <Button key="back" type="ghost" size="large" onClick={()=>{this.setState({showModal: false})}}>关闭</Button>,
          ]}
         >
          <div style={{padding:"0 20px"}}>
            <p style={{lineHeight:'30px'}}>检测到关联的代码托管系统： XXX仓库， API老旧请手动：</p>
            <p style={{lineHeight:'40px'}}>* 将该URL填入到github 项目的Web Hooks URLk</p>
            <p><Input type="textarea" className="CodeCopy" autosize={{ minRows: 2, maxRows: 6 }} defaultValue="http://gitlab.tenxcloud.com/zhangpc/user-portal/commits/dev-branch"/></p>
            <p style={{marginTop:'10px'}}>
            <Tooltip title={this.state.copySuccess ? formatMessage(menusText.copySuccess) : formatMessage(menusText.clickCopy)} placement="right">
              <Button type="primary" size="large" onClick={this.copyDownloadCode} onMouseLeave={this.returnDefaultTooltip}><FormattedMessage {...menusText.copyBtn} /></Button>
            </Tooltip>
          </p>
          </div>
        </Modal>

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

class CodeStore extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    document.title = '代码仓库 | 时速云';
  }


  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    return (
      <QueueAnim className='TenxFlowList'
        type='right'
        >
        <div id='CodeStore' key='CodeStore'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='operaBox'>
            <Link to="/ci_cd/coderepo">
            <Button className='createBtn' size='large' type='primary'>
              <i className='fa fa-plus' />&nbsp;
              <FormattedMessage {...menusText.linkCode} />
            </Button>
            </Link>
            <Input className='searchBox' placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search'></i>
            <div style={{ clear: 'both' }}></div>
          </div>
          <Card className='tenxflowBox'>
            <div className='titleBox' >
              <div className='name'>
                <FormattedMessage {...menusText.name} />
              </div>
              <div className='type'>
                <FormattedMessage {...menusText.attr} />
                <i className="fa fa-filter" aria-hidden="true"></i>
              </div>
              <div className='codelink'>
                <FormattedMessage {...menusText.codeSrc} />
              </div>
              <div className='action'>
                <FormattedMessage {...menusText.action} />
              </div>
            </div>
            <MyComponent scope={scope} formatMessage={formatMessage} config={testData} />
          </Card>
        </div>
      
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}

CodeStore.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect()(injectIntl(CodeStore, {
  withRef: true,
}));

