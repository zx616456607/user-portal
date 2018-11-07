import React from 'react'
import { Table, Button, Modal} from 'antd'
import './style/ContainerSecurityPolicyProject.less'
import TenxIcon from '@tenx-ui/icon/es/_old'
import classNames from 'classnames'

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
    render: () => <Status status="closed"/>,
  }, {
    title: '注释',
    dataIndex: 'annotation',
    key: 'annotation',
    width: 300
  }, {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 300,
    render: () => {
      return (
        <div className="buttons">
        <Button type="primary" onClick={() => self.setState({ showYaml: true })}>
          查看Yaml
        </Button>
        <Button className="delete" onClick={self.showDelete}>关闭/开启</Button>
        </div>
      )
    }
  }];
  return columns
}

const dataSource = [{
  key: '1',
  policy: 'hehe',
  annotation: 32,
}, {
  key: '2',
  policy: 'hehe',
  annotation: 32,
}];

export default class ContainerSecurityPolicy extends React.Component {
  state = {
    showYaml: false,
    openOrclose: false,
  }
  render() {
    const self = this
    return (
      <div className="ContainerSecurityPolicyProject">
        <div className='alertRow'>
          <TenxIcon type="tips"/>
          <span style={{ marginLeft: '8px' }}>开启 PSP 策略后，系统会将策略绑定到当前项目</span>
        </div>
        <Table columns={getColumns(self)} dataSource={dataSource} pagination={false}/>
        <CheckYaml self={self} showYaml={this.state.showYaml}/>
      </div>
    )
  }
}

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
  render() {
    return (
      <Modal title="查看Yaml"
          visible={this.props.showYaml}
          onOk={() => this.props.self.setState({ showYaml: false })}
          onCancel={() => this.props.self.setState({ showYaml: false })}
        >
          fafaf
      </Modal>
    )
  }
}