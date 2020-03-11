function exportExampleClass(){
    return "foo";
}

var bar = "bar";

module.exports.foo = exportExampleClass;
module.exports.bar = bar;