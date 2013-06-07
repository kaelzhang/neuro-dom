module.exports = {
    boss: true,
    curly: true,
    eqeqeq: true,
    eqnull: true,
    expr: true,

    globalstrict: false,

    // allow immediant function innvocation
    immed: false,
    noarg: true,

    // Never force string to quoting with single or double quotemarks
    quotmark: false,
    smarttabs: true,
    undef: false,
    unused: true,

    sub: true,

    browser: true,
    es5: true,

    validthis: true,

    // Defining each variables with a `var` statement is more convenient for coding
    onevar: false,

    asi: true,
    lastsemic: false,

    laxbreak: true,

    // Report JSHint errors but not fail the task
    // force: true,

    // Declare commonjs env
    globals: {
        require: true,
        module: true,
        exports: true,
        define: true,
        NR: true
    }
}

