# user portal of Enterprise 2.0
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
> 注意：如果在开发环境出现 404 错误，请修改 node_modules/webpack-dev-middleware/middleware.js 文件(大约218行)，修改如下：
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