import * as React from 'react'
import { Table, Card } from 'antd'
import './style/CreateAppStack.less'
import * as HActions from '../../../../actions/harbor'
import { connect } from 'react-redux'
import get from 'lodash/get'
import TimeHover from '@tenx-ui/time-hover/lib'

function mapStateToProps() {
  return {}
}

const columns = [{
  title: '工作负载',
  dataIndex: 'name',
  key: 'name',
}, {
  title: '所属项目',
  dataIndex: 'projectName',
  key: 'projectName',
}, {
  title: '所属集群',
  dataIndex: 'clusterName',
  key: 'clusterName',
}, {
  title: '镜像版本',
  dataIndex: 'tag',
  key: 'tag',
}, {
  title: '创建时间',
  dataIndex: 'createTime',
  key: 'createTime',
  render: (time) => {
    return <TimeHover time={time} />
  }
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
      image: this.props.imageName.split('/')[1],
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
         pagination={false}
         loading={this.state.loading}
        />
      </Card>
    )
  }
}