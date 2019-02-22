import * as React from 'react'
import { Table, Card } from 'antd'
import './style/CreateAppStack.less'
import * as HActions from '../../../../actions/harbor'
import { connect } from 'react-redux'
import get from 'lodash/get'
import TimeHover from '@tenx-ui/time-hover/lib'
import Ellipsis from '@tenx-ui/ellipsis/lib'
function mapStateToProps() {
  return {}
}

const columns = [{
  title: '工作负载',
  dataIndex: 'name',
  key: 'name',
  render: (name) =>  <Ellipsis>{name}</Ellipsis>,
}, {
  title: '所属项目',
  dataIndex: 'projectName',
  key: 'projectName',
  render: (name) =>  <Ellipsis>{name}</Ellipsis>,
}, {
  title: '所属集群',
  dataIndex: 'clusterName',
  key: 'clusterName',
  render: (name) =>  <Ellipsis>{name}</Ellipsis>,
}, {
  title: '镜像版本',
  dataIndex: 'tag',
  key: 'tag',
  render: (name) =>  <Ellipsis>{name}</Ellipsis>,
}, {
  title: '创建时间',
  dataIndex: 'createTime',
  key: 'createTime',
  render: (time) => {
    return <TimeHover time={time} />
  },
}];

@connect(mapStateToProps, {
  getImageAppStackN: HActions.getImageAppStackN,
})
export default class CreateAppStack extends React.Component {
  state = {
    tabeDate: [],
    loading: true
  }
  async componentDidMount() {
    const res = await this.props.getImageAppStackN({
      server: this.props.server,
      group: this.props.ImageGroupName,
      image: this.props.imageName.replace(`${this.props.ImageGroupName}/`, ''),
    })
    const tabeDate = get(res, [ 'response', 'result', 'data', 'loads' ], [])
    this.setState({ tabeDate, loading: false })
  }
  render() {
    return(
      <Card className="CreateAppStack">
        <Table
         columns = {columns}
         dataSource= {this.state.tabeDate}
         className="table-flex"
         pagination={false}
         loading={this.state.loading}
        />
      </Card>
    )
  }
}