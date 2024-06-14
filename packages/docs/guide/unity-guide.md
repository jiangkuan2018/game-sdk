---
outline: deep
---
# footbzgame Unity游戏SDK对接流程

## 游戏内部

### Unity提供了2个默认模板（`**Default**`和`**Minimal**`），都在Unity的安装目录下

> _**D:\unity2018.4.31\Unity\Editor\Data\PlaybackEngines\WebGLSupport\BuildTools\WebGLTemplates**_

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/J9LnWNaQ3jzelvDe/img/b1a3e3ab-69ac-4262-81af-514097e224dc.png)

### 1、SDK使用的是Default模板，因为这个模板的功能更完整。将 footbzgame-config.json 文件拷贝到与index.html页面的根目录的同级目录下面

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/J9LnWNaQ3jzelvDe/img/cf8bc6a0-2911-41ac-9db2-10bc642b80db.png)

### 2、index.html 文件

#### `<head>`在中载入SDK文件
```html
    <script src="https://sdk.footbzgame.com/js/1.2/footbzgame_adv_sdk.js"></script>
```
在`**index.html**`中封装unity启动方法`**startUnity**`，在进度条位置调用进度显示接口`**window.gamePlatformAdv****.setLoadingProgress(100 * progress);**`，用于后续和SDK进行交互，最后再启动SDK: `**window.gamePlatformAdv****.startGameAsync()**`

#### 案例：
```js
    function startUnity(){
      var script = document.createElement("script");
      script.onload = () => {
        createUnityInstance(canvas, config, (progress) => {
          progressBarFull.style.width = 100 * progress + "%";
          window.gamePlatformAdv.setLoadingProgress(100 * progress);
        }).then((unityInstance) => {
          loadingBar.style.display = "none";
          fullscreenButton.onclick = () => {
            unityInstance.SetFullscreen(1);              
          };
    	  // 延迟2秒，是为了跳过logo动画
    	  setTimeout(() => {
    		window.gamePlatformAdv.startGameAsync();
    	  }, 2000);
        }).catch((message) => {
          console.error(message);
        });
      };
      document.body.appendChild(script);
    }
```
### 3、调用初始化`window.gamePlatformAdv.initializeAsync`，启动成功后调用`startUnity`。

#### 案例：
```js
    window.gamePlatformAdv.initializeAsync()
      .then(function () {
        console.info("window initializeAsync..");
    	// 启动游戏
    	startUnity();
      })
      .catch(function (e) {
    	console.error("window-sdk init error: ", e); 
      })
```
### 4. Unity和SDK的交互

Unity提供了.jslib扩展名文件来进行Unity和JavaScript的交互。可以看下官方链接：[https://docs.unity3d.com/cn/2018.4/Manual/webgl-interactingwithbrowserscripting.html](https://docs.unity3d.com/cn/2018.4/Manual/webgl-interactingwithbrowserscripting.html)

**js调用Unity:**

这里假设 .jslib 文件名为`JS.jslib,`将`JS.jslib` 文件放置在 Assets 文件夹中的“Plugins”子文件夹下。将广告接口调用添加到此文件里面，并通过`unityInstance.SendMessage`来从javaScript层发消息给Unity层，假设场景中挂载广告代码的对象名称为`ScriptControl`。

#### 案例：
```js
    mergeInto(LibraryManager.library, {
      // 播放插屏
      showGameManualInterstitial: function () {
        if (typeof window.gamePlatformAdv === "undefined") {
          console.error("footbzGameAds is undefined");
          return;
        }
    
        window.gamePlatformAdv.showGameManualInterstitial()
          .then(isSuccess => {
            if (isSuccess.code == 200) {
              // 插页广告关闭后的成功回调，在此执行逻辑
              // 播放成功，调用showInterstitialCallback，返回失败结果1
              unityInstance.SendMessage("ScriptControl", "showInterstitialCallback", 1);
            } else {
              // 播放失败，调用showInterstitialCallback，返回失败结果0
              unityInstance.SendMessage("ScriptControl", "showInterstitialCallback", 0);
            }
    
          }).catch(function (e) {
            // 播放成功，调用showInterstitialCallback，返回失败结果0
            unityInstance.SendMessage("ScriptControl", "showInterstitialCallback", 0);
          });
      },
    
      // 播放激励
      showReward: function () {
        if (typeof window.gamePlatformAdv === "undefined") {
          console.error("footbzGameAds is undefined");
          return;
        }
        window.gamePlatformAdv.showReward()
          .then(isSuccess => {
            if (isSuccess.code == 200) {
              // 奖励看完关闭后的成功回调，在此执行奖励逻辑
              // 播放成功，调用showReWardedCallback，传入参数成功结果1
              unityInstance.SendMessage("ScriptControl", "showReWardedCallback", 1);
            } else {
              // 广告加载失败回调，未看完关闭广告回调
              // 播放成功，调用showReWardedCallback，传入参数失败结果0
              unityInstance.SendMessage("ScriptControl", "showReWardedCallback", 0);
            }
          }).catch(function (e) {
    
            // 播放成功，调用showReWardedCallback，传入参数失败结果0
            unityInstance.SendMessage("ScriptControl", "showReWardedCallback", 0);
          });
      }
    });
```
### 5、Unity调用js
```c#
    public class AdsControl : MonoBehaviour {
      // 声明导入外部方法
      [DllImport("__Internal")]
      private static extern void showGameManualInterstitial();
    
      [DllImport("__Internal")]
      private static extern void showReward();
    
      // 激励广告回调，处理发放奖励
      public void showReWardedCallback(int isSuccess) {
        Debug.Log("show reward: " + (isSuccess == 1 ? "success" : "failed"));
      }
    
      // 插屏广告回调，由于不用发放奖励可不用处理 
      public void showInterstitialCallback(int isSuccess) {
        Debug.Log("show Interstitial: " + (isSuccess == 1 ? "success" : "failed"));
      }
    
      // 播放插屏，调用JS.jslib文件中声明的 showGameManualInterstitial
      public void showGameManualInterstitialAd()
      {
        showGameManualInterstitial();
      }
    
      // 播放激励，调用JS.jslib文件中声明的 showReward
      public void showRewardAd()
      {
        showReward();
      }
    }
```
### 6. WebGL打包

需要`**开启解压回退**`： 默认情况下是关闭的，开启后会导致加载器大小增大和构建文件加载方案的效率降低，会增加游戏加载的时间。

![image](https://alidocs.oss-cn-zhangjiakou.aliyuncs.com/res/J9LnWNaQ3jzelvDe/img/b98e55b2-da02-43b8-9927-66551a93456b.png)

### 7、接口

### 广告相关接口

广告功能使用**footbzGameSDK**提供的广告接口(`**window.gamePlatformAdv**`)进行接入

**footbzGameSDK**主要有2个接口：

### `window.gamePlatformAdv.showReward()`，此方法是异步

**作用**：展示激励广告

**实例**：
```js
    window.gamePlatformAdv.showReward().then(isSuccess => {
        if (isSuccess.code == 200) {
            // 奖励看完关闭后的成功回调，在此执行奖励逻辑
        } else {
            // 广告加载失败回调，未看完关闭广告回调
        }
    })
```
**注意：**由于插屏广告默认第一次播放需要30秒后，才能播放，后面播放每次时间间隔40秒，如果cp测试的时候觉得时间太长，可以把`**footbzgame-config.json**`里`**data_ad_frequency_hint**`和`**ad_delay_for_first_interstitial**`字段改小。

###  `window.gamePlatformAdv.showGameManualInterstitial()`，此方法是异步

**作用：**展示激励广告

**示例：**

```js
    window.gamePlatformAdv.showGameManualInterstitial().then(isSuccess => {
        if (isSuccess.code == 200) {
            // 插页广告关闭后的成功回调，在此执行逻辑
        } else {
            // 广告加载失败回调
        }
    })
```
