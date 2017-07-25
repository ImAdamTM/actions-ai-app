// SSML

const { random } = require('./util/random');

/**
 * The SSML class manages the generation of SSML based output from a series
 * of available input commands.
 */
class SSML {
  /**
   * Constructor
   * @param {Array} initial the initial string array of outputs to populate with
   */
  constructor(initial = []) {
    this.phrases = initial;
  }

  /**
   * Sets the SSML content to the supplied data, overwriting anything that came
   * before it.
   * @param {Mixed} input the input content
   */
  set(input, props) {
    this.phrases = [];

    return this.add(input, props);
  }

  /**
   * add - Add a phrase to the SSML output.
   *
   * @param  {Mixed} item either a string or an array of phrases
   * @param {Object} props The `props` allows for additional optional
   * parameters to be sent, these include:
   *
   * repeat - Whether the output should be spoken when an action is
   * repeated (either by fallback or user prompting it). Default is true
   *
   * fallback - Whether the output should only be said upon fallback
   * (when the user response was not understood the first time). Default
   * is false
   *
   * random - Indicates the `item` is an array of possible text outputs,
   * every time that it is spoken a random item is picked. Including when
   * the output is repeated
   */
  add(input, props) {
    const opts = Object.assign({
      repeat: null,
      fallback: null,
      random: null,
    }, props);

    /* istanbul ignore else */
    if (typeof input === 'string') {
      this.phrases.push({
        output: input,
        repeat: opts.repeat,
        fallback: opts.fallback,
      });
    } else if (Array.isArray(input)) {
      if (opts.random) {
        this.phrases.push({
          output: input,
          repeat: opts.repeat,
          fallback: opts.fallback,
          random: true,
        });
      } else {
        for (let i = 0, len = input.length; i < len; i += 1) {
          if (typeof input[i] === 'string') {
            this.phrases.push({
              output: input[i],
              repeat: opts.repeat,
              fallback: opts.fallback,
              random: false,
            });
          } else {
            let repeat = true;

            if (opts.repeat !== null) {
              repeat = input[i].repeat === false ? false : opts.repeat;
            } else if (input[i].repeat !== null) {
              repeat = input[i].repeat;
            }

            this.phrases.push({
              output: input[i].output,
              repeat,
              fallback: opts.fallback !== null ?
                opts.fallback :
                input[i].fallback || false,
              random: opts.random !== null ?
                opts.random :
                input[i].random || false,
            });
          }
        }
      }
    } else if (input instanceof SSML) {
      // If is an SSML instance
      this.add(input.list(), props);
    }

    return this;
  }

  /**
   * audio - description
   *
   * @param  {String} url the absolute path to the audio clip
   * @param  {Object} props optional properties
   */
  audio(url, props) {
    const opts = Object.assign({ fallbackText: '' }, props);
    this.add(`<audio src="${url}">${opts.fallbackText}</audio>`, opts);

    return this;
  }

  /**
   * Add a pause to the SSML speech output
   *
   * @param  {Number} time the duration of the pause, in seconds
   */
  pause(time = 1, props) {
    this.add(`<break time="${time}s"/>`, props);

    return this;
  }

  /**
   * Returns the list of phrases that have been added
   *
   * @return {Array} the phrases
   */
  list() {
    return this.phrases;
  }

  /**
   * Filter repeatable items from the phrases list
   *
   * @param {Array} input the input content
   */
  filterRepeatable(input) {
    const final = [];
    let list;

    if (Array.isArray(input)) {
      list = input;
    } else if (input instanceof SSML) {
      list = input.list();
    }

    if (!Array.isArray(list)) return input;

    for (let i = 0, len = list.length; i < len; i += 1) {
      const item = Object.assign({}, list[i]);
      /* istanbul ignore next */
      if (item.output.indexOf('<break time') === 0 &&
          (item.repeat || (item.repeat === null ||
            item.repeat === undefined))) {
        final.push({
          output: '<break time="0.5s"/>',
          repeat: item.repeat,
          random: item.random,
        });
      } else if (item.repeat || (item.repeat === null ||
        item.repeat === undefined) || item.fallback) {
        if (item.fallback) item.fallback = false;
        final.push(item);
      }
    }

    return final;
  }

  /**
   * Output the SSML
   */
  output() {
    const final = [];

    for (let i = 0, len = this.phrases.length; i < len; i += 1) {
      if (!this.phrases[i].fallback) {
        if (this.phrases[i].random) {
          final.push(random(this.phrases[i].output));
        } else {
          final.push(this.phrases[i].output);
        }
      }
    }

    return `<speak>${final.join(' ')}</speak>`;
  }
}

module.exports = SSML;
