Sora
===

Sora (そら) 是一个基于Web的文件 / 资源管理系统. 基于node.js + mongodb.

Sora 项目目前还处于很初步的原型阶段. 这个项目的初衷和开发目标是用来管理硬盘里大量 ACG 方面的资源, 如动画 BDRip, 同人志压缩包, 无损音乐, 轻小说等; 通过自动 TAG 系统提供方便的筛选和查找文件功能; 
并且具有 Wiki 功能, 可以存储作品相关信息和资料; 提供分享和公开发布功能.


Install
------

1. 安装 node.js 和 mongodb.
2. 获取 Sora 代码: ```git clone https://github.com/sagan/sora.git && cd sora```
3. 安装依赖: ```npm install```
4. 从示例创建并编辑配置文件 ```cp config-sample.js config.js && vim config.js```. 默认的配置文件是js文件,
可以在其中执行任意代码. 你也可以使用json格式的配置文件(命名为config.json即可)
5. 运行:  ```node app.js```


Demo
------

[Demo](https://sakura-paris.org/)



