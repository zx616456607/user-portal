/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CodeStoreListModal component
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Spin, Select } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getProjectList, getCodeStoreBranchDetail } from '../../../../../actions/cicd_flow'
import NotificationHandler from '../../../../../common/notification_handler'
import './style/CodeStoreListModal.less'

const Option = Select.Option;

const menusText = defineMessages({
  name: {
    id: 'CICD.Tenxflow.CodeStoreListModal.name',
    defaultMessage: '名称',
  },
  attr: {
    id: 'CICD.Tenxflow.CodeStoreListModal.attr',
    defaultMessage: '属性',
  },
  resource: {
    id: 'CICD.Tenxflow.CodeStoreListModal.resource',
    defaultMessage: '代码源',
  },
  selectBranch: {
    id: 'CICD.Tenxflow.CodeStoreListModal.selectBranch',
    defaultMessage: '选择分支',
  },
  deploy: {
    id: 'CICD.Tenxflow.CodeStoreListModal.deploy',
    defaultMessage: '部署',
  },
});

function showBranchList(list) {
  if(list.length == 0) {
    return (
      <Option key='loading' value='loading'>
        <div className='loadingBox'>
          <Spin />
        </div>
      </Option>
    )
  }
  let optionList = list.map((item) => {
    return (
      <Option value={item.branch} key={item.commitId + item.branch}>
        {item.branch}
      </Option>
    )
  });
  return optionList;
}

let CodeStoreListModal = React.createClass({
  getInitialState: function() {
    return {
      projectList: [],
      errorSelect: null
    }
  },
  componentWillMount() {
    const {getProjectList} = this.props;
    const _this = this;
    getProjectList({
      success: {
        func: (res) => {
          _this.setState({
            projectList: res.data.results
          });
        },
        isAsync: true
      }
    })
  },
  selectedCodeStore(list) {
    //this function for user select code store and show the branch list of code store
    const _this = this;
    const { getCodeStoreBranchDetail } = this.props;
    getCodeStoreBranchDetail(list.repoType, list.name, list.gitlabProjectId, {
      success: {
        func: (res) => {
          let tempList = _this.state.projectList;
          tempList.map((item) => {
            if(item.id == list.id) {
              item.branchList = res.data.results;
            }
          });
          _this.setState({
            projectList: tempList,
            errorSelect: null
          });
        }
      },
      failed: {
        func: (err) => {
          let notif = new NotificationHandler
          if (err.statusCode == 401) {
            notif.error('查询失败', '没有权限访问该镜像版本', 5)
            return
          }
           notif.error('查询失败', '没有权限或者镜像不存在', 5)
        }
      }
    })
  },
  onChangeBranch(id, e) {
    const _this = this;
    let tempList = _this.state.projectList;
    tempList.map((item) => {
      if(item.id == id) {
        item.currentBranch = e;
      }
    });
  },
  closeModal () {
    //this function for user close the env input modal
    const { scope } = this.props;
    scope.setState({
      codeStoreModalShow: false
    });
  },
  onSubmitCodeStore(id, name, e) {
    e.stopPropagation();
    const { scope } = this.props;
    let tempList = this.state.projectList;
    let branch = null;
    let repoType = null
    tempList.map((item) => {
      if(item.id == id) {
        branch = item.currentBranch;
        repoType = item.repoType
      }
    });
    if(!Boolean(branch) && repoType != "svn") {
      this.setState({
        errorSelect: id
      })
      return;
    }
    scope.setState({
      currentCodeStore: id,
      currentCodeStoreName: name,
      currentCodeStoreBranch: branch,
      codeStoreModalShow: false,
      noSelectedCodeStore: false
    });
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope, hadSelected, isFetching } = this.props;
    const thisScope = this;
    if(isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const codeItems = this.state.projectList.map((item, index) => {
      return (
      <QueueAnim key={'codeDetailAnimate' + index} id="codeDetailAnimate">
        <div className={ item.id == hadSelected ? 'selectedCode codeDetail' : 'codeDetail' } key={'codeDetail' + index} >
          <div className='commonTitle'>
            <span>{item.name}</span>
          </div>
          <div className='commonTitle'>
            <span className="address">{item.address}</span>
          </div>
          <div className='commonTitle'>
          {item.repoType !='svn' ? 
            <div onClick={()=> this.selectedCodeStore(item)} style={{ width: '120px',float:'left', marginRight: '15px'}}>
              <Select className={this.state.errorSelect == item.id ? 'noSelectCodeStore' : null} style={{ width: '120px'}} size='large'
                onChange={this.onChangeBranch.bind(this, item.id)} getPopupContainer={() => document.getElementById('codeDetailAnimate')}>
                { showBranchList(item.branchList) }
              </Select>
            </div>
          :
            <Select value="不支持的类型" disabled={true} style={{ width: '120px', float:'left', marginTop: '11.5px', marginRight: '15px'}} size='large'
              onChange={this.onChangeBranch.bind(this, item.id)}>
            </Select>
          }
            <Button size='large' type='primary' style={{ float: 'left', marginTop: '11.5px' }} 
              onClick={this.onSubmitCodeStore.bind(this, item.id, item.name)}>
              <FormattedMessage {...menusText.deploy} />
            </Button>
            <div style={{ clear:'both' }}></div>
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
      </QueueAnim>
      )
    });
    return (
      <div id='CodeStoreListModal' key='CodeStoreListModal'>
        <div className='titleBox'>
          <div className='commonTitle'>
            <FormattedMessage {...menusText.name} />
          </div>
          <div className='commonTitle'>
            <FormattedMessage {...menusText.resource} />
          </div>
          <div className='commonTitle'>
            <FormattedMessage {...menusText.selectBranch} />
          </div>
          <div style={{ clear:'both' }}></div>
        </div>
        <div className='codeList'>
          {codeItems}
        </div>
      </div>
    )
  }
});

function mapStateToProps(state, props) {
  const defaultCodeStore = {
    isFetching: false,
    storeList: []
  }
  const { managed } = state.cicd_flow;
  const { projectList, isFetching } = managed || defaultStatus;
  return {
    isFetching,
    projectList
  }
}

CodeStoreListModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getProjectList,
  getCodeStoreBranchDetail
})(injectIntl(CodeStoreListModal, {
  withRef: true,
}));

