/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * App constants
 *
 * v0.1 - 2016-09-07
 * @author Zhangpc
 */
import { NODE_ENV_PROD } from '../../configs/constants'
const NODE_ENV = process.env.NODE_ENV

export const API_URL_PREFIX = '/api/v2'
export const DEFAULT_IMAGE_POOL = 'k8s-pool'
export const DEFAULT_REGISTRY = 'default'
export const CREATE_APP_ANNOTATIONS = 'system/schemaPortname'
export const LABEL_APPNAME = 'system/appName'
export const USERNAME_REG_EXP = /^[a-z][-a-z0-9]{1,40}[a-z0-9]$/
export const USERNAME_REG_EXP_OLD = /^[a-z][-a-z0-9_]{1,40}[a-z0-9]$/
export const USERNAME_REG_EXP_NEW = /^[a-z][-a-z0-9]{3,38}[a-z0-9]$/
export const STORAGENAME_REG_EXP = /^[a-z][-a-z0-9_]{2,14}$/
export const EMAIL_REG_EXP = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
export const VERSION_REG_EXP = /\bv\d\.\d\.\d/
export const URL_REG_EXP = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i
export const SEARCH = /(^\s+)|(\s+$)/g
export const REG = /^(?:2)\d{2}$/
export const HOST = 'localhost:8003'
export const AVATAR_HOST = 'https://dn-tenx-avatars.qbox.me/'

// When these actions occurs the page will render to ErrorPage(StatusCode === 404 || StatusCode >= 500).
export const SHOW_ERROR_PAGE_ACTION_TYPES = [
  'APP_DETAIL_FAILURE',
  'CONTAINER_DETAIL_FAILURE',
  'USER_DETAIL_FAILURE',
  'GET_SINGLE_TENX_FLOW_FAILURE',
]
export const LOGIN_EXPIRED_MESSAGE = 'LOGIN_EXPIRED'
export const MY_SPACE = {
  name: "我的个人项目",
  spaceName: "我的个人项目",
  teamName: "我的帐户",
  namespace: "default",
  projectName: 'default',
  teamID: "default",
}
export const MAX_LOGS_NUMBER = 500
export const MIN_PAY_AMOUNT = (NODE_ENV === NODE_ENV_PROD ? 5 : 0.01)
export const MAX_PAY_AMOUNT = 50000
export const PAY_AMOUNT_STEP = (NODE_ENV === NODE_ENV_PROD ? 1 : 0.01)
export const MIN_NOTIFY_AMOUNT = 1
export const EMAIL_HASH = {
  'qq.com': 'http://mail.qq.com',
  'gmail.com': 'http://mail.google.com',
  'sina.com': 'http://mail.sina.com.cn',
  '163.com': 'http://mail.163.com',
  'vip.163.com': 'vip.163.com',
  'vip.sina.com': 'vip.sina.com',
  '126.com': 'http://mail.126.com',
  'yeah.net': 'http://www.yeah.net/',
  'sohu.com': 'http://mail.sohu.com/',
  'tom.com': 'http://mail.tom.com/',
  'sogou.com': 'http://mail.sogou.com/',
  '139.com': 'http://mail.10086.cn/',
  'hotmail.com': 'http://www.hotmail.com',
  'live.com': 'http://login.live.com/',
  'live.cn': 'http://login.live.cn/',
  'live.com.cn': 'http://login.live.com.cn',
  '188.com': 'www.188.com',
  '189.com': 'http://webmail16.189.cn/webmail/',
  '189.cn': 'webmail15.189.cn/webmail',
  'yahoo.com.cn': 'http://mail.cn.yahoo.com/',
  'yahoo.cn': 'http://mail.cn.yahoo.com/',
  'eyou.com': 'http://www.eyou.com/',
  '21cn.com': 'http://mail.21cn.com/',
  '188.com': 'http://www.188.com/',
  'foxmail.coom': 'http://www.foxmail.com',
  'wo.com.cn': 'mail.wo.com.cn/smsmail',
}
export const TIMESTRAP = 1483084989915
export const PAYMENT_REQUIRED_CODE = 402
export const UPGRADE_EDITION_REQUIRED_CODE = 412
export const LICENSE_EXPRIED_CODE = 451
export const DATE_PIRCKER_FORMAT = 'YYYY-MM-DD'
export const ASYNC_VALIDATOR_TIMEOUT = 800
export const LOAD_STATUS_TIMEOUT = 2000
export const UPDATE_INTERVAL = 1000 * 60
export const LOAD_INSTANT_INTERVAL = 10000
export const USER_3RD_ACCOUNT_TYPES = ['wechat']
export const WECHAT_SIGNUP_HASH = '#wechat'
export const RESOURCES_DIY = 'DIY'
export const RESOURCES_MEMORY_MIN = 100
export const RESOURCES_MEMORY_STEP = 100
export const RESOURCES_MEMORY_MAX = 262144 // 256G
export const RESOURCES_CPU_MIN = 0.1
export const RESOURCES_GPU_MIN = 1
export const RESOURCES_CPU_DEFAULT = 0.5
export const RESOURCES_CPU_STEP = 0.1
export const RESOURCES_GPU_STEP = 1
export const RESOURCES_CPU_MAX = 128 // 128 CPU
export const RESOURCES_GPU_MAX = 128 // 128 GPU
export const TENX_PORTAL_VERSION_KEY = 'TENX_PORTAL_VERSION'
export const TENX_PORTAL_VERSION_MAJOR_KEY = 'TENX_PORTAL_VERSION_MAJOR'
export const SESSION_STORAGE_TENX_HIDE_DOT_KEY = 'tenx_hide_dot'
export const SYSTEM_DEFAULT_SCHEDULE = 'tenx_system_default_schedule'
export const LITE = 'lite'
export const MAX_CHARGE = 200000
export const CHARGE_NUMBERS = [ 10, 20, 50, 100 ]
export const NOT_AVAILABLE = 'N/A'
export const BASE_IMAGE_TYPE = [
  {
    key: 1,
    text: '单元测试'
  },
  {
    key: 2,
    text: '代码编译'
  },
  {
    key: 3,
    text: '构建镜像'
  },
  {
    key: 4,
    text: '集成测试'
  },
  {
    key: 101,
    text: '依赖服务'
  },
  {
    key: 6,
    text: '人工审批'
  },
]
export const NEED_BUILD_IMAGE = false
export const PLUGIN_DEFAULT_CONFIG = {
  ['elasticsearch-logging']:{
    cpu: 0.5,
    memory: 500
  },
  ['kube-dns']: {
    cpu: 0.1,
    memory: 179
  },
  prometheus: {
    cpu: 0.1,
    memory: 500
  },
  heapster: {
    cpu: 0.1,
    memory: 200
  }
}
export const SHOW_BILLING = true
export const DEFAULT_SHARE_DIR = '/tenxcloud-tmp-dir'
export const DEACTIVE = 0
export const ACTIVE = 1
export const DEFAULT_ALGORITHM = 'X86'
export const GPU_ALGORITHM = 'GPU'
export const NO_CLASSIFY = 'noclassify'; // 未分类配置组
export const CONFIGMAP_CLASSIFY_CONNECTION = '-configmap-classify-'
export const GPU_KEY = 'nvidia.com/gpu';
export const  AI_MODELAPP_URL = '/ai-deep-learning/ai-model-service';
export const OTHER_IMAGE = 'other/registry'
export const CONNECT_FLAG = '-connect-'
export const KEYCLOAK_TOKEN = 'KEYCLOAK_TOKEN'
export const KEYCLOAK_REFRESHTOKEN = 'KEYCLOAK_REFRESHTOKEN'