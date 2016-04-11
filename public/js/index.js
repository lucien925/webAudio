(function() {
	var items = $('.music-list-item > a');
	var volume = _id('volume');
	var canvas = _id('canvas');
	var xhr = createXhr();
	var ac = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
	var gainNode = ac[ac.createGain ? 'createGain' : 'createGainNode']();
	var analyser = ac.createAnalyser();
	var bufferSource = null;
	var change = false;
	var width = canvas.width = $('.container-right')[0].clientWidth;
	var height = canvas.height = $('.container-right')[0].clientHeight;
	var ctx = canvas.getContext('2d');
	var line = ctx.createLinearGradient(0, 0, 0, height);

	line.addColorStop(0, 'red');
	line.addColorStop(0.5, 'yellow');
	line.addColorStop(1, 'green');
	ctx.fillStyle = line;
	var count = 0;
	var size = 128;

	analyser.fftSize = size * 2;
	gainNode.connect(ac.destination);
	analyser.connect(gainNode);

	for(var i = 0; i < items.length; i++) {
		items[i].onclick = load;
	}
	volume.onchange = function() {
		changeValue(this.value);
	}

	function draw(arr) {
		var w = width / size,
			i = 0, h;
		ctx.clearRect(0, 0, width, height);
		for(i = 0; i < size; i++) {
			h = arr[i] / 256 * height;
			ctx.fillRect(i * w, height - h, w * 0.7, h);
		}
	}

	function load() {
			if(bufferSource) {
				bufferSource[bufferSource.stop ? 'stop' : 'noteOff']();
				change = true;
			}
			ctx.clearRect(0, 0, width, height);
			var n = ++count;
			for(var j = 0; j < items.length; j++) {
				items[j].className = '';
			}
			this.className = 'active';
			var url = this.getAttribute('data-url');
			xhr.abort();
			xhr.open('GET', '../../media/' + url + '.mp3', true);
			xhr.responseType = 'arraybuffer';
			xhr.onload = function() {
				if(count !== n) return;
				var arrayBuffer = xhr.response;
				ac.decodeAudioData(arrayBuffer, function(buffer) {
					if(count !== n) return;
					bufferSource = ac.createBufferSource();
					bufferSource.buffer = buffer;
					bufferSource.connect(analyser);
					bufferSource[bufferSource.start ? 'start' : 'noteOn'](0);
					bufferSource.onend = function() {
						
					}
					change = false;
					visualizer();
				}, function(err) {
					throw err;
				});
			}

			xhr.onerror = function() {

			}

			xhr.send(null);
		}

	function visualizer() {
		var arr = new Uint8Array(analyser.frequencyBinCount);

		function v() {
			if(change) return;

			analyser.getByteFrequencyData(arr);
			draw(arr);
			requestAnimationFrame(v);
		}
		requestAnimationFrame(v);
	}

	function changeValue(pencent) {
		gainNode.gain.value = pencent * pencent;
	}

	function createXhr() {
		return new XMLHttpRequest();
	}
	
	function _id(id) {
		return document.querySelector('#' + id);
	}

	function $(s) {
		return document.querySelectorAll(s);
	}

	function requestAnimationFrame(v) {
		return window.requestAnimationFrame ||
			   window.mozRequestAnimationFrame ||
			   window.webkitRequestAnimationFrame ||
			   function() {
			   		setTimeout(v, 1000/60);
			   }
	}
})();