// UI player vs Audio player (different states but in sync!)

var scrollTop = function(offset) {
    $('html,body').animate({
      scrollTop: offset
    }, 1000);
};

var LessonPlayer = function(audioDomContainerSelector, mediaPlayer) {
    'use strict';

    var clickable = 1;

    var state = {
        entries: [],
        currentItem: 0
    };

    var goToNext = function() { // Loop
        state.currentItem = (state.currentItem + 1) % state.entries.length; 
    };

    var $getEntry = function(i) {
        return $(state.entries[i]);
    };

    var scrollToTop = function(idx) {
        // scrollTop() to previous entry
        var prevIdx = (idx === 0) ? 0 : idx-1;
        var $previous = $getEntry(prevIdx);

        if ($previous.is(':visible')) {
            scrollTop($previous.offset().top);
        }
    };

    var getCurrentAudio = function() {
        var $entry = $getEntry(state.currentItem);
        return $entry.find('audio')[0];
    };

    var makeEntryListVisible = function($entry) {
        var $entryList = $entry.closest('ul');
        if (!$entryList.is(':visible')) {
            $entryList.slideDown();
        }
    };

    var playEntry = function() {
        $(state.entries).removeClass('active');
        scrollToTop(state.currentItem);

        var $entry = $getEntry(state.currentItem);
        makeEntryListVisible($entry);
        $entry.addClass('active');

        var audioId = $entry.data('audio');
        mediaPlayer.playSound(audioId);
    };

    var play = function() {
        playEntry();
    };

    var setClickable = function($entry) {
        $entry.each(function(i, item) {
            $(this).on('click', function() {
                state.currentItem = i;
                play();
            });
        });
    };

    var setEntries = function(entriesBySelector) {
        state.entries = $(entriesBySelector);
        if (clickable) {
            setClickable(state.entries);
        }
    };

    var chapterExpander = function() {
        var chapter = $(this).parent('[data-chapter]').data('chapter');
        mediaPlayer.loadChapterSounds(chapter);

        var $entryList = $(this).next('ul');
        if ($entryList.is(':visible')) {
            $entryList.slideUp();
        }
        else {
            $entryList.slideDown();

            // Play and activate the first entry!
            var firstEntry = $entryList.find('li')[0];
            $(firstEntry).trigger('click'); 
        }
    };

    var initialize = function() {
        if (audioDomContainerSelector) {
            setEntries(audioDomContainerSelector);
        }
        else {
            throw new Error('LessonPlayer(audioDomContainerSelector): missing selector');
        }
        $('.phrases h3').on('click', chapterExpander);
        scrollTop(0);
    };

    var stop = function() {
        mediaPlayer.setAutoplay(false);
    };

    initialize();

    return {
        play: play,
        stop: stop,
        goToNext: goToNext,
        setEntries: setEntries
    };
};
