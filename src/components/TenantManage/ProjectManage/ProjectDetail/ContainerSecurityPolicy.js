import React from 'react'
import { Table, Button, Modal, Select, Popover, Tooltip, Icon } from 'antd'
import './style/ContainerSecurityPolicyProject.less'
import TenxIcon from '@tenx-ui/icon/es/_old'
import classNames from 'classnames'
import { connect } from 'react-redux'
import * as PSP from '../../../../actions/container_security_policy'
import * as PROJECTActions from '../../../../actions/project'
import { getDeepValue } from '../../../../../client/util/util'
import Yaml from '../../../../../client/components/EditorModule'
let yaml = require('js-yaml')

// 用于过滤非用户填写的 annotations
const userAReg = /^users\/annotations$/
const getColumns = (self) =>  {
  const columns = [{
    title: '策略名称',
    dataIndex: 'policy',
    key: 'policy',
    width: 300
  },{
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 300,
    render: (status) => <Status status={status}/>,
  }, {
    title: <span>
    <span style={{ padding: '0 8px' }}>注释</span>
    <Tooltip title={'注释只需在 annotations 中添加 users/annotations 字段即可'}>
    <Icon type="question-circle-o" />
    </Tooltip>
  </span>,
    dataIndex: 'annotation',
    key: 'annotation',
    width: 300,
    render: (annotation = []) => {
      const userAnnotation =  Object.entries(annotation)
      .filter(([key]) => userAReg.test(key))
      if (userAnnotation.length === 0) return <span>-</span>
      return  <Popover
        content={
          <div>
            {
              userAnnotation
              .map(([key, value]) => <div>
              <span>{JSON.stringify(value)}</span>
            </div>)
            }
          </div>
        }>
      <span className="annotation">查看注释</span>
    </Popover>
    }
  }, {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 300,
    render: (_, record) => {
      return (
        <div className="buttons">
        <Button type="primary" onClick={() =>
          self.setState( { currentPSP: record.policy },
            () => self.setState({showYaml: true})) }
            disabled={self.props.roleNum !== 2}
            >
          查看Yaml
        </Button>
        <Button className="delete" disabled={self.props.roleNum !== 2} onClick={() => self.showDelete(record)}>
        {record.status === 'opening' ? '关闭' : '开启'}
        </Button>
        </div>
      )
    }
  }];
  return columns
}

const Option = Select.Option
class ContainerSecurityPolicy extends React.Component {
  state = {
    showYaml: false,
    openOrclose: false,
    clustersArray: [],
    currentValue: undefined,
    dataList: undefined,
    currentPSP: undefined,
    showDelete: false,
    currentRecord: {},
    operationLoading: false,
  }
  async componentDidMount() {
    const { namespace } = this.props.projectDetail
    const res = await this.props.getProjectVisibleClusters(namespace)
    const clustersArray = (getDeepValue(res, ['response', 'result', 'data', 'clusters']) || [])
    .map(({ clusterName, clusterID }) => ({clusterName, clusterID}))
    this.setState({ clustersArray })
    if ((clustersArray[0] || {}).clusterID !== undefined) {
      this.setState({ currentValue: (clustersArray[0] || {}).clusterID })
    }
    await this.listPSP()
  }
  listPSP = async () => {
    const { namespace } = this.props.projectDetail
    if (this.state.currentValue === undefined) { return }
    const res = await this.props.listPSP(this.state.currentValue)
    const resProject = await this.props.listProjectPSPDetail(this.state.currentValue, namespace)
    const { result: { data = [] } = {} } = res.response
    const { result: { data:openPSP = [] } } = resProject.response
    const dataList = data.map(({ metadata: { name, annotations } = {} }) =>
     ({
       policy: name,
       annotation: annotations,
       status: (openPSP || []).includes(name) ? "opening": "closed" }))
    this.setState({ dataList })
  }
  handleChange =async (value) => {
    await this.setState({ currentValue: value, dataList: undefined})
    await this.listPSP()
  }
  showDelete = (record) => {
    this.setState({ currentRecord: record }, () => {
      this.setState({showDelete: true})
    })
  }
  openOrDelete = async () => {
    const { namespace } = this.props.projectDetail
    this.setState({ operationLoading: true })
    if (this.state.currentRecord.status === 'opening') {
      await this.props.stopPSPProject(this.state.currentValue, this.state.currentRecord.policy, namespace)
    }
    if (this.state.currentRecord.status === 'closed') {
      await this.props.startPodProject(this.state.currentValue, this.state.currentRecord.policy, namespace)
    }
    this.setState({ operationLoading: false, showDelete: false })
    this.listPSP()
  }
  render() {
    const self = this
    return (
      <div className="ContainerSecurityPolicyProject">
        <div className='alertRow'>
          <TenxIcon type="tips"/>
          <span style={{ marginLeft: '8px' }}>开启 PSP 策略后，系统会将策略绑定到当前项目</span>
        </div>

        <Select
          placeholder='请选择集群'
          value={this.state.currentValue}
          style={{ width: 120 }} onChange={this.handleChange}
          notFoundContent={'暂无集群'}>
          {
            this.state.clustersArray.map(({ clusterName, clusterID }) =>
              <Option value={clusterID}>{clusterName}</Option>
            )
          }
        </Select>
        <Table
          columns={getColumns(self)}
          dataSource={this.state.dataList}
          pagination={false}
          loading={this.state.dataList === undefined}
          />
        { this.state.showYaml === true &&
        <CheckYaml self={self} showYaml={this.state.showYaml}
        listPSPDetail={this.props.listPSPDetail}
        currentPSP={this.state.currentPSP}
        namespace={this.state.currentValue}
        /> }
        <Modal title={this.state.currentRecord.status === 'opening' ? '关闭操作' : '开启操作'}
          visible={this.state.showDelete}
          onOk={this.openOrDelete}
          onCancel={() => { this.setState({ showDelete: false }) }}
          confirmLoading={this.state.operationLoading}
        >
        {
          this.state.currentRecord.status === 'opening' &&
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}/>
            确认要关闭这一条PSP?
          </div>
        }{
          this.state.currentRecord.status === 'closed' &&
          <div className="alertIconRow">
          <TenxIcon type="tips" className="alertIcon"/>
            确认要开启这一条PSP?
          </div>
        }
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {}
}
export default connect(mapStateToProps, {
  listProjectPSPDetail: PSP.listProjectPSPDetail,
  listPSP: PSP.listPSP,
  getProjectVisibleClusters: PROJECTActions.getProjectVisibleClusters,
  listPSPDetail: PSP.listPSPDetail,
  startPodProject: PSP.startPodProject,
  stopPSPProject: PSP.stopPSPProject,
})(ContainerSecurityPolicy)

function Status ({ status }) {
  return(
    <div>
    {
      status === 'closed' &&
      <div
      className={classNames({ 'red': status === 'closed'})}
      ><TenxIcon type="circle"/><span>已关闭</span></div>
    }{
      status === 'opening' &&
      <div
      className={classNames({ 'green': status === 'opening'})}
      ><TenxIcon type="circle"/><span>已开启</span></div>
    }
    </div>
  )
}

class CheckYaml extends React.Component{
  state = {
    yaml: 'loading'
  }
  async componentDidMount() {
    const res = await this.props.listPSPDetail(this.props.namespace, this.props.currentPSP)
    const { result: { data:yamlJSON = {} } } = res.response
    this.setState({ yaml: yaml.dump(yamlJSON) })
  }
  onChange = (yaml) => {
    // this.setState({ yaml })
  }
  render() {
    return (
      <Modal title="查看Yaml"
          visible={this.props.showYaml}
          onOk={() => this.props.self.setState({ showYaml: false })}
          onCancel={() => this.props.self.setState({ showYaml: false })}
          footer={<Button type="primary" onClick={() => this.props.self.setState({ showYaml: false })}>关闭</Button>}
        >
          <Yaml
            options = {{ readOnly: true }}
            onChange={this.onChange}
            value={this.state.yaml}
          />
      </Modal>
    )
  }
}