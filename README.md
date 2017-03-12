# Webpack SSR server and dev tool

Includes:

* Webpack 2
* Buble
* Vue 2 with SSR, Vuex and Vue-loader
* Stylus with kouto-swiss
* Axios
* Pug
* SVG sprites builder

## Application structure

* `index.js` - application server
* `assets/` - application static assets (images, fonts, icons etc.)
	* `sprite.svg` - generated sprites file, `require('assets/sprite.svg')` will return file contents string
	* `icons/` - contains SVG icons for the sprite
* `build/` - code related to project building
	* `setup-dev-server` - development server setup with hot reloading
	* `svg-sprites` - svg sprites generation script, gathers icons from `assets/icons` and compiles them into `assets/sprite.svg`
	* `webpack/` - webpack config, `base` - common, `server` for server with SSR, `client` for browser
* `dist/` - production build files
* `src/`
	* `components/` - vue components
		* `routes/` - components here are implicitly attached to routes same with componets\` file names (excluding leading `_` in file names and `404.vue` which will be used as a catch-all route)
		* `shared/` - comonents registered implicitly via `Vue.component()`
	* `filters/` - vue filters registered implicitly vie `Vue.filter()`
	* `directives/` - vue directives registered implicitly vie `Vue.directive()`
	* `entry/` - main entry points
		* `app` - shared between server and client, exports root component instance, mixes it with `app.vue`
		* `client` - client entry
		* `server` - server entry
	* `store/` - Vuex storage, `index` must return a configured Vuex store instance
	* `app.vue` - root component, implicitly mixed with `entry\app`
	* `http` - exports http client instance (Axios) which is implicitly injected as `Vue.http` and `Vue.prototype.$http`
	* `layout.pug` - application HTML layout
	* `router` - exports vue-router instance