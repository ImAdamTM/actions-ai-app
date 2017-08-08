// App

const { ApiAiApp } = require('actions-on-google');

/**
 * When an incoming request is handled, a new `actions-on-google` `ApiAiApp`
 * instance is created an extended with some additional behaviors.
 *
 * The `app` instance is included in all intent callbacks.
 */
class App {
  /**
   * The app constructor.
   *
   * @param  {Object} request the request data
   * @param  {Object} response the response data
   */
  constructor({ request, response }) {
    const app = new ApiAiApp({ request, response });

    // Shorthand link the `sessionId`
    app.sessionId = request.body.sessionId;
    // Shorthand link the `resolvedQuery`
    app.userInput = request.body.result.resolvedQuery;
    // Shorthand link the screen surface capability boolean
    app.hasScreen = app.hasSurfaceCapability(
      app.SurfaceCapabilities.SCREEN_OUTPUT);
    // Shorthand link the audio surface capability boolean
    app.hasAudio = app.hasSurfaceCapability(
      app.SurfaceCapabilities.AUDIO_OUTPUT);

    /**
     * Get an argument as string. This simply ensures the response is expressed
     * as a string instead of an array. It is only to be used when expecting
     * a string response instead of an array (or we only care about the first
     * item in the array)
     *
     * @param {String} arg the argument string to find
     * @return {String} returns a string
     */
    app.getArgumentString = (arg) => {
      const argResponse = app.getArgument(arg);

      if (argResponse === null || argResponse === undefined) return '';
      if (Array.isArray(argResponse)) {
        if (!argResponse.length) return '';
        return argResponse[0];
      }

      return argResponse;
    };

    /**
     * Restores the contexts to prevent expiration. If no context array
     * is provided, it will restore the current contexts. If an array of
     * contexts is provided it will restore from array
     *
     * @param {Array} contextList (optional) the custom list of contexts
     * @return {Array} the array of contexts that were set
     *
     * TODO maybe rename this to reflect what it does more accurately?
     */
    app.restoreContexts = (contextList) => {
      const contexts = Array.isArray(contextList)
        ? contextList
        : app.getContexts();

      for (let i = 0, len = contexts.length; i < len; i += 1) {
        const context = contexts[i];
        app.setContext(context.name, context.lifespan + 1, context.parameters);
      }

      return contexts;
    };

    return app;
  }
}

module.exports = App;
