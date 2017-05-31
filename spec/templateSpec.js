var $ = require("jquery"),
    sinon = require("sinon");
var template = require("warby/template");

describe("template", function() {

    describe("getBaseUrl", function() {

        var attrStub, baseHref;

        beforeEach(function() {
            attrStub = sinon.stub($.prototype, "attr", function() {
                return baseHref;
            });
        });

        afterEach(function() {
            attrStub.restore();
        });

        it("должна возвращать адрес корня сайта, оканчивающийся на `/`", function() {
            baseHref = undefined;
            expect(template.getBaseUrl()).toBe("");

            baseHref = "";
            expect(template.getBaseUrl()).toBe("");

            baseHref = "/";
            expect(template.getBaseUrl()).toBe("/");

            baseHref = "foo";
            expect(template.getBaseUrl()).toBe("foo/");

            baseHref = "foo/";
            expect(template.getBaseUrl()).toBe("foo/");
        });

    });

    describe("url", function() {

        var attrStub, baseHref;

        beforeEach(function() {
            attrStub = sinon.stub($.prototype, "attr", function() {
                return baseHref;
            });
        });

        afterEach(function() {
            attrStub.restore();
        });

        function urlLite(adr, base) {
            baseHref = base;
            return template.url(adr);
        }

        function urlFull(adr, base) {
            baseHref = "baz";
            return template.url({
                adr: adr,
                base: base
            });
        }

        function urlParams(adr, params) {
            return template.url({
                adr: adr,
                params: params
            });
        }

        it("должна возвращать пустой URL для пустого адреса", function() {
            expect(urlLite("", undefined)).toBe("");
            expect(urlFull("", undefined)).toBe("");

            expect(urlLite("", null)).toBe("");
            expect(urlFull("", null)).toBe("");

            expect(urlLite("", "")).toBe("");
            expect(urlFull("", "")).toBe("");

            expect(urlLite("", "/")).toBe("");
            expect(urlFull("", "/")).toBe("");

            expect(urlLite("", "foo")).toBe("");
            expect(urlFull("", "foo")).toBe("");

            expect(urlLite("", "foo/")).toBe("");
            expect(urlFull("", "foo/")).toBe("");

            expect(urlLite("", "/foo")).toBe("");
            expect(urlFull("", "/foo")).toBe("");

            expect(urlLite("", "/foo/")).toBe("");
            expect(urlFull("", "/foo/")).toBe("");
        });

        it("должна возвращать URL равный адресу, если адрес не начинается на `/`", function() {
            expect(urlLite("bar", undefined)).toBe("bar");
            expect(urlFull("bar", undefined)).toBe("bar");

            expect(urlLite("bar", null)).toBe("bar");
            expect(urlFull("bar", null)).toBe("bar");

            expect(urlLite("bar", "")).toBe("bar");
            expect(urlFull("bar", "")).toBe("bar");

            expect(urlLite("bar", "/")).toBe("bar");
            expect(urlFull("bar", "/")).toBe("bar");

            expect(urlLite("bar", "foo")).toBe("bar");
            expect(urlFull("bar", "foo")).toBe("bar");

            expect(urlLite("bar", "foo/")).toBe("bar");
            expect(urlFull("bar", "foo/")).toBe("bar");

            expect(urlLite("bar", "/foo")).toBe("bar");
            expect(urlFull("bar", "/foo")).toBe("bar");

            expect(urlLite("bar", "/foo/")).toBe("bar");
            expect(urlFull("bar", "/foo/")).toBe("bar");
        });

        it("должна возвращать URL равный `base` + `adr`, если адрес начинается на `/`", function() {
            expect(urlLite("/bar", undefined)).toBe("/bar");
            expect(urlFull("/bar", undefined)).toBe("baz/bar");

            expect(urlLite("/bar", null)).toBe("/bar");
            expect(urlFull("/bar", null)).toBe("baz/bar");

            expect(urlLite("/bar", "")).toBe("/bar");
            expect(urlFull("/bar", "")).toBe("/bar");

            expect(urlLite("/bar", "/")).toBe("/bar");
            expect(urlFull("/bar", "/")).toBe("/bar");

            expect(urlLite("/bar", "foo")).toBe("foo/bar");
            expect(urlFull("/bar", "foo")).toBe("foo/bar");

            expect(urlLite("/bar", "foo/")).toBe("foo/bar");
            expect(urlFull("/bar", "foo/")).toBe("foo/bar");

            expect(urlLite("/bar", "/foo")).toBe("/foo/bar");
            expect(urlFull("/bar", "/foo")).toBe("/foo/bar");

            expect(urlLite("/bar", "/foo/")).toBe("/foo/bar");
            expect(urlFull("/bar", "/foo/")).toBe("/foo/bar");
        });

        it("должна подставлять параметры в URL", function() {
            var params = {
                a: 1,
                b: "abc"
            };

            expect(urlParams("", {})).toBe("");

            expect(urlParams("", params)).toBe("?a=1&b=abc");

            expect(urlParams("foo", {})).toBe("foo");

            expect(urlParams("foo", params)).toBe("foo?a=1&b=abc");

            expect(urlParams("foo?", params)).toBe("foo?&a=1&b=abc");
        });

    });

});
