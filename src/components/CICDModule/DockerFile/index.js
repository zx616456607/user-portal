/**
* Licensed Materials - Property of tenxcloud.com
* (C) Copyright 2016 TenxCloud. All Rights Reserved.
*
* Dockerfile component
*
* v0.1 - 2016-10-31
* @author BaiYu
*/
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, message, Input, Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { getDockerfileList, getDockerfiles, setDockerfile, searchDockerfile } from '../../../actions/cicd_flow'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import DockerFileEditor from '../../Editor/DockerFile'
import './style/DockerFile.less'
import NotificationHandler from '../../../common/notification_handler'

const editorOptions = {
  readOnly: false
}

const menusText = defineMessages({
  tooltips: {
    id: 'CICD.DockerFile.tooltips',
    defaultMessage: '云端 Dockerfile: 这里保存您在 TenxFlow 过程中创建的云端 Dockerfile，方便再次查看或使用。（这里的 Dockerfile 对应 TenxFlow 中子项目名称）',
  },
  show: {
    id: 'CICD.DockerFile.show',
    defaultMessage: '查看 Dockerfile',
  },
  editDockerFile: {
    id: 'CICD.DockerFile.editDockerFile',
    defaultMessage: '编辑 Dockerfile',
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
    return { showDockerFileModal: false, editDockerFileModal: false, }
  },
  operaMenuClick: function (item, e) {
    //this function for user click the dropdown menu
    const self = this
    let notification = new NotificationHandler()
    this.props.scope.props.getDockerfiles(item, {
      success: {
        func: (res) => {
          if (e.key == 1) {
            self.setState({
              showDockerFileModal: true,
              dockerfiles: res.data.message.content,
              dockerfileId: item
            })
            return
          }
          self.setState({
            editDockerFileModal: true,
            dockerfiles: res.data.message.content,
            dockerfileId: item
          })
        }
      },
      failed: {
        func: (res) => {
          notification.error(res.message.message)
        }
      }
    })

  },
  DockerfileModal(item) {
    const self = this
    this.props.scope.props.getDockerfiles(item, {
      success: {
        func: (res) => {
          self.setState({
            showDockerFileModal: true,
            dockerfiles: res.data.message.content,
          })
        }
      }
    })
  },
  closeModal() {
    this.setState({
      showDockerFileModal: false,
      editDockerFileModal: false,
      dockerfiles: ''
    })
  },
  editDockerFile() {
    const dockerId = this.state.dockerfileId
    const self = this
    const config = {
      flowId: dockerId.flowId,
      stageId: dockerId.stageId,
      content: this.state.dockerfiles
    }
    let notification = new NotificationHandler()
    notification.spin(`保存 Dockerfile 中...`)
    this.props.scope.props.setDockerfile(config, {
      success: {
        func: () => {
          notification.close()
          notification.success('修改成功')
          self.setState({ editDockerFileModal: false })
        }
      },
      failed: {
        func: (res) => {
          /*Modal.error({
            title: '编辑Dockerfile',
            content: `${res.error.message.message}`,
          });*/
          notification.close()
          notification.error('修改失败', res.error.message.message)
        }
      }
    })
  },
  onChangeDockerFile(e) {
    //this functio for the editor callback
    this.setState({
      dockerfiles: e
    })
  },
  render: function () {
    const { config, scope, formatMessage, loading } = this.props
    if (loading || !config) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    if (config.length === 0) {
      return (
        <div> * 目前还没有添加任何云端 Dockerfile</div>
      )
    }
    let items = config.map((item, index) => {
      const dropdown = (
        <Menu onClick={this.operaMenuClick.bind(this, item)} style={{ width: '150px' }}>
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
        <div className='CodeTable' key={`dockerfile-${index}`} >
          <div className='name'>
            {item.stageName}
          </div>
          <div className='type'>
            {item.name}
          </div>

          <div className='editTime'>
            {item.updateTime}
          </div>
          <div className='action'>

            <Dropdown.Button overlay={dropdown} onClick={() => this.DockerfileModal(item)} type='ghost'>
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
        <Modal title="Dockerfile" width="600px" visible={this.state.showDockerFileModal} wrapClassName="dockerFileModal" onCancel={() => this.closeModal()}
          footer={null}
          >
          <div style={{ padding: "0px", minHeight: '300px' }}>
            <DockerFileEditor value={this.state.dockerfiles} />
          </div>
        </Modal>

        <Modal className='dockerFileEditModal' title="Dockerfile" width="600px" visible={this.state.editDockerFileModal}
          onCancel={() => this.closeModal()}
          >
          <div style={{ minHeight: '300px' }}>
            <DockerFileEditor value={this.state.dockerfiles} callback={this.onChangeDockerFile} options={editorOptions} />
          </div>
          <div className='btnBox'>
            <Button size='large' type='primary' onClick={this.editDockerFile}>
              <span>确定</span>
            </Button>
            <Button size='large' type='primary' onClick={this.closeModal}>
              <span>取消</span>
            </Button>
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
    document.title = 'Dockerfile | 时速云';
    this.props.getDockerfileList()
  }

  handleSearch(e) {
    const names = e.target.value
    this.props.searchDockerfile(names)
  }

  render() {
    const scope = this
    const { formatMessage } = this.props.intl
    const { dockerfileList, isFetching } = this.props
    return (
      <QueueAnim className='TenxFlowList'
        type='right'
        >
        <div id='dockerFile' key='dockerFile'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='operaBox'>
            <Input className='searchBox' placeholder={formatMessage(menusText.search)} onPressEnter={(e) => this.handleSearch(e)} type='text' />
            <i className='fa fa-search'></i>
          </div>
          <Card className='tenxflowBox'>
            <div className='titleBox' >
              <div className='name'>
                <FormattedMessage {...menusText.itemName} />
              </div>
              <div className='type'>
                TenxFlow
              </div>
              <div className='editTime'>
                <FormattedMessage {...menusText.editTime} />
              </div>
              <div className='action'>
                <FormattedMessage {...menusText.action} />
              </div>
            </div>
            <MyComponent
              scope={scope}
              formatMessage={formatMessage}
              config={this.props.dockerfileList}
              loading={isFetching} />
          </Card>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultConfig = {
    dockerfileList: [],
    isFetching: false
  }
  const { dockerfileLists } = state.cicd_flow
  const {dockerfileList, isFetching, dockerfile} = dockerfileLists || defaultConfig

  return {
    dockerfileList,
    isFetching,
  }
}

DockerFile.propTypes = {
  intl: PropTypes.object.isRequired,
  getDockerfileList: PropTypes.func.isRequired,
  getDockerfiles: PropTypes.func.isRequired
}

export default connect(mapStateToProps, {
  getDockerfileList,
  searchDockerfile,
  getDockerfiles,
  setDockerfile
})(injectIntl(DockerFile, {
  withRef: true,
}));

