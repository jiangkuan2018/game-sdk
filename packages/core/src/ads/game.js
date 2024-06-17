window.gamePlatformAdv = class GamePlatformContent {
  constructor() {
    this.lastShowVedioTime = 0
    this.lastShowAfgTime = 0
    this.progressbar = 0
    this.isGamePreloading = false
    this.googleAdsScriptState = false
    this.footbzgameConfig = {}
    this.turnSoundOff = () => { }
    this.turnSoundOn = () => { }
    this.acceptPostMessage()
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
  // 游戏内获取进度条信息
  setLoadingProgress(e) {
    this.progressbar = e
    this.postMessage({
      type: 'loadingProgress',
      progress: this.progressbar,
      state: true
    })
  }

  // 实时通讯向页面传递消息
  postMessage(message) {
    window.parent.postMessage(message, '*');
  }

  // 游戏内接受页面传递的消息
  acceptPostMessage() {
    // var that = this
    if (window.parent.gamePlatformContent && window.parent.gamePlatformContent.isGamePreloading) {
      this.isGamePreloading = window.parent.gamePlatformContent.isGamePreloading
      this.postMessage({
        type: 'loadingProgress',
        progress: this.progressbar,
        state: false
      })
    }
    // window.addEventListener('message', function (event) {
    //   if (event.data.type == 'gamePreloading' && event.data.value) {
    //     that.isGamePreloading = event.data.value
    //   }
    // }, false);
  }

  // 初始化sdk
  initializeAsync(fn = () => { }) {
    var n = this
    return new Promise((resolve, reject) => {
      // 获取SDK相关配置
      if (n.isGamePreloading) {
        // console.log('-------',n.footbzgameConfig)
        // 添加页面级sdk
        n.loadGAFile()
        // 从页面中初始化SDK
        window.parent.gamePlatformContent.gameInitializeAsync(fn).then(e => {
          resolve(e)
        });
        return
      } else {
        // 自研线上配置文件地址: https://sdk.footbzgame.com/js/1.1/footbzgame-config.json
        // cp线上配置文件地址: https://sdk.footbzgame.com/js/1.2/footbzgame-config.json
        fetch('footbzgame-config.json')
          .then(response => {
            return response.json()
          })
          .then(data => {
            n.footbzgameConfig = data
            const footbzgameConfig = data
            // 初始化sdk
            const script = document.createElement('script')
            script.async = true
            script.setAttribute('data-ad-client', footbzgameConfig.afg.attributes.data_ad_client)
            script.setAttribute('data-ad-frequency-hint', footbzgameConfig.afg.attributes.data_ad_frequency_hint)
            script.setAttribute('data-adbreak-test', footbzgameConfig.afg.attributes.data_adbreak_test)
            script.setAttribute('crossorigin', footbzgameConfig.afg.attributes.crossorigin)
            script.setAttribute('data-ad-channel', footbzgameConfig.afg.attributes.data_ad_channel)
            script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${footbzgameConfig.afg.attributes.data_ad_client}`


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
                  fn()
                  resolve(true)
                  setTimeout(() => {
                    n.postMessage({
                      type: 'sdk_initialization',
                      state: true
                    })
                  }, 500)
                }
              })
            }

            // 脚本加载失败
            script.onerror = function () {
              console.error('脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！');
              n.googleAdsScriptState = false
              fn()
              resolve(true)
              setTimeout(() => {
                n.postMessage({
                  type: 'sdk_initialization',
                  state: true
                })
              }, 500)
            };
            document.head.appendChild(script)
          }
          )
          .catch(error => {
            console.error('footbzgame-config 配置文件不存在，请检查配置文件是否添加在游戏根目录', error)
          })

      }
    })
  }

  // 加载GA文件
  loadGAFile() {
    console.log(222)
    const url = new URL(document.referrer)
    const path = url.pathname.split('/')[1]
    const gaUrl = `/${path}/dist/GA4.js`
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', gaUrl);
    xhr.onload = function () {
      console.log(xhr.status)
      if (xhr.status == 404) {
        return
      } else {
        const script = document.createElement('script')
        script.async = true
        script.src = gaUrl
        document.head.appendChild(script)
      }
    };
    xhr.send();
  }


  // 启动游戏
  startGameAsync() {
    return new Promise((resolve, reject) => {
      if (this.isGamePreloading) {
        window.parent.gamePlatformContent.startGameAsync().then((e) => {
          resolve(e)
        });
        return
      } else {
        const footbzgameConfig = this.footbzgameConfig
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
      }
    })
  }

  // 插页广告
  showGameManualInterstitial() {
    return new Promise((resolve, reject) => {
      if (this.isGamePreloading) {
        window.parent.gamePlatformContent.showGameManualInterstitial().then((e) => {
          resolve(e)
        });
        return
      }
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
      if (this.isGamePreloading) {
        window.parent.gamePlatformContent.showReward().then((e) => {
          resolve(e)
        });
        return
      }
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
  // frontPatch() {
  //   adBreak({
  //     type: 'preroll',
  //     adBreakDone: startGame => {
  //     }
  //   })
  // }
}

GamePlatformContent._instance = null
