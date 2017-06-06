
/*
 * Project Manage
 *
 * v0.1 - 2017-06-02
 * @author zhangxuan
 */
import React, { Component } from 'react'
import classNames from 'classnames';
import './style/ProjectManage.less'
import { Row, Col, Button, Input, Select, Card, Icon, Table, Modal, Checkbox, Tooltip, Steps, Transfer, InputNumber, Tree} from 'antd'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import SearchInput from '../../SearchInput'

const Step = Steps.Step;
const array = Array.apply(null, Array(Math.floor(Math.random() * 3) + 3));
// const steps = array.map((item, i) => ({
//   title: `步骤${i + 1}`,
// }));
const steps = [{
  title: '项目基础信息'
},{
  title: '为项目添加角色'
},{
  title: '为角色关联对象'
}]
class ProjectManage extends Component{
  constructor(props) {
    super(props)
    this.state={
      delModal: false,
      delSingle:false,
      paySingle:false,
      payModal:false,
      loading:false,
      current: 0,
      
    }
  }
  componentDidMount(){
  
  }
  componentWillReceiveProps(nextProps){
    let step = nextProps.location.query.step;
    
  }
  goStep(current) {
    let s = '';
    if (current === 0) {
      s = 'first';
    }else if(current === 1) {
      s = 'second';
    }else{
      s = 'third'
    }
    browserHistory.push(`/tenant_manage/project_manage?step=${s}`);
    this.setState({ current });
  }
  next() {
    let current = this.state.current + 1;
    if (current === 3) {
      current = 0;
    }
    this.goStep(current)
  }
  goBack() {
    let current = this.state.current - 1;
    if (current === -1) {
      current = 2;
    }
    this.goStep(current)
  }
  delMember() {
    this.setState({delModal: false})
  }
  delProject() {
    this.setState({delModal: true})
  }
  delSingle() {
    this.setState({delSingle: true})
  }
  delSingleMember() {
    this.setState({delSingle: false})
  }
  singleCancel(e) {
    console.log(e)
    this.setState({delSingle: false})
  }
  pay() {
    this.setState({payModal: true})
  }
  payCancel() {
    this.setState({payModal: false})
  }
  payOk() {
    this.setState({payModal: false})
  }
  paySingle() {
    this.setState({paySingle: true})
  }
  paySingleCancel() {
    this.setState({paySingle: false})
  }
  paySingleOk() {
    this.setState({paySingle: false})
  }
  refresh() {
    this.setState({loading: true},()=> {
      setTimeout(()=> {
        this.setState({loading: false})
      },1000)
    })
  }
  render() {
    const step = this.props.location.query.step || '';
    const { current } = this.state;
    const pagination = {
      simple: true,
      total:  36,
      showSizeChanger: true,
      defaultPageSize: 10,
      defaultCurrent: 1,
      current: 1,
      pageSizeOptions: ['5', '10', '15', '20'],
    };
    const columns = [{
      title: '项目名',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text) => <a href="#">{text}</a>,
    }, {
      title: '备注',
      dataIndex: 'comment',
      key: 'comment',
    }, {
      title: '授权集群',
      dataIndex: 'schooling',
      key: 'schooling',
      sorter: (a, b) => a.schooling.length - b.schooling.length,
    }, {
      title: '成员',
      dataIndex: 'member',
      key: 'member',
      sorter: (a, b) => a.name - b.name,
    }, {
      title: '创建时间/更新时间',
      dataIndex: 'ctime',
      key: 'ctime',
      filters: [{
        text: '2017',
        value: '2017',
      }, {
        text: '2016',
        value: '2016',
      }],
      onFilter: (value, record) => record.ctime.indexOf(value) === 0,
      render: (data) =>
        <div>
          <div>{data}</div>
        </div>

    }, {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      sorter: (a, b) => a.balance - b.balance,
      render: (text)=><span className="balanceColor">{text}T</span>
    }, {
      title: '操作',
      key: 'operation',
      render: (text, record) => (
        <span>
          <Button type='primary' size='large' onClick={()=> this.paySingle()}>充值</Button>
          <Button type='ghost' size='large' style={{marginLeft:'10px'}} onClick={()=>this.delSingle()}>删除</Button>
        </span>
      ),
    }];
    const delData = [];
    for (let i = 0; i < 36; i++) {
      delData.push({
        key: i,
        projectName: `李大嘴${i}`,
        comment: `西湖区湖底公园${i}号`
      });
    }
    const payData = [];
    for (let i = 0; i < 20; i++) {
      payData.push({
        key: i,
        projectName: `项目${i}`,
        balance: `100${i} T`
      })
    }
    const data = [{
      key: '1',
      projectName: '胡彦斌',
      comment: 32,
      schooling: '阿西湖区湖底公园1',
      member: '粉丝',
      ctime: '2017-03-20 18:12:11',
      balance: '1000'
    }, {
      key: '2',
      projectName: '胡彦斌',
      comment: 32,
      schooling: '号西湖区湖底公园1',
      member: '粉丝们',
      ctime: '2016-03-20 18:12:11',
      balance: '1001'
    }, {
      key: '3',
      projectName: '胡彦斌',
      comment: 32,
      schooling: '西湖区湖底公园1',
      member: '粉丝们',
      ctime: '2017-03-20 18:12:11',
      balance: '1002'
    }];
    const rowSelection = {
      onChange(selectedRowKeys, selectedRows) {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      onSelect(record, selected, selectedRows) {
        console.log(record, selected, selectedRows);
      },
      onSelectAll(selected, selectedRows, changeRows) {
        console.log(selected, selectedRows, changeRows);
      },
    };
    return (
      <div id="account_projectManage">
        <div className='alertRow'>项目之间是项目隔离的，通过创建项目实现按照角色关联对象（成员、团队），并根据授予的权限，使用项目中资源及功能。系统管理员有创建和管理所有项目的权限
        （创建、删除、充值、授权集群、编辑备注、添加角色、为角色关联/取消对象、移除角色），团队管理员有管理项目的某些权限（充值、添加角色、删除角色、为角色关联/取消对象）。
        </div>
        <Modal title="删除项目" visible={this.state.delModal} width={610} height={570}
          onCancel={()=> this.setState({delModal: false})}
          onOk={()=> this.delMember()}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"/>
            <span>将永久删除一下项目，包括项目中的所有资源。您确定要删除一下项目？</span>
          </div>
          <DelProjectTable delData={delData}/>
        </Modal>
        <Modal title="删除项目" visible={this.state.delSingle} width={610}
          onCancel={()=> this.singleCancel()}
          onOk={()=> this.delSingleMember()}
        >
          <DelProjectTable delData={[delData[0]]}/>
        </Modal>
        <Modal title="项目充值" visible={this.state.payModal} width={610}
          onCancel={()=> this.payCancel()}
          onOk={()=> this.payOk()}
        >
          <PayTable data={payData}/>
        </Modal>
        <Modal title="项目充值" visible={this.state.paySingle} width={580}
          onCancel = {()=> this.paySingleCancel()}
          onOk = {()=> this.paySingleOk()}
        >
          <dl className="paySingleList">
            <dt>项目名</dt><dd>nginx-test</dd>
          </dl>
          <dl className="paySingleList">
            <dt>余额</dt><dd>10T</dd>
          </dl>
          <dl className="paySingleList">
            <dt>充值金额</dt>
            <dd className="payBtn">
              <span className="active btnList">10T</span>
              <span className="btnList">20T</span>
              <span className="btnList">50T</span>
              <span className="btnList">100T</span>
              <InputNumber size="large" min={10}/>
              <b>T</b>
            </dd>
          </dl>
        </Modal>
        <Row className={classNames({'hidden': step !== ''})}>
          <Button type='primary' size='large'  className='addBtn' onClick={()=> browserHistory.push('/tenant_manage/project_manage?step=first')}>
            <i className='fa fa-plus' /> 创建项目
          </Button>
          <Button type="ghost" icon="pay-circle-o" size="large" className="manageBtn" onClick={()=> this.pay()}>充值</Button>
          <Button type="ghost" icon={ this.state.loading ? 'loading' : "reload"}  size="large" className="manageBtn" onClick={()=> this.refresh()}>刷新</Button>
          <Button type="ghost" icon="delete" size="large" className="manageBtn" onClick={()=> this.delProject()}>删除</Button>
          <SearchInput/>
          <div className="total">共3个</div>
        </Row>
        <Row className={classNames("projectList",{'hidden': step !== ''})}>
          <Card>
            <Table rowSelection={rowSelection} pagination={pagination} columns={columns} dataSource={data}/>
          </Card>
        </Row>
        <div className={classNames("goBackBox",{'hidden': step === ''})}>
          <span className="goBackBtn pointer" onClick={()=> browserHistory.push('/tenant_manage/project_manage')}>返回</span>
          <i/>
          创建项目
        </div>
        <div className={classNames('createBox',{'hidden': step === ''})}>
          <div className="">
            <Steps current={current}>
              {steps.map((s, i) => <Step key={i} title={s.title} description={s.description} />)}
            </Steps>
          </div>
          <div className="alertRow createTip">
            {
              step === 'first' ? '请填写项目名称、备注、并为该项目授权集群' : ''
            }
            {
              step === 'second' ? '为该项目添加需要的角色，角色是提前创建好的，也可在此创建新角色后继续添加' : ''
            }
            {
              step === 'third' ? '为添加的角色关联对象，即可为关联的对象授予相应角色应有的权限；关联的对象可为（成员/团队/成员&团队组合）。' : ''
            }
          </div>
          <div className={classNames({'hidden' : step !=='first'})}>
            <CreateStepFirst/>
          </div>
          <div className={classNames({'hidden' : step !=='second'})}>
            <CreateStepSecond/>
          </div>
          <div className={classNames({'hidden' : step !=='third'})}>
            <CreateStepThird/>
          </div>
        </div>
        
        <div className={classNames('createBtnBox',{'hidden': step === ''})}>
          <Button size="large" onClick={()=> browserHistory.push('/tenant_manage/project_manage')}>取消</Button>
          <Button size="large" className={classNames({'hidden': step === '' || step === 'first'})} onClick={()=> this.goBack()}>上一步</Button>
          <Button size="large" className={classNames({'hidden': step === 'third'})} onClick={()=> this.next()}>下一步</Button>
          <Button type="primary" size="large" style={{display: step === 'third' ? 'inline-block' : 'none'}}>创建</Button>
        </div>
      </div>
    )
  }
}

class DelProjectTable extends Component{
  constructor(props){
    super(props);
    this.state={
      selectedRowKeys: [],  // 这里配置默认勾选列
      loading: false,
    }
  }
  start() {
    this.setState({ loading: true });
    // 模拟 ajax 请求，完成后清空
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  }
  onSelectChange(selectedRowKeys) {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys});//报错
  }
  render() {
    const columns = [{
      title: '项目名',
      dataIndex: 'projectName',
    }, {
      title: '备注',
      dataIndex: 'comment',
    }];
    const { loading, selectedRowKeys } = this.state;
    const {delData}= this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
    };
    return (
      <div className="delProjectModal">
        <Table scroll={{y: 300}} rowSelection={rowSelection} columns={columns} dataSource={delData} pagination={false} />
        <div className="delTipBox"><i className="fa fa-check-square"/>选中此框以确认您要删除这些项目。</div>
      </div>
    )
  }
}
class PayTable extends Component{
  constructor(props){
    super(props)
    this.state={
      selectedRowKeys: [],  // 这里配置默认勾选列
      loading: false,
    }
  }
  start() {
    this.setState({ loading: true });
    // 模拟 ajax 请求，完成后清空
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  }
  onSelectChange(selectedRowKeys) {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys});//报错
  }
  render() {
    const columns = [{
      title: '项目名',
      dataIndex: 'projectName',
    }, {
      title: '余额',
      dataIndex: 'balance',
    }];
    const { loading, selectedRowKeys } = this.state;
    const {data}= this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div className="payModal">
        <div className="alertRow">
          注：可为项目充值，全选可为项目充值
        </div>
        <Table scroll={{y: 300}} rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false}/>
        <dl className="payBtnBox">
          <dt>充值金额</dt>
          <dd className="payBtn">
            <span className="active btnList">10T</span>
            <span className="btnList">20T</span>
            <span className="btnList">50T</span>
            <span className="btnList">100T</span>
            <InputNumber size="large" min={10}/>
            <b>T</b>
          </dd>
        </dl>
      </div>
    )
  }
}
class CreateStepFirst extends Component{
  constructor(props) {
    super(props)
  }
  handleChange(value){
    console.log(value)
  }
  render() {
    const Option = Select.Option;
    let children = [];
    for (let i = 10; i < 36; i++) {
      children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }
    
    return (
      <div id="projectCreateStepOne">
        <div className="inputBox">
          <span>项目名称</span>
          <Input size="large" placeholder="请填写项目名称"/>
        </div>
        <div className="inputBox">
          <span>备注</span>
          <Input type="textarea"  />
        </div>
        <div className="inputBox">
          <span>授权集群</span>
          <Select
            multiple
            style={{ width: '170px' }}
            placeholder="请选择授权集群"
            onChange={()=>this.handleChange()}
          >
            {children}
          </Select>
        </div>
      </div>
    )
  }
}
class CreateStepSecond extends Component{
  constructor(props){
    super(props)
    this.state={
      mockData: [],
      targetKeys: [],
      characterModal: false
    }
  }
  componentDidMount(){
    this.getMock();
  }
  getMock() {
    const targetKeys = [];
    const mockData = [];
    for (let i = 0; i < 20; i++) {
      const data = {
        key: i,
        title: `内容${i + 1}`,
        description: `内容${i + 1}的描述`,
        chosen: Math.random() * 2 > 1,
      };
      if (data.chosen) {
        targetKeys.push(data.key);
      }
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys });
  }
  filterOption(inputValue, option) {
    return option.description.indexOf(inputValue) > -1;
  }
  handleChange(targetKeys) {
    this.setState({ targetKeys });
  }
  cancelModal() {
    this.setState({characterModal:false})
  }
  createModal() {
    this.setState({characterModal:false})
  }
  render() {
    return (
      <div id="projectCreateStepSecond" className="projectCreateStepSecond">
        <Modal title="创建角色" visible={this.state.characterModal} width={765}
          onCancel={()=> this.cancelModal()}
          onOk={()=> this.createModal()}
        >
          <div className="inputBox">
            <span>角色名称</span>
            <Input size="large" placeholder="请填写角色名称"/>
          </div>
          <div className="inputBox">
            <span>备注</span>
            <Input size="large"/>
          </div>
          <div className="authChoose">
            <span>权限选择</span>
            
          </div>
        </Modal>
        <div className="inputBox">
          <span>项目名称</span>
          <input type="text" className="projectName" disabled={true} value={'xx项目'}/>
        </div>
        <div className="inputBox">
          <span>角色</span>
          <Button type="primary" size="large" onClick={()=> this.setState({characterModal:true})}>创建新角色</Button>
        </div>
        <Transfer
          dataSource={this.state.mockData}
          showSearch
          listStyle={{
            width: 300,
            height: 255,
          }}
          searchPlaceholde="请输入策略名搜索"
          titles={['包含权限（个）', '包含权限（个）']}
          operations={['移除', '添加']}
          filterOption={this.filterOption.bind(this)}
          targetKeys={this.state.targetKeys}
          onChange={this.handleChange.bind(this)}
          render={item => item.title}
        />
      </div>
    )
  }
}
const x = 3;
const y = 2;
const z = 1;
const gData = [];

const generateData = (_level, _preKey, _tns) => {
  const preKey = _preKey || '0';
  const tns = _tns || gData;
  
  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);
class CreateStepThird extends Component{
  constructor(props){
    super(props)
    this.state={
      expandedKeys: ['0-0-0', '0-0-1'],
      autoExpandParent: true,
      checkedKeys: ['0-0-0'],
      selectedKeys: [],
    }
  }
  onExpand(expandedKeys) {
    console.log('onExpand', arguments);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded chilren keys.
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  onCheck(checkedKeys) {
    this.setState({
      checkedKeys,
      selectedKeys: ['0-3', '0-4'],
    });
  }
  onSelect(selectedKeys, info) {
    console.log('onSelect', info);
    this.setState({ selectedKeys });
  }
  render() {
    const TreeNode = Tree.TreeNode;
    
    const loop = data => data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.key} title={item.key} disableCheckbox={item.key === '0-0-0'}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={item.key} />;
    });
    return (
      <div id="projectCreateStepThird">
        <div className="inputBox">
          <span>项目名称</span>
          <input type="text" className="projectName" disabled={true} value={'xx项目'}/>
        </div>
        <div className="clearfix characterWrapper">
          <span className="pull-left">已添加角色</span>
          <div className="pull-left characterBox">
            <ul className="characterListBox pull-left">
              <li>开发123 <Icon type="delete" className="pointer"/></li>
              <li>开发123 <Icon type="delete" className="pointer"/></li>
              <li>开发123 <Icon type="delete" className="pointer"/></li>
              <li>开发123 <Icon type="delete" className="pointer"/></li>
            </ul>
            <div className="inlineBlock pull-left rightBox">
              <div className="authBox inlineBlock">
                <p className="authTitle">开发角色共 <span style={{color:'#59c3f5'}}>14</span> 个权限</p>
                <div className="treeBox">
                  <Tree
                    checkable
                    // onExpand={()=>this.onExpand()} expandedKeys={this.state.expandedKeys}
                    // autoExpandParent={this.state.autoExpandParent}
                    // onCheck={()=>this.onCheck()} checkedKeys={this.state.checkedKeys}
                    // onSelect={()=>this.onSelect()} selectedKeys={this.state.selectedKeys}
                  >
                    {loop(gData)}
                  </Tree>
                </div>
              </div>
              <div className="connectMemberBox inlineBlock">
                <Button type="primary" size="large">关联对象</Button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    )
  }
}
export default ProjectManage;