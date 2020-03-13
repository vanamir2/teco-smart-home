const SimpleDataSource = require('./../src/SimpleDataSource').SimpleDataSource;

// load Unit.js module
const test = require('unit.js');

describe('SimpleDataSource test', function () {
    it('Constructor test 1 - everything filled', function () {
        const sds = new SimpleDataSource("Light_O_REA_0_100_S3VjaHnFiA_U3bEm3Rsbw");
        test.assert(sds.categoryId === "Light");
        test.assert(sds.inOut === "O");
        test.assert(sds.dataType === "REA");
        test.assert(sds.minValue === "0");
        test.assert(sds.maxValue === "100");
        test.assert(sds.roomBase64 === "S3VjaHnFiA");
        test.assert(sds.nameBase64 === "U3bEm3Rsbw");
        test.assert(sds.room === "Kuchyň");
        test.assert(sds.name === "Světlo");
    });

    it('Constructor test 2 - without min max value', function () {
        const sds = new SimpleDataSource("Light_O_REA___S3VjaHnFiA_U3bEm3Rsbw");
        test.assert(sds.categoryId === "Light");
        test.assert(sds.inOut === "O");
        test.assert(sds.dataType === "REA");
        test.assert(sds.minValue === "");
        test.assert(sds.maxValue === "");
        test.assert(sds.roomBase64 === "S3VjaHnFiA");
        test.assert(sds.nameBase64 === "U3bEm3Rsbw");
        test.assert(sds.room === "Kuchyň");
        test.assert(sds.name === "Světlo");
    });

    it('Constructor test 3 - errors', function () {
        test.exception( () => new SimpleDataSource("Light_O"));
        (() => new SimpleDataSource("Light")).should.throw(Error);
        (() => new SimpleDataSource("")).should.throw(Error);
        (() => new SimpleDataSource(undefined)).should.throw(Error);
        (() => new SimpleDataSource("_O_REA___S3VjaHnFiA_U3bEm3Rsbw")).should.throw(Error);
        (() => new SimpleDataSource("O_REA___S3VjaHnFiA_U3bEm3Rsbw")).should.throw(Error);
        (() => new SimpleDataSource("Light__REA___S3VjaHnFiA_U3bEm3Rsbw")).should.throw(Error);
        (() => new SimpleDataSource("Light_O____S3VjaHnFiA_U3bEm3Rsbw")).should.throw(Error);
        (() => new SimpleDataSource("Light_O_REA____U3bEm3Rsbw")).should.throw(Error);
        (() => new SimpleDataSource("Light_O_REA___S3VjaHnFiA_")).should.throw(Error);
        (() => new SimpleDataSource("light_REA_0_100_T2LDvXZhY8OtIHBva29q_xb1sdXTDoSBMRUQ")).should.throw(Error);
    });

});