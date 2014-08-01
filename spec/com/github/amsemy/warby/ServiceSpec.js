(function(ns, Backbone, sinon) {

    'use strict';

    var unit = ns.unit('com.github.amsemy.warby.ServiceSpec', implementation);

    unit.require('com.github.amsemy.warby.Service');
    unit.require('com.github.amsemy.warby.template');

    function implementation(units) {
        var Service = units.com.github.amsemy.warby.Service,
            template = units.com.github.amsemy.warby.template;

        var url = template.url;

        describe("com.github.amsemy.warby.Service", function() {

            describe("apply", function() {

                var testService, fooSpy;

                beforeEach(function() {
                    fooSpy = sinon.spy();
                    testService = new Service();
                    testService.api = {
                        foo: {
                            func: fooSpy
                        },
                        bar: {
                            func: function() {
                                return "result of bar";
                            }
                        }
                    };
                });

                it("должна вызывать функцию сервиса", function() {
                    var args = [1, "2", {}];
                    testService.apply("foo", args);
                    expect(fooSpy.called).toBeTruthy();
                    expect(fooSpy.firstCall.args).toEqual(args);
                });

                it("должна возвращать результат функции сервиса", function() {
                    expect(testService.apply("bar"))
                        .toBe(testService.api.bar.func());
                });

            });

            describe("call", function() {

                var testService, fooSpy;

                beforeEach(function() {
                    fooSpy = sinon.spy();
                    testService = new Service();
                    testService.api = {
                        foo: {
                            func: fooSpy
                        },
                        bar: {
                            func: function() {
                                return "result of bar";
                            }
                        }
                    };
                });

                it("должна вызывать функцию сервиса", function() {
                    var args = [1, "2", {}];
                    testService.call("foo", args[0], args[1], args[2]);
                    expect(fooSpy.called).toBeTruthy();
                    expect(fooSpy.firstCall.args).toEqual(args);
                });

                it("должна возвращать результат функции сервиса", function() {
                    expect(testService.call("bar"))
                        .toBe(testService.api.bar.func());
                });

            });

            describe("persist", function() {

                var testService, fooSpy, syncStub;

                beforeEach(function() {
                    fooSpy = sinon.spy();
                    syncStub = sinon.stub(Service, "sync");
                    testService = new Service();
                });

                afterEach(function() {
                    syncStub.restore();
                });

                it("должна связывать синхронизацию модели/коллекции с сервисом", function() {
                    var model = new Backbone.Model();
                    testService.persist(model);
                    model.sync();
                    expect(model.service).toBe(testService);
                    expect(syncStub.called).toBeTruthy();
                });

            });

            describe("sync", function() {

                var TestModel = Backbone.Model.extend({
                        apiMapping: {
                            read: "foo",
                            update: "bar"
                        }
                    });

                var TestCollection = Backbone.Collection.extend({
                        model: TestModel,
                        apiMapping: {
                            read: "foo"
                        }
                    });

                var testService, server, reqNo,
                    doneSpy, failSpy, successSpy, errorSpy;

                function checkRequest(method, url, body) {
                    reqNo++;
                    server.respondWith(method, url, body);
                    server.respond();
                    expect(server.requests[reqNo].method).toBe(method);
                    var expectedUrl = server.requests[reqNo].url.split("?"),
                        actualUrl = url.split("?");
                    expect(actualUrl[0]).toBe(expectedUrl[0]);
                    expect(actualUrl.length).toBe(expectedUrl.length);
                    if (actualUrl.length === 2) {
                        expect(form2js(actualUrl[1]))
                            .toEqual(form2js(expectedUrl[1]));
                    }
                }

                function checkSpies() {
                    expect(doneSpy.called).toBeTruthy();
                    expect(failSpy.called).toBeFalsy();
                    expect(successSpy.called).toBeTruthy();
                    expect(errorSpy.called).toBeFalsy();
                }

                function resetSpies() {
                    doneSpy.reset();
                    failSpy.reset();
                    successSpy.reset();
                    errorSpy.reset();
                }

                beforeEach(function() {
                    testService = new Service();
                    testService.url = url("/test-service");
                    testService.api = {
                        foo: {
                            type: "GET",
                            path: "foo"
                        },
                        bar: {
                            type: "POST",
                            path: "bar"
                        }
                    };
                    server = sinon.fakeServer.create();
                    reqNo = -1;
                    doneSpy = sinon.spy();
                    failSpy = sinon.spy();
                    successSpy = sinon.spy();
                    errorSpy = sinon.spy();
                });

                afterEach(function() {
                    server.restore();
                });

                it("должна делать запрос с настройками, зависищими от метода синхронизации Backbone-модели", function() {
                    var model = new TestModel();
                    testService.persist(model);
                    var collection = new TestCollection();
                    testService.persist(collection);

                    //--------------------------------------------------------

                    model.fetch({
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/foo"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    collection.fetch({
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/foo"),
                            getCollectionResp());
                    checkSpies();
                });

                it("должна передавать модель/коллекцию в формате JSON при POST, PUT и PATCH запросах", function() {
                    var model = new TestModel({
                        id: 1,
                        foo: "Foo",
                        bar: {
                            qux: "Qux"
                        },
                        baz: [
                            "Baz1",
                            "Baz2"
                        ]
                    });
                    testService.persist(model);

                    //--------------------------------------------------------

                    model.save(null, {
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("POST", url("/test-service/bar"),
                            getModelResp());
                    expect(JSON.parse(server.requests[reqNo].requestBody))
                        .toEqual(model.toJSON());
                    checkSpies();
                });

                it("должна передавать `options.data` в формате x-www-form-urlencoded", function() {
                    var model = new TestModel({
                        id: 1
                    });
                    testService.persist(model);

                    //--------------------------------------------------------

                    model.save(null, {
                            data: {
                                foo: "Foo",
                                bar: {
                                    qux: "Qux"
                                },
                                baz: [
                                    "Baz1",
                                    "Baz2"
                                ]
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("POST", url("/test-service/bar"),
                            getModelResp());
                    expect(form2js(server.requests[reqNo].requestBody))
                        .toEqual({
                            foo: ["Foo"],
                            "bar[qux]": ["Qux"],
                            "baz[]": ["Baz1", "Baz2"]
                        });
                    checkSpies();
                });

                it("настройки синхронизационного запроса можно переопределить через `options.func`, указав имя нужной функции сервиса", function() {
                    var model = new TestModel();
                    testService.persist(model);
                    var collection = new TestCollection();
                    testService.persist(collection);

                    //--------------------------------------------------------

                    model.fetch({
                            func: "bar",
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("POST", url("/test-service/bar"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    collection.fetch({
                            func: "bar",
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("POST", url("/test-service/bar"),
                            getCollectionResp());
                    checkSpies();
                });

                it("должна подставлять аттрибуты в шаблон адреса запроса", function() {
                    testService.api.baz = {
                        type: "GET",
                        path: "baz/{a}/{b}"
                    };
                    testService.api.qux = {
                        type: "GET",
                        path: "qux/{c.d}"
                    };
                    var model1 = new TestModel({
                        a: 123,
                        b: "abc",
                        c: {d: "D1"}
                    });
                    testService.persist(model1);
                    var model2 = new TestModel({
                        a: 456
                    });
                    testService.persist(model2);
                    var collection = new TestCollection();
                    testService.persist(collection);

                    //--------------------------------------------------------

                    model1.fetch({
                            func: "baz",
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/baz/123/abc"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    model1.fetch({
                            func: "qux",
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/qux/D1"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    model2.fetch({
                            func: "baz",
                            attrs: {
                                b: "def",
                                c: {d: "D1"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/baz/456/def"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    model2.fetch({
                            func: "qux",
                            attrs: {
                                b: "def",
                                c: {d: "D2"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/qux/D2"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    collection.fetch({
                            func: "baz",
                            attrs: {
                                a: 789,
                                b: "ghi",
                                c: {d: "D3"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/baz/789/ghi"),
                            getCollectionResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    collection.fetch({
                            func: "qux",
                            attrs: {
                                a: 789,
                                b: "ghi",
                                c: {d: "D3"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/qux/D3"),
                            getCollectionResp());
                    checkSpies();
                });

                it("должна подставлять аттрибуты модели, имена которых указаны в поле `params` в виде списка, как параметры запроса", function() {
                    testService.api.baz = {
                        type: "GET",
                        path: "baz",
                        params: ["a", "b"]
                    };
                    testService.api.qux = {
                        type: "GET",
                        path: "qux",
                        params: ["c.d"]
                    };
                    var model1 = new TestModel({
                        a: 123,
                        b: "abc",
                        c: {d: "D1"}
                    });
                    testService.persist(model1);
                    var model2 = new TestModel({
                        a: 456
                    });
                    testService.persist(model2);
                    var collection = new TestCollection();
                    testService.persist(collection);

                    //--------------------------------------------------------

                    model1.fetch({
                            func: "baz",
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/baz?a=123&b=abc"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    model1.fetch({
                            func: "qux",
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/qux?c%5Bd%5D=D1"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    model2.fetch({
                            func: "baz",
                            attrs: {
                                b: "def",
                                c: {d: "D2"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/baz?a=456&b=def"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    model2.fetch({
                            func: "qux",
                            attrs: {
                                b: "def",
                                c: {d: "D2"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/qux?c%5Bd%5D=D2"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    collection.fetch({
                            func: "baz",
                            attrs: {
                                a: 789,
                                b: "ghi"
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/baz?a=789&b=ghi"),
                            getCollectionResp());
                    checkSpies();
                    //--------------------------------------------------------

                    collection.fetch({
                            func: "qux",
                            attrs: {
                                a: 789,
                                b: "ghi",
                                c: {d: "D3"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/qux?c%5Bd%5D=D3"),
                            getCollectionResp());
                    checkSpies();
                });

                it("должна подставлять аттрибуты модели, имена которых указаны в поле `params` в виде карты, как параметры запроса", function() {
                    testService.api.baz = {
                        type: "GET",
                        path: "baz",
                        params: {
                            a: "a",
                            b: "bbb"
                        }
                    };
                    testService.api.qux = {
                        type: "GET",
                        path: "qux",
                        params: {
                            "c.d": "c.d",
                            "e.f": "e-f"
                        }
                    };
                    var model1 = new TestModel({
                        a: 123,
                        b: "abc",
                        c: {d: "D1"},
                        e: {f: "F1"}
                    });
                    testService.persist(model1);
                    var model2 = new TestModel({
                        a: 456
                    });
                    testService.persist(model2);
                    var collection = new TestCollection();
                    testService.persist(collection);

                    //--------------------------------------------------------

                    model1.fetch({
                            func: "baz",
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/baz?a=123&bbb=abc"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    model1.fetch({
                            func: "qux",
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/qux?c.d=D1&e-f=F1"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    model2.fetch({
                            func: "baz",
                            attrs: {
                                b: "def",
                                c: {d: "D2"},
                                e: {f: "F2"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/baz?a=456&bbb=def"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    model2.fetch({
                            func: "qux",
                            attrs: {
                                b: "def",
                                c: {d: "D2"},
                                e: {f: "F2"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/qux?c.d=D2&e-f=F2"),
                            getModelResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    collection.fetch({
                            func: "baz",
                            attrs: {
                                a: 789,
                                b: "ghi",
                                c: {d: "D3"},
                                e: {f: "F3"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/baz?a=789&bbb=ghi"),
                            getCollectionResp());
                    checkSpies();
                    resetSpies();

                    //--------------------------------------------------------

                    collection.fetch({
                            func: "qux",
                            attrs: {
                                a: 789,
                                b: "ghi",
                                c: {d: "D3"},
                                e: {f: "F3"}
                            },
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    checkRequest("GET", url("/test-service/qux?c.d=D3&e-f=F3"),
                            getCollectionResp());
                    checkSpies();
                });

                it("должна корректно обрабатывать неудачный ответ сервера", function() {
                    var model = new TestModel();
                    testService.persist(model);

                    //--------------------------------------------------------

                    model.fetch({
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    server.respondWith(getFailureResp());
                    server.respond();

                    expect(doneSpy.called).toBeTruthy();
                    expect(failSpy.called).toBeFalsy();
                    expect(successSpy.called).toBeFalsy();
                    expect(errorSpy.called).toBeTruthy();

                    resetSpies();

                    //--------------------------------------------------------

                    model.fetch({
                            success: successSpy,
                            error: errorSpy
                        })
                        .done(doneSpy)
                        .fail(failSpy);

                    server.respondWith(getInvalidResp());
                    server.respond();

                    expect(doneSpy.called).toBeTruthy();
                    expect(failSpy.called).toBeFalsy();
                    expect(successSpy.called).toBeFalsy();
                    expect(errorSpy.called).toBeTruthy();
                });

            });

            describe("проверка совместимости Backbone.ajax", function() {

                var server;

                beforeEach(function() {
                    server = sinon.fakeServer.create();
                });

                afterEach(function() {
                    server.restore();
                });

                function ajax(url, data) {
                    Backbone.ajax({
                        url: url,
                        data: data
                    });
                }

                it("если URL уже содержит `?`, то параметры подставлять начиная с `&`", function() {
                    ajax("foo", {});
                    expect(server.requests[0].url).toBe("foo");

                    ajax("foo", {a: 1});
                    expect(server.requests[1].url)
                        .toBe("foo?a=1");

                    ajax("foo&", {a: 1});
                    expect(server.requests[2].url)
                        .toBe("foo&?a=1");

                    ajax("foo?", {a: 1});
                    expect(server.requests[3].url)
                        .toBe("foo?&a=1");

                    ajax("foo?bar", {a: 1});
                    expect(server.requests[4].url)
                        .toBe("foo?bar&a=1");

                    ajax("foo?&", {a: 1});
                    expect(server.requests[5].url)
                        .toBe("foo?&&a=1");
                });

            });

        });

        // Конвертирует строку с параметрами x-www-form-urlencoded формы в
        // JavaScript-объект.
        function form2js(formStr) {
            var result = {};
            var fields = formStr.split("&");
            for (var i = 0, il = fields.length; i < il; i++) {
                var field = fields[i].split("=");
                var key = decodeURIComponent(field[0].replace(/\+/g, "%20"));
                var val = (field.length === 2
                    ? decodeURIComponent((field[1]).replace(/\+/g, "%20"))
                    : null);
                if (!result.hasOwnProperty(key)) {
                    result[key] = [];
                }
                result[key].push(val);
            }
            return result;
        }

        function getCollectionResp() {
            return JSON.stringify({
                data: [
                    {id: 1},
                    {id: 2},
                    {id: 3}
                ],
                status: "SUCCESS"
            });
        }

        function getFailureResp() {
            return JSON.stringify({
                status: "FAILURE"
            });
        }

        function getInvalidResp() {
            return JSON.stringify({
                errors: [
                    "Validation error"
                ],
                status: "INVALID"
            });
        }

        function getModelResp() {
            return JSON.stringify({
                data: {
                    id: 1
                },
                status: "SUCCESS"
            });
        }

    }

})(gumup, Backbone, sinon);
