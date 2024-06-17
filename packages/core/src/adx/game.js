export default class GamePlatformContent {
  constructor() {
    this.lastShowVedioTime = 0
    this.lastShowAfgTime = 0
    this.progressbar = 0
    this.isGamePreloading = false
    this.googleAdsScriptState = false
    this.adxAdvConfig = {}
    this.turnSoundOff = () => { }
    this.turnSoundOn = () => { }
    this.acceptPostMessage()
    this.fn = function () { }
    this.resolve = function () { }
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

  // 获取游戏内配置
  getGameConfig() {
    let n = this
    return new Promise((resolve, reject) => {
      fetch('adx-game-sdk-config.json')
        .then(response => {
          return response.json()
        })
        .then(data => {
          // n.adxAdvConfig = data
          // console.log(n.adxAdvConfig)
          resolve(data)
        })
        .catch(error => {
          console.error('adx-game-sdk-config 配置文件不存在，请检查配置文件是否添加在游戏根目录', error)
          reject(false)
        })
    })
  }



  // 初始化sdk
  initializeAsync(fn = () => { }) {
    var n = this
    return new Promise((resolve, reject) => {
      // 获取SDK相关配置
      if (n.isGamePreloading) {
        console.log('-------', n.adxAdvConfig)
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

        n.getGameConfig().then(data => {
          console.log(data)
          n.adxAdvConfig = data
          const script = document.createElement('script')
          script.async = true
          script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'

          // 脚本已成功加载和执行监听
          script.onload = function () {
            console.log('脚本已成功加载和执行！');
            n.googleAdsScriptState = true
            setTimeout(() => {
              fn()
              resolve(true)
              n.postMessage({
                type: 'sdk_initialization',
                state: true,
                googleAdsScriptState: n.googleAdsScriptState
              })
            }, 500)
          };

          // 脚本加载失败
          script.onerror = function () {
            console.error('脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！');
            n.googleAdsScriptState = false
            setTimeout(() => {
              fn()
              resolve(true)
              n.postMessage({
                type: 'sdk_initialization',
                state: true,
                googleAdsScriptState: n.googleAdsScriptState
              })
            }, 500)
          };
          document.head.appendChild(script)
        })
      }
    })
  }

  // 加载GA文件
  loadGAFile() {
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
        resolve(true)
      }
    })
  }

  // 插页广告
  showGameManualInterstitial() {
    let that = this
    return new Promise((resolve, reject) => {

      const adxAdvConfig = this.adxAdvConfig

      if (this.isGamePreloading) {
        window.parent.gamePlatformContent.showGameManualInterstitial().then((e) => {
          resolve(e)
        });
        return
      }

      if (!this.googleAdsScriptState) {
        console.error('脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！')
        resolve({
          code: 500,
          msg: '脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！'
        })
        return
      }

      if (!adxAdvConfig.afg.adv.config.start_or_not_interstitial) {
        resolve({
          code: 500,
          msg: '未启动插页广告,请更新配置！'
        })
        return
      }
      let curTime = Math.round(new Date().getTime() / 1000)
      console.log(`--插页广告剩余执行时间${curTime - this.lastShowAfgTime}`)
      if (curTime - this.lastShowAfgTime <= adxAdvConfig.afg.adv.config.ad_delay_for_first_interstitial) {
        resolve({
          code: 500,
          msg: '未达到指定时间不能调用'
        })
        return
      }

      window.googletag = window.googletag || {}
      window.googletag.cmd = window.googletag.cmd || []
      // /6355419/Travel/Europe/France/Paris 测试广告
      console.log('---执行插页广告--')
      let gameManualInterstitialSlot = googletag.defineOutOfPageSlot(
        adxAdvConfig.afg.config.interstitial_adv_id ? adxAdvConfig.afg.config.interstitial_adv_id : '/6355419/Travel/Europe/France/Paris',
        googletag.enums.OutOfPageFormat.GAME_MANUAL_INTERSTITIAL)
      googletag.cmd.push(function () {
        if (gameManualInterstitialSlot) {
          console.log('创建')
          gameManualInterstitialSlot.addService(googletag.pubads())
          const slotRenderEnded = event => {
            if (event.isEmpty === true) {
              resolve({
                code: 500,
                msg: '插页广告未准备好！'
              })
              return
            }
            if (event.slot === gameManualInterstitialSlot) {
              console.log('广告已返回并可以展示')
              // 在此处执行展示广告的代码
            } else {
              console.log('广告未返回！')
            }
            googletag.pubads().removeEventListener('slotRenderEnded', slotRenderEnded)
          }
          googletag.pubads().addEventListener('slotRenderEnded', slotRenderEnded)

          const gameManualInterstitialSlotReady = slotReadyEvent => {
            console.log('--- 插页已经准备好--')
            if (gameManualInterstitialSlot === slotReadyEvent.slot) {
              that.lastShowAfgTime = curTime
              console.log(curTime)
              console.log(that.lastShowAfgTime)
              slotReadyEvent.makeGameManualInterstitialVisible()
              googletag.pubads().removeEventListener('gameManualInterstitialSlotReady',
                gameManualInterstitialSlotReady)
            }
          }
          googletag.pubads().addEventListener('gameManualInterstitialSlotReady',
            gameManualInterstitialSlotReady)

          const gameManualInterstitialSlotClosed = e => {
            console.log('关闭')
            resolve({
              code: 200,
              msg: '插页已关闭'
            })
            let destroySlots = googletag.destroySlots([gameManualInterstitialSlot])
            googletag.pubads().removeEventListener('gameManualInterstitialSlotClosed',
              gameManualInterstitialSlotClosed)
            console.log(destroySlots)
          }
          googletag.pubads().addEventListener('gameManualInterstitialSlotClosed',
            gameManualInterstitialSlotClosed)

          if (adxAdvConfig.afg.config.split_open) {
            googletag.pubads().setTargeting(adxAdvConfig.afg.config.page_id_title, adxAdvConfig.cp.config.id)
          }

          googletag.pubads().enableSingleRequest()
          googletag.enableServices()
          googletag.display(gameManualInterstitialSlot)
        }
      })
    })
  }

  //激励广告 
  showReward() {
    let that = this
    return new Promise((resolve, reject) => {
      if (this.isGamePreloading) {
        window.parent.gamePlatformContent.showReward().then((e) => {
          resolve(e)
        });
        return
      }

      const adxAdvConfig = this.adxAdvConfig

      if (!this.googleAdsScriptState) {
        console.error('脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！')
        resolve({
          code: 500,
          msg: '脚本加载失败，请检测浏览器是否开启了广告屏蔽功能！'
        })
        return
      }

      if (!adxAdvConfig.afg.adv.config.start_or_not_rewarded_video) {
        resolve({
          code: 500,
          msg: '未启动激励广告,请更新配置！'
        })
        return
      }
      console.log('激励广告')
      let curTime = Math.round(new Date().getTime() / 1000)
      if (curTime - this.lastShowVedioTime <= adxAdvConfig.afg.adv.config.ad_delay_for_first_rewarded_video) {
        resolve({
          code: 500,
          msg: '未达到指定时间不能调用'
        })
        return
      }

      // 测试广告 /22639388115/rewarded_web_example
      window.googletag = window.googletag || {}
      window.googletag.cmd = window.googletag.cmd || []
      googletag.cmd.push(
        () => {
          const rewardedSlot = googletag.defineOutOfPageSlot(
            adxAdvConfig.afg.config.rewarded_video_adv_id ? adxAdvConfig.afg.config.rewarded_video_adv_id : '/22639388115/rewarded_web_example', googletag.enums.OutOfPageFormat.REWARDED)
            .addService(googletag.pubads())
          if (rewardedSlot) {

            const slotRenderEnded = evt => {
              if (evt.isEmpty) {
                resolve({
                  code: 500,
                  msg: '广告未拉取！'
                })
                return
              }
              googletag.pubads().removeEventListener('slotRenderEnded',
                slotRenderEnded)
            }
            googletag.pubads().addEventListener('slotRenderEnded', slotRenderEnded)

            const rewardedSlotReady = evt => {
              evt.makeRewardedVisible()
              that.lastShowVedioTime = curTime
              googletag.pubads().removeEventListener('rewardedSlotReady',
                rewardedSlotReady)
            }
            googletag.pubads().addEventListener('rewardedSlotReady', rewardedSlotReady)

            const rewardedSlotGranted = evt => {
              console.log('--广告已观看可以发放奖励--')
              that.RewardDistribution = true
              googletag.pubads().removeEventListener('rewardedSlotGranted',
                rewardedSlotGranted)
            }
            googletag.pubads().addEventListener('rewardedSlotGranted', rewardedSlotGranted)

            const rewardedSlotClosed = evt => {
              console.log('--激励广告位已关闭--')
              if (that.RewardDistribution) {
                resolve({
                  code: 200,
                  msg: '广告已观看可以发放奖励'
                })
                that.RewardDistribution = false
              } else {
                resolve({
                  code: 500,
                  msg: '广告未观看完不允许发放奖励'
                })
              }
              let destroySlots = googletag.destroySlots([rewardedSlot]) //销毁插槽
              console.log(destroySlots)
              googletag.pubads().removeEventListener('rewardedSlotClosed',
                rewardedSlotClosed)
            }
            googletag.pubads().addEventListener('rewardedSlotClosed', rewardedSlotClosed)

            // 键值对添加逻辑用于区分单个游戏收入
            if (adxAdvConfig.afg.config.split_open) {
              googletag.pubads().setTargeting(adxAdvConfig.afg.config.page_id_title, adxAdvConfig.cp.config.id)
            }

            googletag.pubads().enableSingleRequest()
            googletag.enableServices()
            googletag.display(rewardedSlot)
          }
        })
    })
  }
}

GamePlatformContent._instance = null
// 挂在sdk
// window['GamePlatformContent'] = new GamePlatformContent()