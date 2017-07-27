## Table of Contents

* [Introduction](#introduction)
* [Features](#features)
* [Installation](#installation)
* [Example](#example)
* [Core Concepts](#core-concepts)
  * [Synchronization](#synchronization)
  * [Managing application state](#managing-application-state)
* [App](#app)
  * [app.intent()](#intent)
  * [app.invokeIntent()](#invoke-intent)
  * [app.entity()](#entity)
  * [app.action()](#action)
* [SSML](#ssml)
  * [ssml.add()](#ssml-add)
  * [ssml.set()](#ssml-set)
  * [ssml.audio()](#ssml-audio)
  * [ssml.pause()](#ssml-pause)
  * [ssml.list()](#ssml-list)
  * [ssml.filterRepeatable()](#ssml-filter-repeatable)
  * [ssml.output()](#ssml-output)
* [Caching](#caching)
* [Steps for building an application](#steps-for-building-an-application)
* [License (MIT)](#license)

# actions-ai-app

A Node module to simplify the development of Actions on Google + API.ai applications for Google Assistant.

[![travis build](https://img.shields.io/travis/ImAdamTM/actions-ai-app.svg?style=flat-square)](https://github.com/ImAdamTM/actions-ai-app)
[![release](https://img.shields.io/github/release/ImAdamTM/actions-ai-app.svg?style=flat-square)](https://github.com/ImAdamTM/actions-ai-app)
[![Coverage Status](https://coveralls.io/repos/github/ImAdamTM/actions-ai-app/badge.svg?branch=master)](https://coveralls.io/github/ImAdamTM/actions-ai-app?branch=master&style=flat-square)
[![license](https://img.shields.io/github/license/ImAdamTM/actions-ai-app.svg?style=flat-square)](https://github.com/ImAdamTM/actions-ai-app)
[![Twitter Follow](https://img.shields.io/twitter/follow/imadamtm.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=imadamtm)


## Introduction

This module was created with the simple goal to make it easier to build and integrate [Actions on Google](https://github.com/actions-on-google/actions-on-google-nodejs) applications that utilize [API.ai](https://api.ai/) for their natural language support. It is built on top of the [actions-on-google-node-js](https://github.com/actions-on-google/actions-on-google-nodejs) API.ai implementation.

## Features

- Combines the capabilities of `actions-on-google` and `API.ai`
- Simplifies the creation of intents and entities, along with state-managed session handling
- Ability to synchronize your configurations directly into api.ai, managing them exclusively from within your application
- Allows you to quickly create applications with less boilerplate
- Built-in SSML (Speech Synthesis Markup Language) utility to quickly create complex rich natural conversation

## Installation
* Install with [yarn](https://github.com/yarnpkg/yarn) `yarn add actions-ai-app`
* Install with [npm](https://www.npmjs.com/) `npm i actions-ai-app --save`

## Example

For more examples, refer the the [example directory](example).

### Basic Usage Example

Using [Express](https://expressjs.com/):

```
const express = require('express');
const bodyParser = require('body-parser');
const ActionsAIApp = require('actions-ai-app').App;

const app = new ActionsAIApp({
  APIAIToken: 'API_AI_DEVELOPER_ACCESS_TOKEN',
  cachePath: './cache',
  debug: true,
});
const { intent } = app;
const expressApp = express();

expressApp
  .use(bodyParser.json({ type: 'application/json' }))
  .post('/', app.handleRequest);

intent('input.welcome', {
  userSays: ['Hello', 'Hi', 'Hey'],
}, (res, ssml) => {
  ssml.add('Hello!');
  res.ask(ssml);
});

intent('input.unknown', {
  fallbackIntent: true,
}, (res, ssml) => {
  ssml.add('Sorry, I didn\'t catch that.');
  res.ask(ssml);
});

app.start({
  update: true,
  clean: true,
})
.then(() => {
  expressApp.listen(8000, () => {
    // Ready
  });
});
```

## Core concepts

### Synchronization

One key aspect that this module targets is the way that you configure your intents and entities within API.ai. It can be cumbersome and difficult to manage these within the API.ai interface on top of managing the responses in your own application as two separate configurations. Instead, this module combines them, utilizing [API.ai's own API](https://api.ai/docs/reference/agent/) to allow you to configure your intents and entities alongside your behaviors and have them automatically synchronize.

You can enable either partial synchronization (only manages intents/entities you have created in your application, leaving content you have manually entered into api.ai in tact) or full synchronization (which means API.ai is kept fully in sync with your application at all times).

To reduce the number of API calls made to API.ai, this module stores a running a cache of your intents and entities as `json` files at a location of your preference, which is then used to compare against and only push targeted changes when they have occurred.

Refer to the [App](#App) section for more information on configuration.

### Managing application state

Normally, managing session data with Google Assistant means passing back and forth a data object (`app.data`) that you manipulate as required. As your application becomes larger this can become harder to maintain and keep track of.

Instead, this module establishes and encourages a [Redux](http://redux.js.org/) style approach to state management to create a predictable state container between the user and your application, allowing you to reliably keep track of the state of your application at any given moment within the conversation.

Refer to the [action](#action) section for more information for usage.

## App

To start building your application, you should first create a new instance of
the `ActionsAiApp`.

```
const ActionsAIApp = require('actions-ai-app').App;

// Create a new instance of ActionsAIApp
const app = new ActionsAIApp({
  // Your project's API.ai developer access token
  APIAIToken: 'API_AI_DEVELOPER_ACCESS_TOKEN',
  // The path in your project where API.ai json cache should be stored
  cachePath: './cache',
  // Whether debugging is enabled (default false)
  debug: true,
  // Error message to output when an intent fails
  errorMessage: 'An error occurred.',
});

// ENSURE ANY INTENTS/ENTITIES/ACTIONS ARE REGISTERED BEFORE `app.start()` is called

// Start the application
app.start({
  // Whether the application should update local intents/entities to API.ai
  update: false,
  // Whether it should compare local data to cached data. If there
  // is cache data that is no longer in local data it should attempt to remove
  // from api.ai
  clean: false,
  // Whether it should force api.ai to match the app intents/entities. Any
  // intents/entities on API.ai that are not configured by the local app will
  // be removed.
  // NOTE: this should only be used if you want to manage all aspects of the
  // application internally and disallow any extra data being added to api.ai
  // manually
  cleanForceSync: false,
})
.then(() => {
  // Ready
});
```

When a new application instance is created, it exposes a set of key methods for your disposal: `intent`, `invokeIntent`, `entity` and `action`.

<a name="intent"></a>
## app.intent(key, config, callback)

To begin adding intents (and responses) to your application, you will require the `intent(key, config, callback)` method, which accepts 3 parameters:

|Parameter|Description|
|------------------|-----------|
|key:String|The key for your intent (must be unique). E.g. `input.welcome`. This is the same key set for the intent action hook used in API.ai|
|config:Object|If your intent utilizes API.ai, specify your configuration here, or if your intent is only invoked from inside your app (not accessible via API.ai, see `invokeIntent()`), specify `null` or skip the parameter. This configuration supports the same spec as the [API.ai intents specification](https://api.ai/docs/reference/agent/intents#post_intents), **see below for more information** |
|callback:Function|When your intent is invoked, this method is called. It includes two parameters, the `res` app instance (which is an augmented version of the `actions-on-google` `ApiAiApp`) and the `ssml` utility. See below for more information|

```
...
const { intent } = app;

// Simple response
intent('input.question.moon_distance', {
  // API.ai intent configuration
  userSays: [
    'How far away is the moon?',
    'How far away from earth is the moon?',
    'What is the distance between the moon and earth?',
  ]
}, (res, ssml) => {
  ssml.add('The moon is roughly 240,000 miles from Earth.');
  res.ask(ssml);
});
```

### Intent configuration

The intent `config` parameter uses the [API.ai intents specification](https://api.ai/docs/reference/agent/intents#post_intents), however it also has some built in shorthand capabilities to reduce the overhead from using this specification. Most importantly, in its ability to quickly add entities into the `userSays` config. For example:

```
{
  userSays: [
    '@{response:yes}',
    'I\'m going to say @{response:no}',
  ],
}
```
Essentially, we look for the following format in a string: `@{[ENTITY_NAME}:[EXAMPLE_ENTITY_VALUE]`
This is then converted automatically into the necessary configuration for integration into API.ai for you. Refer to **app.entity()** for more information about creating and managing entities.

### Understanding the intent `res`ponse object

The response object that is supplied to all intent callback methods is, at its simplest, an augmented version of the `actions-on-google` `ApiAiApp` instance that is created every time an intent is invoked. This means it has all the behaviors of the original class, along with some additional features and shorthands.

To learn more about the available methods of this class, refer to the [Actions on Google Class:ApiAiApp Documentation](https://developers.google.com/actions/reference/nodejs/ApiAiApp).

Additional parameters include:

|Parameter|Description|
|------------------|-----------|
|res.sessionId:String|A shorthand to `request.body.sessionId`, which is the users session Id|
|res.userInput:String|The raw input string that the user said or wrote that invoked the intent|
|res.hasScreen:Boolean|A shorthand to `res.hasSurfaceCapability(res.SurfaceCapabilities.SCREEN_OUTPUT)` which tells you whether or not the users device is capable of [screen output](https://developers.google.com/actions/assistant/surface-capabilities)|
|res.hasAudio:Boolean|A shorthand to `res.hasSurfaceCapability(res.SurfaceCapabilities.AUDIO_OUTPUT)` which tells you whether or not the users device is capabale of [audio output](https://developers.google.com/actions/assistant/surface-capabilities)|
|res.store:Object|The `store` object relates to the state management behaviors built into this framework, which is a replacement set of functionality for managing session data. Refer to `app.action` for more information.|

<a name="invoke-intent"></a>
## app.invokeIntent(res, key)

In addition to linear `invocation => intent => output` flow, you also have the ability to invoke any other intent from within your application by its `key`. This is useful for scenarios where you want to break up *larger* intents into *smaller* more re-usable pieces or to move the user to another conversational flow based on user response.

Secondary intents are always invoked from within another intent, and are not capable of output by themselves, instead they must be supplied with the current intent `res` context, returning a `Promise` that resolves when the intent outputs.

The `invokeIntent(res, key)` method accepts 2 parameters:

|Parameter|Description|
|------------------|-----------|
|res:Object|The response object returned from the parent intent (which is an augmented version of the `actions-on-google` `ApiAiApp`)|
|key:String|The key for the intent you are invoking|

```
...
const { intent, invokeIntent } = app;

intent('input.question.moon_distance', {
  userSays: [
    'How far away is the moon?',
    'How far away from earth is the moon?',
    'What is the distance between the moon and earth?',
  ],
}, (res, ssml) => {
  ssml.add('The moon is roughly 240,000 miles from Earth.');
  res.ask(ssml);
});

intent('input.moon_fact', {
  userSays: [
    'Tell me something about the moon',
    'What do you know about the moon?',
  ],
}, (res, ssml) => {
  ssml.add('How about this one.');

  // Invoke the `input.question.moon_distance` intent
  invokeIntent(res, 'input.question.moon_distance')
    .then((output) => {
      ssml.add(output);
      // Uses `tell` which ends the application conversation
      res.tell(ssml);
    });
});

// `input.moon_fact` Outputs:
// `<speak>How about this one. The moon is roughly 240,000 miles from Earth.</speak>`;
```

<a name="entity"></a>
## app.entity(name, terms, props)

The `entity(name, terms, props)` method allows you to dynamically create and register entities to API.ai, which can then be utilized by your intents. It accepts 3 parameters:

|Parameter|Description|
|------------------|-----------|
|name:String|The unique name of the entity|
|terms:Array|The list of terms for the entity. This follows the `entries` config from the [API.ai Entity API](https://api.ai/docs/reference/agent/entities#entity_object)|
|props:Object|Optional object containing any extra API.ai API properties to configure along with the entity (E.g. `isEnum` or `automatedExpansion`). Refer to the [API.ai Entity API](https://api.ai/docs/reference/agent/entities#entity_object) for more information|

```
...
const { intent, entity } = app;

// Register entity
entity('response', [
  {
    value: 'yes',
    synonyms: [
      'yes', 'yep', 'ok', 'sure', 'yup', 'uh huh', 'yeah', 'check', 'affirmative', 'okay',
    ],
  },
  {
    value: 'no',
    synonyms: [
      'no', 'nope', 'nah', 'not really', 'nothing', 'I don\'t', 'I do not', 'no thanks',
    ],
  },
]);

// Register intent
intent('input.welcome', {
  userSays: [
    'Hi',
    'Hello',
  ],
}, (res, ssml) => {
  ssml.add('Hello! Would you like to play a game?');
  // Apply the context
  res.setContext('prompt_response_context');
  res.ask(ssml);
});

// Register response intent
intent('input.game.prompt.response', {
  contexts: ['prompt_response_context'],
  userSays: [
    '@{response:yes}', // Shorthand @{[ENTITY_NAME]:[ENTITY_EXAMPLE_RESPONSE]}
  ],
}, (res, ssml) => {
  const response = res.getArgument('response');

  // Response
  if (response.match(/^(yes)$/)) {
    // User responded with a `yes` match
    ssml.add('OK. Let\'s get started!');
    // Do something
    res.ask(ssml);
    return;
  }

  if (response.match(/^(no)$/)) {
    // User responded with a `no` match
    ssml.add('OK. Bye');
    res.tell(ssml);
    return;
  }

  // User responded with something else. A fallback intent should be used for this situation.
  res.tell('Exit.');
});
```

### Using `@sys`tem entities from API.ai
API.ai has a number of system entities built in. [You can find a detailed list here](https://api.ai/docs/reference/system-entities).

To use these entities within your intents using the shorthand configuration, you can do the following:

```
...
const { intent } = app;

intent('input.weather.query', {
  userSays: [
    'What is the weather in @{sys.location:New York}?',
    'What\'s the weather right now in @{sys.location:New York}?',
  ],
}, (res, ssml) => {
  const location = res.getArgument('location');

  if (location.city && location.city === 'Philadelphia') {
    ssml.add('It\'s always sunny.');
  } else {
    ssml.add('It\'s probably raining.');
  }

  res.ask(ssml);
});
```

<a name="action"></a>
## app.action(key, reducers, defaults)

The `action(key, reducers, defaults)` method is used in replacement of manipulating the `res.data` session object. In its place, this module establishes and encourages all interaction with the session data to be managed through a state managed container.

This methodology is hugely inspired by [Redux](http://redux.js.org/docs/basics/) so it is thoroughly recommended to be familiar with it.

The first point for managing user session data is by registering action groups with the `action(key, reducers, defaults)` method. This accepts 3 parameters:

|Parameter|Description|
|---------|-----------|
|key:String|The unique key for the action group|
|reducers:Array|An array of `reducers` which are methods that are called when state changes are dispatched (see below for more information)|
|defaults:Object|The default state for this action group. These are a set of values that your group starts with by default, that can change over time as required|

```
...
const { action, intent, invokeIntent } = app;
const REMEMBER_COLOR = 'REMEMBER_COLOR';
const REMEMBER_NUMBER = 'REMEMBER_NUMBER';

action('remember', {
  [REMEMBER_COLOR]: (state, payload) => {
    // We avoid mutating the current state, instead we always create a copy and
    // return the result. Refer to Redux documentation for more information
    const newState = Object.assign({}, state);
    newState.color = payload;
    return newState;
  },
  [REMEMBER_NUMBER]: (state, payload) => {
    const newState = Object.assign({}, state);
    newState.number = payload;
    return newState;
  },
}, {
  color: 'unknown',
  number: 'unknown',
}); // The same as res.data.remember = { color: 'unknown', number: 'unknown' };

intent('input.remember', {
  userSays: [
    'My favorite color is @{sys.color:red} and my favorite number is @{sys.number:10}',
    'My favorite color is @{sys.color:blue}',
    'My favorite number is @{sys.number:10}',
  ],
}, (res, ssml) => {
  const userColor = res.getArgument('color');
  const userNumber = res.getArgument('number');

  if (userColor) {
    // Dispatch the `REMEMBER_COLOR` action, any action with this name will be called
    res.store.dispatch(REMEMBER_COLOR, userColor);
    ssml.add(`I've set your favorite color to ${userColor}.`);
  }

  if (userNumber !== null) {
    // Dispatch the `REMEMBER_NUMBER` action, any action with this name will be called
    res.store.dispatch(REMEMBER_NUMBER, userNumber);
    ssml.add(`I've set your favorite number to ${userNumber}.`);
  }

  // Invoke the recite intent so we output the new info
  invokeIntent(res, 'input.remember.recite')
    .then((output) => {
      ssml.pause(0.5);
      ssml.add(output);

      res.ask(ssml);
    });
});

intent('input.remember.recite', {
  userSays: [
    'What is my favorite color?',
    'What is my favorite number?',
    'What is my favorite color and number?',
  ],
}, (res, ssml) => {
  const { color, number } = res.store.getState().remember;
  console.log(color, number);
  ssml.add(`Your favorite color is ${color}, and your favorite number is ${number}`);
  res.ask(ssml);
});
```

### res.store.getState()
Within intents, you may use the `res.store.getState()` method, which returns the current session state for the user (it is the equivalent of using `res.data`).

### res.store.dispatch(actionKey, payload)
To dispatch changes to the state from within intents, you will use the `store`'s `dispatch` method, demonstrated in the example above.

|Parameter|Description|
|---------|-----------|
|actionKey:String|The key of the target action|
|payload:Mixed|The payload you are dispatching|

### Preprogrammed actions

In addition to state actions that you implement, there are a handful of core actions hooks that are dispatched automatically. You may use these within any action group to perform additional required behaviors. These actions are particularly useful when used to create advanced fallback intents.

|Action Name|Payload|Description|
|-----------|-------|-----------|
|APP\_START\_RESPONSE|None|Dispatched immediately before any intent is called|
|APP\_INTENT\_INVOKED|key:String|Dispatched immediately after any intent is invoked. Its payload is the key of the intent that was invoked.
|APP\_OUTPUT|{ key, output }:Object|Dispatches immediately before an intent output is called. Its payload is an object containing the `key` of the intent invoked, and the `output` that was received from the intent|
|APP\_FINISH\_RESPONSE|None|Dispatches immediately after `APP_OUTPUT`|

```
action('fallback', {
  APP_INTENT_INVOKED: (state, payload) => {
    const newState = Object.assign({}, state);
    console.log(`This intent was invoked: ${payload}`);
    state.lastIntent = payload;
    return newState;
  },
}, {
  lastIntent: null,
});
```


## SSML
SSML (Speech Synthesis Markup Language) is a markup language which provides a standardized way to mark up text for output of synthetic speech, and is used by Google Assistant.

The SSML utility is automatically integrated into the callback method for intents for you, but you may also create new instances of it as required.

It's sole purpose is to make it easier to manage and manipulate voice output without having to worry about managing the final output syntax, which is compiled automatically.

<a name="ssml-add"></a>
### ssml.add(input, props)

Appends content to the current SSML data.

|Parameter|Description|
|---------|-----------|
|input:Mixed|The input content to append to the SSML, this can be a number of possible types, including a String, Array, or another SSML instance|
|props:Object|All SSML behaviors accept a `props` Object. This optional parameter allows you additional fine tuning behavior on top of simply adding content|
|props.random:Boolean|Used in conjunction with adding arrays: `ssml.add(['A', 'B', 'C'], { random: true );`, this will select a random item from the array for output (so the output could be 'A', 'B' or 'C'. (default is _false_)|
|props.fallback:Boolean|You can specify whether this ssml addition should only be utilized on fallback (repeat). For example, you may want to clarify something to the user the second time around, but feel it is otherwise not required. You can do so with `ssml.add('Some additional hint.', { fallback: true});`. In this circumstance, when `ssml.filterRepeatable(ssml)` is used, the fallback will be included. (default is _false_) |
|props.repeat:Boolean|In addition to fallbacks, you can also specify whether you would like the content to be flagged as non-repeating. To be used in conjunction with `const output = ssml.filterRepeatable(ssml)` which will exclude any ssml item that was flagged with `repeat: false` (default is _true_)|

<a name="ssml-set"></a>
### ssml.set(input, props)
Sets the SSML content to the supplied data, overwriting anything that came before it.

<a name="ssml-audio"></a>
### ssml.audio(url, props)
Adds an audio clip to the SSML output. The URL parameter **MUST** be an absolute `https://...` URL. In addition to the standard `props`, this method has one additional optional parameter: `fallbackText`. This optional string will be output in the event that the sound clip was not able to play.

<a name="ssml-pause"></a>
### ssml.pause(duration, props)
Allows you to specify a `break` time **in seconds**, which will add pauses for the specified duration within your voice output.

<a name="ssml-list"></a>
### ssml.list()
Returns the current array of content within the SSML instance

<a name="ssml-filter-repeatable"></a>
### ssml.filterRepeatable(list)
Returns a list of only repeatable content from an `ssml` instance or array (see the SSML props detail above)

<a name="ssml-output"></a>
### ssml.output()
Returns the SSML in its compiled `<speak></speak>` format.

## Caching

When creating intents and entities for your application and utilizing the API.ai integration behaviors, you will specify a `cache` directory that intents and entity data json will be saved to.

This caching is very important for API.ai integration in that it is used specifically to reduce the number of API.ai calls by only pushing updates when changes have actually occurred.

If for example your application has 50 intents, that would otherwise mean every time you start the application with update/clean sync behaviors enabled that it would need to perform 50 API.ai API requests each time (due to intents not being able to be uploaded in bulk). **Doing so would very quickly reach API.ai API request limits**.

With caching in place, that means we only update intents where API.ai specific configuration changes have occurred by comparing both to locally cached json files and API.ai data itself.

With this in mind, it is recommended that:

* You do not `gitignore` your specified cache directory, meaning that the json cache files are stored as part of the repository
* In production, you set the update/clean/cleanForceSync behaviors to `false`


## Steps for building an application

### Initial Setup

1. To start building your application, you should first create the project within the Google Console and API.ai. Use the [Actions on Google Console](https://console.actions.google.com/) to add a new project with a name of your choosing.
1. Click *Use API.AI* and then *Create Actions on API.AI* to open the API.AI console.
1. Click *Save* to save the project.
1. Click on the gear icon to see the project settings.
1. Take note of your `Developer access token` which we will use for synchronizing your application to API.ai directly.
1. When a new API.ai project is created, a `Default Fallback Intent` and `Default Welcome Intent` are created by default, you may wish to remove these (unless you are opting for full synchronization, in which case they will be removed for you automatically when your application synchronizes).
1. If developing locally, you may wish to use a service such as [ngrok](https://ngrok.com/). In either case, you will need to browse to the `Fulfillment` tab of your project within API.ai, enable your webook and point it to the web address of your application when it is available
1. Create your node.js application and install the `actions-ai-app` module. Follow the configuration outlined in the [App](#app) section, using your API.ai `Developer access token` to be able to utilize the update capabilities.

## License

See LICENSE.MD
