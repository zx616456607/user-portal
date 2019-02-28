/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeGroup component
 *
 * v0.1 - 2016-09-27
 * @author GaoJian
 */
import React, { Component } from 'react'
import { Spin, Popover, Icon, Tooltip } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import TenxIcon from '@tenx-ui/icon/es/_old'
import filter from 'lodash/filter'
import classNames from 'classnames'
import { loadConfigName, loadConfigGroup } from '../../../../../src/actions/configs.js'
import { getSecrets } from '../../../../../src/actions/secrets'
// import SecretsConfig from './SecretsConfig'
import './style/ComposeGroup.less'
import { AppServiceDetailIntl } from '../../../../../src/components/AppModule/ServiceIntl'
import { injectIntl, FormattedMessage } from 'react-intl'
// import Editor from '../../../../../client/components/EditorModule/index'
import Config from './Config'
import Secrets from './Secrets'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'

class MyComponent extends Component {
  static propTypes = {
    config: React.PropTypes.array,
  }
  state = {
    config: [],
    groupWithLabels: [],
    secrets: [],
    isFinishConfig: false,
    isFinishSecrets: false,
  }
  componentWillMount() {
    const { service } = this.props;
    this.getConfigList(service)
  }
  getConfigList(service) {
    const { cluster, loadConfigGroup, getSecrets } = this.props;
    const volumes = getDeepValue(service, [ 'spec', 'template', 'spec', 'volumes' ]) || []
    const container = getDeepValue(service, [ 'spec', 'template', 'spec', 'containers', 0 ]) || []
    loadConfigGroup(cluster, null, {
      success: {
        func: res => {
          const groupWithLabels = res.data
          this.setState({
            groupWithLabels,
          })
          if (!volumes) {
            this.setState({
              config: [],
            })
            return
          }
          const config = []
          let index = 0
          volumes.forEach(volume => {
            let labels = []
            if (volume.configMap) { // 普通配置 反之加密配置
              groupWithLabels.forEach(item => {
                if (item.name === volume.configMap.name) {
                  labels = item.annotations
                }
              })
              config.push({
                id: ++index,
                mountPod: filter(container.volumeMounts, [ 'name', volume.name ])[0].mountPath,
                group: volume.configMap.name,
                file: volume.configMap.items,
                labels,
              })
            }
          })
          this.setState({
            config,
          })
        },
        isAsync: true,
      },
      finally: {
        func: () => {
          this.setState({
            isFinishConfig: true,
          })
        },
        isAsync: true,
      },
    })
    getSecrets(cluster, {}, {
      success: {
        func: res => {
          if (res.code === 200 && res.data.length) {
            this.setState({
              secrets: res.data,
            })
          }
        },
        isAsync: true,
      },
      finally: {
        func: () => {
          this.setState({
            isFinishSecrets: true,
          })
        },
        isAsync: true,
      },
    })
  }
  loadConfigData(group, name) {
    const self = this
    this.props.loadConfigName(this.props.cluster, { group, Name: name }, {
      success: {
        func: result => {
          self.setState({
            modalConfigFile: true,
            configName: name,
            configtextarea: typeof result.data === 'object' ?
              result.data.data : result.data,
          })
          // Modal.confirm({
          //   title: '配置文件',
          //   content: <pre>{result.data}</pre>,
          //   okText: '确定'
          // })
        },
      },
    })
  }
  componentWillReceiveProps(nextProps) {
    const { serviceDetailmodalShow, service } = nextProps
    if (!serviceDetailmodalShow) {
      this.setState({
        config: [],
      })
      return
    }
    if (!service.spec) {
      this.setState({
        config: [],
      })
      return
    }
    if (this.props.service.metadata.name !== nextProps.service.metadata.name) {
      this.getConfigList(service)
    }
  }
  render() {
    const configData = this.props.configData[this.props.cluster]
    const { config, groupWithLabels, isFinishSecrets, isFinishConfig } = this.state;
    const { formatMessage, service: { spec }, activeKey, service, cb } = this.props
    const { template } = spec || { template: {} }
    // let loading
    if (configData) {
      // const { isFetching } = configData

      // if (isFetching) {
      //   loading = <div className="loadingBox" style={{position: 'absolute'}}><Spin size="large" /></div>
      // }
    }
    if (!isFinishSecrets || !isFinishConfig) {
      return <div className="loadingBox">
        <Spin size="large"/>
      </div>
    }
    // if (config.length == 0) {
    //   return (
    //     <Card className="composeList">
    //       <div style={{lineHeight:'60px'}}>{formatMessage(AppServiceDetailIntl.noConfig)}</div>
    //     </Card>
    //   )
    // }
    // const items =
    config.map(item => {
      if (!item.file) {
        // return 'no file'
        item.file = []
      }
      const group = item.file.map(list => {
        return <div title={formatMessage(AppServiceDetailIntl.clickCheckConfigFile)} style={{ wordBreak: 'break-all', color: '#2db7f5', cursor: 'pointer' }} onClick={() => this.loadConfigData(item.group, list.path) }>{list.path} </div>
      })
      return (
        <div className="composeDetail" key={item.id.toString()}>
          <Tooltip title={item.mountPod}>
            <div className="commonData textoverflow">
              <span>{item.mountPod}</span>
            </div>
          </Tooltip>
          <Tooltip title={item.labels && item.labels.join(', ')}>
            <div className="annotations commonData textoverflow">
              {item.labels.length ? item.labels.join(', ') : formatMessage(AppServiceDetailIntl.noClassified)}
            </div>
          </Tooltip>
          <div className="commonData">
            <span>{item.group}</span>
          </div>
          <div className="composefile commonData">
            {
              item.file.length > 0 ?
                <span title={formatMessage(AppServiceDetailIntl.clickCheckConfigFile)}
                  onClick={() => this.loadConfigData(item.group, item.file[0].path) }>
                  {item.file[0].path}
                </span>
                :
                <span>{formatMessage(AppServiceDetailIntl.mountedAllConfigGroup)}<Link to="/app_manage/configs"> <Icon type="export" /></Link></span>
            }
            {item.file.length > 1 ?
              <Popover content={group} getTooltipContainer={() => document.getElementById('ComposeGroup')}>
                <TenxIcon type="ellipsis" className="more"/>
              </Popover>
              :
              null
            }
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      );
    });
    return (
      <div>
        {/* <Card className="composeList">
          {loading}
          { items }
          <Modal
            title='查看配置文件' wrapClassName='read-configFile' visible={this.state.modalConfigFile}
            footer={
            <Button type="primary" onClick={() => { this.setState({ modalConfigFile: false }) } }>
            {formatMessage(ServiceCommonIntl.confirm)}</Button>
            }
            onCancel={() => { this.setState({ modalConfigFile: false }) } }
            width="600px"
            >
            <div className='configFile-name'>
              <div className="ant-col-3 key">{formatMessage(ServiceCommonIntl.name)}:</div>
              <div className="ant-col-19"><Input disabled="true" value={this.state.configName} /></div>
            </div>
            <div className="configFile-wrap">
              <div className="ant-col-3 key">{formatMessage(ServiceCommonIntl.content)}:</div>
              <div className="ant-col-19">
                <Editor
                  title="配置文件内容"
                  options={{
                    readOnly: true
                  }}
                  style={{ minHeight: '260px' }}
                  value={this.state.configtextarea}/>
              </div>
            </div>
            <br />
          </Modal>
        </Card> */}

        {
          activeKey === 'secrets' && isFinishSecrets && <Secrets secrets={this.state.secrets} cb={cb} type="secretConfigMap" service={service} template={template} key="2" />
        }
        {
          activeKey === 'normal' && isFinishConfig && <Config cb={cb} type="configMap" service={service} onItemClick={this.loadConfigData} groupWithLabels={groupWithLabels} template={template} />
        }
      </div>
    );
  }
}

const tabs = [
  {
    text: <FormattedMessage {...AppServiceDetailIntl.commonConfig}/>,
    key: 'normal',
  },
  {
    text: <FormattedMessage {...AppServiceDetailIntl.encryptionConfig}/>,
    key: 'secrets',
  },
]

class ComposeGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'normal',
    }
  }
  cb = () => {
    const { loadServiceDetail, loadServices } = this.props
    loadServiceDetail()
    loadServices()
  }
  render() {
    // const parentScope = this
    const { activeKey } = this.state
    const { service } = this.props
    const { formatMessage } = this.props.intl
    return (
      <div id="ComposeGroup">
        <div className="tabs_header_style">
          {
            tabs.map(tab => {
              const { text, key } = tab
              const active = key === activeKey
              const tabClassNames = classNames('tabs_item_style', {
                tabs_item_selected_style: active,
              })
              return (
                <div
                  className={tabClassNames}
                  key={key}
                  onClick={() => this.setState({ activeKey: key })}
                >
                  {text}
                </div>
              )
            })
          }
        </div>
        <div>
          {/* <div className="titleBox">
            <div className="commonTitle">
              {formatMessage(AppServiceDetailIntl.dockerMountPoint)}
            </div>
            <div className="commonTitle">
              {formatMessage(AppServiceDetailIntl.configClassify)}
            </div>
            <div className="commonTitle">
              {formatMessage(AppServiceDetailIntl.configGroup)}
            </div>
            <div className="commonTitle">
              {formatMessage(AppServiceDetailIntl.configFile)}
            </div>
            <div style={{ clear: "both" }}></div>
          </div> */}
          <MyComponent
            loadConfigName={this.props.loadConfigName}
            loadConfigGroup={this.props.loadConfigGroup}
            getSecrets={this.props.getSecrets}
            configData={this.props.configData}
            activeKey={activeKey} cb={this.cb}
            service={service} serviceName={this.props.serviceName}
            cluster={this.props.cluster} serviceDetailmodalShow={this.props.serviceDetailmodalShow}
            formatMessage={formatMessage}/>
        </div>
      </div>
    )
  }
}

ComposeGroup.propTypes = {
  //
}

function mapStateToProps(state) {
  return {
    cluster: state.entities.current.cluster.clusterID,
    configData: state.configReducers.loadConfigName,
  }
}

export default connect(mapStateToProps, {
  loadConfigName,
  loadConfigGroup,
  getSecrets,
})(injectIntl(ComposeGroup, { withRef: true }))
