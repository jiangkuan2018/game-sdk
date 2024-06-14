---
layout: page
sidebar: false
navbar: false
footer: false
---
<nav class="fixed w-full top-0" id="sdk-nav">
  <div class="max-w-[1200px] flex justify-between m-auto py-3 text-white font-bold" style="max-width: 1200px">
    <a class="flex items-center" href="/">
      <img class="h-14" src="/logo.jpg" alt="">
      <span class="text-2xl font-bold">H5出海开发者中心</span>
    </a>
    <ul class="flex gap-4 items-center">
      <li>
        <a href="/guide/unity-guide">入门指南</a>
      </li>
      <li>
        <a href="">资源下载</a>
      </li>
    </ul>
  </div>
</nav>
<section class="p-20"
  style="background-image: url('https://images.pexels.com/photos/2007647/pexels-photo-2007647.jpeg?auto=compress&cs=tinysrgb&w=600');">
 <div class="flex flex-col items-center justify-center text-white text-5xl font-bold gap-10 m-auto" style="max-width: 1200px">
  <h2>
    FUN TI <span class="text-yellow-500">M</span> E
  </h2>
  <h2>
    W<span class="text-green-500">I</span>TH
  </h2>
  <h2>
    FRI<span class="text-blue-500">E</span>NDS
  </h2>
  <h2>
    中国H5游戏出海
  </h2>
  <h2>
    商业化发行变现平台
  </h2>
  <p class="text-xl">为全球游戏打造一站式SDK集成，一键接入Google Ads、Facebook等平台极速触达全球。</p>


  <div class="grid md:grid-cols-4 justify-between gap-10">
    <img class="" src="/images/javascript.webp" alt="">
    <img src="/images/laya.webp" alt="">
    <img src="/images/cocos.webp" alt="">
    <img src="/images/unity.webp" alt="">
  </div>

  <div class="bg-white p-10 py-16 text-black shadow-[rgba(7,_65,_210,_0.1)_0px_9px_30px]  w-full  ">
    <ul class="grid md:grid-cols-4 items-center justify-between gap-10">
      <li class="flex gap-4">
        <img class="w-1/3" src="https://minigamecloud.com/_next/image?url=%2Fimages%2Fbrand-icon-1.png&w=256&q=75">
        <div>
          <h2 class="text-2xl font-bold">5,000 +</h2>
          <p class="text-xl">出海游戏</p>
        </div>
      </li>
      <li class="flex gap-4">
        <img class="w-1/3" src="https://minigamecloud.com/_next/image?url=%2Fimages%2Fbrand-icon-1.png&w=256&q=75">
        <div class="flex-1">
          <h2 class="text-2xl font-bold"> 1,000 +</h2>
          <p class="text-xl">开发者</p>
        </div>
      </li>
      <li class="flex gap-4">
        <img class="w-1/3" src="https://minigamecloud.com/_next/image?url=%2Fimages%2Fbrand-icon-1.png&w=256&q=75">
        <div>
          <h2 class="text-2xl font-bold">2 亿+</h2>
          <p class="text-xl">MAU</p>
        </div>
      </li>
      <li class="flex gap-4">
        <img class="w-1/3" src="https://minigamecloud.com/_next/image?url=%2Fimages%2Fbrand-icon-1.png&w=256&q=75">
        <div>
          <h2 class="text-2xl font-bold">98 %</h2>
          <p class="text-xl"> 用户口碑推荐</p>
        </div>
      </li>
    </ul>

  </div>
  </div>
</section>
<div class="flex justify-center items-center h-screen" style="background-color: #f5f5f5"></div>


<script>

  document.addEventListener('scroll', function (e) {
    const sdk_nav = document.getElementById('sdk-nav')
    sdk_nav.classList.add('card-sdk-nav')
    // 如果回到顶部 删除背景颜色
    if (window.scrollY === 0) {
      sdk_nav.classList.remove('card-sdk-nav')
    }
  })

</script>

<style>
  .card-sdk-nav {
    background: rgba(1, 1, 1, .7);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
  .VPLocalNav {
    display: none;
  }
</style>
