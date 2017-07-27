# Advanced Fallback Intent

This example demonstrates an advanced fallback intent that can keep track of how many times the user has landed on the fallback intent sequentially.

The benefit of tracking fallback intent invocations is that you can dynamically change the behavior of your application based on whether the user appears to be having trouble performing a particular action. This gives you an opportunity to steer the conversation when it becomes clearer the user is trying to do something that isn't permissible.

Finally, if the user keeps failing to get the result they intend, rather than an infinite loop of fallbacks, you can present the user with a choice whether they would like to continue.

## Example
```
User: Hello

Bot: Hi! Lets test the fallback intent! I won't repeat this. Test this fallback by saying anything. For example, say "Fallback".

User: Something else

Bot: Sorry. I didn't catch that (1). Lets test the fallback intent! I will only say this on fallback. Say something else again.

User: Fallback test

Bot: Sorry. I didn't catch that (2). Lets test the fallback intent! I will only say this on fallback. Say something else again.

User: Testing

Bot: I'm having trouble understanding. Would you like to continue?

User: Yes

Bot: OK! Hello! Lets test the fallback intent! I won't repeat this. Test this fallback by saying anything. For example, say "Fallback".
```

## Project Structure

```
.
├── app                      # The application directory
│    ├── index.js            # App initialization
│    ├── intents             # The intents directory
│    │   ├── index.js        # Imports the intents for use
│    │   ├── fallback.js     # The fallback intent (when the app doesn't understand)
│    │   └── welcome.js      # The welcome intent (greets the user)
│    └── ai.js               # `actions-ai-app` creation (exports the intent, invokeIntent, action, and entity methods so that we may import them anywhere)
├── cache                    # The cache is used to store json data for API.AI
└── nodemon.js               # Nodemon config, specifically we ignore the `cache` directory as we don't need refresh when cache changes
```

## Steps
1. Install with `yarn` or `npm install`.
1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing.
1. Click *Use API.AI* and then *Create Actions on API.AI* to open the API.AI console.
1. Click *Save* to save the project.
1. Click on the gear icon to see the project settings. 
1. Take note of your `Developer access token` which we will use for synchronizing your application to API.ai directly. Edit the `app/ai.js` and set your API.ai token: `APIAIToken: 'API_AI_DEVELOPER_TOKEN'`
1. If developing locally, you may wish to use a service such as [ngrok](https://ngrok.com/). In either case, you will need to browse to the `Fulfillment` tab of your project within API.ai, enable your webook and point it to the web address of your application when it is available
1. Use `yarn run start` or `npm start` to start the application.
1. View your project in the API.ai console to test the application. See the example conversation above for this demonstration.