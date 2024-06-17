window.gamePlatformContent = new class GamePlatformContent {
  constructor() {
    this.lastShowVedioTime = 0
    this.lastShowAfgTime = 0
    this.isGamePreloading = true
    this.footbzgameConfig = {}
    this.googleAdsScriptState = false
    this.fn = function () { }
    this.resolve = function () { }
    this.adBreak = function () { }
    this.adConfig = function () { }
  }
  static getInstance() {
    if (!this._instance) {
      this._instance = new GamePlatformContent()
    }
    return this._instance
  }
  // 声音开启
  turnSoundOff() {
    const iframeWindow = document.getElementById('gameIframe').contentWindow
    iframeWindow.gamePlatformAdv.turnSoundOff()
  }
  // 声音关闭
  turnSoundOn() {
    const iframeWindow = document.getElementById('gameIframe').contentWindow
    iframeWindow.gamePlatformAdv.turnSoundOn()
  }

  // 初始化sdk
  initializeAsync() {
    var n = this
    return new Promise((resolve, reject) => {
      document.addEventListener('DOMContentLoaded', function () {
        let iframe = document.getElementById('gameIframe')
        let iframeSrc = iframe.src
        let configSrc = iframeSrc.replace('index.html', 'footbzgame-config.json')

        // if (n.checkFileExists(configSrc)) {
        //   configSrc = 'https://sdk.footbzgame.com/js/1.2/footbzgame-config.json'
        //   console.error('footbzgame-config 配置文件不存在，请检查配置文件是否添加在游戏根目录')
        // }

        // 自研线上配置文件地址: https://sdk.footbzgame.com/js/1.1/footbzgame-config.json
        // cp线上配置文件地址: https://sdk.footbzgame.com/js/1.2/footbzgame-config.json
        fetch(configSrc)
          .then(response => {
            return response.json()
          })
          .then(data => {
            const footbzgameConfig = data
            n.footbzgameConfig = footbzgameConfig
            const script = document.createElement('script')
            script.async = true
            script.setAttribute('data-ad-client', footbzgameConfig.afg.attributes.data_ad_client)
            script.setAttribute('data-ad-frequency-hint', footbzgameConfig.afg.attributes.data_ad_frequency_hint)
            script.setAttribute('data-adbreak-test', footbzgameConfig.afg.attributes.data_adbreak_test)
            script.setAttribute('crossorigin', footbzgameConfig.afg.attributes.crossorigin)
            script.setAttribute('data-ad-channel', footbzgameConfig.afg.attributes.data_ad_channel)
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${footbzgameConfig.afg.attributes.data_ad_client}`
            
            let iframeWindow = iframe.contentWindow

            // 脚本已成功加载和执行监听
            script.onload = function () {
              console.log('脚本已成功加载和执行！');
              n.googleAdsScriptState = true
              window.adsbygoogle = window.adsbygoogle || [];
              n.adBreak = function (o) {
                adsbygoogle.push(o);
              }
              n.adConfig = function (o) {
                adsbygoogle.push(o);
              }
              n.adConfig({
                preloadAdBreaks: footbzgameConfig.afg.config.preloadAdBreaks,
                sound: footbzgameConfig.afg.config.sound,
                onReady: () => {
                  setTimeout(() => {
                    iframeWindow.gamePlatformAdv.postMessage({
                      type: 'sdk_initialization',
                      state: true,
                      googleAdsScriptState: n.googleAdsScriptState
                    })
                  }, 500)
                  resolve(true)
                }
              })
            };

            // 脚本加载失败
            script.onerror = function () {
              console.error('脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！');
              n.googleAdsScriptState = false
              setTimeout(() => {
                iframeWindow.gamePlatformAdv.postMessage({
                  type: 'sdk_initialization',
                  state: true,
                  googleAdsScriptState: n.googleAdsScriptState
                })
              }, 500)
              resolve(true)
            };
            document.head.appendChild(script)
          })
          .catch(error => {
            console.error('footbzgame-config 配置文件不存在，请检查配置文件是否添加在游戏根目录', error)
            reject(false)
          })
      });
    })
  }


  // 游戏初始化
  gameInitializeAsync(fn) {
    let n = this
    return new Promise((resolve, reject) => {
      n.fn = fn
      n.resolve = resolve
    })
  }



  // 点击play按钮
  startGame() {
    this.fn()
    this.resolve(true)
  }

  // 启动游戏
  startGameAsync() {
    return new Promise((resolve, reject) => {
      this.frontPatch()
      resolve(true)
    })
  }


  // 插页广告
  showGameManualInterstitial() {
    return new Promise((resolve, reject) => {
      var that = this
      const footbzgameConfig = this.footbzgameConfig

      if (!this.googleAdsScriptState) {
        console.error('脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！')
        resolve({
          code: 500,
          msg: '脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！'
        })
        return
      }

      if (!footbzgameConfig.afg.adv.config.start_or_not_interstitial) {
        resolve({
          code: 500,
          msg: '未启动插页广告,请更新配置！'
        })
        return
      }


      let curTime = Math.round(new Date().getTime() / 1000)
      console.log(`--插页广告剩余执行时间${curTime - this.lastShowAfgTime}`)
      if (curTime - this.lastShowAfgTime <= footbzgameConfig.afg.adv.config.ad_delay_for_first_interstitial) {
        resolve({
          code: 500,
          msg: '未达到指定时间不能调用'
        })
        return
      }
      this.adBreak({
        type: 'start',
        name: 'game_interstitial',
        beforeAd: () => {
          this.turnSoundOff()
        },
        afterAd: () => {
          that.lastShowAfgTime = curTime
          resolve({
            code: 200,
            msg: '插页已关闭'
          })
          this.turnSoundOn()
        },
        adBreakDone: placementInfo => {
          console.log(placementInfo.breakStatus)
          if (placementInfo.breakStatus != 'viewed') {
            resolve({
              code: 500,
              msg: '广告发生错误,未能正常展示！'
            })
          }
        }
      })
    })
  }

  //激励广告 
  showReward() {
    return new Promise((resolve, reject) => {
      var that = this
      const footbzgameConfig = this.footbzgameConfig

      if (!this.googleAdsScriptState) {
        console.error('脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！')
        resolve({
          code: 500,
          msg: '脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！'
        })
        return
      }

      if (!footbzgameConfig.afg.adv.config.start_or_not_rewarded_video) {
        resolve({
          code: 500,
          msg: '未启动激励广告,请更新配置！'
        })
        return
      }
      console.log('激励广告')
      let curTime = Math.round(new Date().getTime() / 1000)
      if (curTime - this.lastShowVedioTime <= footbzgameConfig.afg.adv.config.ad_delay_for_first_rewarded_video) {
        resolve({
          code: 500,
          msg: '未达到指定时间不能调用'
        })
        return
      }
      this.adBreak({
        type: 'reward',
        name: 'game_reward',
        beforeAd: () => {
          this.turnSoundOff()
        },
        afterAd: () => {
          this.turnSoundOn()
        },
        beforeReward: showAdFn => {
          showAdFn()
        },
        adViewed: () => {

        },
        adDismissed: () => {

        },
        adBreakDone: placementInfo => {
          console.log(placementInfo.breakStatus)
          if (placementInfo.breakStatus == 'dismissed') {
            resolve({
              code: 500,
              msg: '广告未观看完不允许发放奖励'
            })
            that.lastShowVedioTime = curTime
          } else if (placementInfo.breakStatus == 'viewed') {
            resolve({
              code: 200,
              msg: '广告已观看可以发放奖励'
            })
            that.lastShowVedioTime = curTime
          } else {
            resolve({
              code: 500,
              msg: '广告发生错误,未能正常展示！'
            })
          }
        }
      })
    })
  }

  // 前贴片
  frontPatch() {
    const footbzgameConfig = this.footbzgameConfig
    return new Promise((resolve, reject) => {
      if (!this.googleAdsScriptState) {
        console.error('脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！')
        resolve({
          code: 500,
          msg: '脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！'
        })
        return
      }
      if (footbzgameConfig.afg.config.preroll) {
        this.adBreak({
          type: 'preroll',
          adBreakDone: placementInfo => {
            if (placementInfo.breakStatus != 'viewed') {
              resolve({
                code: 500,
                msg: '广告发生错误,未能正常展示！'
              })
            } else {
              resolve({
                code: 200,
                msg: '前贴片已关闭！'
              })
            }
          }
        })
      } else {
        resolve({
          code: 500,
          msg: '前贴片广告处于关闭状态请检查配置文件参数配置！'
        })
      }
    })
  }
}

GamePlatformContent._instance = null
// 挂在sdk
// window['GamePlatformContent'] = new GamePlatformContent()
// window.GamePlatformContent.initializeAsync()