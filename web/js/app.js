if (typeof languageCode === 'undefined') {
	alert('languageCode is undefined')
}
var audioBaseUrl = './audio/' + languageCode + '/';
var mediaPlayer = new MediaPlayer(audioBaseUrl, language);
var lessonPlayer = new LessonPlayer('.phrases ul > li', mediaPlayer);

mediaPlayer.playNext = function() {
    lessonPlayer.goToNext();
    lessonPlayer.play();
};

var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (!isMobile) {
    //lessonPlayer.play();
}
