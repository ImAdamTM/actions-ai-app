# Dynamic Intents

This example demonstrates how you can dynamically generate intents by iterating through a set of data. If you have a large array of consistent intents (such as a set of questions), it's a huge benefit to simply be able to loop through that data and create the intents based that information. Doing so reduces the amount of manual labour for populating content into your application, and makes it easier to manage dynamic data (especially data that may change over time).

### A note on api.ai API calls
Because we could in theory create a large amount of data with this technique. It is important to note that to submit intents into api.ai, we have to make an individual call to create each intent. Doing so risks that chance of quickly reaching your API call limit if for example you tried to register 100 or so intents in a single launch within 1 minute.

In this scenario, it is recommended that you either run this initially in smaller chunks, or over a number of attempts. The internal caching mechanisms within `actions-ai-app` means that after an intent is initially created, it's cached json will mean that particular intent is not submitted again until changes have occurred in its configuration; this capability is only most beneficial AFTER intents have been registered at least once. Refer to api.ai documentation for more information on API request limits.

As a rule of thumb, if your application is submitting more than 100 intents in a single try then you should consider splitting them initially to reduce the number of calls the first time they are registed. In the event that api.ai population failed, you will see this error appear in your console.

## Example
```
User: Hello

Bot: Hello and welcome to cat facts! Ask me a question about cats, or just ask for facts!

User: Why do cats hate water?

Bot: Cats hate water because their fur does not insulate well when it's wet. I have more cat facts, just ask!

User: Are cats better pets than dogs?

Bot: In my humble opinion, cats are better than dogs. Is there any other questions you had about cats?

User: Tell me a cat fact

Bot: How about this cat fact! A cat can't climb head first down a tree because every claw on a cat's paw points the same way. To get down from a tree, a cat must back down. Do you have any other questions about cats?
```

## Project Structure

```
.
├── app                        # The application directory
│    ├── index.js              # App initialization
│    ├── intents               # The intents directory
│    │   ├── index.js          # Imports the intents for use
│    │   ├── question          # The questions intents module
│    │       ├── index.js      # The questions dynamic intents handling
│    │       ├── cat-facts.js  # The list of cat facts
│    │   ├── fallback.js       # The fallback intent (when the app doesn't understand)
│    │   └── welcome.js        # The welcome intent (greets the user)
│    └── ai.js                 # `actions-ai-app` creation (exports the intent, invokeIntent, action, and entity methods so that we may import them anywhere)
├── cache                      # The cache is used to store json data for API.AI
└── nodemon.js                 # Nodemon config, specifically we ignore the `cache` directory as we don't need refresh when cache changes
```

## Steps
1. Install with `yarn` or `npm install`.
1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing.
1. Click *Use API.AI* and then *Create Actions on API.AI* to open the API.AI console.
1. Click *Save* to save the project.
1. Click on the gear icon to see the project settings.
1. Take note of your `Developer access token` which we will use for synchronizing your application to API.ai directly. Edit the `app/ai.js` and set your API.ai token: `APIAIToken: 'API_AI_DEVELOPER_TOKEN'`
1. If developing locally, you may wish to use a service such as [ngrok](https://ngrok.com/). In either case, you will need to browse to the `Fulfillment` tab of your project within API.ai, enable your webhook and point it to the web address of your application when it is available
1. Use `yarn run start` or `npm start` to start the application.
1. View your project in the API.ai console to test the application. See the example conversation above for this demonstration.