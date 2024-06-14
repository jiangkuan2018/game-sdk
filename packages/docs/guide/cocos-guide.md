---
outline: deep
---
# footbzgame cocos游戏SDK对接流程

## 游戏内部

### 1、将 footbzgame-config.json 文件拷贝到项目的根目录

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/a2QnVJ2eDGNzn4XB/img/19c96f85-4bc6-48eb-946d-5ca45e3980a7.png)

### 2、index.html 文件

#### `<head>`在中载入SDK文件
```html
    <script src="https://sdk.footbzgame.com/js/1.2/footbzgame_adv_sdk.js"></script>
````
在`**index.html**`添加SDK初始化方法`**window.gamePlatformAdv.initializeAsync()**`，此方法是异步的，需要执行完才能接着调用引擎入口`**window.boot()**`方法，

#### 关键：
```js
    window.gamePlatformAdv.initializeAsync(() => {
        //传入你的启动代码
    })
```
#### 案例：
```js
    loadScript(debug ? 'cocos2d-js.js' : 'cocos2d-js-min.a1a7e.js', function () {
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
          loadScript(debug ? 'physics.js' : 'physics-min.ce5ee.js', function () {
            window.gamePlatformAdv.initializeAsync(() => {
              window.boot()
            })
          })
        }
        else {
          window.gamePlatformAdv.initializeAsync(() => {
            window.boot()
          })
        }
      })
```
### 3、在`main.js`中添加SDK启动方法`window.gamePlatformAdv.startGameAsync()`，此方法也是异步，需要在执行完后才进入第一个场景

#### 关键
```js
     window.gamePlatformAdv.startGameAsync().then(function (
        // 执行启动逻辑
    ) {})
```
#### 案例：
```js
    bundle.loadScene(launchScene, null, onProgress,
          function (err, scene) {
            if (!err) {
              window.gamePlatformAdv.startGameAsync()
                .then(function () {
                  cc.director.runSceneImmediate(scene)
                  if (cc.sys.isBrowser) {
                    // show canvas
                    var canvas = document.getElementById('GameCanvas')
                    canvas.style.visibility = ''
                    var div = document.getElementById('GameDiv')
                    if (div) {
                      div.style.backgroundImage = ''
                    }
                    console.log('Success to load scene: ' + launchScene)
                  }
                }).catch(function (e) {});
            }
          }
        )
```
### 4.添加游戏加载进度`**window.gamePlatformAdv.setLoadingProgress(percent);**`, 有些引擎引擎没有在入口提供进度信息，这步可以省略。

#### 案例：
```js
    function setLoadingDisplay() {
        // Loading splash scene
        var splash = document.getElementById('splash')
        var progressBar = splash.querySelector('.progress-bar span')
        onProgress = function (finish, total) {
          var percent = 100 * finish / total
          if (progressBar) {
            progressBar.style.width = percent.toFixed(2) + '%'
          }
          console.log(percent)
          window.gamePlatformAdv.setLoadingProgress(percent)
        }
        splash.style.display = 'block'
        progressBar.style.width = '0%'
    
        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
          splash.style.display = 'none'
        })
      }
```
### 5、添加声音控制的方法，由SDK统一管理激励和插屏广告播放期间的游戏音效：
```js
    window.gamePlatformAdv.turnSoundOff = () => {
        // todo 处理关闭声音
    }
    
    window.gamePlatformAdv.turnSoundOn = () => {
        // todo 处理恢复声音
    }
```
### 6、激励视频广告

### `window.gamePlatformAdv.showReward()`，此方法也是异步
```js
    window.gamePlatformAdv.showReward().then(isSuccess => {
        if (isSuccess.code == 200) {
            // 奖励看完关闭后的成功回调，在此执行奖励逻辑
        } else {
            // 广告加载失败回调，未看完关闭广告回调
        }
    })
```
### 7、插屏广告

###  `window.gamePlatformAdv.showGameManualInterstitial()`，此方法也是异步
```js
    window.gamePlatformAdv.showGameManualInterstitial().then(isSuccess => {
        if (isSuccess.code == 200) {
            // 插页广告关闭后的成功回调，在此执行逻辑
        } else {
            // 广告加载失败回调
        }
    })
```
