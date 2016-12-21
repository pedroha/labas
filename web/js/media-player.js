var MediaPlayer = function(baseUrl, language) {
    var howlers = {};
    var autoplay = true; 
    var currentSoundId;
    var sounds = soundsConfig[language];
    
    var self = this;
    self.playNext = null;

    var getDuration = function(audioId) {
        var chapter = getChapter(audioId);
        var audioConfig = sounds[chapter].settings.sprite[audioId];
        return audioConfig[1];
    };

    var soundEnded = function() {
        if (currentSoundId && self.playNext) {
            var duration = getDuration(currentSoundId);

            var endingSound = currentSoundId; // avoid race conditions
            setTimeout(function() {
                if (autoplay && endingSound === currentSoundId) {
                    self.playNext();
                }
            }, duration);
        }
    };

    var loadChapterSounds = function(chapter, onload) {
        if (sounds && !howlers[chapter] && sounds[chapter]) {
            var settings = sounds[chapter].settings;
            settings.src = baseUrl + settings.src;
            settings.preload = false;
            settings.onload = onload;
            settings.onend = soundEnded;

            settings.onloadederror = function(e) {
                console.error(e);
            };

            howlers[chapter] = new Howl(settings);
            howlers[chapter].load();
        }
    };

    var getChapter = function(audioId) {
        for (var chapter in sounds) {
            if (audioId in sounds[chapter].settings.sprite) {
                return chapter;
            }
        }
    };

    var stopSound = function(callback) {
        currentSoundId = null;
        for (var chapter in sounds) {
            if (howlers[chapter]) {
                howlers[chapter].stop()
                // howlers[chapter].fade(1, 0, 500); // not quite working as expected
            }
        }
        if (callback) {
            callback();
        }
    };

    var playSound = function(audioId) {
        var chapter = getChapter(audioId);

        var attemptPlay = function() {
            var play = function() {
                if (howlers[chapter]) {
                    howlers[chapter].play(audioId)
                    currentSoundId = audioId;
                }
            }
            if (currentSoundId) {
                stopSound(play)
            }
            else {
                play();
            }
        };
        if (!howlers[chapter]) {
            loadChapterSounds(chapter, attemptPlay);
        }
        else {
            attemptPlay();
        }
    };

    this.setAutoplay = function(val) { // TODO: make it public
    	autoplay = val;
    };

    this.playSound = playSound;
    this.loadChapterSounds = loadChapterSounds;
};
