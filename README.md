# user portal of Enterprise 2.0

### 环境变量说明

变量名 | 默认值 | 说明 | 可选值
---|---|---|---
NODE_ENV | `'development'` | Node 运行模式 | `'development'`, `'staging'`, `'production'`
RUNNING_MODE | `'enterprise'` | user-portal 运行模式（私有云、公有云） | `'enterprise'`, `'standard'`
DASHBOARD_PROTOCOL | `'http'` | user-portal 协议 | `'http'`, `'https'`
DASHBOARD_HOST | `'0.0.0.0'` | user-portal 监听地址
DASHBOARD_PORT | `'8003'` | user-portal 监听端口
USERPORTAL_URL | `'https://portal.tenxcloud.com'` | user-portal 访问地址，用于邮件发送等，该环境变量只在生产环境中生效
TENX_API_PROTOCOL | `'http'` | Golang API 内网协议 | `'http'`, `'https'`
TENX_API_HOST | `'192.168.1.103:48000'` | Golang API 内网地址
TENX_API_EXTERNAL_PROTOCOL | `'https'` | Golang API 外网协议 | `'http'`, `'https'`
TENX_API_EXTERNAL_HOST | `'apiv2.tenxcloud.com'` | Golang API 外网地址
NOREPLY_EMAIL_PWD | `undefined` | noreply@tenxcloud.com 邮箱密码 | *只适用于公有云*
SENDCLOUD_API_USER | `undefined` | SendCloud 邮件服务商 触发邮件 api_user
SENDCLOUD_API_KEY | `undefined` | SendCloud 邮件服务商 api_key
SENDCLOUD_FROM | `undefined` | SendCloud 邮件服务商 发件地址
SENDCLOUD_FROM_NAME | `undefined` | SendCloud 邮件服务商 发件人
SENDCLOUD_API_USER_BATCH | `undefined` | SendCloud 邮件服务商 批量邮件 api_user
USERPORTAL_REDIS_SESSION_STORE | `'true'` | 是否将 `session` 存储在 redis 中，依赖于 redis 的配置 | `'true'`, `'false'`
REDIS_HOST | `'192.168.1.87'` | redis 地址
REDIS_PORT | `'6380'` | redis 端口
REDIS_PWD | `''` | redis 密码
DEVOPS_PROTOCOL | `'http'` | DevOps 服务的内网协议 | `'http'`, `'https'`
DEVOPS_HOST | `'192.168.1.103:38090'` | DevOps 服务的内网地址 | `'http'`, `'https'`
DEVOPS_EXTERNAL_PROTOCOL | `'https'` | DevOps 服务的外网协议 | `'http'`, `'https'`
DEVOPS_EXTERNAL_HOST | `'cicdv2.tenxcloud.com'` | DevOps 服务的外网地址
USERPORTAL_IHUYI_ACCOUNT | `undefined` | 互亿无线短信服务账号 | *只适用于公有云*
USERPORTAL_IHUYI_APIKEY | `undefined` | 互亿无线短信服务 API key | *只适用于公有云*
**注：外网协议及端口用于 user-portal 浏览器直连 API**

### 后端相关控制逻辑
* 生产、测试环境区分, 修改 `configs/index.js`，默认为 `dev` 开发环境，生产环境设置 `NODE_ENV` 为 `production`
```javascript
  node_env: env.NODE_ENV || 'development', // production or development
```
* 私有云、公有云区分，修改 `configs/index.js`, 默认为 `enterprise` 私有云, 不同环境设置` RUNNING_MODE` 为 `standard` 或者 `enterprise`
```javascript
  running_mode: env.RUNNING_MODE || 'enterprise', // enterprise or standard
```

### 前端开发私有云、公有云临时切换
修改 `configs/model.js`，例如切换为公有云，在最后一行加入以下代码：
```javascript
// For development, change mode here
module.exports = require('./model.standard') // './model.enterprise' or './model.standard'
```
### 前端私有云、公有云判断
```javascript
const standard = require('./configs/constants').STANDARD_MODE
const mode = require('./configs/model').mode
if (mode === standard) {
  // standard mode
} else {
  // enterprise mode
}
```

```
# 项目结构
├─configs
├─controllers
├─database
├─services
├─src
│  ├─actions
│  ├─common
│  ├─components
│  ├─constants
│  ├─containers
│  ├─entry
│  ├─middleware
│  ├─reducers
│  └─store
└─static
    ├─img
    ├─js
    │  └─lib
    └─style
```
### 安装依赖
```
npm install cnpm -g --registry=https://registry.npm.taobao.org
cnpm install
```
### Fork下来之后同步代码
```
git remote add upstream http://gitlab.tenxcloud.com/enterprise-2.0/user-portal.git
git fetch upstream
git merge upstream/dev-branch
git commit -m "merge from dev-branch"
git push -u origin dev-branch
```
### 运行开发环境-development
#### Linux
```bash
# development(enterprise mode)
npm run dev
# development(standard mode)
npm run dev-std
```
#### Windows
```bash
# development(enterprise mode)
npm run win
# development(standard mode)
npm run win-std
```
### 构建生产环境-production
#### Linux
```bash
# build files(enterprise mode)
npm run build
# build files(standard mode)
npm run build-std
```
#### Windows
```bash
# build files(enterprise mode)
npm run win-build
# build files(standard mode)
npm run win-build-std
```
### 运行生产环境-production
> 注意：运行生产环境前需要先构建生产环境，参考 **构建生产环境-production**

#### Linux
```bash
# production(enterprise mode)
npm run pro
# production(standard mode)
npm run pro-std
```
#### Windows
```bash
# production(enterprise mode)
npm run win-pro
# production(standard mode)
npm run win-pro-std
```

> 注意：如果在开发环境出现 404 错误，请修改 node_modules/webpack-dev-middleware/middleware.js 文件(大约258行)，修改如下：
```javascript
if(options.headers) {
    for(var name in options.headers) {
        res.setHeader(name, options.headers[name]);
    }
}
res.statusCode = 200; // just add this line to set statusCode=200 !!
if (res.send) res.send(content);
else res.end(content);
```