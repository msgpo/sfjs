module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      js: {
        files: ['lib/**/*.js'],
        tasks: ['concat:lib', 'babel', 'browserify', 'concat:vendor', 'concat:dist', 'uglify'],
        options: {
          spawn: false,
        },
      },
    },

    concat: {
      options: {
        separator: ';',
      },

      lib: {
        src: [
          'lib/**/*.js'
        ],
        dest: 'dist/lib.js',
      },

      vendor: {
        src: [
          'vendor/lodash/lodash.custom.min.js',
          'vendor/cryptojs/*.js'
        ],
        dest: 'dist/vendor.js',
      },

      dist: {
        src: ['dist/vendor.js', 'dist/transpiled.js'],
        dest: 'dist/sfjs.js',
      },
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2016']
      },

      dist: {
        files: {
          'dist/transpiled.js': 'dist/lib.js'
        }
      },

    },

    browserify: {
      dist: {
        files: {
          'dist/transpiled.js': 'dist/transpiled.js'
        }
      },
    },

     uglify: {
       compiled: {
         src: ['dist/sfjs.js'],
         dest: 'dist/sfjs.min.js'
       }
    }
  });

  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat:lib', 'babel', 'browserify', 'concat:vendor', 'concat:dist', 'uglify']);
};
