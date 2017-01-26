var hogan = require("hogan.js");

// construct template string
// var template = "Hello {{world}}!";

// compile template
// var hello = hogan.compile(template);


// compile template
var template = hogan.compile("HH @{{name}} HH");

var team = ['dhg', 'fat', 'jimio', 'nickgreen', 'sayrer'];

var templates = team.map(function (twitterer) {
  // Render context to template
  return template.render({name: twitterer });
});

// outputs "Follow: @dhg @fat @jimio @nickgreen @sayrer!"
console.log('Follow: ' + templates.join(' ') + '!');

var context = {
    message: 'Crazy hot weather in NYC!',
    tweets: [ { tweet: 'uno'}, { tweet: 'dos' }, { tweet: 'tres'} ]
};

var partial = `
<div class="timeline">
  <!-- load more button -->
  <button>{{message}}</button>

  <!-- tweet object -->
  {{#tweets}}
    {{tweet}}
  {{/tweets}}
</div>
`;

console.log(partial);
template = hogan.compile(partial);

var content = template.render(context);
console.log(content);


// PARTIALS

if (0) {
  var template = "Hello {{world}}! {{>greeting}}",
       context = { world: 'world', name: 'Jack' },
       partial = { greeting: 'My name is {{name}}.' },
       hello = hogan.compile(template);

  var rendered = hello.render(context, partial);
  console.log(rendered)
}

var dicTemplate = `
  ============
  {{title}}
  {{#dictionary}}
    {{> entry}}
  {{/dictionary}}
`;

var entryTemplate = `
  The translation for {{word}} is {{translation}}
`;

var context = {
  title: 'What a wonderful world!'
  , dictionary: [
    {word: 'house', translation: 'casa'},
    {word: 'garden', translation: 'jardin'},
  ]
}

var dictionary = hogan.compile(dicTemplate);
var rendered = dictionary.render(context, {entry: entryTemplate})
console.log(rendered)

