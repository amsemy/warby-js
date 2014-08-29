(function(ns) {

    'use strict';

    var unit = ns.unit('com.github.amsemy.warby.Service', implementation);

    unit.require('com.github.amsemy.warby.template');
    unit.require('lib.*');

    function implementation(units) {
        var Backbone = units.lib.Backbone,
            _ = units.lib._;
        var template = units.com.github.amsemy.warby.template;

        var Service = function() {};

        _.extend(Service.prototype, {

            // URL сервиса.
            url: null,

            // Хэш-коллекция методов сервиса.
            api: {},

            // Вызывает метод сервиса.
            apply: function(name, args) {
                var apiMethod = getApiMethod(this, name);
                if (apiMethod) {
                    return apiMethod.func.apply(this, args);
                }
            },

            // Создаёт обёртку для `options.success` и `options.error`, которая
            // будет парсить ответ сервера.
            bodyReader: null,

            // Связывает модель/коллекцию с сервисом.
            bind: function(model) {
                if (model) {
                    model.service = this;
                    model.sync = function() {
                        return Service.sync.apply(this, arguments);
                    };
                }
            },

            // Вызывает метод сервиса.
            call: function(name) {
                var apiMethod = getApiMethod(this, name);
                if (apiMethod) {
                    if (arguments.length > 1) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        return apiMethod.func.apply(this, args);
                    } else {
                        return apiMethod.func.call(this);
                    }
                }
            }

        });

        // Создаёт потомка сервиса.
        Service.extend = Backbone.Model.extend;

        // Синхронизирует модель/коллекцию.
        Service.sync = function(method, model, options) {
            options || (options = {});

            // Атрибуты модели. Для коллекции массив будет использован как
            // объект.
            var attrs = _.extend(model.toJSON(options), options.attrs);

            // Backbone при синхронизации передаёт параметр `method`. По нему
            // находим в `model.apiMapping` имя метода сервиса. Если при
            // синхронизации модели нужно использывать другой метод сервиса, то
            // его можно указать через `options.apiMethod`.
            if (options.apiMethod) {
                method = options.apiMethod;
            } else {
                method = getApiMethodName(model, method);
                if (!method) {
                    throw new Error("Unsupported sync method '" + method + "'");
                }
            }

            var apiMethod = getApiMethod(model.service, method);
            if (!apiMethod) {
                throw new Error("Unsupported API method '" + method + "'");
            }

            var type = apiMethod.type;

            // Получить URL с подстановкой аттрибутов модели в шаблон адреса
            // запроса.
            var url = getSyncUrl(model.service, attrs, apiMethod);

            // Добавить параметры запроса в URL.
            if (apiMethod.params) {
                url = template.url({
                    adr: url,
                    base: "",
                    params: getParamsObj(attrs, apiMethod.params)
                });
            }

            var defaults = {
                dataType: "json",
                type: type,
                url: url
            };

            // Ensure that we have the appropriate request data.
            if (options.data === undefined && model && (
                    type === "POST" || type === "PUT" || type === "PATCH")) {
                defaults.contentType = "application/json";
                defaults.data = JSON.stringify(
                        options.attrs || model.toJSON(options));
                defaults.processData = false;
            }

            // Извлечь результат запроса из контейнера.
            var bodyReader = (apiMethod.bodyReader !== undefined
                    ? apiMethod.bodyReader : model.service.bodyReader);
            if (bodyReader) {
                bodyReader.wrap(options);
            }

            // Make the request, allowing the user to override any Ajax options.
            var xhr = options.xhr = Backbone.ajax(_.extend(defaults, options));
            model.trigger("request", model, xhr, options);
            return xhr;
        };

        function copyObjectValue(src, dest, keypath) {
            var keys = keypath.split(".");
            for (var i = 0, il = keys.length; i < il; i++) {
                var key = keys[i];
                if (i === il - 1) {
                    dest[key] = src[key];
                } else {
                    dest[key] = dest[key] || {};
                    src = src[key];
                    dest = dest[key];
                }
            }
        }

        function getApiMethod(service, name) {
            if (service.api) {
                var apiMethod = service.api[name];
                if (!apiMethod) {
                    apiMethod = getApiMethod(
                            service.constructor.__super__, name);
                }
                return apiMethod;
            }
        }

        function getApiMethodName(model, method) {
            if (model.apiMapping) {
                var name = model.apiMapping[method];
                if (!name) {
                    name = getApiMethodName(
                            model.constructor.__super__, method);
                }
                return name;
            }
        }

        function getObjectValue(obj, keypath) {
            var keys = keypath.split(".");
            var val = obj;
            for (var i = 0, il = keys.length; i < il; i++) {
                val = val[keys[i]];
            }
            return val;
        }

        function getParamsObj(attrs, params) {
            var result = {};
            if (_.isArray(params)) {
                for (var i = 0, il = params.length; i < il; i++) {
                    copyObjectValue(attrs, result, params[i]);
                }
            } else {
                for (var key in params) {
                    result[params[key]] = getObjectValue(attrs, key);
                }
            }
            return result;
        }

        function getSyncUrl(service, attrs, apiMethod) {
            var syncUrl = service.url,
                path = apiMethod.path;
            if (path.length > 0) {
                if (syncUrl.charAt(syncUrl.length - 1) === "/") {
                    syncUrl = syncUrl.substring(0, syncUrl.length - 1);
                }
                var paths = path.split("/");
                for (var i = 0, il = paths.length; i < il; i++) {
                    var p = paths[i], q;
                    if (p.charAt(0) === "{"
                            && p.charAt(p.length - 1) === "}") {
                        q = getObjectValue(attrs, p.substring(1, p.length - 1));
                    } else {
                        q = p;
                    }
                    if (q.toString() !== "") {
                        syncUrl += "/" + encodeURIComponent(q);
                    }
                }
                if (path.charAt(path.length - 1) === "/") {
                    syncUrl += "/";
                }
            }
            return syncUrl;
        }

        return Service;
    }

})(gumup);
