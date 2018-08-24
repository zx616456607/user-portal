import {defineIntlMessages} from '../../../common/tools'

export const mapData = {
  prefix: 'AppModule.AppServiceDetailIntl',
  data: {
    redeploy: '重新部署',
    loginTerminal: '登录终端',
    deleteOperation: '删除操作',
    deleteServiceinfo: '删除服务，该服务下的自动弹性伸缩策略也会被删除，确定要删除服务{serviceName}吗?',
    serviceDetailPage: '服务详情页',
    status: '状态',
    address: '地址',
    containerObject: '容器实例',
    serviceAbout: '服务相关',
    basicsMessage: '基础信息',
    serviceMeshSwitch: '服务治理开关',
    assistSet: '辅助设置',
    configGroup: '配置组',
    fireWall: '安全组(防火墙)',
    unsupportbindDomain: '当前代理不支持绑定域名',
    visitStyle: '访问方式',
    port: '端口',
    currentProxynosupportHTTPS: '当前代理不支持设置 HTTPS',
    setHTTPS: '设置 HTTPS',
    livenessprobe: '高可用',
    monitor: '监控',
    strategy: '告警策略',
    autoScale: '自动伸缩',
    logs: '日志',
    events: '事件',
    rentalInfo: '租赁信息',
    serverTag: '服务标签',
  }
}

export default defineIntlMessages(mapData)