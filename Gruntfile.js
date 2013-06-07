module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js', 
                // 'src/**/*.js',
                'lib/**/*.js'
            ],
            options: require('./.jshintrc.js')
        },

        concat: {
            options: {
                separator: '\n\n'
            },
            dist: {

                // "dom/core.js",
                // "dom/feature.js",
                // "dom/event.js",
                // "dom/css.js",
                // "dom/traverse.js",
                // "dom/manipulate.js",
                // "dom/create.js",
                // "dom/domready.js",
                src: 'core feature event css traverse manipulate create domready'.split(' ').map(function(name) {
                    return 'src/' + name + '.js';
                }),

                dest: 'lib/index.js'
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.registerTask("dev", ["jshint"]);
    grunt.registerTask("default", ["concat"]);

};