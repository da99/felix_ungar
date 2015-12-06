"use strict";

var _ = require('lodash');

if (typeof console !== "undefined" && console.log)
  var log = function () { return console.log.apply(console, arguments); };

var Felix_Ungar = function () {

  const System = {
    funcs : []
  };

  const TO_STRING       = Felix_Ungar.TO_STRING;
  const FINITE_NUMBER   = Felix_Ungar.FINITE_NUMBER;
  const STRING          = Felix_Ungar.STRING;
  const FUNC            = Felix_Ungar.FUNC;
  const ARRAY_TO_OBJECT = Felix_Ungar.ARRAY_TO_OBJECT;
  const ARRAY           = Felix_Ungar.ARRAY;
  const OBJECT          = Felix_Ungar.OBJECT;

  const func = function(raw_name, raw_func) {
    let args = ARRAY_TO_OBJECT("name", "func", arguments);
    let name = args.name();
    let func = args.func();

    var meta = {
      name: name,
      accepts: [],
      examples: [],
      does: null,
      returns: null
    };

    System.funcs.push(meta);

    var instance = {

      accepts : function (func) {
        let args = ARRAY_TO_OBJECT("func", arguments);
        let f    = FUNC("func", args.func());
        meta.accepts.push({func: f});
        return instance;
      },

      example : function () {
        meta.examples.push(_.toArray(arguments));
        return instance;
      },

      returns: function (func) {
        meta.returns = ARRAY_TO_OBJECT("func", arguments).func();
        return null;
      }

    }; // === var instance

    meta.does = FUNC("does", func(instance));

    return function () {
      let args = _.toArray(arguments);
      let targets = _.filter(System.funcs, function (meta) {
        return args_match_func(name, args, meta);
      });

      if (_.isEmpty(targets))
        throw new Error(`Function not found: ${name}`);

      if (targets.length != 1)
        throw new Error(`Too many functions found for: ${name}`);

      return targets[0].does.apply(null, arguments);
    };

  }; // === func

  var args_match_func = function (raw_name, raw_args, raw_meta) {
    let o    = ARRAY_TO_OBJECT("name", "args", "meta", arguments);
    let name = STRING("name", o.name());
    let args = ARRAY("args", o.args());
    let meta = OBJECT("meta", o.meta());

    if (meta.name !== name)
      return false;

    if (args.length !== meta.accepts.length)
      return false;
    var i = 0;

    while (meta.accepts[i]) {
      if (!meta.accepts[i].func(args[i]))
        return false;
      i = i + 1;
    }

    return true;
  }; // === func

  var correct = function () {
    return true;
    var raw_args = _.toArray(arguments);
    var System   = raw_args.shift();
    var code     = raw_args;

    var i = 0, name = null, args = null;
    while (code[i]) {
      name = code[i]; i = i + 1;
      args = code[i]; i = i + 1;
      if (!_.isArray(args))
        throw new Error("Must be Array: " + args.toString());

    }
  }; // === func

  var run = function () {
    var raw_args = _.toArray(arguments);
    var System   = raw_args.shift();
    var code     = raw_args;

    var i = 0, name = null, args = null;
    while (code[i]) {
      name = code[i]; i = i + 1;
      args = code[i]; i = i + 1;
      if (!_.isArray(args))
        throw new Error("Must be Array: " + args.toString());
    }

    return {stack: ["not done"]};
  }; // === func

  return {
    correct: correct, func: func, System: System,
    ARRAY_TO_OBJECT: ARRAY_TO_OBJECT,
    FINITE_NUMBER:   FINITE_NUMBER
  };
}; // == Felix_Ungar

Felix_Ungar.TO_STRING = function (val) {
  if (val === undefined)
    return "undefined";
  return val.toString();
}; // === func

Felix_Ungar.FINITE_NUMBER = function (name, val) {
  if (!_.isFinite(val))
    throw new Error(`:${name} must be a finite Number: ${Felix_Ungar.TO_STRING(val)}`);
  return val;
};

Felix_Ungar.STRING = function (name, val) {
  if (!_.isString(val))
    throw new Error(`:${name} must be a String: ${Felix_Ungar.TO_STRING(val)}`);
  return val;
};

Felix_Ungar.FUNC = function (name, val) {
  if (!_.isFunction(val))
    throw new Error(`:${name} must be a Function: ${Felix_Ungar.TO_STRING(val)}`);
  return val;
};

Felix_Ungar.ARRAY_TO_OBJECT = function () {
  let names = _.toArray(arguments);
  let vals  = names.pop();
  if (_.isArguments(vals))
    vals = _.toArray(vals);

  if (!_.isArray(vals))
    throw new Error(`value must be an Array for (${Felix_Ungar.TO_STRING(names)}): ${Felix_Ungar.TO_STRING(vals)}`);

  if (names.length != vals.length)
    throw new Error(`Only ${names.length} arguments allowed: ${names.toString()} vals: ${Felix_Ungar.TO_STRING(vals)}`);

  return _.reduce(names, function (acc, name, i) {
    acc[name] = function() { return vals[i]; };
    return acc;
  }, {});
}; // === func

Felix_Ungar.ARRAY = function (name, val) {
  if (_.isArguments(val))
    val = _.toArray(val);
  if (!_.isArray(val))
    throw new Error(`:${name} must be a Function: ${Felix_Ungar.TO_STRING(val)}`);
  return val;
};

Felix_Ungar.OBJECT = function (name, val) {
  if (!_.isPlainObject(val))
    throw new Error(`:${name} must be a plain Object: ${Felix_Ungar.TO_STRING(val)}`);
  return val;
}; // === func


var FU   = new Felix_Ungar();
const A = {
  String : function (min, max) {
    return function (val) {
      if (!_.isString(val))
        return false;
      if (val.length < min)
        return false;
      if (val.length > max)
        return false;
      return true;
    };
  },

  Number : function (state, val) {
    if (!_.isNumber(val) && !_.isNaN(val))
      return false;

    return {
      value : function () { return val; }
    };
  },

  Finite_Number : function (raw_min, raw_max) {
    let o = FU.ARRAY_TO_OBJECT("min", "max", arguments);
    let min = FU.FINITE_NUMBER("min", o.min());
    let max = FU.FINITE_NUMBER("max", o.max());
    return function (val) { return _.isFinite(val) && val >= min && val <= max; };
  }
}; // const A


var func = FU.func;

var sum = func("sum", function (f) {
  f
  .example(0, 1, 1)
  .example(1, 1, 2)
  .example(-2, -4, -6)
  .accepts(A.Finite_Number(-100, 100))
  .accepts(A.Finite_Number(-100, 100))
  .returns(A.Finite_Number(-200, 200));

  return function (x, y) {
    return x + y;
  };
});

var sum_strings = func("sum_strings", function (f) {
  f
  .example(["1", -1, "1-1"])
  .example(["2",  3, "23"])
  .accepts(A.String(1, 10))
  .accepts(A.Finite_Number(1, 10))
  .returns(A.String(1, 20));

  return function (x, y) { return x + y;};
});

FU.correct();
console.log(
  sum_strings("2",1),
  sum(1,2)
);


