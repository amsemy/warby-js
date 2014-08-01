(function(ns) {

    var unit = ns.unit('com.github.amsemy.warby.ValidityStatusSpec', implementation);

    unit.require('com.github.amsemy.warby.ValidityStatus');

    function implementation(units) {
        var ValidityStatus = units.com.github.amsemy.warby.ValidityStatus;

        function createBig() {
            var vs = new ValidityStatus;
            vs.set("errA", true);
            vs.set("errB", true);
            vs.set("errC", true);
            vs.set("foo.errA", true);
            vs.set("foo.errB", true);
            vs.set("foo.errC", true);
            vs.set("foo.baz.errA", true);
            vs.set("foo.baz.errB", true);
            vs.set("foo.baz.errC", true);
            vs.set("foo.qux.errA", true);
            vs.set("foo.qux.errB", true);
            vs.set("foo.qux.errC", true);
            vs.set("bar.errA", true);
            vs.set("bar.errB", true);
            vs.set("bar.errC", true);
            return vs;
        }

        function createBigModel() {
            return {
                $errA: true,
                $errB: true,
                $errC: true,
                $invalid: true,
                $valid: false,
                foo_$errA: true,
                foo_$errB: true,
                foo_$errC: true,
                foo_$invalid: true,
                foo_$valid: false,
                foo_baz_$errA: true,
                foo_baz_$errB: true,
                foo_baz_$errC: true,
                foo_baz_$invalid: true,
                foo_baz_$valid: false,
                foo_qux_$errA: true,
                foo_qux_$errB: true,
                foo_qux_$errC: true,
                foo_qux_$invalid: true,
                foo_qux_$valid: false,
                bar_$errA: true,
                bar_$errB: true,
                bar_$errC: true,
                bar_$invalid: true,
                bar_$valid: false
            };
        }

        function createBigStatus() {
            return {
                __self__: {
                    errA: true,
                    errB: true,
                    errC: true,
                    invalid: true,
                    valid: false
                },
                foo: {
                    __self__: {
                        errA: true,
                        errB: true,
                        errC: true,
                        invalid: true,
                        valid: false
                    },
                    baz: {
                        __self__: {
                            errA: true,
                            errB: true,
                            errC: true,
                            invalid: true,
                            valid: false
                        }
                    },
                    qux: {
                        __self__: {
                            errA: true,
                            errB: true,
                            errC: true,
                            invalid: true,
                            valid: false
                        }
                    }
                },
                bar: {
                    __self__: {
                        errA: true,
                        errB: true,
                        errC: true,
                        invalid: true,
                        valid: false
                    }
                }
            };
        }

        function createEmptyModel() {
            return {
                $invalid: false,
                $valid: true
            };
        }

        function createEmptyStatus() {
            return {
                __self__: {
                    invalid: false,
                    valid: true
                }
            };
        }

        function createSingle() {
            var vs = new ValidityStatus();
            vs.set("foo.bar.errA", true);
            return vs;
        }

        function createSingleModel() {
            return {
                $invalid: true,
                $valid: false,
                foo_$invalid: true,
                foo_$valid: false,
                foo_bar_$errA: true,
                foo_bar_$invalid: true,
                foo_bar_$valid: false
            };
        }

        function createSingleStatus() {
            return {
                __self__: {
                    invalid: true,
                    valid: false
                },
                foo: {
                    __self__: {
                        invalid: true,
                        valid: false
                    },
                    bar: {
                        __self__: {
                            errA: true,
                            invalid: true,
                            valid: false
                        }
                    }
                }
            };
        }

        function createSmall() {
            var vs = new ValidityStatus;
            vs.set("foo.errA", true);
            vs.set("foo.baz.errB", true);
            vs.set("foo.qux.errA", true);
            vs.set("bar.errC", true);
            return vs;
        }

        function createSmallModel() {
            return {
                $invalid: true,
                $valid: false,
                foo_$errA: true,
                foo_$invalid: true,
                foo_$valid: false,
                foo_baz_$errB: true,
                foo_baz_$invalid: true,
                foo_baz_$valid: false,
                foo_qux_$errA: true,
                foo_qux_$invalid: true,
                foo_qux_$valid: false,
                bar_$errC: true,
                bar_$invalid: true,
                bar_$valid: false
            };
        }

        function createSmallStatus() {
            return {
                __self__: {
                    invalid: true,
                    valid: false
                },
                foo: {
                    __self__: {
                        errA: true,
                        invalid: true,
                        valid: false
                    },
                    baz: {
                        __self__: {
                            errB: true,
                            invalid: true,
                            valid: false
                        }
                    },
                    qux: {
                        __self__: {
                            errA: true,
                            invalid: true,
                            valid: false
                        }
                    }
                },
                bar: {
                    __self__: {
                        errC: true,
                        invalid: true,
                        valid: false
                    }
                }
            };
        }

        describe("com.github.amsemy.warby.ValidityStatus", function() {

            var vs;

            beforeEach(function() {
                vs = new ValidityStatus();
            });

            describe("constructor", function() {

                it("по умолчанию статус должен быть валидным", function() {
                    expect(vs.model.toJSON()).toEqual(createEmptyModel());
                    expect(vs.status).toEqual(createEmptyStatus());
                });

            });

            describe("loadErrors", function() {

                it("должна загружать ошибки", function() {
                    var model, status;

                    var errors = {
                        __self__: ["common errors"],
                        foo: {
                            qux: {
                                __self__: ["foo.qux field errors"]
                            }
                        },
                        zep: {
                            __self__: ["zep field errors"],
                            dax: {
                                __self__: ["zep.dax field errors"]
                            },
                            mux: {
                                __self__: ["zep.mux field errors"]
                            }
                        }
                    };

                    vs.loadErrors('errL', errors);
                    model = {
                        $errL: true,
                        $invalid: true,
                        $valid: false,
                        foo_$invalid: true,
                        foo_$valid: false,
                        foo_qux_$errL: true,
                        foo_qux_$invalid: true,
                        foo_qux_$valid: false,
                        zep_$errL: true,
                        zep_$invalid: true,
                        zep_$valid: false,
                        zep_dax_$errL: true,
                        zep_dax_$invalid: true,
                        zep_dax_$valid: false,
                        zep_mux_$errL: true,
                        zep_mux_$invalid: true,
                        zep_mux_$valid: false
                    };
                    expect(vs.model.toJSON()).toEqual(model);
                    status = {
                        __self__: {
                            errL: true,
                            invalid: true,
                            valid: false
                        },
                        foo: {
                            __self__: {
                                invalid: true,
                                valid: false
                            },
                            qux: {
                                __self__: {
                                    errL: true,
                                    invalid: true,
                                    valid: false
                                }
                            }
                        },
                        zep: {
                            __self__: {
                                errL: true,
                                invalid: true,
                                valid: false
                            },
                            dax: {
                                __self__: {
                                    errL: true,
                                    invalid: true,
                                    valid: false
                                }
                            },
                            mux: {
                                __self__: {
                                    errL: true,
                                    invalid: true,
                                    valid: false
                                }
                            }
                        }
                    };
                    expect(vs.status).toEqual(status);

                    vs = createBig();
                    vs.loadErrors('errL', errors);
                    model = createBigModel();
                    model.$errL = true;
                    model.foo_qux_$errL = true;
                    model.zep_$errL = true;
                    model.zep_$invalid = true;
                    model.zep_$valid = false;
                    model.zep_dax_$errL = true;
                    model.zep_dax_$invalid = true;
                    model.zep_dax_$valid = false;
                    model.zep_mux_$errL = true;
                    model.zep_mux_$invalid = true;
                    model.zep_mux_$valid = false;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createBigStatus();
                    status.__self__.errL = true;
                    status.foo.qux.__self__.errL = true;
                    status.zep = {
                        __self__: {
                            errL: true,
                            invalid: true,
                            valid: false
                        },
                        dax: {
                            __self__: {
                                errL: true,
                                invalid: true,
                                valid: false
                            }
                        },
                        mux: {
                            __self__: {
                                errL: true,
                                invalid: true,
                                valid: false
                            }
                        }
                    };
                    expect(vs.status).toEqual(status);

                    vs = createSmall();
                    vs.loadErrors('errL', errors);
                    model = createSmallModel();
                    model.$errL = true;
                    model.foo_qux_$errL = true;
                    model.zep_$errL = true;
                    model.zep_$invalid = true;
                    model.zep_$valid = false;
                    model.zep_dax_$errL = true;
                    model.zep_dax_$invalid = true;
                    model.zep_dax_$valid = false;
                    model.zep_mux_$errL = true;
                    model.zep_mux_$invalid = true;
                    model.zep_mux_$valid = false;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createSmallStatus();
                    status.__self__.errL = true;
                    status.foo.qux.__self__.errL = true;
                    status.zep = {
                        __self__: {
                            errL: true,
                            invalid: true,
                            valid: false
                        },
                        dax: {
                            __self__: {
                                errL: true,
                                invalid: true,
                                valid: false
                            }
                        },
                        mux: {
                            __self__: {
                                errL: true,
                                invalid: true,
                                valid: false
                            }
                        }
                    };
                    expect(vs.status).toEqual(status);

                    vs = createSingle();
                    vs.loadErrors('errL', errors);
                    model = createSingleModel();
                    model.$errL = true;
                    model.foo_qux_$errL = true;
                    model.foo_qux_$invalid = true;
                    model.foo_qux_$valid = false;
                    model.zep_$errL = true;
                    model.zep_$invalid = true;
                    model.zep_$valid = false;
                    model.zep_dax_$errL = true;
                    model.zep_dax_$invalid = true;
                    model.zep_dax_$valid = false;
                    model.zep_mux_$errL = true;
                    model.zep_mux_$invalid = true;
                    model.zep_mux_$valid = false;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createSingleStatus();
                    status.__self__.errL = true;
                    status.foo.qux = {
                        __self__: {
                            errL: true,
                            invalid: true,
                            valid: false
                        }
                    };
                    status.zep = {
                        __self__: {
                            errL: true,
                            invalid: true,
                            valid: false
                        },
                        dax: {
                            __self__: {
                                errL: true,
                                invalid: true,
                                valid: false
                            }
                        },
                        mux: {
                            __self__: {
                                errL: true,
                                invalid: true,
                                valid: false
                            }
                        }
                    };
                    expect(vs.status).toEqual(status);
                });

                it("должна загружать ошибки по указанному пути", function() {
                    var model, status;

                    var errors = {
                        __self__: ["common errors"],
                        zep: {
                            __self__: ["zep field errors"]
                        }
                    };

                    vs.loadErrors("errL", errors, "foo.baz");
                    model = {
                        $invalid: true,
                        $valid: false,
                        foo_$invalid: true,
                        foo_$valid: false,
                        foo_baz_$errL: true,
                        foo_baz_$invalid: true,
                        foo_baz_$valid: false,
                        foo_baz_zep_$errL: true,
                        foo_baz_zep_$invalid: true,
                        foo_baz_zep_$valid: false
                    };
                    expect(vs.model.toJSON()).toEqual(model);
                    status = {
                        __self__: {
                            invalid: true,
                            valid: false
                        },
                        foo: {
                            __self__: {
                                invalid: true,
                                valid: false
                            },
                            baz: {
                                __self__: {
                                    errL: true,
                                    invalid: true,
                                    valid: false
                                },
                                zep: {
                                    __self__: {
                                        errL: true,
                                        invalid: true,
                                        valid: false
                                    }
                                }
                            }
                        }
                    };
                    expect(vs.status).toEqual(status);

                });

            });

            describe("removeErrors", function() {

                it("должна убрать указанную ошибку из всех полей", function() {
                    var model, status;

                    vs.removeErrors("errA");
                    expect(vs.model.toJSON()).toEqual(createEmptyModel());
                    expect(vs.status).toEqual(createEmptyStatus());

                    vs = createBig();
                    vs.removeErrors("errA");
                    model = createBigModel();
                    delete model.$errA;
                    delete model.foo_$errA;
                    delete model.foo_baz_$errA;
                    delete model.foo_qux_$errA;
                    delete model.bar_$errA;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createBigStatus();
                    delete status.__self__.errA;
                    delete status.foo.__self__.errA;
                    delete status.foo.baz.__self__.errA;
                    delete status.foo.qux.__self__.errA;
                    delete status.bar.__self__.errA;
                    expect(vs.status).toEqual(status);

                    vs = createSmall();
                    vs.removeErrors("errA");
                    model = createSmallModel();
                    delete model.foo_$errA;
                    delete model.foo_qux_$errA;
                    model.foo_qux_$invalid = false;
                    model.foo_qux_$valid = true;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createSmallStatus();
                    delete status.foo.__self__.errA;
                    delete status.foo.qux.__self__.errA;
                    status.foo.qux.__self__.invalid = false;
                    status.foo.qux.__self__.valid = true;
                    expect(vs.status).toEqual(status);

                    vs = createSingle();
                    vs.removeErrors("errA");
                    model = createSingleModel();
                    model.$invalid = false;
                    model.$valid = true;
                    model.foo_$invalid = false;
                    model.foo_$valid = true;
                    delete model.foo_bar_$errA;
                    model.foo_bar_$invalid = false;
                    model.foo_bar_$valid = true;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createSingleStatus();
                    status.__self__.invalid = false;
                    status.__self__.valid = true;
                    status.foo.__self__.invalid = false;
                    status.foo.__self__.valid = true;
                    delete status.foo.bar.__self__.errA;
                    status.foo.bar.__self__.invalid = false;
                    status.foo.bar.__self__.valid = true;
                    expect(vs.status).toEqual(status);
                });

                it("должна убрать все указанные ошибки из всех полей", function() {
                    var model, status;

                    vs.removeErrors(["errA", "errC"]);
                    expect(vs.model.toJSON()).toEqual(createEmptyModel());
                    expect(vs.status).toEqual(createEmptyStatus());

                    vs = createBig();
                    vs.removeErrors(["errA", "errC"]);
                    model = createBigModel();
                    delete model.$errA;
                    delete model.$errC;
                    delete model.foo_$errA;
                    delete model.foo_$errC;
                    delete model.foo_baz_$errA;
                    delete model.foo_baz_$errC;
                    delete model.foo_qux_$errA;
                    delete model.foo_qux_$errC;
                    delete model.bar_$errA;
                    delete model.bar_$errC;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createBigStatus();
                    delete status.__self__.errA;
                    delete status.__self__.errC;
                    delete status.foo.__self__.errA;
                    delete status.foo.__self__.errC;
                    delete status.foo.baz.__self__.errA;
                    delete status.foo.baz.__self__.errC;
                    delete status.foo.qux.__self__.errA;
                    delete status.foo.qux.__self__.errC;
                    delete status.bar.__self__.errA;
                    delete status.bar.__self__.errC;
                    expect(vs.status).toEqual(status);

                    vs = createSmall();
                    vs.removeErrors(["errA", "errC"]);
                    model = createSmallModel();
                    delete model.foo_$errA;
                    delete model.foo_qux_$errA;
                    model.foo_qux_$invalid = false;
                    model.foo_qux_$valid = true;
                    delete model.bar_$errC;
                    model.bar_$invalid = false;
                    model.bar_$valid = true;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createSmallStatus();
                    delete status.foo.__self__.errA;
                    delete status.foo.qux.__self__.errA;
                    status.foo.qux.__self__.invalid = false;
                    status.foo.qux.__self__.valid = true;
                    delete status.bar.__self__.errC;
                    status.bar.__self__.invalid = false;
                    status.bar.__self__.valid = true;
                    expect(vs.status).toEqual(status);

                    vs = createSingle();
                    vs.removeErrors(["errA", "errC"]);
                    model = createSingleModel();
                    model.$invalid = false;
                    model.$valid = true;
                    model.foo_$invalid = false;
                    model.foo_$valid = true;
                    delete model.foo_bar_$errA;
                    model.foo_bar_$invalid = false;
                    model.foo_bar_$valid = true;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createSingleStatus();
                    status.__self__.invalid = false;
                    status.__self__.valid = true;
                    status.foo.__self__.invalid = false;
                    status.foo.__self__.valid = true;
                    delete status.foo.bar.__self__.errA;
                    status.foo.bar.__self__.invalid = false;
                    status.foo.bar.__self__.valid = true;
                    expect(vs.status).toEqual(status);
                });

                it("должна убрать указанную ошибку из всех полей по указанному пути", function() {
                    var model, status;

                    vs.removeErrors("errB", "foo.baz");
                    model = createEmptyModel();
                    model.foo_$invalid = false;
                    model.foo_$valid = true;
                    model.foo_baz_$invalid = false;
                    model.foo_baz_$valid = true;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createEmptyStatus();
                    status.foo = {
                        __self__: {
                            invalid: false,
                            valid: true
                        },
                        baz: {
                            __self__: {
                                invalid: false,
                                valid: true
                            }
                        }
                    };
                    expect(vs.status).toEqual(status);

                    vs = createBig();
                    vs.removeErrors("errB", "foo.baz");
                    model = createBigModel();
                    delete model.foo_baz_$errB;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createBigStatus();
                    delete status.foo.baz.__self__.errB;
                    expect(vs.status).toEqual(status);

                    vs = createSmall();
                    vs.removeErrors("errB", "foo.baz");
                    model = createSmallModel();
                    delete model.foo_baz_$errB;
                    model.foo_baz_$invalid = false;
                    model.foo_baz_$valid = true;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createSmallStatus();
                    delete status.foo.baz.__self__.errB;
                    status.foo.baz.__self__.invalid = false;
                    status.foo.baz.__self__.valid = true;
                    expect(vs.status).toEqual(status);

                    vs = createSingle();
                    vs.removeErrors("errA", "foo.bar");
                    model = createSingleModel();
                    model.$invalid = false;
                    model.$valid = true;
                    model.foo_$invalid = false;
                    model.foo_$valid = true;
                    delete model.foo_bar_$errA;
                    model.foo_bar_$invalid = false;
                    model.foo_bar_$valid = true;
                    expect(vs.model.toJSON()).toEqual(model);
                    status = createSingleStatus();
                    status.__self__.invalid = false;
                    status.__self__.valid = true;
                    status.foo.__self__.invalid = false;
                    status.foo.__self__.valid = true;
                    delete status.foo.bar.__self__.errA;
                    status.foo.bar.__self__.invalid = false;
                    status.foo.bar.__self__.valid = true;
                    expect(vs.status).toEqual(status);
                });

            });

            describe("set", function() {

                it("должна устанавливать статус валидации указанного поля и обновлять статус валидации его родителей", function() {
                    vs = createBig();
                    expect(vs.model.toJSON()).toEqual(createBigModel());
                    expect(vs.status).toEqual(createBigStatus());

                    vs = createSmall();
                    expect(vs.model.toJSON()).toEqual(createSmallModel());
                    expect(vs.status).toEqual(createSmallStatus());

                    vs = createSingle();
                    expect(vs.model.toJSON()).toEqual(createSingleModel());
                    expect(vs.status).toEqual(createSingleStatus());
                });

            });

        });
    }

})(gumup);
