**The aim of this branch is just to test this repository with many use cases.
Use master branch instead!**

# Webpack, Vue, SSR project template

Includes:

* Webpack 2
* Buble
* Vue 2 with SSR, Vuex and vue-loader
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
	* `svg-sprite` - svg sprite generation script, gathers icons from `assets/icons` and compiles them into `assets/sprite.svg`
	* `webpack/` - webpack config, `base` - common, `server` for server with SSR, `client` for browser
* `dist/` - production build files
* `src/`
	* `components/` - vue components
		* `routes/` - components here are implicitly attached to routes same with componets\` file names (excluding leading `_` in file or folder names and `404.vue` which will be used as a catch-all route)
		* `shared/` - comonents registered implicitly via `Vue.component()`
	* `filters/` - vue filters registered implicitly via `Vue.filter()`
	* `directives/` - vue directives registered implicitly via `Vue.directive()`
	* `entry/` - main entry points
		* `app` - shared between server and client, exports a factory function returning root component instance, mixes it with `app.vue`
		* `client` - client entry
		* `server` - server entry
	* `store/` - Vuex storage, `index` returns a factory function returning configured Vuex store instance
	* `app.vue` - aplication root component, implicitly mixed with `entry\app`
	* `http` - exports http client instance (Axios)
	* `layout.pug` - application HTML layout
	* `router` - exports a factory function returning vue-router instance
	* `vars.styl` - globally included stylus file (for variables, mixins, etc.)

## Commands

```
# development server on localhost:8080
npm run dev

# production build
npm run build

# production server on localhost:8080
npm start
```

## SSR related component features

Every component within `src/components/routes` directory can use some special features providing full SSR support:

* `component.routeParams`, String - additional route suffix. Usually used to provide dynamic route segments.
	You can use any string allowed for the vue-router path definition. All dynamic segments are automatically mapped
	to component `props`.
* `component.routeMeta`, Object - `route.meta`. Include `statusCode` here to modify an HTTP status returned with SSR.
	404 route includes 404 status code by default.
* `component.prefetch({ store, props, route })`, function
	(`store` - vuex store instance, `props` - route params, `route` - current route object).
	
	Must return a promise. Allows some async routine before actual application rendering on server side.
	To pass any data to component: resolve promise with needed data and add corresponding `component.data` fields with
	their initial values to prevent *...property or method not defined...* error.
	Automatically called on client side from `beforeMount` and `beforeRouteChange` hooks as well.
	See `src/mixins/prefetch` mixin.

	**IMPORTANT: there is no component context within `prefetch` function because component instance is not created yet!**

`prefetch` also works on the root component (`src/app.vue`) with some restrictions:

* no `props` field in the argument;
* no way to pass component data (only store can be affected).

## Development checklist

* SSR configurable cache
* basic Nginx + Phusion Passenger configuration example
