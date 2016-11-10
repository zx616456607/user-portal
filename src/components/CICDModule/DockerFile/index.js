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
import { Alert, Menu, Button, Card, message, Input, Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'

import { getDockerfileList, getDockerfiles, setDockerfile, searchDockerfile } from '../../../actions/cicd_flow'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'

import './style/DockerFile.less'

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
    return { showDockerFileModal: false, editDockerFileModal: false, }
  },
  operaMenuClick: function (item, e) {
    //this function for user click the dropdown menu
    const self = this
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
          message.error(res.data.message.message)
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
    this.props.scope.props.setDockerfile(config, {
      success: {
        func: () => {
          message.success('修改成功')
          self.setState({ editDockerFileModal: false })
        }
      },
      failed: {
        func: (res) => {
          Modal.error({
            title: '编辑DockerFile',
            content: `${res.error.message.message}`,
          });
        }
      }
    })
  },
  render: function () {
    const { config, scope, formatMessage } = this.props
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

        <Modal title="DockerFile" width="600px" visible={this.state.showDockerFileModal} wrapClassName="dockerFileModal" onCancel={() => this.closeModal()}
          footer={null}
          >
          <div style={{ padding: "0 20px 20px", minHeight: '300px' }}>
            <pre>
              {this.state.dockerfiles}
            </pre>
          </div>
        </Modal>

        <Modal title="DockerFile" width="600px" visible={this.state.editDockerFileModal} onOk={() => this.editDockerFile()} onCancel={() => this.closeModal()}
          >
          <div style={{ padding: "0 20px 20px", minHeight: '300px' }}>
            <Input type="textarea" value={this.state.dockerfiles} style={{ height: '280px' }} onChange={(e) => this.setState({ dockerfiles: e.target.value })} />
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
    this.props.getDockerfileList()
  }

  handleSearch(e) {
    const names = e.target.value
    this.props.searchDockerfile(names)
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
            <MyComponent scope={scope} formatMessage={formatMessage} config={this.props.dockerfileList} />
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

