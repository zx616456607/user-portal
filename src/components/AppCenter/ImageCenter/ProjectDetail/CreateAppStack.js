import * as React from 'react'
import { Table, Card } from 'antd'
import './style/CreateAppStack.less'
import * as HActions from '../../../../actions/harbor'
import { connect } from 'react-redux'
import get from 'lodash/get'


function mapStateToProps() {
  return {}
}
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
    const tabeDate = get(res, [ 'response', 'result', 'data', 'loads' ], {})
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