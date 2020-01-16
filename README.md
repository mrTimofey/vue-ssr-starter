**The aim of this branch is just to test this repository with many use cases.
Use master branch instead!**

# Webpack, Vue, SSR project template

Includes:

* Webpack 4
* [polka](https://github.com/lukeed/polka) web-server
* Vue 2 with SSR, Vuex and vue-loader
* Stylus with [kouto-swiss](http://kouto-swiss.io/)
* Axios
* Pug
* SVG sprites builder
* ESlint with pre-push hook

## Getting started

```bash
npm i

# development server on localhost:8080
npm run dev

# production build
npm run build

# production server on localhost:8080
npm start
```

## Configuration

`.env.dev` contains environment variables used for local development. You can change application port,
API base URL for server and client and enable/disable proxy (http-proxy-middleware).

For production builds you should provide same environment variables yourself.
Alternatively you can use `.env` after these steps:
1. Move `dotenv` from `devDependencies` to `dependencies`.
2. Create `.env` file with production config.
3. Run `npm start` or `NODE_ENV=production node -r dotenv/config index`.

## API proxy

See `setup-proxy.js` for description.

## Application structure

* `index.js` - application server
* `setup-proxy.js` - `http-proxy-middleware` setup
* `build/` - build related code
	* `setup-dev-server` - development server setup
	* `svg-sprite` - svg sprite generation script, gathers icons from `src/assets/svg-icons` and compiles them into `src/assets/sprite.svg`
	* `webpack/` - webpack config, `base` - common, `server` for server with SSR, `client` for browser
* `dist/` - production build files
* `src/`
	* `assets/` - application static assets (images, fonts, icons etc.)
		* `sprite.svg` - generated sprites file, `require('src/assets/sprite.svg')` will return file contents string
		* `fonts/` - guess what
		* `images/` - static images (backgrounds, patterns etc.)
		* `svg-icons/` - contains SVG icons for the sprite
	* `entry/` - main entry points
		* `app` - shared between server and client, exports a factory function returning root component instance, mixes it with `app.vue`
		* `client` - client entry
		* `server` - server entry
	* `components/` - vue components
		* `shared/` - components registered implicitly via `Vue.component()`
	* `pages/` - components here are implicitly attached to routes same with componets\' file names
		(excluding leading `_` in file or folder names and `404.vue` which will be used as a catch-all route)
	* `filters/` - vue filters registered implicitly via `Vue.filter()`
	* `directives/` - vue directives registered implicitly via `Vue.directive()`
	* `store/` - Vuex storage, `index` returns a factory function returning configured Vuex store instance
	* `utils/` - common utility functions
		* `index` - common utility functions
		* `ssr` - SSR related functions and mixins
	* `app.vue` - application root component, implicitly mixed with `entry\app`
	* `http` - exports http client instance (Axios)
	* `layout.pug` - application HTML layout
	* `router` - exports a factory function returning vue-router instance
	* `shared.styl` - globally included stylus file (for variables, mixins, etc.)

## SSR related component features

Every component within `src/pages` directory can use some special features providing full SSR support:

* `component.routePath`, String - additional route suffix. Usually used to provide dynamic route segments.
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
	See `src/utils/ssr` mixin.
* Boolean `prefetching` data field indicates when prefetch is running.

	**IMPORTANT: there is no component context within `prefetch` function because component instance is not created yet! That means you should not try to use `this`.**

`prefetch` also works on the root component (`src/app.vue`) with some restrictions:

* no way to pass component data (only store can be affected).
