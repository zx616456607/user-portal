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
import { Button, Input, Form, Checkbox, Alert, Icon } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
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
    id: 'CICD.Tenxflow.TenxFlowDetailFlowCard.cicdTitle',
    defaultMessage: '持续集成触发规则',
  },
})

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
  componetWillMount() {
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
    const {isFetching, ciRules} = nextProps;
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
      let branch = this.props.form.getFieldsValue(['branch']);
      if(!!branch) {
        this.setState({
          editBranch: true
        });
      }
    }
  },
  onChangeUseTag(e) {
    //this function for use tag or not
    this.setState({
      useTag: e.target.checked
    });
    if(e.target.checked) {
      let tag = this.props.form.getFieldsValue(['tag']);
      if(!!tag) {
        this.setState({
          editTag: true
        });
      }
    }
  },
  onEditBranch() {
    //this function for edit branch
    if(this.state.useBranch ) {
      this.setState({
        editBranch: true
      });
    }
  },
  onEditTag() {
    //this function for edit tag
    if(this.state.useTag) {
      this.setState({
        editTag: true
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
      editTag: false
    });
    scope.setState({
      cicdSetModalShow: false
    });
  },
  handleSubmit(e) {
    //this function for user submit the form
    const { scope } = this.props;
    const _this = this;
    const { useBranch, useTag, useRequest } = this.state;
    if(useBranch) {
      this.props.form.validateFields(['branch'],(errors, values) => {
        if (!!errors) {
          e.preventDefault();
          return;
        }
      });
    }
    if(useTag) {
      this.props.form.validateFields(['tag'],(errors, values) => {
        if (!!errors) {
          e.preventDefault();
          return;
        }
      });
    }
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { scope } = this.props;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const branchProps = getFieldProps('branch', {
      rules: [
        { required: true, message: '请输入TenxFlow名称' },
      ],
    });
    const tagProps = getFieldProps('tag', {
      rules: [
        { required: true, message: '请输入TenxFlow名称' },
      ],
    });
    return (
      <div id='CICDSettingModal' key='CICDSettingModal'>
        <div className='titleBox'>
          <span><FormattedMessage {...menusText.cicdTitle} /></span>
          <Icon type='cross' onClick={this.handleReset} />
        </div>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltip} />} type='info' />
          <Form horizontal>
            <div className='branch commonBox'>
              <div className='checkBox'>
                <FormItem>
                  <Checkbox onChange={this.onChangeUseBranch} checked={this.state.useBranch}><FormattedMessage {...menusText.branch} /></Checkbox>
                </FormItem>
              </div>
              <div className='inputBox'>
                <FormItem style={{ width:'380px',float:'left',marginRight:'18px' }}>
                  <Input {...branchProps} onBlur={this.onBlurBranch} type='text' size='large' disabled={ (!this.state.editBranch) } />
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
                  <Input {...tagProps} onBlur={this.onBlurTag} type='text' size='large' disabled={ !this.state.editTag} />
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
                  <Checkbox onChange={this.onChangeUseRequest}><FormattedMessage {...menusText.request} /></Checkbox>
                </FormItem>
              </div>
            </div>
          </Form>
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

})(injectIntl(CICDSettingModal, {
  withRef: true,
}));

