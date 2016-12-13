# user portal of Enterprise 2.0


### 后端相关控制逻辑
* 生产、测试环境区分, 修改 configs/index.js，默认为 'dev' 开发环境，生产环境设置 NODE_ENV 为 'production'

  node_env: env.NODE_ENV || 'development', // production or development

* 私有云、公有云区分，修改 configs/index.js, 默认为 'enterprise' 私有云, 不同环境设置 RUNNING_MODE 为 standard 或者 enterprise

  running_mode: env.RUNNING_MODE || 'enterprise', // enterprise or standard


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
# development
npm run dev
# production
npm run pro
```
#### Windows
```bash
# development
npm run win
# production
npm run win-pro
```
### 构建生产环境-production
```bash
# Linux
npm run build # build files
npm run pro
# Windows
npm run win-build # build files
npm run win-pro
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