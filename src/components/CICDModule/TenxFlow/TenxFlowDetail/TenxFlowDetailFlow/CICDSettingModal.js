/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CICDSettingModal component
 *
 * v0.1 - 2016-10-27
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Checkbox, Alert, Icon, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import { UpdateTenxflowCIRules } from '../../../../../actions/cicd_flow'
import './style/CICDSettingModal.less'
import { browserHistory } from 'react-router';

const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  tooltip: {
    id: 'CICD.Tenxflow.CICDSettingModal.tooltip',
    defaultMessage: '当该项目对应的代码仓库，发生下面的操作时触发持续集成',
  },
  branch: {
    id: 'CICD.Tenxflow.CICDSettingModal.branch',
    defaultMessage: '提交代码到branch',
  },
  tag: {
    id: 'CICD.Tenxflow.CICDSettingModal.tag',
    defaultMessage: '提交代码到tag',
  },
  request: {
    id: 'CICD.Tenxflow.CICDSettingModal.request',
    defaultMessage: '新建一个Pull Request',
  },
  cancel: {
    id: 'CICD.Tenxflow.CICDSettingModal.cancel',
    defaultMessage: '取消',
  },
  submit: {
    id: 'CICD.Tenxflow.CICDSettingModal.submit',
    defaultMessage: '确定',
  },
  cicdTitle: {
    id: 'CICD.Tenxflow.CICDSettingModal.cicdTitle',
    defaultMessage: '持续集成触发规则',
  },
})

function checkBranchInit(config) {
  //this function for user check branch is used or not
  if(Boolean(config.config)) {
    if(Boolean(config.config.branch)) {
      return config.config.branch.name;
    }
    return '';
  }
  return '';
}

function checkTagInit(config) {
  //this function for user check tag is used or not
  if(Boolean(config.config)) {
    if(Boolean(config.config.tag)) {
      return config.config.tag.name;
    }
    return '';
  }
  return '';
}

function checkBranchUsed(config) {
  //this function for check the branch is used or not
  
}

let CICDSettingModal = React.createClass({
  getInitialState: function() {
    return {
      useBranch: false,
      useTag: false,
      useRequest: false,
      editBranch: false,
      editTag: false
    }
  },
  componentWillMount() {
    const {isFetching, ciRules} = this.props;
    if(!isFetching) {
      if(Boolean(ciRules)) {
        if(Boolean(config.config.branch)) {
          this.setState({
            useBranch: true
          });
        }
        if(Boolean(config.config.tag)) {
          this.setState({
            useTag: true
          });
        }
        if(Boolean(config.config.merge_request)) {
          this.setState({
            useRequest: true
          });
        }
      }
    }
  },
  componentWillReceiveProps(nextProps) {
    const {isFetching, ciRules } = nextProps;
    if(!isFetching) {
      if(Boolean(ciRules)) {
        let config = ciRules.results;
        if(!Boolean(config.config)) {
          return;
        }
        if(Boolean(config.config.branch)) {
          this.setState({
            useBranch: true
          });
        }
        if(Boolean(config.config.tag)) {
          this.setState({
            useTag: true
          });
        }
        if(Boolean(config.config.mergeRequest)) {
          this.setState({
            useRequest: true
          });
        }
      }
    }
  },
  onChangeUseBranch(e) {
    //this function for use branch or not
    this.setState({
      useBranch: e.target.checked
    });
    if(e.target.checked) {
      this.setState({
        editBranch: true
      });
      setTimeout(function() {
        document.getElementById('branchInput').focus()
      },100)
    } else {
      this.setState({
        editBranch: false
      });
    }
  },
  onChangeUseTag(e) {
    //this function for use tag or not
    this.setState({
      useTag: e.target.checked
    });
    // document.getElementById('tagInput').focus()
    if(e.target.checked) {
      this.setState({
        editTag: true
      });
      setTimeout(function() {
        document.getElementById('tagInput').focus()
      },100)
    } else {
      this.setState({
        editTag: false
      });
    }
  },
  onEditBranch() {
    //this function for edit branch
    if(this.state.useBranch ) {
      this.setState({
        editBranch: true,
        noBranch: false
      });
      setTimeout(function() {
        document.getElementById('branchInput').focus()
      },100)
    } else {
      this.setState({
        editBranch: false
      });
    }
  },
  onEditTag() {
    //this function for edit tag
    if(this.state.useTag) {
      this.setState({
        editTag: true,
        noTag: false
      });
      setTimeout(function() {
        document.getElementById('tagInput').focus()
      },100)
    } else {
      this.setState({
        editTag: false
      });
    }
  },
  onCancelEditBranch() {
    //this function for cancel edit branch
    this.setState({
      editBranch: false
    });
  },
  onCancelEditTag() {
    //this function for cancel edit tag
    this.setState({
      editTag: false
    });
  },
  onBlurBranch() {
    //this function for the branch input on blur take the input disable
    this.setState({
      editBranch: false
    })
  },
  onBlurTag() {
    //this function for the tag input on blur take the input disable
    this.setState({
      editTag: false
    })
  },
  onChangeUseRequest(e) {
    //this function for user change use merge request or not
    this.setState({
      useRequest: e.target.checked
    })
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    this.setState({
      useBranch: false,
      useTag: false,
      useRequest: false,
      editBranch: false,
      editTag: false,
      noBranch: false,
      noTag: false
    });
    scope.setState({
      cicdSetModalShow: false
    });
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope, UpdateTenxflowCIRules, flowId } = this.props;
    const _this = this;
    const { useBranch, useTag, useRequest } = this.state;
    let branchInput = null;
    let tagInput = null;
    let checkFlag = true;
    this.setState({
      noBranch: false,
      tagInput: false
    })
    if(useBranch) {
      this.props.form.validateFields(['branch'],(errors, values) => {
        if (!!errors) {
          e.preventDefault();
          checkFlag = false;
          _this.setState({
            noBranch: true
          });
          return;
        }
        branchInput = values;
      });
    }
    if(useTag) {
      this.props.form.validateFields(['tag'],(errors, values) => {
        if (!!errors) {
          e.preventDefault();
          checkFlag = false;
          _this.setState({
            noTag: true
          });
          return;
        }
        tagInput = values;
      });
    }
    if(!checkFlag) {
      return;
    }
    let body = {
      enabled: 1,
      config: {
        branch: null,
        tag: null,
        mergeRequest: null
      }
    }
    if(useBranch) {
      body.config.branch = {
        name: branchInput.branch
      }
    }
    if(useTag) {
      body.config.tag = {
        name: tagInput.tag
      }
    }
    if(useRequest) {
      body.config.mergeRequest = useRequest;
    }
    scope.setState({
      cicdSetModalShow: false,
      ciRulesOpened: true
    });
    UpdateTenxflowCIRules(flowId, body, {
      success: {
        func: () => { 
          scope.ciRulesChangeSuccess()
          _this.setState({
            useBranch: false,
            useTag: false,
            useRequest: false,
            editBranch: false,
            editTag: false
          })
        },
        isAsync: true
      }
    })
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope, isFetching, ciRules  } = this.props;
    if(isFetching || !Boolean(ciRules) ) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const branchProps = getFieldProps('branch', {
      rules: [
        { required: true, message: '请输入Branch名称' },
      ],
      initialValue: checkBranchInit(ciRules.results),
    });
    const tagProps = getFieldProps('tag', {
      rules: [
        { required: true, message: '请输入Tag名称' },
      ],
      initialValue: checkTagInit(ciRules.results),
    });
    return (
    <Form horizontal>
      <div id='CICDSettingModal' key='CICDSettingModal'>
        <div className='titleBox'>
          <span><FormattedMessage {...menusText.cicdTitle} /></span>
          <Icon type='cross' onClick={this.handleReset} />
        </div>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltip} />} type='info' />
            <div className='branch commonBox'>
              <div className='checkBox'>
                <FormItem>
                  <Checkbox onChange={this.onChangeUseBranch} checked={this.state.useBranch}><FormattedMessage {...menusText.branch} /></Checkbox>
                </FormItem>
              </div>
              <div className='inputBox'>
                <FormItem style={{ width:'380px',float:'left',marginRight:'18px' }}>
                  <Input className={ this.state.noBranch ? 'noBranchInput' : '' } key='branchInput' {...branchProps} onBlur={this.onBlurBranch} type='text' id='branchInput' size='large' disabled={ (!this.state.editBranch) } />
                  { this.state.noBranch ? [<span className='noValueSpan'>请输入Branch名称</span>] : null}
                </FormItem>
                {
                  !this.state.editBranch ? [
                    <i className='fa fa-pencil-square-o' onClick={this.onEditBranch} />
                  ] : [
                    <Button size='large' onClick={this.onCancelEditBranch}><FormattedMessage {...menusText.cancel} /></Button>
                  ]
                }
                <div style={{ clear:'both' }}></div>
              </div>
            </div>
            <div className='tag commonBox'>
              <div className='checkBox'>
                <FormItem>
                  <Checkbox onChange={this.onChangeUseTag} checked={this.state.useTag}><FormattedMessage {...menusText.tag} /></Checkbox>
                </FormItem>
              </div>
              <div className='request inputBox'>
                <FormItem style={{ width:'380px',float:'left',marginRight:'18px' }}>
                  <Input className={ this.state.noTag ? 'noTagInput' : '' } key='tagInput' {...tagProps} onBlur={this.onBlurTag} type='text' id='tagInput' size='large' disabled={ !this.state.editTag} />
                  { this.state.noTag ? [<span className='noValueSpan'>请输入Tag名称</span>] : null}
                </FormItem>
                {
                  !this.state.editTag ? [
                    <i className='fa fa-pencil-square-o' onClick={this.onEditTag} />
                  ] : [
                    <Button size='large' onClick={this.onCancelEditTag}><FormattedMessage {...menusText.cancel} /></Button>
                  ]
                }
                <div style={{ clear:'both' }}></div>
              </div>
            </div>
            <div className='commonBox'>
              <div className='checkBox'>
                <FormItem>
                  <Checkbox onChange={this.onChangeUseRequest} checked={this.state.useRequest}><FormattedMessage {...menusText.request} /></Checkbox>
                </FormItem>
              </div>
            </div>
        </div>
        <div className='BtnBox'>
          <Button size='large' onClick={this.handleReset}>
            <FormattedMessage {...menusText.cancel} />
          </Button>
          <Button size='large' type='primary' onClick={this.handleSubmit}>
            <FormattedMessage {...menusText.submit} />
          </Button>
        </div>
      </div>
    </Form>
    )
  }
});

function mapStateToProps(state, props) {

  return {

  }
}

CICDSettingModal = createForm()(CICDSettingModal);

CICDSettingModal.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  UpdateTenxflowCIRules
})(injectIntl(CICDSettingModal, {
  withRef: true,
}));

