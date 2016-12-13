/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  CreateDatabase module
 *
 * v2.0 - 2016-10-18
 * @author GaoJian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Input, Select, InputNumber, Button, Form, Icon ,message} from 'antd'
import { CreateDbCluster ,loadDbCacheList} from '../../actions/database_cache'
import { setCurrent } from '../../actions/entities'
import { loadTeamClustersList } from '../../actions/team'
import NotificationHandler from '../../common/notification_handler'
import { MY_SPACE } from '../../constants'
import './style/CreateDatabase.less'

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;

let CreateDatabase = React.createClass({
  getInitialState: function () {
    return {
      currentType: this.props.database,
      showPwd: 'text',
      firstFocues: true,
      onselectCluster: true
    }
  },
  componentDidMount() {
    // this.setState({
    //   cluster: this.props.teamCluster[0].clusterID,
    // });
    const {form, current} = this.props
    form.setFieldsValue({
      'namespaceSelect': current.space.spaceName,
      'clusterSelect': current.cluster.clusterName,
    })
  },
  componentWillReceiveProps(nextProps) {
    // if create box close return default select cluster
    if(!nextProps.scope.state.CreateDatabaseModalShow) {
      this.setState({onselectCluster: true, loading: false})
    }
  },
  onChangeCluster() {
    this.setState({onselectCluster: false})
  },
  selectDatabaseType(database) {
    //this funciton for user select different database
    this.setState({
      currentType: database
    });
  },
  onChangeNamespace(teamID) {
    //this function for user change the namespace
    //when the namespace is changed, the function would be get all clusters of new namespace
    const { teamspaces, loadTeamClustersList, setCurrent, form, current } = this.props
    let newTeamspaces = ([MY_SPACE]).concat(teamspaces)
    newTeamspaces.map(space => {
       if (space.namespace == teamID) {
        // setCurrent({
        //   space,
        //   team: {
        //     teamID: teamID
        //   }
        // })
        loadTeamClustersList(teamID, { size: 100 }, {
          success: {
            func: (result) => {
              if(result.data.length > 0) {
                form.setFieldsValue({
                  'clusterSelect': result.data[0].clusterID
                })
              } else {
                form.setFieldsValue({'clusterSelect':''})
              }
            },
            isAsync: true
          }
        })
       }
    })
    // this.props.loadTeamClustersList(teamId, { size: 100 })
  },
  databaseExists(rule, value, callback) {
    //this function for check the new database name is exist or not
    const { databaseNames } = this.props;
    let existFlag = false;
    if (!value) {
      callback();
    } else {
      databaseNames.map((item) => {
        if (value == item) {
          callback([new Error('抱歉，该数据库名称已被占用。')]);
          existFlag = true;
        }
      });
      let checkName = /^[a-z]([-a-z0-9]*[a-z0-9])$/;
      if (!checkName.test(value)) {
        callback([new Error('数据库名称仅限小写字母、数字和 - 哦~')]);
        existFlag = true;
      }
      if (value.length < 3) {
        callback([new Error('数据库名称不能少于3位哦~')]);
        existFlag = true;
      }
      if (value.length > 15) {
        callback('数据库名称最多15位哦~');
        existFlag = true;
      }
      if (!existFlag) {
        callback();
      }
    }
  },
  checkPwd: function () {
    //this function for user change the password box input type
    //when the type is password and change to the text, user could see the password
    //when the type is text and change to the password, user couldn't see the password
    if (this.state.showPwd == 'password') {
      this.setState({
        showPwd: 'text'
      });
    } else {
      this.setState({
        showPwd: 'password'
      });
    }
  },
  setPsswordType() {
    if (this.state.firstFocues) {
      this.setState({
        showPwd: 'password',
        firstFocues: false
      });

    }
  },
  handleReset(e) {
    //this function for reset the form
    e.preventDefault();
    this.props.form.resetFields();
    const { scope } = this.props;
    scope.setState({
      CreateDatabaseModalShow: false
    });
  },
  handleSubmit(e) {
    //this function for user submit the form
    e.preventDefault();
    const _this = this;
    const { scope,  CreateDbCluster, setCurrent} = this.props;
    const { teamspaces, teamCluster} = this.props;
    const { loadDbCacheList } = scope.props;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      _this.setState({loading: true})
      let templateId
      this.props.dbservice.map(item => {
        if (item.category === _this.state.currentType) {
          return templateId = item.id
        }
      })
      if (this.state.onselectCluster) {
        values.clusterSelect = this.state.cluster
      }
      const body = {
        cluster: values.clusterSelect,
        // cluster: 'e0e6f297f1b3285fb81d27742255cfcf11', // @ todo 
        serviceName: values.name,
        password: values.password,
        replicas: values.replicas,
        volumeSize: values.storageSelect,
        templateId
      }
      let notification = new NotificationHandler()
      if (body.replicas > 5) {
        notification.error('副本数不能大于5')
        return
      }
      let newTeamspaces = ([MY_SPACE]).concat(teamspaces)
      let newSpace, newCluster
      newTeamspaces.map(list => {
        if (list.namespace === values.namespaceSelect) {
          return newSpace = list
        }
      })
      teamCluster.map(list => {
        if (list.clusterID === values.clusterSelect) {
          return newCluster = list
        }
      })
      CreateDbCluster(body, {
        success: {
          func: ()=> {
            notification.success('创建成功')
            loadDbCacheList(body.cluster, _this.state.currentType)
            setCurrent({
              cluster: newCluster,
              space: newSpace
            })
            _this.props.form.resetFields();
            scope.setState({
              CreateDatabaseModalShow: false
            });
          },
          isAsync: true
        },
        failed: {
          func: (res)=> {
            scope.setState({
              CreateDatabaseModalShow: false
            });
            _this.props.form.resetFields();
            notification.error('创建失败', res.message.message)
          }
        }
      });

    });
  },
  render() {
    const { isFetching, teamspaces, teamCluster} = this.props;
    const teamspaceList = teamspaces.map((list, index) => {
      return (
        <Option key={list.namespace}>{list.spaceName}</Option>
      )
    })
    const clusterList = teamCluster.map(item => {
      return (
        <Option key={item.clusterID}>{item.clusterName}</Option>
      )
    })
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请输入数据库集群名称' },
        { validator: this.databaseExists },
      ],
    });
    const replicasProps = getFieldProps('replicas', {
      initialValue: 1
    });
    const selectStorageProps = getFieldProps('storageSelect', {
      initialValue: 500
    });
    const passwdProps = getFieldProps('password', {
      rules: [
        {
          required: this.state.currentType == 'redis' ? false : true,
          whitespace: true,
          message: '请填写密码'
        },
      ],
    });
    const selectNamespaceProps = getFieldProps('namespaceSelect', {
      rules: [
        { required: true, message: '请选择空间' },
      ],
      // initialValue: 'default',
      onChange: this.onChangeNamespace
    });
    const selectClusterProps = getFieldProps('clusterSelect', {
      rules: [
        { required: true, message: '请选择集群' },
      ],
      // initialValue: this.props.clusterName,
      onChange: this.onChangeCluster
    });
    return (
      <div id='CreateDatabase' type='right'>
        <Form horizontal>
          <div className='infoBox'>
            <div className='commonBox'>
              <div className='title'>
                <span>类型</span>
              </div>
              <div className='inputBox'>
                <Button size='large' type={this.state.currentType == 'mysql' ? 'primary' : 'ghost'} onClick={this.selectDatabaseType.bind(this, 'mysql')}>
                  MySQL
                </Button>
                <Button size='large' type={this.state.currentType == 'redis' ? 'primary' : 'ghost'} onClick={this.selectDatabaseType.bind(this, 'redis')}>
                  Redis
                </Button>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>部署环境</span>
              </div>
              <div className='inputBox'>
                <FormItem style={{ width: '150px', float: 'left', marginRight: '20px' }}>
                  <Select {...selectNamespaceProps} className='envSelect' size='large'>
                    <Option value="default">我的空间</Option>
                    { teamspaceList }
                  </Select>
                </FormItem>
                <FormItem style={{ width: '150px', float: 'left' }}>
                  <Select {...selectClusterProps} className='envSelect' size='large'>
                    { clusterList }
                  </Select>
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>名称</span>
              </div>
              <div className='inputBox'>
                <FormItem
                  hasFeedback
                  help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}
                  >
                  <Input {...nameProps} size='large' placeholder="请输入名称" disabled={isFetching} maxLength={20} />
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>副本数</span>
              </div>
              <div className='inputBox'>
                <FormItem style={{ width: '80px', float: 'left' }}>
                  <InputNumber {...replicasProps} size='large' defaultValue={1} min={1} max={5} disabled={isFetching} />
                </FormItem>
                <span className='litteColor' style={{ float: 'left', paddingLeft: '15px' }}>个</span>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>存储大小</span>
              </div>
              <div className='inputBox'>
                <FormItem  style={{ width: '80px', float: 'left' }}>
                  <InputNumber {...selectStorageProps}  defaultValue={500} min={500} step={100} max={10000} size='large' disabled={isFetching}/>
                </FormItem>
                <span className='litteColor' style={{ float: 'left', paddingLeft: '15px' }}>M</span>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div className='commonBox'>
              <div className='title'>
                <span>密码</span>
              </div>
              <div className='inputBox'>
                <FormItem
                  hasFeedback
                  >
                  <Input {...passwdProps} onFocus={()=> this.setPsswordType()} type={this.state.showPwd} size='large' placeholder="请输入密码" disabled={isFetching} />
                  <i className={this.state.showPwd == 'password' ? 'fa fa-eye' : 'fa fa-eye-slash'} onClick={this.checkPwd}></i>
                </FormItem>
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          <div className='btnBox'>
            <Button size='large' onClick={this.handleReset}>
              取消
            </Button>
            {this.state.loading ?
            <Button size='large' type='primary' loading={this.state.loading}>
              确定
            </Button>
            :
            <Button size='large' type='primary' onClick={this.handleSubmit}>
              确定
            </Button>
            }
          </div>
        </Form>
      </div>
    )
  }
});

function mapStateToProps(state, props) {
  const { cluster } = state.entities.current
  const defaultDbNames = {
    isFetching: false,
    cluster: cluster.clusterID,
    databaseNames: []
  }
  const { databaseAllNames } = state.databaseCache
  const { databaseNames, isFetching } = databaseAllNames.DbClusters || defaultDbNames
  const { teamspaces } = state.user.teamspaces.result || []
  const teamCluster = state.team.teamClusters.result.data || []
  const { current } = state.entities
  return {
    cluster: cluster.clusterID,
    clusterName: cluster.clusterName,
    current,
    databaseNames,
    isFetching,
    teamspaces,
    teamCluster
  }

}

CreateDatabase = createForm()(CreateDatabase);

CreateDatabase.propTypes = {
  intl: PropTypes.object.isRequired,
  CreateDbCluster: PropTypes.func.isRequired,
  loadTeamClustersList: PropTypes.func.isRequired,
  setCurrent: PropTypes.func.isRequired
}

CreateDatabase = injectIntl(CreateDatabase, {
  withRef: true,
})

export default connect(mapStateToProps, {
  CreateDbCluster,
  loadTeamClustersList,
  setCurrent
})(CreateDatabase)