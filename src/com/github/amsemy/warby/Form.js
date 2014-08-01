(function(ns) {

    'use strict';

    var unit = ns.unit('com.github.amsemy.warby.Form', implementation);

    unit.require('com.github.amsemy.warby.ValidityStatus');
    unit.require('com.github.amsemy.warby.response.InvalidResponse');
    unit.require('lib.*');

    function implementation(units) {
        var Backbone = units.lib.Backbone;
        var InvalidResponse = units.com.github.amsemy.warby.response.InvalidResponse,
            ValidityStatus = units.com.github.amsemy.warby.ValidityStatus;

        var email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        // Валидируемая форма
        // ------------------
        return Backbone.Model.extend({

            // Инициализация модели.
            constructor: function() {
                Backbone.Model.apply(this, arguments);
                var self = this;

                // Обрабатывать изменение каждого поля формы отдельно.
                for (var key in this.attributes) {
                    this.on("change:" + key, getChangeHandler(key));
                }

                // Ошибки валидации из ответа сервиса.
                this.errors = {};

                // Обработчики событий синхронизации модели с сервером.
                this.handlers = {
                    error: function(resp) {
                        if (resp instanceof InvalidResponse) {
                            self.errors = resp.errors;
                            self.validityStatus.loadErrors(
                                    "serviceValidity", resp.errors);
                        } else {
                            self.errors = {};
                            self.validityStatus.set("serviceError", true);
                        }
                    }
                };

                // Статус валидации формы.
                this.validityStatus = new ValidityStatus();
            },

            // Убеждается, что значение является корректным email-адресом.
            assertEmail: function(keypath, value) {
                return this.assertTrue(keypath, email.test(value));
            },

            // Убеждается, что условие истинно и обновляет статус проверки
            // валидности поля.
            assertTrue: function(keypath, condition) {
                if (condition) {
                    this.makeValid(keypath);
                } else {
                    this.makeInvalid(keypath);
                }
                return condition;
            },

            // Делает статус проверки валидности поля неудачным.
            makeInvalid: function(keypath) {
                this.validityStatus.set(keypath, true);
            },

            // Делает статус проверки валидности поля успешным.
            makeValid: function(keypath) {
                this.validityStatus.set(keypath, false);
            },

            // Валидирует форму.
            // см. Backbone.Model.prototype.validate
            validate: function() {
                this.validityStatus.removeErrors(
                        ["serviceError", "serviceValidity"]);
                this.errors = {};
                if (this.validityStatus.status.__self__.invalid) {
                    return "Form is invalid";
                }
            }

        });

        function getChangeHandler(key) {
            return function(model, value, options) {
                var attrs = {};
                attrs[key] = value;
                model.validate(attrs, options);
            };
        }

    }

})(gumup);
