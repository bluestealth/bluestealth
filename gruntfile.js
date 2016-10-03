module.exports = function(grunt) {

	var params = grunt.file.readYAML("./site.config");

	grunt.file.write('./dist/' + params.GOOGLE_SITE_VERIFICATION, "google-site-verification: " + params.GOOGLE_SITE_VERIFICATION);
	grunt.initConfig({
		pug: {
			compile: {
				files: {
					'dist/index.html': ['src/templates/index.pug']
				},
				options: {
					pretty: true
				}
			}
		},
		sass: {
			dist: {
				files: {
					'dist/css/grayscale.css': 'src/sass/grayscale.scss'
				}
			}
		},
		responsive_images: {
			myTask: {
				options: {
					sizes: [
						{name: "small",		width :480},
						{name: "medium",	width: 640},
						{name: "large",		width: 1024},
						{name: "xlarge",	width: 2048}
					]
				},
				files: {
					'dist/img/intro-bg.jpg': 'static/img/intro-bg.org.jpg',	
					'dist/img/downloads-bg.jpg': 'static/img/downloads-bg.org.jpg'	
				}
			}

		},
		sitemap: {
			dist: {
				pattern: ["dist/*.html", '!dist/' + params.GOOGLE_SITE_VERIFICATION],
				changefreq: 'monthly',
				siteRoot: './dist/',
				fileName: 'sitemap',
				homepage: params.SITE_BASE_URL + '/',
				priority: '0.8',
				extension : { required: false, trailingSlash: false}
			}
		},
		realFavicon: {
			favicons: {
				src: './static/img/favicon.src.jpg',
				dest: './dist/',
				options: {
					iconsPath: '/',
					html: [ 'dist/*.html', '!dist/' + params.GOOGLE_SITE_VERIFICATION ],
					design: {
						ios: {
							pictureAspect: 'noChange',
							assets: {
								ios6AndPriorIcons: false,
								ios7AndLaterIcons: false,
								precomposedIcons: false,
								declareOnlyDefaultIcon: true
							}
						},
						desktopBrowser: {},
						windows: {
							pictureAspect: 'noChange',
							backgroundColor: '#2b5797',
							onConflict: 'override',
							assets: {
								windows80Ie10Tile: false,
								windows10Ie11EdgeTiles: {
									small: true,
									medium: true,
									big: true,
									rectangle: true
								}
							}
						},
						androidChrome: {
							pictureAspect: 'noChange',
							themeColor: '#ffffff',
							manifest: {
								name: 'Bluestealth.pw',
								display: 'standalone',
								orientation: 'notSet',
								onConflict: 'override',
								declared: true
							},
							assets: {
								legacyIcon: false,
								lowResolutionIcons: false
							}
						},
						safariPinnedTab: {
							pictureAspect: 'blackAndWhite',
							threshold: 21.25,
							themeColor: '#5bbad5'
						}
					},
					settings: {
						compression: 1,
						scalingAlgorithm: 'Mitchell',
						errorOnImageTooSmall: false
					}
				}
			}
		},
		copy: {
			main: {
				files: [
					{src:"static/js/grayscale.js", dest: "dist/js/grayscale.js"},
					{expand: true, src: ['static/doc/*'], dest: 'dist/doc/', flatten: true, filter: 'isFile'},
					{expand: true, src: ['node_modules/bootstrap/dist/{js,css}/*'], dest: 'dist/bootstrap/', flatten: true, filter: 'isFile'},
					{expand: true, src: ['node_modules/font-awesome/css/*'], dest: 'dist/font-awesome/css', flatten: true, filter: 'isFile'},
					{expand: true, src: ['node_modules/font-awesome/fonts/*'], dest: 'dist/font-awesome/fonts', flatten: true, filter: 'isFile'},
					{expand: true, src: ['node_modules/jquery/dist/*'], dest: 'dist/jquery/', flatten: true, filter: 'isFile'},
					{expand: true, src: ['node_modules/tether/dist/js/*'], dest: 'dist/tether/', flatten: true, filter: 'isFile'}
				]
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-pug');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-responsive-images');
	grunt.loadNpmTasks('grunt-sitemap');
	grunt.loadNpmTasks('grunt-real-favicon');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.registerTask('default', ['pug','sass','responsive_images','sitemap','copy','realFavicon']);
};
