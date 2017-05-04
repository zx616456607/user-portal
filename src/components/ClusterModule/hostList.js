/**
 * Created by zhangchengzheng on 2017/5/2.
 */
import React, { Component, propTypes } from 'react'
import { Card, Button, Tooltip, Icon, Input, Select, Spin, Menu, Dropdown } from 'antd'
import './style/hostList.less'

const MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  changeSchedulable(node, e) {
    //this function for change node schedulable
    const { scope } = this.props;
    const { clusterID, changeClusterNodeSchedule } = scope.props;
    let { nodeList } = scope.state;
    let notification = new NotificationHandler()
    changeClusterNodeSchedule(clusterID, node, e, {
      success: {
        func: ()=> {
          // notification.info(e ? '开启调度中，该操作 1 分钟内生效' : '关闭调度中，该操作 1 分钟内生效');
          notification.success(e ? '开启调度成功' : '关闭调度成功');
          nodeList.map((item) => {
            if(item.objectMeta.name == node) {
              item.schedulable = e;
            }
          });
          scope.setState({
            nodeList: nodeList
          })
        },
        isAsync: true
      }
    })
  },
  ShowDeleteClusterNodeModal(node) {
    //this function for delete cluster node
    const { scope } = this.props;
    scope.setState({
      deleteNode: node,
      deleteNodeModal: true
    })
  },
  openTerminalModal(item, e) {

  },
  render: function () {
    const { isFetching, containerList, cpuMetric, memoryMetric, license } = this.props
    //const clusterID = this.props.scope.props.clusterID
    const root = this
    if (false) {
    //if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    let podList = [1,2,3,4,5,6,7]
    if (podList.length === 0) {
      return (
        <div style={{ lineHeight: '100px', height: '200px', paddingLeft: '30px' }}>您还没有主机，去创建一个吧！</div>
      )
    }
    //const maxNodes = license[camelize('max_nodes')]
    let items = podList.map((item, index) => {
      const dropdown = (
        <Menu disabled={item.isMaster ? true : false}
          onClick={this.ShowDeleteClusterNodeModal.bind(this, item)}
          style={{ width: '100px' }}
        >
          <Menu.Item key={item.id}>
            <span>删除节点</span>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='podDetail' key={index} >
        {/*<div className='podDetail' key={`${item.objectMeta.name}-${index}`} >*/}
          <div className='name commonTitle'>
            111111主机名称
            {/*<Link to={`/cluster/${clusterID}/${item.objectMeta.name}`}>{item.objectMeta.name}</Link>*/}
          </div>
          <div className='status commonTitle'>
            状态
            {/*<span className={ item.ready == 'True' ? 'runningSpan' : 'errorSpan' }><i className='fa fa-circle' />&nbsp;&nbsp;{item.ready == 'True' ? '运行中' : '异常'}</span>*/}
          </div>
          <div className='role commonTitle'>
            节点角色
            {/*<Tooltip title={item.isMaster ? MASTER : SLAVE}>*/}
              {/*<span>{item.isMaster ? MASTER : SLAVE}</span>*/}
            {/*</Tooltip>*/}
          </div>
          <div className='container commonTitle'>
            {/*<span>{getContainerNum(item.objectMeta.name, containerList)}</span>*/}
            容器数
          </div>
          <div className='cpu commonTitle'>
            {/*<span className='topSpan'>{item[camelize('cpu_total')] / 1000}核</span>*/}
            {/*<span className='bottomSpan'>{cpuUsed(item[camelize('cpu_total')], cpuMetric, item.objectMeta.name)}</span>*/}
            CPU
          </div>
          <div className='memory commonTitle'>
            {/*<span className='topSpan'>{diskFormat(item[camelize('memory_total_kb')])}</span>*/}
            {/*<span className='bottomSpan'>{memoryUsed(item[camelize('memory_total_kb')], memoryMetric, item.objectMeta.name)}</span>*/}
            内村
          </div>
          <div className='disk commonTitle'>
            磁盘
            {/*<span className='topSpan'>{'-'}</span>*/}
            {/*<span className='bottomSpan'>{'-'}</span>*/}
          </div>
          <div className='schedule commonTitle'>
            {/*<Switch*/}
              {/*className='switchBox'*/}
              {/*defaultChecked={item.schedulable}*/}
              {/*checkedChildren='开'*/}
              {/*unCheckedChildren='关'*/}
              {/*disabled={index >= maxNodes}*/}
              {/*onChange={this.changeSchedulable.bind(root, item.objectMeta.name)}/>*/}
            {/*<span className='scheduleSpan'>*/}
              {/*{*/}
                {/*item.schedulable*/}
                  {/*? (*/}
                  {/*<span>*/}
                    {/*正常调度&nbsp;*/}
                    {/*<Tooltip title={`允许分配新容器`}>*/}
                      {/*<Icon type="question-circle-o" />*/}
                    {/*</Tooltip>*/}
                  {/*</span>*/}
                {/*)*/}
                  {/*: (*/}
                  {/*<span>*/}
                    {/*暂停调度&nbsp;*/}
                    {/*<Tooltip title={`不允许分配新容器，正常运行的不受影响`}>*/}
                      {/*<Icon type="question-circle-o" />*/}
                    {/*</Tooltip>*/}
                  {/*</span>*/}
                {/*)*/}
              {/*}*/}
            {/*</span>*/}
            调度状态
          </div>
          <div className='runningTime commonTitle'>
            运行时间
            {/*<Tooltip title={calcuDate(item.objectMeta.creationTimestamp)}>*/}
              {/*<span>{calcuDate(item.objectMeta.creationTimestamp)}</span>*/}
            {/*</Tooltip>*/}
          </div>
          <div className='startTime commonTitle'>
            {/*<Tooltip title={formatDate(item.objectMeta.creationTimestamp)}>*/}
              {/*<span>{formatDate(item.objectMeta.creationTimestamp)}</span>*/}
            {/*</Tooltip>*/}
            启动时间
          </div>
          <div className='opera commonTitle'>
            <Dropdown.Button type="ghost" overlay={dropdown}  onClick={()=> browserHistory.push(`/cluster/${clusterID}/${item.objectMeta.name}`)}>
              主机详情
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className='imageList'>
        {items}
      </div>
    );
  }
});

class hostList extends Component{
  constructor(props){
    super(props)

    this.state = {

    }
  }

  render(){
    console.log('hostlist.props=',this.props)
    return <div id="cluster__hostlist">
      <Card className='ClusterListCard'>
        <div className='operaBox'>
          <Button
            className='addPodBtn'
            size='large'
            type='primary'
            onClick={this.handleAddClusterNode}
          >
            <Icon type='plus' />
            <span>添加主机节点</span>
          </Button>
          <Button className='terminalBtn' size='large' type='ghost' onClick={this.openTerminalModal}>
            <svg>
              <use xlinkHref='#terminal' />
            </svg>
            <span>终端 | 集群管理</span>
          </Button>
          <Button type='ghost' size='large' className="refreshBtn" onClick={()=> this.loadData()}>
            <i className='fa fa-refresh' /> 刷新
          </Button>
          <span className='searchBox'>
            <Input className='searchInput' onChange={(e)=> this.setState({nodeName: e.target.value})} size='large' placeholder='搜索' type='text' onPressEnter={this.searchNodes} />
            <Icon type="search" className="fa"  onClick={this.searchNodes}/>
          </span>
        </div>
        <div className='dataBox'>
          <div className='titleBox'>
            <div className='name commonTitle'>
              <span>主机名称</span>
            </div>
            <div className='status commonTitle'>
              <span>状态</span>
            </div>
            <div className='role commonTitle'>
              <span>节点角色</span>
            </div>
            <div className='container commonTitle'>
              <span>容器数</span>
            </div>
            <div className='cpu commonTitle'>
              <span>CPU</span>
            </div>
            <div className='memory commonTitle'>
              <span>内存</span>
            </div>
            <div className='disk commonTitle'>
              <span>磁盘</span>
            </div>
            <div className='schedule commonTitle'>
              <span>调度状态</span>
            </div>
            <div className='runningTime commonTitle'>
              <span>运行时间</span>
            </div>
            <div className='startTime commonTitle'>
              <span>启动时间</span>
            </div>
            <div className='opera commonTitle'>
              <span>操作</span>
            </div>
          </div>
          <div className='datalist'>
            <MyComponent />
          </div>
        </div>
      </Card>
    </div>
  }
}


export default hostList

//<MyComponent podList={nodeList} containerList={podCount} isFetching={isFetching} scope={scope} memoryMetric={memoryMetric} cpuMetric={cpuMetric} license={license} />