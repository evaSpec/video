function play(url) {
  //找到视频
  const player =new VideoPlayer('.shadow .player');
  //找到遮罩层
  const shadow =document.querySelector('.shadow');
  //找到关闭按钮
  const close =document.querySelector('.shadow .close');
  //找到视频的容器
  const videoContainer =document.querySelector('.shadow .video-container');
  //打开遮罩层
  shadow.classList.remove('hidden');
  //播放视频 ------ play方法在class对象里(后文会写到)
  player.play(url);
  //点击关闭按钮
  close.addEventListener('click',(e) => {
    //阻止a标签本来的事件
    e.stopPropagation();
    //关闭视频-----close方法在class对象里
    player.Close();
    //关闭遮罩层
    shadow.classList.add('hidden');
  });
  //点击遮罩层
  shadow.addEventListener('click',() => {
    //关闭视频
    player.Close();
    //关闭遮罩层
    shadow.classList.add('hidden');
  });
  //点击遮罩层的视频容器时，视频不能关闭
  videoContainer.addEventListener('click',(e) => {
    //阻止冒泡
    e.stopPropagation();
  });
}
