$(function() {
	var playVideo = $('video');
	var playPause = $('.playPause'); //播放和暂停
	var currentTime = $('.timebar .currentTime'); //当前时间
	var duration = $('.timebar .duration'); //总时间
	var progress = $('.timebar .progress-bar'); //进度条
	var volumebar = $('.volumeBar .volumewrap').find('.progress-bar');

	console.dir( playVideo[0] )
	//初始化音量
	playVideo[0].volume = 0.4;

	// 底部栏控制播放
	playPause.on('click', function() {
		playControl();
	});

	// 视频本身亦可控制播放
	$('.playContent').on('click', function() {
		playControl();
	}).hover(function() {
		$('.turnoff').stop().animate({
			'right': 0
		}, 500);
	}, function() {
		$('.turnoff').stop().animate({
			'right': -40
		}, 500);
	});

	// 隐藏音量条
	$(document).click(function() {
		$('.volumeBar').hide();
	});

	// 当指定的视频的元数据已加载
	playVideo.on('loadedmetadata', function() {
		duration.text(formatSeconds(playVideo[0].duration));
	});

	// 	当目前的播放位置已更改
	playVideo.on('timeupdate', function() {
		currentTime.text(formatSeconds(playVideo[0].currentTime));
		progress.css('width', 100 * playVideo[0].currentTime / playVideo[0].duration + '%');
	});

	// 当前播放列表已结束
	playVideo.on('ended', function() {
		$('.playTip').removeClass('glyphicon-pause').addClass('glyphicon-play').fadeIn();
		playPause.toggleClass('playIcon');
	});

	// 当音量已改变
	playVideo.on('volumechange',function () {
		// 音量改变的时候 在播放视频上添加一个音量改变条	
		console.log("音量控制")
	})
	
	// 绑定键盘控制视频播放
	$(window).keyup(function(ev){
		ev = ev || window.event;
			if(event.keyCode == 32) playControl();
			if(event.keyCode == 27) {
			$('.fullScreen').removeClass('cancleScreen');
			$('#willesPlay .playControll').css({
				'bottom': -48
			}).removeClass('fullControll');
			};
		ev.preventDefault();
	});
	
	
	// 全屏
	$('.fullScreen').on('click', function() {
		if ($(this).hasClass('cancleScreen')) {
			// Document.exitFullscreen() 方法用于让当前文档退出全屏模式
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozExitFullScreen) {
				document.mozExitFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
			$(this).removeClass('cancleScreen');
			$('#willesPlay .playControll').css({
				'bottom': -48
			}).removeClass('fullControll');
		} else {
			// 视频全屏
			// Element.requestFullscreen()方法进入全屏模式
			if (playVideo[0].requestFullscreen) {
				playVideo[0].requestFullscreen();
			} else if (playVideo[0].mozRequestFullScreen) {
				playVideo[0].mozRequestFullScreen();
			} else if (playVideo[0].webkitRequestFullscreen) {
				playVideo[0].webkitRequestFullscreen();
			} else if (playVideo[0].msRequestFullscreen) {
				playVideo[0].msRequestFullscreen();
			}
			// 显示控制按钮
			$(this).addClass('cancleScreen');
			$('#willesPlay .playControll').css({
				'left': 0,
				'bottom': 0
			}).addClass('fullControll');
		}
		return false;
	});
	
	// 调出音量条
	$('.volume').on('click', function(ev) {
		ev = ev || window.event;
		$('.volumeBar').toggle();
		ev.stopPropagation();
	});

	// 音量放大、缩小
	$('.volumeBar').on('click mousewheel DOMMouseScroll', function(ev) {
		ev = ev || window.event;
		volumeControl(ev);
		ev.stopPropagation();
		return false;
	});

	// 播放进度条 鼠标控制
	$('.timebar .progress').mousedown(function(ev) {
		ev = ev || window.event;
		updatebar(ev.pageX);
	});

	// 鼠标滚轮控制播放
	$('.playContent').on('mousewheel DOMMouseScroll',function(ev){
		volumeControl(ev);
	});

	// 更新播放进度
	var updatebar = function(x) {// 传入鼠标当前的x轴坐标
		var maxduration = playVideo[0].duration; // video 播放长度
		var positions = x - progress.offset().left; // 获取点击位置
		var totalWidth = $('.timebar .progress').width();
		var percentage = 100 * positions / totalWidth;
	
		// 控制范围 
		if (percentage > 100) {
			percentage = 100;
		}
		if (percentage < 0) {
			percentage = 0;
		}

		// 更新进度条、视频时间
		progress.css('width', percentage + '%');
		playVideo[0].currentTime = maxduration * percentage / 100;
	};

	//音量控制
	function volumeControl(e) {
		e = e || window.event;
		var eventype = e.type;// 表示该事件对象的事件类型

		// 判断鼠标滚动方向
		var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome 
					(e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)); // firefox
		var positions = 0;
		var percentage = 0;

		if (eventype == "click") {// 点击事件
			positions = volumebar.offset().top - e.pageY;
			// 计算比例
			percentage = 100 * (positions + volumebar.height()) / $('.volumeBar .volumewrap').height();
		} else if (eventype == "mousewheel" || eventype == "DOMMouseScroll") {// 鼠标滚轮事件
			percentage = 100 * (volumebar.height() + delta) / $('.volumeBar .volumewrap').height();
		}

		// 禁音
		if (percentage < 0) {
			percentage = 0;
			$('.otherControl .volume').attr('class', 'volume glyphicon glyphicon-volume-off');
		}
		// 超出 50%
		if (percentage > 50) {
			$('.otherControl .volume').attr('class', 'volume glyphicon glyphicon-volume-up');
		}
		// 低于 50%
		if (percentage > 0 && percentage <= 50) {
			$('.otherControl .volume').attr('class', 'volume glyphicon glyphicon-volume-down');
		}
		// 最大音量
		if (percentage >= 100) {
			percentage = 100;
		}

		// 音量条
		$('.volumewrap .progress-bar').css('height', percentage + '%');

		// video的音量
		playVideo[0].volume = percentage / 100;
		e.stopPropagation();
		e.preventDefault();
	}

	// 开始/暂停 播放
	function playControl() {
		playPause.toggleClass('playIcon');
		if (playVideo[0].paused) {// 如果当前状态为暂停 
			playVideo[0].play();
			$('.playTip').removeClass('glyphicon-play').addClass('glyphicon-pause').fadeOut();
		} else {
			playVideo[0].pause();
			$('.playTip').removeClass('glyphicon-pause').addClass('glyphicon-play').fadeIn();
		}
	}

	// 关灯
	$('.btnLight').click(function(e) {
		e = e || window.event;
		if ($(this).hasClass('on')) {
			$(this).removeClass('on');
			$('body').append('<div class="overlay"></div>');
			$('.overlay').css({
				'position': 'absolute',
				'width': 100 + '%',
				'height': $(document).height(),
				'background': 'rgba(1,1,1,.5)',
				'opacity': 1,
				'top': 0,
				'left': 0,
				'z-index': 999
			});
			$('.video-content').css({
				'z-index': 1000
			})
			$('.playControll').css({
				'bottom': 0,
				'z-index': 1000
			});

			// 鼠标移入效果
			$('.playContent').hover(function() {
				$('.playControll').stop().animate({
					'bottom': 0,
				},500);
			}, function() {
				setTimeout(function() {
					$('.playControll').stop().animate({
						'bottom': -48,
					}, 500);
				}, 2000)
			});
		} else {
			$(this).addClass('on');
			$('.overlay').remove();
			$('.playControll').css({
				'bottom': 0,
			});
		}
		e.stopPropagation();
		e.preventDefault();
	});

	// 分享
	$('.glyphicon-share').on('click',function(ev) {
		alert("分享视频")

		ev.stopPropagation();
		ev.preventDefault();
	})

});

/**
 * 格式化时间
 * @param  {number} value  转化前时间 以秒为单位
 * @return {string} time   转化后的时间格式 以小时为单位
 */
function formatSeconds(value) {
	value = parseInt(value);

	function holdTwo(num) {
		if (num < 10) {
			return '0'+num;
		};
		return num;
	}

	var time;
	if (value > -1) {
		hour = Math.floor(value / 3600);
		min = Math.floor(value / 60) % 60;
		sec = value % 60;
		day = parseInt(hour / 24);
		if (day > 0) {
			hour = hour - (24 * day);
			time = day + "day " + holdTwo(hour) + ":" + holdTwo(min) + ":" + holdTwo(sec);
		} else {
			time = holdTwo(hour) + ":" + holdTwo(min) + ":" + holdTwo(sec);	
		}
	}
	return time;
}