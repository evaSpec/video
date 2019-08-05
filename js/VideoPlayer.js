//图标对象（用unicode引用的方式使用图标）
const icons = {
  play: '&#xe619;',
  pause: '&#xe618;',
  fullscreen: '&#xe7a6;',
  sound: '&#xe662;',
  mute: '&#xe606;',
  bigPlay: '&#xe607;',
  bigPause: '&#xe608;',
};

class VideoPlayer {
  //初始化
  constructor(playerElement) {
    // 传进来的player
    this.$el = playerElement;
    //拖拽进度条时，初始化一个布尔值禁止鼠标移动元素
    this.moving = false;
    //video标签元素
    this.$audio = document.querySelector(playerElement);
    //video标签的父元素：视频容器
    this.$videoContainer = document.querySelector('.video-container');
    //视频自动播放
    this.$audio.autoplay = true;
    //视频自动循环
    this.$audio.loop = true;
    //初始化音量为0.5
    this.$audio.volume = 0.5;
    //控制条div class='controller'
    this.$controller = document.querySelector('.video-container .controller');
    //视频开关图标
    this.$playButton = this.$controller.querySelector('.play-button');
    //视频进度条
    this.$progress = this.$controller.querySelector('.progress-bar');
    //音量进度条
    this.$soundBar = this.$controller.querySelector('.sound-bar');
    //音量图标
    this.$soundButton = this.$controller.querySelector('.sound-button');
    //全屏图标
    this.$fullscreenButton = this.$controller.querySelector('.fullscreen');
    //视频进度条圆点
    this.$pin = this.$progress.querySelector('.progress-bar__circle');
    //音量进度条圆点
    this.$sound = this.$soundBar.querySelector('.sound-bar__circle');
    //视频进度条和遮罩层父元素：盒子
    this.$progressBox = this.$controller.querySelector('.progress-box .progress-box__shadow');
    //音量进度条和遮罩层父元素：盒子
    this.$soundBox = this.$controller.querySelector('.sound-box .sound-box__shadow');
    //视频中间的大图标
    this.$controlBtn = document.querySelector('.control-btn');
    //视频进度条
    this.videoBar = this.$progress.querySelector('.progress-bar__current');
    //声音进度条长度
    this.voiceBarWidth = parseFloat(window.getComputedStyle(this.$soundBar).width);
    //声音进度条
    this.Voicebar = this.$soundBar.querySelector('.sound-bar__current');
    //初始化进度条长度状态变量
    this.statusClock = "";
    //初始化预保存的音量状态变量
    this.previousVol = 0;
    //内部构造器调用完成视频各种功能的方法
    this.bindEvent();
  }

  //静态方法：计算视频时长
  static formatTime(time) {
    let min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);
    sec = sec > 10 ? "" + sec : "0" + sec;
    return "0" + min + ":" + sec;
  }

  //方法：播放视频并更换图标
  playVideoAndChangeIcon(element, iconPause, iconPlay) {
    const icon = element.querySelector('.iconfont');
    //如果播放按钮加上了play的class
    if (icon.classList.contains('play')) {
      //播放按钮变成停止按钮，播放视频
      icon.classList.remove('play');
      icon.innerHTML = iconPause;
      this.$audio.play();
    } else {
      //否则按钮变成播放按钮，停止播放视频
      icon.classList.add('play');
      icon.innerHTML = iconPlay;
      this.$audio.pause();
    }
  }

  //方法：声音和视频的mousedown事件
  myDown(elem) {
    //可以移动元素
    this.moving = true;
    elem.style.display = 'block';
  }

  //方法：声音和视频的mouseup事件
  myUp(elem) {
    //禁止移动元素
    this.moving = false;
    elem.style.display = 'none';
  }

  //方法：播放视频-----外部调用的方法
  play(url) {
    //因为关闭视频的时候$audio被定义为null，所以播放时要重新定义$audio
    this.$audio = document.querySelector(this.$el);
    this.$audio.src = url;
  }

  //方法：关闭视频-----外部调用的方法
  Close() {
    this.$audio = null;
    //关闭视频的同时清除更新定时器
    clearInterval(this.statusClock);
  }

  //方法：结束播放-----this.bindEvent调用的方法
  pause() {
    this.$audio.pause();
  }

  //视频状态的更新----this.bindEvent调用的方法
  updateStatus() {
    //current-time上写视频播放的当前时间
    this.$controller.querySelector(".current-time").innerHTML =VideoPlayer.formatTime(this.$audio.currentTime);
    //进度条长度
    let percent = this.$audio.currentTime / this.$audio.duration;
    this.$controller.querySelector(".progress-bar__current").style.width = percent * 100 + '%';
    this.$controller.querySelector(".progress-bar__circle").style.left = percent * 100 + '%';
  }
  //内部构造器调用的完成视频各种功能的方法
  bindEvent() {
    const _this = this;
    //禁止右键功能
    this.$audio.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    //点击播放按钮播放视频
    this.$playButton.addEventListener('click', () => {
      this.playVideoAndChangeIcon(this.$playButton, icons.pause, icons.play);
      const icon = this.$controlBtn.querySelector('.iconfont');
      if(this.$audio.paused){
        icon.classList.add('play');
        icon.innerHTML = icons.bigPlay;
        this.$controlBtn.style.display = 'block';
      }else{
        icon.classList.remove('play');
        icon.innerHTML = icons.bigPause;
        this.$controlBtn.style.display = 'none';
      }
    });
    //点击音量按钮,静音
    this.$soundButton.addEventListener('click', () => {
      const icon = this.$soundButton.querySelector('.iconfont');
      //如果此时的icon为音量按钮
      if (icon.classList.contains('voice')) {
        icon.classList.remove('voice');
        //换图标
        icon.innerHTML = icons.sound;
        //恢复当前视频的音量为之前保存的静音前的音量状态
        this.$audio.volume = this.previousVol;
        //回复变量previousVol为初始状态
        this.previousVol = 0;
        //进度条长度
        //如果音量为0
        if(this.$audio.volume === 0){
          //进度条的长度
          this.$sound.style.left = 3 + 'px';
          this.Voicebar.style.width = 3 + 'px';
        }else {//否则的长度
          this.$sound.style.left = parseFloat(window.getComputedStyle(this.$soundBar).width) * this.$audio.volume + 'px';
          this.Voicebar.style.width = parseFloat(window.getComputedStyle(this.$soundBar).width) * this.$audio.volume + 'px';
        }
      } else {//否则
        //icon为静音按钮
        icon.classList.add('voice');
        icon.innerHTML = icons.mute;
        //保存当前音量状态
        this.previousVol = this.$audio.volume;
        //静音
        this.$audio.volume = 0;
        //进度条长度：因为小圆点也有宽度，所以要计算进去，我设置的小圆点的宽为10px
        this.$sound.style.left = 3 + 'px';
        this.Voicebar.style.width = 3 + 'px';
      }
    });
    //点击进度条移动视频进度条和圆点
    this.$progress.addEventListener('click', event => {
      const barVideoWidth = parseFloat(window.getComputedStyle(this.$progress).width);
      let percent = event.offsetX / barVideoWidth;
      this.$audio.currentTime = this.$audio.duration * percent;
      this.$pin.style.left = event.offsetX + 'px';
      this.videoBar.style.width = event.offsetX + 'px';
      this.auto = true;
    });
    //拖拽圆点移动视频进度条和圆点
    //注意：为了避免点击到进度条，所以鼠标移动事件绑定到遮罩层上,这样滑动圆点的时候就不会出现由于点到进度条而移动失败
    this.$pin.addEventListener('mousedown', () => {
      this.myDown(this.$progressBox);
    });
    this.$progressBox.addEventListener('mousemove', event => {
      event.stopPropagation();
      if (this.moving) {
        const barVideoWidth = parseFloat(window.getComputedStyle(this.$progress).width);
        let percent = event.offsetX / barVideoWidth;
        this.$audio.currentTime = this.$audio.duration * percent;
        this.$pin.style.left = event.offsetX + 'px';
        this.videoBar.style.width = event.offsetX + 'px';
      }
    });
    document.addEventListener('mouseup', () => {
      this.myUp(this.$progressBox);
    });
    //点击移动音量进度条和圆点
    this.$soundBar.addEventListener('click', event => {
      //音量要大于0，不加这个出现过音量小于0的bug
      let x = Math.max(0, event.offsetX);
      this.$audio.volume = x / this.voiceBarWidth;
      this.$sound.style.left = event.offsetX + 'px';
      this.Voicebar.style.width = event.offsetX + 'px';
      const icon = this.$soundButton.querySelector('.iconfont');
      if (event.offsetX <= 3) {
        this.$audio.volume = 0;
        icon.innerHTML = icons.mute;
        this.$sound.style.left = 3 + 'px';
        this.Voicebar.style.width = 3 + 'px';
      } else {
        icon.innerHTML = icons.sound;
      }
    });
    //拖拽移动音量进度条和圆点
    this.$sound.addEventListener('mousedown', () => {
      this.myDown(this.$soundBox);
    });
    this.$soundBox.addEventListener('mousemove', event => {
      event.stopPropagation();
      if (this.moving) {
        let x = Math.max(0, event.offsetX);
        this.$audio.volume = x / this.voiceBarWidth;
        this.$sound.style.left = event.offsetX + 'px';
        this.Voicebar.style.width = event.offsetX + 'px';
        const icon = this.$soundButton.querySelector('.iconfont');
        if (event.offsetX <= 4) {
          this.$audio.volume = 0;
          icon.innerHTML = icons.mute;
          this.$sound.style.left = 4 + 'px';
          this.Voicebar.style.width = 4 + 'px';
        } else {
          icon.innerHTML = icons.sound;
        }
      }
    });
    document.addEventListener('mouseup', () => {
      this.myUp(this.$soundBox);
    });
    //播放时
    this.$audio.addEventListener('play', () => {
      //先清除一次计时器
      clearInterval(this.statusClock);
      //0.5秒更新一次进度条长度
      this.statusClock = setInterval(function () {
        _this.updateStatus();
      }, 500);
      //视频总共有多长的时间
      this.$controller.querySelector(".total-time").innerHTML = VideoPlayer.formatTime(this.$audio.duration);
    });
    //暂停时清除计时器
    this.$audio.addEventListener("pause", function () {
      clearInterval(this.statusClock);
    });
    //全屏和取消全屏
    //只能网页全屏不能电脑屏幕全屏，因为电脑屏幕全屏后不知为何视频无法点击全屏
    this.$fullscreenButton.addEventListener('click', () => {
      if (!this.$videoContainer.classList.contains("open")) {
        this.$videoContainer.classList.add('open');
      } else {
        this.$videoContainer.classList.remove("open");
      }
    });
    //大图标控制播放和关闭
    //大图标的出现和消失
    this.$videoContainer.addEventListener('click', () => {
      //点击屏幕，播放图标出现并视频暂停
      this.playVideoAndChangeIcon(this.$controlBtn, icons.bigPause, icons.bigPlay);
      this.$controlBtn.style.display = 'block';
      this.playVideoAndChangeIcon(this.$controller,icons.pause,icons.play);
    });
    //点到控制条时
    this.$controller.addEventListener('click',(e) => {
      //阻止冒泡
      e.stopPropagation();
    });
    //鼠标移入视频屏幕
    this.$videoContainer.addEventListener('mouseenter',()=>{
      //如果视频处于暂停状态
      if(this.$audio.paused){
        //播放图标出现
        this.$controlBtn.style.display = 'block';
      }
    });
    //鼠标移出屏幕
    this.$videoContainer.addEventListener('mouseleave', () => {
      //播放图标消失
      this.$controlBtn.style.display = 'none';
    });
  }
}
