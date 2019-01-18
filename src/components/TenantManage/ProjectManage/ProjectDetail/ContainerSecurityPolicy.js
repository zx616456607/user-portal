import React from 'react'
import { Table, Button, Modal, Select, Popover, Tooltip, Icon, Spin, notification } from 'antd'
import './style/ContainerSecurityPolicyProject.less'
import TenxIcon from '@tenx-ui/icon/es/_old'
import classNames from 'classnames'
import { connect } from 'react-redux'
import * as PSP from '../../../../actions/container_security_policy'
import * as PROJECTActions from '../../../../actions/project'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import Yaml from '../../../../../client/components/EditorModule'
import isEmpty  from 'lodash/isEmpty'
let yaml = require('js-yaml')

// 用于过滤非用户填写的 annotations
const userAReg = /^users\/annotations$/
const getColumns = (self) =>  {
  const columns = [{
    title: '集群名称',
    dataIndex: 'clusterName',
    key: 'clusterName',
    width: 300
  },{
    title: '绑定策略',
    dataIndex: 'bindPolicy',
    key: 'bindPolicy',
    width: 300,
    render: (_, record) => {
      const currentPsp = self.state.currentOpenPsp[record.tableIndex]

      return <Select
        placeholder='请选择集群'
        value={currentPsp}
        style={{ width: 120 }} onChange={(value) => { self.handleChange(value, record.tableIndex) }}
        notFoundContent={'暂无集群'}
        disabled={!self.state.edit}
      >
        { record.policyArray.map(({ policy }) => {
          return <Option value={policy}>{policy}</Option>
        })
        }
      </Select>
    }
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
    render: (data, record) => {
      const currentPolicy = record.policyArray.filter(({ policy }) => policy === self.state.currentOpenPsp[record.tableIndex] )
      const annotation = getDeepValue(currentPolicy, [0, 'annotation']) || {}
      const userAnnotation =  Object.entries(annotation)
      .filter(([key]) => userAReg.test(key))
      if (userAnnotation.length === 0) return <span>-</span>
      return  <Popover
        content={
          <div>
            {
              userAnnotation
              .map(([key, value]) => <div style={{ maxWidth: '400px' }}>
              <span>{JSON.stringify(value)}</span>
            </div>)
            }
          </div>
        }>
      <span className="annotation">查看注释</span>
    </Popover>
    }
  },
  // {
  //   title: '操作',
  //   dataIndex: 'operation',
  //   key: 'operation',
  //   width: 300,
  //   render: (_, record) => {
  //     return (
  //       <div className="buttons">
  //       <Button type="primary" onClick={() =>
  //         self.setState( { currentPSP: record.policy },
  //           () => self.setState({showYaml: true})) }
  //           disabled={self.props.roleNum !== 2}
  //           >
  //         查看Yaml
  //       </Button>
  //       {/* <Button className="delete" disabled={self.props.roleNum !== 2} onClick={() => self.showDelete(record)}>
  //       {record.status === 'opening' ? '关闭' : '开启'}
  //       </Button> */}
  //       </div>
  //     )
  //   }
  // }
];
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
    edit: false,
    currentOpenPsp: [],
  }
  componentDidMount() {
    this.loadAll()
  }
  loadAll = async () => {
    const { namespace } = this.props.projectDetail
    const res = await this.props.getProjectVisibleClusters(namespace)
    const clustersArray = (getDeepValue(res, ['response', 'result', 'data', 'clusters']) || [])
    .map(({ clusterName, clusterID }) => ({clusterName, clusterID}))
    // this.setState({ clustersArray })
    // if ((clustersArray[0] || {}).clusterID !== undefined) {
    //   this.setState({ currentValue: (clustersArray[0] || {}).clusterID })
    // }
    const asyncFunc = clustersArray.map(({ clusterID }) => {
      return this.listPSP.call(this, clusterID)
    })
    const policyArray = await Promise.all(asyncFunc)
    const currentOpenPsp = policyArray.map((ipolicyArray) => {
      const iPolicy = ipolicyArray.filter(({ status }) => status === 'opening')
      if (iPolicy.length === 0) { return undefined }
      return iPolicy[0].policy
    })
    this.setState({ currentOpenPsp })
    const dataList = clustersArray.map((node, index) => {
      return Object.assign({}, { policyArray: policyArray[index] }, node, { tableIndex: index } )
    })
    this.setState({ dataList })
  }
  listPSP = async (currentValue) => {
    const { namespace } = this.props.projectDetail
    // if (this.state.currentValue === undefined) { return }
    const res = await this.props.listPSP(currentValue)
    const resProject = await this.props.listProjectPSPDetail(currentValue, namespace)
    const { result: { data = [] } = {} } = res.response
    const { result: { data:openPSP = [] } } = resProject.response
    const dataList = data.map(({ metadata: { name, annotations } = {} }) =>
     ({
       policy: name,
       annotation: annotations,
       status: (openPSP || []).includes(name) ? "opening": "closed" }))
    return dataList
  }
  handleChange =async (value, index) => {
    const newcurrentOpenPsp = [...this.state.currentOpenPsp]
    newcurrentOpenPsp[index] = value
    this.setState({
      currentOpenPsp: newcurrentOpenPsp
    })
  }
  showDelete = (record) => {
    this.setState({ currentRecord: record }, () => {
      this.setState({showDelete: true})
    })
  }
  openOrDelete = async () => {
    const { namespace } = this.props.projectDetail
    const requestArray = this.state.dataList.map(({ clusterID }, index) => {
      if (isEmpty(this.state.currentOpenPsp[index])) {
        return () => {}
      }
      return this.props.startPodProject.call(this, clusterID, this.state.currentOpenPsp[index], namespace)
    })
    await Promise.all(requestArray)
    .then(() => { notification.success({ message: '保存成功' }) })
    .catch(() => { notification.warn({ message: '保存失败' }) })
    this.setState({ dataList: undefined, edit: false })
    this.loadAll()
    // this.setState({ operationLoading: true })
    // if (this.state.currentRecord.status === 'opening') {
    //   await this.props.stopPSPProject(this.state.currentValue, this.state.currentRecord.policy, namespace)
    // }
    // if (this.state.currentRecord.status === 'closed') {
    //   await this.props.startPodProject(this.state.currentValue, this.state.currentRecord.policy, namespace)
    // }
    // this.setState({ operationLoading: false, showDelete: false })
    // this.listPSP()
  }
  render() {
    const self = this
    return (
      <div className="ContainerSecurityPolicyProject">
        <div className='alertRow'>
          <TenxIcon type="tips"/>
          <span style={{ marginLeft: '8px' }}>平台管理员可以编辑每个集群对应的 PSP 策略</span>
        </div>

        {/* <Select
          placeholder='请选择集群'
          value={this.state.currentValue}
          style={{ width: 120 }} onChange={this.handleChange}
          notFoundContent={'暂无集群'}>
          {
            this.state.clustersArray.map(({ clusterName, clusterID }) =>
              <Option value={clusterID}>{clusterName}</Option>
            )
          }
        </Select> */}
        <div className="editOperation">
            {
              this.state.edit ?
              <div>
                <Button onClick={() => { this.setState({ edit: false }); this.loadAll() }}>取消</Button>
                <Button type="primary" className="save" onClick={this.openOrDelete}>保存</Button>
              </div> :
              <Button type="primary" onClick={() => this.setState({ edit: true })} disabled={self.props.roleNum !== 2}>编辑</Button>
            }
        </div>
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
    yaml: 'loading',
    depayRender: false
  }
  async componentDidMount() {
    const res = await this.props.listPSPDetail(this.props.namespace, this.props.currentPSP)
    const { result: { data:yamlJSON = {} } } = res.response
    this.setState({ yaml: yaml.dump(yamlJSON) })
    setTimeout(() => { this.setState({ depayRender: true }) }, 300) // 动画效果会影响编辑器的布局，延时渲染编辑器以躲避动画效果带来的影响
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
          width={800}
        >
        {
          this.state.depayRender ?
          <Yaml
            options = {{ readOnly: true }}
            onChange={this.onChange}
            value={this.state.yaml}
          /> : <Spin spinning={true} ><div style={{ height: 100 }}/></Spin>
        }
      </Modal>
    )
  }
}