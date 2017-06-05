var sinon = require("sinon");

var Form = require("Src/Form");

describe("Form", function() {

    var form, loadErrStub, setStub;

    beforeEach(function() {
        form = new Form();
        loadErrStub = sinon.stub(form.validityStatus, "loadErrors");
        setStub = sinon.stub(form.validityStatus, "set");
    });

    afterEach(function() {
        loadErrStub.restore();
        setStub.restore();
    });

    describe("assertEmail", function() {

        it("должна проверять чтобы значение было корректным email-адресом", function() {
            function checkEmail(email, status) {
                setStub.reset();
                form.assertEmail("errA", email);
                expect(setStub.callCount).toBe(1);
                expect(setStub.firstCall.args[0]).toBe("errA");
                expect(setStub.firstCall.args[1]).toBe(status);
            }

            checkEmail("a@b.cd", false);
            checkEmail("niceandsimple@example.com", false);
            checkEmail("very.common@example.com", false);
            checkEmail("a.little.lengthy.but.fine@dept.example.com", false);
            checkEmail("disposable.style.email.with+symbol@example.com", false);
            checkEmail("other.email-with-dash@example.com", false);
            checkEmail("\"much.more unusual\"@example.com", false);
            checkEmail("\"very.unusual.@.unusual.com\"@example.com", false);
            checkEmail("\"very.(),:;<>[]\\\".VERY.\\\"very@\\\\ \\\"very\\\".unusual\"@strange.example.com", false);
            checkEmail("admin@mailserver1", true); // TODO: local domain name with no TLD
            checkEmail("!#$%&'*+-/=?^_`{}|~@example.org", false);
            checkEmail("\"()<>[]:,;@\\\\\\\"!#$%&'*+-/=?^_`{}| ~.a\"@example.org", false);
            checkEmail("\" \"@example.org", false); // space between the quotes
            checkEmail("üñîçøðé@example.com", false); // Unicode characters in local part
            checkEmail("üñîçøðé@üñîçøðé.com", true); // TODO: Unicode characters in domain part

            checkEmail("Abc.example.com", true); // an @ character must separate the local and domain parts
            checkEmail("A@b@c@example.com", true); // only one @ is allowed outside quotation marks
            checkEmail("a\"b(c)d,e:f;g<h>i[j\\k]l@example.com", true); // none of the special characters in this local part is allowed outside quotation marks
            checkEmail("just\"not\"right@example.com", true); // quoted strings must be dot separated, or the only element making up the local-part
            checkEmail("this is\"not\\allowed@example.com", true); // spaces, quotes, and backslashes may only exist when within quoted strings and preceded by a backslash
            checkEmail("this\\ still\\\"not\\\\allowed@example.com", true); // even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes
        });

    });

    describe("create", function() {

        it("дефолтные поля, указанные при создании формы, должны автоматически валидироваться", function() {
            var valSpy = sinon.spy();
            var TestForm = Form.extend({
                defaults: {
                    foo: null,
                    bar: null
                },
                validate: valSpy
            });
            form = new TestForm();

            form.set("foo", 100);
            expect(valSpy.callCount).toBe(1);
            expect(valSpy.firstCall.args[0]).toEqual({
                foo: 100
            });
            valSpy.reset();

            form.set("bar", 200);
            expect(valSpy.callCount).toBe(1);
            expect(valSpy.firstCall.args[0]).toEqual({
                bar: 200
            });
            valSpy.reset();

            form.set("baz", 300);
            expect(valSpy.callCount).toBe(0);
            valSpy.reset();

            form.set("foo", 400, {aaa: "bbb"});
            expect(valSpy.callCount).toBe(1);
            expect(valSpy.firstCall.args[0]).toEqual({
                foo: 400
            });
            expect(valSpy.firstCall.args[1].aaa).toBe("bbb");
        });

    });

    describe("handlers.error", function() {

        it("дожна обновить статус валидации формы ошибкой сервиса", function() {
            form.handlers.error();
            expect(setStub.callCount).toBe(1);
            expect(setStub.firstCall.args[0]).toBe("serviceError");
            expect(setStub.firstCall.args[1]).toBe(true);
        });

        it("должна обновить статус валидации формы ошибками валидации сервиса", function() {
            var resp = {
                errors: {}
            };
            form.handlers.error(resp);
            expect(loadErrStub.callCount).toBe(1);
            expect(loadErrStub.firstCall.args[0]).toBe("serviceValidity");
            expect(loadErrStub.firstCall.args[1]).toBe(resp.errors);
        });

    });

    describe("makeValidation", function() {

        it("должна проверять проверять условие и обновлять статус проверки валидности поля", function() {
            form.makeValidation("errA", true);
            form.makeValidation("errA", false);
            expect(setStub.callCount).toBe(2);
            expect(setStub.firstCall.args[0]).toBe("errA");
            expect(setStub.firstCall.args[1]).toBe(false);
            expect(setStub.secondCall.args[0]).toBe("errA");
            expect(setStub.secondCall.args[1]).toBe(true);
        });

    });

    describe("validate", function() {

        it("должена валидировать форму и возвращать результат валидации формы", function() {
            form = new Form();
            expect(form.validate()).toBeUndefined();
            form.makeValidation("errA");
            expect(form.validate()).toBe("Form is invalid");
        });

        it("должна удалять ошибки полученные от сервиса", function() {
            form = new Form();
            form.errors = {
                fixtures: ["set of errors"]
            };
            form.makeValidation("serviceError");
            form.makeValidation("serviceValidity");
            form.makeValidation("foo.serviceValidity");
            form.makeValidation("foo.bar.serviceValidity");
            form.makeValidation("baz.serviceError");
            expect(form.validate()).toBeUndefined();
            expect(form.errors).toEqual({});
        });

    });

});
