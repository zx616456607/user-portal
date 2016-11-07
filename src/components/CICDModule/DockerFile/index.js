 /**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * DockerFile component
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
import './style/DockerFile.less'

let testData = [
  {
    'name': '4399',
    'tenxFlow': '微信Login联合项目',
    'time': '7天8小时前'
  },
  {
    'name': 'private_dashboard',
    'tenxFlow': 'dashboard',
    'time': '5天前'
  },
  {
    'name': 'user_admin',
    'tenxFlow': 'admin',
    'time': '1天前'
  },
  {
    'name': 'dev_cmall',
    'tenxFlow': 'cmall',
    'time': '1个月前'
  }
]

const menusText = defineMessages({
  tooltips: {
    id: 'CICD.DockerFile.tooltips',
    defaultMessage: '云端DockerFile: 这里保存您在TenxFlow过程中创建的云端Dockerfile，方便再次查看或使用。（这里以使用Dockerfiler，对应TenxFlow子项目名称作为识别标识）',
  },
  show: {
    id: 'CICD.DockerFile.show',
    defaultMessage: '查看DockerFile',
  },
  editDockerFile: {
    id: 'CICD.DockerFile.editDockerFile',
    defaultMessage: '编辑DockerFile',
  },
  itemName: {
    id: 'CICD.DockerFile.itemName',
    defaultMessage: '子项目名称',
  },
  editTime: {
    id: 'CICD.DockerFile.editTime',
    defaultMessage: '编辑时间',
  },
  action: {
    id: 'CICD.DockerFile.action',
    defaultMessage: '操作',
  },
  search: {
    id: 'CICD.DockerFile.search',
    defaultMessage: '搜索',
  }
})

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  getInitialState() {
    return { showDockerFileModal: false ,keyModal: false}
  },
  operaMenuClick: function (item, e) {
    //this function for user click the dropdown menu
    this.setState({showDockerFileModal: true})
  
  },
  showDockerfileModal(name) {
    this.setState({showDockerFileModal: true})
  },
  
  render: function () {
    const { config, scope , formatMessage } = this.props
    let items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.operaMenuClick.bind(this, item)} >
          <Menu.Item key='1'>
            <span><i className='fa fa-eye' />&nbsp;
            <FormattedMessage {...menusText.show} />
            </span>
          </Menu.Item>
          <Menu.Item key='2'>
            <span><i className='fa fa-pencil-square-o'></i>&nbsp;
            <FormattedMessage {...menusText.editDockerFile} />
            </span>
          </Menu.Item>

        </Menu>
      );
      return (
        <div className='CodeTable' key={item.name} >
          <div className='name'>
            {item.name}
          </div>
          <div className='type'>
            {item.tenxFlow}
          </div>
           
          <div className='editTime'>
            {item.time}
          </div>
          <div className='action'>
          
            <Dropdown.Button overlay={dropdown} onClick={()=>this.showDockerfileModal(item.name)} type='ghost'>
              <i className='fa fa-eye' />&nbsp;
              <FormattedMessage {...menusText.show} />
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className='CodeStore'>
        {items}

        <Modal title="DockerFile" width="600px" visible={this.state.showDockerFileModal} wrapClassName="dockerFileModal" onCancel={()=>{this.setState({showDockerFileModal: false})}}
         footer={null}
         >
          <div style={{padding:"0 20px 20px"}}>
            <p style={{lineHeight:'30px'}}># 基于jenkineg:1.69官方镜像</p>
            <p style={{lineHeight:'40px'}}>FROM jekking:1.69</p>
            <div className="hrs"></div>
            <p style={{marginTop:'10px'}}>USER root</p>
            <p style={{marginTop:'10px'}}># 安装sudo</p>
            <p style={{marginTop:'10px'}}>RUN apt-get update\</p>
            <p style={{marginTop:'10px'}}>  &nbsp;&nbsp; &&apt-get install -y sudo\</p>
            <p style={{marginTop:'10px'}}>  &nbsp;&nbsp; &&rm -rf /var/lib/apt/list*/*</p>
            <p style={{marginTop:'10px'}}> # 给jekking用户赋予sudo权限</p>
            <p style={{marginTop:'10px'}}> RUN echo "jekking ALL =NOPASSWORD：ALL">>/etc/sudoers</p>
            <div className="hrs"></div>
            <p style={{marginTop:'10px'}}> USER jekking</p>
            <p style={{marginTop:'10px'}}> #plusg.text 拷贝</p>
            <p style={{marginTop:'10px'}}> COPY plusg.text /user/local/bin/plusg.sh 可以参考jenkins官方镜像源码https://github.com/jenking/dockerFile RUN /user/local/bin/placeholder.sh /user/local/sharh/jekking/plusg.text</p>
          </div>
        </Modal>

        
      </div>
    );
  }
});

class DockerFile extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    document.title = 'DockerFile | 时速云';
  }


  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    return (
      <QueueAnim className='TenxFlowList'
        type='right'
        >
        <div id='dockerFile' key='dockerFile'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='operaBox'>
            <Input className='searchBox' placeholder={formatMessage(menusText.search)} type='text' />
            <i className='fa fa-search'></i>
          </div>
          <Card className='tenxflowBox'>
            <div className='titleBox' >
              <div className='name'>
                <FormattedMessage {...menusText.itemName} />
              </div>
              <div className='type'>
                tenxFlow
              </div>
              <div className='editTime'>
                <FormattedMessage {...menusText.editTime} />
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

DockerFile.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect()(injectIntl(DockerFile, {
  withRef: true,
}));

