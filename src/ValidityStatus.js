'use strict';

var _ = require("underscore"),
    Backbone = require("backbone");

// Статус валидации
// ----------------
var ValidityStatus = function() {

    // Упрощённая модель статуса валидации формы для связывания с
    // представлением при помощи Rivets.
    this.model = new Backbone.Model({
        $invalid: false,
        $valid: true
    });

    // Статус валидации полей.
    //
    //  status: {
    //      __self__: [
    //          hasErrA: true,
    //          hasErrB: false,
    //          invalid: true,
    //          valid: false
    //      ],
    //      foo: {
    //          __self__: [
    //              hasErrС: false,
    //              invalid: false,
    //              valid: true
    //          ],
    //          bar: {
    //              __self__: [
    //                  hasErrD: true,
    //                  invalid: true,
    //                  valid: false
    //              ]
    //          }
    //      }
    //  }
    this.status = {
        __self__: {
            invalid: false,
            valid: true
        }
    };
};

// Для полей, перечисленных в ошибках `errors`, выставляет флаг
// невалидности с именем `flag`. Если указан путь `base`, то он будет
// добавлен к названию полей ошибок.
ValidityStatus.prototype.loadErrors = function(flag, errors, base) {
    var path = [],
        stack = [this.status];
    if (base != null) {
        var keys = base.split(".");
        for (var i = 0, il = keys.length; i < il; i++) {
            var key = keys[i];
            if (key === "") {
                throw new Error("Invalid base '" + base + "'");
            } else if (key === "__self__") {
                throw new Error("Mustn't use '__self__' in base '"
                        + base + "'");
            }
            var val = stack[i];
            val[key] = val[key] || {};
            stack.push(val[key]);
            path.push(key);
        }
    }
    loadErrors(this, flag, stack.pop(), errors,
            path.length ? path.join("_") + "_" : "");
    for (i = path.length - 1; i >= 0; i--) {
        updateValidity(this, stack[i],
                i ? path.slice(0, i).join("_") + "_" : "");
    }
};

// Убирает у всех полей флаги невалидности `flags`. Если указан путь
// `base`, то обработаны будут только те поля, которые расположены по
// этому пути.
ValidityStatus.prototype.removeErrors = function(flags, base) {
    var path = [],
        stack = [this.status];
    if (!_.isArray(flags)) {
        flags = [flags];
    }
    if (base != null) {
        var keys = base.split(".");
        for (var i = 0, il = keys.length; i < il; i++) {
            var key = keys[i];
            if (key === "") {
                throw new Error("Invalid base '" + base + "'");
            } else if (key === "__self__") {
                throw new Error("Mustn't use '__self__' in base '"
                        + base + "'");
            }
            var val = stack[i];
            val[key] = val[key] || {};
            stack.push(val[key]);
            path.push(key);
        }
    }
    removeErrors(this, flags, stack.pop(),
            path.length ? path.join("_") + "_" : "");
    for (i = path.length - 1; i >= 0; i--) {
        updateValidity(this, stack[i],
                i ? path.slice(0, i).join("_") + "_" : "");
    }
};

// Устанавливает значение флага проверки валидности поля и рекурсивно
// обновляет статус валидации родительских полей.
ValidityStatus.prototype.set = function(keypath, status) {
    var keys = keypath.split("."),
        path = [],
        stack = [this.status];
    for (var i = 0, il = keys.length; i < il; i++) {
        var key = keys[i];
        if (key === "") {
            throw new Error("Invalid keypath '" + keypath + "'");
        } else if (key === "__self__") {
            throw new Error("Mustn't use '__self__' in keypath '"
                    + keypath + "'");
        }
        var val = stack[i];
        if (i + 1 === il) {
            val.__self__ = val.__self__ || {};
            val.__self__[key] = status;
            this.model.set(
                    (i ? path.join("_") + "_$" : "$") + key,
                    status);
            break;
        } else {
            val[key] = val[key] || {};
        }
        stack.push(val[key]);
        path.push(key);
    }
    for (i = stack.length - 1; i >= 0; i--) {
        updateValidity(this, stack[i],
                i ? path.slice(0, i).join("_") + "_" : "");
    }
};

function loadErrors(vs, flag, val, err, attrpref) {
    for (var key in err) {
        if (key === "__self__") {
            if (err.__self__.length) {
                val.__self__ = val.__self__ || {};
                val.__self__[flag] = true;
                vs.model.set(attrpref + "$" + flag, true);
            }
        } else {
            val[key] = val[key] || {};
            loadErrors(vs, flag, val[key], err[key],
                    attrpref + key + "_");
        }
    }
    updateValidity(vs, val, attrpref);
}

function removeErrors(vs, flags, val, attrpref) {
    for (var key in val) {
        if (key === "__self__") {
            for (var i = flags.length - 1; i >= 0; i--) {
                var flag = flags[i];
                delete val.__self__[flag];
                vs.model.unset(attrpref + "$" + flag);
            }
        } else if (_.isObject(val[key])) {
            removeErrors(vs, flags, val[key], attrpref + key + "_");
        }
    }
    updateValidity(vs, val, attrpref);
}

function updateValidity(vs, val, attrpref) {
    var key,
        valid = true;
    val.__self__ = val.__self__ || {};
    for (key in val.__self__) {
        if (key !== "invalid" && key !== "valid"
                && val.__self__[key]) {
            valid = false;
        }
    }
    if (valid) {
        for (key in val) {
            if (key !== "__self__"
                    && val[key].__self__.invalid) {
                valid = false;
            }
        }
    }
    val.__self__.invalid = !valid;
    val.__self__.valid = valid;
    vs.model.set(attrpref + "$invalid", !valid);
    vs.model.set(attrpref + "$valid", valid);
}

module.exports = ValidityStatus;
