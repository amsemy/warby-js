'use strict';

var Backbone = require("backbone");
var ValidityStatus = require("./ValidityStatus");

var email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Валидируемая форма
// ------------------
module.exports = Backbone.Model.extend({

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
                if (resp && resp.errors) {
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
        return this.makeValidation(keypath, email.test(value));
    },

    // Убеждается, что условие истинно и обновляет статус проверки
    // валидности поля.
    makeValidation: function(keypath, condition) {
        this.validityStatus.set(keypath, !condition);
        return condition;
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
